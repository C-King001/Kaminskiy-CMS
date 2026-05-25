import { useState } from 'react'
import { CreditCard, ArrowUpRight, Users, FileText, Building2 } from 'lucide-react'
import { useSuperAdminStore } from '@/store/superAdminStore'
import type { TenantPlan } from '@/types/tenant'
import { formatDistanceToNow } from 'date-fns'

const PLAN_FEATURES: Record<TenantPlan, { members: string; teams: string; posts: string; price: string }> = {
  free: { members: '2 members', teams: '1 team', posts: '30 posts/mo', price: '$0/mo' },
  pro: { members: '10 members', teams: '3 teams', posts: 'Unlimited', price: '$49/mo' },
  agency: { members: 'Unlimited', teams: 'Unlimited', posts: 'Unlimited', price: '$149/mo' },
}

const PLAN_STYLE: Record<TenantPlan, { color: string; bg: string; border: string; label: string }> = {
  free: { color: '#9ca3af', bg: 'rgba(156,163,175,0.07)', border: 'rgba(156,163,175,0.15)', label: 'Free' },
  pro: { color: '#60a5fa', bg: 'rgba(96,165,250,0.07)', border: 'rgba(96,165,250,0.2)', label: 'Pro' },
  agency: { color: '#c084fc', bg: 'rgba(192,132,252,0.07)', border: 'rgba(192,132,252,0.2)', label: 'Agency' },
}

export function BillingPage() {
  const { tenants, updateTenantPlan, updateTenantStatus } = useSuperAdminStore()
  const [editingId, setEditingId] = useState<string | null>(null)

  const mrr = tenants.reduce((acc, t) => {
    if (t.status !== 'active') return acc
    if (t.plan === 'pro') return acc + 49
    if (t.plan === 'agency') return acc + 149
    return acc
  }, 0)

  const byPlan = {
    free: tenants.filter((t) => t.plan === 'free'),
    pro: tenants.filter((t) => t.plan === 'pro'),
    agency: tenants.filter((t) => t.plan === 'agency'),
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">Billing</h1>
        <p className="text-sm text-white/35 mt-0.5">Plan management across all client workspaces</p>
      </div>

      {/* MRR + summary */}
      <div className="grid grid-cols-4 gap-3">
        <div className="col-span-1 flex flex-col gap-1 px-4 py-4 rounded-2xl border border-white/[0.06]" style={{ backgroundColor: '#1a1d27' }}>
          <p className="text-xs text-white/35 font-semibold uppercase tracking-widest">MRR</p>
          <p className="text-2xl font-bold text-white">${mrr.toLocaleString()}</p>
          <p className="text-xs text-white/25">from paid plans</p>
        </div>
        {(['free', 'pro', 'agency'] as TenantPlan[]).map((plan) => {
          const style = PLAN_STYLE[plan]
          const count = byPlan[plan].length
          const activeCount = byPlan[plan].filter((t) => t.status === 'active').length
          return (
            <div
              key={plan}
              className="flex flex-col gap-1 px-4 py-4 rounded-2xl border"
              style={{ backgroundColor: style.bg, borderColor: style.border }}
            >
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: style.color }}>
                {style.label}
              </p>
              <p className="text-2xl font-bold text-white">{count}</p>
              <p className="text-xs text-white/30">{activeCount} active</p>
            </div>
          )
        })}
      </div>

      {/* Plan sections */}
      {(['agency', 'pro', 'free'] as TenantPlan[]).map((plan) => {
        const style = PLAN_STYLE[plan]
        const features = PLAN_FEATURES[plan]
        const list = byPlan[plan]
        if (list.length === 0) return null

        return (
          <div key={plan} className="flex flex-col gap-3">
            {/* Plan header */}
            <div className="flex items-center gap-3">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-bold"
                style={{ color: style.color, backgroundColor: style.bg, borderColor: style.border }}
              >
                <CreditCard size={14} />
                {style.label} — {features.price}
              </div>
              <div className="flex items-center gap-3 text-xs text-white/25">
                <span>{features.members}</span>
                <span>·</span>
                <span>{features.teams}</span>
                <span>·</span>
                <span>{features.posts}</span>
              </div>
            </div>

            {/* Tenant rows */}
            <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ backgroundColor: '#1a1d27' }}>
              {list.map((tenant, i) => (
                <div
                  key={tenant.id}
                  className={`flex items-center gap-4 px-4 py-3.5 ${i < list.length - 1 ? 'border-b border-white/[0.04]' : ''} hover:bg-white/[0.02] transition-colors group`}
                >
                  {/* Logo */}
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ backgroundColor: tenant.primary_color + '22', border: `1.5px solid ${tenant.primary_color}44` }}
                  >
                    <span style={{ color: tenant.primary_color }}>{tenant.name.charAt(0)}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white truncate">{tenant.name}</p>
                      {tenant.status === 'suspended' && (
                        <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-full">
                          Suspended
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/30 truncate">{tenant.owner_email}</p>
                  </div>

                  {/* Stats */}
                  <div className="hidden md:flex items-center gap-5 text-xs text-white/35">
                    <div className="flex items-center gap-1.5">
                      <Users size={12} />
                      <span>{tenant.member_count}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileText size={12} />
                      <span>{tenant.content_count}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Building2 size={12} />
                      <span>{tenant.team_count} teams</span>
                    </div>
                  </div>

                  {/* Last active */}
                  <div className="hidden lg:block text-xs text-white/25 w-28 text-right shrink-0">
                    {formatDistanceToNow(new Date(tenant.last_active), { addSuffix: true })}
                  </div>

                  {/* Plan change */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {editingId === tenant.id ? (
                      <div className="flex items-center gap-1">
                        {(['free', 'pro', 'agency'] as TenantPlan[]).filter((p) => p !== plan).map((p) => (
                          <button
                            key={p}
                            onClick={() => { updateTenantPlan(tenant.id, p); setEditingId(null) }}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all hover:opacity-80"
                            style={{
                              color: PLAN_STYLE[p].color,
                              backgroundColor: PLAN_STYLE[p].bg,
                              borderColor: PLAN_STYLE[p].border,
                            }}
                          >
                            → {PLAN_STYLE[p].label}
                          </button>
                        ))}
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2 py-1 rounded-lg text-xs text-white/30 hover:text-white/60 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingId(tenant.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white/40 hover:text-white/70 border border-white/[0.06] hover:bg-white/[0.04] transition-all"
                        >
                          <ArrowUpRight size={12} />
                          Change Plan
                        </button>
                        {tenant.status === 'active' ? (
                          <button
                            onClick={() => updateTenantStatus(tenant.id, 'suspended')}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 transition-all"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => updateTenantStatus(tenant.id, 'active')}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-green-400 bg-green-500/10 hover:bg-green-500/15 border border-green-500/20 transition-all"
                          >
                            Reactivate
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
