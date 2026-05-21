import { useState, type FormEvent } from 'react'
import type { ContentCard, ContentType, Platform } from '@/types'
import { useContentStore } from '@/store/contentStore'
import { useAuthStore } from '@/store/authStore'
import { useTeamStore } from '@/store/teamStore'
import { useFileUpload } from '@/hooks/useFileUpload'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { HashtagInput } from './HashtagInput'
import { FileUploadZone, DriveLink } from './FileUploadZone'
import { CaptionGenerator } from './CaptionGenerator'
import { useToast } from '@/components/ui/Toast'
import {
  CONTENT_TYPE_LABELS,
  PLATFORM_LABELS,
  PLATFORM_COLORS,
  SELECTABLE_PLATFORMS,
} from '@/lib/constants'
import { Link2, HardDrive, Hash } from 'lucide-react'
import { RichTextEditor } from '@/components/ui/RichTextEditor'

interface Props {
  card?: ContentCard
  onSave: (card: ContentCard) => void
  onCancel?: () => void
}

const CONTENT_TYPES = Object.entries(CONTENT_TYPE_LABELS).map(([value, label]) => ({ value, label }))

function generateContentId(type: ContentType): string {
  const prefix = type.slice(0, 3).toUpperCase()
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `KCR-${prefix}-${suffix}`
}

