import { useSuperAdminStore } from '@/store/superAdminStore'
import { Users, FileText, Building2, TrendingUp, Activity, CheckCircle2 } from 'lucide-react'
import type { Tenant } from '@/types/tenant'
import { formatDistanceToNow } from 'date-fns'

function StatCard({
  label, value, sub, icon: Icon, color,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="flex flex-col gap-3 px-5 py-4 rounded-2xl border border-white/[0.06]" style={{ backgroundColor: '#1a1d27' }}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-white/30">{label}</p>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '22' }}>
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-white leading-tight">{value}</p>
        {sub && <p className="text-xs text-white/30 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function PlanBar({ tenants }: { tenants: Tenant[] }) {
  const total = tenants.length
  if (total === 0) return null
  const counts = {
    agency: tenants.filter((t) => t.plan === 'agency').length,
    pro: tenants.filter((t) => t.plan === 'pro').length,
    free: tenants.filter((t) => t.plan === 'free').length,
  }
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-bold uppercase tracking-widest text-white/30">Plan Distribution</h3>
      <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
        {counts.agency > 0 && (
          <div className="h-full rounded-l-full" style={{ width: `${(counts.agency / total) * 100}%`, backgroundColor: '#c084fc' }} />
        )}
        {counts.pro > 0 && (
          <div className="h-full" style={{ width: `${(counts.pro / total) * 100}%`, backgroundColor: '#60a5fa' }} />
        )}
        {counts.free > 0 && (
          <div className="h-full rounded-r-full" style={{ width: `${(counts.free / total) * 100}%`, backgroundColor: '#374151' }} />
        )}
      </div>
      <div className="flex items-center gap-4">
        {[
          { label: 'Agency', count: counts.agency, color: '#c084fc' },
          { label: 'Pro', count: counts.pro, color: '#60a5fa' },
          { label: 'Free', count: counts.free, color: '#6b7280' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-white/50">
              <span className="font-semibold text-white/70">{item.count}</span> {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ContentBar({ tenants }: { tenants: Tenant[] }) {
  const max = Math.max(...tenants.map((t) => t.content_count), 1)
  const sorted = [...tenants].sort((a, b) => b.content_count - a.content_count)

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-bold uppercase tracking-widest text-white/30">Content Volume by Tenant</h3>
      <div className="flex flex-col gap-2">
        {sorted.map((t) => (
          <div key={t.id} className="flex items-center gap-3">
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold shrink-0"
              style={{ backgroundColor: t.primary_color + '33', color: t.primary_color }}
            >
              {t.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-white/60 truncate">{t.name}</span>
                <span className="text-xs text-white/35 ml-2 shrink-0">{t.content_count}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(t.content_count / max) * 100}%`,
                    backgroundColor: t.primary_color,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MemberBar({ tenants }: { tenants: Tenant[] }) {
  const max = Math.max(...tenants.map((t) => t.member_count), 1)
  const sorted = [...tenants].sort((a, b) => b.member_count - a.member_count)

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-bold uppercase tracking-widest text-white/30">Members by Tenant</h3>
      <div className="flex flex-col gap-2">
        {sorted.map((t) => (
          <div key={t.id} className="flex items-center gap-3">
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold shrink-0"
              style={{ backgroundColor: t.primary_color + '33', color: t.primary_color }}
            >
              {t.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-white/60 truncate">{t.name}</span>
                <span className="text-xs text-white/35 ml-2 shrink-0">{t.member_count} members</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(t.member_count / max) * 100}%`,
                    backgroundColor: t.primary_color + 'bb',
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ActivityFeed({ tenants }: { tenants: Tenant[] }) {
  const sorted = [...tenants].sort(
    (a, b) => new Date(b.last_active).getTime() - new Date(a.last_active).getTime()
  )
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-bold uppercase tracking-widest text-white/30">Recent Activity</h3>
      <div className="flex flex-col gap-1.5">
        {sorted.map((t) => {
          const hoursAgo = (Date.now() - new Date(t.last_active).getTime()) / (1000 * 60 * 60)
          const isRecent = hoursAgo < 6
          return (
            <div key={t.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.02] transition-colors">
              <div className="relative">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ backgroundColor: t.primary_color + '22', color: t.primary_color }}
                >
                  {t.name.charAt(0)}
                </div>
                {isRecent && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-400 border border-[#1a1d27]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/70 truncate">{t.name}</p>
                <p className="text-xs text-white/30">Active {formatDistanceToNow(new Date(t.last_active), { addSuffix: true })}</p>
              </div>
              {t.status === 'suspended' ? (
                <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">Suspended</span>
              ) : isRecent ? (
                <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">Online</span>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function GlobalAnalyticsPage() {
  const { tenants } = useSuperAdminStore()

  const totalMembers = tenants.reduce((a, t) => a + t.member_count, 0)
  const totalContent = tenants.reduce((a, t) => a + t.content_count, 0)
  const totalTeams = tenants.reduce((a, t) => a + t.team_count, 0)
  const activeCount = tenants.filter((t) => t.status === 'active').length
  const mrr = tenants.reduce((acc, t) => {
    if (t.status !== 'active') return acc
    if (t.plan === 'pro') return acc + 49
    if (t.plan === 'agency') return acc + 149
    return acc
  }, 0)
  const avgContent = tenants.length ? Math.round(totalContent / tenants.length) : 0

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">Global Analytics</h1>
        <p className="text-sm text-white/35 mt-0.5">Cross-tenant platform overview</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard label="Total Tenants" value={tenants.length} sub={`${activeCount} active`} icon={Building2} color="#c084fc" />
        <StatCard label="Total Members" value={totalMembers} sub="across all workspaces" icon={Users} color="#60a5fa" />
        <StatCard label="Total Content" value={totalContent} sub={`avg ${avgContent} per tenant`} icon={FileText} color="#34d399" />
        <StatCard label="Total Teams" value={totalTeams} sub="sub-teams globally" icon={Activity} color="#f97316" />
        <StatCard label="Monthly Revenue" value={`$${mrr}`} sub="from paid plans" icon={TrendingUp} color="#fbbf24" />
        <StatCard label="Active Rate" value={`${Math.round((activeCount / Math.max(tenants.length, 1)) * 100)}%`} sub={`${tenants.length - activeCount} suspended`} icon={CheckCircle2} color="#22c55e" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-4 px-5 py-4 rounded-2xl border border-white/[0.06]" style={{ backgroundColor: '#1a1d27' }}>
          <PlanBar tenants={tenants} />
        </div>
        <div className="flex flex-col gap-4 px-5 py-4 rounded-2xl border border-white/[0.06]" style={{ backgroundColor: '#1a1d27' }}>
          <MemberBar tenants={tenants} />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-4 px-5 py-4 rounded-2xl border border-white/[0.06]" style={{ backgroundColor: '#1a1d27' }}>
          <ContentBar tenants={tenants} />
        </div>
        <div className="flex flex-col gap-4 px-5 py-4 rounded-2xl border border-white/[0.06]" style={{ backgroundColor: '#1a1d27' }}>
          <ActivityFeed tenants={tenants} />
        </div>
      </div>
    </div>
  )
}
