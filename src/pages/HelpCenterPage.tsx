import { PublicNavbar } from '../components/common/PublicNavbar';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ChevronRight,
  ArrowRight,
  BookOpen,
  LayoutGrid,
  Settings,
  CreditCard,
  Globe,
  Wrench,
  Crown,
  Mail,
  FileText,
} from 'lucide-react';
import { MobileTabBar } from '../components/common/MobileTabBar';
import { SeoHead } from '../components/common/SeoHead';
import { LinkOsLogo } from '../components/common/LinkOsLogo';

/* Blue chain-link logo mark used across LinkOS mobile pages */
const LogoMark: React.FC = () => (
  <span className="flex items-center gap-1.5 select-none">
    <svg className="w-6 h-6" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M13 19a6 6 0 0 0 8.5 0l4-4a6 6 0 0 0-8.5-8.5l-2 2"
        stroke="#3B82F6"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path
        d="M19 13a6 6 0 0 0-8.5 0l-4 4a6 6 0 0 0 8.5 8.5l2-2"
        stroke="#60A5FA"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
    </svg>
    <span className="text-[19px] font-bold tracking-tight leading-none">
      <span className="text-white">Link</span>
      <span className="text-blue-500">OS</span>
    </span>
  </span>
);

interface HelpCategory {
  title: string;
  desc: string;
  meta: string;
  icon: React.FC<{ className?: string }>;
  tile: string;
  iconBg: string;
  iconColor: string;
  metaColor: string;
}

const CATEGORIES: HelpCategory[] = [
  {
    title: 'Getting Started',
    desc: 'Learn the basics and set up your account.',
    meta: '12 articles',
    icon: BookOpen,
    tile: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    metaColor: 'text-slate-500',
  },
  {
    title: 'Templates',
    desc: 'Find, use and customize professional templates.',
    meta: '18 articles',
    icon: LayoutGrid,
    tile: 'bg-green-50',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    metaColor: 'text-green-600',
  },
  {
    title: 'Account & Settings',
    desc: 'Manage your profile, preferences and security.',
    meta: '15 articles',
    icon: Settings,
    tile: 'bg-orange-50',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-500',
    metaColor: 'text-orange-500',
  },
  {
    title: 'Billing & Payments',
    desc: 'Plans, invoices, refunds and upgrades.',
    meta: '10 articles',
    icon: CreditCard,
    tile: 'bg-purple-50',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    metaColor: 'text-slate-500',
  },
  {
    title: 'Domains & SEO',
    desc: 'Connect domain, custom SEO and improve visibility.',
    meta: '14 articles',
    icon: Globe,
    tile: 'bg-pink-50',
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
    metaColor: 'text-pink-600',
  },
  {
    title: 'Troubleshooting',
    desc: 'Fix common issues quickly.',
    meta: '20 articles',
    icon: Wrench,
    tile: 'bg-sky-50',
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
    metaColor: 'text-slate-500',
  },
];

const POPULAR_CHIPS = ['Create page', 'Custom domain', 'Billing', 'Templates'];

const POPULAR_ARTICLES = [
  {
    title: 'How to create your first business page',
    desc: 'Step-by-step guide to get you online.',
    icon: BookOpen,
    to: '/resources/guides/how-to-create-your-first-business-page',
  },
  {
    title: 'Best templates for restaurants & cafés',
    desc: 'Curated templates for food businesses.',
    icon: LayoutGrid,
    to: '/resources/guides/best-templates-for-restaurants-and-cafes',
  },
  {
    title: '10 ways to get more customers online',
    desc: 'Practical, low-cost growth tips.',
    icon: FileText,
    to: '/resources/guides/10-ways-to-get-more-customers-online',
  },
];

