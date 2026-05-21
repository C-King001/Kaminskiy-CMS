import { useRef, useState } from 'react'
import {
  Bold, Italic, Heading1, Heading2, Heading3,
  List, ListOrdered, Eye, Edit3, Minus,
} from 'lucide-react'

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  label?: string
}

export function renderMarkdown(md: string): string {
  if (!md.trim()) return ''
  const escaped = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  const lines = escaped.split('\n')
  const out: string[] = []
  let inUl = false
  let inOl = false

  const closeUl = () => { if (inUl) { out.push('</ul>'); inUl = false } }
  const closeOl = () => { if (inOl) { out.push('</ol>'); inOl = false } }

  for (const raw of lines) {
    const line = raw
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code style="background:rgba(255,255,255,0.08);padding:1px 5px;border-radius:4px;font-size:0.85em">$1</code>')

    if (/^### /.test(line)) {
      closeUl(); closeOl()
      out.push(`<h3 class="rt-h3">${line.replace(/^### /, '')}</h3>`)
    } else if (/^## /.test(line)) {
      closeUl(); closeOl()
      out.push(`<h2 class="rt-h2">${line.replace(/^## /, '')}</h2>`)
    } else if (/^# /.test(line)) {
      closeUl(); closeOl()
      out.push(`<h1 class="rt-h1">${line.replace(/^# /, '')}</h1>`)
    } else if (/^---/.test(line)) {
      closeUl(); closeOl()
      out.push('<hr class="rt-hr" />')
    } else if (/^\- (.*)/.test(line)) {
      closeOl()
      if (!inUl) { out.push('<ul class="rt-ul">'); inUl = true }
      out.push(`<li>${line.replace(/^\- /, '')}</li>`)
    } else if (/^\d+\. (.*)/.test(line)) {
      closeUl()
      if (!inOl) { out.push('<ol class="rt-ol">'); inOl = true }
      out.push(`<li>${line.replace(/^\d+\. /, '')}</li>`)
    } else if (line.trim() === '') {
      closeUl(); closeOl()
      out.push('<br/>')
    } else {
      closeUl(); closeOl()
      out.push(`<p class="rt-p">${line}</p>`)
    }
  }
  closeUl(); closeOl()
  return out.join('')
}

export function RichTextEditor({ value, onChange, placeholder, rows = 7, label }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const [preview, setPreview] = useState(false)

  const wrap = (before: string, after?: string) => {
    const ta = ref.current
    if (!ta) return
    const s = ta.selectionStart
    const e = ta.selectionEnd
    const sel = value.slice(s, e)
    const end = after ?? before
    const next = value.slice(0, s) + before + sel + end + value.slice(e)
    onChange(next)
    setTimeout(() => { ta.focus(); ta.setSelectionRange(s + before.length, e + before.length) }, 0)
  }

  const prefix = (p: string) => {
    const ta = ref.current
    if (!ta) return
    const s = ta.selectionStart
    const lineStart = value.lastIndexOf('\n', s - 1) + 1
    const already = value.slice(lineStart).startsWith(p)
    const next = already
      ? value.slice(0, lineStart) + value.slice(lineStart + p.length)
      : value.slice(0, lineStart) + p + value.slice(lineStart)
    onChange(next)
    const offset = already ? -p.length : p.length
    setTimeout(() => { ta.focus(); ta.setSelectionRange(s + offset, s + offset) }, 0)
  }

  const TOOLS: { icon: React.ReactNode; title: string; fn: () => void }[] = [
    { icon: <Bold size={13} />,        title: 'Bold',           fn: () => wrap('**') },
    { icon: <Italic size={13} />,      title: 'Italic',         fn: () => wrap('_') },
    { icon: <Heading1 size={13} />,    title: 'Heading 1',      fn: () => prefix('# ') },
    { icon: <Heading2 size={13} />,    title: 'Heading 2',      fn: () => prefix('## ') },
    { icon: <Heading3 size={13} />,    title: 'Heading 3',      fn: () => prefix('### ') },
    { icon: <List size={13} />,        title: 'Bullet list',    fn: () => prefix('- ') },
    { icon: <ListOrdered size={13} />, title: 'Numbered list',  fn: () => prefix('1. ') },
    { icon: <Minus size={13} />,       title: 'Divider',        fn: () => { onChange(value + '\n---\n'); setTimeout(() => ref.current?.focus(), 0) } },
  ]

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">
          {label}
        </label>
      )}
      <div
        className="rounded-xl border border-white/[0.08] overflow-hidden"
        style={{ backgroundColor: 'rgba(255,255,255,0.025)' }}
      >
        {/* Toolbar */}
        <div
          className="flex items-center gap-0.5 px-2 py-1.5 border-b border-white/[0.06]"
          style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}
        >
          {TOOLS.map(({ icon, title, fn }) => (
            <button
              key={title}
              type="button"
              title={title}
              onMouseDown={(e) => { e.preventDefault(); fn() }}
              className="p-1.5 rounded-md text-white/30 hover:text-white/70 hover:bg-white/[0.07] transition-all"
            >
              {icon}
            </button>
          ))}
          <div className="w-px h-4 bg-white/[0.08] mx-1" />
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); setPreview((v) => !v) }}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-all ml-auto ${
              preview ? 'text-[#22c55e] bg-[#22c55e]/10' : 'text-white/30 hover:text-white/60'
            }`}
          >
            {preview ? <><Edit3 size={10} /> Edit</> : <><Eye size={10} /> Preview</>}
          </button>
        </div>

        {preview ? (
          <div
            className="px-3 py-3 min-h-[120px] rich-preview"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(value) || `<p class="rt-placeholder">${placeholder ?? ''}</p>` }}
          />
        ) : (
          <textarea
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="w-full px-3 py-2.5 text-sm text-white/70 placeholder-white/20 bg-transparent focus:outline-none resize-y leading-relaxed"
            style={{ fontFamily: "'JetBrains Mono', 'Cascadia Code', monospace", fontSize: '12.5px' }}
          />
        )}
      </div>
    </div>
  )
}
