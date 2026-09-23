import { PublicNavbar } from '../components/common/PublicNavbar';
import { MobileTabBar } from '../components/common/MobileTabBar';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Zap, Link2, BarChart3, LayoutGrid, Users, Play, Palette, Sparkles,
  Smartphone, Globe, Wrench, CreditCard, Star, Share2, Search, ShieldCheck, Headphones,
  ChevronRight, Facebook, Twitter, Instagram, Youtube, Linkedin, Check, Pencil, Settings,
  Image as ImageIcon, Eye,
} from 'lucide-react';
import { LinkOsLogo } from '../components/common/LinkOsLogo';

const HERO_STATS = [
  { value: '50+', label: 'Professional Templates', cls: 'text-blue-400' },
  { value: '10K+', label: 'Businesses Online', cls: 'text-white' },
  { value: '99.9%', label: 'Uptime & Security', cls: 'text-blue-400' },
  { value: '24/7', label: 'Customer Support', cls: 'text-teal-300' },
];

const FEATURES = [
  { icon: LayoutGrid, name: 'Stunning Templates', text: 'Choose from 50+ professional designs for every business type.', link: '50+ Templates', to: '/templates', bg: 'bg-blue-500 text-white' },
  { icon: Sparkles, name: 'Easy Customization', text: 'Update text, images, colors and more — no coding needed.', link: 'Drag & Drop Editor', to: '/features', bg: 'bg-emerald-500 text-white' },
  { icon: Globe, name: 'Custom Domain', text: 'Connect your own domain and build your brand.', link: 'Use Your Domain', to: '/features', bg: 'bg-rose-500 text-white' },
  { icon: Smartphone, name: 'Mobile Responsive', text: 'Your website looks perfect on all devices.', link: 'Desktop · Tablet · Mobile', to: '/features', bg: 'bg-purple-500 text-white' },
  { icon: Wrench, name: 'Business Tools', text: 'Add contact, WhatsApp, maps, booking, menus, products and more.', link: 'All-in-One Solution', to: '/features', bg: 'bg-amber-500 text-white' },
  { icon: BarChart3, name: 'Analytics & Insights', text: 'Track visitors, views and customer engagement.', link: 'Grow Smarter', to: '/features', bg: 'bg-blue-500 text-white' },
  { icon: CreditCard, name: 'Payment Integration', text: 'Accept payments via UPI, Razorpay, Stripe and more.', link: 'Get Paid Easily', to: '/features', bg: 'bg-emerald-500 text-white' },
  { icon: Star, name: 'Reviews & Ratings', text: 'Build trust with customer reviews and testimonials.', link: 'Build Trust', to: '/features', bg: 'bg-rose-500 text-white' },
  { icon: Share2, name: 'Social Media Links', text: 'Connect all your social profiles in one place.', link: 'Grow Your Audience', to: '/features', bg: 'bg-purple-500 text-white' },
  { icon: Search, name: 'SEO Optimized', text: 'Get found on Google and attract more customers.', link: 'Rank Higher', to: '/features', bg: 'bg-teal-500 text-white' },
  { icon: ShieldCheck, name: 'Secure & Reliable', text: 'Fast, secure and always online with 99.9% uptime.', link: 'Your Data is Safe', to: '/features', bg: 'bg-blue-500 text-white' },
  { icon: Headphones, name: '24/7 Support', text: 'We\'re here whenever you need help.', link: 'Get Help Anytime', to: '/help/contact', bg: 'bg-orange-500 text-white' },
];

const TRUSTED_AVATARS = ['/images/about/team-asik.webp', '/images/about/team-nadia.webp', '/images/about/team-rafid.webp'];

