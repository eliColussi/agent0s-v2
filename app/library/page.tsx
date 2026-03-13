import { getLibraryItems, getStats } from '@/lib/queries'
import LibraryCard from '@/components/LibraryCard'
import SearchBar from '@/components/SearchBar'
import CategoryFilter from '@/components/CategoryFilter'
import { Suspense } from 'react'
import { Category, Tool, Difficulty, DateRange, LibraryItem } from '@/types'
import Link from 'next/link'

export const revalidate = 3600

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function LibraryPage({ searchParams }: PageProps) {
  const params = await searchParams
  const category = params.category as Category | 'all' | undefined
  const tool = params.tool as Tool | 'all' | undefined
  const difficulty = params.difficulty as Difficulty | 'all' | undefined
  const search = params.search as string | undefined
  const date_range = params.date_range as DateRange | 'all' | undefined
  const page = parseInt((params.page as string) || '1')

  let items: LibraryItem[] = []
  let total = 0
  let totalPages = 1
  let statsTotal = 0

  try {
    const [result, stats] = await Promise.all([
      getLibraryItems({ category, tool, difficulty, search, date_range, page, limit: 12 }),
      getStats(),
    ])
    items = result.items
    total = result.total
    totalPages = Math.ceil(total / 12)
    statsTotal = stats.total
  } catch {
    // DB unreachable — show empty state
  }

  const displayTotal = statsTotal

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 64px' }}>
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <h1
          className="font-syne gradient-text"
          style={{ fontWeight: 800, fontSize: 30, letterSpacing: '-0.01em', marginBottom: 8 }}
        >
          INTELLIGENCE LIBRARY
        </h1>
        <p className="font-mono" style={{ fontSize: 12, color: 'var(--text-dim)', letterSpacing: '0.06em' }}>
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
            className="glass"
            style={{
              padding: '16px 14px',
              borderRadius: 12,
            }}
          >
            <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--text-dim)', marginBottom: 12 }}>
              FILTERS
            </div>
            <Suspense fallback={<div style={{ height: 80 }} />}>
              <CategoryFilter />
            </Suspense>
          </div>

          {/* Stats block */}
          <div
            className="glass"
            style={{
              borderLeft: '3px solid var(--accent)',
              borderRadius: 12,
              padding: '16px 14px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Accent glow */}
            <div
              style={{
                position: 'absolute',
                top: -20,
                left: -20,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(232,184,75,0.06) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />
            <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--accent)', marginBottom: 14, position: 'relative' }}>
              SYSTEM STATS
            </div>
            {[
              { label: 'Total items', value: displayTotal.toLocaleString() },
              { label: 'Updated', value: 'Daily · 7am' },
              { label: 'Sources', value: 'Web + GitHub' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, position: 'relative' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.label}</span>
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
                padding: '10px 14px',
                background: 'var(--surface)',
                backdropFilter: 'blur(var(--glass-blur))',
                WebkitBackdropFilter: 'blur(var(--glass-blur))',
                border: '1px solid var(--border-glass)',
                borderRadius: 10,
                listStyle: 'none',
              }}
            >
              ▸ FILTERS & SEARCH
            </summary>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Suspense fallback={null}>
                <SearchBar />
              </Suspense>
              <div className="glass" style={{ borderRadius: 10, padding: 14 }}>
                <Suspense fallback={null}>
                  <CategoryFilter />
                </Suspense>
              </div>
            </div>
          </details>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Results count */}
          <div
            className="font-mono"
            style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.06em', marginBottom: 16 }}
          >
            {total > 0
              ? `${((page - 1) * 12) + 1}–${Math.min(page * 12, total)} of ${total} items`
              : '0 items found'}
          </div>

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
                      style={{
                        padding: '8px 18px',
                        borderRadius: 10,
                        background: 'var(--surface)',
                        backdropFilter: 'blur(var(--glass-blur))',
                        WebkitBackdropFilter: 'blur(var(--glass-blur))',
                        border: '1px solid var(--border-glass)',
                        color: 'var(--text-muted)',
                        fontSize: 12,
                        textDecoration: 'none',
                        transition: 'border-color 0.15s ease',
                      }}
                    >
                      ← Previous
                    </Link>
                  )}
                  <span
                    className="font-mono"
                    style={{
                      fontSize: 11,
                      color: 'var(--text-dim)',
                      letterSpacing: '0.06em',
                      padding: '4px 12px',
                      borderRadius: 6,
                      background: 'var(--surface-glass)',
                    }}
                  >
                    {page} / {totalPages}
                  </span>
                  {page < totalPages && (
                    <Link
                      href={`/library?${new URLSearchParams({ ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])), page: String(page + 1) })}`}
                      className="font-mono"
                      style={{
                        padding: '8px 18px',
                        borderRadius: 10,
                        background: 'var(--surface)',
                        backdropFilter: 'blur(var(--glass-blur))',
                        WebkitBackdropFilter: 'blur(var(--glass-blur))',
                        border: '1px solid var(--border-glass)',
                        color: 'var(--text-muted)',
                        fontSize: 12,
                        textDecoration: 'none',
                        transition: 'border-color 0.15s ease',
                      }}
                    >
                      Next →
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div
              className="glass"
              style={{ textAlign: 'center', padding: '80px 24px', borderRadius: 16 }}
            >
              <div className="font-mono" style={{ fontSize: 12, color: 'var(--text-dim)', letterSpacing: '0.08em', marginBottom: 12 }}>
                NO RESULTS
              </div>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 24 }}>
                No items match your current filters. Try broadening your search.
              </p>
              <Link
                href="/library"
                className="font-mono"
                style={{
                  padding: '9px 24px',
                  borderRadius: 8,
                  fontSize: 12,
                  letterSpacing: '0.04em',
                  textDecoration: 'none',
                  color: '#0e1520',
                  background: 'var(--accent)',
                  boxShadow: '0 0 16px rgba(232,184,75,0.2)',
                }}
              >
                Clear all filters
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
