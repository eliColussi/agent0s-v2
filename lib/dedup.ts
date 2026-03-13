/**
 * Agent0s — Deduplication Engine
 *
 * 5-layer dedup chain (cheapest → most expensive):
 *   Layer 1: Normalized URL match (free, O(1) set lookup)
 *   Layer 2: Content fingerprint match (free, hash-based)
 *   Layer 3: Fuzzy title match (free, string comparison)
 *   Layer 4: AI triage duplicate detection (costs tokens)
 *   Layer 5: Post-enrichment title check before DB insert (free)
 *
 * Plus: within-batch dedup during discovery and pre-insert.
 */

import crypto from 'crypto'

// ─── URL Normalization ───────────────────────────────────────────────────────
// Catches: trailing slashes, www vs non-www, http vs https, tracking params,
// github.com/repo vs github.com/repo/, fragment hashes

export function normalizeUrl(raw: string): string {
  try {
    const u = new URL(raw)
    u.protocol = 'https:'
    u.hostname = u.hostname.replace(/^www\./, '')
    u.pathname = u.pathname.replace(/\/+$/, '') || '/'
    // Remove tracking query params but keep meaningful ones
    const trackingParams = [
      'ref', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content',
      'utm_term', 'source', 'via', 'fbclid', 'gclid', 'mc_cid', 'mc_eid',
    ]
    for (const p of trackingParams) u.searchParams.delete(p)
    u.hash = ''
    u.searchParams.sort()
    return u.toString()
  } catch {
    return raw
  }
}

// ─── GitHub URL Canonicalization ─────────────────────────────────────────────
// github.com/user/repo, github.com/user/repo/tree/main, github.com/user/repo/blob/main/README.md
// all refer to the same repository. We canonicalize to github.com/user/repo.

export function canonicalizeGitHubUrl(raw: string): string | null {
  try {
    const u = new URL(raw)
    if (u.hostname !== 'github.com') return null
    const parts = u.pathname.split('/').filter(Boolean)
    if (parts.length < 2) return null
    return `https://github.com/${parts[0]}/${parts[1]}`
  } catch {
    return null
  }
}

// ─── Content Fingerprint ─────────────────────────────────────────────────────
// Creates a stable hash from the core content, ignoring whitespace/casing.
// Two articles with different URLs but identical content get the same fingerprint.

export function contentFingerprint(text: string): string {
  const normalized = text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')  // strip everything but alphanumeric
    .slice(0, 5000)              // cap to avoid hashing massive docs
  return crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 16)
}

// ─── Fuzzy Title Matching ────────────────────────────────────────────────────
// Catches near-identical titles after normalization. Uses containment ratio
// to avoid "AI" matching "AI Tools Guide for Business Owners".

export function fuzzyTitleMatch(newTitle: string, existingTitles: string[]): string | null {
  const normalize = (s: string) =>
    s.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()

  const normalizedNew = normalize(newTitle)
  if (!normalizedNew || normalizedNew.length < 8) return null

  for (const existing of existingTitles) {
    const normalizedExisting = normalize(existing)
    if (!normalizedExisting || normalizedExisting.length < 8) continue

    // Exact match after normalization
    if (normalizedNew === normalizedExisting) return existing

    // One contains the other — only flag if shorter is >70% of longer
    if (normalizedNew.length > 12 && normalizedExisting.length > 12) {
      if (normalizedExisting.includes(normalizedNew) || normalizedNew.includes(normalizedExisting)) {
        const shorter = Math.min(normalizedNew.length, normalizedExisting.length)
        const longer = Math.max(normalizedNew.length, normalizedExisting.length)
        if (shorter / longer > 0.7) return existing
      }
    }

    // Bigram similarity — catches rearranged/reworded titles
    const sim = bigramSimilarity(normalizedNew, normalizedExisting)
    if (sim > 0.75) return existing
  }
  return null
}

// ─── Bigram (Dice) Similarity ────────────────────────────────────────────────
// Compares two strings by their character bigrams. 0 = no overlap, 1 = identical.
// Better than Levenshtein for catching reworded titles like
// "Claude Code Hooks Guide" vs "Guide to Hooks in Claude Code"

function bigrams(s: string): Set<string> {
  const set = new Set<string>()
  for (let i = 0; i < s.length - 1; i++) {
    set.add(s.slice(i, i + 2))
  }
  return set
}

function bigramSimilarity(a: string, b: string): number {
  const setA = bigrams(a)
  const setB = bigrams(b)
  if (setA.size === 0 || setB.size === 0) return 0
  let intersection = 0
  for (const bg of setA) {
    if (setB.has(bg)) intersection++
  }
  return (2 * intersection) / (setA.size + setB.size)
}

// ─── Dedup Registry ──────────────────────────────────────────────────────────
// Single object that holds all known URLs, fingerprints, and titles for a pipeline run.
// Provides O(1) checks against all layers simultaneously.

export class DedupRegistry {
  private urls = new Set<string>()
  private githubRepos = new Set<string>()
  private fingerprints = new Set<string>()
  private titles: string[] = []

  /** Load existing items from DB at pipeline start */
  loadExisting(items: { source_url: string; title: string; raw_content?: string }[]) {
    for (const item of items) {
      this.addUrl(item.source_url)
      if (item.title) this.titles.push(item.title)
      if (item.raw_content) {
        this.fingerprints.add(contentFingerprint(item.raw_content))
      }
    }
  }

  private addUrl(url: string) {
    this.urls.add(normalizeUrl(url))
    const ghCanon = canonicalizeGitHubUrl(url)
    if (ghCanon) this.githubRepos.add(ghCanon)
  }

  /** Bulk-load titles without fuzzy matching (for initial DB load, not dedup) */
  loadTitles(titles: string[]) {
    const existing = new Set(this.titles)
    for (const t of titles) {
      if (t && !existing.has(t)) {
        this.titles.push(t)
        existing.add(t)
      }
    }
  }

  /** Check if a URL is already known (includes GitHub repo canonicalization) */
  hasUrl(url: string): boolean {
    if (this.urls.has(normalizeUrl(url))) return true
    const ghCanon = canonicalizeGitHubUrl(url)
    if (ghCanon && this.githubRepos.has(ghCanon)) return true
    return false
  }

  /** Check if content fingerprint is already known */
  hasFingerprint(content: string): boolean {
    return this.fingerprints.has(contentFingerprint(content))
  }

  /** Check if a title fuzzy-matches an existing one. Returns the matched title or null. */
  matchesTitle(title: string): string | null {
    return fuzzyTitleMatch(title, this.titles)
  }

  /** Register a new item (after it passes all checks and gets inserted) */
  register(url: string, title: string, content?: string) {
    this.addUrl(url)
    if (title) this.titles.push(title)
    if (content) {
      this.fingerprints.add(contentFingerprint(content))
    }
  }

  get titleCount() { return this.titles.length }
  get urlCount() { return this.urls.size }
  get titlesList() { return this.titles.join('\n') }
}

// ─── Paginated DB Loader ─────────────────────────────────────────────────────
// Supabase caps at 1000 rows per query. This fetches ALL rows in pages.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchAllRows<T>(
  table: any,
  columns: string,
  pageSize = 1000,
): Promise<T[]> {
  const all: T[] = []
  let offset = 0
  while (true) {
    const { data, error } = await table.select(columns).range(offset, offset + pageSize - 1)
    if (error || !data || data.length === 0) break
    all.push(...(data as T[]))
    if (data.length < pageSize) break  // last page
    offset += pageSize
  }
  return all
}
