import { useState, useEffect } from 'react'
import type { Comment } from '@/types'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export function useComments(cardId: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const profile = useAuthStore((s) => s.profile)

  const fetchComments = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('comments')
      .select('*, author:profiles!author_id(full_name, avatar_url, email)')
      .eq('card_id', cardId)
      .order('created_at', { ascending: true })
    if (data) setComments(data as Comment[])
    setLoading(false)
  }

  useEffect(() => {
    fetchComments()
  }, [cardId])

  const addComment = async (body: string, parentId?: string) => {
    if (!profile) return
    const { data, error } = await supabase
      .from('comments')
      .insert({ card_id: cardId, author_id: profile.id, body, parent_id: parentId ?? null })
      .select('*, author:profiles!author_id(full_name, avatar_url, email)')
      .single()
    if (error) throw error
    setComments((prev) => [...prev, data as Comment])
  }

  const resolveComment = async (commentId: string) => {
    await supabase.from('comments').update({ resolved: true }).eq('id', commentId)
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, resolved: true } : c))
    )
  }

  return { comments, loading, addComment, resolveComment, refresh: fetchComments }
}
