import { useState } from 'react'
import type { ContentType } from '@/types'
import { useIdeaStore } from '@/store/ideaStore'
import { useAuthStore } from '@/store/authStore'
import { useTeamStore, canSeeAllTeams } from '@/store/teamStore'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { CONTENT_TYPE_LABELS } from '@/lib/constants'
import { X, Link } from 'lucide-react'

interface Props {
  onClose?: () => void
}

const CONTENT_TYPE_OPTIONS = [
  { value: '', label: 'No type yet' },
  ...Object.entries(CONTENT_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l })),
]

export function IdeaForm({ onClose }: Props) {
  const { createIdea } = useIdeaStore()
  const profile = useAuthStore((s) => s.profile)
  const { teams, currentTeamId, myTeamIds } = useTeamStore()
  const { toast } = useToast()
  const showTeamSelector = canSeeAllTeams(profile?.role, myTeamIds)
  const [form, setForm] = useState({ title: '', description: '', content_type: '', reference_url: '', tagInput: '', tags: [] as string[], team_id: currentTeamId ?? '' })
  const [loading, setLoading] = useState(false)

  const addTag = () => {
    const tag = form.tagInput.trim()
    if (tag && !form.tags.includes(tag)) {
      setForm((f) => ({ ...f, tags: [...f.tags, tag], tagInput: '' }))
    }
  }

  const handleSubmit = async () => {
    if (!form.title.trim() || !profile) return
    setLoading(true)
    try {
      await createIdea({
        title: form.title,
        description: form.description || null,
        content_type: (form.content_type as ContentType) || null,
        tags: form.tags,
        reference_url: form.reference_url.trim() || null,
        owner_id: profile.id,
        team_id: form.team_id || currentTeamId || null,
      })
      toast('Idea added to bank')
      onClose?.()
    } catch {
      toast('Failed to save idea', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 bg-[#1a1d27] border border-white/[0.08] rounded-[14px] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30">New Idea</p>
      <Input
        placeholder="What's the idea?"
        value={form.title}
        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
      />
      <Textarea
        placeholder="Any context or details..."
        rows={2}
        value={form.description}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
      />
      <div className="relative">
        <Link size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
        <input
          type="url"
          placeholder="Reference URL (YouTube, TikTok, Instagram…)"
          value={form.reference_url}
          onChange={(e) => setForm((f) => ({ ...f, reference_url: e.target.value }))}
          className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/70 placeholder-white/20 outline-none focus:ring-1 focus:ring-[#22c55e]/40 transition-all"
        />
      </div>
      <Select
        placeholder="Content type (optional)"
        value={form.content_type}
        onChange={(e) => setForm((f) => ({ ...f, content_type: e.target.value }))}
        options={CONTENT_TYPE_OPTIONS}
      />

      {showTeamSelector && teams.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium text-white/40">Team</span>
          <div className="flex flex-wrap gap-1.5">
            {teams.map((t) => {
              const selected = form.team_id === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, team_id: t.id }))}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all"
                  style={{
                    backgroundColor: selected ? `${t.color}20` : 'transparent',
                    borderColor: selected ? `${t.color}60` : 'rgba(255,255,255,0.08)',
                    color: selected ? t.color : 'rgba(255,255,255,0.35)',
                  }}
                >
                  {t.name}
                </button>
              )
            })}
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={form.tagInput}
          onChange={(e) => setForm((f) => ({ ...f, tagInput: e.target.value }))}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          placeholder="Add tags..."
          className="flex-1 px-3 py-2 text-sm rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/70 placeholder-white/20 outline-none focus:ring-1 focus:ring-[#22c55e]/40 transition-all"
        />
        <Button size="sm" variant="secondary" onClick={addTag} type="button">Add</Button>
      </div>
      {form.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {form.tags.map((t) => (
            <span key={t} className="flex items-center gap-1 text-[11px] bg-white/[0.06] text-white/50 px-2 py-0.5 rounded-full">
              {t}
              <button onClick={() => setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) }))} className="hover:text-white/80 transition-colors">
                <X size={9} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2 justify-end">
        {onClose && <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>}
        <Button size="sm" loading={loading} onClick={handleSubmit}>Save Idea</Button>
      </div>
    </div>
  )
}
