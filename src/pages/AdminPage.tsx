import { useState, useEffect, useMemo } from 'react'
import { RoleGate } from '@/components/auth/RoleGate'
import { Avatar } from '@/components/ui/Avatar'
import { useToast } from '@/components/ui/Toast'
import { useContentStore } from '@/store/contentStore'
import { useAuthStore } from '@/store/authStore'
import { useTeamStore } from '@/store/teamStore'
import { supabase } from '@/lib/supabase'
import type { Profile, UserRole } from '@/types'
import type { ContentCard } from '@/types'
import {
  ROLE_LABELS, STATUS_COLORS, STATUS_LABELS,
  CONTENT_TYPE_COLORS, CONTENT_TYPE_LABELS,
} from '@/lib/constants'
import {
  Users, UserPlus, X, Shield, Mail, Briefcase,
  ToggleLeft, ToggleRight, CheckCircle2, Search,
  FileText, Clock, TrendingUp, Star,
  Pencil, Check, Link, Building2,
} from 'lucide-react'

// ─── Role definitions ─────────────────────────────────────────────────────────

interface JobRole {
  label: string
  dbRole: UserRole
  category: string
  description: string
  permissions: string[]
}

const JOB_ROLES: JobRole[] = [
  { label: 'Content Lead',         dbRole: 'admin',       category: 'admin',   description: 'Full platform access with approval authority',       permissions: ['Create & edit all content', 'Approve at all stages', 'Manage team members', 'Access admin panel'] },
  { label: 'Design Lead',          dbRole: 'admin',       category: 'admin',   description: 'Manages design workflow and approvals',               permissions: ['Full content access', 'Approve design stages', 'Manage designers', 'Access admin panel'] },
  { label: 'Content Creator',      dbRole: 'contributor', category: 'content', description: 'Creates and submits content for review',              permissions: ['Create own content', 'Submit for review', 'View all pipeline', 'Add to idea bank'] },
  { label: 'Designer',             dbRole: 'reviewer',    category: 'design',  description: 'Works on design deliverables and review',             permissions: ['View all content', 'Upload design files', 'Move through design stages', 'Comment on cards'] },
  { label: 'Social Media Manager', dbRole: 'manager',     category: 'social',  description: 'Manages scheduling and platform publishing',          permissions: ['Full pipeline access', 'Schedule posts', 'Approve caption stage', 'Mark as posted'] },
]

const CATEGORY_COLORS: Record<string, string> = {
  admin: '#22c55e', content: '#3b82f6', design: '#8b5cf6', social: '#ec4899',
}

const ROLE_COLORS: Record<UserRole, string> = {
  admin: '#22c55e', manager: '#3b82f6', reviewer: '#8b5cf6', contributor: '#6b7280',
}

// ─── Inline invite panel ─────────────────────────────────────────────────────

