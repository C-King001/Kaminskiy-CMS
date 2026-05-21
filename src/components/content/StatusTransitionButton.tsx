import { useState } from 'react'
import type { ContentCard, ContentStatus } from '@/types'
import { useAuthStore } from '@/store/authStore'
import { useContentStore } from '@/store/contentStore'
import { ALLOWED_TRANSITIONS, TRANSITION_ROLES, STATUS_LABELS } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'

interface Props {
  card: ContentCard
}

const BUTTON_LABELS: Partial<Record<ContentStatus, string>> = {
  brief_ready: 'Mark Brief Ready',
  in_design: 'Send to Designer',
  submitted: 'Submit for Review',
  in_review: 'Start Review',
  corrections_needed: 'Request Corrections',
  resubmitted: 'Resubmit',
  stuart_approval: 'Send to Stuart',
  sergei_approval: 'Send to Sergei',
  caption_scheduling: 'Ready to Schedule',
  scheduled: 'Mark Scheduled',
  posted: 'Mark as Posted',
}

const VARIANT_MAP: Partial<Record<ContentStatus, 'primary' | 'danger' | 'secondary' | 'outline'>> = {
  sergei_approval: 'primary',
  scheduled: 'primary',
  posted: 'secondary',
  corrections_needed: 'danger',
}

// Statuses that require a note/reason before transitioning
const REQUIRES_NOTE = new Set<ContentStatus>(['corrections_needed'])

export function StatusTransitionButton({ card }: Props) {
  const profile = useAuthStore((s) => s.profile)
  const { transitionStatus } = useContentStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [noteModal, setNoteModal] = useState<ContentStatus | null>(null)
  const [note, setNote] = useState('')

  if (!profile) return null

  const allowed = ALLOWED_TRANSITIONS[card.status] ?? []
  const validTransitions = allowed.filter((to) => TRANSITION_ROLES[to]?.includes(profile.role))

  if (validTransitions.length === 0) return null

  const execute = async (to: ContentStatus, withNote?: string) => {
    setLoading(true)
    try {
      await transitionStatus(card.id, to, withNote)
      toast(`Status → ${STATUS_LABELS[to]}`)
      setNoteModal(null)
      setNote('')
    } catch {
      toast('Failed to update status', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {validTransitions.map((to) => (
          <Button
            key={to}
            size="sm"
            variant={VARIANT_MAP[to] ?? 'outline'}
            loading={loading}
            onClick={() => {
              if (REQUIRES_NOTE.has(to)) {
                setNoteModal(to)
              } else {
                execute(to)
              }
            }}
          >
            {BUTTON_LABELS[to] ?? STATUS_LABELS[to]}
          </Button>
        ))}
      </div>

      <Modal
        open={noteModal !== null}
        onClose={() => setNoteModal(null)}
        title="Request Corrections"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <Textarea
            label="Feedback for creator"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Explain what needs to be corrected..."
            rows={4}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setNoteModal(null)}>Cancel</Button>
            <Button
              variant="danger"
              size="sm"
              loading={loading}
              onClick={() => execute(noteModal!, note)}
            >
              Send Feedback
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
