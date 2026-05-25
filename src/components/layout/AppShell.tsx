import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { MobileNav } from './MobileNav'
import { ImpersonateBanner } from '@/components/superadmin/ImpersonateBanner'
import { useRealtime } from '@/hooks/useRealtime'
import { useAuthStore } from '@/store/authStore'
import { useTeamStore } from '@/store/teamStore'
import { useContentStore } from '@/store/contentStore'
import { useIdeaStore } from '@/store/ideaStore'
import { useSuperAdminStore } from '@/store/superAdminStore'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/pipeline': 'Content Board',
  '/calendar': 'Calendar',
  '/ideas': 'Idea Bank',
  '/analytics': 'Analytics',
  '/admin': 'Team',
  '/settings': 'Settings',
  '/content/new': 'New Post',
}

export function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const currentTeamId = useTeamStore((s) => s.currentTeamId)
  const isAllTeamsView = useTeamStore((s) => s.isAllTeamsView)
  const fetchCards = useContentStore((s) => s.fetchCards)
  const fetchIdeas = useIdeaStore((s) => s.fetchIdeas)
  const { impersonating, stopImpersonation } = useSuperAdminStore()

  useRealtime(profile?.id)

  // Global keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        navigate('/content/new')
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [navigate])

  useEffect(() => {
    fetchCards()
    fetchIdeas()
  }, [currentTeamId, isAllTeamsView])

  const title = PAGE_TITLES[location.pathname] ?? 'Content Card'

  return (
    <div className="flex h-screen bg-[#F7F6F3] dark:bg-[#0f1117] overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {impersonating && (
          <ImpersonateBanner
            tenantName={impersonating.tenantName}
            tenantColor={impersonating.tenantColor}
            onExit={() => {
              stopImpersonation()
              navigate('/superadmin/tenants')
            }}
          />
        )}
        <TopBar title={title} />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
