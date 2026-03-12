import { getDailyDigest, getFeaturedItems, getRecentItems } from '@/lib/queries'
import DailyDigest from '@/components/DailyDigest'
import LibraryCard from '@/components/LibraryCard'
import CategoryTiles from '@/components/CategoryTiles'
import Link from 'next/link'
import { SEED_ITEMS, SEED_DIGEST, SEED_STATS } from '@/lib/seed-data'

export const revalidate = 3600

const categoryMeta = [
  { value: 'agentic',        label: 'Agentic',      color: 'var(--cat-prompt)',         href: '/agentic' },
  { value: 'skill',          label: 'Skills',        color: 'var(--cat-skill)',          href: '/agentic?sub=skill' },
  { value: 'hook',           label: 'Hooks',         color: 'var(--cat-hook)',           href: '/agentic?sub=hook' },
  { value: 'technique',      label: 'Techniques',    color: 'var(--cat-technique)',      href: '/library?category=technique' },
  { value: 'workflow',       label: 'Workflows',     color: 'var(--cat-workflow)',       href: '/library?category=workflow' },
  { value: 'niche-use-case', label: 'Niche Uses',    color: 'var(--cat-niche-use-case)', href: '/library?category=niche-use-case' },
  { value: 'plugin',         label: 'Plugins',       color: 'var(--cat-plugin)',         href: '/agentic?sub=plugin' },
]

export default async function HomePage() {
  let digest = null
  let recentItems: import('@/types').LibraryItem[] = []

  try {
    const [d, r] = await Promise.all([
      getDailyDigest().catch(() => null),
      getRecentItems(6).catch(() => []),
    ])
    digest = d
    recentItems = r
    if (digest?.featured_item_ids?.length) {
      await getFeaturedItems(digest.featured_item_ids).catch(() => [])
    }
  } catch {
    // fall through
  }

  const useSeed = !digest && recentItems.length === 0
  const displayDigest = digest ?? SEED_DIGEST
  const displayItems = recentItems.length > 0 ? recentItems : SEED_ITEMS.slice(0, 6)
  const featuredItems = useSeed
    ? SEED_ITEMS.filter(i => SEED_DIGEST.featured_item_ids.includes(i.id)).slice(0, 4)
    : []

  const tiles = categoryMeta.map(cat => ({
    ...cat,
    count: SEED_ITEMS.filter(i => i.category === cat.value).length,
  }))

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 64px' }}>
      {/* System status ticker */}
      <div
        style={{
          overflow: 'hidden',
          borderBottom: '1px solid var(--border)',
          padding: '8px 0',
          marginBottom: 32,
        }}
      >
        <div
          className="ticker-inner font-mono"
          style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.07em' }}
        >
          {[1, 2].map(n => (
            <span
              key={n}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 24, marginRight: 64 }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--accent-green)',
                    display: 'inline-block',
                    boxShadow: '0 0 5px var(--accent-green)',
                  }}
                />
                <span style={{ color: 'var(--accent-green)' }}>OPERATIONAL</span>
              </span>
              <span>·</span>
              <span>{SEED_STATS.total} items indexed</span>
              <span>·</span>
              <span>Last sync: 7:00 AM PST</span>
              <span>·</span>
              <span>Next sync: Tomorrow 7:00 AM PST</span>
              <span>·</span>
              <span>{SEED_STATS.sources} sources active</span>
            </span>
          ))}
        </div>
      </div>

      {/* Value proposition */}
      <div style={{ marginBottom: 36 }}>
        <h1
          className="font-syne"
          style={{
            fontWeight: 800,
            fontSize: 'clamp(22px, 3vw, 32px)',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: 8,
          }}
        >
          Discover & master the latest AI coding tools
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text-muted)', maxWidth: 600 }}>
          Daily curated skills, hooks, techniques, and workflows for{' '}
          <span style={{ color: 'var(--accent)' }}>Claude Code</span>,{' '}
          <span style={{ color: 'var(--accent)' }}>Codex CLI</span>, and{' '}
          <span style={{ color: 'var(--accent)' }}>OpenCLAW</span>.
        </p>
      </div>

      {/* Daily Digest hero */}
      <section style={{ marginBottom: 56 }}>
        <DailyDigest digest={displayDigest} featuredItems={featuredItems} />
      </section>

      {/* Section divider */}
      <div style={{ height: 1, background: 'var(--border)', margin: '0 0 48px', opacity: 0.6 }} />

      {/* Recently Added */}
      <section style={{ marginBottom: 56 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <h2
            className="font-mono"
            style={{
              fontSize: 12,
              letterSpacing: '0.10em',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span
              style={{
                width: 20,
                height: 1,
                background: 'var(--text-dim)',
                display: 'inline-block',
              }}
            />
            RECENTLY ADDED
          </h2>
          <Link
            href="/library"
            className="font-mono"
            style={{
              fontSize: 12,
              letterSpacing: '0.06em',
              color: 'var(--accent)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            VIEW ALL
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayItems.map((item, i) => (
            <LibraryCard key={item.id} item={item} index={i} />
          ))}
        </div>
      </section>

      {/* Section divider */}
      <div style={{ height: 1, background: 'var(--border)', margin: '0 0 48px', opacity: 0.6 }} />

      {/* Browse by Category */}
      <section>
        <h2
          className="font-mono"
          style={{
            fontSize: 11,
            letterSpacing: '0.10em',
            color: 'var(--text-muted)',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span
            style={{
              width: 20,
              height: 1,
              background: 'var(--text-dim)',
              display: 'inline-block',
            }}
          />
          BROWSE BY CATEGORY
        </h2>
        <CategoryTiles tiles={tiles} />
      </section>
    </div>
  )
}
