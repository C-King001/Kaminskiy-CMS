import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Columns3, Calendar, Lightbulb, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pipeline', icon: Columns3, label: 'Pipeline' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/ideas', icon: Lightbulb, label: 'Ideas' },
]

export function MobileNav() {
  const navigate = useNavigate()
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 border-t border-white/[0.06] z-40 flex items-center"
      style={{ backgroundColor: '#13151f' }}
    >
      {NAV_ITEMS.slice(0, 2).map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `
            flex-1 flex flex-col items-center py-2.5 text-[10px] font-semibold gap-0.5 transition-colors
            ${isActive ? 'text-[#22c55e]' : 'text-white/30'}
          `}
        >
          <Icon size={19} />
          {label}
        </NavLink>
      ))}

      <div className="flex-1 flex justify-center">
        <button
          onClick={() => navigate('/content/new')}
          className="w-11 h-11 rounded-full flex items-center justify-center -mt-4 text-white transition-transform active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #16a34a, #22c55e)',
            boxShadow: '0 0 20px rgba(34,197,94,0.45)',
          }}
        >
          <Plus size={20} />
        </button>
      </div>

      {NAV_ITEMS.slice(2).map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `
            flex-1 flex flex-col items-center py-2.5 text-[10px] font-semibold gap-0.5 transition-colors
            ${isActive ? 'text-[#22c55e]' : 'text-white/30'}
          `}
        >
          <Icon size={19} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
