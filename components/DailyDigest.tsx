import { DailyDigest as DigestType, LibraryItem } from '@/types'
import { SEED_STATS } from '@/lib/seed-data'
import Link from 'next/link'

const categoryColor: Record<string, string> = {
  prompt:           'var(--cat-prompt)',
  skill:            'var(--cat-skill)',
  hook:             'var(--cat-hook)',
  plugin:           'var(--cat-plugin)',
  technique:        'var(--cat-technique)',
  workflow:         'var(--cat-workflow)',
  'niche-use-case': 'var(--cat-niche-use-case)',
  model:            'var(--cat-model)',
}

interface Props {
  digest: DigestType | null
  featuredItems: LibraryItem[]
  heroItem?: LibraryItem | null
  totalItems?: number
}

export default function DailyDigest({ digest, featuredItems, heroItem, totalItems }: Props) {
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

  const heroCatColor = heroItem ? (categoryColor[heroItem.category] || 'var(--accent)') : 'var(--accent)'

  return (
    <div
      className="card-enter glass-heavy"
      style={{
        padding: 0,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Ambient glow orbs */}
      <div
        style={{
          position: 'absolute',
          top: -80,
          left: -80,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,184,75,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -60,
          right: -60,
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap', position: 'relative' }}>
        {/* Left side — editorial content */}
        <div style={{ flex: '3 1 340px', minWidth: 0, padding: '36px 36px 36px 32px' }}>
          {/* Edition label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div
              className="font-mono"
              style={{
                fontSize: 10,
                letterSpacing: '0.14em',
                color: 'var(--accent)',
                padding: '4px 12px',
                borderRadius: 6,
                background: 'rgba(232,184,75,0.08)',
                border: '1px solid rgba(232,184,75,0.15)',
                textTransform: 'uppercase',
              }}
            >
              Daily Briefing
            </div>
            <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.06em' }}>
              {dateStr.toUpperCase()}
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-syne"
            style={{
              fontWeight: 700,
              fontSize: 'clamp(26px, 3.5vw, 40px)',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              marginBottom: 18,
            }}
          >
            {headline}
          </h1>

          {/* Intro */}
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.7,
              color: 'var(--text-muted)',
              marginBottom: 32,
              maxWidth: 540,
            }}
          >
            {intro}
          </p>

          {/* Stats row */}
          <div
            style={{
              display: 'flex',
              gap: 0,
              borderTop: '1px solid var(--border)',
              paddingTop: 20,
            }}
          >
            {[
              { label: 'NEW TODAY', value: `${digest?.total_new_items ?? SEED_STATS.today}` },
              { label: 'TOTAL INDEXED', value: (totalItems || SEED_STATS.total).toLocaleString() },
              { label: 'SOURCES', value: '2' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                style={{
                  flex: 1,
                  paddingRight: 16,
                  borderRight: i < 2 ? '1px solid var(--border)' : 'none',
                  paddingLeft: i > 0 ? 16 : 0,
                }}
              >
                <div
                  className="font-mono"
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.12em',
                    color: 'var(--text-dim)',
                    marginBottom: 6,
                  }}
                >
                  {stat.label}
                </div>
                <div
                  className="font-mono"
                  style={{
                    fontSize: 26,
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
              flex: '2 1 280px',
              maxWidth: 400,
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              borderLeft: '1px solid var(--border)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Category-colored top accent */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: `linear-gradient(90deg, ${heroCatColor}, transparent)`,
              }}
            />

            {/* Background glow */}
            <div
              style={{
                position: 'absolute',
                top: -40,
                right: -40,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: `radial-gradient(circle, color-mix(in srgb, ${heroCatColor} 10%, transparent) 0%, transparent 70%)`,
                pointerEvents: 'none',
              }}
            />

            <div style={{ padding: '36px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div
                className="font-mono"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  color: 'var(--accent)',
                  marginBottom: 14,
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    display: 'inline-block',
                    boxShadow: '0 0 8px var(--accent)',
                    animation: 'pulse 2s ease-in-out infinite',
                  }}
                />
                Today&apos;s Top Pick
              </div>

              <div
                className="font-mono"
                style={{
                  display: 'inline-block',
                  fontSize: 10,
                  letterSpacing: '0.08em',
                  color: heroCatColor,
                  background: `color-mix(in srgb, ${heroCatColor} 10%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${heroCatColor} 20%, transparent)`,
                  padding: '3px 10px',
                  borderRadius: 6,
                  marginBottom: 14,
                  textTransform: 'uppercase',
                  width: 'fit-content',
                }}
              >
                {heroItem.category}
              </div>

              <div
                className="font-syne"
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  lineHeight: 1.25,
                  marginBottom: 12,
                }}
              >
                {heroItem.title}
              </div>

              {heroItem.ai_summary && (
                <p
                  style={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: 'var(--text-muted)',
                    marginBottom: 16,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    flex: 1,
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
                  gap: 6,
                  marginTop: 'auto',
                }}
              >
                EXPLORE
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ) : featuredItems.length > 0 ? (
          <div
            style={{
              flex: '2 1 240px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 1,
              alignContent: 'stretch',
              maxWidth: 380,
              borderLeft: '1px solid var(--border)',
              background: 'var(--border)',
            }}
          >
            {featuredItems.slice(0, 4).map((item, i) => {
              const catColor = categoryColor[item.category] || 'var(--accent)'
              return (
                <Link
                  key={item.id}
                  href={`/library/${item.id}`}
                  className="card-enter"
                  style={{
                    background: 'var(--surface)',
                    padding: '18px 16px',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    animationDelay: `${100 + i * 60}ms`,
                  }}
                >
                  <div
                    className="font-mono"
                    style={{
                      fontSize: 9,
                      letterSpacing: '0.10em',
                      color: catColor,
                      textTransform: 'uppercase',
                    }}
                  >
                    {item.category}
                  </div>
                  <div
                    className="font-syne"
                    style={{
                      fontSize: 13,
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
                </Link>
              )
            })}
          </div>
        ) : null}
      </div>
    </div>
  )
}
