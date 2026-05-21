import { useState } from 'react'
import type { Comment } from '@/types'
import { Avatar } from '@/components/ui/Avatar'
import { formatRelative } from '@/lib/dateUtils'
import { CheckCircle, CornerDownRight } from 'lucide-react'
import { CommentInput } from './CommentInput'

interface Props {
  comment: Comment
  onReply: (body: string, parentId: string) => Promise<void>
  onResolve: (id: string) => void
  depth?: number
}

export function CommentItem({ comment, onReply, onResolve, depth = 0 }: Props) {
  const [showReply, setShowReply] = useState(false)

  return (
    <div className={`flex gap-2.5 ${depth > 0 ? 'ml-8 mt-2' : ''} ${comment.resolved ? 'opacity-40' : ''}`}>
      <Avatar
        src={comment.author?.avatar_url}
        name={comment.author?.full_name ?? comment.author?.email}
        size="sm"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-semibold text-white/70">
                {comment.author?.full_name ?? comment.author?.email ?? 'User'}
              </span>
              <span className="text-[10px] text-white/25">{formatRelative(comment.created_at)}</span>
              {comment.resolved && (
                <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                  <CheckCircle size={10} /> Resolved
                </span>
              )}
            </div>
            <p className="text-sm text-white/55 leading-relaxed">{comment.body}</p>
          </div>
        </div>

        {!comment.resolved && depth === 0 && (
          <div className="flex gap-3 mt-1 ml-2">
            <button
              onClick={() => setShowReply((v) => !v)}
              className="text-[11px] text-white/25 hover:text-[#22c55e] flex items-center gap-0.5 transition-colors"
            >
              <CornerDownRight size={10} /> Reply
            </button>
            <button
              onClick={() => onResolve(comment.id)}
              className="text-[11px] text-white/25 hover:text-emerald-400 flex items-center gap-0.5 transition-colors"
            >
              <CheckCircle size={10} /> Resolve
            </button>
          </div>
        )}

        {showReply && (
          <div className="mt-2 ml-2">
            <CommentInput
              placeholder="Reply..."
              compact
              onSubmit={async (body) => {
                await onReply(body, comment.id)
                setShowReply(false)
              }}
            />
          </div>
        )}

        {comment.replies?.map((reply) => (
          <CommentItem
            key={reply.id}
            comment={reply}
            onReply={onReply}
            onResolve={onResolve}
            depth={depth + 1}
          />
        ))}
      </div>
    </div>
  )
}
