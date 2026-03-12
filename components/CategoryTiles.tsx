import Link from 'next/link'

interface CategoryTile {
  value: string
  label: string
  color: string
  count: number
}

export default function CategoryTiles({ tiles }: { tiles: CategoryTile[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {tiles.map(cat => (
        <Link key={cat.value} href={`/library?category=${cat.value}`} style={{ textDecoration: 'none' }}>
          <div
            className="category-tile"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderLeft: `3px solid ${cat.color}`,
              borderRadius: 10,
              padding: '14px 14px 12px',
              cursor: 'pointer',
            }}
          >
            <div
              className="font-syne"
              style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 6 }}
            >
              {cat.label}
            </div>
            <div className="font-mono" style={{ fontSize: 11, color: cat.color }}>
              {cat.count} items
            </div>
            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={cat.color} strokeWidth="2.5" style={{ opacity: 0.7 }}>
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
