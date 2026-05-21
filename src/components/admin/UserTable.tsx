import { useState, useEffect } from 'react'
import type { Profile, UserRole } from '@/types'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { Avatar } from '@/components/ui/Avatar'
import { ROLE_LABELS } from '@/lib/constants'
import { useToast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/dateUtils'

const ROLE_OPTIONS: UserRole[] = ['contributor', 'reviewer', 'manager', 'admin']

export function UserTable() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const currentProfile = useAuthStore((s) => s.profile)
  const { toast } = useToast()

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at')
    if (data) setUsers(data as Profile[])
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  const changeRole = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase.rpc('set_user_role', {
        target_id: userId,
        new_role: newRole,
      })
      if (error) throw error
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
      toast('Role updated')
    } catch {
      toast('Failed to update role', 'error')
    }
  }

  if (loading) {
    return <p className="text-sm text-white/25 py-4 text-center">Loading users...</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {['User', 'Email', 'Role', 'Joined'].map((h) => (
              <th key={h} className="text-left py-2.5 px-4 text-[10px] font-semibold uppercase tracking-widest text-white/25">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
              <td className="py-3 px-4">
                <div className="flex items-center gap-2.5">
                  <Avatar src={user.avatar_url} name={user.full_name ?? user.email} size="sm" />
                  <span className="font-medium text-white/70">
                    {user.full_name ?? '—'}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4 text-white/35 text-xs">{user.email}</td>
              <td className="py-3 px-4">
                <select
                  value={user.role}
                  disabled={user.id === currentProfile?.id}
                  onChange={(e) => changeRole(user.id, e.target.value as UserRole)}
                  className="text-xs px-2.5 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] text-white/60 disabled:opacity-40 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#22c55e]/40 transition-all"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
              </td>
              <td className="py-3 px-4 text-white/25 text-xs">{formatDate(user.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
