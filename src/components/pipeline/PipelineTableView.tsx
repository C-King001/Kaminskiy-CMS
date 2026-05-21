import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ContentCard, ContentStatus } from '@/types'
import type { Profile } from '@/types'
import { PlatformIcon } from '@/components/ui/PlatformIcon'
import { Avatar } from '@/components/ui/Avatar'
import {
  CONTENT_TYPE_LABELS, STATUS_COLORS, STATUS_LABELS,
  CONTENT_TYPE_COLORS, STATUS_ORDER,
} from '@/lib/constants'
import { formatScheduledDate } from '@/lib/dateUtils'
import { ExternalLink, Trash2, UserPlus, ChevronDown, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useContentStore } from '@/store/contentStore'
import { useToast } from '@/components/ui/Toast'

interface Props {
  cards: ContentCard[]
}

const TABLE_HEADERS = ['', 'ID', 'Title', 'Group / Category', 'Format Type', 'Assignee', 'Status', 'Scheduled', '']

export function PipelineTableView({ cards }: Props) {
  const navigate = useNavigate()
  const { upsertCard, deleteCard, patchCard } = useContentStore()
  const { toast } = useToast()

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [bulkStatus, setBulkStatus] = useState<ContentStatus | ''>('')
  const [bulkAssignee, setBulkAssignee] = useState<string>('')

  useEffect(() => {
    supabase.from('profiles').select('id, full_name, email, avatar_url, role, created_at, updated_at')
      .then(({ data }) => { if (data) setProfiles(data as Profile[]) })
  }, [])

  // Clear selection when cards change (e.g. after filter)
  useEffect(() => { setSelected(new Set()) }, [cards.length])

  const toggleAll = useCallback(() => {
    setSelected((prev) =>
      prev.size === cards.length ? new Set() : new Set(cards.map((c) => c.id)),
    )
  }, [cards])

  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const clearSelection = () => {
    setSelected(new Set())
    setBulkStatus('')
    setBulkAssignee('')
  }

  const handleBulkAssign = async () => {
    if (!bulkAssignee) return
    const ids = [...selected]
    for (const id of ids) {
      const card = cards.find((c) => c.id === id)
      if (!card) continue
      const { owner: _owner, ...fields } = card as ContentCard & { owner?: unknown }
      try {
        await upsertCard({ ...fields, assigned_reviewer_id: bulkAssignee })
      } catch {
        // continue on individual failures
      }
    }
    toast(`Assigned ${ids.length} card${ids.length > 1 ? 's' : ''}`)
    clearSelection()
  }

  const handleBulkStatus = async () => {
    if (!bulkStatus) return
    const ids = [...selected]
    for (const id of ids) {
      await supabase.from('content_cards').update({ status: bulkStatus }).eq('id', id)
      const card = cards.find((c) => c.id === id)
      if (card) patchCard({ ...card, status: bulkStatus })
    }
    toast(`Updated ${ids.length} card${ids.length > 1 ? 's' : ''}`)
    clearSelection()
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} selected card${selected.size > 1 ? 's' : ''}?`)) return
    for (const id of selected) {
      try { await deleteCard(id) } catch { /* continue */ }
    }
    toast(`Deleted ${selected.size} cards`)
    clearSelection()
  }

  const allSelected = cards.length > 0 && selected.size === cards.length
  const someSelected = selected.size > 0 && selected.size < cards.length

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-white/25">No content cards match your filters.</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse" style={{ minWidth: 900 }}>
          {/* Green header row */}
          <thead>
            <tr style={{ backgroundColor: '#22c55e' }}>
              {TABLE_HEADERS.map((h, i) => (
                <th
                  key={i}
                  className="text-left py-2.5 px-3 text-[10px] font-bold uppercase tracking-widest text-white whitespace-nowrap"
                >
                  {i === 0 ? (
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => { if (el) el.indeterminate = someSelected }}
                      onChange={toggleAll}
                      className="w-3.5 h-3.5 rounded cursor-pointer accent-white"
                    />
                  ) : h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {cards.map((card) => {
              const statusColor = STATUS_COLORS[card.status]
              const typeColor = CONTENT_TYPE_COLORS[card.content_type]
              const platforms = card.platforms?.length ? card.platforms : [card.platform]
              const isSelected = selected.has(card.id)

              return (
                <tr
                  key={card.id}
                  className="border-b border-white/[0.03] cursor-pointer transition-colors"
                  style={{
                    backgroundColor: isSelected ? 'rgba(34,197,94,0.06)' : undefined,
                    borderLeft: `3px solid ${statusColor}50`,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.02)'
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = ''
                  }}
                >
                  {/* Checkbox */}
                  <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOne(card.id)}
                      className="w-3.5 h-3.5 rounded cursor-pointer accent-[#22c55e]"
                    />
                  </td>

                  {/* ID */}
                  <td className="py-2.5 px-3" onClick={() => navigate(`/content/${card.id}`)}>
                    <span className="font-mono text-[11px] text-white/35">
                      {card.content_id ?? '—'}
                    </span>
                  </td>

                  {/* Title */}
                  <td className="py-2.5 px-3 max-w-[220px]" onClick={() => navigate(`/content/${card.id}`)}>
                    <p className="text-[13px] font-medium text-white/80 truncate">{card.title}</p>
                  </td>

                  {/* Group / Category (platforms) */}
                  <td className="py-2.5 px-3" onClick={() => navigate(`/content/${card.id}`)}>
                    <div className="flex items-center gap-0.5 flex-wrap">
                      {platforms.slice(0, 3).map((p) => (
                        <PlatformIcon key={p} platform={p} showLabel />
                      ))}
                      {platforms.length > 3 && (
                        <span className="text-[10px] text-white/25">+{platforms.length - 3}</span>
                      )}
                    </div>
                  </td>

                  {/* Format Type */}
                  <td className="py-2.5 px-3" onClick={() => navigate(`/content/${card.id}`)}>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                      style={{ backgroundColor: `${typeColor}18`, color: typeColor }}
                    >
                      {CONTENT_TYPE_LABELS[card.content_type]}
                    </span>
                  </td>

                  {/* Assignee */}
                  <td className="py-2.5 px-3" onClick={() => navigate(`/content/${card.id}`)}>
                    {card.owner ? (
                      <div className="flex items-center gap-1.5">
                        <Avatar
                          src={card.owner.avatar_url}
                          name={card.owner.full_name ?? card.owner.email}
                          size="xs"
                        />
                        <span className="text-[11px] text-white/40 truncate max-w-[80px]">
                          {card.owner.full_name ?? card.owner.email}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-white/20">—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-2.5 px-3" onClick={() => navigate(`/content/${card.id}`)}>
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap"
                      style={{ backgroundColor: `${statusColor}18`, color: statusColor }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
                      {STATUS_LABELS[card.status]}
                    </span>
                  </td>

                  {/* Scheduled */}
                  <td className="py-2.5 px-3" onClick={() => navigate(`/content/${card.id}`)}>
                    <span className="text-[11px] text-white/35 whitespace-nowrap">
                      {formatScheduledDate(card.scheduled_date)}
                    </span>
                  </td>

                  {/* Drive link */}
                  <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                    {card.drive_link ? (
                      <a
                        href={card.drive_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#22c55e] hover:text-[#4ade80] transition-colors"
                      >
                        <ExternalLink size={13} />
                      </a>
                    ) : (
                      <span className="text-white/15">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Sticky bulk action bar ── */}
      {selected.size > 0 && (
        <div
          className="sticky bottom-0 left-0 right-0 flex flex-wrap items-center gap-2 px-4 py-3 border-t border-white/[0.08] z-10"
          style={{ backgroundColor: '#1a1d27', boxShadow: '0 -8px 24px rgba(0,0,0,0.4)' }}
        >
          {/* Count badge */}
          <span className="text-xs font-bold text-white/60 bg-white/[0.08] px-2.5 py-1 rounded-full whitespace-nowrap">
            {selected.size} selected
          </span>

          {/* Assign To */}
          <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5">
            <UserPlus size={12} className="text-white/30 shrink-0" />
            <select
              value={bulkAssignee}
              onChange={(e) => setBulkAssignee(e.target.value)}
              className="text-[11px] text-white/50 bg-transparent outline-none cursor-pointer"
              style={{ colorScheme: 'dark' }}
            >
              <option value="">Assign To…</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>{p.full_name ?? p.email}</option>
              ))}
            </select>
            <ChevronDown size={10} className="text-white/20 shrink-0" />
          </div>
          {bulkAssignee && (
            <button
              onClick={handleBulkAssign}
              className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-[#22c55e]/20 text-[#22c55e] hover:bg-[#22c55e]/30 transition-all"
            >
              Apply
            </button>
          )}

          {/* Change Status */}
          <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value as ContentStatus | '')}
              className="text-[11px] text-white/50 bg-transparent outline-none cursor-pointer"
              style={{ colorScheme: 'dark' }}
            >
              <option value="">Change Status…</option>
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
            <ChevronDown size={10} className="text-white/20 shrink-0" />
          </div>
          {bulkStatus && (
            <button
              onClick={handleBulkStatus}
              className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-[#22c55e]/20 text-[#22c55e] hover:bg-[#22c55e]/30 transition-all"
            >
              Apply
            </button>
          )}

          {/* Delete */}
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-400/10 border border-red-400/20 transition-all ml-auto"
          >
            <Trash2 size={12} />
            Delete
          </button>

          {/* Clear */}
          <button
            onClick={clearSelection}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