function InvitePanel({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [selectedRole, setSelectedRole] = useState<JobRole | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleInvite = async () => {
    if (!email.trim() || !selectedRole) return
    setLoading(true)
    try {
      const { error } = await supabase.functions.invoke('invite-user', {
        body: { email: email.trim(), full_name: fullName.trim() || undefined, role: selectedRole.dbRole },
      })
      if (error) throw error
      toast(`Invite sent to ${email}`)
      onSuccess()
      onClose()
    } catch {
      toast('Failed to send invite — check Supabase edge function', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col border-b border-white/[0.06]" style={{ backgroundColor: '#0f1117' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <UserPlus size={13} className="text-[#22c55e]" />
          <span className="text-xs font-bold text-white">Invite Member</span>
        </div>
        <button onClick={onClose} className="p-1 rounded text-white/25 hover:text-white/60 transition-colors">
          <X size={13} />
        </button>
      </div>
      <div className="p-4 flex flex-col gap-3 overflow-y-auto" style={{ maxHeight: '65vh' }}>
        <div className="flex flex-col gap-2">
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name"
            className="w-full px-3 py-2 text-xs rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/80 placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#22c55e]/40" />
          <div className="relative">
            <Mail size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="colleague@company.com"
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/80 placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#22c55e]/40" />
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">Role</p>
          <div className="flex flex-col gap-1.5">
            {JOB_ROLES.map((role) => {
              const color = CATEGORY_COLORS[role.category] ?? '#22c55e'
              const isSelected = selectedRole?.label === role.label
              return (
                <button key={role.label} onClick={() => setSelectedRole(role)}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all"
                  style={{ borderColor: isSelected ? `${color}50` : 'rgba(255,255,255,0.05)', backgroundColor: isSelected ? `${color}0c` : 'rgba(255,255,255,0.02)' }}>
                  <div className="w-3.5 h-3.5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center"
                    style={{ borderColor: isSelected ? color : 'rgba(255,255,255,0.18)', backgroundColor: isSelected ? color : 'transparent' }}>
                    {isSelected && <div className="w-1 h-1 bg-white rounded-full" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[11px] font-bold" style={{ color: isSelected ? color : 'rgba(255,255,255,0.65)' }}>{role.label}</span>
                      <span className="text-[8px] font-bold uppercase px-1 py-px rounded-full" style={{ backgroundColor: `${color}18`, color }}>{role.category}</span>
                    </div>
                    <p className="text-[9px] text-white/35">{role.description}</p>
                    {isSelected && (
                      <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1.5">
                        {role.permissions.map((p) => (
                          <span key={p} className="flex items-center gap-1 text-[9px] text-white/30">
                            <CheckCircle2 size={8} className="text-[#22c55e]/60 shrink-0" />{p}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
        <button onClick={handleInvite} disabled={!email.trim() || !selectedRole || loading}
          className="w-full py-2.5 text-xs font-bold rounded-xl text-white transition-all disabled:opacity-40 btn-glow"
          style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}>
          {loading ? 'Sending…' : 'Send Invite'}
        </button>
      </div>
    </div>
  )
}

// ─── User detail panel ────────────────────────────────────────────────────────

function UserDetail({
  user,
  cards,
  currentProfile,
  teams,
  userTeamIds,
  onRoleChange,
}: {
  user: Profile
  cards: ContentCard[]
  currentProfile: Profile | null
  teams: { id: string; name: string; color: string }[]
  userTeamIds: string[]
  onRoleChange: (id: string, role: UserRole) => void
}) {
  const userCards = cards.filter((c) => c.owner_id === user.id || c.assigned_reviewer_id === user.id)
  const posted = userCards.filter((c) => c.status === 'posted').length
  const inProgress = userCards.filter((c) => !['posted', 'idea'].includes(c.status)).length
  const totalIdeas = userCards.filter((c) => c.status === 'idea').length

  const MINI_STATS = [
    { label: 'Total', value: userCards.length, icon: FileText, color: '#6b7280' },
    { label: 'Posted', value: posted, icon: Star, color: '#22c55e' },
    { label: 'Active', value: inProgress, icon: TrendingUp, color: '#f59e0b' },
    { label: 'Ideas', value: totalIdeas, icon: Clock, color: '#8b5cf6' },
  ]

  return (
    <div className="p-5">
      {/* Header */}
      <div className="flex items-start gap-4 p-5 rounded-2xl border border-white/[0.06] mb-5" style={{ backgroundColor: '#1a1d27' }}>
        <Avatar src={user.avatar_url} name={user.full_name ?? user.email} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <h3 className="text-base font-bold text-white">{user.full_name ?? 'Unnamed'}</h3>
            {user.id === currentProfile?.id && (
              <span className="text-[10px] font-bold text-white/30 bg-white/[0.06] px-2 py-0.5 rounded-full">You</span>
            )}
            {user.role === 'admin' && <Shield size={14} className="text-[#22c55e]" />}
          </div>
          <p className="text-xs text-white/40 mb-3">{user.email}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-white/30 font-semibold uppercase tracking-wide">Role:</span>
            {(['contributor', 'reviewer', 'manager', 'admin'] as UserRole[]).map((r) => {
              const rColor = ROLE_COLORS[r]
              const isActive = user.role === r
              return (
                <button key={r} disabled={user.id === currentProfile?.id} onClick={() => onRoleChange(user.id, r)}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all disabled:opacity-40"
                  style={{
                    borderColor: isActive ? `${rColor}50` : 'rgba(255,255,255,0.08)',
                    backgroundColor: isActive ? `${rColor}15` : 'transparent',
                    color: isActive ? rColor : 'rgba(255,255,255,0.35)',
                  }}>
                  {ROLE_LABELS[r]}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {MINI_STATS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl p-3 border border-white/[0.06] flex flex-col items-center gap-1" style={{ backgroundColor: '#1a1d27' }}>
            <Icon size={13} style={{ color }} />
            <p className="text-xl font-black" style={{ color: value > 0 ? 'white' : 'rgba(255,255,255,0.2)' }}>{value}</p>
            <p className="text-[9px] text-white/30 uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>

      {/* Teams */}
      {teams.length > 0 && (
        <div className="mb-5">
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-white/30 mb-2">Teams</h4>
          <div className="flex flex-wrap gap-2">
            {teams.map((t) => {
              const isMember = userTeamIds.includes(t.id)
              return (
                <span key={t.id}
                  className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-semibold"
                  style={isMember
                    ? { backgroundColor: `${t.color}18`, color: t.color, border: `1px solid ${t.color}30` }
                    : { backgroundColor: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.07)' }
                  }>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color, opacity: isMember ? 1 : 0.3 }} />
                  {t.name}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Content */}
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-widest text-white/30 mb-3">
          Assigned Content · {userCards.length} pieces
        </h4>
        {userCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 rounded-2xl border border-white/[0.06]" style={{ backgroundColor: '#1a1d27' }}>
            <Briefcase size={24} className="text-white/15 mb-2" />
            <p className="text-sm text-white/20">No content assigned</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {userCards.slice(0, 12).map((card: ContentCard) => {
              const statusColor = STATUS_COLORS[card.status]
              const typeColor = CONTENT_TYPE_COLORS[card.content_type]
              return (
                <div key={card.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.06] hover:border-white/[0.1] transition-all"
                  style={{ backgroundColor: '#1a1d27', borderLeft: `3px solid ${statusColor}50` }}>
                  {card.content_id && (
                    <span className="font-mono text-[10px] font-bold shrink-0" style={{ color: typeColor }}>{card.content_id}</span>
                  )}
                  <p className="flex-1 text-xs text-white/70 truncate">{card.title}</p>
                  <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full shrink-0 hidden sm:block"
                    style={{ backgroundColor: `${typeColor}15`, color: typeColor }}>{CONTENT_TYPE_LABELS[card.content_type]}</span>
                  <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1"
                    style={{ backgroundColor: `${statusColor}15`, color: statusColor }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
                    {STATUS_LABELS[card.status]}
                  </span>
                </div>
              )
            })}
            {userCards.length > 12 && (
              <p className="text-xs text-white/20 text-center py-2">+{userCards.length - 12} more pieces</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Teams tab ───────────────────────────────────────────────────────────────

const PRESET_COLORS = [
  '#22c55e', '#16a34a', '#3b82f6', '#6366f1', '#8b5cf6',
  '#ec4899', '#f97316', '#f59e0b', '#ef4444', '#14b8a6',
  '#06b6d4', '#6b7280',
]

function TeamEditPanel({
  team,
  onSave,
  onCancel,
}: {
  team: { id: string; name: string; color: string; description: string | null; logo_url: string | null }
  onSave: (id: string, updates: { name: string; description: string; color: string; logo_url: string }) => Promise<void>
  onCancel: () => void
}) {
  const [name, setName] = useState(team.name)
  const [description, setDescription] = useState(team.description ?? '')
  const [color, setColor] = useState(team.color)
  const [logoUrl, setLogoUrl] = useState(team.logo_url ?? '')
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await onSave(team.id, { name: name.trim(), description: description.trim(), color, logo_url: logoUrl.trim() })
      toast('Team updated')
      onCancel()
    } catch {
      toast('Failed to update team', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] overflow-hidden" style={{ backgroundColor: '#1a1d27' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md shrink-0" style={{ backgroundColor: color }} />
          <span className="text-xs font-bold text-white">Edit Team</span>
        </div>
        <button onClick={onCancel} className="p-1 rounded text-white/25 hover:text-white/60 transition-colors">
          <X size={13} />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* Logo preview + URL */}
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden border border-white/[0.08]"
            style={{ backgroundColor: `${color}20` }}
          >
            {logoUrl ? (
              <img src={logoUrl} alt={name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            ) : (
              <span className="text-xl font-black" style={{ color }}>{name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 block mb-1">Logo URL</label>
            <div className="relative">
              <Link size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
              <input
                type="url"
                placeholder="https://…"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/70 placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#22c55e]/40"
              />
            </div>
            <p className="text-[9px] text-white/20 mt-1">Paste any image URL — leave blank to use the initial</p>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 block mb-1">Team Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/80 placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#22c55e]/40"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 block mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="What does this team focus on?"
            className="w-full px-3 py-2 text-sm rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/70 placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#22c55e]/40 resize-none"
          />
        </div>

        {/* Color */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 block mb-2">Team Color</label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-7 h-7 rounded-lg transition-all"
                style={{
                  backgroundColor: c,
                  outline: color === c ? `2px solid white` : 'none',
                  outlineOffset: '2px',
                }}
              >
                {color === c && <Check size={12} className="text-white mx-auto" />}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-1">
          <button onClick={onCancel} className="px-3 py-1.5 text-xs font-semibold rounded-xl text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-all">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="px-4 py-1.5 text-xs font-bold rounded-xl text-white disabled:opacity-40 transition-all btn-glow"
            style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

function TeamsTab({
  teams,
  memberships,
  users,
}: {
  teams: { id: string; name: string; color: string; description: string | null; logo_url: string | null }[]
  memberships: Record<string, string[]>
  users: Profile[]
}) {
  const { updateTeam } = useTeamStore()
  const [editingId, setEditingId] = useState<string | null>(null)

  const membersByTeam = (teamId: string) =>
    users.filter((u) => (memberships[u.id] ?? []).includes(teamId))

  const contentCountByTeam = useContentStore((s) => {
    const counts: Record<string, number> = {}
    for (const card of s.cards) {
      if (card.team_id) counts[card.team_id] = (counts[card.team_id] ?? 0) + 1
    }
    return counts
  })

  return (
    <div className="p-6 flex flex-col gap-4 max-w-3xl">
      <div>
        <h2 className="text-sm font-bold text-white mb-0.5">Teams</h2>
        <p className="text-xs text-white/30">Manage team details, colors, and logos</p>
      </div>

      {teams.map((team) => {
        const members = membersByTeam(team.id)
        const contentCount = contentCountByTeam[team.id] ?? 0
        const isEditing = editingId === team.id

        return (
          <div key={team.id}>
            {isEditing ? (
              <TeamEditPanel
                team={team}
                onSave={async (id, updates) => { await updateTeam(id, updates) }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div
                className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-white/[0.06] hover:border-white/[0.1] transition-all group"
                style={{ backgroundColor: '#1a1d27' }}
              >
                {/* Logo */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden"
                  style={{ backgroundColor: `${team.color}20`, border: `1.5px solid ${team.color}30` }}
                >
                  {team.logo_url ? (
                    <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  ) : (
                    <span className="text-lg font-black" style={{ color: team.color }}>{team.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold text-white">{team.name}</span>
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: team.color }} />
                  </div>
                  {team.description ? (
                    <p className="text-xs text-white/35 truncate">{team.description}</p>
                  ) : (
                    <p className="text-xs text-white/20 italic">No description</p>
                  )}
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-5 shrink-0">
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="flex -space-x-1.5">
                      {members.slice(0, 4).map((m) => (
                        <Avatar key={m.id} src={m.avatar_url} name={m.full_name ?? m.email} size="xs" className="ring-2 ring-[#1a1d27]" />
                      ))}
                      {members.length > 4 && (
                        <div className="w-5 h-5 rounded-full bg-white/[0.08] ring-2 ring-[#1a1d27] flex items-center justify-center">
                          <span className="text-[8px] font-bold text-white/50">+{members.length - 4}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-white/30">{members.length} member{members.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-base font-black text-white">{contentCount}</span>
                    <span className="text-[10px] text-white/30">posts</span>
                  </div>
                </div>

                {/* Edit */}
                <button
                  onClick={() => setEditingId(team.id)}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white/30 hover:text-white/70 border border-white/[0.06] hover:bg-white/[0.05] opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Pencil size={11} />
                  Edit
                </button>
              </div>
            )}
          </div>
        )
      })}

      {teams.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-white/[0.06]" style={{ backgroundColor: '#1a1d27' }}>
          <Building2 size={28} className="text-white/15 mb-2" />
          <p className="text-sm text-white/20">No teams yet</p>
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function AdminPage() {
  const [tab, setTab] = useState<'people' | 'teams'>('people')
  const [users, setUsers] = useState<Profile[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [showInvite, setShowInvite] = useState(false)
  const [activeToggles, setActiveToggles] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [memberships, setMemberships] = useState<Record<string, string[]>>({})
  const { cards } = useContentStore()
  const currentProfile = useAuthStore((s) => s.profile)
  const { teams } = useTeamStore()
  const { toast } = useToast()

  const fetchUsers = async () => {
    const [{ data: profiles }, { data: mems }] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at'),
      supabase.from('team_memberships').select('user_id, team_id'),
    ])
    if (profiles) {
      const list = profiles as Profile[]
      setUsers(list)
      setActiveToggles(new Set(list.map((u) => u.id)))
      if (!selectedUser && list.length > 0) setSelectedUser(list[0])
    }
    if (mems) {
      const map: Record<string, string[]> = {}
      for (const m of mems as { user_id: string; team_id: string }[]) {
        if (!map[m.user_id]) map[m.user_id] = []
        map[m.user_id].push(m.team_id)
      }
      setMemberships(map)
    }
    setLoadingUsers(false)
  }

  useEffect(() => { fetchUsers() }, [])

  const changeRole = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase.rpc('set_user_role', { target_id: userId, new_role: newRole })
      if (error) throw error
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
      if (selectedUser?.id === userId) setSelectedUser((u) => u ? { ...u, role: newRole } : u)
      toast('Role updated')
    } catch {
      toast('Failed to update role', 'error')
    }
  }

  const toggleActive = (userId: string) => {
    setActiveToggles((prev) => {
      const next = new Set(prev)
      next.has(userId) ? next.delete(userId) : next.add(userId)
      return next
    })
  }

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users
    const q = search.toLowerCase()
    return users.filter(
      (u) => (u.full_name ?? '').toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    )
  }, [users, search])

  return (
    <RoleGate allow={['admin']}>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Tab bar */}
        <div className="flex items-center gap-1 px-4 pt-4 pb-0 border-b border-white/[0.06] shrink-0">
          {([['people', 'People & Access'], ['teams', 'Teams']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="px-4 py-2 text-xs font-bold rounded-t-xl transition-all border border-b-0"
              style={tab === key
                ? { color: '#22c55e', backgroundColor: '#1a1d27', borderColor: 'rgba(255,255,255,0.08)' }
                : { color: 'rgba(255,255,255,0.3)', backgroundColor: 'transparent', borderColor: 'transparent' }}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'teams' ? (
          <div className="flex-1 overflow-y-auto">
            <TeamsTab teams={teams} memberships={memberships} users={users} />
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden">
            {/* Left: member list */}
            <div className="w-72 border-r border-white/[0.06] flex flex-col shrink-0 overflow-hidden" style={{ backgroundColor: '#13151f' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-[#22c55e]" />
                  <h2 className="text-sm font-bold text-white">People & Access</h2>
                </div>
                <button
                  onClick={() => setShowInvite((v) => !v)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                  style={showInvite
                    ? { color: 'rgba(255,255,255,0.5)', backgroundColor: 'rgba(255,255,255,0.05)' }
                    : { background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: 'white' }}
                >
                  <UserPlus size={12} />
                  {showInvite ? 'Cancel' : 'Invite'}
                </button>
              </div>

              {showInvite && <InvitePanel onClose={() => setShowInvite(false)} onSuccess={fetchUsers} />}

              {/* Search */}
              <div className="px-3 py-2 border-b border-white/[0.06]">
                <div className="relative">
                  <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search members…"
                    className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/70 placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#22c55e]/40"
                  />
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto py-1">
                {loadingUsers ? (
                  <p className="text-xs text-white/25 text-center py-8">Loading…</p>
                ) : filteredUsers.length === 0 ? (
                  <p className="text-xs text-white/25 text-center py-8">No results</p>
                ) : (
                  filteredUsers.map((user) => {
                    const isSelected = selectedUser?.id === user.id
                    const isActive = activeToggles.has(user.id)
                    const roleColor = ROLE_COLORS[user.role]
                    const cardCount = cards.filter((c) => c.owner_id === user.id || c.assigned_reviewer_id === user.id).length
                    const userTeams = memberships[user.id] ?? []

                    return (
                      <button key={user.id} onClick={() => setSelectedUser(user)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all"
                        style={{
                          backgroundColor: isSelected ? 'rgba(34,197,94,0.07)' : 'transparent',
                          borderLeft: isSelected ? '2px solid #22c55e' : '2px solid transparent',
                        }}>
                        <div className="relative shrink-0">
                          <Avatar src={user.avatar_url} name={user.full_name ?? user.email} size="sm" />
                          {isActive && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#22c55e] border-2 border-[#13151f]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 mb-0.5">
                            <span className="text-[12px] font-semibold text-white/80 truncate">{user.full_name ?? 'Unnamed'}</span>
                            {user.id === currentProfile?.id && <span className="text-[8px] font-bold text-white/30 bg-white/[0.06] px-1 rounded shrink-0">YOU</span>}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full"
                              style={{ backgroundColor: `${roleColor}18`, color: roleColor }}>{ROLE_LABELS[user.role]}</span>
                            {cardCount > 0 && <span className="text-[9px] text-white/25">{cardCount} posts</span>}
                            <div className="flex gap-0.5">
                              {teams.filter((t) => userTeams.includes(t.id)).map((t) => (
                                <span key={t.id} className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} title={t.name} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); toggleActive(user.id) }} className="shrink-0 text-white/30 hover:text-white/60 transition-colors">
                          {isActive ? <ToggleRight size={18} className="text-[#22c55e]" /> : <ToggleLeft size={18} />}
                        </button>
                      </button>
                    )
                  })
                )}
              </div>

              <div className="px-4 py-3 border-t border-white/[0.06]">
                <p className="text-[10px] text-white/25">
                  {users.length} member{users.length !== 1 ? 's' : ''} · {activeToggles.size} active
                </p>
              </div>
            </div>

            {/* Right: selected user detail */}
            <div className="flex-1 overflow-y-auto max-w-3xl">
              {selectedUser ? (
                <UserDetail
                  user={selectedUser}
                  cards={cards}
                  currentProfile={currentProfile}
                  teams={teams}
                  userTeamIds={memberships[selectedUser.id] ?? []}
                  onRoleChange={changeRole}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-white/20">Select a team member</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </RoleGate>
  )
}
