import { Sparkles, Check } from 'lucide-react'
import { useCaptionGen } from '@/hooks/useCaptionGen'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import type { ContentType, Platform } from '@/types'

interface Props {
  title: string
  contentType: ContentType
  platform: Platform
  notes?: string
  onSelect: (caption: string) => void
}

export function CaptionGenerator({ title, contentType, platform, notes, onSelect }: Props) {
  const { captions, loading, error, generate, reset } = useCaptionGen()

  const canGenerate = title.trim().length > 0

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-semibold uppercase tracking-widest text-white/30 flex items-center gap-1.5">
          <Sparkles size={12} className="text-[#22c55e]" />
          AI Caption Ideas
        </label>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => generate({ title, contentType, platform, notes })}
          loading={loading}
          disabled={!canGenerate}
        >
          {captions.length > 0 ? 'Regenerate' : 'Generate'}
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-4">
          <Spinner size={18} />
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl">{error}</p>
      )}

      {captions.length > 0 && (
        <div className="flex flex-col gap-2">
          {captions.map((caption, i) => (
            <div
              key={i}
              className="group relative p-3 rounded-xl border border-white/[0.07] bg-white/[0.03] text-sm text-white/55 cursor-pointer hover:border-[#22c55e]/40 hover:bg-[#22c55e]/[0.06] transition-all"
              onClick={() => { onSelect(caption); reset() }}
            >
              <p className="leading-relaxed pr-6">{caption}</p>
              <Check
                size={13}
                className="absolute top-3 right-3 text-[#22c55e] opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
