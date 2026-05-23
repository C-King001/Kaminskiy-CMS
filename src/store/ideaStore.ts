import { create } from 'zustand'
import type { Idea, ContentType } from '@/types'
import { supabase } from '@/lib/supabase'

interface IdeaFilters {
  tags: string[]
  contentType: ContentType | null
  search: string
  teamId: string | null
}

interface IdeaState {
  ideas: Idea[]
  loading: boolean
  filters: IdeaFilters
  fetchIdeas: () => Promise<void>
  createIdea: (idea: Partial<Idea>) => Promise<Idea>
  updateIdea: (id: string, updates: Partial<Idea>) => Promise<void>
  deleteIdea: (id: string) => Promise<void>
  promoteIdea: (ideaId: string, cardId: string) => Promise<void>
  setFilter: <K extends keyof IdeaFilters>(key: K, value: IdeaFilters[K]) => void
  filteredIdeas: () => Idea[]
}

export const useIdeaStore = create<IdeaState>((set, get) => ({
  ideas: [],
  loading: false,
  filters: { tags: [], contentType: null, search: '', teamId: null },

  fetchIdeas: async () => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('ideas')
      .select('*, owner:profiles!owner_id(full_name, avatar_url)')
      .order('created_at', { ascending: false })
    if (!error && data) set({ ideas: data as Idea[] })
    set({ loading: false })
  },

  createIdea: async (idea) => {
    const { currentTeamId } = useTeamStore.getState()
    const { data, error } = await supabase
      .from('ideas')
      .insert({ ...idea, team_id: idea.team_id ?? currentTeamId ?? null })
      .select('*, owner:profiles!owner_id(full_name, avatar_url)')
      .single()
    if (error) throw error
    const saved = data as Idea
    set((state) => ({ ideas: [saved, ...state.ideas] }))
    return saved
  },

  updateIdea: async (id, updates) => {
    const { error } = await supabase.from('ideas').update(updates).eq('id', id)
    if (error) throw error
    set((state) => ({
      ideas: state.ideas.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    }))
  },

  deleteIdea: async (id) => {
    await supabase.from('ideas').delete().eq('id', id)
    set((state) => ({ ideas: state.ideas.filter((i) => i.id !== id) }))
  },

  promoteIdea: async (ideaId, cardId) => {
    await supabase
      .from('ideas')
      .update({ status: 'promoted', promoted_card_id: cardId })
      .eq('id', ideaId)
    set((state) => ({
      ideas: state.ideas.map((i) =>
        i.id === ideaId ? { ...i, status: 'promoted', promoted_card_id: cardId } : i
      ),
    }))
  },

  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),

  filteredIdeas: () => {
    const { ideas, filters } = get()
    return ideas.filter((i) => {
      if (i.status === 'promoted') return false
      if (filters.contentType && i.content_type !== filters.contentType) return false
      if (filters.tags.length > 0 && !filters.tags.some((t) => i.tags.includes(t))) return false
      if (filters.search && !i.title.toLowerCase().includes(filters.search.toLowerCase())) return false
      if (filters.teamId && i.team_id !== filters.teamId) return false
      return true
    })
  },
}))