export const HelpCenterPage: React.FC = () => {
  const [query, setQuery] = useState('');

  return (
    <div className="min-h-screen bg-[#050D1F] pb-20">
      <SeoHead title="Help Center | LinkOS" description="Find answers, learn with guides, or get in touch with the LinkOS support team." />

      {/* Header */}
      <PublicNavbar />

      <main className="max-w-2xl md:max-w-5xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mt-1 flex items-center gap-1.5 text-[13px]">
          <Link to="/" className="text-blue-400 hover:text-blue-300 font-medium">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          <span className="text-slate-200 font-medium">Help Center</span>
        </nav>

        {/* Hero */}
        <section className="relative mt-4" aria-labelledby="help-heading">
          <img
            src="/images/resources/support-3d.png"
            alt="3D support agent with a laptop saying we're here to help"
            className="absolute -top-6 right-[-16px] w-[150px] h-[150px] object-contain pointer-events-none select-none"
          />
          <div className="max-w-[64%]">
            <span className="inline-flex items-center px-3 py-1 rounded-full border border-white/15 bg-white/5 text-[11px] font-bold tracking-widest text-slate-200 uppercase">
              Support
            </span>
            <h1 id="help-heading" className="mt-3 text-[30px] leading-[1.15] font-bold text-white text-balance">
              How can we
              <br />
              <span className="text-blue-500">help you?</span>
            </h1>
            <p className="mt-3 text-[13.5px] leading-relaxed text-slate-400">
              Find answers, learn with guides, or get in touch with our support team.
            </p>
          </div>
        </section>

        {/* Search */}
        <form
          role="search"
          className="relative mt-5"
          onSubmit={(e) => e.preventDefault()}
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-500" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for help (e.g. templates, domain, billing...)"
            aria-label="Search for help"
            className="w-full h-12 pl-11 pr-4 rounded-xl border border-white/15 bg-white/5 text-[14px] text-white placeholder:text-slate-500 outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition"
          />
        </form>

        {/* Popular chips */}
        <div className="mt-3.5 flex items-center gap-2 flex-wrap">
          <span className="text-[12px] font-medium text-slate-400">Popular:</span>
          {POPULAR_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              className="px-3.5 py-1.5 rounded-full border border-white/15 bg-white/5 text-[12px] font-semibold text-slate-200 hover:bg-white/10 transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* White sheet */}
        <section className="mt-6 bg-white rounded-t-[28px] min-h-screen px-4 pt-6" aria-label="Help topics">
          <div>
            {/* Category cards */}
            <div className="grid grid-cols-3 gap-2.5">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.title}
                  to="/resources/guides"
                  className={`${cat.tile} rounded-2xl p-3 flex flex-col min-h-[150px] hover:shadow-md active:scale-[0.98] transition-all`}
                >
                  <span className={`w-9 h-9 rounded-xl ${cat.iconBg} flex items-center justify-center`}>
                    <cat.icon className={`w-[18px] h-[18px] ${cat.iconColor}`} aria-hidden="true" />
                  </span>
                  <h3 className="mt-2.5 text-[13px] font-bold text-slate-900 leading-tight">{cat.title}</h3>
                  <p className="mt-1 text-[10.5px] leading-snug text-slate-500">{cat.desc}</p>
                  <span className={`mt-auto pt-2 flex items-center justify-between text-[11px] font-semibold ${cat.metaColor}`}>
                    {cat.meta}
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>

            {/* Priority support banner */}
            <div className="mt-5 rounded-2xl bg-[#0A1B3F] p-4 flex items-center gap-3.5">
              <span className="w-11 h-11 rounded-full bg-amber-400/20 flex items-center justify-center shrink-0">
                <Crown className="w-5 h-5 text-amber-400" aria-hidden="true" />
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="text-[14px] font-bold text-white">Need priority support?</h3>
                <p className="mt-0.5 text-[11px] leading-snug text-slate-400">
                  Go Pro for faster support, exclusive resources and expert help.
                </p>
              </div>
              <Link
                to="/pricing"
                className="shrink-0 inline-flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-blue-600 hover:bg-blue-500 text-[12px] font-semibold text-white transition-colors"
              >
                Upgrade Now
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>

            {/* Still need help */}
            <div className="mt-4 rounded-2xl bg-blue-50 border border-blue-100 p-4 flex items-start gap-3.5">
              <span className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-blue-600" aria-hidden="true" />
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="text-[14px] font-bold text-slate-900">Still need help?</h3>
                <p className="mt-0.5 text-[11.5px] leading-snug text-slate-500">
                  Can&apos;t find what you&apos;re looking for? Our support team is here to help.
                </p>
                <div className="mt-2.5 flex items-center gap-3 flex-wrap">
                  <Link
                    to="/help/contact"
                    className="inline-flex items-center gap-1.5 px-4 h-9 rounded-lg bg-blue-600 hover:bg-blue-500 text-[12px] font-semibold text-white transition-colors"
                  >
                    Contact Support
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                  <span className="text-[11px] text-slate-400">We usually reply within 24 hours.</span>
                </div>
              </div>
            </div>

            {/* Popular articles */}
            <div className="mt-7 flex items-center justify-between">
              <h2 className="text-[17px] font-bold text-slate-900">Popular Articles</h2>
              <Link to="/resources/guides" className="flex items-center gap-1 text-[13px] font-semibold text-blue-600 hover:text-blue-500">
                View All
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
            <ul className="mt-3 divide-y divide-slate-100">
              {POPULAR_ARTICLES.map((a) => (
                <li key={a.title}>
                  <Link to={a.to} className="flex items-center gap-3 py-3 group">
                    <span className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <a.icon className="w-5 h-5 text-blue-600" aria-hidden="true" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[13.5px] font-bold text-slate-900 leading-snug">{a.title}</span>
                      <span className="block mt-0.5 text-[11.5px] text-slate-500 leading-snug">{a.desc}</span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <MobileTabBar active="Resources" />
    </div>
  );
};
