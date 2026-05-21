import { useState, useEffect } from 'react'
import type { Idea, ContentType } from '@/types'
import { useIdeaStore } from '@/store/ideaStore'
import { useToast } from '@/components/ui/Toast'
import { Avatar } from '@/components/ui/Avatar'
import { RichTextEditor, renderMarkdown } from '@/components/ui/RichTextEditor'
import { CONTENT_TYPE_COLORS, CONTENT_TYPE_LABELS } from '@/lib/constants'
import { formatRelative } from '@/lib/dateUtils'
import { PromoteIdeaModal } from './PromoteIdeaModal'
import {
  X, Link2, ArrowRight, ExternalLink, Play, Youtube, Trash2,
} from 'lucide-react'

// ─── Video helpers ────────────────────────────────────────────────────────────

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

function getTikTokId(url: string): string | null {
  const m = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/)
  return m ? m[1] : null
}

function getInstagramCode(url: string): string | null {
  const m = url.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/)
  return m ? m[1] : null
}

function VideoEmbed({ url }: { url: string }) {
  const ytId = getYouTubeId(url)
  const ttId = getTikTokId(url)
  const igCode = getInstagramCode(url)

  if (ytId) {
    return (
      <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={`https://www.youtube.com/embed/${ytId}`}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube video"
        />
      </div>
    )
  }

  if (ttId) {
    return (
      <div className="flex justify-center">
        <iframe
          src={`https://www.tiktok.com/embed/v2/${ttId}`}
          className="rounded-xl"
          width="340"
          height="700"
          allow="encrypted-media"
          title="TikTok video"
          style={{ maxWidth: '100%' }}
        />
      </div>
    )
  }

  if (igCode) {
    return (
      <div className="rounded-xl overflow-hidden" style={{ maxHeight: 480 }}>
        <iframe
          src={`https://www.instagram.com/p/${igCode}/embed`}
          className="w-full"
          height="480"
          scrolling="no"
          style={{ border: 'none', overflow: 'hidden' }}
          title="Instagram post"
        />
      </div>
    )
  }

  // Generic link fallback
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.08] hover:border-[#22c55e]/40 transition-all group"
      style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
    >
      <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
        <Play size={13} className="text-white/40" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white/60 truncate group-hover:text-white/80 transition-colors">{url}</p>
        <p className="text-[10px] text-white/25">Open link</p>
      </div>
      <ExternalLink size={12} className="text-white/25 shrink-0" />
    </a>
  )
}

// ─── Main drawer ──────────────────────────────────────────────────────────────

interface Props {
  idea: Idea
  onClose: () => void
  onDelete: (id: string) => void
}

