import type { ContentCard, ContentStatus } from '@/types'
import { ContentCardTile } from './ContentCardTile'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/constants'

interface Props {
  status: ContentStatus
  cards: ContentCard[]
}

export function KanbanColumn({ status, cards }: Props) {
  const color = STATUS_COLORS[status]

  return (
    <div className="flex flex-col min-w-[240px] w-[240px] shrink-0">
      <div
        className="rounded-xl mb-3 overflow-hidden"
        style={{ borderTop: `2px solid ${color}` }}
      >
        <div
          className="flex items-center justify-between px-3 py-2.5"
          style={{ backgroundColor: `${color}0d` }}
        >
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>
            {STATUS_LABELS[status]}
          </span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center"
            style={{ backgroundColor: `${color}22`, color }}
          >
            {cards.length}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 min-h-[60px]">
        {cards.map((card) => (
          <ContentCardTile key={card.id} card={card} />
        ))}
      </div>
    </div>
  )
}
