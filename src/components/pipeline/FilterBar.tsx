import { Search, X, LayoutGrid, Table2 } from 'lucide-react'
import type { ContentType, Platform } from '@/types'
import { useContentStore } from '@/store/contentStore'
import { CONTENT_TYPE_LABELS, PLATFORM_LABELS, SELECTABLE_PLATFORMS } from '@/lib/constants'
import { Button } from '@/components/ui/Button'

const CONTENT_TYPE_OPTIONS = [
  { value: '', label: 'All Formats' },
  ...Object.entries(CONTENT_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l })),
]

const PLATFORM_OPTIONS = [
  { value: '', label: 'All Platforms' },
  ...SELECTABLE_PLATFORMS.map((p) => ({ value: p, label: PLATFORM_LABELS[p] })),
]

interface Props {
  view: 'kanban' | 'table'
  onViewChange: (v: 'kanban' | 'table') => void
}

export function FilterBar({ view, onViewChange }: Props) {
  const { filters, setFilter, resetFilters } = useContentStore()
  const hasFilters = filters.search || filters.contentType || filters.platform

  return (
    <div
      className="flex flex-wrap items-center gap-2 px-4 md:px-6 py-3 border-b border-white/[0.06] shrink-0"
      style={{ backgroundColor: '#13151f' }}
    >
      {/* View toggle */}
      <div className="flex items-center gap-1 p-0.5 bg-white/[0.04] border border-white/[0.06] rounded-lg mr-2">
        <button
          onClick={() => onViewChange('kanban')}
          className={`p-1.5 rounded-md transition-all ${view === 'kanban' ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'text-white/30 hover:text-white/60'}`}
          title="Kanban view"
        >
          <LayoutGrid size={14} />
        </button>
        <button
          onClick={() => onViewChange('table')}
          className={`p-1.5 rounded-md transition-all ${view === 'table' ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'text-white/30 hover:text-white/60'}`}
          title="Table view"
        >
          <Table2 size={14} />
        </button>
      </div>

      {/* Search */}
      <div className="relative flex-1 min-w-40 max-w-56">
        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
          placeholder="Search posts..."
          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/70 placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#22c55e]/40 transition-all"
        />
      </div>

      {/* Format filter */}
      <select
        value={filters.contentType ?? ''}
        onChange={(e) => setFilter('contentType', (e.target.value as ContentType) || null)}
        className="px-3 py-1.5 text-xs rounded-lg border border-white/[0.08] bg-[#13151f] text-white/50 focus:outline-none focus:ring-1 focus:ring-[#22c55e]/40 cursor-pointer"
      >
        {CONTENT_TYPE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Platform filter */}
      <select
        value={filters.platform ?? ''}
        onChange={(e) => setFilter('platform', (e.target.value as Platform) || null)}
        className="px-3 py-1.5 text-xs rounded-lg border border-white/[0.08] bg-[#13151f] text-white/50 focus:outline-none focus:ring-1 focus:ring-[#22c55e]/40 cursor-pointer"
      >
        {PLATFORM_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {hasFilters && (
        <Button size="sm" variant="ghost" onClick={resetFilters} icon={<X size={11} />}>
          Clear
        </Button>
      )}

      <span className="ml-auto text-[11px] text-white/25">
        {useContentStore.getState().filteredCards().length} posts
      </span>
    </div>
  )
}
