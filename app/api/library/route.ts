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
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '12'),
  }

  try {
    const result = await getLibraryItems(filters)
    return NextResponse.json(result, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate' },
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
