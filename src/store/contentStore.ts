import { create } from 'zustand'
import type { ContentCard, ContentStatus, ContentType, Platform } from '@/types'
import { supabase } from '@/lib/supabase'
import { ALLOWED_TRANSITIONS, STATUS_ORDER } from '@/lib/constants'
import { useTeamStore } from './teamStore'
import { useAuthStore } from './authStore'

interface Filters {
  platform: Platform | null
  contentType: ContentType | null
  status: ContentStatus | null
  search: string
  ownerId: string | null
}

interface ContentState {
  cards: ContentCard[]
  loading: boolean
  filters: Filters
  fetchCards: () => Promise<void>
  upsertCard: (card: Partial<ContentCard>) => Promise<ContentCard>
  deleteCard: (id: string) => Promise<void>
  transitionStatus: (id: string, to: ContentStatus, note?: string) => Promise<void>
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void
  resetFilters: () => void
  patchCard: (card: ContentCard) => void
  removeCard: (id: string) => void
  filteredCards: () => ContentCard[]
  cardsByStatus: () => Record<ContentStatus, ContentCard[]>
  scheduledInNextDays: (days: number) => ContentCard[]
}

const DEFAULT_FILTERS: Filters = {
  platform: null,
  contentType: null,
  status: null,
  search: '',
  ownerId: null,
}

export const useContentStore = create<ContentState>((set, get) => ({
  cards: [],
  loading: false,
  filters: { ...DEFAULT_FILTERS },

  fetchCards: async () => {
    set({ loading: true })
    const { currentTeamId, isAllTeamsView, myTeamIds } = useTeamStore.getState()
    const role = useAuthStore.getState().profile?.role
    const isGlobal = role === 'admin' || role === 'manager' || isAllTeamsView

    let query = supabase
      .from('content_cards')
      .select('*, owner:profiles!owner_id(full_name, avatar_url, email)')
      .order('created_at', { ascending: false })

    if (!isGlobal) {
      if (currentTeamId) {
        query = query.eq('team_id', currentTeamId)
      } else if (myTeamIds.length > 0) {
        query = query.in('team_id', myTeamIds)
      }
    }

    const { data, error } = await query
    if (!error && data) set({ cards: data as ContentCard[] })
    set({ loading: false })
  },

  upsertCard: async (card) => {
    const isNew = !card.id
    const id = card.id ?? crypto.randomUUID()
    const payload = { ...card, id }

    const { data, error } = await supabase
      .from('content_cards')
      .upsert(payload)
      .select('*, owner:profiles!owner_id(full_name, avatar_url, email)')
      .single()
    if (error) throw error

    const saved = data as ContentCard
    set((state) => ({
      cards: isNew
        ? [saved, ...state.cards]
        : state.cards.map((c) => (c.id === saved.id ? saved : c)),
    }))
    return saved
  },

  deleteCard: async (id) => {
    await supabase.from('content_cards').delete().eq('id', id)
    set((state) => ({ cards: state.cards.filter((c) => c.id !== id) }))
  },

  transitionStatus: async (id, to, note) => {
    const card = get().cards.find((c) => c.id === id)
    if (!card) return
    const allowed = ALLOWED_TRANSITIONS[card.status]
    if (!allowed.includes(to)) return

    const { error } = await supabase
      .from('content_cards')
      .update({ status: to })
      .eq('id', id)
    if (error) throw error

    await supabase.from('status_history').insert({
      card_id: id,
      from_status: card.status,
      to_status: to,
      note: note ?? null,
    })

    set((state) => ({
      cards: state.cards.map((c) => (c.id === id ? { ...c, status: to } : c)),
    }))
  },

  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),

  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),

  patchCard: (card) =>
    set((state) => ({
      cards: state.cards.some((c) => c.id === card.id)
        ? state.cards.map((c) => (c.id === card.id ? { ...c, ...card } : c))
        : [card, ...state.cards],
    })),

  removeCard: (id) =>
    set((state) => ({ cards: state.cards.filter((c) => c.id !== id) })),

  filteredCards: () => {
    const { cards, filters } = get()
    return cards.filter((c) => {
      if (filters.platform) {
        const platforms = c.platforms?.length ? c.platforms : [c.platform]
        if (!platforms.includes(filters.platform)) return false
      }
      if (filters.contentType && c.content_type !== filters.contentType) return false
      if (filters.status && c.status !== filters.status) return false
      if (filters.ownerId && c.owner_id !== filters.ownerId) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const id = c.content_id?.toLowerCase() ?? ''
        if (!c.title.toLowerCase().includes(q) && !id.includes(q)) return false
      }
      return true
    })
  },

  cardsByStatus: () => {
    const filtered = get().filteredCards()
    const map: Record<string, ContentCard[]> = {}
    for (const s of STATUS_ORDER) map[s] = []
    for (const c of filtered) {
      if (map[c.status] !== undefined) map[c.status].push(c)
    }
    return map as Record<ContentStatus, ContentCard[]>
  },

  scheduledInNextDays: (days) => {
    const now = new Date()
    const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
    return get().cards.filter((c) => {
      if (!c.scheduled_date) return false
      const d = new Date(c.scheduled_date)
      return d >= now && d <= end
    })
  },
}))
