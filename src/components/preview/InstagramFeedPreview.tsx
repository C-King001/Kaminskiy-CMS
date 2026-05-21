import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react'
import type { ContentCard } from '@/types'

interface Props {
  card: ContentCard
  brandName?: string
}

export function InstagramFeedPreview({ card, brandName = 'yourbrand' }: Props) {
  const isVideo = card.file_url?.includes('.mp4') || card.file_url?.includes('.mov')
  const caption = card.caption ?? ''
  const hashtags = card.hashtags?.map((h) => `#${h}`).join(' ') ?? ''

  return (
    <div
      className="instagram-font bg-white text-black overflow-hidden"
      style={{ width: 470, fontSize: 14, fontFamily: "-apple-system,'Helvetica Neue',Helvetica,Arial,sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-0.5 shrink-0">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
            <span className="text-[9px] font-bold text-gray-800">
              {brandName.slice(0, 1).toUpperCase()}
            </span>
          </div>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-[13px] leading-none">{brandName}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Sponsored</p>
        </div>
        <MoreHorizontal size={18} className="text-gray-600" />
      </div>

      {/* Media */}
      <div className="w-full bg-gray-100" style={{ aspectRatio: '1/1' }}>
        {card.file_url ? (
          isVideo ? (
            <video
              src={card.file_url}
              className="w-full h-full object-cover"
              muted
              loop
            />
          ) : (
            <img src={card.file_url} alt={card.title} className="w-full h-full object-cover" />
          )
        ) : card.drive_link ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gray-50">
            <span className="text-2xl">🔗</span>
            <p className="text-xs text-gray-400 px-4 text-center">Google Drive content</p>
          </div>
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            <p className="text-white/80 text-sm font-medium px-4 text-center">{card.title}</p>
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="px-3 pt-2.5 pb-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <Heart size={22} strokeWidth={1.5} className="text-gray-800" />
            <MessageCircle size={22} strokeWidth={1.5} className="text-gray-800" />
            <Send size={22} strokeWidth={1.5} className="text-gray-800" />
          </div>
          <Bookmark size={22} strokeWidth={1.5} className="text-gray-800" />
        </div>
      </div>

      {/* Likes */}
      <div className="px-3 pb-1">
        <p className="text-[13px] font-semibold">1,234 likes</p>
      </div>

      {/* Caption */}
      {(caption || hashtags) && (
        <div className="px-3 pb-3">
          <p className="text-[13px] leading-[1.4]">
            <span className="font-semibold">{brandName} </span>
            {caption}
          </p>
          {hashtags && (
            <p className="text-[13px] text-blue-500 mt-1 leading-relaxed">{hashtags}</p>
          )}
          <p className="text-[11px] text-gray-400 mt-1.5">View all 42 comments</p>
        </div>
      )}
    </div>
  )
}
