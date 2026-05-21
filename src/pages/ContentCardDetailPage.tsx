import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { ContentCard, ContentStatus } from '@/types'
import { useContentStore } from '@/store/contentStore'
import { useComments } from '@/hooks/useComments'
import { ContentCardForm } from '@/components/content/ContentCardForm'
import { StatusBadge } from '@/components/content/StatusBadge'
import { StatusTransitionButton } from '@/components/content/StatusTransitionButton'
import { StatusHistoryTimeline } from '@/components/content/StatusHistory'
import { SocialPreviewPanel } from '@/components/preview/SocialPreviewPanel'
import { CommentThread } from '@/components/comments/CommentThread'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'
import { CONTENT_TYPE_LABELS, PLATFORM_LABELS } from '@/lib/constants'
import { formatDate } from '@/lib/dateUtils'
import { Edit3, ArrowLeft, Trash2, FileText, MessageSquare, ExternalLink, FolderOpen, Calendar, CheckCircle2, Circle, Link2 } from 'lucide-react'
import { renderMarkdown } from '@/components/ui/RichTextEditor'
import { useToast } from '@/components/ui/Toast'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'

// ─── Pipeline progress bar ────────────────────────────────────────────────────

interface PipelineStep {
  label: string
  statuses: ContentStatus[]
}

const PIPELINE_STEPS: PipelineStep[] = [
  { label: 'Brief',          statuses: ['idea', 'brief_ready'] },
  { label: 'In Design',      statuses: ['in_design'] },
  { label: 'Submitted',      statuses: ['submitted'] },
  { label: 'In Review',      statuses: ['in_review', 'resubmitted'] },
  { label: 'Corrections',    statuses: ['corrections_needed'] },
  { label: 'Stuart',         statuses: ['stuart_approval'] },
  { label: 'Sergei',         statuses: ['sergei_approval'] },
  { label: 'Scheduled',      statuses: ['caption_scheduling', 'scheduled'] },
  { label: 'Posted',         statuses: ['posted'] },
]

function getStepIndex(status: ContentStatus): number {
  for (let i = 0; i < PIPELINE_STEPS.length; i++) {
    if ((PIPELINE_STEPS[i].statuses as string[]).includes(status)) return i
  }
  return 0
}

