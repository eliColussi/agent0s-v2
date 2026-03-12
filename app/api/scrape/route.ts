import { NextRequest, NextResponse } from 'next/server'
import { runScrapeAndProcess } from '@/lib/pipeline'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-scrape-secret')
  if (secret !== process.env.SCRAPE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runScrapeAndProcess()
    return NextResponse.json({ success: true, ...result })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
