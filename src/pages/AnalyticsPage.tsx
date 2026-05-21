import { useState, useEffect } from 'react'
import { CheckCircle2, Clock, TrendingUp, FileText, Pencil, Check, X, ExternalLink } from 'lucide-react'
import { useTeamStore } from '@/store/teamStore'
import { useContentStore } from '@/store/contentStore'
import type { SocialAccount } from '@/types'

// ─── Platform definitions ─────────────────────────────────────────────────────

interface PlatformDef {
  key: string
  label: string
  color: string
  gradient: string
  defaultHandle: string
  icon: React.ReactNode
}

const SOCIAL_PLATFORMS: PlatformDef[] = [
  {
    key: 'instagram',
    label: 'Instagram',
    color: '#E1306C',
    gradient: 'linear-gradient(135deg, #f9ce34, #ee2a7b, #6228d7)',
    defaultHandle: '@handle',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    key: 'facebook',
    label: 'Facebook',
    color: '#1877F2',
    gradient: 'linear-gradient(135deg, #1877F2, #0c5ecf)',
    defaultHandle: 'Page name',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    key: 'youtube',
    label: 'YouTube',
    color: '#FF0000',
    gradient: 'linear-gradient(135deg, #FF0000, #cc0000)',
    defaultHandle: 'Channel name',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 0 0 1.95-1.97A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
        <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
      </svg>
    ),
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    color: '#010101',
    gradient: 'linear-gradient(135deg, #010101, #69C9D0)',
    defaultHandle: '@handle',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.66a8.12 8.12 0 0 0 4.74 1.51V6.7a4.85 4.85 0 0 1-.97-.01z"/>
      </svg>
    ),
  },
]

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sublabel,
}: {
  label: string
  value: number
  icon: React.ElementType
  color: string
  sublabel?: string
}) {
  return (
    <div
      className="relative rounded-2xl p-5 overflow-hidden border border-white/[0.06]"
      style={{ backgroundColor: '#1a1d27' }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top left, ${color}, transparent 70%)` }}
      />
      <div className="relative flex flex-col gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20`, color }}
        >
          <Icon size={18} />
        </div>
        <div>
          <p
            className="text-4xl font-black tracking-tight"
            style={{ color: value > 0 ? 'white' : 'rgba(255,255,255,0.2)' }}
          >
            {value}
          </p>
          <p className="text-xs font-semibold text-white/50 mt-0.5">{label}</p>
          {sublabel && <p className="text-[10px] text-white/25 mt-0.5">{sublabel}</p>}
        </div>
      </div>
    </div>
  )
}

// ─── Social account card ──────────────────────────────────────────────────────

