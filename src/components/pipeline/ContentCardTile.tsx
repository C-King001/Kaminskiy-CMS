import { useNavigate } from 'react-router-dom'
import type { ContentCard } from '@/types'
import { Avatar } from '@/components/ui/Avatar'
import { PlatformIcon } from '@/components/ui/PlatformIcon'
import { CONTENT_TYPE_COLORS, CONTENT_TYPE_LABELS, STATUS_COLORS, STATUS_LABELS } from '@/lib/constants'
import { formatScheduledDate } from '@/lib/dateUtils'
import { Calendar } from 'lucide-react'

interface Props {
  card: ContentCard
  compact?: boolean
}

export function ContentCardTile({ card, compact }: Props) {
  const navigate = useNavigate()
  const typeColor = CONTENT_TYPE_COLORS[card.content_type]
  const statusColor = STATUS_COLORS[card.status]
  const platforms = card.platforms?.length ? card.platforms : [card.platform]

  const hasMedia = !!(card.file_url || card.drive_link)
  const isVideo = card.file_url?.includes('.mp4') || card.file_url?.includes('.mov')

  return (
    <div
      onClick={() => navigate(`/content/${card.id}`)}
      className="kanban-card border border-white/[0.06] rounded-[14px] p-3 cursor-pointer group animate-fade-up"
      style={{ backgroundColor: '#1a1d27' }}
    >
      {/* Media thumbnail */}
      {hasMedia && !compact && (
        <div className="w-full h-24 rounded-xl overflow-hidden mb-3 bg-white/[0.04]">
          {card.file_url ? (
            isVideo ? (
              <video src={card.file_url} className="w-full h-full object-cover" muted />
            ) : (
              <img src={card.file_url} alt={card.title} className="w-full h-full object-cover" />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-2xl opacity-20">🔗</span>
            </div>
          )}
        </div>
      )}

      {/* Type badge */}
      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
          style={{ backgroundColor: `${typeColor}18`, color: typeColor }}
        >
          {CONTENT_TYPE_LABELS[card.content_type]}
        </span>
        {/* Platform icons */}
        {platforms.slice(0, 3).map((p) => (
          <PlatformIcon key={p} platform={p} />
        ))}
        {platforms.length > 3 && (
          <span className="text-[10px] text-white/25">+{platforms.length - 3}</span>
        )}
      </div>

      {/* Content ID + Title */}
      {card.content_id && (
        <p className="text-[10px] font-mono text-white/25 mb-0.5">{card.content_id}</p>
      )}
      <p className="text-[13px] font-semibold text-white/80 leading-snug line-clamp-2 group-hover:text-[#22c55e] transition-colors mb-2">
        {card.title}
      </p>

      {/* Status pill */}
      <div
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold mb-2"
        style={{ backgroundColor: `${statusColor}18`, color: statusColor }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: statusColor }}
        />
        {STATUS_LABELS[card.status]}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[10px] text-white/30">
          <Calendar size={9} />
          <span>{formatScheduledDate(card.scheduled_date)}</span>
        </div>
        {card.owner && (
          <Avatar
            src={card.owner.avatar_url}
            name={card.owner.full_name ?? card.owner.email}
            size="xs"
          />
        )}
      </div>
    </div>
  )
}
