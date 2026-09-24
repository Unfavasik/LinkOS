import { PublicNavbar } from '../components/common/PublicNavbar';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search, Menu, ArrowRight, Zap, Sparkles, RefreshCw, ShieldCheck, Gem,
  Check, X, Crown, Leaf, Rocket, Building2, Globe, CalendarClock, Ban,
  Star, Facebook, Twitter, Instagram, Youtube, Linkedin, Headphones, IndianRupee,
} from 'lucide-react';
import { LinkOsLogo } from '../components/common/LinkOsLogo';
import { MenuDrawer } from '../components/common/MenuDrawer';
import { AuthNavButtons } from '../components/common/AuthNavButtons';
import { PhoneMockup } from './AboutPage';
import { StorageService } from '../lib/storage';

type Plan = {
  id: string;
  name: string;
  tagline: string;
  monthly: number;
  yearly: number;
  forever?: boolean;
  icon: typeof Leaf;
  iconBg: string;
  popular?: boolean;
  cta: string;
  features: string[];
};

const PLANS: Plan[] = [
  {
    id: 'free', name: 'Free', tagline: 'Get started with the basics',
    monthly: 0, yearly: 0, forever: true, icon: Leaf, iconBg: 'bg-emerald-500/15 text-emerald-400',
    cta: 'Get Started',
    features: ['1 business page', 'LinkOS branding', 'Basic templates', 'Up to 5 products/services', 'Standard support'],
  },
  {
    id: 'starter', name: 'Starter', tagline: 'For small businesses',
    monthly: 299, yearly: 239, icon: Rocket, iconBg: 'bg-blue-500/15 text-blue-400',
    cta: 'Start Starter',
    features: ['Custom domain (linkos.app/yourname)', 'Remove LinkOS branding', 'Unlimited products & services', 'Contact & location', 'Gallery & reviews', 'Basic analytics'],
  },
  {
    id: 'pro', name: 'Pro', tagline: 'For growing businesses',
    monthly: 599, yearly: 479, icon: Crown, iconBg: 'bg-amber-400/15 text-amber-400', popular: true,
    cta: 'Start Pro',
    features: ['Everything in Starter', 'Premium templates', 'Advanced customization', 'Online booking / WhatsApp CTAs', 'Discounts & offers', 'Customer reviews', 'Social media links', 'Priority support'],
  },
  {
    id: 'business', name: 'Business', tagline: 'For multiple locations',
    monthly: 1199, yearly: 959, icon: Building2, iconBg: 'bg-purple-500/15 text-purple-400',
    cta: 'Start Business',
    features: ['Everything in Pro', 'Multiple business pages', 'Team collaboration', 'Advanced analytics', 'Custom domain support', 'API access (coming soon)', 'Priority support'],
  },
];

type Cell = boolean | string;

const COMPARISON: { label: string; values: [Cell, Cell, Cell, Cell] }[] = [
  { label: 'Business page', values: ['1', '1', '1', 'Multiple'] },
  { label: 'LinkOS branding', values: [true, false, false, false] },
  { label: 'Custom domain', values: [false, true, true, true] },
  { label: 'Products & Services', values: ['Up to 5', 'Unlimited', 'Unlimited', 'Unlimited'] },
  { label: 'Gallery & media', values: [true, true, true, true] },
  { label: 'Customer reviews', values: [false, true, true, true] },
  { label: 'Social media links', values: [false, true, true, true] },
  { label: 'Advanced customization', values: [false, false, true, true] },
  { label: 'Analytics', values: ['Basic', 'Basic', 'Advanced', 'Advanced'] },
  { label: 'Team members', values: [false, false, false, true] },
  { label: 'Priority support', values: [false, false, true, true] },
];

const ADD_ONS = [
  { icon: Globe, name: 'Custom Domain', price: 199, text: 'Use your own domain (e.g. yourbusiness.in)', bg: 'bg-blue-500/15 text-blue-400' },
  { icon: CalendarClock, name: 'Online Booking', price: 149, text: 'Let customers book appointments', bg: 'bg-purple-500/15 text-purple-400' },
  { icon: Ban, name: 'Remove LinkOS Branding', price: 99, text: 'A fully white-label experience', bg: 'bg-rose-500/15 text-rose-400' },
];

