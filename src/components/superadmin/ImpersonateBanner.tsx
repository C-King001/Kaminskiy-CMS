import { UserCheck, X } from 'lucide-react'

interface Props {
  tenantName: string
  tenantColor: string
  onExit: () => void
}

export function ImpersonateBanner({ tenantName, tenantColor, onExit }: Props) {
  return (
    <div
      className="flex items-center justify-between px-4 py-2 shrink-0 text-sm font-semibold"
      style={{
        backgroundColor: tenantColor + '22',
        borderBottom: `1px solid ${tenantColor}44`,
      }}
    >
      <div className="flex items-center gap-2" style={{ color: tenantColor }}>
        <UserCheck size={15} />
        <span>
          Impersonating <span className="font-bold">{tenantName}</span> — you have full admin access to this workspace
        </span>
      </div>
      <button
        onClick={onExit}
        className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all hover:opacity-80"
        style={{ backgroundColor: tenantColor + '33', color: tenantColor }}
      >
        <X size={13} />
        Exit Impersonation
      </button>
    </div>
  )
}
