/**
 * Agent0s — 4-Stage Intelligence Pipeline
 *
 * Stage 1: Discovery   — Perplexity Sonar Pro finds fresh content across the web
 * Stage 2: Triage      — Gemini 2.5 Flash parallel-scores every candidate
 * Stage 3: Deep Res.   — GitHub API fetches full content for GitHub URLs
 * Stage 4: Enrichment  — Claude Sonnet generates everything users read
 *         + Digest     — Claude Opus writes the daily briefing headline
 */

import { callJSON, callSchema, batchAsync, MODELS } from './openrouter'
import { createServerClient } from './supabase'
import { runDiscovery, DiscoveryResult } from './scrapers/perplexity'
import { fetchGitHubContent } from './scrapers/github'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TriageResult {
  verdict: 'enrich' | 'deep_research' | 'discard'
  novelty_score: number        // 0-10: how new/fresh is this?
  actionability_score: number  // 0-10: can a dev/owner use this today?
  audience_fit_score: number   // 0-10: right for our readers?
  is_duplicate: boolean
  is_version_update: boolean
  supersedes_title: string | null
  reason: string
}

interface EnrichResult {
  title: string
  category: 'prompt' | 'skill' | 'hook' | 'plugin' | 'technique' | 'workflow' | 'niche-use-case'
  tool: 'claude-code' | 'chatgpt-codex' | 'openclaw' | 'general'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  quality_score: number
  ai_summary: string
  ai_actionable_steps: string[]
  ai_project_ideas: { title: string; description: string }[]
  ai_business_use_cases: string[]
  code_snippet: string | null
  tags: string[]
  version_label: string | null
  is_version_update: boolean
}

interface ReadyItem extends DiscoveryResult {
  triage: TriageResult
  raw_content: string
  github_stars: number | null
}

// ─── JSON Schema for enrichment (Sonnet respects this precisely) ──────────────

const ENRICH_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    category: { type: 'string', enum: ['prompt', 'skill', 'hook', 'plugin', 'technique', 'workflow', 'niche-use-case'] },
    tool: { type: 'string', enum: ['claude-code', 'chatgpt-codex', 'openclaw', 'general'] },
    difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
    quality_score: { type: 'number' },
    ai_summary: { type: 'string' },
    ai_actionable_steps: { type: 'array', items: { type: 'string' } },
    ai_project_ideas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
        },
        required: ['title', 'description'],
        additionalProperties: false,
      },
    },
    ai_business_use_cases: { type: 'array', items: { type: 'string' } },
    code_snippet: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
    version_label: { type: 'string' },
    is_version_update: { type: 'boolean' },
  },
  required: [
    'title', 'category', 'tool', 'difficulty', 'quality_score', 'ai_summary',
    'ai_actionable_steps', 'ai_project_ideas', 'ai_business_use_cases',
    'code_snippet', 'tags', 'version_label', 'is_version_update',
  ],
  additionalProperties: false,
}

// ─── Main pipeline ────────────────────────────────────────────────────────────

