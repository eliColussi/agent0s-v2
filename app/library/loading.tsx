export default function Loading() {
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 64px' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ width: 240, height: 28, background: 'var(--surface)', borderRadius: 8, marginBottom: 8 }} />
        <div style={{ width: 320, height: 14, background: 'var(--surface)', borderRadius: 6 }} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
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
