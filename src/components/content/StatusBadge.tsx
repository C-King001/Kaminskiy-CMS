import type { ContentStatus } from '@/types'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/constants'

export function StatusBadge({ status }: { status: ContentStatus }) {
  const color = STATUS_COLORS[status]
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
