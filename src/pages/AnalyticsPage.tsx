import { useState, useEffect } from 'react'
import {
  BarChart3, TrendingUp, FileText, CheckCircle2, Clock, Pencil, Check, X, ExternalLink,
} from 'lucide-react'
import { useTeamStore } from '@/store/teamStore'
import { useContentStore } from '@/store/contentStore'
import type { SocialAccount } from '@/types'

// ─── Platform config ──────────────────────────────────────────────────────────

interface PlatformDef {
  key: string
  label: string
  color: string
  icon: React.ReactNode
  defaultHandle: string
}

const SOCIAL_PLATFORMS: PlatformDef[] = [
  {
    key: 'instagram',
    label: 'Instagram',
    color: '#E1306C',
    defaultHandle: '@handle',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
    defaultHandle: 'Page name',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    key: 'youtube',
    label: 'YouTube',
    color: '#FF0000',
    defaultHandle: 'Channel name',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 0 0 1.95-1.97A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
        <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
      </svg>
    ),
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    color: '#14B8A6',
    defaultHandle: '@handle',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.66a8.12 8.12 0 0 0 4.74 1.51V6.7a4.85 4.85 0 0 1-.97-.01z"/>
      </svg>
    ),
  },
]

// ─── Social Account Card ──────────────────────────────────────────────────────

function AccountCard({
  platform,
  account,
  teamId,
  canEdit,
}: {
  platform: PlatformDef
  account: SocialAccount | undefined
  teamId: string
  canEdit: boolean
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
    } catch {
      // keep editing open on error
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setHandleVal(account?.handle ?? '')
    setNameVal(account?.account_name ?? '')
    setEditing(false)
  }

  return (
    <div
      className="rounded-2xl p-5 border border-white/[0.06] relative overflow-hidden"
      style={{ backgroundColor: '#1a1d27' }}
    >
      {/* glow */}
      <div
        className="absolute top-0 left-0 w-28 h-28 rounded-full opacity-10 -translate-x-6 -translate-y-6 blur-2xl pointer-events-none"
        style={{ backgroundColor: platform.color }}
      />

      <div className="flex items-start justify-between gap-3 relative mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${platform.color}20`, color: platform.color }}
          >
            {platform.icon}
          </div>
          <div>
            <p className="text-sm font-bold text-white/80">{platform.label}</p>
            <p className="text-[11px] text-white/30">
              {isConnected ? (account?.account_name || account?.handle) : 'Not set up'}
            </p>
          </div>
        </div>
        <span
          className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full shrink-0"
          style={
            isConnected
              ? { backgroundColor: '#22c55e20', color: '#22c55e' }
              : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.25)' }
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
            placeholder="Account name (e.g. Kaminskiy C&R)"
            className="w-full px-3 py-2 text-sm rounded-xl border border-white/[0.1] bg-white/[0.04] text-white/80 placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#22c55e]/40"
          />
          <input
            type="text"
            value={handleVal}
            onChange={(e) => setHandleVal(e.target.value)}
            placeholder={`Handle (e.g. ${platform.defaultHandle})`}
            className="w-full px-3 py-2 text-sm rounded-xl border border-white/[0.1] bg-white/[0.04] text-white/80 placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#22c55e]/40"
          />
          <div className="flex gap-2 mt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white btn-glow disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)' }}
            >
              <Check size={12} /> {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center justify-center w-9 rounded-xl border border-white/[0.08] text-white/40 hover:text-white/70 transition-all"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {account?.handle && (
            <span className="flex-1 text-xs text-white/40 truncate font-mono">{account.handle}</span>
          )}
          {canEdit && (
            <button
              onClick={() => setEditing(true)}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.08] text-xs text-white/40 hover:text-white/70 hover:border-white/[0.15] transition-all"
            >
              <Pencil size={10} />
              {isConnected ? 'Edit' : 'Set up'}
            </button>
          )}
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
  )
}