/* Editor-window collage shown on the hero's right side — pure CSS + existing images */
const EditorCollage = () => (
  <div className="relative hidden md:block" aria-hidden="true">
    {/* side toolbar */}
    <div className="absolute -left-16 top-6 z-10 flex flex-col gap-2.5 rounded-2xl border border-white/10 bg-[#0A1224]/95 p-2.5 shadow-xl shadow-black/40">
      {[Pencil, Settings, ImageIcon, Eye].map((Icon, i) => (
        <span key={i} className="flex w-9 h-9 rounded-xl bg-white/5 items-center justify-center text-zinc-300">
          <Icon className="w-4 h-4" />
        </span>
      ))}
    </div>

    {/* main editor window */}
    <div className="w-[420px] rounded-2xl border border-white/10 bg-[#0B1424] shadow-2xl shadow-black/50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
        <span className="text-[11px] font-semibold text-zinc-300">Your Business</span>
        <span className="text-[10px] text-zinc-500">linkos.app/urbanbrew</span>
      </div>
      <div className="p-4 space-y-3">
        <div className="rounded-xl overflow-hidden border border-white/10">
          <img src="/images/cafe/cover.webp" alt="" className="w-full h-36 object-cover" />
          <div className="bg-[#0E1930] px-3 py-2.5">
            <p className="text-sm font-bold text-white leading-tight">Good Coffee<br />Better Days.</p>
            <div className="mt-2 flex gap-2">
              <span className="rounded-md bg-amber-400 px-2.5 py-1 text-[10px] font-bold text-[#1a1300]">Order Now</span>
              <span className="rounded-md border border-white/15 px-2.5 py-1 text-[10px] font-semibold text-zinc-300">About Us</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {['Menu', 'Gallery', 'Contact'].map((s) => (
            <div key={s} className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-2 text-center text-[10px] font-semibold text-zinc-300">{s}</div>
          ))}
        </div>
      </div>
    </div>

    {/* change image popup */}
    <div className="absolute -right-14 top-16 z-10 w-44 rounded-xl border border-white/10 bg-[#0A1224]/95 p-3 shadow-xl shadow-black/40">
      <p className="text-[10px] font-semibold text-zinc-300">Change Image</p>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {['/images/cards/office.png', '/images/cards/portfolio.png', '/images/cafe/cover.webp'].map((src, i) => (
          <img key={i} src={src} alt="" className="h-9 w-full rounded-md object-cover" />
        ))}
      </div>
    </div>

    {/* live badge */}
    <div className="absolute -right-6 top-8 z-10 flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      <span className="text-[10px] font-bold text-emerald-300">Live</span>
    </div>

    {/* publish button */}
    <div className="absolute -right-10 bottom-14 z-10 rounded-lg bg-emerald-500 px-4 py-2 text-[11px] font-bold text-white shadow-lg shadow-emerald-500/30">Publish</div>

    {/* link chip */}
    <div className="absolute -bottom-5 right-2 z-10 flex items-center gap-2 rounded-full border border-white/15 bg-[#0A1224] px-4 py-2 shadow-xl shadow-black/40">
      <Link2 className="w-3.5 h-3.5 text-blue-400" />
      <span className="text-[11px] font-semibold text-zinc-200">linkos.app/yourname</span>
    </div>

    {/* handwritten note */}
    <div className="absolute -top-10 -right-6 text-right font-serif italic text-blue-100/90 -rotate-6 text-sm leading-snug">
      <svg viewBox="0 0 40 24" className="inline w-6 h-4 fill-none stroke-blue-400 mr-1" strokeWidth="2" strokeLinecap="round"><path d="M34 4 C 20 6, 10 10, 4 20" /><path d="M4 12 L 3 21 L 12 20" /></svg>
      From Idea<br />
      to Live Website<br />
      in Minutes!
    </div>
  </div>
);

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#060D1A] text-white font-sans">
      <PublicNavbar />

      {/* ── Hero ── */}
      <div className="relative bg-[#04070F] overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-600/20 blur-[100px]" aria-hidden="true" />
        <div className="absolute top-64 right-0 w-72 h-72 rounded-full bg-blue-500/10 blur-[90px]" aria-hidden="true" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="md:grid md:grid-cols-[1.05fr_1fr] md:gap-8 md:items-center pt-10 md:pt-14 pb-10">
            {/* copy */}
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
                <Zap className="w-3.5 h-3.5" /> FEATURES
              </span>
              <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.08] text-balance">
                Everything You Need<br className="hidden sm:block" /> to{' '}
                <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Grow Your Business</span>
              </h1>
              <p className="mt-4 text-sm sm:text-base text-zinc-400 leading-relaxed max-w-lg">
                Powerful features, simple tools, and modern templates — all in one place. No coding. Just results.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link to="/signup" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-7 py-3.5 text-sm font-bold transition-colors shadow-lg shadow-blue-600/30">
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Link>
                <button type="button" onClick={() => document.getElementById('all-features')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-7 py-3.5 text-sm font-bold transition-colors">
                  <span className="flex w-6 h-6 rounded-full bg-white items-center justify-center">
                    <Play className="w-3 h-3 fill-[#04070F] text-[#04070F]" />
                  </span>
                  Watch Video
                </button>
              </div>
            </div>

            <EditorCollage />
          </div>

          {/* stats bar */}
          <div className="grid grid-cols-4 border-t border-white/10">
            {HERO_STATS.map((s, i) => (
              <div key={s.label} className={`flex flex-col items-center gap-0.5 py-6 px-2 text-center ${i > 0 ? 'border-l border-white/10' : ''}`}>
                <span className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${s.cls}`}>{s.value}</span>
                <span className="text-[10px] sm:text-xs text-zinc-500">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── All features (light section) ── */}
      <section id="all-features" className="bg-[#F5F7FB] text-[#0B1424] scroll-mt-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-20">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/25 bg-blue-500/10 px-3.5 py-1 text-[11px] font-bold tracking-wide text-blue-600">
              <Zap className="w-3 h-3" /> POWERFUL FEATURES <Zap className="w-3 h-3" />
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight text-balance">
              All the Tools You Need<br />in <span className="text-blue-600">One Platform</span>
            </h2>
            <p className="mt-3 text-sm md:text-[15px] text-slate-500 leading-relaxed max-w-xl mx-auto">
              From managing your business to reaching more customers — LinkOS gives you everything to build, launch, and grow online.
            </p>
          </div>

          {/* desktop: 4-col cards · mobile: vertical list rows */}
          <div className="mt-10 hidden md:grid grid-cols-4 gap-4">
            {FEATURES.map((f) => (
              <div key={f.name} className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                <span className={`inline-flex w-11 h-11 rounded-xl items-center justify-center ${f.bg}`}>
                  <f.icon className="w-6 h-6" />
                </span>
                <h3 className="mt-3.5 font-bold text-[15px]">{f.name}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500 min-h-[60px]">{f.text}</p>
                <Link to={f.to} className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-bold text-blue-600 hover:text-blue-500 transition-colors">
                  {f.link} <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-8 md:hidden space-y-3">
            {FEATURES.map((f) => (
              <Link key={f.name} to={f.to} className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm active:scale-[0.99] transition-transform">
                <span className={`flex w-11 h-11 rounded-xl items-center justify-center shrink-0 ${f.bg}`}>
                  <f.icon className="w-5 h-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-bold text-[15px]">{f.name}</span>
                  <span className="mt-0.5 block text-[12.5px] leading-snug text-slate-500">{f.text}</span>
                </span>
                <ChevronRight className="w-5 h-5 text-slate-400 shrink-0 ml-auto" />
              </Link>
            ))}
          </div>

          {/* mobile CTA pair */}
          <div className="mt-8 md:hidden space-y-2.5">
            <Link to="/signup" className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/templates" className="flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-[#0B1424]">
              View All Features
            </Link>
          </div>
        </div>
      </section>

      {/* ── Dark CTA band ── */}
      <section className="bg-[#04070F] border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="md:flex md:items-center md:gap-10">
            <p className="hidden md:block font-serif italic text-blue-100/90 -rotate-6 text-lg shrink-0" aria-hidden="true">
              Ready to<br />Get Started?
            </p>
            <div className="text-center md:flex-1">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Start Building Your Website Today</h2>
              <p className="mt-2 text-sm text-zinc-400">Join thousands of businesses already growing with LinkOS.</p>
              <div className="mt-5 flex flex-col sm:flex-row justify-center gap-3">
                <Link to="/signup" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-7 py-3 text-sm font-bold transition-colors shadow-lg shadow-blue-600/30">
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/templates" className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-7 py-3 text-sm font-bold transition-colors">
                  View Templates
                </Link>
              </div>
            </div>
            <div className="hidden md:flex flex-col items-center gap-2 shrink-0">
              <div className="flex -space-x-3" aria-hidden="true">
                {TRUSTED_AVATARS.map((p) => (
                  <img key={p} src={p} alt="" className="w-10 h-10 rounded-full border-2 border-[#04070F] object-cover" />
                ))}
              </div>
              <p className="text-[11px] text-zinc-400 text-center">Trusted by 10,000+<br />business owners</p>
            </div>
          </div>
          <p className="mt-6 md:hidden flex items-center justify-center gap-1.5 text-xs text-zinc-500">
            <Check className="w-3.5 h-3.5 text-emerald-400" /> Join 10,000+ businesses already using LinkOS.
          </p>
        </div>
      </section>

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
              <Link to="/resources" className="hover:text-white transition-colors">Blog</Link>
              <Link to="/help/contact" className="hover:text-white transition-colors">Contact</Link>
              <Link to="/help" className="hover:text-white transition-colors">Help Center</Link>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </nav>
          </div>
        </div>
        <div className="border-t border-white/5">
          <p className="max-w-6xl mx-auto px-4 sm:px-6 py-3 text-[11px] text-zinc-600 text-center">© 2024 LinkOS. All rights reserved.</p>
        </div>
      </footer>

      <MobileTabBar active="Features" />
    </div>
  );
}
