import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Search,
  Menu,
  Zap,
  Play,
  Star,
  Users,
  Eye,
  Globe,
  UtensilsCrossed,
  Coffee,
  Scissors,
  Car,
  ShoppingBag,
  LayoutGrid,
  UserPlus,
  Paintbrush,
  Share2,
  Heart,
  BadgeCheck,
  MapPin,
  MessageCircle,
  Phone,
  Navigation,
} from 'lucide-react';
import { LinkOsLogo } from '../components/common/LinkOsLogo';
import { PublicNavbar } from '../components/common/PublicNavbar';

const CATEGORIES = [
  { icon: UtensilsCrossed, label: 'Restaurants', color: 'text-amber-400' },
  { icon: Coffee, label: 'Cafés', color: 'text-orange-300' },
  { icon: Scissors, label: 'Salons', color: 'text-pink-400' },
  { icon: Car, label: 'Car Services', color: 'text-sky-400' },
  { icon: ShoppingBag, label: 'Retail Shops', color: 'text-rose-400' },
  { icon: LayoutGrid, label: 'More', color: 'text-emerald-400' },
];

const TEMPLATE_CARDS = [
  { img: '/images/cafe/cover.webp', title: 'Café & Restaurant', count: '12+ Templates', to: '/templates' },
  { img: '/images/cards/salon.webp', title: 'Salon & Beauty', count: '10+ Templates', to: '/templates' },
  { img: '/images/cards/car.webp', title: 'Car & Bike Service', count: '8+ Templates', to: '/templates' },
];

const STATS = [
  { icon: Users, top: '10K+', sub: 'Active Businesses' },
  { icon: Eye, top: '1M+', sub: 'Monthly Visitors' },
  { icon: Star, top: '4.8/5', sub: 'Average Rating' },
  { icon: Globe, top: '50+', sub: 'Business Categories' },
];

const STEPS = [
  {
    n: '1',
    icon: UserPlus,
    title: 'Create Account',
    description: 'Sign up for free and get started.',
  },
  {
    n: '2',
    icon: Paintbrush,
    title: 'Customize',
    description: 'Add your business details, photos, menu and more.',
  },
  {
    n: '3',
    icon: Share2,
    title: 'Share Your Link',
    description: 'Go live and share your LinkOS page with your customers.',
  },
];

const POPULAR_ITEMS = [
  { img: '/images/cafe/cappuccino.webp', name: 'Cappuccino', price: '₹120' },
  { img: '/images/cafe/burger.webp', name: 'Classic Burger', price: '₹180' },
  { img: '/images/cafe/fries.webp', name: 'French Fries', price: '₹99' },
];

