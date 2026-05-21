import { useState, useMemo } from 'react'
import type { DragEvent } from 'react'
import type { ContentCard, ContentType } from '@/types'
import {
  CALENDAR_FORMAT_ROWS, CONTENT_TYPE_COLORS, CONTENT_TYPE_LABELS,
  STATUS_COLORS, STATUS_LABELS,
} from '@/lib/constants'
import { Plus } from 'lucide-react'
import { PlatformIcon } from '@/components/ui/PlatformIcon'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function addDays(date: Date, n: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function toDateString(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface CellCardProps {
  card: ContentCard
  mode: 'viewing' | 'editing'
  onDragStart: (e: DragEvent<HTMLDivElement>, cardId: string) => void
  onOpen: (id: string) => void
}

function CellCard({ card, mode, onDragStart, onOpen }: CellCardProps) {
  const typeColor = CONTENT_TYPE_COLORS[card.content_type]
  const statusColor = STATUS_COLORS[card.status]
  const cardId = card.content_id ?? card.id.slice(0, 8).toUpperCase()
  const platforms = card.platforms?.length ? card.platforms : [card.platform]

  return (
    <div
      draggable={mode === 'editing'}
      onDragStart={(e) => onDragStart(e, card.id)}
      onClick={() => onOpen(card.id)}
      className="mb-1 px-2 py-1.5 rounded-lg transition-all group select-none"
      style={{
        backgroundColor: `${typeColor}15`,
        border: `1px solid ${typeColor}28`,
        cursor: mode === 'editing' ? 'grab' : 'pointer',
      }}
    >
      {/* ID badge + status dot row */}
      <div className="flex items-center gap-1 mb-0.5">
        <span
          className="text-[9px] font-mono font-bold px-1 py-px rounded leading-tight"
          style={{ backgroundColor: `${typeColor}22`, color: typeColor }}
        >
          {cardId}
        </span>
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0 ml-auto"
          style={{ backgroundColor: statusColor }}
          title={STATUS_LABELS[card.status]}
        />
      </div>
      {/* Title */}
      <div className="text-[10px] text-white/70 truncate leading-tight mb-1 group-hover:text-white/90 transition-colors">
        {card.title}
      </div>
      {/* Platform pills */}
      <div className="flex items-center gap-0.5 flex-wrap">
        {platforms.slice(0, 3).map((p) => (
          <PlatformIcon key={p} platform={p} />
        ))}
        {platforms.length > 3 && (
          <span className="text-[9px] text-white/30">+{platforms.length - 3}</span>
        )}
      </div>
    </div>
  )
}

interface Props {
  cards: ContentCard[]
  weekStart: Date
  mode: 'viewing' | 'editing'
  filterPostDate: boolean
  filterReadyBy: boolean
  onReschedule: (cardId: string, newDate: string) => Promise<void>
  onAddCard: (date: string, contentType: ContentType) => void
  onOpenCard: (id: string) => void
}

export function WeekFormatCalendar({
  cards, weekStart, mode, filterPostDate, filterReadyBy,
  onReschedule, onAddCard, onOpenCard,
}: Props) {
  const [dragOverCell, setDragOverCell] = useState<string | null>(null)

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  )

  const filteredCards = useMemo(() => {
    return cards.filter((c) => {
      if (filterPostDate && !c.scheduled_date) return false
      if (filterReadyBy) {
        const readyStatuses = ['caption_scheduling', 'scheduled', 'posted']
        if (!readyStatuses.includes(c.status)) return false
      }
      return true
    })
  }, [cards, filterPostDate, filterReadyBy])

  const visibleCards = useMemo(
    () => filteredCards.filter((c) => {
      if (!c.scheduled_date) return false
      const d = new Date(c.scheduled_date)
      return weekDays.some((wd) => isSameDay(wd, d))
    }),
    [filteredCards, weekDays],
  )

  const unscheduledByType = useMemo(() => {
    const map: Record<string, ContentCard[]> = {}
    for (const row of CALENDAR_FORMAT_ROWS) {
      map[row] = cards.filter((c) => !c.scheduled_date && c.content_type === row)
    }
    return map
  }, [cards])

  const cellMap = useMemo(() => {
    const map: Record<string, Record<number, ContentCard[]>> = {}
    for (const row of CALENDAR_FORMAT_ROWS) {
      map[row] = {}
      for (let i = 0; i < 7; i++) map[row][i] = []
    }
    for (const card of visibleCards) {
      const d = new Date(card.scheduled_date!)
      const dayIdx = weekDays.findIndex((wd) => isSameDay(wd, d))
      if (dayIdx === -1) continue
      const row = (CALENDAR_FORMAT_ROWS as string[]).includes(card.content_type)
        ? card.content_type
        : CALENDAR_FORMAT_ROWS[0]
      map[row][dayIdx].push(card)
    }
    return map
  }, [visibleCards, weekDays])

  const handleDragStart = (e: DragEvent<HTMLDivElement>, cardId: string) => {
    e.dataTransfer.setData('text/cardId', cardId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: DragEvent<HTMLTableCellElement>, cellKey: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverCell !== cellKey) setDragOverCell(cellKey)
  }

  const handleDrop = async (e: DragEvent<HTMLTableCellElement>, dayIdx: number) => {
    e.preventDefault()
    const cardId = e.dataTransfer.getData('text/cardId')
    setDragOverCell(null)
    if (!cardId) return
    await onReschedule(cardId, toDateString(weekDays[dayIdx]))
  }

  const today = new Date()

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full border-collapse" style={{ minWidth: 980 }}>
        <thead>
          <tr>
            {/* Format label header */}
            <th
              className="w-28 px-3 py-3 text-left border-r border-b sticky left-0 z-20"
              style={{ backgroundColor: '#13151f', borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">FORMAT</span>
            </th>
            {weekDays.map((d, i) => {
              const isToday = isSameDay(d, today)
              return (
                <th
                  key={i}
                  className="px-3 py-2.5 border-b border-r text-left"
                  style={{
                    backgroundColor: '#22c55e',
                    borderColor: 'rgba(255,255,255,0.15)',
                    minWidth: 148,
                  }}
                >
                  <div className="flex flex-col gap-px">
                    <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">{DAYS[i]}</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-black text-white leading-none">{d.getDate()}</span>
                      <span className="text-[10px] text-white/75 font-medium">
                        {d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                      </span>
                      {isToday && (
                        <span className="text-[8px] font-black text-[#16a34a] bg-white px-1.5 py-0.5 rounded-full leading-none">
                          TODAY
                        </span>
                      )}
                    </div>
                  </div>
                </th>
              )
            })}
          </tr>
        </thead>

        <tbody>
          {CALENDAR_FORMAT_ROWS.map((rowType) => {
            const typeColor = CONTENT_TYPE_COLORS[rowType]
            const rowCards = cellMap[rowType]

            return (
              <tr key={rowType}>
                {/* Format label */}
                <td
                  className="px-3 py-2 border-r border-b align-top sticky left-0 z-10"
                  style={{
                    backgroundColor: '#13151f',
                    borderColor: 'rgba(255,255,255,0.06)',
                    width: 112,
                  }}
                >
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: typeColor }} />
                    <span
                      className="text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
                      style={{ color: typeColor }}
                    >
                      {CONTENT_TYPE_LABELS[rowType]}
                    </span>
                  </div>
                </td>

                {weekDays.map((d, dayIdx) => {
                  const dayCells = rowCards[dayIdx] ?? []
                  const isToday = isSameDay(d, today)
                  const cellKey = `${rowType}-${dayIdx}`
                  const isDragTarget = dragOverCell === cellKey

                  return (
                    <td
                      key={dayIdx}
                      className="px-2 py-2 border-b border-r align-top relative group/cell"
                      style={{
                        minWidth: 148,
                        backgroundColor: isDragTarget
                          ? 'rgba(34,197,94,0.09)'
                          : isToday
                          ? 'rgba(34,197,94,0.03)'
                          : 'transparent',
                        borderColor: isDragTarget
                          ? 'rgba(34,197,94,0.45)'
                          : 'rgba(255,255,255,0.05)',
                        transition: 'background-color 0.12s, border-color 0.12s',
                        outline: isDragTarget ? '1px solid rgba(34,197,94,0.25)' : undefined,
                      }}
                      onDragOver={(e) => handleDragOver(e, cellKey)}
                      onDragLeave={() => { if (dragOverCell === cellKey) setDragOverCell(null) }}
                      onDrop={(e) => handleDrop(e, dayIdx)}
                    >
                      {dayCells.map((card) => (
                        <CellCard
                          key={card.id}
                          card={card}
                          mode={mode}
                          onDragStart={handleDragStart}
                          onOpen={onOpenCard}
                        />
                      ))}

                      {/* Editing: assign unscheduled content dropdown */}
                      {mode === 'editing' && (unscheduledByType[rowType]?.length ?? 0) > 0 && (
                        <select
                          className="w-full mt-0.5 text-[9px] px-1.5 py-0.5 rounded border opacity-0 group-hover/cell:opacity-100 focus:opacity-100 transition-opacity"
                          style={{
                            backgroundColor: '#1a1d27',
                            borderColor: 'rgba(34,197,94,0.25)',
                            color: 'rgba(255,255,255,0.45)',
                            outline: 'none',
                          }}
                          value=""
                          onChange={async (e) => {
                            if (!e.target.value) return
                            await onReschedule(e.target.value, toDateString(d))
                            e.target.value = ''
                          }}
                        >
                          <option value="">+ Assign content…</option>
                          {unscheduledByType[rowType].map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.content_id ? `${c.content_id} · ` : ''}{c.title}
                            </option>
                          ))}
                        </select>
                      )}

                      {/* Editing: inline post date picker */}
                      {mode === 'editing' && dayCells.length > 0 && (
                        <div className="mt-1 opacity-0 group-hover/cell:opacity-100 focus-within:opacity-100 transition-opacity">
                          <label className="block text-[8px] text-white/30 uppercase tracking-wide mb-0.5">
                            Post Date
                          </label>
                          <input
                            type="date"
                            className="text-[9px] w-full px-1.5 py-0.5 rounded border"
                            style={{
                              backgroundColor: '#1a1d27',
                              borderColor: 'rgba(34,197,94,0.25)',
                              color: 'rgba(255,255,255,0.5)',
                              colorScheme: 'dark',
                              outline: 'none',
                            }}
                            defaultValue={dayCells[0].scheduled_date?.slice(0, 10) ?? ''}
                            onChange={async (e) => {
                              if (!e.target.value || !dayCells[0]) return
                              await onReschedule(dayCells[0].id, e.target.value)
                            }}
                          />
                        </div>
                      )}

                      {/* Hover + button */}
                      <button
                        onClick={() => onAddCard(toDateString(d), rowType)}
                        className="absolute bottom-1.5 right-1.5 w-5 h-5 rounded-full bg-[#22c55e]/20 text-[#22c55e] opacity-0 group-hover/cell:opacity-100 transition-opacity flex items-center justify-center hover:bg-[#22c55e]/40"
                      >
                        <Plus size={11} />
                      </button>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
