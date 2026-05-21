import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContentStore } from '@/store/contentStore'
import { WeekFormatCalendar } from '@/components/calendar/WeekFormatCalendar'
import { PageSpinner } from '@/components/ui/Spinner'
import {
  ChevronLeft, ChevronRight, Eye, Pencil, CalendarDays,
  LayoutGrid, Table, Filter, Calendar,
} from 'lucide-react'
import { CONTENT_TYPE_COLORS, STATUS_COLORS, STATUS_LABELS } from '@/lib/constants'
import type { ContentCard, ContentType } from '@/types'
import { supabase } from '@/lib/supabase'

// ─── Date utilities ──────────────────────────────────────────────────────────

function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day))
  d.setHours(0, 0, 0, 0)
  return d
}

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

function formatDay(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ─── Board view (pipeline-stage kanban) ──────────────────────────────────────

interface BoardStage {
  label: string
  statuses: string[]
  color: string
  description: string
}

const BOARD_STAGES: BoardStage[] = [
  { label: 'Brief',      statuses: ['idea', 'brief_ready'],                                         color: '#6b7280', description: 'Pre-production & brief writing' },
  { label: 'In Design',  statuses: ['in_design'],                                                    color: '#8b5cf6', description: 'Design & creative production' },
  { label: 'In Review',  statuses: ['submitted', 'in_review', 'corrections_needed', 'resubmitted'], color: '#f59e0b', description: 'Review & revision cycle' },
  { label: 'Approval',   statuses: ['stuart_approval', 'sergei_approval'],                           color: '#f97316', description: 'Leadership sign-off' },
  { label: 'Scheduled',  statuses: ['caption_scheduling', 'scheduled'],                              color: '#3b82f6', description: 'Caption writing & scheduling' },
  { label: 'Posted',     statuses: ['posted'],                                                        color: '#22c55e', description: 'Live on social media' },
]

interface BoardViewProps {
  cards: ContentCard[]
  onOpenCard: (id: string) => void
  onAddCard: (date: string) => void
}

function BoardView({ cards, onOpenCard, onAddCard }: BoardViewProps) {
  const cardsByStage = useMemo(() => {
    return BOARD_STAGES.map((stage) =>
      cards.filter((c) => stage.statuses.includes(c.status)),
    )
  }, [cards])

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="flex gap-3" style={{ minWidth: 1080 }}>
        {BOARD_STAGES.map((stage, stageIdx) => {
          const stageCards = cardsByStage[stageIdx]

          return (
            <div
              key={stage.label}
              className="flex flex-col rounded-xl overflow-hidden border shrink-0"
              style={{
                width: 200,
                borderColor: 'rgba(255,255,255,0.06)',
                backgroundColor: '#1a1d27',
              }}
            >
              {/* Column header */}
              <div
                className="px-3 py-2.5 border-b shrink-0"
                style={{
                  backgroundColor: `${stage.color}18`,
                  borderColor: `${stage.color}30`,
                }}
              >
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-[11px] font-bold text-white/80">{stage.label}</span>
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: `${stage.color}25`, color: stage.color }}
                  >
                    {stageCards.length}
                  </span>
                </div>
                <p className="text-[9px] text-white/30">{stage.description}</p>
              </div>

              {/* Cards list */}
              <div className="flex-1 p-2 flex flex-col gap-1.5 min-h-[200px] overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                {stageCards.map((card) => {
                  const typeColor = CONTENT_TYPE_COLORS[card.content_type]
                  const cardId = card.content_id ?? card.id.slice(0, 6).toUpperCase()

                  return (
                    <div
                      key={card.id}
                      onClick={() => onOpenCard(card.id)}
                      className="px-2.5 py-2 rounded-lg select-none transition-all cursor-pointer hover:opacity-90"
                      style={{
                        backgroundColor: `${typeColor}14`,
                        border: `1px solid ${typeColor}28`,
                      }}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <span
                          className="text-[8px] font-mono font-bold px-1 py-px rounded"
                          style={{ backgroundColor: `${typeColor}20`, color: typeColor }}
                        >
                          {cardId}
                        </span>
                        <span
                          className="text-[8px] font-bold ml-auto px-1.5 py-px rounded-full"
                          style={{ backgroundColor: `${stage.color}20`, color: stage.color }}
                        >
                          {card.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="text-[11px] text-white/75 font-medium leading-tight line-clamp-2">
                        {card.title}
                      </div>
                      {card.scheduled_date && (
                        <div className="text-[9px] text-white/30 mt-1">
                          {new Date(card.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      )}
                    </div>
                  )
                })}

                {stageCards.length === 0 && (
                  <div className="flex items-center justify-center h-16">
                    <span className="text-[10px] text-white/15">No content</span>
                  </div>
                )}
              </div>

              {/* Add card button (only for Brief stage) */}
              {stageIdx === 0 && (
                <div className="p-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                  <button
                    onClick={() => onAddCard('')}
                    className="w-full py-1.5 rounded-lg border border-dashed text-[10px] text-white/20 hover:text-[#22c55e] hover:border-[#22c55e]/40 transition-all"
                    style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                  >
                    + New card
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Month view ──────────────────────────────────────────────────────────────

const MONTH_DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface MonthViewProps {
  cards: ContentCard[]
  monthDate: Date
  onOpenCard: (id: string) => void
}

function MonthView({ cards, monthDate, onOpenCard }: MonthViewProps) {
  const today = new Date()

  const cells = useMemo(() => {
    const year = monthDate.getFullYear()
    const month = monthDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const startDow = firstDay.getDay() === 0 ? 7 : firstDay.getDay()
    const gridStart = addDays(firstDay, -(startDow - 1))
    return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))
  }, [monthDate])

  const cardsByDay = useMemo(() => {
    const map: Record<string, ContentCard[]> = {}
    for (const card of cards) {
      if (!card.scheduled_date) continue
      const key = card.scheduled_date.slice(0, 10)
      if (!map[key]) map[key] = []
      map[key].push(card)
    }
    return map
  }, [cards])

  const month = monthDate.getMonth()

  return (
    <div className="flex-1 overflow-auto p-4">
      <div
        className="border border-white/[0.06] rounded-xl overflow-hidden"
        style={{ backgroundColor: '#1a1d27' }}
      >
        {/* Weekday header */}
        <div className="grid grid-cols-7 border-b border-white/[0.06]">
          {MONTH_DOW.map((day) => (
            <div
              key={day}
              className="px-3 py-2.5 text-center"
              style={{ backgroundColor: '#22c55e' }}
            >
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">{day}</span>
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {cells.map((d, i) => {
            const isCurrentMonth = d.getMonth() === month
            const isToday = isSameDay(d, today)
            const key = toDateString(d)
            const dayCells = cardsByDay[key] ?? []

            return (
              <div
                key={i}
                className="min-h-[110px] px-2 py-1.5 border-r border-b"
                style={{
                  borderColor: 'rgba(255,255,255,0.05)',
                  backgroundColor: isToday
                    ? 'rgba(34,197,94,0.05)'
                    : !isCurrentMonth
                    ? 'rgba(0,0,0,0.15)'
                    : 'transparent',
                }}
              >
                {/* Date number */}
                <div className="flex items-center gap-1 mb-1">
                  <span
                    className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full leading-none ${
                      isToday
                        ? 'bg-[#22c55e] text-white'
                        : isCurrentMonth
                        ? 'text-white/60'
                        : 'text-white/20'
                    }`}
                  >
                    {d.getDate()}
                  </span>
                </div>

                {/* Dense content pills with status */}
                <div className="flex flex-col gap-0.5">
                  {dayCells.slice(0, 4).map((card) => {
                    const typeColor = CONTENT_TYPE_COLORS[card.content_type]
                    const statusColor = STATUS_COLORS[card.status]
                    const cardId = card.content_id ?? card.id.slice(0, 6).toUpperCase()
                    const statusLabel = STATUS_LABELS[card.status]
                    return (
                      <div
                        key={card.id}
                        onClick={() => onOpenCard(card.id)}
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: `${typeColor}18`, border: `1px solid ${typeColor}28` }}
                      >
                        <span
                          className="text-[7px] font-mono font-bold shrink-0"
                          style={{ color: typeColor }}
                        >
                          {cardId}
                        </span>
                        <span className="text-[7px] text-white/45 truncate flex-1 min-w-0">{card.title}</span>
                        <span
                          className="text-[6px] font-bold uppercase px-1 py-px rounded-full shrink-0 hidden sm:block"
                          style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
                        >
                          {statusLabel}
                        </span>
                      </div>
                    )
                  })}
                  {dayCells.length > 4 && (
                    <span className="text-[7px] text-white/30 pl-1">
                      +{dayCells.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Main CalendarPage ────────────────────────────────────────────────────────

type CalView = 'sheet' | 'board' | 'month'
type CalMode = 'viewing' | 'editing'

export function CalendarPage() {
  const { fetchCards, cards, loading, patchCard } = useContentStore()
  const navigate = useNavigate()

  const [view, setView] = useState<CalView>('sheet')
  const [mode, setMode] = useState<CalMode>('viewing')
  const [filterPostDate, setFilterPostDate] = useState(false)
  const [filterReadyBy, setFilterReadyBy] = useState(false)
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [monthDate, setMonthDate] = useState(() => {
    const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d
  })

  useEffect(() => { fetchCards() }, [])

  const handleReschedule = useCallback(
    async (cardId: string, newDate: string) => {
      const card = cards.find((c) => c.id === cardId)
      if (!card) return
      patchCard({ ...card, scheduled_date: newDate })
      await supabase.from('content_cards').update({ scheduled_date: newDate }).eq('id', cardId)
    },
    [cards, patchCard],
  )

  const handleAddCard = useCallback(
    (date: string, contentType?: ContentType) => {
      const params = new URLSearchParams({ scheduled_date: date })
      if (contentType) params.set('content_type', contentType)
      navigate(`/content/new?${params}`)
    },
    [navigate],
  )

  const handleOpenCard = useCallback(
    (id: string) => navigate(`/content/${id}`),
    [navigate],
  )

  const goBack = () => {
    if (view === 'month') {
      setMonthDate((d) => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n })
    } else {
      setWeekStart((w) => addDays(w, -7))
    }
  }

  const goNext = () => {
    if (view === 'month') {
      setMonthDate((d) => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n })
    } else {
      setWeekStart((w) => addDays(w, 7))
    }
  }

  const goToday = () => {
    setWeekStart(startOfWeek(new Date()))
    const now = new Date(); now.setDate(1); now.setHours(0, 0, 0, 0)
    setMonthDate(now)
  }

  const isCurrentPeriod = useMemo(() => {
    if (view === 'month') {
      const now = new Date()
      return monthDate.getFullYear() === now.getFullYear() && monthDate.getMonth() === now.getMonth()
    }
    return isSameDay(weekStart, startOfWeek(new Date()))
  }, [view, weekStart, monthDate])

  const navLabel = useMemo(() => {
    if (view === 'month') {
      return monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    }
    return `${formatDay(weekStart)} — ${formatDay(addDays(weekStart, 6))}`
  }, [view, weekStart, monthDate])

  const scheduledCount = cards.filter((c) => c.scheduled_date).length

  if (loading && cards.length === 0) return <PageSpinner />

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Control bar ── */}
      <div
        className="flex flex-wrap items-center gap-2 px-4 md:px-6 py-2.5 border-b border-white/[0.06] shrink-0"
        style={{ backgroundColor: '#13151f' }}
      >
        {/* Mode toggle */}
        <div className="flex items-center gap-0.5 p-0.5 bg-white/[0.04] border border-white/[0.06] rounded-lg">
          {(
            [
              { v: 'viewing', label: 'Viewing', icon: <Eye size={12} /> },
              { v: 'editing', label: 'Editing', icon: <Pencil size={12} /> },
            ] as const
          ).map(({ v, label, icon }) => (
            <button
              key={v}
              onClick={() => setMode(v)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
                mode === v
                  ? 'bg-[#22c55e]/20 text-[#22c55e]'
                  : 'text-white/30 hover:text-white/60'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* Filter toggles */}
        <button
          onClick={() => setFilterReadyBy((v) => !v)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
            filterReadyBy
              ? 'border-[#22c55e]/50 text-[#22c55e] bg-[#22c55e]/10'
              : 'border-white/[0.08] text-white/30 hover:text-white/60'
          }`}
        >
          <Filter size={11} />
          Ready By
        </button>
        <button
          onClick={() => setFilterPostDate((v) => !v)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
            filterPostDate
              ? 'border-[#22c55e]/50 text-[#22c55e] bg-[#22c55e]/10'
              : 'border-white/[0.08] text-white/30 hover:text-white/60'
          }`}
        >
          <Calendar size={11} />
          Post Date
        </button>

        {/* View switcher */}
        <div className="flex items-center gap-0.5 p-0.5 bg-white/[0.04] border border-white/[0.06] rounded-lg">
          {(
            [
              { v: 'sheet', label: 'Sheet', icon: <Table size={12} /> },
              { v: 'board', label: 'Board', icon: <LayoutGrid size={12} /> },
              { v: 'month', label: 'Month', icon: <CalendarDays size={12} /> },
            ] as const
          ).map(({ v, label, icon }) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
                view === v
                  ? 'bg-[#22c55e]/20 text-[#22c55e]'
                  : 'text-white/30 hover:text-white/60'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={goBack}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs font-semibold text-white/60 px-2 min-w-[160px] text-center">
            {navLabel}
          </span>
          <button
            onClick={goNext}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {!isCurrentPeriod && (
          <button
            onClick={goToday}
            className="text-[11px] font-semibold text-[#22c55e] hover:text-[#4ade80] border border-[#22c55e]/30 hover:border-[#22c55e]/60 px-2.5 py-1.5 rounded-lg transition-all"
          >
            Today
          </button>
        )}

        <span className="ml-auto text-[11px] text-white/20 font-medium">
          {scheduledCount} scheduled
        </span>
      </div>

      {/* ── Views ── */}
      {view === 'sheet' && (
        <WeekFormatCalendar
          cards={cards}
          weekStart={weekStart}
          mode={mode}
          filterPostDate={filterPostDate}
          filterReadyBy={filterReadyBy}
          onReschedule={handleReschedule}
          onAddCard={handleAddCard}
          onOpenCard={handleOpenCard}
        />
      )}

      {view === 'board' && (
        <BoardView
          cards={cards}
          onOpenCard={handleOpenCard}
          onAddCard={(date) => handleAddCard(date)}
        />
      )}

      {view === 'month' && (
        <MonthView
          cards={cards}
          monthDate={monthDate}
          onOpenCard={handleOpenCard}
        />
      )}
    </div>
  )
}
