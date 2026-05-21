import { forwardRef, type TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-[11px] font-semibold uppercase tracking-widest text-white/30">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`
            w-full px-3.5 py-2.5 text-sm rounded-xl border resize-none
            bg-white/[0.04]
            border-white/[0.08]
            text-white/80
            placeholder-white/20
            focus:outline-none focus:ring-1 focus:ring-[#22c55e]/40 focus:border-[#22c55e]/30 focus:bg-white/[0.06]
            disabled:opacity-40
            transition-all
            ${error ? 'border-red-500/50 focus:ring-red-400/40' : ''}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-white/25">{hint}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
