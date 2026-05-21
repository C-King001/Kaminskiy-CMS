import { useContentStore } from '@/store/contentStore'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import { StatusBadge } from '@/components/content/StatusBadge'
import type { ContentStatus } from '@/types'
import { AlertCircle } from 'lucide-react'

const PENDING_BY_ROLE: Record<string, ContentStatus[]> = {
  contributor: ['corrections_needed'],
  reviewer: ['submitted', 'resubmitted'],
  manager: ['submitted', 'resubmitted', 'approved'],
  admin: ['submitted', 'in_review', 'resubmitted'],
}

export function PendingActionsWidget() {
  const { cards } = useContentStore()
  const profile = useAuthStore((s) => s.profile)
  const navigate = useNavigate()

  const role = profile?.role ?? 'contributor'
  const targetStatuses = PENDING_BY_ROLE[role] ?? []

  const pending = cards.filter((c) => {
    if (!targetStatuses.includes(c.status)) return false
    if (role === 'contributor') return c.owner_id === profile?.id
    return true
  })

  return (
    <div className="bg-[#1a1d27] border border-white/[0.06] rounded-[14px] p-4">
      <h3 className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
        <AlertCircle size={13} className="text-[#F59E0B]" />
        Pending Actions
        {pending.length > 0 && (
          <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F59E0B]/15 text-[#F59E0B]">
            {pending.length}
          </span>
        )}
      </h3>
      {pending.length === 0 ? (
        <p className="text-xs text-white/20 py-4 text-center">All caught up!</p>
      ) : (
        <div className="flex flex-col gap-1">
          {pending.slice(0, 8).map((card) => (
            <div
              key={card.id}
              onClick={() => navigate(`/content/${card.id}`)}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-all group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-white/70 group-hover:text-white truncate transition-colors">{card.title}</p>
              </div>
              <StatusBadge status={card.status} />
            </div>
          ))}
          {pending.length > 8 && (
            <p className="text-[10px] text-white/20 text-center pt-1">+{pending.length - 8} more</p>
          )}
        </div>
      )}
    </div>
  )
}
