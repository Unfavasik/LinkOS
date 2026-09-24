import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Info,
  FileText,
  ShieldCheck,
  Users,
  Ban,
  Image,
  CreditCard,
  Copyright,
  Cookie,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { LinkOsLogo } from '../components/common/LinkOsLogo';

interface PolicySection {
  title: string;
  body: string;
}

interface Policy {
  id: string;
  label: string;
  icon: React.ElementType;
  intro: string;
  sections: PolicySection[];
}

const POLICIES: Policy[] = [
  {
    id: 'terms',
    label: 'Terms of Service',
    icon: FileText,
    intro: 'These Terms of Service ("Terms") govern your access to and use of LinkOS, including our website, tools, templates and related services. By creating an account or using our services, you agree to these terms.',
    sections: [
      { title: '1. Using LinkOS', body: 'You must be at least 13 years old to use LinkOS. You agree to provide accurate information and keep your account secure.' },
      { title: '2. Your Content', body: 'You own the content you create using LinkOS. You are responsible for ensuring that your content does not violate any laws or third-party rights.' },
      { title: '3. Acceptable Use', body: 'You agree not to use LinkOS for any illegal, harmful or abusive activities, including but not limited to spam, malware, hate speech or infringement of intellectual property.' },
      { title: '4. Account Suspension', body: 'We may suspend or terminate accounts that violate these Terms or our community guidelines. Suspended users may appeal the decision by contacting our support team.' },
      { title: '5. Changes to These Terms', body: 'We may update these Terms from time to time. Continued use of LinkOS after an update means you accept the revised Terms.' },
    ],
  },
  {
    id: 'privacy',
    label: 'Privacy Policy',
    icon: ShieldCheck,
    intro: 'This Privacy Policy explains what information LinkOS collects, how we use it, and the choices you have over your data.',
    sections: [
      { title: '1. Information We Collect', body: 'We collect the information you provide when creating an account (name, email, business details) and basic usage data such as page views and link clicks.' },
      { title: '2. How We Use Information', body: 'We use your information to provide and improve the service, show analytics inside your dashboard, and communicate important updates.' },
      { title: '3. Data Sharing', body: 'We do not sell your personal information. Data is only shared with service providers that help us operate LinkOS, such as hosting and storage providers.' },
      { title: '4. Your Rights', body: 'You may request a copy of your data or ask us to delete your account and associated data at any time by contacting support.' },
    ],
  },
  {
    id: 'community',
    label: 'Community Guidelines',
    icon: Users,
    intro: 'Our community guidelines keep LinkOS safe and useful for everyone. These rules apply to all pages, content and interactions on the platform.',
    sections: [
      { title: '1. Be Honest', body: 'Represent your business accurately. Do not impersonate other people, businesses or brands.' },
      { title: '2. Be Respectful', body: 'Harassment, hate speech and abusive content directed at other users or visitors are not tolerated.' },
      { title: '3. Keep It Legal', body: 'Content that promotes illegal activities or products is prohibited and may result in immediate suspension.' },
    ],
  },
  {
    id: 'acceptable-use',
    label: 'Acceptable Use Policy',
    icon: Ban,
    intro: 'This policy describes activities that are prohibited when using LinkOS.',
    sections: [
      { title: '1. Prohibited Activities', body: 'Do not use LinkOS to distribute malware, run phishing schemes, send spam, or attempt to gain unauthorized access to other accounts or systems.' },
      { title: '2. Fair Resource Use', body: 'Do not place unreasonable load on our infrastructure, including automated scraping or abuse of the API.' },
      { title: '3. Enforcement', body: 'Violations may result in content removal, account suspension, or reporting to relevant authorities.' },
    ],
  },
  {
    id: 'content',
    label: 'Content Policy',
    icon: Image,
    intro: 'Rules for the content you publish on your LinkOS pages.',
    sections: [
      { title: '1. Ownership', body: 'You must own or have the rights to use any images, text or media you publish on your pages.' },
      { title: '2. Restricted Content', body: 'Adult content, graphic violence, and content that exploits or endangers minors are strictly prohibited.' },
      { title: '3. Accuracy', body: 'Prices, product descriptions and business details published on your page must be accurate and up to date.' },
    ],
  },
  {
    id: 'payments',
    label: 'Payments & Refunds',
    icon: CreditCard,
    intro: 'How payments, subscriptions and refunds work on LinkOS.',
    sections: [
      { title: '1. Billing', body: 'Paid plans renew automatically at the end of each billing cycle until cancelled. You can cancel at any time from your account settings.' },
      { title: '2. Refunds', body: 'If you are not satisfied, contact us within 14 days of a charge and we will review your refund request.' },
      { title: '3. Failed Payments', body: 'Accounts with repeated failed payments may be downgraded to the free plan until the billing issue is resolved.' },
    ],
  },
  {
    id: 'dmca',
    label: 'DMCA Policy',
    icon: Copyright,
    intro: 'How to report copyright infringement on LinkOS.',
    sections: [
      { title: '1. Filing a Report', body: 'If you believe content on LinkOS infringes your copyright, send a notice to our support team with the page URL, a description of the work, and your contact information.' },
      { title: '2. Our Response', body: 'We review valid notices promptly and may remove the reported content and notify the page owner.' },
      { title: '3. Counter-Notice', body: 'Page owners may submit a counter-notice if they believe the content was removed in error.' },
    ],
  },
  {
    id: 'cookies',
    label: 'Cookies Policy',
    icon: Cookie,
    intro: 'How LinkOS uses cookies and similar technologies.',
    sections: [
      { title: '1. Essential Cookies', body: 'We use essential cookies to keep you signed in and to remember your preferences.' },
      { title: '2. Analytics', body: 'We use privacy-friendly analytics to understand how pages are used. No advertising trackers are used.' },
      { title: '3. Managing Cookies', body: 'You can clear or block cookies in your browser settings, though some features may stop working.' },
    ],
  },
  {
    id: 'data-deletion',
    label: 'Data Deletion',
    icon: Trash2,
    intro: 'What happens when you delete your account or data.',
    sections: [
      { title: '1. Deleting Your Account', body: 'You can request account deletion from settings or by contacting support. Your profile, pages and website content will be permanently removed.' },
      { title: '2. Retention', body: 'Some data may be retained for a short period for security and legal purposes before being fully deleted.' },
      { title: '3. Public Pages', body: 'Deleting your account unpublishes all public pages immediately.' },
    ],
  },
];