export async function runScrapeAndProcess() {
  const db = createServerClient()
  const runLog = {
    items_found: 0,
    items_saved: 0,
    items_rejected: 0,
    sources_scraped: ['perplexity-sonar', 'github'] as string[],
    error_message: null as string | null,
  }

  try {
    // ── Pre-load existing data for deduplication ──────────────────────────────
    const [existingUrlsRes, existingTitlesRes] = await Promise.all([
      db.from('library_items').select('source_url'),
      db.from('library_items').select('id, title').order('created_at', { ascending: false }),
    ])

    const existingUrls = new Set(
      (existingUrlsRes.data || []).map((r: { source_url: string }) => r.source_url)
    )
    const existingItems: { id: string; title: string }[] = existingTitlesRes.data || []
    const existingTitlesList = existingItems.map(i => i.title).join('\n')

    // ── STAGE 1: Discovery ────────────────────────────────────────────────────
    console.log('Stage 1: Discovery...')
    const discovered = await runDiscovery()

    // Deduplicate against DB (exact URL match — free and instant)
    const newCandidates = discovered.filter(d => !existingUrls.has(d.source_url))
    runLog.items_found = newCandidates.length
    console.log(`  Found ${discovered.length} URLs, ${newCandidates.length} new after dedup`)

    if (newCandidates.length === 0) {
      await logRun(db, runLog)
      return runLog
    }

    // ── STAGE 2: Triage ───────────────────────────────────────────────────────
    console.log('Stage 2: Triage...')
    const triageResults = await batchAsync(newCandidates, 10, async (candidate) => {
      const result = await callJSON<TriageResult>(
        MODELS.triage,
        buildTriagePrompt(candidate, existingTitlesList),
        {
          fallback: MODELS.triage_fallback,
          system: TRIAGE_SYSTEM_PROMPT,
        }
      )
      return { candidate, triage: result }
    })

    const triaged = triageResults.filter(Boolean) as { candidate: DiscoveryResult; triage: TriageResult }[]
    const passed = triaged.filter(t =>
      t.triage.verdict !== 'discard' && !t.triage.is_duplicate
    )

    console.log(`  Triage: ${passed.length}/${triaged.length} passed`)
    runLog.items_rejected += triaged.length - passed.length

    // ── STAGE 3: Deep Research (GitHub URLs) ──────────────────────────────────
    console.log('Stage 3: Deep research...')
    const readyItems: ReadyItem[] = await Promise.all(
      passed.map(async ({ candidate, triage }) => {
        let raw_content = candidate.context
        let github_stars: number | null = null

        if (candidate.source_type === 'github' || triage.verdict === 'deep_research') {
          const github = await fetchGitHubContent(candidate.source_url).catch(() => null)
          if (github) {
            raw_content = github.raw_content
            github_stars = github.github_stars
          }
        }

        return { ...candidate, triage, raw_content, github_stars }
      })
    )

    // ── STAGE 4: Enrichment ───────────────────────────────────────────────────
    console.log('Stage 4: Enrichment...')
    const enriched = await batchAsync(readyItems, 5, async (item) => {
      const result = await callSchema<EnrichResult>({
        model: MODELS.enrich,
        fallback: MODELS.enrich_fallback,
        system: ENRICH_SYSTEM_PROMPT,
        prompt: buildEnrichPrompt(item, existingItems),
        schemaName: 'enrich_result',
        schema: ENRICH_SCHEMA,
      })
      return { item, enriched: result }
    })

    // ── Save to Supabase ──────────────────────────────────────────────────────
    for (const result of enriched) {
      if (!result) { runLog.items_rejected++; continue }
      const { item, enriched: e } = result

      const qualityScore = Math.round(e.quality_score ?? 0)
      if (qualityScore < 7) {
        runLog.items_rejected++
        continue
      }

      // If this is a version update, find the superseded item's ID
      let supersedes_id: string | null = null
      if (e.is_version_update && item.triage.supersedes_title) {
        const match = existingItems.find(i =>
          i.title.toLowerCase().includes(
            item.triage.supersedes_title!.toLowerCase().slice(0, 30)
          )
        )
        supersedes_id = match?.id ?? null
      }

      const { error } = await db.from('library_items').insert({
        title: String(e.title || '').slice(0, 255),
        raw_content: item.raw_content.slice(0, 8000),
        source_url: item.source_url,
        source_type: item.source_type,
        category: e.category,
        tool: e.tool,
        difficulty: e.difficulty,
        quality_score: qualityScore,
        ai_summary: String(e.ai_summary || ''),
        ai_actionable_steps: Array.isArray(e.ai_actionable_steps) ? e.ai_actionable_steps : [],
        ai_project_ideas: Array.isArray(e.ai_project_ideas) ? e.ai_project_ideas : [],
        ai_business_use_cases: Array.isArray(e.ai_business_use_cases) ? e.ai_business_use_cases : [],
        code_snippet: e.code_snippet || null,
        tags: Array.isArray(e.tags) ? e.tags : [],
        version_label: e.version_label || null,
        is_version_update: Boolean(e.is_version_update),
        supersedes_id,
        github_stars: item.github_stars,
      })

      if (error) {
        console.error('Insert error:', error.message)
        runLog.items_rejected++
      } else {
        runLog.items_saved++
      }
    }

    console.log(`Pipeline complete: ${runLog.items_saved} saved, ${runLog.items_rejected} rejected`)

    // ── Daily Digest ──────────────────────────────────────────────────────────
    await generateDailyDigest(db, runLog.items_saved)

  } catch (e) {
    console.error('Pipeline error:', e)
    runLog.error_message = String(e)
  }

  await logRun(db, runLog)
  return runLog
}

