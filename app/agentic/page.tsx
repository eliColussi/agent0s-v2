import { getAgenticItems } from '@/lib/queries'
import LibraryCard from '@/components/LibraryCard'
import AgenticFilter from '@/components/AgenticFilter'
import Link from 'next/link'
import { Suspense } from 'react'
import { LibraryItem } from '@/types'

export const revalidate = 3600

const definitions: { key: string; label: string; icon: string; desc: string }[] = [
  { key: 'skill', label: 'Skills', icon: 'S', desc: 'Auto-loaded capabilities via SKILL.md files. Claude Code and Codex read these at startup and apply them contextually.' },
  { key: 'prompt', label: 'Commands', icon: '/', desc: 'Slash command templates stored as markdown. Invoked explicitly with /command-name for reusable workflows.' },
  { key: 'hook', label: 'Hooks', icon: 'H', desc: 'Shell commands or scripts that fire automatically at lifecycle events \u2014 before tool calls, after file writes, etc.' },
  { key: 'plugin', label: 'Plugins', icon: 'P', desc: 'Distribution bundles that package skills, hooks, commands, and MCP servers into one installable unit.' },
]

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AgenticPage({ searchParams }: PageProps) {
  const params = await searchParams
  const subcategory = (params.sub as string) || 'all'
  const tool = (params.tool as string) || 'all'
  const page = parseInt((params.page as string) || '1')

  let items: LibraryItem[] = []
  let total = 0

  try {
    const result = await getAgenticItems({ subcategory, tool, page, limit: 16 })
    items = result.items
    total = result.total
  } catch {
    // DB unreachable
  }

  const totalPages = Math.ceil(total / 16)

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 64px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--cat-hook) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0e1520" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1
            className="font-syne"
            style={{ fontWeight: 700, fontSize: 28, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
          >
            Agentic Tools
          </h1>
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text-muted)', maxWidth: 640 }}>
          Skills, commands, hooks, and plugins for AI coding agents.
          Currently tracking <span style={{ color: 'var(--accent)' }}>Claude Code</span>, <span style={{ color: 'var(--accent)' }}>Codex CLI</span>, and <span style={{ color: 'var(--accent)' }}>OpenCLAW</span>.
        </p>
      </div>

      {/* Definition cards — collapsed on mobile */}
      <div
        className="hidden lg:grid"
        style={{
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 10,
          marginBottom: 24,
        }}
      >
        {definitions.map(d => (
          <div
            key={d.key}
            className="card-enter"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '12px 14px',
              animationDelay: '50ms',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span
                className="font-mono"
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 5,
                  background: 'rgba(232,184,75,0.15)',
                  color: 'var(--accent)',
                  fontSize: 11,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {d.icon}
              </span>
              <span className="font-syne" style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                {d.label}
              </span>
            </div>
            <p className="font-mono" style={{ fontSize: 11, lineHeight: 1.5, color: 'var(--text-dim)', letterSpacing: '0.02em' }}>
              {d.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ marginBottom: 24 }}>
        <Suspense fallback={<div style={{ height: 70 }} />}>
          <AgenticFilter />
        </Suspense>
      </div>

      {/* Results count */}
      <div
        className="font-mono"
        style={{ fontSize: 12, color: 'var(--text-dim)', letterSpacing: '0.06em', marginBottom: 16 }}
      >
        {total} {total === 1 ? 'item' : 'items'} found
      </div>

      {/* Card grid */}
      {items.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {items.map((item, i) => (
              <LibraryCard key={item.id} item={item} index={i} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 36 }}>
              {page > 1 && (
                <Link
                  href={`/agentic?${new URLSearchParams({ ...(subcategory !== 'all' ? { sub: subcategory } : {}), ...(tool !== 'all' ? { tool } : {}), page: String(page - 1) })}`}
                  className="font-mono"
                  style={{ padding: '7px 16px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}
                >
                  Previous
                </Link>
              )}
              <span className="font-mono" style={{ fontSize: 12, color: 'var(--text-dim)', letterSpacing: '0.06em' }}>
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/agentic?${new URLSearchParams({ ...(subcategory !== 'all' ? { sub: subcategory } : {}), ...(tool !== 'all' ? { tool } : {}), page: String(page + 1) })}`}
                  className="font-mono"
                  style={{ padding: '7px 16px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div className="font-mono" style={{ fontSize: 13, color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: 12 }}>
            NO RESULTS
          </div>
          <p style={{ fontSize: 15, color: 'var(--text-dim)', marginBottom: 20 }}>
            No agentic tools found for this filter combination. New items are discovered daily at 7am PST.
          </p>
          <Link
            href="/agentic"
            className="font-mono"
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              fontSize: 13,
              letterSpacing: '0.04em',
              textDecoration: 'none',
              color: '#0e1520',
              background: 'var(--accent)',
            }}
          >
            Clear all filters
          </Link>
        </div>
      )}
    </div>
  )
}
