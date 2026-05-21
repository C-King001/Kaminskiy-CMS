import { create } from 'zustand'
import type { Notification as AppNotification } from '@/types'
import { supabase } from '@/lib/supabase'

interface NotificationState {
  notifications: AppNotification[]
  unreadCount: number
  loading: boolean
  fetchNotifications: () => Promise<void>
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  addNotification: (n: AppNotification) => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('notifications')
      .select('*, actor:profiles!actor_id(full_name, avatar_url), card:content_cards!card_id(title)')
      .order('created_at', { ascending: false })
      .limit(50)
    if (!error && data) {
      const notifs = data as AppNotification[]
      set({ notifications: notifs, unreadCount: notifs.filter((n) => !n.read).length })
    }
    set({ loading: false })
  },

  markRead: async (id) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }))
  },

  markAllRead: async () => {
    await supabase.from('notifications').update({ read: true }).eq('read', false)
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }))
  },

  addNotification: (n) =>
    set((state) => ({
      notifications: [n, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),
}))
