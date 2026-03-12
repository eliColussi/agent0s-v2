'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'

export default function SearchBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('search') || '')
  const [focused, setFocused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearch = useCallback(
    (term: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (term) {
        params.set('search', term)
      } else {
        params.delete('search')
      }
      params.set('page', '1')
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setValue(val)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => handleSearch(val), 400)
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Magnifier icon */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke={focused ? 'var(--accent)' : 'var(--text-dim)'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          position: 'absolute',
          left: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          transition: 'stroke 0.2s',
        }}
      >
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>

      <input
        type="text"
        className="search-input font-mono"
        placeholder="Search tools, prompts, skills..."
        value={value}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          height: 40,
          paddingLeft: 36,
          paddingRight: 48,
          fontSize: 13,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          color: 'var(--text-primary)',
          outline: 'none',
          transition: 'border-color 0.2s',
        }}
      />

      {/* Keyboard shortcut badge */}
      <span
        className="font-mono"
        style={{
          position: 'absolute',
          right: 10,
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 10,
          color: 'var(--text-dim)',
          background: 'var(--surface-raised)',
          border: '1px solid var(--border)',
          borderRadius: 4,
          padding: '1px 5px',
          letterSpacing: '0.04em',
          pointerEvents: 'none',
        }}
      >
        ⌘K
      </span>
    </div>
  )
}
