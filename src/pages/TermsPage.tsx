import { Link } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'

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

export function TermsPage() {
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
              <FileText size={18} className="text-[#22c55e]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Terms of Service</h1>
              <p className="text-xs text-white/30">Last updated: May 2026</p>
            </div>
          </div>
          <p className="text-sm text-white/40 mb-10 ml-[52px]">
            Please read these terms carefully before using KCR CMS.
          </p>

          <Section title="1. Acceptance of Terms">
            <p>
              By accessing or using KCR CMS ("the Platform"), operated by Kaminskiy Care &amp; Repair ("we", "us", "our"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Platform.
            </p>
            <p>
              These terms apply to all users including content creators, reviewers, managers, and administrators. Access is granted by invitation only; the Platform is not open for public self-registration.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              KCR CMS is a private content operations platform that enables authorised users to plan, create, review, approve, schedule, and publish social media content for Kaminskiy Care &amp; Repair business units. Features include:
            </p>
            <ul className="space-y-2 mt-3">
              <Li>A multi-stage content pipeline with role-based approval workflows</Li>
              <Li>An idea bank for capturing and developing content concepts</Li>
              <Li>Integration with social media platforms (Meta, Google, TikTok) for content publishing</Li>
              <Li>AI-assisted caption generation via the Anthropic Claude API</Li>
              <Li>Analytics dashboards showing content performance metrics</Li>
              <Li>Team management and access control tools</Li>
            </ul>
          </Section>

          <Section title="3. User Accounts and Access">
            <p>
              Access to the Platform is granted through an email invitation from an Administrator. You are responsible for:
            </p>
            <ul className="space-y-2 mt-3">
              <Li>Maintaining the confidentiality of your login credentials</Li>
              <Li>All activity that occurs under your account</Li>
              <Li>Notifying us immediately at <a href="mailto:faithfulnyama@gmail.com" className="text-[#22c55e] hover:underline underline-offset-2">faithfulnyama@gmail.com</a> if you suspect unauthorised access</Li>
            </ul>
            <p>
              You may not share your account credentials, transfer your account to another person, or use the Platform on behalf of unauthorised third parties.
            </p>
          </Section>

          <Section title="4. User Responsibilities">
            <p>When using the Platform, you agree to:</p>
            <ul className="space-y-2 mt-3">
              <Li>Use the Platform only for legitimate business content operations on behalf of Kaminskiy Care &amp; Repair</Li>
              <Li>Not upload, publish, or distribute content that is unlawful, defamatory, obscene, fraudulent, or that infringes third-party intellectual property rights</Li>
              <Li>Not attempt to gain unauthorised access to other accounts, systems, or networks connected to the Platform</Li>
              <Li>Not reverse-engineer, decompile, or attempt to extract the source code of the Platform</Li>
              <Li>Not use automated scripts or bots to interact with the Platform without prior written consent</Li>
              <Li>Comply with the terms of service of any connected third-party platforms (Meta, Google, TikTok) when publishing content through integrations</Li>
            </ul>
          </Section>

          <Section title="5. Content Ownership">
            <p>
              <strong className="text-white/70">Your content:</strong> All creative content you upload, write, or produce within the Platform (posts, captions, briefs, files) remains the intellectual property of Kaminskiy Care &amp; Repair or the respective content creator, as determined by your employment or contractor agreement.
            </p>
            <p>
              <strong className="text-white/70">AI-generated content:</strong> Captions and suggestions generated by the AI caption tool are provided as drafts for your review and editing. You are responsible for reviewing, modifying, and approving all AI-generated content before publication.
            </p>
            <p>
              <strong className="text-white/70">Platform licence:</strong> You grant us a limited licence to store, process, and display your content solely for the purpose of operating the Platform and delivering its services to you.
            </p>
          </Section>

          <Section title="6. Service Availability">
            <p>
              We aim to provide a reliable service but do not guarantee uninterrupted or error-free availability. The Platform may be temporarily unavailable due to:
            </p>
            <ul className="space-y-2 mt-3">
              <Li>Scheduled maintenance (we will provide advance notice where possible)</Li>
              <Li>Unplanned outages at infrastructure providers (Supabase, Vercel)</Li>
              <Li>Force majeure events beyond our reasonable control</Li>
            </ul>
            <p>
              We are not liable for any losses arising from service downtime. We will make reasonable efforts to restore service promptly in the event of an outage.
            </p>
          </Section>

          <Section title="7. Payment Terms">
            <p>
              KCR CMS is currently operated as an internal tool for Kaminskiy Care &amp; Repair at no charge to individual users. If the Platform is extended to external clients in the future, commercial terms will be communicated separately and agreed in writing prior to access being granted.
            </p>
            <p>
              Any future subscription fees will be invoiced monthly or annually as agreed. Failure to pay may result in suspension of access after a 14-day grace period following written notice.
            </p>
          </Section>

          <Section title="8. Confidentiality">
            <p>
              The Platform, its features, content pipelines, and business processes visible within it are confidential to Kaminskiy Care &amp; Repair. You agree not to disclose any information about the Platform's content, team structures, or internal workflows to unauthorised parties.
            </p>
          </Section>

          <Section title="9. Termination">
            <p>
              We may suspend or terminate your access to the Platform at any time, with or without notice, if we reasonably believe you have violated these Terms or if your engagement with Kaminskiy Care &amp; Repair ends.
            </p>
            <p>
              You may request account deletion at any time by contacting an Administrator or submitting a request via the{' '}
              <Link to="/data-deletion" className="text-[#22c55e] hover:underline underline-offset-2">Data Deletion page</Link>.
              Upon termination, your access will be revoked and your personal data will be deleted per our{' '}
              <Link to="/privacy" className="text-[#22c55e] hover:underline underline-offset-2">Privacy Policy</Link>.
            </p>
          </Section>

          <Section title="10. Limitation of Liability">
            <p>
              To the maximum extent permitted by applicable law, Kaminskiy Care &amp; Repair and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform, including loss of data, loss of revenue, or reputational harm, even if we have been advised of the possibility of such damages.
            </p>
            <p>
              Our total liability for any claim arising out of or relating to these Terms or the Platform shall not exceed the total fees paid by you (if any) in the 12 months preceding the claim.
            </p>
          </Section>

          <Section title="11. Governing Law">
            <p>
              These Terms are governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be resolved in the courts of Los Angeles County, California.
            </p>
          </Section>

          <Section title="12. Changes to Terms">
            <p>
              We reserve the right to update these Terms at any time. Material changes will be communicated via the Platform's notification system with at least 7 days' notice. Continued use of the Platform after the effective date of changes constitutes your acceptance of the updated Terms.
            </p>
          </Section>

          <Section title="13. Contact">
            <p>For questions about these Terms, contact us at:</p>
            <div className="mt-3 p-4 rounded-xl border border-white/[0.06]" style={{ backgroundColor: '#1a1d27' }}>
              <p className="text-white/70 font-semibold">Kaminskiy Care &amp; Repair</p>
              <p>Email: <a href="mailto:faithfulnyama@gmail.com" className="text-[#22c55e] hover:underline underline-offset-2">faithfulnyama@gmail.com</a></p>
            </div>
          </Section>

          {/* Footer links */}
          <div className="flex items-center gap-4 pt-6 border-t border-white/[0.06] text-xs text-white/25">
            <Link to="/privacy" className="hover:text-white/50 transition-colors">Privacy Policy</Link>
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
