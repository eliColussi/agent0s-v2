'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

const subcategories = [
  { value: 'all', label: 'All' },
  { value: 'skill', label: 'Skills', desc: 'Auto-loaded capabilities (SKILL.md)' },
  { value: 'prompt', label: 'Commands', desc: 'Slash command prompt templates' },
  { value: 'hook', label: 'Hooks', desc: 'Lifecycle automation triggers' },
  { value: 'plugin', label: 'Plugins', desc: 'Bundled extension packages' },
]

const tools = [
  { value: 'all', label: 'All Tools' },
  { value: 'claude-code', label: 'Claude Code' },
  { value: 'chatgpt-codex', label: 'Codex CLI' },
  { value: 'openclaw', label: 'OpenCLAW' },
]

export default function AgenticFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeSub = searchParams.get('sub') || 'all'
  const activeTool = searchParams.get('tool') || 'all'

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Tool toggle */}
      <div style={{ display: 'flex', gap: 6 }}>
        {tools.map(t => {
          const active = activeTool === t.value
          return (
            <button
              key={t.value}
              onClick={() => setParam('tool', t.value)}
              className="font-mono"
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 13,
                letterSpacing: '0.04em',
                fontWeight: 500,
                cursor: 'pointer',
                border: active ? 'none' : '1px solid var(--border)',
                background: active ? 'var(--accent)' : 'transparent',
                color: active ? '#0e1520' : 'var(--text-muted)',
                transition: 'all 0.15s ease',
              }}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Subcategory tabs */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {subcategories.map(s => {
          const active = activeSub === s.value
          return (
            <button
              key={s.value}
              onClick={() => setParam('sub', s.value)}
              className="font-mono"
              title={s.desc}
              style={{
                padding: '5px 12px',
                borderRadius: 6,
                fontSize: 12,
                letterSpacing: '0.04em',
                fontWeight: 500,
                cursor: 'pointer',
                border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
                background: active ? 'rgba(232,184,75,0.12)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--text-muted)',
                transition: 'all 0.15s ease',
              }}
            >
              {s.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
