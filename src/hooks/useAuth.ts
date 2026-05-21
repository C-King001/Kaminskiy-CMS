import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const { session, profile, loading, signOut } = useAuthStore()
  return { session, profile, loading, signOut, isAuthenticated: !!session }
}
