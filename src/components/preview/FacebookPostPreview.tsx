import { ThumbsUp, MessageSquare, Share2, Globe, MoreHorizontal } from 'lucide-react'
import type { ContentCard } from '@/types'

interface Props {
  card: ContentCard
  brandName?: string
}

export function FacebookPostPreview({ card, brandName = 'Your Brand' }: Props) {
  const isVideo = card.file_url?.includes('.mp4') || card.file_url?.includes('.mov')
  const caption = card.caption ?? ''
  const hashtags = card.hashtags?.map((h) => `#${h}`).join(' ') ?? ''

  return (
    <div
      className="bg-white text-black rounded-lg overflow-hidden shadow-sm border border-gray-200"
      style={{ width: 500, fontFamily: 'Helvetica,Arial,sans-serif', fontSize: 15 }}
    >
      {/* Header */}
      <div className="flex items-start gap-2.5 px-4 pt-3 pb-2">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
          style={{ background: 'linear-gradient(135deg, #16a34a, #EC4899)' }}
        >
          {brandName.slice(0, 1).toUpperCase()}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-[15px] leading-tight text-blue-600">{brandName}</p>
          <div className="flex items-center gap-1 text-[12px] text-gray-500 mt-0.5">
            <span>2h</span>
            <span>·</span>
            <Globe size={11} />
          </div>
        </div>
        <MoreHorizontal size={18} className="text-gray-400 mt-1" />
      </div>

      {/* Post text */}
      {(caption || hashtags) && (
        <div className="px-4 pb-3">
          <p className="text-[15px] leading-[1.4] text-gray-900">
            {caption}
          </p>
          {hashtags && (
            <p className="text-[15px] text-blue-500 mt-1">{hashtags}</p>
          )}
        </div>
      )}

      {/* Media */}
      <div className="w-full bg-gray-100" style={{ aspectRatio: '1.91/1' }}>
        {card.file_url ? (
          isVideo ? (
            <video src={card.file_url} className="w-full h-full object-cover" muted controls />
          ) : (
            <img src={card.file_url} alt={card.title} className="w-full h-full object-cover" />
          )
        ) : card.drive_link ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gray-50">
            <span className="text-2xl">🔗</span>
            <p className="text-xs text-gray-400">Google Drive content</p>
          </div>
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #16a34a 0%, #EC4899 100%)' }}
          >
            <p className="text-white text-sm font-medium px-4 text-center">{card.title}</p>
          </div>
        )}
      </div>

      {/* Reactions row */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-1">
          <span className="text-sm">👍❤️😮</span>
          <span className="text-[13px] text-gray-500 ml-1">1,234</span>
        </div>
        <div className="flex gap-2 text-[13px] text-gray-500">
          <span>84 comments</span>
          <span>·</span>
          <span>12 shares</span>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center divide-x divide-gray-100">
        {[
          { icon: ThumbsUp, label: 'Like' },
          { icon: MessageSquare, label: 'Comment' },
          { icon: Share2, label: 'Share' },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[13px] font-medium text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