const TESTIMONIALS = [
  { photo: '/images/about/team-asik.webp', name: 'Arif Khan', business: 'Brew & Bites Café', text: 'Super easy to use! Got my café page live in 10 minutes.' },
  { photo: '/images/about/team-nadia.webp', name: 'Priya Das', business: 'Glow Beauty Salon', text: 'LinkOS helped us get more customers from Google.' },
  { photo: '/images/about/team-rafid.webp', name: 'Rohit Saha', business: 'Drive Auto Services', text: 'Best platform for small businesses. Totally worth it!' },
];

const trustBadges = [
  { icon: Sparkles, label: 'No coding needed' },
  { icon: RefreshCw, label: 'Cancel anytime' },
  { icon: ShieldCheck, label: 'Secure & reliable' },
  { icon: Gem, label: 'Trusted by 10K+ businesses' },
];

const CellValue = ({ v }: { v: Cell }) =>
  v === true ? (
    <Check className="w-4 h-4 text-emerald-400 mx-auto" aria-label="Included" />
  ) : v === false ? (
    <X className="w-4 h-4 text-zinc-600 mx-auto" aria-label="Not included" />
  ) : (
    <span className="text-xs text-zinc-300">{v}</span>
  );

export default function PricingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [yearly, setYearly] = useState(false);
  const [searchParams] = useSearchParams();
  const [purchased, setPurchased] = useState<string | null>(null);

  // Buying a plan unlocks Pro templates; ?template= brings the user back to what they wanted
  const handleChoosePlan = (planId: string) => {
    if (planId === 'free') return;
    StorageService.setUserPlan(planId);
    setPurchased(planId);
  };

  return (
  <div className="min-h-screen bg-[#060D1A] text-white font-sans">
  <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
  <PublicNavbar />

  {/* ── Hero ── */}
  <div className="relative bg-[#04070F] overflow-hidden">
  <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-600/20 blur-[100px]" aria-hidden="true" />
  <div className="absolute top-40 right-0 w-72 h-72 rounded-full bg-blue-500/10 blur-[90px]" aria-hidden="true" />

  <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
  {/* hero content */}
          <div className="relative mt-8 pb-10 md:pb-16">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
                <Zap className="w-3.5 h-3.5" /> Simple Pricing, Big Possibilities.
              </span>
              <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.08]">
                Choose a plan<br />that fits your business
              </h1>
              <p className="mt-4 text-sm sm:text-base text-zinc-400 leading-relaxed">
                Everything you need to create a beautiful online presence.<br className="hidden sm:block" /> Start free, upgrade anytime.
              </p>
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
                {trustBadges.map((b) => (
                  <span key={b.label} className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-300">
                    <b.icon className="w-4 h-4 text-blue-400" /> {b.label}
                  </span>
                ))}
              </div>
            </div>

            {/* handwritten note + phone (desktop) */}
            <div className="hidden md:block absolute top-0 right-0 w-[400px] pointer-events-none" aria-hidden="true">
              <p className="absolute top-2 left-0 font-serif italic text-lg leading-snug text-blue-100/90 -rotate-6">
                A small step<br />for your business<br /><span className="text-blue-300">A big step</span><br />towards growth.
              </p>
              <svg viewBox="0 0 60 70" className="absolute top-32 left-24 w-10 h-12 fill-none stroke-blue-400" strokeWidth="2" strokeLinecap="round">
                <path d="M8 4 C 30 18, 44 34, 40 60" /><path d="M32 52 L 40 62 L 48 52" />
              </svg>
              <div className="mt-2 ml-40 rotate-[8deg] origin-top pointer-events-auto">
                <PhoneMockup />
              </div>
            </div>

            {/* billing toggle */}
            <div className="mt-8 flex justify-center">
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 p-1">
                <button
                  type="button"
                  onClick={() => setYearly(false)}
                  aria-pressed={!yearly}
                  className={`rounded-full px-6 py-2 text-sm font-bold transition-colors ${!yearly ? 'bg-blue-600 text-white' : 'text-zinc-300 hover:text-white'}`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setYearly(true)}
                  aria-pressed={yearly}
                  className={`rounded-full px-6 py-2 text-sm font-bold transition-colors inline-flex items-center gap-1.5 ${yearly ? 'bg-blue-600 text-white' : 'text-zinc-300 hover:text-white'}`}
                >
                  Yearly
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${yearly ? 'bg-emerald-500/25 text-emerald-300' : 'bg-emerald-500/15 text-emerald-400'}`}>Save 20%</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* ── Plan cards ── */}
        {purchased && (
          <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex flex-wrap items-center gap-3" role="status">
            <Check className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
            <p className="flex-1 min-w-[200px] text-[13px] font-semibold text-emerald-200">
              {purchased.charAt(0).toUpperCase() + purchased.slice(1)} plan activated — Pro templates are now unlocked.
            </p>
            {searchParams.get('template') && (
              <Link
                to={`/templates/preview/${searchParams.get('template')}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-[12px] font-bold text-[#05210F] transition-colors"
              >
                Use Your Template <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            )}
          </div>
        )}

        <section className="-mt-2 md:-mt-6 grid sm:grid-cols-2 md:grid-cols-4 gap-4" aria-label="Pricing plans">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className={`relative flex flex-col rounded-2xl border p-5 transition-colors ${
                p.popular ? 'border-blue-500 bg-gradient-to-b from-blue-950/60 to-[#0A1224] shadow-lg shadow-blue-900/30' : 'border-white/10 bg-white/[0.03] hover:border-white/20'
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 right-4 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-extrabold tracking-wide">Most Popular</span>
              )}
              <span className={`w-11 h-11 rounded-xl flex items-center justify-center ${p.iconBg}`}>
                <p.icon className="w-6 h-6" />
              </span>
              <h2 className={`mt-3 text-lg font-extrabold ${p.popular ? 'text-amber-400' : ''}`}>{p.name}</h2>
              <p className="text-xs text-zinc-400">{p.tagline}</p>
              <p className="mt-3 flex items-center gap-1">
                <IndianRupee className="w-5 h-5 text-zinc-200" strokeWidth={2.5} aria-label="Rupees" />
                <span className="text-3xl font-extrabold tracking-tight">{yearly ? p.yearly : p.monthly}</span>
                <span className="text-xs text-zinc-400">{p.forever ? '/ forever' : '/ month'}</span>
              </p>
              <ul className="mt-4 space-y-2 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-zinc-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              {p.id === 'free' ? (
                <Link
                  to="/signup"
                  className="mt-5 inline-flex items-center justify-center rounded-xl py-2.5 text-sm font-bold border border-white/15 bg-white/5 hover:bg-white/10 text-white transition-colors"
                >
                  {p.cta}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => handleChoosePlan(p.id)}
                  className={`mt-5 inline-flex items-center justify-center rounded-xl py-2.5 text-sm font-bold transition-colors ${
                    purchased === p.id
                      ? 'bg-emerald-500 text-[#05210F]'
                      : p.popular
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'border border-white/15 bg-white/5 hover:bg-white/10 text-white'
                  }`}
                >
                  {purchased === p.id ? 'Purchased — Premium Active' : p.cta}
                </button>
              )}
            </div>
          ))}
        </section>

        {/* mobile contact card */}
        <section className="mt-4 md:hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </span>
            <div className="flex-1">
              <h2 className="text-sm font-extrabold">Need something custom?</h2>
              <p className="mt-0.5 text-xs text-zinc-400">Contact our team for special pricing.</p>
            </div>
          </div>
          <a href="mailto:hello@linkos.app" className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 py-2.5 text-sm font-bold transition-colors">
            <Globe className="w-4 h-4" /> Contact Us <ArrowRight className="w-4 h-4" />
          </a>
        </section>

        {/* ── Comparison table ── */}
        <section className="mt-12" aria-label="Compare all features">
          <h2 className="text-xl font-extrabold">Compare all features</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="bg-white/[0.05] text-left">
                  <th scope="col" className="px-4 py-3 text-xs font-bold text-zinc-300">Features</th>
                  {PLANS.map((p) => (
                    <th key={p.id} scope="col" className="px-4 py-3 text-center text-xs font-bold text-zinc-300">{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.label} className={`border-t border-white/5 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                    <th scope="row" className="px-4 py-2.5 text-left text-xs font-medium text-zinc-300">{row.label}</th>
                    {row.values.map((v, vi) => (
                      <td key={vi} className="px-4 py-2.5 text-center"><CellValue v={v} /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Add-ons ── */}
        <section className="mt-12" aria-label="Add-ons">
          <h2 className="text-xl font-extrabold">Add-ons <span className="text-zinc-400 font-bold">(Optional)</span></h2>
          <p className="mt-1 text-sm text-zinc-400">Enhance your page with powerful add-ons.</p>
          <div className="mt-4 grid sm:grid-cols-3 gap-4">
            {ADD_ONS.map((a) => (
              <div key={a.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col">
                <div className="flex items-start gap-3">
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${a.bg}`}>
                    <a.icon className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-extrabold">{a.name}</h3>
                    <p className="mt-0.5 text-sm font-bold inline-flex items-center gap-0.5">
                      <IndianRupee className="w-3.5 h-3.5" aria-label="Rupees" />{a.price}
                      <span className="text-xs font-normal text-zinc-400">/ month</span>
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-zinc-400 flex-1">{a.text}</p>
                <button type="button" className="mt-4 inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 py-2 text-xs font-bold transition-colors">
                  Add Now
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="mt-12" aria-label="Testimonials">
          <h2 className="text-xl font-extrabold">What business owners say</h2>
          <p className="mt-1 text-sm text-zinc-400">Real stories from real businesses using LinkOS.</p>
          <div className="mt-4 grid sm:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <blockquote className="text-sm text-zinc-200 leading-relaxed">“{t.text}”</blockquote>
                <figcaption className="mt-4 flex items-center gap-3">
                  <img src={t.photo} alt="" className="w-10 h-10 rounded-full object-cover" loading="lazy" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{t.name}</p>
                    <p className="text-[11px] text-zinc-400 truncate">{t.business}</p>
                  </div>
                </figcaption>
                <div className="mt-2 flex gap-0.5" aria-label="5 out of 5 stars">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </figure>
            ))}
          </div>
        </section>

        {/* ── CTA banner ── */}
        <section className="my-12 relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-r from-[#0A1224] via-[#0B1B3A] to-[#0A1224] p-8 sm:p-10">
          <div className="absolute -top-16 right-10 w-56 h-56 rounded-full bg-blue-600/20 blur-[80px]" aria-hidden="true" />
          <div className="relative flex flex-col sm:flex-row items-center gap-6">
            <span className="hidden sm:flex w-24 h-24 rounded-full border border-blue-400/30 bg-blue-500/10 items-center justify-center shrink-0" aria-hidden="true">
              <span className="font-serif italic text-blue-200 text-sm text-center leading-tight -rotate-6">Your<br />Business<br />Online<br />Today</span>
            </span>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-extrabold">Ready to create your page?</h2>
              <p className="mt-1.5 text-sm text-zinc-400">Join thousands of businesses already growing with LinkOS.</p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-amber-300"><Zap className="w-3.5 h-3.5" /> No credit card required</p>
            </div>
            <Link to="/signup" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-3 text-sm font-bold transition-colors shrink-0">
              Create Your Free Page <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 bg-[#04070F]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row md:items-center gap-6">
          <div>
            <LinkOsLogo tone="light" />
            <p className="mt-1.5 text-xs text-zinc-500">Local Businesses. Stronger Together.</p>
          </div>
          <div className="md:ml-auto flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
            <div className="flex items-center gap-3 text-zinc-400">
              {[Facebook, Twitter, Instagram, Youtube, Linkedin].map((Icon, i) => (
                <a key={i} href="#" aria-label="Social link" className="hover:text-white transition-colors"><Icon className="w-5 h-5" /></a>
              ))}
            </div>
            <nav className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-zinc-400">
              <Link to="/about" className="hover:text-white transition-colors">About</Link>
              <a href="#" className="hover:text-white transition-colors">Blog</a>
              <a href="mailto:hello@linkos.app" className="hover:text-white transition-colors">Contact</a>
              <a href="#" className="hover:text-white transition-colors">Help Center</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </nav>
          </div>
        </div>
        <div className="border-t border-white/5">
          <p className="max-w-6xl mx-auto px-4 sm:px-6 py-3 text-[11px] text-zinc-600 text-center">© 2024 LinkOS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
