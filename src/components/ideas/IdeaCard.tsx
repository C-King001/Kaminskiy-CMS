import type { Idea } from '@/types'
import { CONTENT_TYPE_COLORS, CONTENT_TYPE_LABELS } from '@/lib/constants'
import { formatRelative } from '@/lib/dateUtils'
import { Avatar } from '@/components/ui/Avatar'
import { Play, Link2, ArrowRight } from 'lucide-react'

interface Props {
  idea: Idea
  onClick: () => void
}

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

function hasVideoUrl(url: string | null): boolean {
  if (!url) return false
  return !!(getYouTubeId(url) || url.includes('tiktok.com') || url.includes('instagram.com'))
}

export function IdeaCard({ idea, onClick }: Props) {
  const typeColor = idea.content_type ? CONTENT_TYPE_COLORS[idea.content_type] : '#6b7280'
  const typeLabel = idea.content_type ? CONTENT_TYPE_LABELS[idea.content_type] : null
  const ytId = idea.reference_url ? getYouTubeId(idea.reference_url) : null
  const isVideo = hasVideoUrl(idea.reference_url ?? null)

  return (
    <button
      onClick={onClick}
      className="kanban-card text-left w-full rounded-[16px] border border-white/[0.07] overflow-hidden group transition-all"
      style={{ backgroundColor: '#1a1d27' }}
    >
      {/* Video thumbnail if YouTube */}
      {ytId && (
        <div className="relative w-full overflow-hidden" style={{ paddingBottom: '56.25%' }}>
          <img
            src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
            alt="video thumbnail"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-all">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Play size={16} fill="white" className="text-white ml-0.5" />
            </div>
          </div>
          {/* Platform chip overlay */}
          <div className="absolute top-2 left-2">
            <span className="text-[9px] font-bold bg-red-500/80 text-white px-1.5 py-0.5 rounded-full backdrop-blur-sm">
              YouTube
            </span>
          </div>
        </div>
      )}

      {/* Non-YouTube reference link indicator */}
      {!ytId && isVideo && (
        <div
          className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.06]"
          style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
        >
          <Link2 size={11} className="text-[#22c55e] shrink-0" />
          <span className="text-[10px] text-white/40 truncate font-mono">{idea.reference_url}</span>
        </div>
      )}

      <div className="p-4 flex flex-col gap-3">
        {/* Title */}
        <p className="text-[13px] font-semibold text-white/90 leading-snug">
          {idea.title}
        </p>

        {/* Description */}
        {idea.description && (
          <p className="text-xs text-white/55 line-clamp-2 leading-relaxed">
            {idea.description.replace(/[#*_`]/g, '').slice(0, 120)}
          </p>
        )}

        {/* Content type + tags */}
        <div className="flex flex-wrap gap-1.5">
          {typeLabel && (
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: `${typeColor}28`, color: typeColor, border: `1px solid ${typeColor}30` }}
            >
              {typeLabel}
            </span>
          )}
          {idea.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.07] text-white/50"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <Avatar src={idea.owner?.avatar_url} name={idea.owner?.full_name} size="xs" />
            <span className="text-[10px] text-white/30">{formatRelative(idea.created_at)}</span>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-semibold text-white/30 group-hover:text-[#22c55e] transition-colors">
            Open <ArrowRight size={10} />
          </span>
        </div>
      </div>
    </button>
  )
}
