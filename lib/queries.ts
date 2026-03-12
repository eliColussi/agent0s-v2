import { supabase } from './supabase'
import { LibraryItem, DailyDigest, LibraryFilters } from '@/types'

export async function getLibraryItems(filters: LibraryFilters = {}) {
  const { category, tool, difficulty, search, page = 1, limit = 12 } = filters
  const offset = (page - 1) * limit

  let query = supabase
    .from('library_items')
    .select('*', { count: 'exact' })
    .gte('quality_score', 7)
    .order('created_at', { ascending: false })

  if (category && category !== 'all') query = query.eq('category', category)
  if (tool && tool !== 'all') query = query.eq('tool', tool)
  if (difficulty && difficulty !== 'all') query = query.eq('difficulty', difficulty)
  if (search) query = query.ilike('title', `%${search}%`)

  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query
  if (error) throw error
  return { items: (data as LibraryItem[]) || [], total: count || 0 }
}

export async function getItemById(id: string) {
  const { data, error } = await supabase
    .from('library_items')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as LibraryItem
}

export async function getItemsByCategory(category: string, limit = 12) {
  const { data, error } = await supabase
    .from('library_items')
    .select('*')
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
    .select('*')
    .in('id', ids)
  if (error) throw error
  return (data as LibraryItem[]) || []
}

export async function getRecentItems(limit = 12) {
  const { data, error } = await supabase
    .from('library_items')
    .select('*')
    .gte('quality_score', 7)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data as LibraryItem[]) || []
}

export async function getStats() {
  const { count: total } = await supabase
    .from('library_items')
    .select('*', { count: 'exact', head: true })
    .gte('quality_score', 7)
  return { total: total || 0 }
}
