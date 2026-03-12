/**
 * Stage 1: Discovery — Perplexity Sonar Pro
 *
 * Tiered query architecture:
 *   Tier 1 (Anchors, 8 queries) — run every day. Catches breaking releases,
 *   changelogs, and high-signal content the moment it drops.
 *
 *   Tier 2 (Rotating pool, 42 queries) — 7 selected per day on a 6-day cycle.
 *   Covers deep domain knowledge: business AI, local models, integrations,
 *   niche Claude Code techniques, open-source ecosystem, industry use cases.
 *
 * Total per run: 15 queries (same Sonar budget as before, far more varied output).
 */

import { callSonar } from '../openrouter'

export interface DiscoveryResult {
  source_url: string
  title: string        // best-effort title extracted from URL
  context: string      // Sonar answer text for this query
  source_type: 'github' | 'web'
  query_used: string
  query_tier: 'anchor' | 'rotating'
}

// ─── Tier 1: Anchor Queries ────────────────────────────────────────────────
// Run every day. Time-sensitive; new signal appears daily.
// Focused on real releases and substantive technical content — no hype.

const ANCHOR_QUERIES = [
  // Anthropic / Claude Code releases — literal changelog tracking
  'Claude Code release update changelog new feature site:github.com/anthropics OR site:anthropic.com 2026',
  // Claude.ai and Claude API new capabilities
  'Anthropic Claude new model API feature release developer 2026',
  // Claude Code community repos — repos that shipped in the last few days
  'Claude Code hooks CLAUDE.md new github repository released this week',
  // AI coding tools — Cursor, Windsurf, Codex real updates
  'Cursor Windsurf AI coding tool release changelog update 2026',
  // High-signal developer community: real workflows, not hot-takes
  'Claude Code advanced workflow site:news.ycombinator.com OR site:lobste.rs 2026',
  // Agentic frameworks with real GitHub traction
  'AI agent framework library new release github stars 2026',
  // Local AI — new models and runtimes that dropped overnight
  'Ollama new model LM Studio local LLM release 2026',
  // OpenAI/Gemini developer releases (competitive context our readers need)
  'OpenAI Gemini developer API new feature release this week 2026',
]

// ─── Tier 2: Rotating Pool ─────────────────────────────────────────────────
// 42 queries across 6 domain families. 7 selected per day.
// Cycle resets every 6 days, driven by day-of-year offset.

// Each query describes a domain or behavior — never a brand or specific tool name.
// This keeps discovery open to new entrants the queries don't anticipate.
// The triage agent evaluates quality; the queries just cast the net.
const ROTATING_QUERIES = [
  // ── AI coding agent techniques (7) ────────────────────────────────────
  'AI coding agent memory context management developer technique guide github',
  'agentic coding workflow parallel subagent orchestration pattern examples',
  'AI coding assistant MCP custom tool integration developer setup guide',
  'AI coding agent hooks automation pre-post action scripts real examples',
  'AI coding agent permission isolation worktree workflow pattern github',
  'AI coding agent slash command custom workflow engineering examples',
  'curated AI coding agent skills hooks plugins community collection github',

  // ── Business process automation (7) ───────────────────────────────────
  'AI business process automation workflow practical implementation guide',
  'AI document extraction classification business operations guide 2026',
  'AI customer communication automation business workflow implementation',
  'AI financial operations reporting automation practical business guide',
  'AI sales pipeline lead enrichment automation business implementation',
  'AI operations scheduling resource allocation automation guide 2026',
  'AI back-office workflow automation small business practical examples',

  // ── Local and private AI deployment (7) ───────────────────────────────
  'local LLM inference runtime new release open source developer 2026',
  'self-hosted AI deployment private server business workflow guide',
  'on-device AI inference optimization developer production guide 2026',
  'air-gapped private LLM enterprise deployment implementation guide',
  'self-hosted RAG pipeline vector store open source implementation',
  'local AI model quantization performance benchmark developer guide',
  'open source inference server new release production deployment guide',

  // ── AI workflow automation platforms (7) ──────────────────────────────
  'AI workflow automation platform new release feature developer 2026',
  'visual AI workflow builder integration pattern practical examples',
  'event-driven AI automation webhook trigger pattern implementation',
  'AI agent orchestration platform new release github 2026',
  'no-code AI automation business workflow practical implementation',
  'AI integration middleware platform new release developer guide',
  'autonomous AI workflow scheduler new release production guide 2026',

  // ── LLM and prompting techniques (7) ──────────────────────────────────
  'structured reasoning chain of thought production application github',
  'structured output schema enforcement LLM production technique guide',
  'agentic loop prompt design pattern real implementation examples',
  'domain-specific few-shot prompting business application examples',
  'system prompt architecture production AI application design guide',
  'retrieval augmented generation production implementation guide 2026',
  'LLM tracing observability monitoring production application guide',

  // ── Emerging AI infrastructure (7) ────────────────────────────────────
  'open source language model new release developer implementation 2026',
  'vector database new product launch developer benchmark 2026',
  'AI inference hardware accelerator new release developer guide 2026',
  'autonomous AI agent framework new release github stars 2026',
  'multimodal AI model new release practical developer use case 2026',
  'AI model fine-tuning domain-specific production business guide',
  'AI evaluation benchmark new release practical developer comparison',

  // ── Industry and professional AI use cases (7) ────────────────────────
  'professional services AI workflow automation case study implementation',
  'AI creative production content generation workflow automation guide',
  'AI data analysis business intelligence automation practical guide',
  'AI knowledge management enterprise workflow implementation guide',
  'AI client delivery agency workflow automation practical examples',
  'AI product development research automation workflow guide 2026',
  'AI operations logistics process automation implementation guide',
]