// ─── Main Analytics Page ──────────────────────────────────────────────────────

export function AnalyticsPage() {
  const { currentTeamId, currentTeam, teams, socialAccounts, fetchSocialAccounts } = useTeamStore()
  const cards = useContentStore((s) => s.cards)
  const profile = useTeamStore((s) => s.currentTeam)

  const team = currentTeam()

  useEffect(() => {
    if (currentTeamId) fetchSocialAccounts(currentTeamId)
  }, [currentTeamId])

  // In-app stats derived from content cards
  const posted = cards.filter((c) => c.status === 'posted').length
  const scheduled = cards.filter((c) => c.status === 'scheduled').length
  const inProgress = cards.filter(
    (c) => !['posted', 'scheduled', 'idea'].includes(c.status)
  ).length
  const totalIdeas = cards.filter((c) => c.status === 'idea').length

  const SUMMARY = [
    { label: 'Posts Published', value: posted, icon: CheckCircle2, color: '#22c55e' },
    { label: 'Scheduled', value: scheduled, icon: Clock, color: '#3B82F6' },
    { label: 'In Pipeline', value: inProgress, icon: TrendingUp, color: '#F59E0B' },
    { label: 'Ideas', value: totalIdeas, icon: FileText, color: '#8B5CF6' },
  ]

  const canEdit = true // all authenticated users can see; managers/admins can edit

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto animate-fade-up">
      {/* Header */}
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-0.5">Analytics</p>
        <div className="flex items-center gap-3">
          {team && (
            <span
              className="w-3 h-3 rounded-sm inline-block"
              style={{ backgroundColor: team.color }}
            />
          )}
          <h2 className="text-xl font-bold text-white">{team?.name ?? 'Analytics'}</h2>
        </div>
        <p className="text-xs text-white/30 mt-0.5">
          Content performance and social account setup for this team
        </p>
      </div>

      {/* Team tabs (if multiple teams) */}
      {teams.length > 1 && (
        <div className="flex gap-1.5 mb-6 flex-wrap">
          {teams.map((t) => (
            <button
              key={t.id}
              onClick={() => useTeamStore.getState().setCurrentTeam(t.id)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
              style={
                t.id === currentTeamId
                  ? {
                      backgroundColor: `${t.color}18`,
                      borderColor: `${t.color}40`,
                      color: t.color,
                    }
                  : {
                      backgroundColor: 'transparent',
                      borderColor: 'rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.35)',
                    }
              }
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
              {t.name}
            </button>
          ))}
        </div>
      )}

      {/* In-app stats */}
      <div className="mb-8">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-white/30 mb-3 flex items-center gap-2">
          <BarChart3 size={12} />
          Content Stats
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SUMMARY.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="rounded-2xl p-4 border border-white/[0.06] flex flex-col gap-2"
              style={{ backgroundColor: '#1a1d27' }}
            >
              <div className="flex items-center gap-2">
                <Icon size={13} style={{ color }} />
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">{label}</p>
              </div>
              <p className="text-3xl font-black" style={{ color: value > 0 ? 'white' : 'rgba(255,255,255,0.2)' }}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Social accounts */}
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-white/30 mb-3">
          Social Accounts
        </h3>
        <p className="text-xs text-white/25 mb-4">
          Set the account handles for {team?.name ?? 'this team'}'s social profiles. Managers and admins can edit.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SOCIAL_PLATFORMS.map((platform) => {
            const account = socialAccounts.find((a) => a.team_id === currentTeamId && a.platform === platform.key)
            return (
              <AccountCard
                key={platform.key}
                platform={platform}
                account={account}
                teamId={currentTeamId ?? ''}
                canEdit={canEdit}
              />
            )
          })}
        </div>
      </div>

      <p className="text-center text-xs text-white/15 mt-10">
        Live metrics (reach, engagement, impressions) will be available once platform API integrations are added.
      </p>
    </div>
  )
}
