import { Heart, MessageCircle, Send, Bookmark, Music, MoreVertical } from 'lucide-react'
import type { ContentCard } from '@/types'

interface Props {
  card: ContentCard
  brandName?: string
}

export function InstagramReelPreview({ card, brandName = 'yourbrand' }: Props) {
  const isVideo = card.file_url?.includes('.mp4') || card.file_url?.includes('.mov')
  const caption = card.caption ?? ''

  return (
    <div
      className="instagram-font relative overflow-hidden bg-black text-white"
      style={{
        width: 270,
        height: 480,
        fontFamily: "-apple-system,'Helvetica Neue',Helvetica,Arial,sans-serif",
      }}
    >
      {/* Background / Media */}
      <div className="absolute inset-0">
        {card.file_url ? (
          isVideo ? (
            <video
              src={card.file_url}
              className="w-full h-full object-cover"
              muted
              loop
              autoPlay
            />
          ) : (
            <img src={card.file_url} alt={card.title} className="w-full h-full object-cover" />
          )
        ) : (
          <div
            className="w-full h-full"
            style={{ background: 'linear-gradient(180deg, #2d1b69 0%, #11001c 100%)' }}
          />
        )}
      </div>

      {/* Gradient scrim bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)' }}
      />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 pt-3">
        <p className="text-xs font-semibold drop-shadow">Reels</p>
        <div className="flex gap-3 text-xs items-center">
          <span>🎵</span>
          <MoreVertical size={16} className="drop-shadow" />
        </div>
      </div>

      {/* Right action bar */}
      <div className="absolute right-3 bottom-20 flex flex-col items-center gap-5">
        <div className="flex flex-col items-center gap-1">
          <Heart size={24} strokeWidth={1.5} className="drop-shadow" />
          <span className="text-[10px]">1.2K</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <MessageCircle size={24} strokeWidth={1.5} className="drop-shadow" />
          <span className="text-[10px]">84</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Send size={24} strokeWidth={1.5} className="drop-shadow" />
          <span className="text-[10px]">Share</span>
        </div>
        <Bookmark size={24} strokeWidth={1.5} className="drop-shadow" />

        {/* Rotating audio disc */}
        <div className="w-8 h-8 rounded-full bg-gray-800 border-2 border-white flex items-center justify-center mt-1">
          <Music size={12} />
        </div>
      </div>

      {/* Bottom user + caption */}
      <div className="absolute bottom-4 left-3 right-14">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
            <span className="text-[9px] font-bold">{brandName.slice(0, 1).toUpperCase()}</span>
          </div>
          <span className="text-xs font-semibold drop-shadow">{brandName}</span>
          <span className="text-[10px] border border-white/70 rounded px-1.5 py-0.5">Follow</span>
        </div>
        {caption && (
          <p className="text-[11px] leading-relaxed drop-shadow line-clamp-3">
            {caption}
          </p>
        )}
        <div className="flex items-center gap-1.5 mt-1.5">
          <Music size={10} />
          <p className="text-[10px] truncate">Original audio · {brandName}</p>
        </div>
      </div>
    </div>
  )
}
