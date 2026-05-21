import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { PageSpinner } from '@/components/ui/Spinner'
import type { ReactNode } from 'react'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuthStore()

  if (loading) return <PageSpinner />
  if (!session) return <Navigate to="/login" replace />

  return <>{children}</>
}
