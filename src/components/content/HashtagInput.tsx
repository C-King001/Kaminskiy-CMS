import { useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'

interface Props {
  value: string[]
  onChange: (tags: string[]) => void
}

export function HashtagInput({ value, onChange }: Props) {
  const [input, setInput] = useState('')

  const add = (raw: string) => {
    const tag = raw.replace(/^#+/, '').trim().replace(/\s+/g, '_')
    if (tag && !value.includes(tag)) {
      onChange([...value, tag])
    }
    setInput('')
  }

  const remove = (tag: string) => onChange(value.filter((t) => t !== tag))

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
      e.preventDefault()
      add(input)
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      remove(value[value.length - 1])
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-widest text-white/30">Hashtags</label>
      <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] min-h-[42px] focus-within:ring-1 focus-within:ring-[#22c55e]/50 focus-within:bg-white/[0.06] transition-all">
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#22c55e]/15 text-[#4ade80]"
          >
            #{tag}
            <button onClick={() => remove(tag)} className="hover:opacity-70 transition-opacity">
              <X size={9} />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => input && add(input)}
          placeholder={value.length === 0 ? 'Type and press Enter...' : ''}
          className="flex-1 min-w-24 text-sm bg-transparent text-white/70 placeholder-white/20 outline-none"
        />
      </div>
      <p className="text-[10px] text-white/20">Press Enter or Space to add</p>
    </div>
  )
}
