'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

const categories = [
  { value: 'all', label: 'All' },
  { value: 'prompt', label: 'Prompts' },
  { value: 'skill', label: 'Skills' },
  { value: 'hook', label: 'Hooks' },
  { value: 'plugin', label: 'Plugins' },
  { value: 'technique', label: 'Techniques' },
  { value: 'workflow', label: 'Workflows' },
  { value: 'niche-use-case', label: 'Niche Uses' },
]

const difficulties = [
  { value: 'all', label: 'All levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

const tools = [
  { value: 'all', label: 'All tools' },
  { value: 'claude-code', label: 'Claude Code' },
  { value: 'chatgpt-codex', label: 'ChatGPT/Codex' },
  { value: 'openclaw', label: 'OpenCLAW' },
  { value: 'general', label: 'General AI' },
]

export default function CategoryFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeCategory = searchParams.get('category') || 'all'
  const activeDifficulty = searchParams.get('difficulty') || 'all'
  const activeTool = searchParams.get('tool') || 'all'

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  const selectStyle = {
    height: 36,
    paddingLeft: 10,
    paddingRight: 10,
    fontSize: 13,
    borderRadius: 7,
    cursor: 'pointer',
    fontFamily: 'var(--font-mono), monospace',
    letterSpacing: '0.02em',
  } as React.CSSProperties

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Row 1: Category pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {categories.map(cat => {
          const active = activeCategory === cat.value
          return (
            <button
              key={cat.value}
              onClick={() => setParam('category', cat.value)}
              className="font-mono"
              style={{
                padding: '5px 12px',
                borderRadius: 6,
                fontSize: 12,
                letterSpacing: '0.04em',
                fontWeight: 500,
                cursor: 'pointer',
                border: active ? 'none' : '1px solid var(--border)',
                background: active ? 'var(--accent)' : 'transparent',
                color: active ? '#0e1520' : 'var(--text-muted)',
                transition: 'border-color 0.15s, background 0.15s, color 0.15s',
              }}
            >
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Row 2: Selects */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <select
          value={activeDifficulty}
          onChange={e => setParam('difficulty', e.target.value)}
          style={selectStyle}
        >
          {difficulties.map(d => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
        <select
          value={activeTool}
          onChange={e => setParam('tool', e.target.value)}
          style={selectStyle}
        >
          {tools.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
