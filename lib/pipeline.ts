import { callModel, MODELS } from './openrouter'
import { createServerClient } from './supabase'
import { scrapeGitHub } from './scrapers/github'
import { scrapeReddit } from './scrapers/reddit'

interface RawItem {
  title: string
  source_url: string
  raw_content: string
  source_type: 'github' | 'reddit'
}

export async function runScrapeAndProcess() {
  const db = createServerClient()
  const log = { items_found: 0, items_saved: 0, items_rejected: 0, sources_scraped: [] as string[], error_message: null as string | null }

  try {
    // Scrape
    const [githubItems, redditItems] = await Promise.all([
      scrapeGitHub().catch(() => [] as RawItem[]),
      scrapeReddit().catch(() => [] as RawItem[]),
    ])

    const allRaw = [...githubItems, ...redditItems]
    log.sources_scraped = ['github', 'reddit']
    log.items_found = allRaw.length

    // Deduplicate against existing URLs
    const urls = allRaw.map(i => i.source_url)
    const { data: existing } = await db.from('library_items').select('source_url').in('source_url', urls)
    const existingUrls = new Set((existing || []).map((e: { source_url: string }) => e.source_url))
    const newItems = allRaw.filter(i => !existingUrls.has(i.source_url))

    // Process each new item
    for (const item of newItems) {
      try {
        // Stage 1: Filter
        const filterResult = await callModel(MODELS.filter, `Is this genuinely useful AI tool content (prompts, hooks, skills, workflows, techniques for Claude Code or ChatGPT/Codex)?
Title: ${item.title}
Content: ${item.raw_content.slice(0, 500)}
Respond: {"include": true/false, "reason": "..."}`) as { include: boolean; reason: string }

        if (!filterResult.include) {
          log.items_rejected++
          continue
        }

        // Stage 2: Enrich
        const enriched = await callModel(MODELS.enrich, `You are processing content for a library of AI tool tips. Extract and generate:
Title: ${item.title}
Source: ${item.source_type}
Content: ${item.raw_content.slice(0, 3000)}

Respond in JSON:
{
  "title": "concise descriptive title",
  "category": "prompt|skill|hook|plugin|technique|workflow",
  "tool": "claude-code|chatgpt-codex|general",
  "difficulty": "beginner|intermediate|advanced",
  "quality_score": 0-10,
  "ai_summary": "2-3 sentences plain English for non-technical business owners",
  "ai_actionable_steps": ["step 1", "step 2", "step 3"],
  "ai_project_ideas": [{"title": "...", "description": "..."}],
  "ai_business_use_cases": ["use case 1", "use case 2"],
  "code_snippet": "extracted code block or null",
  "tags": ["tag1", "tag2", "tag3"]
}`) as {
          title: string; category: string; tool: string; difficulty: string;
          quality_score: number; ai_summary: string; ai_actionable_steps: string[];
          ai_project_ideas: { title: string; description: string }[];
          ai_business_use_cases: string[]; code_snippet: string | null; tags: string[]
        }

        if (!enriched.quality_score || enriched.quality_score < 6) {
          log.items_rejected++
          continue
        }

        await db.from('library_items').insert({
          title: enriched.title,
          raw_content: item.raw_content,
          source_url: item.source_url,
          source_type: item.source_type,
          category: enriched.category,
          tool: enriched.tool,
          difficulty: enriched.difficulty,
          quality_score: enriched.quality_score,
          ai_summary: enriched.ai_summary,
          ai_actionable_steps: enriched.ai_actionable_steps,
          ai_project_ideas: enriched.ai_project_ideas,
          ai_business_use_cases: enriched.ai_business_use_cases,
          code_snippet: enriched.code_snippet,
          tags: enriched.tags,
        })

        log.items_saved++
      } catch (e) {
        console.error('Error processing item:', e)
        log.items_rejected++
      }
    }

    // Generate daily digest
    await generateDailyDigest(db, log.items_saved)

  } catch (e) {
    log.error_message = String(e)
  }

  // Log run
  await db.from('scrape_logs').insert({
    sources_scraped: log.sources_scraped,
    items_found: log.items_found,
    items_saved: log.items_saved,
    items_rejected: log.items_rejected,
    status: log.error_message ? 'failed' : log.items_saved > 0 ? 'success' : 'partial',
    error_message: log.error_message,
  })

  return log
}

async function generateDailyDigest(db: ReturnType<typeof createServerClient>, newItemsCount: number) {
  const today = new Date().toISOString().split('T')[0]

  // Get today's top items
  const { data: topItems } = await db.from('library_items')
    .select('id, title, ai_summary, category')
    .gte('quality_score', 7)
    .order('created_at', { ascending: false })
    .limit(10)

  if (!topItems?.length) return

  const digest = await callModel(MODELS.digest, `Generate a daily digest intro for an AI tools library website. Today we found ${newItemsCount} new AI tools, prompts, and techniques.

Top items found today:
${topItems.slice(0, 5).map((i: { title: string; category: string }) => `- ${i.title} (${i.category})`).join('\n')}

Respond in JSON:
{
  "headline": "compelling 8-12 word headline for today's discoveries",
  "intro_paragraph": "2 sentence intro that excites business owners about today's finds"
}`) as { headline: string; intro_paragraph: string }

  await db.from('daily_digests').upsert({
    date: today,
    headline: digest.headline,
    intro_paragraph: digest.intro_paragraph,
    featured_item_ids: topItems.slice(0, 5).map((i: { id: string }) => i.id),
    total_new_items: newItemsCount,
  }, { onConflict: 'date' })
}
