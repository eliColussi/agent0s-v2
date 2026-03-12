import { DailyDigest as DigestType, LibraryItem } from '@/types'
import { SEED_STATS } from '@/lib/seed-data'

interface Props {
  digest: DigestType | null
  featuredItems: LibraryItem[]
}

export default function DailyDigest({ digest, featuredItems }: Props) {
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
      className="card-enter"
      style={{
        borderRadius: 16,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderLeft: '4px solid var(--accent)',
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
              fontSize: 11,
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
              fontWeight: 800,
              fontSize: 'clamp(22px, 4vw, 40px)',
              lineHeight: 1.15,
              color: 'var(--text-primary)',
              marginBottom: 16,
            }}
          >
            {headline}
          </h1>

          {/* Intro */}
          <p
            style={{
              fontSize: 15,
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
                    fontSize: 10,
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

        {/* Right side — decorative grid of featured item previews */}
        {featuredItems.length > 0 && (
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
                  style={{ fontSize: 9, letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: 4, textTransform: 'uppercase' }}
                >
                  {item.category}
                </div>
                <div
                  style={{
                    fontSize: 11,
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
        )}
      </div>
    </div>
  )
}
