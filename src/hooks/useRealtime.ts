import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useContentStore } from '@/store/contentStore'
import { useNotificationStore } from '@/store/notificationStore'
import type { ContentCard, Notification as AppNotification } from '@/types'

export function useRealtime(userId: string | undefined) {
  const patchCard = useContentStore((s) => s.patchCard)
  const removeCard = useContentStore((s) => s.removeCard)
  const addNotification = useNotificationStore((s) => s.addNotification)

  useEffect(() => {
    if (!userId) return

    const cardChannel = supabase
      .channel('content-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'content_cards' },
        (payload) => patchCard(payload.new as ContentCard)
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'content_cards' },
        (payload) => patchCard(payload.new as ContentCard)
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'content_cards' },
        (payload) => removeCard(payload.old.id as string)
      )
      .subscribe()

    const notifChannel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => addNotification(payload.new as AppNotification)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(cardChannel)
      supabase.removeChannel(notifChannel)
    }
  }, [userId])
}
