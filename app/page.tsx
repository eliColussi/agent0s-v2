import { getDailyDigest, getFeaturedItems, getRecentItems, getTodaysHeroItem, getCategoryCounts, getStats } from '@/lib/queries'
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
  { value: 'model',          label: 'Models',        color: 'var(--cat-model)',          href: '/library?category=model' },
]

const FEED_EVENTS = [
  { icon: '◆', color: 'var(--cat-skill)', text: 'New Claude Code skill indexed', time: '2m ago' },
  { icon: '●', color: 'var(--accent-green)', text: 'Daily pipeline completed', time: '7:02 AM' },
  { icon: '▲', color: 'var(--cat-model)', text: 'Model release detected', time: '6:45 AM' },
  { icon: '◇', color: 'var(--cat-workflow)', text: 'Workflow pattern catalogued', time: '6:30 AM' },
  { icon: '■', color: 'var(--cat-hook)', text: 'Hook configuration saved', time: '6:15 AM' },
  { icon: '◆', color: 'var(--cat-technique)', text: 'Technique brief generated', time: '6:00 AM' },
  { icon: '●', color: 'var(--accent)', text: 'Perplexity sources scanned', time: '5:58 AM' },
  { icon: '▲', color: 'var(--cat-plugin)', text: 'Plugin integration tested', time: '5:45 AM' },
]

