import { useState, useEffect } from 'react'
import { RoleGate } from '@/components/auth/RoleGate'
import { Avatar } from '@/components/ui/Avatar'
import { useToast } from '@/components/ui/Toast'
import { useContentStore } from '@/store/contentStore'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import type { Profile, UserRole } from '@/types'
import type { ContentCard } from '@/types'
import {
  ROLE_LABELS, STATUS_COLORS, STATUS_LABELS,
  CONTENT_TYPE_COLORS, CONTENT_TYPE_LABELS,
} from '@/lib/constants'
import {
  Users, UserPlus, X, Shield, Mail, Briefcase,
  ToggleLeft, ToggleRight, CheckCircle2,
} from 'lucide-react'

// ─── Role definitions for invite ─────────────────────────────────────────────

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
    description: 'Full platform access with approval authority',
    permissions: ['Create & edit all content', 'Approve at all stages', 'Manage team members', 'Access admin panel'],
  },
  {
    label: 'Design Lead',
    dbRole: 'admin',
    category: 'admin',
    description: 'Manages design workflow and approvals',
    permissions: ['Full content access', 'Approve design stages', 'Manage designers', 'Access admin panel'],
  },
  {
    label: 'Content Creator',
    dbRole: 'contributor',
    category: 'content',
    description: 'Creates and submits content for review',
    permissions: ['Create own content', 'Submit for review', 'View all pipeline', 'Add to idea bank'],
  },
  {
    label: 'Designer',
    dbRole: 'reviewer',
    category: 'design',
    description: 'Works on design deliverables and review',
    permissions: ['View all content', 'Upload design files', 'Move through design stages', 'Comment on cards'],
  },
  {
    label: 'Social Media Manager',
    dbRole: 'manager',
    category: 'social',
    description: 'Manages scheduling and platform publishing',
    permissions: ['Full pipeline access', 'Schedule posts', 'Approve caption stage', 'Mark as posted'],
  },
]

const CATEGORY_COLORS: Record<string, string> = {
  admin: '#22c55e',
  content: '#3b82f6',
  design: '#8b5cf6',
  social: '#ec4899',
}

// ─── Inline invite panel ─────────────────────────────────────────────────────

interface InvitePanelProps {
  onClose: () => void
  onSuccess: () => void
}

