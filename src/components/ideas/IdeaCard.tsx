import { useState } from 'react'
import type { Idea } from '@/types'
import { useIdeaStore } from '@/store/ideaStore'
import { CONTENT_TYPE_COLORS, CONTENT_TYPE_LABELS } from '@/lib/constants'
import { formatRelative } from '@/lib/dateUtils'
import { Trash2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { PromoteIdeaModal } from './PromoteIdeaModal'
import { useToast } from '@/components/ui/Toast'

interface Props {
  idea: Idea
}

export function IdeaCard({ idea }: Props) {
  const { deleteIdea } = useIdeaStore()
  const { toast } = useToast()
  const [promoteOpen, setPromoteOpen] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Delete this idea?')) return
    try {
      await deleteIdea(idea.id)
      toast('Idea deleted')
    } catch {
      toast('Failed to delete idea', 'error')
    }
  }

  const typeColor = idea.content_type ? CONTENT_TYPE_COLORS[idea.content_type] : '#6b7280'
  const typeLabel = idea.content_type ? CONTENT_TYPE_LABELS[idea.content_type] : null

  return (
    <>
      <div className="kanban-card bg-[#1a1d27] border border-white/[0.06] rounded-[14px] p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-white/80 leading-snug">
              {idea.title}
            </p>
            {idea.description && (
              <p className="text-xs text-white/35 mt-1 line-clamp-2 leading-relaxed">
                {idea.description}
              </p>
            )}
          </div>
          <button
            onClick={handleDelete}
            className="p-1 text-white/15 hover:text-red-400 transition-colors shrink-0"
          >
            <Trash2 size={13} />
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {typeLabel && (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${typeColor}18`, color: typeColor }}
            >
              {typeLabel}
            </span>
          )}
          {idea.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-white/35"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Avatar src={idea.owner?.avatar_url} name={idea.owner?.full_name} size="xs" />
            <span className="text-[10px] text-white/25">{formatRelative(idea.created_at)}</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setPromoteOpen(true)}
            icon={<ArrowRight size={11} />}
            className="text-[#22c55e] hover:text-[#4ade80]"
          >
            Promote
          </Button>
        </div>
      </div>

      <PromoteIdeaModal
        idea={idea}
        open={promoteOpen}
        onClose={() => setPromoteOpen(false)}
      />
    </>
  )
}
