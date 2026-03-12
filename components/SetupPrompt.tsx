'use client'
import { useState } from 'react'

interface Item {
  title: string
  category: string
  tool: string
  ai_summary: string | null
  ai_actionable_steps: string[] | null
  code_snippet: string | null
  source_url: string
  source_type: string
}

function buildPrompt(item: Item): string {
  const lines: string[] = []

  // Header
  lines.push(`# Set up: ${item.title}`)
  lines.push('')

  // Summary (first sentence only)
  if (item.ai_summary) {
    const firstSentence = item.ai_summary.split(/(?<=\.)\s/)[0] || item.ai_summary
    lines.push(firstSentence)
    lines.push('')
  }

  // Source URL with context
  const isGitHub = item.source_url?.includes('github.com')
  const isRepoUrl = isGitHub && !item.source_url.includes('/discussions/') && !item.source_url.includes('/issues/')

  if (isRepoUrl) {
    lines.push(`Repository: ${item.source_url}`)
  } else if (item.source_url) {
    lines.push(`Reference: ${item.source_url}`)
  }
  lines.push('')

  // Instructions
  lines.push('## Instructions')
  lines.push('')

  const isAgentic = ['skill', 'hook', 'plugin', 'prompt'].includes(item.category)

  if (isRepoUrl) {
    lines.push('1. Clone or fetch the repository above into the appropriate location for this project.')
  }

  const steps = item.ai_actionable_steps || []
  const startNum = isRepoUrl ? 2 : 1
  steps.forEach((step, i) => {
    lines.push(`${startNum + i}. ${step}`)
  })

  lines.push('')

  // Configuration / code snippet
  if (item.code_snippet) {
    if (item.category === 'prompt' || item.category === 'hook') {
      lines.push('## Configuration to apply:')
    } else if (item.category === 'skill' || item.category === 'plugin') {
      lines.push('## Code to install:')
    } else {
      lines.push('## Code reference:')
    }
    lines.push('')
    lines.push('```')
    lines.push(item.code_snippet)
    lines.push('```')
    lines.push('')
  }

  // Placement context for agentic items
  if (isAgentic) {
    lines.push('## Important')
    lines.push('')
    if (item.category === 'skill') {
      lines.push('Place skill files in the `.claude/skills/` or equivalent directory. Ensure the SKILL.md file is properly formatted.')
    } else if (item.category === 'hook') {
      lines.push('Add hook configuration to `.claude/settings.json` under the appropriate lifecycle event (PreToolUse, PostToolUse, etc.).')
    } else if (item.category === 'plugin') {
      lines.push('Install the plugin using `/plugin install` or manually place the bundle in the `.claude/plugins/` directory.')
    } else if (item.category === 'prompt') {
      lines.push('Save this as a slash command in `.claude/commands/` as a .md file, or add it to your CLAUDE.md for persistent context.')
    }
    lines.push('')
  }

  lines.push('Verify everything works after setup and report back with a summary of what was installed.')

  return lines.join('\n')
}

export default function SetupPrompt({ item }: { item: Item }) {
  const [copied, setCopied] = useState(false)
  const prompt = buildPrompt(item)

  const copy = async () => {
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const toolTarget =
    item.tool === 'claude-code' ? 'Claude Code'
    : item.tool === 'chatgpt-codex' ? 'Codex CLI'
    : 'Claude Code or Codex CLI'

  return (
    <section
      style={{
        background: '#080c16',
        border: '1px solid rgba(6,182,212,0.15)',
        borderLeft: '3px solid rgba(6,182,212,0.5)',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div>
          <h2
            className="font-mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.10em',
              color: 'var(--cat-skill)',
              marginBottom: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            AI SETUP PROMPT
          </h2>
          <p className="font-mono" style={{ fontSize: 11, color: 'var(--text-dim)', margin: 0 }}>
            Paste into {toolTarget} to set up automatically
          </p>
        </div>

        <button
          onClick={copy}
          className="font-mono"
          style={{
            fontSize: 12,
            fontWeight: 600,
            padding: '8px 20px',
            borderRadius: 8,
            border: copied ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(6,182,212,0.35)',
            background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(6,182,212,0.12)',
            color: copied ? '#6ee7b7' : '#67e8f9',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s ease',
            minHeight: 38,
            whiteSpace: 'nowrap',
          }}
        >
          {copied ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
              Copy Prompt
            </>
          )}
        </button>
      </div>

      {/* Prompt preview */}
      <pre
        className="font-mono"
        style={{
          margin: 0,
          padding: '16px 20px',
          fontSize: 12,
          lineHeight: '20px',
          color: '#a5b4c8',
          overflowX: 'auto',
          maxHeight: 280,
          overflowY: 'auto',
          background: 'transparent',
          border: 'none',
          borderRadius: 0,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        <code>{prompt}</code>
      </pre>

      {/* Footer */}
      <div
        className="font-mono"
        style={{
          padding: '8px 20px',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 10,
          color: 'var(--text-dim)',
        }}
      >
        <span>~{prompt.length.toLocaleString()} chars</span>
        <span style={{ color: 'rgba(6,182,212,0.4)' }}>Works with Claude Code & Codex CLI</span>
      </div>
    </section>
  )
}
