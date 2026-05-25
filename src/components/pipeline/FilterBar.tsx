import { useRef, useState, useEffect } from 'react'
import { Search, X, LayoutGrid, Table2, ChevronDown, Check } from 'lucide-react'
import type { ContentType, Platform, ContentStatus } from '@/types'
import { useContentStore } from '@/store/contentStore'
import { useTeamStore } from '@/store/teamStore'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import {
  CONTENT_TYPE_LABELS, PLATFORM_LABELS, SELECTABLE_PLATFORMS,
  STATUS_LABELS, STATUS_COLORS, STATUS_ORDER,
} from '@/lib/constants'

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

function FilterChip({ label, active, color, onClick }: { label: string; active: boolean; color?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all whitespace-nowrap"
      style={{
        backgroundColor: active ? `${color ?? '#22c55e'}20` : 'transparent',
        borderColor: active ? `${color ?? '#22c55e'}50` : 'rgba(255,255,255,0.08)',
        color: active ? (color ?? '#22c55e') : 'rgba(255,255,255,0.35)',
      }}
    >
      {label}
    </button>
  )
}

function AssigneeDropdown({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState<{ id: string; full_name: string | null; email: string }[]>([])
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.from('profiles').select('id,full_name,email').then(({ data }) => {
      if (data) setUsers(data)
    })
  }, [])

  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const current = users.find((u) => u.id === value)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-white/[0.08] bg-[#13151f] text-white/50 hover:text-white/70 focus:outline-none focus:ring-1 focus:ring-[#22c55e]/40 transition-all whitespace-nowrap"
      >
        {current ? (current.full_name ?? current.email) : 'Assignee'}
        <ChevronDown size={10} className={`text-white/25 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          className="absolute top-full mt-1 left-0 min-w-44 rounded-xl border border-white/[0.1] overflow-hidden z-40 shadow-xl"
          style={{ backgroundColor: '#0f1117' }}
        >
          <button
            onClick={() => { onChange(null); setOpen(false) }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/50 hover:bg-white/[0.05] text-left"
          >
            All Assignees
            {!value && <Check size={10} className="ml-auto text-[#22c55e]" />}
          </button>
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => { onChange(u.id); setOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/60 hover:bg-white/[0.05] text-left"
            >
              <span className="flex-1 truncate">{u.full_name ?? u.email}</span>
              {value === u.id && <Check size={10} className="text-[#22c55e] shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function FilterBar({ view, onViewChange }: Props) {
  const { filters, setFilter, resetFilters, filteredCards } = useContentStore()
  const { teams, isAllTeamsView } = useTeamStore()
  const profile = useAuthStore((s) => s.profile)
  const isAdmin = profile?.role === 'admin' || profile?.role === 'manager'

  const hasFilters = !!(filters.search || filters.contentType || filters.platform ||
    filters.status || filters.teamId || filters.dateFrom || filters.dateTo || filters.ownerId)

  return (
    <div
      className="flex flex-col gap-2 px-4 md:px-6 py-3 border-b border-white/[0.06] shrink-0"
      style={{ backgroundColor: '#13151f' }}
    >
      {/* Row 1: view + search + format + platform + assignee + clear */}
      <div className="flex flex-wrap items-center gap-2">
        {/* View toggle */}
        <div className="flex items-center gap-1 p-0.5 bg-white/[0.04] border border-white/[0.06] rounded-lg">
          <button
            onClick={() => onViewChange('kanban')}
            className={`p-1.5 rounded-md transition-all ${view === 'kanban' ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'text-white/30 hover:text-white/60'}`}
            title="Kanban"
          >
            <LayoutGrid size={14} />
          </button>
          <button
            onClick={() => onViewChange('table')}
            className={`p-1.5 rounded-md transition-all ${view === 'table' ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'text-white/30 hover:text-white/60'}`}
            title="Table"
          >
            <Table2 size={14} />
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-36 max-w-52">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            placeholder="Search posts..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/70 placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#22c55e]/40 transition-all"
          />
          {filters.search && (
            <button onClick={() => setFilter('search', '')} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60">
              <X size={11} />
            </button>
          )}
        </div>

        {/* Format */}
        <select
          value={filters.contentType ?? ''}
          onChange={(e) => setFilter('contentType', (e.target.value as ContentType) || null)}
          className="px-3 py-1.5 text-xs rounded-lg border border-white/[0.08] bg-[#13151f] text-white/50 focus:outline-none focus:ring-1 focus:ring-[#22c55e]/40 cursor-pointer"
        >
          {CONTENT_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Platform */}
        <select
          value={filters.platform ?? ''}
          onChange={(e) => setFilter('platform', (e.target.value as Platform) || null)}
          className="px-3 py-1.5 text-xs rounded-lg border border-white/[0.08] bg-[#13151f] text-white/50 focus:outline-none focus:ring-1 focus:ring-[#22c55e]/40 cursor-pointer"
        >
          {PLATFORM_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Assignee */}
        {isAdmin && (
          <AssigneeDropdown
            value={filters.ownerId ?? null}
            onChange={(v) => setFilter('ownerId', v)}
          />
        )}

        {/* Date range */}
        <input
          type="date"
          value={filters.dateFrom ?? ''}
          onChange={(e) => setFilter('dateFrom', e.target.value || null)}
          title="Post date from"
          className="px-2.5 py-1.5 text-xs rounded-lg border border-white/[0.08] bg-[#13151f] text-white/40 focus:outline-none focus:ring-1 focus:ring-[#22c55e]/40 cursor-pointer w-32"
        />
        <span className="text-white/20 text-xs">–</span>
        <input
          type="date"
          value={filters.dateTo ?? ''}
          onChange={(e) => setFilter('dateTo', e.target.value || null)}
          title="Post date to"
          className="px-2.5 py-1.5 text-xs rounded-lg border border-white/[0.08] bg-[#13151f] text-white/40 focus:outline-none focus:ring-1 focus:ring-[#22c55e]/40 cursor-pointer w-32"
        />

        {hasFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors ml-1"
          >
            <X size={11} /> Clear
          </button>
        )}

        <span className="ml-auto text-[11px] text-white/25 whitespace-nowrap">
          {filteredCards().length} posts
        </span>
      </div>

      {/* Row 2: Team chips (All Teams view) + Status pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        {/* Team chips — only when viewing All Teams */}
        {isAllTeamsView && teams.length > 0 && (
          <>
            <FilterChip
              label="All Teams"
              active={!filters.teamId}
              onClick={() => setFilter('teamId', null)}
            />
            {teams.map((t) => (
              <FilterChip
                key={t.id}
                label={t.name}
                active={filters.teamId === t.id}
                color={t.color}
                onClick={() => setFilter('teamId', filters.teamId === t.id ? null : t.id)}
              />
            ))}
            <span className="text-white/[0.12] mx-1 text-xs">|</span>
          </>
        )}

        {/* Status pills */}
        {STATUS_ORDER.map((s) => (
          <FilterChip
            key={s}
            label={STATUS_LABELS[s as ContentStatus]}
            active={filters.status === s}
            color={STATUS_COLORS[s as ContentStatus]}
            onClick={() => setFilter('status', filters.status === s ? null : s as ContentStatus)}
          />
        ))}
      </div>
    </div>
  )
}
