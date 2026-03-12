export default function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div style={{ marginBottom: 32 }}>
        <div style={{ width: 160, height: 24, background: 'var(--surface)', borderRadius: 8, marginBottom: 8 }} />
        <div style={{ width: 280, height: 14, background: 'var(--surface)', borderRadius: 6 }} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: 180,
              borderRadius: 12,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderLeft: '3px solid var(--border)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
