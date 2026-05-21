import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Columns3, Calendar, Users, Settings, ChevronLeft, ChevronRight, LogOut,
} from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { Avatar } from '@/components/ui/Avatar'
import { ROLE_LABELS } from '@/lib/constants'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pipeline', icon: Columns3, label: 'Content Board' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/admin', icon: Users, label: 'Team', adminOnly: true },
]

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const { profile, signOut } = useAuthStore()
  const isAdmin = profile?.role === 'admin'

  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin)

  return (
    <aside
      className={`hidden md:flex flex-col shrink-0 transition-all duration-200 border-r border-white/[0.06] ${sidebarOpen ? 'w-56' : 'w-16'}`}
      style={{ backgroundColor: '#13151f' }}
    >
      {/* Logo area */}
      <div
        className={`flex items-center gap-3 border-b border-white/[0.06] h-14 shrink-0 ${sidebarOpen ? 'px-4' : 'justify-center px-0'}`}
      >
        <img
          src="/kcr-icon.jpg"
          alt="KCR"
          className="w-8 h-8 rounded-lg object-cover shrink-0"
        />
        {sidebarOpen && (
          <div className="min-w-0">
            <span className="text-white font-bold text-sm tracking-tight block leading-tight truncate">KCR CMS</span>
            <span className="text-[10px] text-white/25 block leading-tight">Content Operations</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 flex flex-col gap-0.5 px-2 overflow-y-auto">
        {visibleItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative group ${
                isActive ? 'nav-active-glow text-white' : 'text-white/40 hover:text-white/80 hover:bg-white/[0.05]'
              } ${!sidebarOpen ? 'justify-center px-0' : ''}`
            }
            title={!sidebarOpen ? label : undefined}
          >
            {({ isActive }) => (
              <>
                <Icon size={17} className={`shrink-0 ${isActive ? 'text-[#22c55e]' : ''}`} />
                {sidebarOpen && <span>{label}</span>}
                {!sidebarOpen && isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#22c55e] rounded-r-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Settings + User */}
      <div className="border-t border-white/[0.06]">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all mx-2 my-1 rounded-xl ${
              isActive ? 'nav-active-glow text-white' : 'text-white/30 hover:text-white/60 hover:bg-white/[0.05]'
            } ${!sidebarOpen ? 'justify-center' : ''}`
          }
          title={!sidebarOpen ? 'Settings' : undefined}
        >
          {({ isActive }) => (
            <>
              <Settings size={16} className={`shrink-0 ${isActive ? 'text-[#22c55e]' : ''}`} />
              {sidebarOpen && <span>Settings</span>}
            </>
          )}
        </NavLink>

        <div className={`p-3 ${sidebarOpen ? '' : 'flex justify-center'}`}>
          {sidebarOpen ? (
            <div className="flex items-center gap-2 px-1">
              <Avatar src={profile?.avatar_url} name={profile?.full_name ?? profile?.email} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white/80 truncate leading-tight">
                  {profile?.full_name ?? profile?.email ?? 'User'}
                </p>
                <p className="text-[10px] text-white/30 leading-tight">
                  {profile ? ROLE_LABELS[profile.role] : ''}
                </p>
              </div>
              <button
                onClick={signOut}
                className="p-1.5 rounded-lg text-white/20 hover:text-white/60 hover:bg-white/[0.05] transition-all"
                title="Sign out"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <button onClick={signOut} title="Sign out" className="hover:opacity-80 transition-opacity">
              <Avatar src={profile?.avatar_url} name={profile?.full_name ?? profile?.email} size="sm" />
            </button>
          )}
        </div>
      </div>

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="flex items-center justify-center py-2.5 border-t border-white/[0.06] text-white/20 hover:text-white/60 hover:bg-white/[0.03] transition-all"
      >
        {sidebarOpen ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
      </button>
    </aside>
  )
}