function AccountCard({
  platform,
  account,
  teamId,
}: {
  platform: PlatformDef
  account: SocialAccount | undefined
  teamId: string
}) {
  const { upsertSocialAccount } = useTeamStore()
  const [editing, setEditing] = useState(false)
  const [handleVal, setHandleVal] = useState(account?.handle ?? '')
  const [nameVal, setNameVal] = useState(account?.account_name ?? '')
  const [saving, setSaving] = useState(false)

  const isConnected = !!(account?.handle || account?.account_name)

  const handleSave = async () => {
    setSaving(true)
    try {
      await upsertSocialAccount({
        ...(account?.id ? { id: account.id } : {}),
        team_id: teamId,
        platform: platform.key,
        handle: handleVal.trim() || null,
        account_name: nameVal.trim() || null,
      })
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="rounded-2xl overflow-hidden border border-white/[0.06]"
      style={{ backgroundColor: '#1a1d27' }}
    >
      {/* Gradient header bar */}
      <div
        className="h-1.5 w-full"
        style={{ background: platform.gradient }}
      />

      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white"
            style={{ background: platform.gradient }}
          >
            {platform.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">{platform.label}</p>
            <p className="text-[11px] text-white/35 truncate">
              {isConnected ? (account?.account_name || account?.handle) : 'Not set up yet'}
            </p>
          </div>
          <span
            className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shrink-0"
            style={
              isConnected
                ? { backgroundColor: '#22c55e18', color: '#22c55e', border: '1px solid #22c55e30' }
                : { backgroundColor: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.08)' }
            }
          >
            {isConnected ? 'Active' : 'Not set'}
          </span>
        </div>

        {editing ? (
          <div className="flex flex-col gap-2">
            <input
              autoFocus
              type="text"
              value={nameVal}
              onChange={(e) => setNameVal(e.target.value)}
              placeholder="Account / Page name"
              className="w-full px-3 py-2 text-xs rounded-xl border border-white/[0.1] bg-white/[0.04] text-white/80 placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#22c55e]/30"
            />
            <input
              type="text"
              value={handleVal}
              onChange={(e) => setHandleVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder={`Handle (e.g. ${platform.defaultHandle})`}
              className="w-full px-3 py-2 text-xs rounded-xl border border-white/[0.1] bg-white/[0.04] text-white/80 placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#22c55e]/30"
            />
            <div className="flex gap-2 mt-1">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white btn-glow disabled:opacity-40"
                style={{ background: platform.gradient }}
              >
                <Check size={12} /> {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="w-9 flex items-center justify-center rounded-xl border border-white/[0.08] text-white/40 hover:text-white/70 transition-all"
              >
                <X size={13} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {account?.handle && (
              <span className="text-[11px] text-white/40 font-mono flex-1 truncate">{account.handle}</span>
            )}
            <button
              onClick={() => setEditing(true)}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.08] text-[11px] text-white/40 hover:text-white/70 hover:border-white/[0.18] transition-all"
            >
              <Pencil size={10} />
              {isConnected ? 'Edit' : 'Set up'}
            </button>
            {account?.profile_url && (
              <a
                href={account.profile_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-white/20 hover:text-white/50 transition-all"
              >
                <ExternalLink size={11} />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Pipeline breakdown ───────────────────────────────────────────────────────

function PipelineBar({
  label,
  count,
  total,
  color,
}: {
  label: string
  count: number
  total: number
  color: string
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-white/40 w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[11px] font-bold text-white/50 w-8 text-right">{count}</span>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function AnalyticsPage() {
  const { currentTeamId, currentTeam, teams, socialAccounts, fetchSocialAccounts, setCurrentTeam } = useTeamStore()
  const cards = useContentStore((s) => s.cards)
  const team = currentTeam()

  useEffect(() => {
    if (currentTeamId) fetchSocialAccounts(currentTeamId)
  }, [currentTeamId])

  const posted = cards.filter((c) => c.status === 'posted').length
  const scheduled = cards.filter((c) => c.status === 'scheduled').length
  const inReview = cards.filter((c) => ['in_review', 'submitted', 'resubmitted', 'stuart_approval', 'sergei_approval'].includes(c.status)).length
  const ideas = cards.filter((c) => c.status === 'idea').length
  const total = cards.length

  const STATUS_BREAKDOWN = [
    { label: 'Posted', count: posted, color: '#22c55e' },
    { label: 'Scheduled', count: scheduled, color: '#3b82f6' },
    { label: 'In Review', count: inReview, color: '#f59e0b' },
    { label: 'In Design', count: cards.filter((c) => c.status === 'in_design').length, color: '#8b5cf6' },
    { label: 'Ideas', count: ideas, color: '#6b7280' },
  ]

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto animate-fade-up">
      {/* Page header */}
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-1">Analytics</p>
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-2xl font-black text-white">
            {team?.name ?? 'Analytics'}
          </h2>
          {team && (
            <span
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ backgroundColor: `${team.color}20`, color: team.color, border: `1px solid ${team.color}30` }}
            >
              {total} total pieces
            </span>
          )}
        </div>
        <p className="text-xs text-white/30 mt-1">
          Content performance and social account management
        </p>
      </div>

      {/* Team tabs */}
      {teams.length > 1 && (
        <div className="flex gap-1.5 mb-6 flex-wrap">
          {teams.map((t) => (
            <button
              key={t.id}
              onClick={() => setCurrentTeam(t.id)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
              style={
                t.id === currentTeamId
                  ? { backgroundColor: `${t.color}18`, borderColor: `${t.color}40`, color: t.color }
                  : { backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)' }
              }
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
              {t.name}
            </button>
          ))}
        </div>
      )}

      {/* Hero stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Posts Published" value={posted}    icon={CheckCircle2} color="#22c55e" sublabel="Live on social" />
        <StatCard label="Scheduled"       value={scheduled} icon={Clock}        color="#3b82f6" sublabel="Ready to go" />
        <StatCard label="In Review"       value={inReview}  icon={TrendingUp}   color="#f59e0b" sublabel="Needs action" />
        <StatCard label="Ideas"           value={ideas}     icon={FileText}     color="#8b5cf6" sublabel="In idea bank" />
      </div>

      {/* Pipeline breakdown */}
      {total > 0 && (
        <div
          className="rounded-2xl p-5 border border-white/[0.06] mb-8"
          style={{ backgroundColor: '#1a1d27' }}
        >
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-white/30 mb-4">
            Pipeline Breakdown · {total} pieces
          </h3>
          <div className="flex flex-col gap-3">
            {STATUS_BREAKDOWN.filter((s) => s.count > 0).map((s) => (
              <PipelineBar key={s.label} label={s.label} count={s.count} total={total} color={s.color} />
            ))}
          </div>
        </div>
      )}

      {/* Social accounts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-white/30">
              Social Accounts
            </h3>
            <p className="text-xs text-white/25 mt-0.5">
              {team?.name ?? 'This team'}'s social profiles — managers and admins can edit
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SOCIAL_PLATFORMS.map((platform) => {
            const account = socialAccounts.find(
              (a) => a.team_id === currentTeamId && a.platform === platform.key
            )
            return (
              <AccountCard
                key={platform.key}
                platform={platform}
                account={account}
                teamId={currentTeamId ?? ''}
              />
            )
          })}
        </div>
      </div>

      <p className="text-center text-xs text-white/15 mt-10 pb-4">
        Live reach, impressions, and engagement will be available once platform API integrations are added.
      </p>
    </div>
  )
}
