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
    <div className="relative group rounded-xl border border-violet-500/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0d0d15] border-b border-white/5">
        <span className="text-xs text-white/30 font-mono">{language}</span>
        <button
          onClick={copy}
          className="text-xs text-white/30 hover:text-white/70 transition-colors flex items-center gap-1.5"
        >
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      {/* Code */}
      <pre className="p-4 text-xs text-green-300/90 font-mono leading-relaxed overflow-x-auto !border-0 !rounded-none">
        <code>{code}</code>
      </pre>
    </div>
  )
}