// ─── Daily Digest — Claude Opus (one call/day) ────────────────────────────────

async function generateDailyDigest(
  db: ReturnType<typeof createServerClient>,
  newCount: number
) {
  const today = new Date().toISOString().split('T')[0]

  const { data: topItems } = await db
    .from('library_items')
    .select('id, title, category, quality_score')
    .gte('quality_score', 7)
    .order('created_at', { ascending: false })
    .limit(10)

  if (!topItems?.length) return

  const digest = await callJSON<{ headline: string; intro_paragraph: string }>(
    MODELS.digest,
    `You are the editor of an AI tools intelligence briefing read by business owners and developers.
Today's scrape found ${newCount} new items. Top items discovered:
${topItems.slice(0, 5).map((i: { title: string; category: string }) => `• ${i.title} (${i.category})`).join('\n')}

Write today's briefing intro. Be sharp, specific, and make readers excited to explore.
Respond in JSON: { "headline": "8-12 word compelling headline", "intro_paragraph": "2 punchy sentences" }`,
    { fallback: MODELS.digest_fallback }
  )

  await db.from('daily_digests').upsert({
    date: today,
    headline: digest.headline,
    intro_paragraph: digest.intro_paragraph,
    featured_item_ids: topItems.slice(0, 5).map((i: { id: string }) => i.id),
    total_new_items: newCount,
  }, { onConflict: 'date' })
}

// ─── Logging ──────────────────────────────────────────────────────────────────

async function logRun(
  db: ReturnType<typeof createServerClient>,
  log: typeof import('./pipeline').runScrapeAndProcess extends (...args: unknown[]) => Promise<infer R> ? R : never
) {
  await db.from('scrape_logs').insert({
    sources_scraped: (log as { sources_scraped: string[] }).sources_scraped,
    items_found: (log as { items_found: number }).items_found,
    items_saved: (log as { items_saved: number }).items_saved,
    items_rejected: (log as { items_rejected: number }).items_rejected,
    status: (log as { error_message: string | null }).error_message
      ? 'failed'
      : (log as { items_saved: number }).items_saved > 0 ? 'success' : 'partial',
    error_message: (log as { error_message: string | null }).error_message,
  })
}

// ─── Prompts ──────────────────────────────────────────────────────────────────

const TRIAGE_SYSTEM_PROMPT = `You are a senior content curator for an AI tools intelligence library.
Your readers are business owners and developers who want immediately actionable AI tool knowledge.
Core coverage areas: Claude Code, OpenAI Codex CLI, OpenCLAW framework, and agentic AI tooling in general.
We also cover niche/unconventional use cases — real-world applications of AI coding agents in specific industries or creative scenarios.
Be strict — most content should be discarded. Only pass items that are genuinely novel, specific, and useful.
Respond only in valid JSON.`