export function IdeaDetailDrawer({ idea, onClose, onDelete }: Props) {
  const { updateIdea } = useIdeaStore()
  const { toast } = useToast()
  const [promoteOpen, setPromoteOpen] = useState(false)

  // Editable fields
  const [title, setTitle] = useState(idea.title)
  const [description, setDescription] = useState(idea.description ?? '')
  const [refUrl, setRefUrl] = useState(idea.reference_url ?? '')
  const [refUrlInput, setRefUrlInput] = useState(idea.reference_url ?? '')
  const [editingRef, setEditingRef] = useState(!idea.reference_url)
  const [saving, setSaving] = useState(false)

  const typeColor = idea.content_type ? CONTENT_TYPE_COLORS[idea.content_type] : '#6b7280'
  const typeLabel = idea.content_type ? CONTENT_TYPE_LABELS[idea.content_type] : null

  // Auto-save description after short debounce
  useEffect(() => {
    if (description === (idea.description ?? '')) return
    const t = setTimeout(async () => {
      try {
        await updateIdea(idea.id, { description: description || null })
      } catch {
        // silently fail
      }
    }, 800)
    return () => clearTimeout(t)
  }, [description])

  const saveRefUrl = async () => {
    setSaving(true)
    try {
      await updateIdea(idea.id, { reference_url: refUrlInput.trim() || null })
      setRefUrl(refUrlInput.trim())
      setEditingRef(false)
      toast('Reference link saved')
    } catch {
      toast('Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  const saveTitle = async () => {
    if (title.trim() === idea.title) return
    try {
      await updateIdea(idea.id, { title: title.trim() })
    } catch {
      setTitle(idea.title)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden animate-slide-in-right"
        style={{
          width: 'min(480px, 100vw)',
          backgroundColor: '#13151f',
          borderLeft: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.07] shrink-0">
          {typeLabel && (
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shrink-0"
              style={{ backgroundColor: `${typeColor}22`, color: typeColor }}
            >
              {typeLabel}
            </span>
          )}
          <button
            onClick={onClose}
            className="ml-auto p-2 rounded-xl text-white/25 hover:text-white/70 hover:bg-white/[0.06] transition-all shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">

          {/* Title */}
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            rows={2}
            className="w-full text-lg font-bold text-white/90 bg-transparent focus:outline-none resize-none leading-tight placeholder-white/20"
            placeholder="Idea title…"
          />

          {/* Tags + meta */}
          <div className="flex items-center gap-2 flex-wrap">
            <Avatar src={idea.owner?.avatar_url} name={idea.owner?.full_name} size="xs" />
            <span className="text-[11px] text-white/30">{formatRelative(idea.created_at)}</span>
            {idea.tags.map((t) => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-white/40">{t}</span>
            ))}
          </div>

          {/* Reference URL section */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2 flex items-center gap-1.5">
              <Link2 size={10} />
              Reference Video / Link
            </p>

            {refUrl && !editingRef ? (
              <div className="flex flex-col gap-2">
                <VideoEmbed url={refUrl} />
                <div className="flex gap-2 mt-1">
                  <a
                    href={refUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] text-[#22c55e] hover:text-[#4ade80] transition-colors"
                  >
                    <ExternalLink size={10} />
                    Open original
                  </a>
                  <button
                    onClick={() => { setRefUrlInput(refUrl); setEditingRef(true) }}
                    className="text-[11px] text-white/30 hover:text-white/60 transition-colors ml-auto"
                  >
                    Change link
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <Youtube size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                  <input
                    type="url"
                    value={refUrlInput}
                    onChange={(e) => setRefUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveRefUrl()}
                    placeholder="Paste YouTube, TikTok, Instagram or any URL…"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/70 placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#22c55e]/40 transition-all"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={saveRefUrl}
                    disabled={saving || !refUrlInput.trim()}
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-40 btn-glow"
                    style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)' }}
                  >
                    {saving ? 'Saving…' : 'Save Link'}
                  </button>
                  {refUrl && (
                    <button
                      onClick={() => { setRefUrlInput(refUrl); setEditingRef(false) }}
                      className="px-3 py-2 rounded-xl border border-white/[0.08] text-xs text-white/40 hover:text-white/70 transition-all"
                    >
                      Cancel
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-white/20">
                  YouTube and TikTok videos will play inline. Instagram posts will embed. Any link will open in a new tab.
                </p>
              </div>
            )}
          </div>

          {/* Description / Notes (rich text) */}
          <RichTextEditor
            label="Notes & Context"
            value={description}
            onChange={setDescription}
            placeholder="Add context, inspiration, direction, or anything the team should know…"
            rows={6}
          />
          {description !== (idea.description ?? '') && (
            <p className="text-[10px] text-white/20 -mt-3">Auto-saving…</p>
          )}

        </div>

        {/* Footer actions */}
        <div className="shrink-0 border-t border-white/[0.07] px-5 py-4 flex gap-2">
          <button
            onClick={() => setPromoteOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white btn-glow transition-all"
            style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)' }}
          >
            <ArrowRight size={14} />
            Promote to Post
          </button>
          <button
            onClick={() => {
              if (confirm('Delete this idea?')) onDelete(idea.id)
            }}
            className="p-2.5 rounded-xl border border-white/[0.08] text-white/30 hover:text-red-400 hover:border-red-400/30 transition-all"
          >
            <Trash2 size={15} />
          </button>
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
