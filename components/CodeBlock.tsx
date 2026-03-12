'use client'
import { useState } from 'react'

interface Props {
  code: string
  language?: string
}

export default function CodeBlock({ code, language = 'bash' }: Props) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      style={{
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.08)',
        overflow: 'hidden',
        background: '#070a12',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          background: '#0a0e18',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <span className="font-mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em' }}>
          {language}
        </span>
        <button
          onClick={copy}
          aria-label={copied ? 'Code copied to clipboard' : 'Copy code to clipboard'}
          className="font-mono"
          style={{
            fontSize: 11,
            padding: '6px 14px',
            borderRadius: 6,
            border: copied ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(6,182,212,0.25)',
            background: copied ? 'rgba(16,185,129,0.12)' : 'rgba(6,182,212,0.1)',
            color: copied ? '#6ee7b7' : '#67e8f9',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.15s ease',
            minHeight: 36,
          }}
        >
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      {/* Code */}
      <pre
        style={{
          margin: 0,
          padding: '16px 20px',
          fontSize: 13,
          lineHeight: '22px',
          color: '#6ee7b7',
          fontFamily: 'var(--font-mono), monospace',
          overflowX: 'auto',
          background: 'transparent',
          border: 'none',
          borderRadius: 0,
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  )
}
