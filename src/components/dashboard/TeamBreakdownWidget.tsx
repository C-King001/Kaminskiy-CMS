import { useTeamStore } from '@/store/teamStore'
import { useContentStore } from '@/store/contentStore'
import type { Team } from '@/types'

const UNDER_REVIEW = new Set(['submitted', 'in_review', 'corrections_needed', 'resubmitted', 'stuart_approval', 'sergei_approval'])

interface TeamRow {
  team: Team
  total: number
  underReview: number
  posted: number
}

export function TeamBreakdownWidget() {
  const teams = useTeamStore((s) => s.teams)
  const cards = useContentStore((s) => s.cards)

  const rows: TeamRow[] = teams.map((team) => {
    const tc = cards.filter((c) => c.team_id === team.id)
    return {
      team,
      total: tc.length,
      underReview: tc.filter((c) => UNDER_REVIEW.has(c.status)).length,
      posted: tc.filter((c) => c.status === 'posted').length,
    }
  }).filter((r) => r.total > 0 || teams.length <= 3)

  const grandTotal = cards.length || 1

  return (
    <div
      className="rounded-[14px] border border-white/[0.06] overflow-hidden"
      style={{ backgroundColor: '#1a1d27' }}
    >
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-white/40">Team Breakdown</h3>
        <p className="text-[10px] text-white/20 mt-0.5">{cards.length} total posts across all teams</p>
      </div>

      <div className="divide-y divide-white/[0.04]">
        {rows.map(({ team, total, underReview, posted }) => {
          const widthPct = Math.round((total / grandTotal) * 100)
          return (
            <div key={team.id} className="px-4 py-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: team.color }} />
                  <span className="text-xs font-semibold text-white/70">{team.name}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-white/25">{underReview} reviewing</span>
                  <span className="text-white/25">{posted} posted</span>
                  <span className="font-bold" style={{ color: team.color }}>{total}</span>
                </div>
              </div>
              {/* Bar */}
              <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${widthPct}%`, backgroundColor: team.color, opacity: 0.7 }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
