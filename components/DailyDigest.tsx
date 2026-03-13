import { DailyDigest as DigestType, LibraryItem } from '@/types'
import { SEED_STATS } from '@/lib/seed-data'
import Link from 'next/link'

interface Props {
  digest: DigestType | null
  featuredItems: LibraryItem[]
  heroItem?: LibraryItem | null
}

export default function DailyDigest({ digest, featuredItems, heroItem }: Props) {
  const dateStr = digest?.date
    ? new Date(digest.date + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })

  const headline = digest?.headline ?? 'Intelligence Library Online — Awaiting First Sync'
  const intro =
    digest?.intro_paragraph ??
    'The daily scraper runs at 7am PST. Once configured, new AI tools, prompts, and techniques will appear here automatically every morning.'

  return (
    <div
      className="card-enter shimmer-border-left"
      style={{
        borderRadius: 16,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderLeft: '4px solid transparent',
        padding: '32px 32px 32px 28px',
        marginBottom: 0,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Subtle gold glow top-left */}
      <div
        style={{
          position: 'absolute',
          top: -60,
          left: -60,
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,184,75,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', position: 'relative' }}>
        {/* Left side — 60% */}
        <div style={{ flex: '3 1 300px', minWidth: 0 }}>
          {/* Label */}
          <div
            className="font-mono"
            style={{
              fontSize: 12,
              letterSpacing: '0.10em',
              color: 'var(--accent)',
              marginBottom: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--accent)',
                display: 'inline-block',
                boxShadow: '0 0 6px var(--accent)',
              }}
            />
            MISSION BRIEFING · {dateStr.toUpperCase()}
          </div>

          {/* Headline */}
          <h1
            className="font-syne"
            style={{
              fontWeight: 700,
              fontSize: 'clamp(24px, 3.5vw, 38px)',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              marginBottom: 16,
            }}
          >
            {headline}
          </h1>

          {/* Intro */}
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.65,
              color: 'var(--text-muted)',
              marginBottom: 28,
              maxWidth: 560,
            }}
          >
            {intro}
          </p>

          {/* Stat counters */}
          <div
            style={{
              display: 'flex',
              gap: 28,
              flexWrap: 'nowrap',
              overflowX: 'auto',
              paddingBottom: 4,
            }}
          >
            {[
              { label: 'NEW TODAY', value: `${digest?.total_new_items ?? SEED_STATS.today}` },
              { label: 'TOTAL', value: SEED_STATS.total.toLocaleString() },
              { label: 'SOURCES', value: `${SEED_STATS.sources}` },
            ].map(stat => (
              <div key={stat.label} style={{ flexShrink: 0 }}>
                <div
                  className="font-mono"
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.10em',
                    color: 'var(--accent)',
                    marginBottom: 4,
                  }}
                >
                  {stat.label}
                </div>
                <div
                  className="font-mono"
                  style={{
                    fontSize: 28,
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side — hero spotlight or featured grid */}
        {heroItem ? (
          <Link
            href={`/library/${heroItem.id}`}
            className="card-enter"
            style={{
              flex: '2 1 260px',
              maxWidth: 380,
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
            }}
          >
            <div
              style={{
                background: 'var(--surface-raised)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                borderLeft: `4px solid var(--cat-${heroItem.category})`,
                padding: '24px 22px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Glow accent */}
              <div
                style={{
                  position: 'absolute',
                  top: -40,
                  right: -40,
                  width: 160,
                  height: 160,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, color-mix(in srgb, var(--cat-${heroItem.category}) 12%, transparent) 0%, transparent 70%)`,
                  pointerEvents: 'none',
                }}
              />

              <div
                className="font-mono"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  color: 'var(--accent)',
                  marginBottom: 6,
                  textTransform: 'uppercase',
                }}
              >
                TODAY&apos;S TOP PICK
              </div>

              <div
                className="font-mono"
                style={{
                  display: 'inline-block',
                  fontSize: 10,
                  letterSpacing: '0.08em',
                  color: `var(--cat-${heroItem.category})`,
                  background: `color-mix(in srgb, var(--cat-${heroItem.category}) 12%, transparent)`,
                  padding: '3px 8px',
                  borderRadius: 4,
                  marginBottom: 12,
                  textTransform: 'uppercase',
                }}
              >
                {heroItem.category}
              </div>

              <div
                className="font-syne"
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  lineHeight: 1.3,
                  marginBottom: 10,
                }}
              >
                {heroItem.title}
              </div>

              {heroItem.ai_summary && (
                <p
                  style={{
                    fontSize: 13,
                    lineHeight: 1.55,
                    color: 'var(--text-muted)',
                    marginBottom: 14,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {heroItem.ai_summary}
                </p>
              )}

              <div
                className="font-mono"
                style={{
                  fontSize: 11,
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                EXPLORE
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ) : featuredItems.length > 0 ? (
          <div
            style={{
              flex: '2 1 220px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
              alignContent: 'start',
              maxWidth: 320,
            }}
          >
            {featuredItems.slice(0, 4).map((item, i) => (
              <div
                key={item.id}
                className="card-enter"
                style={{
                  background: 'var(--surface-raised)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  borderLeft: `3px solid var(--cat-${item.category})`,
                  overflow: 'hidden',
                  animationDelay: `${100 + i * 60}ms`,
                }}
              >
                <div
                  className="font-mono"
                  style={{ fontSize: 10, letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: 4, textTransform: 'uppercase' }}
                >
                  {item.category}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    lineHeight: 1.35,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {item.title}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
