import { useContentStore } from '@/store/contentStore'
import { STATUS_LABELS, STATUS_COLORS, STATUS_ORDER } from '@/lib/constants'

export function PipelineStatsWidget() {
  const { cards } = useContentStore()

  const counts = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = cards.filter((c) => c.status === status).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="bg-[#1a1d27] border border-white/[0.06] rounded-[14px] p-4">
      <h3 className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-4">Pipeline Overview</h3>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
        {STATUS_ORDER.map((status) => {
          const color = STATUS_COLORS[status]
          const count = counts[status] ?? 0
          return (
            <div
              key={status}
              className="flex flex-col items-center gap-1 p-2.5 rounded-xl transition-transform hover:scale-105"
              style={{ backgroundColor: `${color}12` }}
            >
              <span className="text-xl font-bold leading-none" style={{ color }}>{count}</span>
              <span className="text-[9px] font-semibold text-center leading-tight uppercase tracking-wide" style={{ color: `${color}aa` }}>
                {STATUS_LABELS[status]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
