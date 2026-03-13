/**
 * Stage 1: Discovery — Perplexity Sonar Pro
 *
 * Tiered query architecture:
 *   Tier 1 (Anchors, 9 queries) — run every day. Dedicated queries per tool
 *   (Claude Code, OpenAI Codex CLI, OpenCLAW) covering releases AND projects/
 *   use cases. Plus agentic frameworks broadly and model releases.
 *
 *   Tier 2 (Rotating pool, 49 queries) — 5 selected per day on a 10-day cycle.
 *   Covers deep domain knowledge: Claude Code depth, OpenCLAW ecosystem,
 *   niche use cases, business AI, local models, integrations, prompting.
 *
 * Total per run: 14 queries (~$2.10/day budget target).
 */

import { callSonar } from '../openrouter'
import { normalizeUrl } from '../dedup'

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
// Core coverage: Claude Code, OpenAI Codex, OpenCLAW, agentic AI tooling.

const ANCHOR_QUERIES = [
  // ── Claude Code (2 queries) ─────────────────────────────────────────────
  // Releases, features, official updates
  'Claude Code new release update hooks skills MCP plugins CLAUDE.md changelog 2026',
  // Projects, workflows, things people built with Claude Code
  'Claude Code project workflow real example developer built with showcase github 2026',

  // ── OpenAI Codex CLI (2 queries) ────────────────────────────────────────
  // Releases, features, CLI updates, agent capabilities
  '"Codex CLI" OR "OpenAI Codex" new release update feature agent autonomous coding 2026',
  // Projects, use cases, things people built or automated with Codex CLI
  '"Codex CLI" OR "OpenAI Codex" project built with use case workflow developer showcase github 2026',

  // ── OpenCLAW (2 queries) ────────────────────────────────────────────────
  // Releases, framework updates, new capabilities
  'OpenCLAW agentic framework release update new feature autonomous agent github 2026',
  // Projects, implementations, what people are building with OpenCLAW
  'OpenCLAW project implementation use case multi-agent workflow built with showcase github 2026',

  // ── Agentic AI broadly ──────────────────────────────────────────────────
  // Frameworks, new entrants, comparisons
  'agentic AI coding framework Cursor Windsurf LangGraph CrewAI new release comparison 2026',

  // ── Model releases ─────────────────────────────────────────────────────
  'new AI model release GPT Gemini Claude Llama Qwen benchmark developer API 2026',

  // ── Community signal ────────────────────────────────────────────────────
  'Claude Code OR "Codex CLI" OR OpenCLAW AI coding project site:news.ycombinator.com OR site:reddit.com 2026',
]

// ─── Tier 2: Rotating Pool ─────────────────────────────────────────────────
// 49 queries across 7 domain families. 5 selected per day on a 10-day cycle.
// Cycle resets every ~10 days, driven by day-of-year offset.

// Each query describes a domain or behavior — never a brand or specific tool name
// (except OpenCLAW family, which is an editorial commitment like Claude Code).
// The triage agent evaluates quality; the queries just cast the net.
const ROTATING_QUERIES = [
  // ── Claude Code + Codex deep techniques (7) ───────────────────────────
  'Claude Code hooks automation lifecycle pre-commit post-save real examples github',
  'Claude Code CLAUDE.md project memory custom instructions advanced patterns',
  'Claude Code MCP server custom tool integration setup production examples',
  'Claude Code skills plugins community collection curated github repository',
  'Codex CLI agent autonomous coding workflow parallel task orchestration',
  'Claude Code slash commands custom prompts markdown template engineering',
  'Claude Code worktree isolation permission scoping advanced workflow patterns',

  // ── OpenCLAW ecosystem (7) ────────────────────────────────────────────
  'OpenCLAW framework tutorial getting started agentic AI setup guide github',
  'OpenCLAW agent workflow orchestration pattern production implementation',
  'OpenCLAW integration API third-party tool connector practical examples',
  'OpenCLAW community plugin extension new release github repository 2026',
  'OpenCLAW multi-agent coordination autonomous task execution architecture',
  'OpenCLAW deployment production scaling best practices guide 2026',
  'OpenCLAW custom agent builder template real-world business use case',

  // ── Niche AI use cases (7) ────────────────────────────────────────────
  'AI coding agent niche use case specific industry vertical real implementation',
  'Claude Code unconventional creative use case automation real examples github',
  'AI agent unexpected application non-obvious workflow developer showcase',
  'agentic AI small business niche automation specific problem solving examples',
  'AI coding tool creative project unique application developer portfolio github',
  'Claude Code Codex real-world case study specific business problem solved 2026',
  'AI agent edge case unusual workflow production implementation story github',

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
  'Ollama open source inference server new release production deployment 2026',

  // ── LLM and prompting techniques (7) ──────────────────────────────────
  'structured reasoning chain of thought production application github',
  'structured output schema enforcement LLM production technique guide',
  'agentic loop prompt design pattern real implementation examples',
  'system prompt architecture production AI application design guide',
  'retrieval augmented generation production implementation guide 2026',
  'LLM tracing observability monitoring production application guide',
  'prompt engineering advanced technique multi-turn context management guide',

  // ── Emerging AI infrastructure (7) ────────────────────────────────────
  'open source language model new release developer implementation 2026',
  'vector database new product launch developer benchmark 2026',
  'autonomous AI agent framework new release github stars 2026',
  'multimodal AI model new release practical developer use case 2026',
  'AI model fine-tuning domain-specific production business guide',
  'AI evaluation benchmark new release practical developer comparison',
  'AI workflow automation platform orchestration new release github 2026',
]

// ─── Build today's query list ──────────────────────────────────────────────

function getTodaysQueries(): string[] {
  const dayOfYear = Math.floor(
    (Date.now() - Date.UTC(new Date().getUTCFullYear(), 0, 0)) / 86_400_000
  )
  const poolSize = ROTATING_QUERIES.length // 49
  const perDay = 5
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

  console.log(`  Discovery: ${ANCHOR_QUERIES.length} anchors + 5 rotating (day offset ${Math.floor((Date.now() - Date.UTC(new Date().getUTCFullYear(), 0, 0)) / 86_400_000) % 10} of 10-day cycle)`)

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
        const normalized = normalizeUrl(url)
        if (seenUrls.has(normalized)) continue
        seenUrls.add(normalized)

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
