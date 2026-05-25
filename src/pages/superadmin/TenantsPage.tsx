import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2, Plus, Search, MoreHorizontal, UserCog,
  CheckCircle2, XCircle, Users, FileText,
} from 'lucide-react'
import { useSuperAdminStore } from '@/store/superAdminStore'
import { CreateTenantModal } from '@/components/superadmin/CreateTenantModal'
import type { Tenant, TenantStatus } from '@/types/tenant'
import { formatDistanceToNow } from 'date-fns'

const PLAN_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  free: { label: 'Free', color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' },
  pro: { label: 'Pro', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
  agency: { label: 'Agency', color: '#c084fc', bg: 'rgba(192,132,252,0.1)' },
}

function StatusBadge({ status }: { status: TenantStatus }) {
  const active = status === 'active'
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{
        color: active ? '#4ade80' : '#f87171',
        backgroundColor: active ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
      }}
    >
      {active ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
      {active ? 'Active' : 'Suspended'}
    </span>
  )
}

function TenantLogo({ tenant }: { tenant: Tenant }) {
  if (tenant.logo_url) {
    return <img src={tenant.logo_url} alt={tenant.name} className="w-9 h-9 rounded-xl object-cover" />
  }
  return (
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
      style={{ backgroundColor: tenant.primary_color + '33', border: `1.5px solid ${tenant.primary_color}55` }}
    >
      <span style={{ color: tenant.primary_color }}>
        {tenant.name.charAt(0).toUpperCase()}
      </span>
    </div>
  )
}

function TenantMenu({ tenant }: { tenant: Tenant }) {
  const [open, setOpen] = useState(false)
  const { updateTenantStatus, updateTenantPlan } = useSuperAdminStore()

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-lg text-white/20 hover:text-white/60 hover:bg-white/[0.05] transition-all"
      >
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-white/[0.08] shadow-xl z-20 overflow-hidden py-1"
            style={{ backgroundColor: '#13151f' }}
          >
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/20 px-3 pt-2 pb-1">
              Change Plan
            </p>
            {(['free', 'pro', 'agency'] as const).map((p) => (
              <button
                key={p}
                onClick={() => { updateTenantPlan(tenant.id, p); setOpen(false) }}
                className={`w-full text-left px-3 py-2 text-xs font-medium transition-all hover:bg-white/[0.05] ${tenant.plan === p ? 'text-violet-400' : 'text-white/50'}`}
              >
                {PLAN_BADGE[p].label} {tenant.plan === p ? '✓' : ''}
              </button>
            ))}
            <div className="border-t border-white/[0.06] mt-1 pt-1">
              {tenant.status === 'active' ? (
                <button
                  onClick={() => { updateTenantStatus(tenant.id, 'suspended'); setOpen(false) }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all"
                >
                  Suspend Workspace
                </button>
              ) : (
                <button
                  onClick={() => { updateTenantStatus(tenant.id, 'active'); setOpen(false) }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-green-400 hover:bg-green-500/10 transition-all"
                >
                  Reactivate Workspace
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export function TenantsPage() {
  const navigate = useNavigate()
  const { tenants, startImpersonation } = useSuperAdminStore()
  const [search, setSearch] = useState('')
  const [filterPlan, setFilterPlan] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showCreate, setShowCreate] = useState(false)

  const filtered = tenants.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.owner_email.toLowerCase().includes(search.toLowerCase())
    const matchPlan = filterPlan === 'all' || t.plan === filterPlan
    const matchStatus = filterStatus === 'all' || t.status === filterStatus
    return matchSearch && matchPlan && matchStatus
  })

  function handleImpersonate(tenant: Tenant) {
    startImpersonation(tenant)
    navigate('/dashboard')
  }

  const totalMembers = tenants.reduce((a, t) => a + t.member_count, 0)
  const activeCount = tenants.filter((t) => t.status === 'active').length

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Tenants</h1>
          <p className="text-sm text-white/35 mt-0.5">
            {tenants.length} workspaces · {activeCount} active · {totalMembers} total members
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
        >
          <Plus size={16} />
          Create Tenant
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Free', count: tenants.filter((t) => t.plan === 'free').length, color: '#9ca3af' },
          { label: 'Pro', count: tenants.filter((t) => t.plan === 'pro').length, color: '#60a5fa' },
          { label: 'Agency', count: tenants.filter((t) => t.plan === 'agency').length, color: '#c084fc' },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.06]"
            style={{ backgroundColor: '#1a1d27' }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: item.color + '22' }}>
              <Building2 size={15} style={{ color: item.color }} />
            </div>
            <div>
              <p className="text-lg font-bold text-white leading-tight">{item.count}</p>
              <p className="text-xs text-white/30">{item.label} plan</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            type="text"
            placeholder="Search tenants…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/20 outline-none focus:border-violet-500/40 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'free', 'pro', 'agency'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setFilterPlan(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterPlan === p
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  : 'text-white/30 hover:text-white/60 border border-transparent hover:border-white/[0.08]'
              }`}
            >
              {p === 'all' ? 'All Plans' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'active', 'suspended'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === s
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  : 'text-white/30 hover:text-white/60 border border-transparent hover:border-white/[0.08]'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ backgroundColor: '#1a1d27' }}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['Workspace', 'Plan', 'Members', 'Content', 'Last Active', 'Status', ''].map((h) => (
                <th key={h} className="text-left text-[10px] font-bold uppercase tracking-widest text-white/25 px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-sm text-white/25">
                  No tenants match your filters.
                </td>
              </tr>
            )}
            {filtered.map((tenant) => {
              const plan = PLAN_BADGE[tenant.plan]
              return (
                <tr
                  key={tenant.id}
                  className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors group"
                >
                  {/* Workspace */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <TenantLogo tenant={tenant} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate leading-tight">{tenant.name}</p>
                        <p className="text-xs text-white/30 leading-tight">{tenant.owner_email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Plan */}
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
                      style={{ color: plan.color, backgroundColor: plan.bg }}
                    >
                      {plan.label}
                    </span>
                  </td>

                  {/* Members */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-sm text-white/60">
                      <Users size={13} className="text-white/25" />
                      {tenant.member_count}
                    </div>
                  </td>

                  {/* Content */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-sm text-white/60">
                      <FileText size={13} className="text-white/25" />
                      {tenant.content_count}
                    </div>
                  </td>

                  {/* Last Active */}
                  <td className="px-4 py-3">
                    <span className="text-xs text-white/40">
                      {formatDistanceToNow(new Date(tenant.last_active), { addSuffix: true })}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusBadge status={tenant.status} />
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleImpersonate(tenant)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 transition-all"
                      >
                        <UserCog size={12} />
                        Impersonate
                      </button>
                      <TenantMenu tenant={tenant} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showCreate && <CreateTenantModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}