function PipelineProgressBar({ status }: { status: ContentStatus }) {
  const currentIdx = getStepIndex(status)

  return (
    <div
      className="px-4 py-3 rounded-[14px] border border-white/[0.06]"
      style={{ backgroundColor: '#1a1d27' }}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">
        Approval Pipeline
      </p>
      <div className="flex items-center gap-0">
        {PIPELINE_STEPS.map((step, i) => {
          const isDone = i < currentIdx
          const isCurrent = i === currentIdx

          return (
            <div key={step.label} className="flex items-center flex-1 min-w-0">
              {/* Step node */}
              <div className="flex flex-col items-center gap-1 relative z-10">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all shrink-0"
                  style={{
                    backgroundColor: isDone ? '#22c55e' : isCurrent ? '#22c55e' : 'rgba(255,255,255,0.06)',
                    borderColor: isDone ? '#22c55e' : isCurrent ? '#22c55e' : 'rgba(255,255,255,0.12)',
                    boxShadow: isCurrent ? '0 0 10px rgba(34,197,94,0.5)' : undefined,
                  }}
                >
                  {isDone ? (
                    <CheckCircle2 size={13} className="text-white" />
                  ) : isCurrent ? (
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse-dot" />
                  ) : (
                    <Circle size={8} className="text-white/20" />
                  )}
                </div>
                <span
                  className="text-[8px] font-bold uppercase tracking-wide whitespace-nowrap"
                  style={{
                    color: isDone
                      ? 'rgba(34,197,94,0.8)'
                      : isCurrent
                      ? '#22c55e'
                      : 'rgba(255,255,255,0.2)',
                  }}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line (not after last step) */}
              {i < PIPELINE_STEPS.length - 1 && (
                <div
                  className="h-0.5 flex-1 mx-1 mt-[-10px] rounded-full transition-all"
                  style={{
                    backgroundColor:
                      i < currentIdx
                        ? '#22c55e'
                        : 'rgba(255,255,255,0.08)',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Brief/Caption toggle view ────────────────────────────────────────────────

type ContentTab = 'brief' | 'caption'
type BriefMode = 'write' | 'link'

function BriefCaptionView({ card, onSaveBriefLink }: { card: ContentCard; onSaveBriefLink: (link: string) => void }) {
  const [tab, setTab] = useState<ContentTab>('brief')
  const briefLink = (card as ContentCard & { brief_link?: string | null }).brief_link
  const [briefMode, setBriefMode] = useState<BriefMode>(briefLink ? 'link' : 'write')
  const [linkValue, setLinkValue] = useState(briefLink ?? '')
  const [savingLink, setSavingLink] = useState(false)
  const { toast } = useToast()

  const handleSaveLink = async () => {
    setSavingLink(true)
    try {
      await supabase.from('content_cards').update({ brief_link: linkValue || null }).eq('id', card.id)
      onSaveBriefLink(linkValue)
      toast('Brief link saved')
    } catch {
      toast('Failed to save', 'error')
    } finally {
      setSavingLink(false)
    }
  }

  return (
    <div
      className="rounded-[14px] border border-white/[0.06] overflow-hidden"
      style={{ backgroundColor: '#1a1d27' }}
    >
      {/* Toggle tabs */}
      <div className="flex border-b border-white/[0.06]">
        {(
          [
            { v: 'brief', label: 'Brief', icon: <FileText size={12} /> },
            { v: 'caption', label: 'Caption', icon: <MessageSquare size={12} /> },
          ] as const
        ).map(({ v, label, icon }) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              tab === v
                ? 'border-[#22c55e] text-[#22c55e]'
                : 'border-transparent text-white/30 hover:text-white/60'
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {tab === 'brief' ? (
          <div className="flex flex-col gap-3">
            {/* Write / Link toggle */}
            <div className="flex items-center gap-1 p-0.5 bg-white/[0.04] border border-white/[0.06] rounded-lg w-fit">
              {(
                [
                  { v: 'write', label: 'Write in-app', icon: <FileText size={11} /> },
                  { v: 'link',  label: 'Link to Brief', icon: <Link2 size={11} /> },
                ] as const
              ).map(({ v, label, icon }) => (
                <button
                  key={v}
                  onClick={() => setBriefMode(v)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    briefMode === v
                      ? 'bg-[#22c55e]/20 text-[#22c55e]'
                      : 'text-white/30 hover:text-white/60'
                  }`}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>

            {briefMode === 'write' ? (
              card.notes ? (
                <div
                  className="rich-preview"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(card.notes) }}
                />
              ) : (
                <p className="text-sm text-white/25 italic">No brief written yet. Edit this card to add one.</p>
              )
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-white/30">Paste a Google Docs link to the content brief.</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link2 size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                    <input
                      type="url"
                      value={linkValue}
                      onChange={(e) => setLinkValue(e.target.value)}
                      placeholder="https://docs.google.com/document/d/..."
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/70 placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#22c55e]/40 transition-all"
                    />
                  </div>
                  <button
                    onClick={handleSaveLink}
                    disabled={savingLink || linkValue === (briefLink ?? '')}
                    className="px-3 py-2 text-xs font-bold rounded-xl text-white transition-all disabled:opacity-40"
                    style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}
                  >
                    {savingLink ? '…' : 'Save'}
                  </button>
                </div>
                {briefLink && (
                  <a
                    href={briefLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-[#22c55e] hover:text-[#4ade80] transition-colors"
                  >
                    <ExternalLink size={11} />
                    Open brief in Google Docs
                  </a>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {card.caption ? (
              <p className="text-sm text-white/65 leading-relaxed">{card.caption}</p>
            ) : (
              <p className="text-sm text-white/25 italic">No caption yet.</p>
            )}
            {card.hashtags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {card.hashtags.map((h) => (
                  <span key={h} className="text-xs text-[#4ade80]">#{h}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Final Output section ─────────────────────────────────────────────────────

function FinalOutputSection({ card, onSave }: { card: ContentCard; onSave: (link: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(card.drive_link ?? '')
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setSaving(true)
    try {
      await supabase.from('content_cards').update({ drive_link: value || null }).eq('id', card.id)
      onSave(value)
      setEditing(false)
      toast('Drive link saved')
    } catch {
      toast('Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="rounded-[14px] border border-white/[0.06] p-4"
      style={{ backgroundColor: '#1a1d27' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <FolderOpen size={14} className="text-[#22c55e]" />
        <h4 className="text-[11px] font-bold uppercase tracking-widest text-white/40">Final Output</h4>
      </div>

      {editing ? (
        <div className="flex gap-2">
          <input
            type="url"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Paste final asset Google Drive link here…"
            className="flex-1 px-3 py-2 text-sm rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/80 placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#22c55e]/40 transition-all"
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-2 text-xs font-bold rounded-xl text-white transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}
          >
            {saving ? '…' : 'Save'}
          </button>
          <button
            onClick={() => { setValue(card.drive_link ?? ''); setEditing(false) }}
            className="px-3 py-2 text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : card.drive_link ? (
        <div className="flex items-center gap-2">
          <a
            href={card.drive_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-[#22c55e] hover:text-[#4ade80] transition-colors truncate flex-1"
          >
            <ExternalLink size={12} />
            {card.drive_link}
          </a>
          <button
            onClick={() => setEditing(true)}
            className="text-[11px] text-white/30 hover:text-white/60 shrink-0 transition-colors"
          >
            Edit
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="w-full py-3 rounded-xl border border-dashed text-sm text-white/25 hover:text-[#22c55e] hover:border-[#22c55e]/40 transition-all"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          Paste final asset link when creative is complete
        </button>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

interface Props {
  mode?: 'create' | 'edit'
}

export function ContentCardDetailPage({ mode }: Props) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { cards, fetchCards, deleteCard, patchCard } = useContentStore()
  const { toast } = useToast()
  const profile = useAuthStore((s) => s.profile)
  const [editing, setEditing] = useState(mode === 'create')
  const [card, setCard] = useState<ContentCard | null>(null)

  const isNew = mode === 'create' || id === 'new'

  useEffect(() => {
    if (!isNew && id) {
      const found = cards.find((c) => c.id === id)
      if (found) {
        setCard(found)
      } else {
        fetchCards().then(() => {
          const c = useContentStore.getState().cards.find((c) => c.id === id)
          if (c) setCard(c)
        })
      }
    }
  }, [id, cards])

  const { comments, loading: commentsLoading, addComment, resolveComment } = useComments(
    card?.id ?? '__none__',
  )

  if (!isNew && !card) return <PageSpinner />

  const handleSave = (saved: ContentCard) => {
    setCard(saved)
    setEditing(false)
    if (isNew) navigate(`/content/${saved.id}`, { replace: true })
  }

  const handleDelete = async () => {
    if (!card || !confirm('Delete this card?')) return
    try {
      await deleteCard(card.id)
      toast('Card deleted')
      navigate('/pipeline')
    } catch {
      toast('Failed to delete card', 'error')
    }
  }

  const handleDriveLinkSave = (link: string) => {
    if (card) {
      const updated = { ...card, drive_link: link || null }
      setCard(updated)
      patchCard(updated)
    }
  }

  const handleBriefLinkSave = (link: string) => {
    if (card) {
      const updated = { ...card, brief_link: link || null }
      setCard(updated)
      patchCard(updated)
    }
  }

  const canEdit =
    profile && (card?.owner_id === profile.id || ['manager', 'admin'].includes(profile.role))
  const canDelete = profile && ['manager', 'admin'].includes(profile.role)

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden">
      {/* ── Left: Details ── */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4 min-w-0">
        {/* Header */}
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all shrink-0 mt-0.5"
          >
            <ArrowLeft size={15} />
          </button>
          <div className="flex-1 min-w-0">
            {card && <h1 className="text-lg font-bold text-white leading-snug">{card.title}</h1>}
            {isNew && <h1 className="text-lg font-bold text-white">New Content Card</h1>}
            {card && (
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <StatusBadge status={card.status} />
                <span className="text-xs text-white/30">
                  {CONTENT_TYPE_LABELS[card.content_type]} · {PLATFORM_LABELS[card.platform]}
                </span>
                {card.content_id && (
                  <span className="font-mono text-[10px] text-white/25 bg-white/[0.05] px-1.5 py-0.5 rounded">
                    {card.content_id}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-1.5 shrink-0">
            {canEdit && !isNew && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditing((v) => !v)}
                icon={<Edit3 size={13} />}
              >
                {editing ? 'Cancel' : 'Edit'}
              </Button>
            )}
            {canDelete && card && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                icon={<Trash2 size={13} />}
                className="text-red-400 hover:text-red-500"
              />
            )}
          </div>
        </div>

        {/* Pipeline progress bar — always visible in view mode */}
        {card && !editing && <PipelineProgressBar status={card.status} />}

        {/* Status transitions */}
        {card && !editing && <StatusTransitionButton card={card} />}

        {/* Date metadata row */}
        {card && !editing && (
          <div className="flex flex-wrap items-center gap-4">
            {card.scheduled_date && (
              <div className="flex items-center gap-1.5">
                <Calendar size={12} className="text-[#22c55e]" />
                <span className="text-[11px] text-white/40 font-medium">
                  Post Date: <span className="text-white/60">{formatDate(card.scheduled_date)}</span>
                </span>
              </div>
            )}
            {(card as ContentCard & { ready_by?: string | null }).ready_by && (
              <div className="flex items-center gap-1.5">
                <Calendar size={12} className="text-[#f59e0b]" />
                <span className="text-[11px] text-white/40 font-medium">
                  Ready By:{' '}
                  <span className="text-white/60">
                    {formatDate((card as ContentCard & { ready_by?: string | null }).ready_by!)}
                  </span>
                </span>
              </div>
            )}
            {card.owner && (
              <div className="flex items-center gap-1.5 ml-auto">
                <Avatar src={card.owner.avatar_url} name={card.owner.full_name ?? card.owner.email} size="xs" />
                <span className="text-[11px] text-white/30">
                  {card.owner.full_name ?? card.owner.email}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Form OR read-only detail view */}
        {editing || isNew ? (
          <ContentCardForm
            card={card ?? undefined}
            onSave={handleSave}
            onCancel={isNew ? () => navigate(-1) : () => setEditing(false)}
          />
        ) : card ? (
          <div className="flex flex-col gap-4">
            {/* Brief / Caption toggle */}
            <BriefCaptionView card={card} onSaveBriefLink={handleBriefLinkSave} />

            {/* Final Output */}
            <FinalOutputSection card={card} onSave={handleDriveLinkSave} />

            {/* Status history */}
            <div
              className="rounded-[14px] border border-white/[0.06] p-4"
              style={{ backgroundColor: '#1a1d27' }}
            >
              <StatusHistoryTimeline cardId={card.id} />
            </div>

            {/* Comments */}
            <div
              className="rounded-[14px] border border-white/[0.06] p-4"
              style={{ backgroundColor: '#1a1d27' }}
            >
              <CommentThread
                comments={comments}
                loading={commentsLoading}
                onAdd={addComment}
                onResolve={resolveComment}
              />
            </div>
          </div>
        ) : null}
      </div>

      {/* ── Right: Preview ── */}
      {card && !editing && (
        <div
          className="lg:w-[520px] xl:w-[580px] border-t lg:border-t-0 lg:border-l border-white/[0.06] p-4 md:p-5 overflow-y-auto"
          style={{ backgroundColor: '#0f1117' }}
        >
          <SocialPreviewPanel card={card} />
        </div>
      )}
    </div>
  )
}