// ─── Build today's query list ──────────────────────────────────────────────

function getTodaysQueries(): string[] {
  const dayOfYear = Math.floor(
    (Date.now() - Date.UTC(new Date().getUTCFullYear(), 0, 0)) / 86_400_000
  )
  const poolSize = ROTATING_QUERIES.length // 42
  const perDay = 7
  const offset = (dayOfYear * perDay) % poolSize

  // Wrap around the pool so we never go out of bounds
  const rotating = offset + perDay <= poolSize
    ? ROTATING_QUERIES.slice(offset, offset + perDay)
    : [
        ...ROTATING_QUERIES.slice(offset),
        ...ROTATING_QUERIES.slice(0, (offset + perDay) - poolSize),
      ]

  return [...ANCHOR_QUERIES, ...rotating]
}

// ─── Main discovery function ───────────────────────────────────────────────

const MAX_DISCOVERY_URLS = 80

export async function runDiscovery(): Promise<DiscoveryResult[]> {
  const queries = getTodaysQueries()
  const results: DiscoveryResult[] = []
  const seenUrls = new Set<string>()

  console.log(`  Discovery: ${ANCHOR_QUERIES.length} anchors + 7 rotating (day offset ${Math.floor((Date.now() - Date.UTC(new Date().getUTCFullYear(), 0, 0)) / 86_400_000) % 6} of 6-day cycle)`)

  // Run in batches of 5 to respect Sonar rate limits
  for (let i = 0; i < queries.length; i += 5) {
    const batch = queries.slice(i, i + 5)
    const settled = await Promise.allSettled(
      batch.map(query =>
        callSonar(query).then(r => ({ ...r, query }))
      )
    )

    for (const result of settled) {
      if (result.status !== 'fulfilled') {
        console.error('Sonar query failed:', result.reason)
        continue
      }

      const { answer, citations, query } = result.value
      const tier: 'anchor' | 'rotating' = ANCHOR_QUERIES.includes(query) ? 'anchor' : 'rotating'

      for (const url of citations) {
        if (results.length >= MAX_DISCOVERY_URLS) break
        if (!url.startsWith('http')) continue
        if (seenUrls.has(url)) continue
        seenUrls.add(url)

        results.push({
          source_url: url,
          title: extractTitleFromUrl(url),
          context: answer.slice(0, 3000),
          source_type: url.includes('github.com') ? 'github' : 'web',
          query_used: query,
          query_tier: tier,
        })
      }
    }

    // Pause between batches
    if (i + 5 < queries.length) {
      await new Promise(r => setTimeout(r, 1200))
    }
  }

  return results
}

// ─── URL title extraction ──────────────────────────────────────────────────

function extractTitleFromUrl(url: string): string {
  try {
    const { hostname, pathname } = new URL(url)
    const parts = pathname.split('/').filter(Boolean)

    // GitHub: show owner/repo
    if (hostname === 'github.com' && parts.length >= 2) {
      return `${parts[0]} / ${parts[1]}`
    }

    // Reddit: show post title from path
    if (hostname.includes('reddit.com') && parts.length >= 4) {
      return decodeURIComponent(parts[4] || parts[parts.length - 1])
        .replace(/[-_]/g, ' ')
    }

    // General: last meaningful path segment
    const last = parts[parts.length - 1] || hostname
    return decodeURIComponent(last)
      .replace(/[-_]/g, ' ')
      .replace(/\.[^.]+$/, '')
      .slice(0, 80)
  } catch {
    return url.slice(0, 80)
  }
}
