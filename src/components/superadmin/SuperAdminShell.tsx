import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom'
import { Building2, CreditCard, BarChart3, ArrowLeft, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useSuperAdminStore } from '@/store/superAdminStore'
import { ImpersonateBanner } from './ImpersonateBanner'
import { PageSpinner } from '@/components/ui/Spinner'

const NAV = [
  { to: '/superadmin/tenants', icon: Building2, label: 'Tenants' },
  { to: '/superadmin/billing', icon: CreditCard, label: 'Billing' },
  { to: '/superadmin/analytics', icon: BarChart3, label: 'Analytics' },
]

export function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const { session, profile, loading } = useAuthStore()

  if (loading) return <PageSpinner />
  if (!session) return <Navigate to="/login" replace />
  if (profile?.role !== 'admin') return <Navigate to="/dashboard" replace />

  return <>{children}</>
}

export function SuperAdminShell() {
  const navigate = useNavigate()
  const { impersonating, stopImpersonation } = useSuperAdminStore()

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#0f1117' }}>
      {/* Sidebar */}
      <aside
        className="w-56 shrink-0 flex flex-col border-r border-white/[0.06]"
        style={{ backgroundColor: '#13151f' }}
      >
        {/* Logo area */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-white/[0.06] shrink-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            <ShieldCheck size={14} className="text-white" />
          </div>
          <div className="min-w-0">
            <span className="text-white font-bold text-sm tracking-tight block leading-tight truncate">
              SuperAdmin
            </span>
            <span className="text-[10px] text-white/25 block leading-tight">Platform Control</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 flex flex-col gap-0.5 px-2 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-violet-500/10 text-violet-300 border border-violet-500/20'
                    : 'text-white/40 hover:text-white/80 hover:bg-white/[0.05]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} className={`shrink-0 ${isActive ? 'text-violet-400' : ''}`} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Back to app */}
        <div className="border-t border-white/[0.06] p-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/30 hover:text-white/70 hover:bg-white/[0.05] transition-all"
          >
            <ArrowLeft size={16} />
            <span>Back to App</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {impersonating && (
          <ImpersonateBanner
            tenantName={impersonating.tenantName}
            tenantColor={impersonating.tenantColor}
            onExit={() => {
              stopImpersonation()
            }}
          />
        )}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
