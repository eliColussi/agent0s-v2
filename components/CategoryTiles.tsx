import Link from 'next/link'

interface CategoryTile {
  value: string
  label: string
  color: string
  count: number
  href?: string
}

export default function CategoryTiles({ tiles }: { tiles: CategoryTile[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
      {tiles.map((cat, i) => (
        <Link
          key={cat.value}
          href={cat.href || `/library?category=${cat.value}`}
          style={{ textDecoration: 'none' }}
        >
          <div
            className="category-tile glass-border-glow card-enter"
            style={{
              background: 'var(--surface)',
              backdropFilter: 'blur(var(--glass-blur))',
              WebkitBackdropFilter: 'blur(var(--glass-blur))',
              border: '1px solid var(--border-glass)',
              borderLeft: `3px solid ${cat.color}`,
              borderRadius: 12,
              padding: '16px 14px 14px',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              animationDelay: `${i * 40}ms`,
            }}
          >
            {/* Subtle category glow */}
            <div
              style={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: `radial-gradient(circle, color-mix(in srgb, ${cat.color} 8%, transparent) 0%, transparent 70%)`,
                pointerEvents: 'none',
              }}
            />

            <div
              className="font-syne"
              style={{
                fontWeight: 700,
                fontSize: 14,
                color: 'var(--text-primary)',
                marginBottom: 6,
                position: 'relative',
              }}
            >
              {cat.label}
            </div>
            <div
              className="font-mono"
              style={{
                fontSize: 12,
                color: cat.color,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: cat.color,
                  display: 'inline-block',
                  boxShadow: `0 0 6px ${cat.color}`,
                  flexShrink: 0,
                }}
              />
              {cat.count} items
            </div>
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={cat.color} strokeWidth="2.5" style={{ opacity: 0.5 }}>
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
