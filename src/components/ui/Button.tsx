import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: React.ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-[#16a34a] to-[#22c55e] hover:from-[#15803d] hover:to-[#16a34a] text-white border-transparent btn-glow shadow-lg shadow-green-500/20',
  secondary:
    'bg-white/[0.06] hover:bg-white/[0.1] text-white/70 hover:text-white border-white/[0.08] hover:border-white/[0.15]',
  ghost:
    'bg-transparent hover:bg-white/[0.06] text-white/50 hover:text-white/80 border-transparent',
  danger:
    'bg-red-500/90 hover:bg-red-500 text-white border-transparent shadow-lg shadow-red-500/20',
  outline:
    'bg-transparent border-white/[0.12] text-white/60 hover:text-white hover:border-white/[0.25] hover:bg-white/[0.04]',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3.5 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-sm gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, className = '', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center font-semibold rounded-lg border
          transition-all duration-150 cursor-pointer
          disabled:opacity-40 disabled:cursor-not-allowed
          ${variantClasses[variant]} ${sizeClasses[size]} ${className}
        `}
        {...props}
      >
        {loading ? <Loader2 size={13} className="animate-spin" /> : icon}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
