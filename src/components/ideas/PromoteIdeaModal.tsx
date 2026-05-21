import { useState } from 'react'
import type { Idea, ContentCard } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { ContentCardForm } from '@/components/content/ContentCardForm'
import { useIdeaStore } from '@/store/ideaStore'
import { useToast } from '@/components/ui/Toast'
import { useNavigate } from 'react-router-dom'

interface Props {
  idea: Idea
  open: boolean
  onClose: () => void
}

export function PromoteIdeaModal({ idea, open, onClose }: Props) {
  const { promoteIdea } = useIdeaStore()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [done, setDone] = useState(false)

  const handleSave = async (card: ContentCard) => {
    try {
      await promoteIdea(idea.id, card.id)
      toast('Idea promoted to pipeline!')
      setDone(true)
      onClose()
      navigate(`/content/${card.id}`)
    } catch {
      toast('Failed to promote idea', 'error')
    }
  }

  if (done) return null

  const prefill: Partial<ContentCard> = {
    id: crypto.randomUUID(),
    title: idea.title,
    notes: idea.description ?? undefined,
    content_type: idea.content_type ?? 'static_post',
    platform: 'instagram',
    status: 'submitted',
    hashtags: [],
  }

  return (
    <Modal open={open} onClose={onClose} title="Promote Idea to Pipeline" size="lg">
      <p className="text-xs text-gray-400 mb-4">
        Fill in the details and this idea will become a content card in your pipeline.
      </p>
      <ContentCardForm card={prefill as ContentCard} onSave={handleSave} onCancel={onClose} />
    </Modal>
  )
}