/* Mini phone mockup showing the Urban Brew Café page */
const HeroPhone: React.FC = () => (
  <div className="relative w-[270px] sm:w-[300px] mx-auto">
    <div className="rounded-[2.4rem] border-[6px] border-[#1E293B] bg-[#0B0F14] overflow-hidden shadow-[0_40px_80px_-24px_rgba(37,99,235,0.45)] ring-1 ring-white/10">
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-1.5">
          <LinkOsLogo size="sm" tone="light" />
        </div>
        <div className="flex items-center gap-2 text-zinc-400">
          <Search className="w-3.5 h-3.5" />
          <Share2 className="w-3.5 h-3.5" />
        </div>
      </div>
      <div className="relative h-24">
        <img src="/images/cafe/cover.webp" alt="Urban Brew Café cover" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14] via-transparent to-transparent" />
      </div>
      <div className="px-3.5 -mt-6 relative pb-4">
        <div className="relative w-14 h-14 rounded-full border-[3px] border-[#0B0F14] overflow-hidden bg-[#141B24]">
          <img src="/images/cafe/logo.webp" alt="Urban Brew Café logo" className="w-full h-full object-cover" />
        </div>
        <p className="mt-1.5 text-sm font-extrabold text-white">Urban Brew Café</p>
        <p className="mt-0.5 text-[9px] text-zinc-300 flex items-center gap-1">
          <UtensilsCrossed className="w-2.5 h-2.5" /> Café &amp; Restaurant
          <span className="text-zinc-600">•</span>
          <span className="text-emerald-400 font-semibold inline-flex items-center gap-0.5"><BadgeCheck className="w-2.5 h-2.5" /> Verified</span>
        </p>
        <p className="mt-0.5 text-[9px] text-zinc-400 flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> Berhampore, West Bengal</p>
        <p className="mt-1 text-[9px] leading-snug text-zinc-300">Great coffee, delicious food and a cozy ambience. Your everyday escape.</p>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          <span className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-emerald-500 text-[#05210F] text-[8px] font-bold"><MessageCircle className="w-2.5 h-2.5" /> WhatsApp</span>
          <span className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[#1A2330] text-white text-[8px] font-bold"><Phone className="w-2.5 h-2.5" /> Call</span>
          <span className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[#1A2330] text-white text-[8px] font-bold"><Navigation className="w-2.5 h-2.5" /> Directions</span>
        </div>
        <div className="mt-2.5 flex gap-3 border-b border-white/5 text-[9px] font-semibold">
          <span className="pb-1 text-white border-b-2 border-sky-400">Menu</span>
          <span className="pb-1 text-zinc-500">About</span>
          <span className="pb-1 text-zinc-500">Gallery</span>
          <span className="pb-1 text-zinc-500">Reviews</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-[9px] font-bold text-white">Popular Items</p>
          <p className="text-[8px] font-semibold text-sky-400">View All →</p>
        </div>
        <div className="mt-1.5 flex gap-1.5">
          {POPULAR_ITEMS.map((item) => (
            <div key={item.name} className="flex-1 rounded-lg overflow-hidden bg-[#121924] border border-white/5">
              <img src={item.img} alt={item.name} className="w-full h-10 object-cover" />
              <div className="p-1">
                <p className="text-[7px] font-bold text-white truncate">{item.name}</p>
                <p className="text-[7px] font-bold text-emerald-400">{item.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Handwritten annotation */}
    <div className="hidden md:block absolute -left-44 top-2 w-40 pointer-events-none" aria-hidden="true">
      <p className="font-serif italic text-[15px] leading-snug text-sky-100/90 -rotate-6">
        One Link Everything your customers need
      </p>
      <svg viewBox="0 0 60 40" className="w-12 h-8 ml-16 mt-1 stroke-sky-200/80 fill-none" strokeWidth="1.5" strokeLinecap="round">
        <path d="M4 4 C 20 10, 40 18, 52 32" />
        <path d="M44 30 L 53 33 L 50 24" />
      </svg>
    </div>
  </div>
);

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#060D1A] text-white font-sans">
      <PublicNavbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(700px 420px at 12% 8%, rgba(37,99,235,0.35), transparent 65%), radial-gradient(500px 320px at 85% 30%, rgba(37,99,235,0.18), transparent 60%)',
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-14 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-200">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              Your Business. One Link.
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl md:text-[3.4rem] font-extrabold leading-[1.08] tracking-tight text-balance">
              Turn Your Business Into a Beautiful{' '}
              <span className="text-[#3B82F6]">Online Page</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-zinc-300 max-w-md leading-relaxed text-pretty">
              LinkOS helps local businesses create a powerful online presence with a
              single link. No coding. No hassle. Just results.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3 max-w-md">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-bold shadow-[0_16px_32px_-12px_rgba(37,99,235,0.7)] transition-colors"
              >
                Create Your Page
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-sm font-bold transition-colors"
              >
                <span className="w-6 h-6 rounded-full border border-white/40 flex items-center justify-center">
                  <Play className="w-2.5 h-2.5 fill-white" />
                </span>
                Watch Demo
              </a>
            </div>
            <div className="mt-7 flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {['A', 'R', 'M', 'S'].map((ch, i) => (
                  <span
                    key={ch}
                    className="w-9 h-9 rounded-full border-2 border-[#0A1428] flex items-center justify-center text-[11px] font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${['#2563EB', '#0EA5E9', '#7C3AED', '#059669'][i]}, ${['#1D4ED8', '#0284C7', '#6D28D9', '#047857'][i]})` }}
                  >
                    {ch}
                  </span>
                ))}
              </div>
              <p className="text-xs text-zinc-300 leading-snug">
                <span className="font-bold text-white">10K+ businesses</span>
                <br />
                already online with LinkOS
              </p>
            </div>
          </div>
          <div className="relative flex justify-center md:justify-end">
            <HeroPhone />
          </div>
        </div>

        {/* CATEGORY CHIPS */}
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pb-12">
          <div className="rounded-2xl bg-[#0D1B2E]/90 border border-white/5 backdrop-blur px-3 py-4 grid grid-cols-3 sm:grid-cols-6 gap-2">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                to="/templates"
                className="flex flex-col items-center gap-1.5 py-2 rounded-xl hover:bg-white/5 transition-colors"
              >
                <cat.icon className={`w-6 h-6 ${cat.color}`} />
                <span className="text-[11px] font-medium text-zinc-300">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TEMPLATES */}
      <section className="bg-white text-[#0B1220] rounded-t-[2rem]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-balance max-w-md">
              Ready-to-use templates for every business
            </h2>
            <Link
              to="/templates"
              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-50 text-sky-700 text-xs font-bold hover:bg-sky-100 transition-colors"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="mt-7 grid sm:grid-cols-3 gap-4">
            {TEMPLATE_CARDS.map((card) => (
              <Link
                key={card.title}
                to={card.to}
                className="group rounded-2xl border border-zinc-200 bg-white overflow-hidden hover:shadow-[0_20px_40px_-20px_rgba(11,18,32,0.25)] transition-shadow"
              >
                <div className="h-36 overflow-hidden">
                  <img
                    src={card.img}
                    alt={`${card.title} template`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">{card.title}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{card.count}</p>
                  </div>
                  <span className="w-8 h-8 rounded-full bg-[#0B1220] text-white flex items-center justify-center group-hover:bg-[#2563EB] transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-[#060D1A]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-3">
          {STATS.map((stat) => (
            <div key={stat.sub} className="rounded-2xl bg-[#0D1B2E] border border-white/5 px-4 py-5 flex items-center gap-3.5">
              <span className="w-11 h-11 rounded-xl bg-[#2563EB]/15 flex items-center justify-center shrink-0">
                <stat.icon className="w-5 h-5 text-[#3B82F6]" />
              </span>
              <div>
                <p className="text-xl font-extrabold leading-none">{stat.top}</p>
                <p className="mt-1 text-[11px] text-zinc-400 leading-tight">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3 STEPS */}
      <section id="how" className="bg-white text-[#0B1220] rounded-t-[2rem] -mt-4 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Get online in 3 simple steps</h2>
          <p className="mt-2 text-sm text-zinc-500">No technical skills needed. Just a few clicks and you&apos;re live.</p>

          <div className="mt-8 grid md:grid-cols-3 gap-4">
            {STEPS.map((step, i) => (
              <React.Fragment key={step.n}>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-5">
                  <div className="flex items-start justify-between">
                    <span className="w-9 h-9 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-sm font-extrabold">
                      {step.n}
                    </span>
                    <span className="w-11 h-11 rounded-xl bg-sky-50 flex items-center justify-center">
                      <step.icon className="w-5 h-5 text-[#2563EB]" />
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-bold">{step.title}</h3>
                  <p className="mt-1.5 text-[13px] text-zinc-500 leading-relaxed text-pretty">{step.description}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div aria-hidden="true" className="hidden md:flex items-center justify-center -mx-4 relative z-10">
                    <span className="w-8 h-8 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-zinc-400" />
                    </span>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          <Link
            to="/signup"
            className="mt-9 w-full inline-flex items-center justify-center gap-2 py-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-bold shadow-[0_16px_32px_-12px_rgba(37,99,235,0.7)] transition-colors"
          >
            Create Your Free Page
            <ArrowRight className="w-4 h-4" />
          </Link>

          <p className="mt-6 text-center text-xs text-zinc-500 flex items-center justify-center gap-1.5">
            Local Businesses. Stronger Together.
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </section>
    </div>
  );
};
