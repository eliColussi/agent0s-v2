import Link from 'next/link'
import { LibraryItem } from '@/types'

const categoryColor: Record<string, string> = {
  prompt:           'var(--cat-prompt)',
  skill:            'var(--cat-skill)',
  hook:             'var(--cat-hook)',
  plugin:           'var(--cat-plugin)',
  technique:        'var(--cat-technique)',
  workflow:         'var(--cat-workflow)',
  'niche-use-case': 'var(--cat-niche-use-case)',
}

const difficultyConfig: Record<string, { color: string; label: string }> = {
  beginner:     { color: 'var(--accent-green)', label: 'Beginner' },
  intermediate: { color: 'var(--accent)',       label: 'Intermediate' },
  advanced:     { color: 'var(--accent-red)',   label: 'Advanced' },
}

const toolLabels: Record<string, string> = {
  'claude-code':    'Claude Code',
  'chatgpt-codex':  'ChatGPT/Codex',
  'openclaw':       'OpenCLAW',
  'general':        'General AI',
}

interface Props {
  item: LibraryItem
  index?: number
}

export default function LibraryCard({ item, index = 0 }: Props) {
  const catColor = categoryColor[item.category] || 'var(--accent)'
  const diff = difficultyConfig[item.difficulty] || difficultyConfig.beginner

  return (
    <div
      className="library-card card-enter"
      style={{
        height: '100%',
        borderRadius: 12,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderLeft: `3px solid ${catColor}`,
        overflow: 'hidden',
        animationDelay: `${index * 40}ms`,
      }}
    >
      <Link
        href={`/library/${item.id}`}
        style={{ display: 'flex', flexDirection: 'column', height: '100%', textDecoration: 'none', padding: '16px 18px 14px' }}
      >
        {/* Top row: category badge + difficulty */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, gap: 8 }}>
          <span
            className="font-mono"
            style={{
              fontSize: 10,
              letterSpacing: '0.08em',
              color: catColor,
              background: `${catColor}18`,
              border: `1px solid ${catColor}30`,
              borderRadius: 4,
              padding: '2px 7px',
              textTransform: 'uppercase',
              fontWeight: 500,
            }}
          >
            {item.category}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: diff.color,
                display: 'inline-block',
                boxShadow: `0 0 4px ${diff.color}`,
                flexShrink: 0,
              }}
            />
            <span
              className="font-mono"
              style={{ fontSize: 10, color: diff.color, letterSpacing: '0.04em', fontWeight: 400 }}
            >
              {diff.label}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3
          className="font-syne"
          style={{
            fontWeight: 600,
            fontSize: 14,
            lineHeight: 1.4,
            color: 'var(--text-primary)',
            marginBottom: 8,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 'none',
          }}
        >
          {item.title}
        </h3>

        {/* Summary */}
        {item.ai_summary && (
          <p
            style={{
              fontSize: 12,
              lineHeight: 1.6,
              color: 'var(--text-muted)',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              flex: 1,
              marginBottom: 12,
            }}
          >
            {item.ai_summary}
          </p>
        )}

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 10,
            borderTop: '1px solid var(--border)',
            marginTop: 'auto',
          }}
        >
          <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.04em' }}>
            {toolLabels[item.tool] || item.tool}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 4 }}>
              {item.source_type === 'github' ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              ) : (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.14 19.018c-3.868 0-7-3.14-7-7.018 0-3.878 3.132-7.018 7-7.018 1.89 0 3.47.697 4.682 1.829l-1.974 1.978v-.004c-.735-.702-1.667-1.062-2.708-1.062-2.31 0-4.187 1.956-4.187 4.273 0 2.315 1.877 4.277 4.187 4.277 2.096 0 3.522-1.202 3.816-2.852H12.14v-2.737h6.585c.088.47.135.96.135 1.474 0 4.01-2.677 6.86-6.72 6.86z"/>
                </svg>
              )}
              <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                {item.source_type === 'github' ? 'GitHub' : 'Web'}
              </span>
            </span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </div>
      </Link>
    </div>
  )
}
