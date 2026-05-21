import type { Comment } from '@/types'
import { CommentItem } from './CommentItem'
import { CommentInput } from './CommentInput'
import { MessageSquare } from 'lucide-react'

interface Props {
  comments: Comment[]
  loading: boolean
  onAdd: (body: string, parentId?: string) => Promise<void>
  onResolve: (id: string) => void
}

function buildTree(comments: Comment[]): Comment[] {
  const map = new Map<string, Comment>()
  const roots: Comment[] = []
  for (const c of comments) map.set(c.id, { ...c, replies: [] })
  for (const c of map.values()) {
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.replies!.push(c)
    } else {
      roots.push(c)
    }
  }
  return roots
}

export function CommentThread({ comments, loading, onAdd, onResolve }: Props) {
  const tree = buildTree(comments)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <MessageSquare size={14} className="text-white/30" />
        <span className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">
          Comments ({comments.length})
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <span className="text-xs text-white/20">Loading comments...</span>
        </div>
      ) : tree.length === 0 ? (
        <p className="text-xs text-white/20 py-2 text-center">No comments yet. Start the conversation.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {tree.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              onReply={async (body, parentId) => onAdd(body, parentId)}
              onResolve={onResolve}
            />
          ))}
        </div>
      )}

      <div className="border-t border-white/[0.06] pt-3">
        <CommentInput onSubmit={(body) => onAdd(body)} />
      </div>
    </div>
  )
}
