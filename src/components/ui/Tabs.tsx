import { type ReactNode } from 'react'

interface Tab {
  id: string
  label: string
  icon?: ReactNode
}

interface TabsProps {
  tabs: Tab[]
  active: string
  onChange: (id: string) => void
  className?: string
}

export function Tabs({ tabs, active, onChange, className = '' }: TabsProps) {
  return (
    <div className={`flex gap-1 p-1 bg-white/[0.04] border border-white/[0.06] rounded-xl ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all
            ${active === tab.id
              ? 'bg-[#22c55e]/20 text-[#22c55e] shadow-sm'
              : 'text-white/30 hover:text-white/60 hover:bg-white/[0.04]'
            }
          `}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  )
}