export default async function HomePage() {
  let digest = null
  let recentItems: import('@/types').LibraryItem[] = []
  let heroItem: import('@/types').LibraryItem | null = null
  let featuredItems: import('@/types').LibraryItem[] = []
  let categoryCounts: Record<string, number> = {}
  let totalItems = 0

  try {
    const [d, r, hero, counts, stats] = await Promise.all([
      getDailyDigest().catch(() => null),
      getRecentItems(6).catch(() => []),
      getTodaysHeroItem().catch(() => null),
      getCategoryCounts().catch(() => ({})),
      getStats().catch(() => ({ total: 0 })),
    ])
    digest = d
    recentItems = r
    heroItem = hero
    categoryCounts = counts
    totalItems = stats.total
    if (digest?.featured_item_ids?.length) {
      featuredItems = await getFeaturedItems(digest.featured_item_ids).catch(() => [])
    }
  } catch {
    // fall through
  }

  const useSeed = !digest && recentItems.length === 0
  const displayDigest = digest ?? SEED_DIGEST
  const displayItems = recentItems.length > 0 ? recentItems : SEED_ITEMS.slice(0, 6)
  if (useSeed) {
    featuredItems = SEED_ITEMS.filter(i => SEED_DIGEST.featured_item_ids.includes(i.id)).slice(0, 4)
  }

  const AGENTIC_CATS = ['skill', 'hook', 'prompt', 'plugin']
  const tiles = categoryMeta.map(cat => ({
    ...cat,
    count: cat.value === 'agentic'
      ? AGENTIC_CATS.reduce((sum, c) => sum + (categoryCounts[c] || 0), 0)
      : categoryCounts[cat.value] || 0,
  }))

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 64px' }}>
      {/* System status ticker */}
      <div
        style={{
          overflow: 'hidden',
          borderBottom: '1px solid var(--border-glass)',
          padding: '8px 0',
          marginBottom: 36,
        }}
      >
        <div
          className="ticker-inner font-mono"
          style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em' }}
        >
          {[1, 2].map(n => (
            <span
              key={n}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 24, marginRight: 64 }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: 'var(--accent-green)',
                    display: 'inline-block',
                    boxShadow: '0 0 6px var(--accent-green)',
                    animation: 'pulse 2s ease-in-out infinite',
                  }}
                />
                <span style={{ color: 'var(--accent-green)' }}>OPERATIONAL</span>
              </span>
              <span style={{ opacity: 0.3 }}>·</span>
              <span>{totalItems || SEED_STATS.total} items indexed</span>
              <span style={{ opacity: 0.3 }}>·</span>
              <span>Last sync: 7:00 AM PST</span>
              <span style={{ opacity: 0.3 }}>·</span>
              <span>Next sync: Tomorrow 7:00 AM PST</span>
              <span style={{ opacity: 0.3 }}>·</span>
              <span>2 sources active</span>
            </span>
          ))}
        </div>
      </div>

      {/* Value proposition */}
      <div style={{ marginBottom: 40 }}>
        <h1
          className="font-syne gradient-text"
          style={{
            fontWeight: 800,
            fontSize: 'clamp(24px, 3.5vw, 36px)',
            letterSpacing: '-0.02em',
            marginBottom: 10,
            lineHeight: 1.2,
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
        <DailyDigest
          digest={displayDigest}
          featuredItems={featuredItems}
          heroItem={heroItem}
          totalItems={totalItems}
          isStale={!!digest && digest.date !== new Date().toISOString().split('T')[0]}
        />
      </section>

      {/* Section divider */}
      <div className="section-divider" style={{ marginBottom: 48 }} />

      {/* Recently Added */}
      <section style={{ marginBottom: 56 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}
        >
          <h2
            className="font-mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.12em',
              color: 'var(--text-dim)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span
              style={{
                width: 24,
                height: 1,
                background: 'linear-gradient(90deg, var(--accent), transparent)',
                display: 'inline-block',
              }}
            />
            RECENTLY ADDED
          </h2>
          <Link
            href="/library"
            className="font-mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.06em',
              color: 'var(--accent)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 10px',
              borderRadius: 6,
              background: 'rgba(232,184,75,0.06)',
              border: '1px solid rgba(232,184,75,0.1)',
              transition: 'background 0.15s ease',
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
      <div className="section-divider" style={{ marginBottom: 48 }} />

      {/* Agent Intelligence Feed + Browse by Category — two-column layout */}
      <div className="flex flex-col lg:flex-row gap-8" style={{ alignItems: 'flex-start' }}>
        {/* Agent Intelligence Feed — left */}
        <section
          className="glass"
          style={{
            flex: '1 1 340px',
            padding: 0,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '18px 20px 14px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--accent-green)',
                  display: 'inline-block',
                  boxShadow: '0 0 8px var(--accent-green)',
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              />
              <h2
                className="font-mono"
                style={{
                  fontSize: 11,
                  letterSpacing: '0.12em',
                  color: 'var(--text-muted)',
                }}
              >
                AGENT INTELLIGENCE FEED
              </h2>
            </div>
            <span
              className="font-mono"
              style={{
                fontSize: 10,
                color: 'var(--accent-green)',
                letterSpacing: '0.06em',
                padding: '2px 8px',
                borderRadius: 4,
                background: 'rgba(0,200,150,0.06)',
                border: '1px solid rgba(0,200,150,0.1)',
              }}
            >
              LIVE
            </span>
          </div>

          <div
            style={{
              height: 280,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Fade top */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 20, background: 'linear-gradient(var(--surface), transparent)', zIndex: 2, pointerEvents: 'none' }} />
            {/* Fade bottom */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(transparent, var(--surface))', zIndex: 2, pointerEvents: 'none' }} />

            <div className="feed-scroll" style={{ padding: '8px 0' }}>
              {[...FEED_EVENTS, ...FEED_EVENTS].map((event, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 20px',
                    borderBottom: '1px solid var(--border)',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <span style={{ color: event.color, fontSize: 8, flexShrink: 0, filter: `drop-shadow(0 0 4px ${event.color})` }}>
                    {event.icon}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', flex: 1 }}>
                    {event.text}
                  </span>
                  <span
                    className="font-mono"
                    style={{ fontSize: 10, color: 'var(--text-dim)', flexShrink: 0 }}
                  >
                    {event.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Browse by Category — right */}
        <section style={{ flex: '2 1 500px' }}>
          <h2
            className="font-mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.12em',
              color: 'var(--text-dim)',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span
              style={{
                width: 24,
                height: 1,
                background: 'linear-gradient(90deg, var(--accent), transparent)',
                display: 'inline-block',
              }}
            />
            BROWSE BY CATEGORY
          </h2>
          <CategoryTiles tiles={tiles} />
        </section>
      </div>
    </div>
  )
}
