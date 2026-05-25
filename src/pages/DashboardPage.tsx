import { useEffect } from 'react'
import { useContentStore } from '@/store/contentStore'
import { PageSpinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { PipelineTableView } from '@/components/pipeline/PipelineTableView'
import { TeamBreakdownWidget } from '@/components/dashboard/TeamBreakdownWidget'
import { Plus, Sparkles, FileText, Clock, CheckCircle2, Radio } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useTeamStore, canSeeAllTeams } from '@/store/teamStore'
import { ROLE_LABELS } from '@/lib/constants'

const UNDER_REVIEW_STATUSES = new Set([
  'submitted', 'in_review', 'corrections_needed', 'resubmitted',
  'stuart_approval', 'sergei_approval',
])
const APPROVED_STATUSES = new Set(['caption_scheduling', 'scheduled'])

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  count: number
  sub: string
  color: string
}

function MetricCard({ icon, label, count, sub, color }: MetricCardProps) {
  return (
    <div
      className="flex flex-col gap-3 p-5 rounded-[14px] border border-white/[0.06] relative overflow-hidden"
      style={{
        background: `linear-gradient(145deg, #1a1d27 60%, ${color}0d 100%)`,
      }}
    >
      {/* Radial glow */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-15 blur-2xl pointer-events-none"
        style={{ backgroundColor: color }}
      />
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}20`, border: `1px solid ${color}30` }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <div className="text-3xl font-black text-white leading-none mb-1">{count}</div>
        <div className="text-[11px] font-bold text-white/60 mb-0.5">{label}</div>
        <div className="text-[10px] text-white/25 font-medium">{sub}</div>
      </div>
      {/* Bottom accent */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, ${color}70, transparent)` }}
      />
    </div>
  )
}

export function DashboardPage() {
  const { fetchCards, loading, cards } = useContentStore()
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const { isAllTeamsView, myTeamIds } = useTeamStore()
  const showTeamBreakdown = canSeeAllTeams(profile?.role, myTeamIds) && isAllTeamsView

  useEffect(() => { fetchCards() }, [])

  if (loading && cards.length === 0) return <PageSpinner />

  const firstName = profile?.full_name?.split(' ')[0]

  const total = cards.length
  const underReview = cards.filter((c) => UNDER_REVIEW_STATUSES.has(c.status)).length
  const approved = cards.filter((c) => APPROVED_STATUSES.has(c.status)).length
  const published = cards.filter((c) => c.status === 'posted').length

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-6xl mx-auto animate-fade-up flex flex-col gap-6">
          {/* Welcome banner */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Sparkles size={14} className="text-[#22c55e]" />
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30">
                  {profile ? ROLE_LABELS[profile.role] : ''}
                </p>
              </div>
              <h2 className="text-xl font-bold text-white leading-tight">
                {firstName ? `Welcome back, ${firstName}` : 'Welcome back'}
              </h2>
              <p className="text-xs text-white/30 mt-0.5">
                {total} card{total !== 1 ? 's' : ''} in pipeline
              </p>
            </div>
            <Button onClick={() => navigate('/content/new')} icon={<Plus size={13} />}>
              New Post
            </Button>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard
              icon={<FileText size={16} />}
              label="Total Content"
              count={total}
              sub="Pieces in pipeline"
              color="#22c55e"
            />
            <MetricCard
              icon={<Clock size={16} />}
              label="Under Review"
              count={underReview}
              sub="Awaiting approval"
              color="#f59e0b"
            />
            <MetricCard
              icon={<CheckCircle2 size={16} />}
              label="Approved"
              count={approved}
              sub="Ready for social"
              color="#3b82f6"
            />
            <MetricCard
              icon={<Radio size={16} />}
              label="Published"
              count={published}
              sub="Live on socials"
              color="#ec4899"
            />
          </div>

          {/* Team breakdown — shown in All Teams view */}
          {showTeamBreakdown && <TeamBreakdownWidget />}

          {/* Content Pipeline table */}
          <div
            className="rounded-[14px] overflow-hidden border border-white/[0.06]"
            style={{ backgroundColor: '#1a1d27' }}
          >
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-white/40">
                  Content Pipeline
                </h3>
                <p className="text-[10px] text-white/20 mt-0.5">{total} total posts</p>
              </div>
              <button
                onClick={() => navigate('/pipeline')}
                className="text-[11px] font-semibold text-[#22c55e] hover:text-[#4ade80] transition-colors"
              >
                View all →
              </button>
            </div>
            <PipelineTableView cards={cards.slice(0, 20)} />
          </div>
        </div>
      </div>
    </div>
  )
}
