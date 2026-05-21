import { BarChart3, TrendingUp, Users, ExternalLink, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const PLATFORMS = [
  {
    name: 'Instagram',
    handle: '@kaminskiycareandrepair',
    color: '#E1306C',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
      </svg>
    ),
    metrics: [
      { label: 'Followers', value: '—' },
      { label: 'Reach', value: '—' },
      { label: 'Engagement', value: '—' },
    ],
  },
  {
    name: 'Facebook',
    handle: 'Kaminskiy Care and Repair',
    color: '#1877F2',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
    metrics: [
      { label: 'Page Likes', value: '—' },
      { label: 'Post Reach', value: '—' },
      { label: 'Reactions', value: '—' },
    ],
  },
  {
    name: 'YouTube',
    handle: 'Kaminskiy Care and Repair',
    color: '#FF0000',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 0 0 1.95-1.97A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
        <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
      </svg>
    ),
    metrics: [
      { label: 'Subscribers', value: '—' },
      { label: 'Views', value: '—' },
      { label: 'Watch Time', value: '—' },
    ],
  },
  {
    name: 'TikTok',
    handle: '@kaminskiy_cr',
    color: '#14B8A6',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.66a8.12 8.12 0 0 0 4.74 1.51V6.7a4.85 4.85 0 0 1-.97-.01z"/>
      </svg>
    ),
    metrics: [
      { label: 'Followers', value: '—' },
      { label: 'Video Views', value: '—' },
      { label: 'Likes', value: '—' },
    ],
  },
]

const SUMMARY_STATS = [
  { label: 'Total Posts Published', value: '—', icon: BarChart3, color: '#22c55e' },
  { label: 'Total Reach (30 days)', value: '—', icon: TrendingUp, color: '#3B82F6' },
  { label: 'Total Engagement', value: '—', icon: Users, color: '#EC4899' },
]

export function AnalyticsPage() {
  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto animate-fade-up">
      {/* Header */}
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-0.5">KCR CMS</p>
        <h2 className="text-xl font-bold text-white">Analytics</h2>
        <p className="text-xs text-white/30 mt-0.5">Connect your social accounts to see live performance data</p>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {SUMMARY_STATS.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-[14px] p-4 border border-white/[0.06]"
            style={{ backgroundColor: '#1a1d27' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} style={{ color }} />
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30">{label}</p>
            </div>
            <p className="text-2xl font-bold text-white/30">{value}</p>
            <p className="text-[10px] text-white/20 mt-1">Connect account to unlock</p>
          </div>
        ))}
      </div>

      {/* Platform cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PLATFORMS.map((p) => (
          <div
            key={p.name}
            className="rounded-[14px] p-5 border border-white/[0.06] relative overflow-hidden"
            style={{ backgroundColor: '#1a1d27' }}
          >
            {/* Glow top-left */}
            <div
              className="absolute top-0 left-0 w-32 h-32 rounded-full opacity-10 -translate-x-8 -translate-y-8 blur-2xl pointer-events-none"
              style={{ backgroundColor: p.color }}
            />

            <div className="flex items-center gap-3 mb-4 relative">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${p.color}20`, color: p.color }}
              >
                {p.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-white/80">{p.name}</p>
                <p className="text-[11px] text-white/30">{p.handle}</p>
              </div>
              <span className="ml-auto flex items-center gap-1 text-[10px] text-white/20">
                <Lock size={10} />
                Not connected
              </span>
            </div>

            {/* Metric placeholders */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {p.metrics.map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-xl p-2.5 text-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                >
                  <p className="text-lg font-bold text-white/20">{value}</p>
                  <p className="text-[9px] text-white/20 uppercase tracking-wide">{label}</p>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-center"
              icon={<ExternalLink size={12} />}
            >
              Connect {p.name}
            </Button>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-white/20 mt-8">
        Analytics integration coming soon. Data will auto-sync once your accounts are connected.
      </p>
    </div>
  )
}
