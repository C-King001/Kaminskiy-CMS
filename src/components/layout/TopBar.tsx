import { Bell, Moon, Sun, Plus } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useNotificationStore } from '@/store/notificationStore'
import { useAuthStore } from '@/store/authStore'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface TopBarProps {
  title?: string
}

export function TopBar({ title }: TopBarProps) {
  const { darkMode, toggleDarkMode } = useUIStore()
  const { unreadCount } = useNotificationStore()
  const { profile } = useAuthStore()
  const [notifOpen, setNotifOpen] = useState(false)
  const navigate = useNavigate()

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
            onClick={() => setNotifOpen((v) => !v)}
            className="p-2 rounded-xl text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all relative"
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-pulse-dot" />
            )}
          </button>
          {notifOpen && <NotificationDropdown onClose={() => setNotifOpen(false)} />}
        </div>

        <Avatar
          src={profile?.avatar_url}
          name={profile?.full_name ?? profile?.email}
          size="sm"
          className="cursor-pointer ring-1 ring-white/10 hover:ring-[#22c55e]/40 transition-all"
        />
      </div>
    </header>
  )
}
