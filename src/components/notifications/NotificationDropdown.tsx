import { useEffect, useRef } from 'react'
import { useNotificationStore } from '@/store/notificationStore'
import { formatRelative } from '@/lib/dateUtils'
import { Bell, CheckCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Props {
  onClose: () => void
}

export function NotificationDropdown({ onClose }: Props) {
  const { notifications, markRead, markAllRead, fetchNotifications } = useNotificationStore()
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchNotifications()
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const handleClick = (notif: (typeof notifications)[0]) => {
    markRead(notif.id)
    if (notif.card_id) navigate(`/content/${notif.card_id}`)
    onClose()
  }

  return (
    <div
      ref={ref}
      className="absolute right-0 top-10 w-80 bg-[#1a1d27] border border-white/[0.08] rounded-2xl shadow-[0_24px_48px_rgba(0,0,0,0.5)] z-50 overflow-hidden animate-fade-up"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <span className="text-xs font-semibold text-white/70 uppercase tracking-widest">Notifications</span>
        <button
          onClick={markAllRead}
          className="flex items-center gap-1 text-[10px] text-[#22c55e] hover:opacity-80 transition-opacity"
        >
          <CheckCheck size={11} />
          Mark all read
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-white/20">
            <Bell size={22} />
            <p className="text-xs">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={`
                w-full text-left px-4 py-3 hover:bg-white/[0.04] transition-colors border-b border-white/[0.04] last:border-0
                ${!n.read ? 'bg-[#22c55e]/[0.06]' : ''}
              `}
            >
              <p className="text-xs text-white/60 leading-relaxed">{n.message}</p>
              <p className="text-[10px] text-white/25 mt-0.5">{formatRelative(n.created_at)}</p>
              {!n.read && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#22c55e] mt-1 animate-pulse-dot" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  )
}
