import { useState, useEffect } from 'react'
import type { StatusHistory } from '@/types'
import { supabase } from '@/lib/supabase'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/constants'
import { formatRelative } from '@/lib/dateUtils'
import { Avatar } from '@/components/ui/Avatar'
import { ArrowRight, Clock } from 'lucide-react'

export function StatusHistoryTimeline({ cardId }: { cardId: string }) {
  const [history, setHistory] = useState<StatusHistory[]>([])

  useEffect(() => {
    supabase
      .from('status_history')
      .select('*, changer:profiles!changed_by(full_name, avatar_url)')
      .eq('card_id', cardId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setHistory(data as StatusHistory[])
      })
  }, [cardId])

  if (history.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Clock size={13} className="text-white/25" />
        <span className="text-[11px] font-semibold text-white/30 uppercase tracking-widest">Status History</span>
      </div>
      <div className="flex flex-col gap-2">
        {history.map((h) => (
          <div key={h.id} className="flex items-start gap-2 text-xs">
            <Avatar src={h.changer?.avatar_url} name={h.changer?.full_name} size="xs" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                {h.from_status && (
                  <>
                    <span
                      className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{
                        backgroundColor: `${STATUS_COLORS[h.from_status]}18`,
                        color: STATUS_COLORS[h.from_status],
                      }}
                    >
                      {STATUS_LABELS[h.from_status]}
                    </span>
                    <ArrowRight size={9} className="text-white/20" />
                  </>
                )}
                <span
                  className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{
                    backgroundColor: `${STATUS_COLORS[h.to_status]}18`,
                    color: STATUS_COLORS[h.to_status],
                  }}
                >
                  {STATUS_LABELS[h.to_status]}
                </span>
                <span className="text-white/25">{formatRelative(h.created_at)}</span>
              </div>
              {h.note && (
                <p className="text-white/30 mt-0.5 italic text-[11px]">"{h.note}"</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