function buildTriagePrompt(candidate: DiscoveryResult, existingTitles: string): string {
  return `Evaluate this discovered item for our AI tools library.

URL: ${candidate.source_url}
Title: ${candidate.title}
Source type: ${candidate.source_type}
Discovery context: ${candidate.context.slice(0, 800)}

EXISTING LIBRARY TITLES (check for duplicates and version updates):
${existingTitles.slice(0, 3000)}

Score this item and respond in JSON:
{
  "verdict": "enrich | deep_research | discard",
  "novelty_score": 0-10,
  "actionability_score": 0-10,
  "audience_fit_score": 0-10,
  "is_duplicate": true/false,
  "is_version_update": true/false,
  "supersedes_title": "exact title from library it supersedes, or null",
  "reason": "one sentence explaining your verdict"
}

Rules:
- "discard" if average score < 5, is_duplicate, or not about AI tools/prompts/workflows/niche use cases
- "deep_research" if it's a GitHub repo that needs full README content to evaluate properly
- "enrich" if it clearly has good content from the context alone
- is_version_update = true only if this is explicitly a newer version of an existing library item`
}

const ENRICH_SYSTEM_PROMPT = `You are an expert technical writer for an AI tools intelligence library.
Your readers are developers who use AI coding agents (Claude Code, Codex CLI, OpenCLAW) to set up tools.
Write for clarity, specificity, and actionability. No fluff.

TOOL ASSIGNMENT:
- tool: "claude-code" — content specifically about Claude Code (hooks, skills, CLAUDE.md, MCP, plugins)
- tool: "chatgpt-codex" — content specifically about OpenAI Codex CLI
- tool: "openclaw" — content specifically about the OpenCLAW agentic AI framework
- tool: "general" — content applicable to multiple tools or general AI techniques

CATEGORY ASSIGNMENT:
- category: "niche-use-case" — real-world applications of AI tools in specific industries, unconventional/creative uses, unique problem-solving stories, edge cases that showcase what's possible. These are concrete case studies, not generic advice.
- Other categories: prompt, skill, hook, plugin, technique, workflow (as before)

CRITICAL: The "ai_actionable_steps" you write will be embedded in prompts that users paste into their AI coding agent.
These steps must be written FOR AN AI AGENT TO EXECUTE, not for a human to follow manually.
- Do NOT write steps like "Go to the website and click..." or "Open Google Studio and select..."
- DO write steps that an AI coding agent can act on: "Clone the repository", "Add this config block to settings.json", "Install the npm package and configure the API client"
- If the tool requires an API key (OpenAI, Anthropic, Google AI, OpenRouter, etc.), say "Configure the API client using the user's existing provider key from their .env file, or prompt them to add one"
- Always assume the agent will scan the user's workspace first and adapt to their existing setup
- Each step should start with an imperative verb and be completable programmatically`

function buildEnrichPrompt(
  item: ReadyItem,
  existingItems: { id: string; title: string }[]
): string {
  const maybeSupersedes = item.triage.is_version_update && item.triage.supersedes_title
    ? `\nNOTE: This appears to supersede: "${item.triage.supersedes_title}"`
    : ''

  return `Transform this raw content into a library entry for our AI tools intelligence platform.${maybeSupersedes}

Source URL: ${item.source_url}
Source type: ${item.source_type}
Stars: ${item.github_stars ?? 'N/A'}
Raw content:
---
${item.raw_content.slice(0, 4000)}
---

Generate a complete library entry. Be specific and concrete — no generic advice.
quality_score: 1-10 (be harsh. 9-10 = life-changing for our readers, 6-8 = genuinely useful, below 6 = not worth publishing)
ai_summary: 2-3 sentences, plain English for a non-technical business owner
ai_actionable_steps: exactly 3 steps that an AI CODING AGENT (Claude Code, Codex CLI) can execute programmatically. Do NOT write human-only steps like "visit website" or "click button". Write agent-executable steps: "Clone the repo", "Add this config to .env", "Install the package and wire up the API client using the user's existing provider key". If API access is needed, reference checking the user's .env for existing keys (OpenRouter, OpenAI, Anthropic, Google AI) before asking them to add one.
ai_project_ideas: exactly 2 ideas, specific and buildable
ai_business_use_cases: exactly 2 real business scenarios
code_snippet: extracted code block if present, otherwise empty string
version_label: version string if explicitly versioned (e.g. "v2", "2.0"), otherwise empty string`
}
