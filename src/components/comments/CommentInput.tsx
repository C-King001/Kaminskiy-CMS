import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthStore } from '@/store/authStore'
import { Send } from 'lucide-react'

interface Props {
  onSubmit: (body: string) => Promise<void>
  placeholder?: string
  compact?: boolean
}

export function CommentInput({ onSubmit, placeholder = 'Leave a comment...', compact }: Props) {
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const profile = useAuthStore((s) => s.profile)

  const submit = async () => {
    if (!body.trim()) return
    setLoading(true)
    try {
      await onSubmit(body.trim())
      setBody('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`flex gap-2 ${compact ? 'mt-1' : ''}`}>
      {!compact && (
        <Avatar src={profile?.avatar_url} name={profile?.full_name ?? profile?.email} size="sm" />
      )}
      <div className="flex-1 flex items-end gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit()
          }}
          placeholder={placeholder}
          rows={compact ? 1 : 2}
          className="flex-1 px-3 py-2 text-sm rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/70 placeholder-white/20 resize-none focus:outline-none focus:ring-1 focus:ring-[#22c55e]/40 focus:bg-white/[0.06] transition-all"
        />
        <Button
          size="sm"
          onClick={submit}
          loading={loading}
          disabled={!body.trim()}
          icon={<Send size={11} />}
        >
          {compact ? '' : 'Send'}
        </Button>
      </div>
    </div>
  )
}
