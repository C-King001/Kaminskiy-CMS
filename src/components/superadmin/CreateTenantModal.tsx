import { useState } from 'react'
import { X, Building2, Loader2 } from 'lucide-react'
import { useSuperAdminStore } from '@/store/superAdminStore'
import type { TenantPlan } from '@/types/tenant'

const PLAN_OPTIONS: { value: TenantPlan; label: string; description: string; color: string }[] = [
  { value: 'free', label: 'Free', description: '2 members · 1 team · 30 posts/mo', color: '#6b7280' },
  { value: 'pro', label: 'Pro', description: '10 members · 3 teams · unlimited posts', color: '#3b82f6' },
  { value: 'agency', label: 'Agency', description: 'Unlimited members, teams & posts', color: '#8b5cf6' },
]

const PRESET_COLORS = [
  '#22c55e', '#3b82f6', '#8b5cf6', '#f97316',
  '#ec4899', '#14b8a6', '#f59e0b', '#ef4444',
]

interface Props {
  onClose: () => void
}

export function CreateTenantModal({ onClose }: Props) {
  const { createTenant } = useSuperAdminStore()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    slug: '',
    plan: 'pro' as TenantPlan,
    primary_color: '#22c55e',
    owner_name: '',
    owner_email: '',
    logo_url: null as string | null,
  })

  function slugify(val: string) {
    return val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  function set<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: val }))
    if (key === 'name') {
      setForm((f) => ({ ...f, name: val as string, slug: slugify(val as string) }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Workspace name is required.'); return }
    if (!form.owner_email.trim()) { setError('Owner email is required.'); return }
    setSaving(true)
    setError('')
    try {
      await createTenant(form)
      onClose()
    } catch {
      setError('Failed to create tenant. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div
        className="w-full max-w-lg rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden"
        style={{ backgroundColor: '#1a1d27' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: form.primary_color + '22', border: `1px solid ${form.primary_color}44` }}
            >
              <Building2 size={16} style={{ color: form.primary_color }} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Create Workspace</h2>
              <p className="text-xs text-white/30">Provision a new client tenant</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.05] transition-all">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {/* Workspace name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">Workspace Name</label>
            <input
              type="text"
              placeholder="e.g. Acme Corp"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-white/20 outline-none focus:border-violet-500/40 transition-colors"
            />
          </div>

          {/* Slug */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">URL Slug</label>
            <div className="flex items-center gap-0 rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.04] focus-within:border-violet-500/40 transition-colors">
              <span className="px-3 py-2.5 text-sm text-white/25 bg-white/[0.02] border-r border-white/[0.06] shrink-0">
                app.cms.com/
              </span>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                className="flex-1 px-3 py-2.5 bg-transparent text-white text-sm placeholder:text-white/20 outline-none"
                placeholder="acme-corp"
              />
            </div>
          </div>

          {/* Owner */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">Owner Name</label>
              <input
                type="text"
                placeholder="Jane Smith"
                value={form.owner_name}
                onChange={(e) => set('owner_name', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-white/20 outline-none focus:border-violet-500/40 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">Owner Email</label>
              <input
                type="email"
                placeholder="jane@company.com"
                value={form.owner_email}
                onChange={(e) => set('owner_email', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-white/20 outline-none focus:border-violet-500/40 transition-colors"
              />
            </div>
          </div>

          {/* Plan */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">Plan</label>
            <div className="grid grid-cols-3 gap-2">
              {PLAN_OPTIONS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => set('plan', p.value)}
                  className={`flex flex-col gap-1 px-3 py-2.5 rounded-xl border text-left transition-all ${
                    form.plan === p.value
                      ? 'border-violet-500/40 bg-violet-500/10'
                      : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]'
                  }`}
                >
                  <span className="text-xs font-bold" style={{ color: p.color }}>{p.label}</span>
                  <span className="text-[10px] text-white/30 leading-tight">{p.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Brand color */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">Brand Color</label>
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set('primary_color', c)}
                    className={`w-7 h-7 rounded-lg transition-all ${form.primary_color === c ? 'ring-2 ring-white/40 ring-offset-1 ring-offset-[#1a1d27]' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 ml-2">
                <input
                  type="color"
                  value={form.primary_color}
                  onChange={(e) => set('primary_color', e.target.value)}
                  className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
                />
                <span className="text-xs text-white/30 font-mono">{form.primary_color}</span>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white/50 hover:text-white/80 border border-white/[0.08] hover:bg-white/[0.04] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : null}
              {saving ? 'Provisioning…' : 'Create Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
