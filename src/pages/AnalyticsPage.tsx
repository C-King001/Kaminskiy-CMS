import { useState, useEffect } from 'react'
import { CheckCircle2, Clock, TrendingUp, FileText, Pencil, Check, X, ExternalLink, Link2, HelpCircle, Zap } from 'lucide-react'
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

// ─── Connect modal ────────────────────────────────────────────────────────────

const API_NOTES: Record<string, string> = {
  instagram: 'Requires Meta Developer API approval. Create an app at developers.facebook.com and request Instagram Basic Display permissions.',
  facebook: 'Requires Meta Developer API approval. Create a Facebook App and request Pages API permissions.',
  youtube: 'Requires Google Cloud Console project with YouTube Data API v3 enabled.',
  tiktok: 'Requires TikTok for Developers account approval at developers.tiktok.com.',
}

function ConnectModal({
  platform,
  account,
  teamId,
  onClose,
}: {
  platform: PlatformDef
  account: SocialAccount | undefined
  teamId: string
  onClose: () => void
}) {
  const { upsertSocialAccount } = useTeamStore()
  const [nameVal, setNameVal] = useState(account?.account_name ?? '')
  const [handleVal, setHandleVal] = useState(account?.handle ?? '')
  const [tokenVal, setTokenVal] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const note = API_NOTES[platform.key]

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
      setSaved(true)
      setTimeout(onClose, 800)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-sm rounded-2xl border border-white/[0.1] overflow-hidden animate-fade-up shadow-2xl"
        style={{ backgroundColor: '#13151f' }}
      >
        {/* Header */}
        <div className="h-1.5" style={{ background: platform.gradient }} />
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.07]">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: platform.gradient }}>
            {platform.icon}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">Connect {platform.label}</p>
            <p className="text-[10px] text-white/30 mt-0.5">Add your account details</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-white/25 hover:text-white/60 transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Account / Page Name</label>
            <input
              type="text"
              value={nameVal}
              onChange={(e) => setNameVal(e.target.value)}
              placeholder={`e.g. Kaminskiy Care & Repair`}
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-white/[0.1] bg-white/[0.04] text-white/80 placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#22c55e]/30 transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Handle / Username</label>
            <input
              type="text"
              value={handleVal}
              onChange={(e) => setHandleVal(e.target.value)}
              placeholder={platform.defaultHandle}
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-white/[0.1] bg-white/[0.04] text-white/80 placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#22c55e]/30 transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 flex items-center gap-1.5">
              <Link2 size={9} />
              API Token / Access Token
              <span className="text-[9px] text-white/20 normal-case font-normal ml-1">Optional — for future API sync</span>
            </label>
            <input
              type="password"
              value={tokenVal}
              onChange={(e) => setTokenVal(e.target.value)}
              placeholder="Paste access token here..."
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-white/[0.1] bg-white/[0.04] text-white/80 placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#22c55e]/30 transition-all font-mono"
            />
          </div>

          {/* Platform note */}
          {note && (
            <div className="flex gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <HelpCircle size={12} className="text-white/30 shrink-0 mt-0.5" />
              <p className="text-[10px] text-white/30 leading-relaxed">{note}</p>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving || saved || (!nameVal.trim() && !handleVal.trim())}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white btn-glow transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: saved ? 'linear-gradient(135deg,#16a34a,#22c55e)' : platform.gradient }}
          >
            {saved ? <><Check size={14} /> Connected!</> : saving ? 'Saving…' : <><Zap size={13} /> Save Connection</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Weekly performance ───────────────────────────────────────────────────────

function WeeklyPerformance({ cards }: { cards: import('@/types').ContentCard[] }) {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const thisWeekPosted = cards.filter((c) => {
    if (c.status !== 'posted') return false
    const d = new Date(c.updated_at ?? c.created_at)
    return d >= startOfWeek
  }).length

  const thisWeekScheduled = cards.filter((c) => {
    if (!c.scheduled_date) return false
    const d = new Date(c.scheduled_date)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7)
    return d >= startOfWeek && d < endOfWeek
  }).length

  const inReview = cards.filter((c) =>
    ['in_review', 'submitted', 'resubmitted', 'stuart_approval', 'sergei_approval'].includes(c.status)
  ).length

  // Top content type by volume
  const typeCounts: Record<string, number> = {}
  for (const c of cards) {
    typeCounts[c.content_type] = (typeCounts[c.content_type] ?? 0) + 1
  }
  const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]

  const items = [
    { label: 'Published This Week', value: thisWeekPosted, color: '#22c55e' },
    { label: 'Scheduled This Week', value: thisWeekScheduled, color: '#3b82f6' },
    { label: 'Pending Review', value: inReview, color: '#f59e0b' },
    { label: 'Top Format', value: topType ? topType[0].replace('_', ' ') : '—', color: '#8b5cf6', isText: true },
  ]

  return (
    <div
      className="rounded-2xl p-5 border border-white/[0.06] mb-8"
      style={{ backgroundColor: '#1a1d27' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-lg bg-[#22c55e]/15 flex items-center justify-center">
          <Zap size={12} className="text-[#22c55e]" />
        </div>
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-white/40">Weekly Performance Summary</h3>
          <p className="text-[10px] text-white/20">Internal CMS data — no external API required</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col gap-1 p-3 rounded-xl" style={{ backgroundColor: `${item.color}08`, border: `1px solid ${item.color}15` }}>
            <p className="text-[10px] text-white/30 font-medium leading-tight">{item.label}</p>
            <p className="text-2xl font-black" style={{ color: item.color }}>
              {'isText' in item && item.isText ? (
                <span className="text-sm font-bold capitalize">{item.value}</span>
              ) : item.value}
            </p>
          </div>
        ))}
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
  const [connectOpen, setConnectOpen] = useState(false)
  const isConnected = !!(account?.handle || account?.account_name)

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden border border-white/[0.06] transition-all hover:border-white/[0.1]"
        style={{ backgroundColor: '#1a1d27' }}
      >
        <div className="h-1.5 w-full" style={{ background: platform.gradient }} />
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white" style={{ background: platform.gradient }}>
              {platform.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">{platform.label}</p>
              <p className="text-[11px] text-white/35 truncate">
                {isConnected ? (account?.account_name || account?.handle) : 'Not connected'}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {isConnected && <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />}
              <span
                className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={
                  isConnected
                    ? { backgroundColor: '#22c55e18', color: '#22c55e', border: '1px solid #22c55e30' }
                    : { backgroundColor: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.08)' }
                }
              >
                {isConnected ? 'Connected' : 'Not set'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {account?.handle && (
              <span className="text-[11px] text-white/40 font-mono flex-1 truncate">{account.handle}</span>
            )}
            <button
              onClick={() => setConnectOpen(true)}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold text-white btn-glow transition-all"
              style={{ background: isConnected ? 'rgba(34,197,94,0.12)' : platform.gradient, color: isConnected ? '#22c55e' : 'white', border: isConnected ? '1px solid rgba(34,197,94,0.25)' : 'none' }}
            >
              {isConnected ? <><Pencil size={10} /> Edit</> : <><Zap size={10} /> Connect</>}
            </button>
            {account?.profile_url && (
              <a href={account.profile_url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-white/20 hover:text-white/50 transition-all">
                <ExternalLink size={11} />
              </a>
            )}
          </div>
        </div>
      </div>
      {connectOpen && (
        <ConnectModal platform={platform} account={account} teamId={teamId} onClose={() => setConnectOpen(false)} />
      )}
    </>
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

      {/* Weekly performance summary (internal — no API needed) */}
      <WeeklyPerformance cards={cards} />

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
