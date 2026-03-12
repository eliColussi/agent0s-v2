import { getItemsByCategory } from '@/lib/queries'
import LibraryCard from '@/components/LibraryCard'
import Link from 'next/link'

export const revalidate = 3600

export default async function PluginsPage() {
  const items = await getItemsByCategory('plugin', 24).catch(() => [])
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Plugins</h1>
          <p className="text-white/40">{items.length} extensions and plugins</p>
        </div>
        <Link href="/library?category=plugin" className="text-sm text-violet-400 hover:text-violet-300">View in library →</Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item, i) => <LibraryCard key={item.id} item={item} index={i} />)}
      </div>
      {items.length === 0 && <div className="text-center py-20 text-white/30">No plugins yet — check back after the next scrape</div>}
    </div>
  )
}
