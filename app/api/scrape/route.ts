import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { runScrapeAndProcess } from '@/lib/pipeline'

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-scrape-secret') || ''
  const expected = process.env.SCRAPE_SECRET || ''

  if (!secret || !expected || !safeCompare(secret, expected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runScrapeAndProcess()
    return NextResponse.json({ success: true, ...result })
  } catch (e) {
    console.error('Scrape error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
