import { useContentStore } from '@/store/contentStore'
import { useNavigate } from 'react-router-dom'
import { CONTENT_TYPE_COLORS, CONTENT_TYPE_LABELS, PLATFORM_LABELS } from '@/lib/constants'
import { formatScheduledDate } from '@/lib/dateUtils'
import { CalendarDays } from 'lucide-react'

export function UpcomingContentWidget() {
  const { scheduledInNextDays } = useContentStore()
  const navigate = useNavigate()
  const upcoming = scheduledInNextDays(7)

  return (
    <div className="bg-[#1a1d27] border border-white/[0.06] rounded-[14px] p-4">
      <h3 className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
        <CalendarDays size={13} className="text-[#22c55e]" />
        Next 7 Days
        {upcoming.length > 0 && (
          <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#22c55e]/15 text-[#22c55e]">
            {upcoming.length}
          </span>
        )}
      </h3>
      {upcoming.length === 0 ? (
        <p className="text-xs text-white/20 py-4 text-center">Nothing scheduled this week.</p>
      ) : (
        <div className="flex flex-col gap-1">
          {upcoming.map((card) => {
            const color = CONTENT_TYPE_COLORS[card.content_type]
            return (
              <div
                key={card.id}
                onClick={() => navigate(`/content/${card.id}`)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-all group"
              >
                <div className="w-0.5 self-stretch rounded-full shrink-0" style={{ backgroundColor: color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-white/70 group-hover:text-white truncate transition-colors">{card.title}</p>
                  <p className="text-[10px] text-white/25">
                    {CONTENT_TYPE_LABELS[card.content_type]} · {PLATFORM_LABELS[card.platform]}
                  </p>
                </div>
                <span className="text-[10px] text-white/30 shrink-0">
                  {formatScheduledDate(card.scheduled_date)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