export const LegalPage: React.FC = () => {
  const [activeId, setActiveId] = useState(POLICIES[0].id);
  const [mobileOpen, setMobileOpen] = useState(false);
  const active = POLICIES.find((p) => p.id === activeId) ?? POLICIES[0];

  return (
    <div className="min-h-screen bg-[#050B18] text-white">
      <div className="mx-auto w-full max-w-5xl px-5 pb-16">
        {/* Top bar */}
        <header className="flex items-center justify-between py-5">
          <Link to="/" aria-label="LinkOS home">
            <LinkOsLogo className="h-9 w-auto" />
          </Link>
        </header>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
          <Link to="/" className="hover:text-white">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span>Legal</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-white">Terms &amp; Policies</span>
        </nav>

        {/* Hero */}
        <div className="mt-3 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Terms &amp; Policies</h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400 text-pretty">
              Clear guidelines for using LinkOS. Please read our policies carefully before creating an account or using our services.
            </p>
          </div>
          <img
            src="/images/terms-hero.png"
            alt="Illustration of a policy document with a protection shield"
            className="hidden w-44 shrink-0 rounded-2xl sm:block"
          />
        </div>

        {/* Commitment card */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-500/25 bg-blue-600/10 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600">
            <Info className="h-5 w-5 text-white" />
          </span>
          <div>
            <h2 className="text-sm font-bold">Our Commitment</h2>
            <p className="mt-1 text-[13px] leading-relaxed text-slate-300 text-pretty">
              We believe in transparency, fairness and a safe platform for everyone. These policies explain your rights, responsibilities and how we keep LinkOS service and reliable.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[280px_1fr]">
          {/* Sidebar */}
          <aside>
            {/* Mobile: horizontal chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden" role="tablist" aria-label="Policies">
              {POLICIES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={p.id === activeId}
                  onClick={() => { setActiveId(p.id); setMobileOpen(true); }}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-colors ${
                    p.id === activeId ? 'bg-blue-600 text-white' : 'border border-white/15 bg-white/5 text-slate-300'
                  }`}
                >
                  <p.icon className="h-4 w-4" />
                  {p.label}
                </button>
              ))}
            </div>
            {/* Desktop: vertical list */}
            <div className="hidden space-y-2 lg:block" role="tablist" aria-label="Policies">
              {POLICIES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={p.id === activeId}
                  onClick={() => setActiveId(p.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-sm font-bold transition-colors ${
                    p.id === activeId ? 'bg-blue-600 text-white' : 'border border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span className="inline-flex items-center gap-3">
                    <p.icon className="h-4.5 w-4.5" />
                    {p.label}
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-70" />
                </button>
              ))}
            </div>
          </aside>

          {/* Content panel */}
          <section className="rounded-2xl border border-white/10 bg-[#0B1424] p-5 sm:p-6">
            <h2 className="text-xl font-extrabold sm:text-2xl">{active.label}</h2>
            <p className="mt-1 text-xs text-slate-500">Last updated: Sep 24, 2026</p>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-bold">Overview</h3>
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-300">{active.intro}</p>
            </div>

            <div className="mt-5 space-y-5">
              {active.sections.map((s) => (
                <div key={s.title}>
                  <h3 className="text-sm font-extrabold">{s.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-400 text-pretty">{s.body}</p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="mt-6 flex w-full items-center justify-between rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-sm font-bold text-white hover:bg-white/10 transition-colors"
            >
              <span className="inline-flex items-center gap-2.5">
                <FileText className="h-4 w-4" />
                Read Full {active.label}
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${mobileOpen ? 'rotate-180' : ''}`} />
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};
