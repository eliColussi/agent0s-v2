import { getItemById } from '@/lib/queries'
import CodeBlock from '@/components/CodeBlock'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSeedItemById } from '@/lib/seed-data'

export const revalidate = 3600

const categoryColor: Record<string, string> = {
  prompt:    'var(--cat-prompt)',
  skill:     'var(--cat-skill)',
  hook:      'var(--cat-hook)',
  plugin:    'var(--cat-plugin)',
  technique: 'var(--cat-technique)',
  workflow:  'var(--cat-workflow)',
}

const difficultyColor: Record<string, string> = {
  beginner:     'var(--accent-green)',
  intermediate: 'var(--accent)',
  advanced:     'var(--accent-red)',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function ItemDetailPage({ params }: Props) {
  const { id } = await params

  let item = null
  try {
    item = await getItemById(id)
  } catch {
    item = getSeedItemById(id) ?? null
  }

  if (!item) notFound()

  const catColor = categoryColor[item.category] || 'var(--accent)'
  const diffColor = difficultyColor[item.difficulty] || 'var(--accent)'

  const toolLabel =
    item.tool === 'claude-code' ? 'Claude Code'
    : item.tool === 'chatgpt-codex' ? 'ChatGPT/Codex'
    : 'General AI'

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px 80px' }}>
      {/* Breadcrumb */}
      <div
        className="font-mono"
        style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-dim)', marginBottom: 28 }}
      >
        <Link href="/library" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
          Library
        </Link>
        <span>/</span>
        <span style={{ color: catColor, textTransform: 'capitalize' }}>{item.category}</span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        {/* Badges row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          <span
            className="font-mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.08em',
              color: catColor,
              background: `${catColor}18`,
              border: `1px solid ${catColor}35`,
              borderRadius: 5,
              padding: '3px 10px',
              textTransform: 'uppercase',
            }}
          >
            {item.category}
          </span>
          <span
            className="font-mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.06em',
              color: diffColor,
              background: `${diffColor}15`,
              border: `1px solid ${diffColor}30`,
              borderRadius: 5,
              padding: '3px 10px',
              textTransform: 'capitalize',
            }}
          >
            {item.difficulty}
          </span>
          <span
            className="font-mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.06em',
              color: 'var(--text-muted)',
              background: 'var(--surface-raised)',
              border: '1px solid var(--border)',
              borderRadius: 5,
              padding: '3px 10px',
            }}
          >
            {toolLabel}
          </span>
          {item.is_featured && (
            <span
              className="font-mono"
              style={{
                fontSize: 11,
                letterSpacing: '0.06em',
                color: 'var(--accent)',
                background: 'rgba(232,184,75,0.12)',
                border: '1px solid rgba(232,184,75,0.3)',
                borderRadius: 5,
                padding: '3px 10px',
              }}
            >
              ★ Featured
            </span>
          )}
        </div>

        {/* Title */}
        <h1
          className="font-syne"
          style={{
            fontWeight: 700,
            fontSize: 'clamp(20px, 3.5vw, 30px)',
            lineHeight: 1.25,
            color: 'var(--text-primary)',
            marginBottom: 14,
          }}
        >
          {item.title}
        </h1>

        {/* Summary */}
        {item.ai_summary && (
          <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--text-muted)' }}>
            {item.ai_summary}
          </p>
        )}
      </div>

      {/* Content sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* 1. Mission Objectives */}
        {item.ai_actionable_steps?.length ? (
          <section
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '20px 22px',
            }}
          >
            <h2
              className="font-mono"
              style={{
                fontSize: 11,
                letterSpacing: '0.10em',
                color: 'var(--accent)',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              MISSION OBJECTIVES
            </h2>
            <ol style={{ display: 'flex', flexDirection: 'column', gap: 12, listStyle: 'none', padding: 0 }}>
              {item.ai_actionable_steps.map((step, i) => (
                <li key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span
                    className="font-mono"
                    style={{
                      flexShrink: 0,
                      minWidth: 24,
                      height: 24,
                      borderRadius: 6,
                      background: 'rgba(232,184,75,0.15)',
                      color: 'var(--accent)',
                      fontSize: 12,
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 1,
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-muted)' }}>{step}</span>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {/* 2. Code Intelligence */}
        {item.code_snippet && (
          <section>
            <h2
              className="font-mono"
              style={{
                fontSize: 11,
                letterSpacing: '0.10em',
                color: 'var(--text-muted)',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--cat-skill)" strokeWidth="2">
                <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
              </svg>
              CODE INTELLIGENCE
            </h2>
            <CodeBlock code={item.code_snippet} />
          </section>
        )}

        {/* 3. Field Operations */}
        {item.ai_project_ideas?.length ? (
          <section>
            <h2
              className="font-mono"
              style={{
                fontSize: 11,
                letterSpacing: '0.10em',
                color: 'var(--text-muted)',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--cat-hook)" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
              </svg>
              FIELD OPERATIONS
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {item.ai_project_ideas.map((idea, i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: '14px 16px',
                  }}
                >
                  <h3
                    className="font-syne"
                    style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 6 }}
                  >
                    {idea.title}
                  </h3>
                  <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--text-muted)' }}>{idea.description}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* 4. Strategic Applications */}
        {item.ai_business_use_cases?.length ? (
          <section
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderLeft: '3px solid var(--cat-skill)',
              borderRadius: 12,
              padding: '20px 22px',
            }}
          >
            <h2
              className="font-mono"
              style={{
                fontSize: 11,
                letterSpacing: '0.10em',
                color: 'var(--cat-skill)',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
              </svg>
              STRATEGIC APPLICATIONS
            </h2>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 0, listStyle: 'none' }}>
              {item.ai_business_use_cases.map((uc, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--cat-skill)', marginTop: 2, flexShrink: 0 }}>→</span>
                  {uc}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* Tags */}
        {item.tags?.length ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {item.tags.map(tag => (
              <span
                key={tag}
                className="font-mono"
                style={{
                  fontSize: 11,
                  letterSpacing: '0.04em',
                  padding: '3px 9px',
                  borderRadius: 5,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-dim)',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}

        {/* Source footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 16,
            borderTop: '1px solid var(--border)',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.04em' }}>
            Source: {item.source_type.toUpperCase()}
            {item.quality_score != null && ` · Quality score: ${item.quality_score}/10`}
          </div>
          <a
            href={item.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.06em',
              color: 'var(--accent)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            VIEW SOURCE
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}
