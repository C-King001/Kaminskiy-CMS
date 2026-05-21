import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { Avatar } from '@/components/ui/Avatar'
import { useToast } from '@/components/ui/Toast'
import type { Profile, UserRole } from '@/types'
import { ROLE_LABELS } from '@/lib/constants'
import {
  User, Users, Mail, Shield, CheckCircle2,
  UserPlus, ToggleLeft, ToggleRight, Send,
} from 'lucide-react'

// ─── Job roles for inviting ───────────────────────────────────────────────────

interface JobRole {
  label: string
  dbRole: UserRole
  category: string
  description: string
  permissions: string[]
}

const JOB_ROLES: JobRole[] = [
  {
    label: 'Content Lead',
    dbRole: 'admin',
    category: 'admin',
    description: 'Full access with final approval authority',
    permissions: ['Create & edit all content', 'Approve all stages', 'Manage team members'],
  },
  {
    label: 'Design Lead',
    dbRole: 'admin',
    category: 'admin',
    description: 'Manages design workflow and approvals',
    permissions: ['Full content access', 'Approve design stages', 'Manage designers'],
  },
  {
    label: 'Content Creator',
    dbRole: 'contributor',
    category: 'content',
    description: 'Creates and submits content for review',
    permissions: ['Create own content', 'Submit for review', 'Add to idea bank'],
  },
  {
    label: 'Designer',
    dbRole: 'reviewer',
    category: 'design',
    description: 'Works on design deliverables and review',
    permissions: ['View all content', 'Upload design files', 'Move through design stages'],
  },
  {
    label: 'Social Media Manager',
    dbRole: 'manager',
    category: 'social',
    description: 'Manages scheduling and platform publishing',
    permissions: ['Full pipeline access', 'Schedule posts', 'Mark as posted'],
  },
]

const CATEGORY_COLORS: Record<string, string> = {
  admin: '#22c55e',
  content: '#3b82f6',
  design: '#8b5cf6',
  social: '#ec4899',
}

const ROLE_COLORS: Record<UserRole, string> = {
  admin: '#22c55e',
  manager: '#3b82f6',
  reviewer: '#8b5cf6',
  contributor: '#6b7280',
}

// ─── My Profile tab ───────────────────────────────────────────────────────────

function MyProfileTab() {
  const profile = useAuthStore((s) => s.profile)

  if (!profile) return null

  return (
    <div
      className="rounded-2xl border border-white/[0.06] p-6 max-w-lg"
      style={{ backgroundColor: '#1a1d27' }}
    >
      <h3 className="text-sm font-bold text-white mb-5">My Profile</h3>
      <div className="flex items-center gap-4 mb-6">
        <Avatar src={profile.avatar_url} name={profile.full_name ?? profile.email} size="lg" />
        <div>
          <p className="text-base font-bold text-white">{profile.full_name ?? '—'}</p>
          <p className="text-sm text-white/40">{profile.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 block mb-1">Full Name</label>
          <p className="text-sm text-white/70">{profile.full_name ?? '—'}</p>
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 block mb-1">Email</label>
          <p className="text-sm text-white/70">{profile.email}</p>
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 block mb-1">Role</label>
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: `${ROLE_COLORS[profile.role]}18`,
              color: ROLE_COLORS[profile.role],
            }}
          >
            {ROLE_LABELS[profile.role]}
          </span>
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 block mb-1">Team</label>
          <p className="text-sm text-white/70">Kaminskiy C&R</p>
        </div>
      </div>

      <p className="text-[11px] text-white/20 mt-6 border-t border-white/[0.06] pt-4">
        To update your details, contact a super admin.
      </p>
    </div>
  )
}

// ─── Team Access tab ──────────────────────────────────────────────────────────