export function ContentCardForm({ card, onSave, onCancel }: Props) {
  const { upsertCard } = useContentStore()
  const { profile } = useAuthStore()
  const { currentTeamId } = useTeamStore()
  const { toast } = useToast()

  const cardId = card?.id ?? crypto.randomUUID()
  const { upload, uploading } = useFileUpload(cardId)

  const initialPlatforms = card?.platforms?.length
    ? card.platforms
    : card?.platform
    ? [card.platform]
    : []

  const [form, setForm] = useState({
    id: cardId,
    content_id: card?.content_id ?? '',
    title: card?.title ?? '',
    content_type: (card?.content_type ?? 'static_post') as ContentType,
    platform: (card?.platform ?? 'instagram_feed') as Platform,
    platforms: initialPlatforms as string[],
    caption: card?.caption ?? '',
    hashtags: card?.hashtags ?? [],
    scheduled_date: card?.scheduled_date
      ? card.scheduled_date.slice(0, 16)
      : '',
    ready_by: (card as ContentCard & { ready_by?: string | null })?.ready_by
      ? ((card as ContentCard & { ready_by?: string | null }).ready_by as string).slice(0, 10)
      : '',
    notes: card?.notes ?? '',
    drive_link: card?.drive_link ?? '',
    file_path: card?.file_path ?? '',
    file_url: card?.file_url ?? '',
    owner_id: card?.owner_id ?? profile?.id ?? '',
    status: card?.status ?? 'idea',
  })

  const [contentTab, setContentTab] = useState<'brief' | 'caption'>('brief')

  const [fileMode, setFileMode] = useState<'upload' | 'drive'>(
    card?.drive_link ? 'drive' : 'upload'
  )
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const togglePlatform = (p: string) => {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(p)
        ? f.platforms.filter((x) => x !== p)
        : [...f.platforms, p],
    }))
  }

  const handleFile = async (file: File) => {
    const result = await upload(file)
    if (result) {
      set('file_path', result.path)
      set('file_url', result.url)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    try {
      const primaryPlatform = (form.platforms[0] ?? form.platform) as Platform
      const payload: Partial<ContentCard> = {
        ...form,
        platform: primaryPlatform,
        platforms: form.platforms,
        content_id: form.content_id || null,
        scheduled_date: form.scheduled_date ? new Date(form.scheduled_date).toISOString() : null,
        ready_by: form.ready_by ? new Date(form.ready_by).toISOString() : null,
        drive_link: fileMode === 'drive' ? form.drive_link || null : null,
        file_path: fileMode === 'upload' ? form.file_path || null : null,
        file_url: fileMode === 'upload' ? form.file_url || null : null,
        caption: form.caption || null,
        notes: form.notes || null,
        assigned_reviewer_id: card?.assigned_reviewer_id ?? null,
        team_id: card?.team_id ?? currentTeamId ?? null,
      } as Partial<ContentCard>
      const saved = await upsertCard(payload)
      toast(card ? 'Card updated' : 'Card created')
      onSave(saved)
    } catch {
      toast('Failed to save card', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Content ID */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Input
            label="Content ID"
            value={form.content_id}
            onChange={(e) => set('content_id', e.target.value)}
            placeholder="Auto-generated or custom (e.g. KCR-REE-001)"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          icon={<Hash size={12} />}
          onClick={() => set('content_id', generateContentId(form.content_type))}
          className="shrink-0 mb-0.5"
        >
          Generate
        </Button>
      </div>

      <Input
        label="Title *"
        value={form.title}
        onChange={(e) => set('title', e.target.value)}
        placeholder="Post title or topic"
        required
      />

      <Select
        label="Content Type"
        value={form.content_type}
        onChange={(e) => set('content_type', e.target.value as ContentType)}
        options={CONTENT_TYPES}
      />

      {/* Multi-platform select */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-white/50">Platforms</span>
        <div className="flex flex-wrap gap-1.5">
          {SELECTABLE_PLATFORMS.map((p) => {
            const selected = form.platforms.includes(p)
            const color = PLATFORM_COLORS[p] ?? '#6b7280'
            return (
              <button
                key={p}
                type="button"
                onClick={() => togglePlatform(p)}
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all"
                style={{
                  backgroundColor: selected ? `${color}20` : 'transparent',
                  borderColor: selected ? `${color}50` : 'rgba(255,255,255,0.08)',
                  color: selected ? color : 'rgba(255,255,255,0.35)',
                }}
              >
                {PLATFORM_LABELS[p]}
              </button>
            )
          })}
        </div>
        {form.platforms.length === 0 && (
          <p className="text-[10px] text-white/25">Select at least one platform</p>
        )}
      </div>

      {/* Date fields */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Post Date"
          type="datetime-local"
          value={form.scheduled_date}
          onChange={(e) => set('scheduled_date', e.target.value)}
        />
        <Input
          label="Ready By"
          type="date"
          value={form.ready_by}
          onChange={(e) => set('ready_by', e.target.value)}
        />
      </div>

      {/* Media */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 mb-1">
          <button
            type="button"
            onClick={() => setFileMode('upload')}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
              fileMode === 'upload'
                ? 'border-[#22c55e]/60 text-[#22c55e] bg-[#22c55e]/10'
                : 'border-white/[0.08] text-white/35 hover:border-white/[0.15]'
            }`}
          >
            <HardDrive size={12} /> Upload File
          </button>
          <button
            type="button"
            onClick={() => setFileMode('drive')}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
              fileMode === 'drive'
                ? 'border-[#22c55e]/60 text-[#22c55e] bg-[#22c55e]/10'
                : 'border-white/[0.08] text-white/35 hover:border-white/[0.15]'
            }`}
          >
            <Link2 size={12} /> Drive Link
          </button>
        </div>
        {fileMode === 'upload' ? (
          <FileUploadZone
            onFile={handleFile}
            currentUrl={form.file_url}
            uploading={uploading}
            onClear={() => { set('file_path', ''); set('file_url', '') }}
          />
        ) : (
          <DriveLink value={form.drive_link} onChange={(v) => set('drive_link', v)} />
        )}
      </div>

      {/* Brief / Caption toggle */}
      <div className="flex flex-col gap-3 rounded-xl border border-white/[0.06] overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
        <div className="flex border-b border-white/[0.06]">
          {(['brief', 'caption'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setContentTab(t)}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                contentTab === t
                  ? 'border-[#22c55e] text-[#22c55e]'
                  : 'border-transparent text-white/30 hover:text-white/60'
              }`}
            >
              {t === 'brief' ? 'Brief' : 'Caption'}
            </button>
          ))}
        </div>
        <div className="px-3 pb-3 flex flex-col gap-3">
          {contentTab === 'brief' ? (
            <RichTextEditor
              value={form.notes}
              onChange={(v) => set('notes', v)}
              placeholder="Write the content brief — objectives, tone, key messages, references…"
              rows={7}
            />
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <RichTextEditor
                  value={form.caption}
                  onChange={(v) => set('caption', v)}
                  placeholder="Write your social media caption…"
                  rows={4}
                />
                <CaptionGenerator
                  title={form.title}
                  contentType={form.content_type}
                  platform={form.platform}
                  notes={form.notes}
                  onSelect={(c) => set('caption', c)}
                />
              </div>
              <HashtagInput value={form.hashtags} onChange={(v) => set('hashtags', v)} />
            </>
          )}
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        )}
        <Button type="submit" size="sm" loading={saving || uploading}>
          {card ? 'Save Changes' : 'Create Card'}
        </Button>
      </div>
    </form>
  )
}
