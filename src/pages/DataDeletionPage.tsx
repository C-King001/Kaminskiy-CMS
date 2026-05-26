import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Mail, CheckCircle2, ArrowLeft, ShieldCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'

function generateRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'DEL-'
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export function DataDeletionPage() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [referenceCode, setReferenceCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitting(true)
    setError(null)

    const reference_code = generateRef()
    const { error: dbError } = await supabase.from('deletion_requests').insert({
      email: email.trim().toLowerCase(),
      reference_code,
      status: 'pending',
    })

    if (dbError) {
      setError('Failed to submit request. Please try again or email us directly.')
      setSubmitting(false)
      return
    }

    setReferenceCode(reference_code)
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0f1117' }}>
      {/* Header */}
      <header className="border-b border-white/[0.06] px-6 py-4 flex items-center gap-4">
        <img src="/kcr-icon.jpg" alt="KCR" className="w-7 h-7 rounded-lg object-cover" />
        <span className="text-white font-bold text-sm">KCR CMS</span>
        <div className="flex-1" />
        <Link to="/login" className="text-xs text-white/30 hover:text-white/60 transition-colors flex items-center gap-1.5">
          <ArrowLeft size={12} />
          Back to app
        </Link>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-16">
        <div className="w-full max-w-lg">
          {/* Icon + Title */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(239,68,68,0.12)' }}>
              <Trash2 size={18} className="text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Data Deletion Request</h1>
          </div>
          <p className="text-sm text-white/40 mb-8 ml-[52px]">
            Request permanent deletion of your personal data from KCR CMS.
          </p>

          {referenceCode ? (
            /* Success state */
            <div className="rounded-2xl border border-green-500/20 p-6" style={{ backgroundColor: '#1a1d27' }}>
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 size={20} className="text-[#22c55e] shrink-0" />
                <h2 className="text-base font-bold text-white">Request Submitted</h2>
              </div>
              <p className="text-sm text-white/50 mb-5">
                We have received your data deletion request. We will process it within 30 days and
                send a confirmation to <span className="text-white/70 font-medium">{email}</span>.
              </p>
              <div className="rounded-xl border border-white/[0.08] p-4" style={{ backgroundColor: '#0f1117' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Reference Code</p>
                <p className="text-lg font-mono font-bold text-[#22c55e]">{referenceCode}</p>
                <p className="text-[11px] text-white/25 mt-1">Keep this code for your records</p>
              </div>
              <p className="text-xs text-white/30 mt-4">
                Questions? Email us at{' '}
                <a href="mailto:faithfulnyama@gmail.com" className="text-white/50 hover:text-white/70 underline underline-offset-2">
                  faithfulnyama@gmail.com
                </a>
              </p>
            </div>
          ) : (
            /* Form */
            <div className="rounded-2xl border border-white/[0.08] p-6" style={{ backgroundColor: '#1a1d27' }}>
              <h2 className="text-sm font-bold text-white mb-1">Submit a Deletion Request</h2>
              <p className="text-xs text-white/35 mb-5">
                Enter the email address associated with your account. We will delete all personal
                data including your profile, content history, and any connected social media tokens.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 block mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/80 placeholder-white/20 outline-none focus:ring-1 focus:ring-red-500/40 transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting || !email.trim()}
                  className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #b91c1c, #ef4444)' }}
                >
                  {submitting ? 'Submitting…' : 'Submit Deletion Request'}
                </button>
              </form>

              <div className="flex items-start gap-2 mt-5 pt-5 border-t border-white/[0.06]">
                <ShieldCheck size={13} className="text-white/20 shrink-0 mt-0.5" />
                <p className="text-[11px] text-white/25 leading-relaxed">
                  Requests are processed within 30 days per applicable privacy regulations. You will
                  receive email confirmation once your data has been deleted. Some data may be retained
                  for legal compliance purposes.
                </p>
              </div>
            </div>
          )}

          {/* Links */}
          <div className="flex items-center gap-4 mt-6 text-xs text-white/25">
            <Link to="/privacy" className="hover:text-white/50 transition-colors">Privacy Policy</Link>
            <span>·</span>
            <Link to="/terms" className="hover:text-white/50 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
