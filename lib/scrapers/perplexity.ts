/**
 * Stage 1: Discovery — Perplexity Sonar Pro
 *
 * Runs 15 targeted queries across the live web. Returns cited source URLs
 * with context. GitHub URLs proceed to Stage 3 (deep research). All others
 * use the Sonar answer text as raw_content for enrichment.
 */

import { callSonar } from '../openrouter'

export interface DiscoveryResult {
  source_url: string
  title: string        // best-effort title extracted from URL
  context: string      // Sonar answer text for this query
  source_type: 'github' | 'web'
  query_used: string
}

// 15 queries designed to maximize novel, high-quality content discovery.
// Covers Claude Code, general AI tools, business use cases, and community finds.
const DISCOVERY_QUERIES = [
  // Claude Code — hooks & automations
  'latest Claude Code hooks CLAUDE.md automation scripts github released 2026',
  // Claude Code — skills & plugins
  'new Claude Code skills plugins extensions github community released',
  // Claude Code — prompts & workflows
  'Claude Code workflow prompts techniques best practices repository examples',
  // Claude Code — advanced config
  'CLAUDE.md advanced configuration settings productivity developer techniques 2026',
  // General AI coding agents
  'new AI coding agent agentic workflow tools released github 2026',
  // AI prompts for business
  'AI automation prompts small business owners practical actionable use cases 2026',
  // LLM tool use
  'LLM tool use structured output agentic techniques guide developers github',
  // ChatGPT/Codex
  'ChatGPT Codex developer prompts automation productivity examples 2026',
  // AI productivity
  'AI developer productivity techniques tools tips released this week 2026',
  // Awesome lists
  'awesome claude prompts hooks skills curated collection github new releases',
  // Community finds
  'claude code advanced tips usage community hackernews developers 2026',
  // Agent frameworks
  'AI agent framework prompt engineering techniques best practices examples 2026',
  // Business AI
  'business AI workflow automation non-technical practical actionable guide 2026',
  // New Anthropic features
  'anthropic claude new features developer techniques examples released 2026',
  // Cross-tool
  'AI coding assistant prompts hooks scripts multi-tool developers 2026',
]

export async function runDiscovery(): Promise<DiscoveryResult[]> {
  const results: DiscoveryResult[] = []
  const seenUrls = new Set<string>()

  // Run queries in batches of 5 to stay within Sonar rate limits
  for (let i = 0; i < DISCOVERY_QUERIES.length; i += 5) {
    const batch = DISCOVERY_QUERIES.slice(i, i + 5)

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

      for (const url of citations) {
        if (!url.startsWith('http')) continue
        if (seenUrls.has(url)) continue
        seenUrls.add(url)

        results.push({
          source_url: url,
          title: extractTitleFromUrl(url),
          context: answer.slice(0, 3000),
          source_type: url.includes('github.com') ? 'github' : 'web',
          query_used: query,
        })
      }
    }

    // Pause between batches
    if (i + 5 < DISCOVERY_QUERIES.length) {
      await new Promise(r => setTimeout(r, 1200))
    }
  }

  return results
}

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
