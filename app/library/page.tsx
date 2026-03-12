import { getLibraryItems } from '@/lib/queries'
import LibraryCard from '@/components/LibraryCard'
import SearchBar from '@/components/SearchBar'
import CategoryFilter from '@/components/CategoryFilter'
import { Suspense } from 'react'
import { Category, Tool, Difficulty, LibraryItem } from '@/types'
import Link from 'next/link'
import { SEED_ITEMS, SEED_STATS } from '@/lib/seed-data'

export const revalidate = 3600

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

function filterSeedItems(items: LibraryItem[], params: {
  category?: Category | 'all'
  tool?: Tool | 'all'
  difficulty?: Difficulty | 'all'
  search?: string
}) {
  return items.filter(item => {
    if (params.category && params.category !== 'all' && item.category !== params.category) return false
    if (params.tool && params.tool !== 'all' && item.tool !== params.tool) return false
    if (params.difficulty && params.difficulty !== 'all' && item.difficulty !== params.difficulty) return false
    if (params.search && !item.title.toLowerCase().includes(params.search.toLowerCase())) return false
    return true
  })
}

export default async function LibraryPage({ searchParams }: PageProps) {
  const params = await searchParams
  const category = params.category as Category | 'all' | undefined
  const tool = params.tool as Tool | 'all' | undefined
  const difficulty = params.difficulty as Difficulty | 'all' | undefined
  const search = params.search as string | undefined
  const page = parseInt((params.page as string) || '1')

  let items: LibraryItem[] = []
  let total = 0
  let totalPages = 1

  try {
    const result = await getLibraryItems({ category, tool, difficulty, search, page, limit: 12 })
    items = result.items
    total = result.total
    totalPages = Math.ceil(total / 12)
  } catch {
    // Fall back to seed data
    const filtered = filterSeedItems(SEED_ITEMS, { category, tool, difficulty, search })
    total = filtered.length
    const limit = 12
    totalPages = Math.ceil(total / limit)
    items = filtered.slice((page - 1) * limit, page * limit)
  }

  const displayTotal = total > 0 ? total : SEED_STATS.total

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 64px' }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1
          className="font-syne"
          style={{ fontWeight: 800, fontSize: 28, color: 'var(--text-primary)', letterSpacing: '-0.01em', marginBottom: 6 }}
        >
          INTELLIGENCE LIBRARY
        </h1>
        <p className="font-mono" style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
          {displayTotal.toLocaleString()} items indexed · AI tools, prompts, hooks & techniques
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6" style={{ alignItems: 'flex-start' }}>
        {/* LEFT SIDEBAR — desktop sticky */}
        <aside
          className="hidden lg:block"
          style={{
            width: 260,
            flexShrink: 0,
            position: 'sticky',
            top: 72,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <Suspense fallback={<div style={{ height: 40, background: 'var(--surface)', borderRadius: 8 }} />}>
            <SearchBar />
          </Suspense>
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '14px 14px',
            }}
          >
            <Suspense fallback={<div style={{ height: 80 }} />}>
              <CategoryFilter />
            </Suspense>
          </div>

          {/* Stats block */}
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderLeft: '3px solid var(--accent)',
              borderRadius: 10,
              padding: '14px',
            }}
          >
            <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.10em', color: 'var(--accent)', marginBottom: 12 }}>
              SYSTEM STATS
            </div>
            {[
              { label: 'Total items', value: SEED_STATS.total.toLocaleString() },
              { label: 'New today', value: String(SEED_STATS.today) },
              { label: 'Sources', value: String(SEED_STATS.sources) },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</span>
                <span className="font-mono" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{s.value}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Mobile filters toggle */}
        <div className="lg:hidden" style={{ marginBottom: 12, width: '100%' }}>
          <details>
            <summary
              className="font-mono"
              style={{
                fontSize: 12,
                letterSpacing: '0.06em',
                color: 'var(--accent)',
                cursor: 'pointer',
                padding: '8px 12px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                listStyle: 'none',
              }}
            >
              ▸ FILTERS
            </summary>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Suspense fallback={null}>
                <SearchBar />
              </Suspense>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
                <Suspense fallback={null}>
                  <CategoryFilter />
                </Suspense>
              </div>
            </div>
          </details>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {items.map((item, i) => (
                  <LibraryCard key={item.id} item={item} index={i} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 36 }}>
                  {page > 1 && (
                    <Link
                      href={`/library?${new URLSearchParams({ ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])), page: String(page - 1) })}`}
                      className="font-mono"
                      style={{ padding: '7px 16px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 12, textDecoration: 'none' }}
                    >
                      ← Previous
                    </Link>
                  )}
                  <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.06em' }}>
                    {page} / {totalPages}
                  </span>
                  {page < totalPages && (
                    <Link
                      href={`/library?${new URLSearchParams({ ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])), page: String(page + 1) })}`}
                      className="font-mono"
                      style={{ padding: '7px 16px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 12, textDecoration: 'none' }}
                    >
                      Next →
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div className="font-mono" style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: 8 }}>
                NO RESULTS
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-dim)' }}>
                Try adjusting your filters or search term
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
