import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Team, SocialAccount } from '@/types'
import { supabase } from '@/lib/supabase'

export function canSeeAllTeams(role: string | undefined, myTeamIds: string[]): boolean {
  return role === 'admin' || role === 'manager' || myTeamIds.length >= 2
}

interface TeamState {
  teams: Team[]
  currentTeamId: string | null
  isAllTeamsView: boolean
  myTeamIds: string[]
  socialAccounts: SocialAccount[]
  loading: boolean
  fetchTeams: () => Promise<void>
  fetchMyMemberships: (userId: string) => Promise<void>
  fetchSocialAccounts: (teamId: string) => Promise<void>
  setCurrentTeam: (id: string) => void
  setAllTeamsView: (v: boolean) => void
  joinTeam: (teamId: string, userId: string) => Promise<void>
  leaveTeam: (teamId: string, userId: string) => Promise<void>
  updateTeam: (id: string, updates: Partial<Pick<Team, 'name' | 'description' | 'color' | 'logo_url'>>) => Promise<void>
  upsertSocialAccount: (account: Partial<SocialAccount> & { team_id: string; platform: string }) => Promise<void>
  currentTeam: () => Team | null
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      teams: [],
      currentTeamId: null,
      isAllTeamsView: false,
      myTeamIds: [],
      socialAccounts: [],
      loading: false,

      fetchTeams: async () => {
        set({ loading: true })
        const { data } = await supabase.from('teams').select('*').order('created_at')
        if (data) {
          set({ teams: data as Team[] })
          const { currentTeamId } = get()
          if (!currentTeamId && data.length > 0) {
            set({ currentTeamId: (data[0] as Team).id })
          }
        }
        set({ loading: false })
      },

      fetchMyMemberships: async (userId) => {
        const { data } = await supabase
          .from('team_memberships')
          .select('team_id')
          .eq('user_id', userId)
        if (data) {
          const ids = data.map((m: { team_id: string }) => m.team_id)
          set({ myTeamIds: ids })
          const { currentTeamId, teams } = get()
          if (!currentTeamId) {
            set({ currentTeamId: ids[0] ?? (teams[0]?.id ?? null) })
          }
        }
      },

      fetchSocialAccounts: async (teamId) => {
        const { data } = await supabase
          .from('social_accounts')
          .select('*')
          .eq('team_id', teamId)
        if (data) set({ socialAccounts: data as SocialAccount[] })
      },

      setCurrentTeam: (id) => {
        set({ currentTeamId: id, isAllTeamsView: false, socialAccounts: [] })
        get().fetchSocialAccounts(id)
      },

      setAllTeamsView: (v) => {
        set({ isAllTeamsView: v })
        if (!v) {
          const { currentTeamId } = get()
          if (currentTeamId) get().fetchSocialAccounts(currentTeamId)
        }
      },

      joinTeam: async (teamId, userId) => {
        await supabase.from('team_memberships').insert({ team_id: teamId, user_id: userId })
        set((state) => ({ myTeamIds: [...state.myTeamIds, teamId] }))
      },

      leaveTeam: async (teamId, userId) => {
        await supabase
          .from('team_memberships')
          .delete()
          .eq('team_id', teamId)
          .eq('user_id', userId)
        set((state) => ({ myTeamIds: state.myTeamIds.filter((id) => id !== teamId) }))
      },

      updateTeam: async (id, updates) => {
        const { data, error } = await supabase.from('teams').update(updates).eq('id', id).select().single()
        if (error) throw error
        set((state) => ({
          teams: state.teams.map((t) => (t.id === id ? { ...t, ...data } : t)),
        }))
      },

      upsertSocialAccount: async (account) => {
        const { data, error } = await supabase
          .from('social_accounts')
          .upsert(account, { onConflict: 'team_id,platform' })
          .select()
          .single()
        if (error) throw error
        const saved = data as SocialAccount
        set((state) => ({
          socialAccounts: state.socialAccounts.some((a) => a.id === saved.id)
            ? state.socialAccounts.map((a) => (a.id === saved.id ? saved : a))
            : [...state.socialAccounts, saved],
        }))
      },

      currentTeam: () => {
        const { teams, currentTeamId } = get()
        return teams.find((t) => t.id === currentTeamId) ?? null
      },
    }),
    {
      name: 'kcr-current-team',
      partialize: (state) => ({
        currentTeamId: state.currentTeamId,
        isAllTeamsView: state.isAllTeamsView,
      }),
    }
  )
)