function InvitePanel({ onClose, onSuccess }: InvitePanelProps) {
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
    <div
      className="flex flex-col border-b border-white/[0.06]"
      style={{ backgroundColor: '#0f1117' }}
    >
      {/* Panel header */}
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
        {/* Name + Email inputs */}
        <div className="flex flex-col gap-2">
          <div className="relative">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              className="w-full px-3 py-2 text-xs rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/80 placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#22c55e]/40 transition-all"
            />
          </div>
          <div className="relative">
            <Mail size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/80 placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#22c55e]/40 transition-all"
            />
          </div>
        </div>

        {/* Role selector */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">Role</p>
          <div className="flex flex-col gap-1.5">
            {JOB_ROLES.map((role) => {
              const color = CATEGORY_COLORS[role.category] ?? '#22c55e'
              const isSelected = selectedRole?.label === role.label
              return (
                <button
                  key={role.label}
                  onClick={() => setSelectedRole(role)}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all"
                  style={{
                    borderColor: isSelected ? `${color}50` : 'rgba(255,255,255,0.05)',
                    backgroundColor: isSelected ? `${color}0c` : 'rgba(255,255,255,0.02)',
                  }}
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center"
                    style={{
                      borderColor: isSelected ? color : 'rgba(255,255,255,0.18)',
                      backgroundColor: isSelected ? color : 'transparent',
                    }}
                  >
                    {isSelected && <div className="w-1 h-1 bg-white rounded-full" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[11px] font-bold" style={{ color: isSelected ? color : 'rgba(255,255,255,0.65)' }}>
                        {role.label}
                      </span>
                      <span
                        className="text-[8px] font-bold uppercase px-1 py-px rounded-full"
                        style={{ backgroundColor: `${color}18`, color }}
                      >
                        {role.category}
                      </span>
                    </div>
                    <p className="text-[9px] text-white/35">{role.description}</p>
                    {isSelected && (
                      <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1.5">
                        {role.permissions.map((p) => (
                          <span key={p} className="flex items-center gap-1 text-[9px] text-white/30">
                            <CheckCircle2 size={8} className="text-[#22c55e]/60 shrink-0" />
                            {p}
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

        {/* Send button */}
        <button
          onClick={handleInvite}
          disabled={!email.trim() || !selectedRole || loading}
          className="w-full py-2.5 text-xs font-bold rounded-xl text-white transition-all disabled:opacity-40 btn-glow"
          style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}
        >
          {loading ? 'Sending…' : 'Send Invite'}
        </button>
      </div>
    </div>
  )
}

// ─── Main People & Access page ────────────────────────────────────────────────

export function AdminPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [showInvite, setShowInvite] = useState(false)
  const [activeToggles, setActiveToggles] = useState<Set<string>>(new Set())
  const { cards } = useContentStore()
  const currentProfile = useAuthStore((s) => s.profile)
  const { toast } = useToast()

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at')
    if (data) {
      const profiles = data as Profile[]
      setUsers(profiles)
      // Default all users to active
      setActiveToggles(new Set(profiles.map((u) => u.id)))
      if (!selectedUser && profiles.length > 0) setSelectedUser(profiles[0])
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

  const getRoleColor = (role: UserRole) => {
    const colors: Record<UserRole, string> = {
      admin: '#22c55e',
      manager: '#3b82f6',
      reviewer: '#8b5cf6',
      contributor: '#6b7280',
    }
    return colors[role]
  }

  const selectedUserCards = selectedUser
    ? cards.filter(
        (c) => c.owner_id === selectedUser.id || c.assigned_reviewer_id === selectedUser.id,
      )
    : []

  return (
    <RoleGate allow={['admin']}>
      <div className="flex h-full overflow-hidden">
        {/* ── Left panel: Team members list ── */}
        <div
          className="w-72 border-r border-white/[0.06] flex flex-col shrink-0 overflow-hidden"
          style={{ backgroundColor: '#13151f' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-[#22c55e]" />
              <h2 className="text-sm font-bold text-white">People & Access</h2>
            </div>
            <button
              onClick={() => setShowInvite((v) => !v)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                showInvite
                  ? 'text-white/50 bg-white/[0.05] hover:bg-white/[0.08]'
                  : 'text-white btn-glow'
              }`}
              style={showInvite ? undefined : { background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}
            >
              <UserPlus size={12} />
              {showInvite ? 'Cancel' : 'Invite'}
            </button>
          </div>

          {/* Inline invite panel */}
          {showInvite && (
            <InvitePanel
              onClose={() => setShowInvite(false)}
              onSuccess={fetchUsers}
            />
          )}

          {/* Member list */}
          <div className="flex-1 overflow-y-auto py-2">
            {loadingUsers ? (
              <p className="text-xs text-white/25 text-center py-8">Loading…</p>
            ) : (
              users.map((user) => {
                const isSelected = selectedUser?.id === user.id
                const isActive = activeToggles.has(user.id)
                const roleColor = getRoleColor(user.role)
                const assignedCount = cards.filter(
                  (c) => c.owner_id === user.id || c.assigned_reviewer_id === user.id,
                ).length

                return (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all"
                    style={{
                      backgroundColor: isSelected ? 'rgba(34,197,94,0.08)' : 'transparent',
                      borderLeft: isSelected ? '2px solid #22c55e' : '2px solid transparent',
                    }}
                  >
                    <div className="relative shrink-0">
                      <Avatar
                        src={user.avatar_url}
                        name={user.full_name ?? user.email}
                        size="sm"
                      />
                      {isActive && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#22c55e] border-2 border-[#13151f]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[12px] font-semibold text-white/80 truncate">
                          {user.full_name ?? 'Unnamed'}
                        </span>
                        {user.id === currentProfile?.id && (
                          <span className="text-[8px] font-bold text-white/30 bg-white/[0.06] px-1 rounded">YOU</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: `${roleColor}18`, color: roleColor }}
                        >
                          {ROLE_LABELS[user.role]}
                        </span>
                        {assignedCount > 0 && (
                          <span className="text-[9px] text-white/25">{assignedCount} posts</span>
                        )}
                      </div>
                    </div>

                    {/* Active toggle */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleActive(user.id) }}
                      className="shrink-0 text-white/30 hover:text-white/60 transition-colors"
                      title={isActive ? 'Set inactive' : 'Set active'}
                    >
                      {isActive ? (
                        <ToggleRight size={18} className="text-[#22c55e]" />
                      ) : (
                        <ToggleLeft size={18} />
                      )}
                    </button>
                  </button>
                )
              })
            )}
          </div>

          {/* Stats footer */}
          <div className="px-4 py-3 border-t border-white/[0.06]">
            <p className="text-[10px] text-white/25">
              {users.length} member{users.length !== 1 ? 's' : ''} ·{' '}
              {activeToggles.size} active
            </p>
          </div>
        </div>

        {/* ── Right panel: Selected member detail ── */}
        <div className="flex-1 overflow-y-auto">
          {selectedUser ? (
            <div className="p-5 max-w-3xl">
              {/* Member header */}
              <div
                className="flex items-start gap-4 p-5 rounded-2xl border border-white/[0.06] mb-5"
                style={{ backgroundColor: '#1a1d27' }}
              >
                <Avatar
                  src={selectedUser.avatar_url}
                  name={selectedUser.full_name ?? selectedUser.email}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-white">
                      {selectedUser.full_name ?? 'Unnamed'}
                    </h3>
                    {selectedUser.id === currentProfile?.id && (
                      <span className="text-[10px] font-bold text-white/30 bg-white/[0.06] px-2 py-0.5 rounded-full">You</span>
                    )}
                  </div>
                  <p className="text-xs text-white/40 mb-3">{selectedUser.email}</p>

                  {/* Role change */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] text-white/30 font-semibold uppercase tracking-wide">Role:</span>
                    {(['contributor', 'reviewer', 'manager', 'admin'] as UserRole[]).map((r) => {
                      const rColor = getRoleColor(r)
                      const isActive = selectedUser.role === r
                      return (
                        <button
                          key={r}
                          disabled={selectedUser.id === currentProfile?.id}
                          onClick={() => changeRole(selectedUser.id, r)}
                          className="text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all disabled:opacity-40"
                          style={{
                            borderColor: isActive ? `${rColor}50` : 'rgba(255,255,255,0.08)',
                            backgroundColor: isActive ? `${rColor}15` : 'transparent',
                            color: isActive ? rColor : 'rgba(255,255,255,0.35)',
                          }}
                        >
                          {ROLE_LABELS[r]}
                        </button>
                      )
                    })}
                    {selectedUser.role === 'admin' && (
                      <Shield size={12} className="text-[#22c55e]" />
                    )}
                  </div>
                </div>
              </div>

              {/* Assigned content */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-white/30 mb-3">
                  Assigned Content · {selectedUserCards.length} pieces
                </h4>

                {selectedUserCards.length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center py-12 rounded-2xl border border-white/[0.06]"
                    style={{ backgroundColor: '#1a1d27' }}
                  >
                    <Briefcase size={28} className="text-white/15 mb-3" />
                    <p className="text-sm text-white/25">No content assigned</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {selectedUserCards.map((card: ContentCard) => {
                      const statusColor = STATUS_COLORS[card.status]
                      const typeColor = CONTENT_TYPE_COLORS[card.content_type]
                      return (
                        <div
                          key={card.id}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.06] hover:border-white/[0.1] transition-all"
                          style={{ backgroundColor: '#1a1d27', borderLeft: `3px solid ${statusColor}50` }}
                        >
                          {card.content_id && (
                            <span
                              className="font-mono text-[10px] font-bold shrink-0"
                              style={{ color: typeColor }}
                            >
                              {card.content_id}
                            </span>
                          )}
                          <p className="flex-1 text-sm text-white/70 truncate">{card.title}</p>
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                            style={{ backgroundColor: `${typeColor}15`, color: typeColor }}
                          >
                            {CONTENT_TYPE_LABELS[card.content_type]}
                          </span>
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1"
                            style={{ backgroundColor: `${statusColor}15`, color: statusColor }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
                            {STATUS_LABELS[card.status]}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-white/20">Select a team member</p>
            </div>
          )}
        </div>
      </div>

    </RoleGate>
  )
}
