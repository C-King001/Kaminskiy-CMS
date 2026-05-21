import type { ReactNode } from 'react'
import type { UserRole } from '@/types'
import { useAuthStore } from '@/store/authStore'
import { ShieldOff } from 'lucide-react'

interface RoleGateProps {
  allow: UserRole[]
  children: ReactNode
  fallback?: ReactNode
}

export function RoleGate({ allow, children, fallback }: RoleGateProps) {
  const profile = useAuthStore((s) => s.profile)

  if (!profile || !allow.includes(profile.role)) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
        <ShieldOff size={32} className="text-gray-300 dark:text-gray-600" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          You don't have permission to view this page.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
