import { Link } from 'react-router-dom'
import { ArrowLeft, ShieldCheck } from 'lucide-react'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-base font-bold text-white mb-3 pb-2 border-b border-white/[0.06]">{title}</h2>
      <div className="text-sm text-white/50 leading-relaxed space-y-3">{children}</div>
    </section>
  )
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] mt-2 shrink-0" />
      <span>{children}</span>
    </li>
  )
}

export function PrivacyPolicyPage() {
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

      <main className="flex-1 px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Title block */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(34,197,94,0.1)' }}>
              <ShieldCheck size={18} className="text-[#22c55e]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>
              <p className="text-xs text-white/30">Last updated: May 2026</p>
            </div>
          </div>
          <p className="text-sm text-white/40 mb-10 ml-[52px]">
            This policy applies to KCR CMS, operated by Kaminskiy Care &amp; Repair.
          </p>

          <Section title="1. Information We Collect">
            <p>We collect the following categories of information when you use KCR CMS:</p>
            <ul className="space-y-2 mt-3">
              <Li><strong className="text-white/70">Account information:</strong> Your full name and email address, collected at registration or invitation.</Li>
              <Li><strong className="text-white/70">Profile data:</strong> An optional profile photo URL you choose to set.</Li>
              <Li><strong className="text-white/70">Content data:</strong> Social media posts, captions, briefs, files, and scheduling information you create inside the platform.</Li>
              <Li><strong className="text-white/70">Social media credentials:</strong> Platform account names, handles, and API access tokens for connected Meta (Facebook/Instagram), Google (YouTube), and TikTok business accounts. These are used solely to manage and publish content on your behalf.</Li>
              <Li><strong className="text-white/70">Usage data:</strong> Page views and feature interactions recorded internally for product improvement. No third-party analytics trackers are used.</Li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul className="space-y-2 mt-3">
              <Li>Authenticate you and manage your account access.</Li>
              <Li>Display your content pipeline, analytics, and team activity inside the platform.</Li>
              <Li>Publish and schedule social media content to connected platforms on your instructions.</Li>
              <Li>Generate AI-assisted captions using the Anthropic Claude API — only the content brief and platform details you provide are sent; no personal profile data is transmitted.</Li>
              <Li>Send system notifications (pipeline status changes, approvals) within the app.</Li>
              <Li>Respond to support requests and data deletion inquiries.</Li>
            </ul>
            <p className="mt-3">We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
          </Section>

          <Section title="3. How We Store Your Data">
            <p>
              All data is stored in <strong className="text-white/70">Supabase</strong>, a managed cloud database hosted on AWS infrastructure. Supabase encrypts data at rest (AES-256) and in transit (TLS 1.2+). Row-level security policies ensure users can only access data they are authorised to see.
            </p>
            <p>
              Social media access tokens are stored in our database and are not exposed to other users. Tokens are used exclusively for API calls to the respective platforms on your behalf.
            </p>
            <p>
              Uploaded media files are stored in Supabase Storage with access controls that restrict downloads to authenticated users within your workspace.
            </p>
          </Section>

          <Section title="4. Data Retention">
            <p>
              We retain your data for as long as your account is active. If you request deletion (see Section 5), we will remove your data within 30 days. Some data may be retained beyond this period where required by law (e.g., financial records).
            </p>
            <p>
              Content cards, ideas, and files you delete within the app are removed immediately from the active database. Supabase maintains automated backups for up to 7 days; after that period your deleted data is permanently purged from backups.
            </p>
          </Section>

          <Section title="5. Your Rights and Data Deletion">
            <p>You have the right to:</p>
            <ul className="space-y-2 mt-3">
              <Li><strong className="text-white/70">Access:</strong> Request a copy of the personal data we hold about you.</Li>
              <Li><strong className="text-white/70">Correction:</strong> Update your name and profile information in the Settings page at any time.</Li>
              <Li><strong className="text-white/70">Deletion:</strong> Request permanent deletion of all your personal data.</Li>
              <Li><strong className="text-white/70">Portability:</strong> Request your content data in a structured format.</Li>
            </ul>
            <p className="mt-3">
              To request data deletion, visit our{' '}
              <Link to="/data-deletion" className="text-[#22c55e] hover:underline underline-offset-2">
                Data Deletion page
              </Link>{' '}
              or email{' '}
              <a href="mailto:faithfulnyama@gmail.com" className="text-[#22c55e] hover:underline underline-offset-2">
                faithfulnyama@gmail.com
              </a>
              . We will process your request within 30 days.
            </p>
          </Section>

          <Section title="6. Third-Party Services">
            <p>KCR CMS integrates with the following third-party services. Their respective privacy policies apply to data processed by them:</p>
            <ul className="space-y-2 mt-3">
              <Li><strong className="text-white/70">Supabase</strong> — database, authentication, and file storage (<a href="https://supabase.com/privacy" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white/80 underline underline-offset-2">supabase.com/privacy</a>).</Li>
              <Li><strong className="text-white/70">Anthropic Claude API</strong> — AI caption generation. Only content briefs are transmitted; no personal data is sent (<a href="https://www.anthropic.com/privacy" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white/80 underline underline-offset-2">anthropic.com/privacy</a>).</Li>
              <Li><strong className="text-white/70">Meta (Facebook/Instagram)</strong> — social media publishing. Access tokens are stored per your authorisation and used solely for content posting.</Li>
              <Li><strong className="text-white/70">Google (YouTube)</strong> — social media publishing, same terms as above.</Li>
              <Li><strong className="text-white/70">Vercel</strong> — application hosting (<a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white/80 underline underline-offset-2">vercel.com/legal/privacy-policy</a>).</Li>
            </ul>
          </Section>

          <Section title="7. Cookies">
            <p>
              KCR CMS uses session cookies set by Supabase for authentication. No third-party advertising or tracking cookies are placed. Local storage is used to persist UI preferences (e.g., current team, sidebar state) and is never shared externally.
            </p>
          </Section>

          <Section title="8. Children's Privacy">
            <p>
              KCR CMS is intended for business use by adults. We do not knowingly collect personal information from anyone under the age of 16. If you believe a minor has provided us with personal data, please contact us and we will delete it promptly.
            </p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify active users of material changes via the platform's notification system. Continued use of the platform after changes are posted constitutes your acceptance of the updated policy.
            </p>
          </Section>

          <Section title="10. Contact">
            <p>
              For privacy questions, data requests, or concerns, contact us at:
            </p>
            <div className="mt-3 p-4 rounded-xl border border-white/[0.06]" style={{ backgroundColor: '#1a1d27' }}>
              <p className="text-white/70 font-semibold">Kaminskiy Care &amp; Repair</p>
              <p>Email: <a href="mailto:faithfulnyama@gmail.com" className="text-[#22c55e] hover:underline underline-offset-2">faithfulnyama@gmail.com</a></p>
            </div>
          </Section>

          {/* Footer links */}
          <div className="flex items-center gap-4 pt-6 border-t border-white/[0.06] text-xs text-white/25">
            <Link to="/terms" className="hover:text-white/50 transition-colors">Terms of Service</Link>
            <span>·</span>
            <Link to="/data-deletion" className="hover:text-white/50 transition-colors">Data Deletion</Link>
            <span>·</span>
            <Link to="/login" className="hover:text-white/50 transition-colors">Sign In</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
