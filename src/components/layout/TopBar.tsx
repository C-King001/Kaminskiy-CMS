import { Bell, Moon, Sun, Plus, User, Settings, LogOut } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useNotificationStore } from '@/store/notificationStore'
import { useAuthStore } from '@/store/authStore'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown'
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROLE_LABELS } from '@/lib/constants'

interface TopBarProps {
  title?: string
}

function ProfileMenu({ onClose }: { onClose: () => void }) {
  const { profile, signOut } = useAuthStore()
  const navigate = useNavigate()

  const go = (path: string) => { navigate(path); onClose() }

  return (
    <div
      className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-white/[0.1] overflow-hidden z-50 shadow-2xl animate-fade-up"
      style={{ backgroundColor: '#0f1117' }}
    >
      {/* Profile header */}
      <div className="px-4 py-3 border-b border-white/[0.07]">
        <p className="text-xs font-bold text-white/80 truncate">{profile?.full_name ?? profile?.email}</p>
        <p className="text-[10px] text-white/30 mt-0.5">{profile ? ROLE_LABELS[profile.role] : ''}</p>
      </div>

      <div className="py-1">
        <button
          onClick={() => go('/settings')}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-white/60 hover:text-white/90 hover:bg-white/[0.05] transition-all text-left"
        >
          <User size={13} className="text-white/30" />
          My Profile
        </button>
        <button
          onClick={() => go('/settings')}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-white/60 hover:text-white/90 hover:bg-white/[0.05] transition-all text-left"
        >
          <Settings size={13} className="text-white/30" />
          Settings
        </button>
      </div>

      <div className="border-t border-white/[0.07] py-1">
        <button
          onClick={() => { signOut(); onClose() }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-400/80 hover:text-red-400 hover:bg-red-500/[0.06] transition-all text-left"
        >
          <LogOut size={13} />
          Sign Out
        </button>
      </div>
    </div>
  )
}

export function TopBar({ title }: TopBarProps) {
  const { darkMode, toggleDarkMode } = useUIStore()
  const { unreadCount } = useNotificationStore()
  const { profile } = useAuthStore()
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const navigate = useNavigate()
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header
      className="flex items-center justify-between px-4 md:px-6 border-b border-white/[0.06] shrink-0 h-14"
      style={{ backgroundColor: '#13151f' }}
    >
      <h1 className="text-sm font-semibold text-white/60 tracking-tight">{title ?? ''}</h1>

      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          onClick={() => navigate('/content/new')}
          icon={<Plus size={13} />}
          className="hidden sm:inline-flex"
        >
          New Post
        </Button>

        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all"
        >
          {darkMode ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <div className="relative">
          <button
            onClick={() => { setNotifOpen((v) => !v); setProfileOpen(false) }}
            className="p-2 rounded-xl text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all relative"
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-pulse-dot" />
            )}
          </button>
          {notifOpen && <NotificationDropdown onClose={() => setNotifOpen(false)} />}
        </div>

        {/* Avatar with dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false) }}
            className="rounded-full transition-all"
            style={{ outline: profileOpen ? '2px solid rgba(34,197,94,0.5)' : '2px solid rgba(255,255,255,0.08)' }}
          >
            <Avatar
              src={profile?.avatar_url}
              name={profile?.full_name ?? profile?.email}
              size="sm"
              className="cursor-pointer"
            />
          </button>
          {profileOpen && <ProfileMenu onClose={() => setProfileOpen(false)} />}
        </div>
      </div>
    </header>
  )
}
