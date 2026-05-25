import type { ReactNode } from 'react'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

function DefaultIllustration() {
  return (
    <svg width="80" height="64" viewBox="0 0 80 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="12" width="64" height="44" rx="8" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5"/>
      <rect x="16" y="20" width="24" height="4" rx="2" fill="rgba(255,255,255,0.08)"/>
      <rect x="16" y="28" width="40" height="3" rx="1.5" fill="rgba(255,255,255,0.05)"/>
      <rect x="16" y="34" width="32" height="3" rx="1.5" fill="rgba(255,255,255,0.05)"/>
      <rect x="16" y="40" width="20" height="3" rx="1.5" fill="rgba(255,255,255,0.05)"/>
      <circle cx="60" cy="20" r="12" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.2)" strokeWidth="1.5"/>
      <path d="M56 20l3 3 5-5" stroke="rgba(34,197,94,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="mb-5 opacity-80">
        {icon ? (
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-white/20 mx-auto"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            <span className="scale-150">{icon}</span>
          </div>
        ) : (
          <DefaultIllustration />
        )}
      </div>

      <h3 className="text-base font-bold text-white/70 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-white/30 max-w-xs mb-6 leading-relaxed">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  )
}