function TeamAccessTab() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [activeToggles, setActiveToggles] = useState<Set<string>>(new Set())
  const currentProfile = useAuthStore((s) => s.profile)
  const { toast } = useToast()

  // Invite form state
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<JobRole | null>(null)
  const [sending, setSending] = useState(false)

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at')
    if (data) {
      const profiles = data as Profile[]
      setUsers(profiles)
      setActiveToggles(new Set(profiles.map((u) => u.id)))
    }
    setLoadingUsers(false)
  }

  useEffect(() => { fetchUsers() }, [])

  const changeRole = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase.rpc('set_user_role', { target_id: userId, new_role: newRole })
      if (error) throw error
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
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

  const handleSendInvite = async () => {
    if (!inviteEmail.trim() || !inviteRole) return
    setSending(true)
    try {
      await supabase.functions.invoke('invite-user', {
        body: { email: inviteEmail.trim(), full_name: inviteName.trim(), role: inviteRole.dbRole },
      })
      toast(`Invite sent to ${inviteEmail}`)
      setInviteName('')
      setInviteEmail('')
      setInviteRole(null)
      fetchUsers()
    } catch {
      toast('Failed to send invite', 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex gap-5 max-w-5xl">
      {/* Left: Invite form */}
      <div
        className="w-72 shrink-0 rounded-2xl border border-white/[0.06] p-5 flex flex-col gap-4 h-fit"
        style={{ backgroundColor: '#1a1d27' }}
      >
        <div className="flex items-center gap-2">
          <UserPlus size={14} className="text-[#22c55e]" />
          <h3 className="text-sm font-bold text-white">Invite Member</h3>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="Joy Adeyemi"
              className="w-full px-3 py-2 text-sm rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/80 placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#22c55e]/40 transition-all"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="joy@company.com"
                className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/80 placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#22c55e]/40 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">
              Role
            </label>
            <select
              value={inviteRole?.label ?? ''}
              onChange={(e) => setInviteRole(JOB_ROLES.find((r) => r.label === e.target.value) ?? null)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-white/[0.08] bg-[#1a1d27] text-white/60 focus:outline-none focus:ring-2 focus:ring-[#22c55e]/40 transition-all cursor-pointer"
              style={{ colorScheme: 'dark' }}
            >
              <option value="">Select a role…</option>
              {JOB_ROLES.map((r) => (
                <option key={r.label} value={r.label}>{r.label}</option>
              ))}
            </select>
          </div>
        </div>

        {inviteRole && (
          <div
            className="rounded-xl p-3 border"
            style={{
              backgroundColor: `${CATEGORY_COLORS[inviteRole.category]}08`,
              borderColor: `${CATEGORY_COLORS[inviteRole.category]}20`,
            }}
          >
            <p className="text-[10px] text-white/40 mb-1.5">{inviteRole.description}</p>
            <div className="flex flex-col gap-0.5">
              {inviteRole.permissions.map((p) => (
                <span key={p} className="flex items-center gap-1 text-[9px] text-white/30">
                  <CheckCircle2 size={8} className="text-[#22c55e]/50 shrink-0" />
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleSendInvite}
          disabled={!inviteEmail.trim() || !inviteRole || sending}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40 btn-glow"
          style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}
        >
          <Send size={13} />
          {sending ? 'Sending…' : 'Send Invite'}
        </button>

        <p className="text-[10px] text-white/20 text-center leading-relaxed">
          The invitee will receive an email with a link to activate their account.
        </p>
      </div>

      {/* Right: Member list */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-white/30">
            {users.length} Members
          </h3>
        </div>

        {loadingUsers ? (
          <p className="text-sm text-white/25 py-8 text-center">Loading…</p>
        ) : (
          <div className="flex flex-col gap-2">
            {users.map((user) => {
              const isActive = activeToggles.has(user.id)
              const roleColor = ROLE_COLORS[user.role]
              const isSelf = user.id === currentProfile?.id

              return (
                <div
                  key={user.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.06] hover:border-white/[0.1] transition-all"
                  style={{ backgroundColor: '#1a1d27' }}
                >
                  <div className="relative shrink-0">
                    <Avatar src={user.avatar_url} name={user.full_name ?? user.email} size="sm" />
                    {isActive && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#22c55e] border-2 border-[#1a1d27]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-sm font-semibold text-white/80 truncate">
                        {user.full_name ?? 'Unnamed'}
                      </span>
                      {isSelf && (
                        <span className="text-[8px] font-bold text-white/30 bg-white/[0.06] px-1.5 py-0.5 rounded-full shrink-0">
                          YOU
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-white/30 truncate">{user.email}</p>
                  </div>

                  {/* Role pill + select */}
                  <select
                    value={user.role}
                    disabled={isSelf}
                    onChange={(e) => changeRole(user.id, e.target.value as UserRole)}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none disabled:opacity-50 shrink-0"
                    style={{
                      backgroundColor: `${roleColor}15`,
                      borderColor: `${roleColor}30`,
                      color: roleColor,
                      colorScheme: 'dark',
                    }}
                  >
                    {(['contributor', 'reviewer', 'manager', 'admin'] as UserRole[]).map((r) => (
                      <option key={r} value={r} style={{ backgroundColor: '#1a1d27', color: 'white' }}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>

                  {user.role === 'admin' && (
                    <Shield size={12} className="text-[#22c55e] shrink-0" />
                  )}

                  {/* Active toggle */}
                  <button
                    onClick={() => toggleActive(user.id)}
                    className="shrink-0"
                    title={isActive ? 'Set inactive' : 'Set active'}
                  >
                    {isActive ? (
                      <ToggleRight size={20} className="text-[#22c55e]" />
                    ) : (
                      <ToggleLeft size={20} className="text-white/20" />
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Settings page ───────────────────────────────────────────────────────

type SettingsTab = 'profile' | 'team'

export function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('profile')
  const profile = useAuthStore((s) => s.profile)
  const isAdmin = profile?.role === 'admin'

  return (
    <div className="p-4 md:p-6 flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto animate-fade-up">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-white">Settings</h2>
          <p className="text-xs text-white/30 mt-0.5">Manage your profile and team access.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 mb-6">
          <button
            onClick={() => setTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === 'profile'
                ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30'
                : 'text-white/40 hover:text-white/70 border border-transparent'
            }`}
          >
            <User size={14} />
            My Profile
          </button>
          {isAdmin && (
            <button
              onClick={() => setTab('team')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                tab === 'team'
                  ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30'
                  : 'text-white/40 hover:text-white/70 border border-transparent'
              }`}
            >
              <Users size={14} />
              Team Access
            </button>
          )}
        </div>

        {tab === 'profile' && <MyProfileTab />}
        {tab === 'team' && isAdmin && <TeamAccessTab />}
      </div>
    </div>
  )
}
