import { useState, useRef, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Columns3, Calendar, Users, Settings,
  ChevronLeft, ChevronRight, LogOut, Lightbulb, BarChart3, ChevronDown, Check, Globe, ShieldCheck,
} from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { useTeamStore, canSeeAllTeams } from '@/store/teamStore'
import { Avatar } from '@/components/ui/Avatar'
import { ROLE_LABELS } from '@/lib/constants'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pipeline', icon: Columns3, label: 'Content Board' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/ideas', icon: Lightbulb, label: 'Idea Bank' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin', icon: Users, label: 'Team', adminOnly: true },
]

function TeamSwitcher({ collapsed }: { collapsed: boolean }) {
  const { teams, currentTeamId, isAllTeamsView, setCurrentTeam, setAllTeamsView, myTeamIds } = useTeamStore()
  const profile = useAuthStore((s) => s.profile)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = teams.find((t) => t.id === currentTeamId) ?? teams[0]
  const showAllTeamsOption = canSeeAllTeams(profile?.role, myTeamIds)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (!teams.length) return null

  return (
    <div ref={ref} className="relative px-2 py-2 border-b border-white/[0.06]">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-white/[0.05] transition-all ${collapsed ? 'justify-center' : ''}`}
      >
        {isAllTeamsView ? (
          <div className="w-5 h-5 rounded-md shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #22c55e, #3b82f6, #f97316)' }}>
            <Globe size={11} className="text-white" />
          </div>
        ) : (
          <div className="w-5 h-5 rounded-md shrink-0" style={{ backgroundColor: current?.color ?? '#22c55e' }} />
        )}
        {!collapsed && (
          <>
            <span className="flex-1 text-left text-xs font-bold text-white/70 truncate">
              {isAllTeamsView ? 'All Teams' : (current?.name ?? 'Select Team')}
            </span>
            <ChevronDown size={12} className={`text-white/30 transition-transform ${open ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {open && (
        <div
          className="absolute left-2 right-2 top-full mt-1 rounded-xl border border-white/[0.1] overflow-hidden z-50 shadow-xl"
          style={{ backgroundColor: '#0f1117' }}
        >
          <p className="text-[9px] font-bold uppercase tracking-widest text-white/25 px-3 pt-2.5 pb-1.5">
            Switch Team
          </p>

          {showAllTeamsOption && (
            <button
              onClick={() => { setAllTeamsView(true); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/[0.06] transition-all text-left"
            >
              <div className="w-4 h-4 rounded-md shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #22c55e, #3b82f6, #f97316)' }}>
                <Globe size={9} className="text-white" />
              </div>
              <span className="flex-1 text-xs font-semibold text-white/70 truncate">All Teams</span>
              {isAllTeamsView && <Check size={11} className="text-[#22c55e] shrink-0" />}
            </button>
          )}

          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => { setCurrentTeam(team.id); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/[0.06] transition-all text-left"
            >
              <div className="w-4 h-4 rounded-md shrink-0" style={{ backgroundColor: team.color }} />
              <span className="flex-1 text-xs font-semibold text-white/70 truncate">{team.name}</span>
              {!isAllTeamsView && team.id === currentTeamId && <Check size={11} className="text-[#22c55e] shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const { profile, signOut } = useAuthStore()
  const isAdmin = profile?.role === 'admin'
  const collapsed = !sidebarOpen

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

      {/* Team switcher */}
      <TeamSwitcher collapsed={collapsed} />

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

      {/* SuperAdmin link (admin only) */}
      {isAdmin && (
        <div className="px-2 pb-1">
          <NavLink
            to="/superadmin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-violet-500/10 text-violet-300 border border-violet-500/20'
                  : 'text-white/30 hover:text-white/60 hover:bg-white/[0.05]'
              } ${!sidebarOpen ? 'justify-center px-0' : ''}`
            }
            title={!sidebarOpen ? 'SuperAdmin' : undefined}
          >
            {({ isActive }) => (
              <>
                <ShieldCheck size={15} className={`shrink-0 ${isActive ? 'text-violet-400' : ''}`} />
                {sidebarOpen && <span>SuperAdmin</span>}
              </>
            )}
          </NavLink>
        </div>
      )}

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
