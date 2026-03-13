import { supabase } from './supabase'
import { LibraryItem, DailyDigest, LibraryFilters } from '@/types'

/** Columns safe to return to the client (excludes raw_content) */
const PUBLIC_COLUMNS = 'id, title, category, tool, difficulty, quality_score, ai_summary, ai_actionable_steps, ai_project_ideas, ai_business_use_cases, code_snippet, tags, source_url, source_type, is_featured, github_stars, upvotes, version_label, is_version_update, supersedes_id, created_at, scraped_at'

/** Escape LIKE/ILIKE wildcard characters in user input */
function escapeLike(s: string): string {
  return s.replace(/%/g, '\\%').replace(/_/g, '\\_')
}

export async function getLibraryItems(filters: LibraryFilters = {}) {
  const { category, tool, difficulty, search, page = 1, limit = 12 } = filters
  const offset = (page - 1) * limit

  let query = supabase
    .from('library_items')
    .select(PUBLIC_COLUMNS, { count: 'exact' })
    .gte('quality_score', 7)
    .order('created_at', { ascending: false })

  if (category && category !== 'all') query = query.eq('category', category)
  if (tool && tool !== 'all') query = query.eq('tool', tool)
  if (difficulty && difficulty !== 'all') query = query.eq('difficulty', difficulty)
  if (search) query = query.ilike('title', `%${escapeLike(search)}%`)

  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query
  if (error) throw error
  return { items: (data as LibraryItem[]) || [], total: count || 0 }
}

export async function getItemById(id: string) {
  const { data, error } = await supabase
    .from('library_items')
    .select(PUBLIC_COLUMNS)
    .eq('id', id)
    .single()
  if (error) throw error
  return data as LibraryItem
}

export async function getItemsByCategory(category: string, limit = 12) {
  const { data, error } = await supabase
    .from('library_items')
    .select(PUBLIC_COLUMNS)
    .eq('category', category)
    .gte('quality_score', 7)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data as LibraryItem[]) || []
}

export async function getDailyDigest(date?: string) {
  let query = supabase.from('daily_digests').select('*')
  if (date) {
    query = query.eq('date', date)
  } else {
    query = query.order('date', { ascending: false }).limit(1)
  }
  const { data, error } = await query
  if (error) throw error
  return data?.[0] as DailyDigest | null
}

export async function getFeaturedItems(ids: string[]) {
  if (!ids?.length) return []
  const { data, error } = await supabase
    .from('library_items')
    .select(PUBLIC_COLUMNS)
    .in('id', ids)
  if (error) throw error
  return (data as LibraryItem[]) || []
}

export async function getRecentItems(limit = 12) {
  const { data, error } = await supabase
    .from('library_items')
    .select(PUBLIC_COLUMNS)
    .gte('quality_score', 7)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data as LibraryItem[]) || []
}

const AGENTIC_CATEGORIES = ['skill', 'hook', 'prompt', 'plugin']

export async function getAgenticItems(filters: {
  subcategory?: string
  tool?: string
  page?: number
  limit?: number
} = {}) {
  const { subcategory, tool, page = 1, limit = 16 } = filters
  const offset = (page - 1) * limit

  let query = supabase
    .from('library_items')
    .select(PUBLIC_COLUMNS, { count: 'exact' })
    .in('category', subcategory && subcategory !== 'all' ? [subcategory] : AGENTIC_CATEGORIES)
    .gte('quality_score', 7)
    .order('created_at', { ascending: false })

  if (tool && tool !== 'all') query = query.eq('tool', tool)

  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query
  if (error) throw error
  return { items: (data as LibraryItem[]) || [], total: count || 0 }
}

export async function getTodaysHeroItem() {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('library_items')
    .select(PUBLIC_COLUMNS)
    .gte('created_at', `${today}T00:00:00`)
    .lt('created_at', `${today}T23:59:59.999`)
    .gte('quality_score', 7)
    .order('quality_score', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
  if (error) throw error
  return (data?.[0] as LibraryItem) ?? null
}

export async function getCategoryCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('library_items')
    .select('category')
    .gte('quality_score', 7)
  if (error) throw error
  const counts: Record<string, number> = {}
  for (const row of (data as { category: string }[] || [])) {
    counts[row.category] = (counts[row.category] || 0) + 1
  }
  return counts
}

export async function getStats() {
  const { count: total } = await supabase
    .from('library_items')
    .select('*', { count: 'exact', head: true })
    .gte('quality_score', 7)
  return { total: total || 0 }
}
