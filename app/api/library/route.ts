import { NextRequest, NextResponse } from 'next/server'
import { getLibraryItems } from '@/lib/queries'
import { Category, Tool, Difficulty } from '@/types'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const filters = {
    category: (searchParams.get('category') as Category | 'all') || 'all',
    tool: (searchParams.get('tool') as Tool | 'all') || 'all',
    difficulty: (searchParams.get('difficulty') as Difficulty | 'all') || 'all',
    search: searchParams.get('search') || undefined,
    page: Math.max(parseInt(searchParams.get('page') || '1') || 1, 1),
    limit: Math.min(Math.max(parseInt(searchParams.get('limit') || '12') || 12, 1), 50),
  }

  try {
    const result = await getLibraryItems(filters)
    return NextResponse.json(result, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate' },
    })
  } catch (e) {
    console.error('Library API error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
