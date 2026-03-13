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
import { DedupRegistry, fetchAllRows } from './dedup'

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
  category: 'prompt' | 'skill' | 'hook' | 'plugin' | 'technique' | 'workflow' | 'niche-use-case' | 'model'
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
    category: { type: 'string', enum: ['prompt', 'skill', 'hook', 'plugin', 'technique', 'workflow', 'niche-use-case', 'model'] },
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
    // ── Pre-load ALL existing data for deduplication ──────────────────────────
    // Uses paginated fetching to bypass Supabase's 1000-row default limit.
    const dedup = new DedupRegistry()

    const [allUrls, allTitles, recentContent] = await Promise.all([
      // Every URL in the DB (paginated — no row limit)
      fetchAllRows<{ source_url: string }>(
        db.from('library_items'), 'source_url'
      ),
      // Every title in the DB (paginated — no row limit)
      fetchAllRows<{ id: string; title: string }>(
        db.from('library_items'), 'id, title'
      ),
      // Recent content for fingerprinting (last 1000 — fingerprints are expensive to load)
      fetchAllRows<{ source_url: string; title: string; raw_content: string }>(
        db.from('library_items'), 'source_url, title, raw_content', 500
      ),
    ])

    // Load content items first (includes URL + title + fingerprint)
    dedup.loadExisting(recentContent)
    // Load remaining URLs not covered by content fetch
    const existingItems = allTitles
    for (const r of allUrls) {
      if (!dedup.hasUrl(r.source_url)) {
        dedup.register(r.source_url, '', undefined)
      }
    }
    // Load all titles directly (no fuzzy check — we're building the registry, not deduping)
    dedup.loadTitles(allTitles.map(r => r.title))
    console.log(`  Dedup registry loaded: ${dedup.urlCount} URLs, ${dedup.titleCount} titles, fingerprints for recent ${recentContent.length} items`)

    // ── STAGE 1: Discovery ────────────────────────────────────────────────────
    console.log('Stage 1: Discovery...')
    const discovered = await runDiscovery()

    // Dedup Layer 1: Normalized URL match (free, O(1))
    const afterUrlDedup = discovered.filter(d => !dedup.hasUrl(d.source_url))

    // Dedup Layer 2: Fuzzy title match against existing library (free, catches near-exact dupes + bigram similarity)
    const afterTitleDedup = afterUrlDedup.filter(d => {
      const match = dedup.matchesTitle(d.title)
      if (match) {
        console.log(`  Fuzzy dedup: "${d.title}" ≈ "${match}"`)
        return false
      }
      return true
    })

    // Dedup Layer 2b: Content fingerprint match (free, catches same content from different URLs)
    const newCandidates = afterTitleDedup.filter(d => {
      if (d.context && dedup.hasFingerprint(d.context)) {
        console.log(`  Fingerprint dedup: "${d.title}" — content already exists`)
        return false
      }
      return true
    })

    runLog.items_found = newCandidates.length
    console.log(`  Found ${discovered.length} URLs → ${afterUrlDedup.length} after URL dedup → ${afterTitleDedup.length} after title dedup → ${newCandidates.length} after fingerprint dedup`)

    if (newCandidates.length === 0) {
      await logRun(db, runLog)
      return runLog
    }

    // ── STAGE 2: Triage ───────────────────────────────────────────────────────
    console.log('Stage 2: Triage...')
    const triageResults = await batchAsync(newCandidates, 10, async (candidate) => {
      const result = await callJSON<TriageResult>(
        MODELS.triage,
        buildTriagePrompt(candidate, dedup.titlesList),
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

    // Post-deep-research fingerprint check — now that we have the real content
    // (GitHub README, etc.), check fingerprints again before spending on enrichment
    const afterDeepResearchDedup = readyItems.filter(item => {
      if (item.raw_content && dedup.hasFingerprint(item.raw_content)) {
        console.log(`  Post-research fingerprint dedup: "${item.title}" — content matches existing`)
        runLog.items_rejected++
        return false
      }
      return true
    })
    console.log(`  Post-research dedup: ${afterDeepResearchDedup.length}/${readyItems.length} unique`)

    // ── STAGE 4: Enrichment ───────────────────────────────────────────────────
    console.log('Stage 4: Enrichment...')
    const enriched = await batchAsync(afterDeepResearchDedup, 8, async (item) => {
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

    // ── Save to Supabase (with Layer 5: post-enrichment dedup) ─────────────────
    for (const result of enriched) {
      if (!result) { runLog.items_rejected++; continue }
      const { item, enriched: e } = result

      const qualityScore = Math.round(e.quality_score ?? 0)
      if (qualityScore < 7) {
        runLog.items_rejected++
        continue
      }

      // Layer 5a: Post-enrichment title dedup — the AI may have generated a title
      // that matches something already in the library (or something saved earlier in this run)
      const titleMatch = dedup.matchesTitle(e.title)
      if (titleMatch) {
        console.log(`  Post-enrich dedup: "${e.title}" ≈ "${titleMatch}" — skipping`)
        runLog.items_rejected++
        continue
      }

      // Layer 5b: Post-enrichment content fingerprint — catches same content from different URLs
      if (item.raw_content && dedup.hasFingerprint(item.raw_content)) {
        console.log(`  Post-enrich fingerprint dedup: "${e.title}" — content already exists`)
        runLog.items_rejected++
        continue
      }

      // Layer 6: Final DB existence check — catches concurrent pipeline runs
      // that may have inserted between our initial load and now
      const { data: dbCheck } = await db
        .from('library_items')
        .select('id')
        .eq('source_url', item.source_url)
        .limit(1)
      if (dbCheck && dbCheck.length > 0) {
        console.log(`  DB check dedup: "${e.title}" — source_url already in DB`)
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
        // Register in dedup registry so later items in this same batch can't duplicate it
        dedup.register(item.source_url, e.title, item.raw_content)
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
Core coverage areas: Claude Code, OpenAI Codex CLI, OpenCLAW framework, agentic AI tooling in general, and NEW AI MODEL releases (Gemini, Claude, GPT, Llama, etc.).
We also cover niche/unconventional use cases — real-world applications of AI coding agents in specific industries or creative scenarios.
Be strict — most content should be discarded. Only pass items that are genuinely novel, specific, and useful.
Respond only in valid JSON.`

function buildTriagePrompt(candidate: DiscoveryResult, existingTitles: string): string {
  // Send up to 8000 chars of existing titles — enough for ~200+ items
  const titleContext = existingTitles.slice(0, 8000)

  return `Evaluate this discovered item for our AI tools library.

URL: ${candidate.source_url}
Title: ${candidate.title}
Source type: ${candidate.source_type}
Discovery context: ${candidate.context.slice(0, 800)}

EXISTING LIBRARY TITLES — check CAREFULLY for duplicates and version updates:
${titleContext}

DUPLICATE DETECTION RULES (critical — we must never post duplicate content):
1. If this item covers the SAME tool, technique, or topic as any existing title, mark is_duplicate: true
2. A different URL does NOT mean different content — two blog posts about the same Claude Code hook are duplicates
3. If the existing library already has an item about THIS SPECIFIC tool/repo/technique, it is a duplicate
4. Only mark is_duplicate: false if this item provides genuinely NEW information not covered by any existing title
5. When in doubt, mark as duplicate — false negatives are worse than false positives

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
- "discard" if average score < 5, is_duplicate, or not about AI tools/prompts/workflows/model releases/niche use cases
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

CATEGORY ASSIGNMENT — READ CAREFULLY. Misclassification breaks the user experience.
Determine the PRIMARY nature of the content. Ask: "What is this ABOUT at its core?"

- category: "model" — a NEW AI MODEL release, update, or announcement. Examples: "Gemini 2.5 Flash", "Claude 4 Opus", "GPT-5", "Llama 4", "Qwen 3". If the content is announcing a new model, benchmarking a model, or discussing a model's capabilities/pricing/availability, it is a MODEL. A model is NOT a skill, technique, or workflow — it is a foundational AI system that other things are built on.
- category: "skill" — an installable Claude Code skill file (SKILL.md in .claude/skills/), a Codex CLI custom command, or equivalent auto-loaded agent capability. Must be a CONCRETE INSTALLABLE FILE, not general advice about a model.
- category: "hook" — a lifecycle automation trigger (pre-commit, post-save, etc.) configured in agent settings. Must describe a specific hook configuration.
- category: "plugin" — an MCP server, extension package, or tool integration that adds capabilities to an AI coding agent.
- category: "prompt" — a reusable prompt template, slash command, or system instruction. Must be a concrete prompt you can copy-paste.
- category: "technique" — a pattern, methodology, or strategy for working with AI models (chain-of-thought, structured output, etc.). NOT a model release.
- category: "workflow" — an end-to-end multi-step automation pipeline or orchestration pattern.
- category: "niche-use-case" — real-world applications of AI tools in specific industries, unconventional/creative uses, unique problem-solving stories.

CLASSIFICATION RULES (critical — wrong categories destroy user trust):
1. If the content announces or reviews a NEW MODEL (any provider) → "model". Period.
2. If the content is a tutorial about USING a model's features → "technique" (not "model")
3. If the content is a specific installable file (.md, .json config) → match to skill/hook/plugin/prompt
4. If the content mixes topics (e.g. "use this new model as a skill"), pick the PRIMARY nature
5. When in doubt between "model" and something else: if the headline is about the model itself → "model"

CRITICAL: The "ai_actionable_steps" you write will be embedded in prompts that users paste into their AI coding agent.
These steps must be written FOR AN AI AGENT TO EXECUTE, not for a human to follow manually.
- For MODEL category: write steps like "Analyze the best use cases for this model within the user's project", "Compare this model's strengths against the user's current provider", "If the user wants to try it, update the API configuration to point to this model"
- For other categories: "Clone the repository", "Add this config block to settings.json", "Install the npm package and configure the API client"
- Do NOT write steps like "Go to the website and click..." or "Open Google Studio and select..."
- If the tool requires an API key, say "Configure the API client using the user's existing provider key from their .env file, or prompt them to add one"
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
