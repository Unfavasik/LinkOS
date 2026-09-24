import { PublicNavbar } from '../components/common/PublicNavbar';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Menu, ChevronRight, ArrowRight, Play, Users, Eye, Star, Globe,
  Rocket, Zap, UsersRound, User, TrendingUp, Heart, Coffee, Scissors, Car,
  Quote, Info, BadgeCheck, MapPin, MessageCircle, Phone, Navigation, Link2,
} from 'lucide-react';
import { LinkOsLogo } from '../components/common/LinkOsLogo';
import { FullscreenMenu } from '../components/common/FullscreenMenu';

const Pill = ({ children, dark = false }: { children: ReactNode; dark?: boolean }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
      dark ? 'border-blue-400/30 bg-blue-500/10 text-blue-300' : 'border-blue-200 bg-blue-50 text-blue-600'
    }`}
  >
    <Info className="w-3.5 h-3.5" />
    {children}
  </span>
);

export const PhoneMockup = () => (
  <div className="w-[172px] shrink-0 rotate-[8deg] rounded-[22px] border-[5px] border-black bg-[#0B0B0D] shadow-2xl shadow-blue-900/40 overflow-hidden text-white">
    {/* mini header */}
    <div className="flex items-center justify-between px-2.5 py-1.5">
      <span className="flex items-center gap-1 text-[9px] font-bold">
        <Link2 className="w-2.5 h-2.5 -rotate-45 text-blue-400" /> Link<span className="text-zinc-400 font-medium">OS</span>
      </span>
      <span className="text-[7px] text-zinc-500">9:41</span>
    </div>
    {/* cover */}
    <div className="relative h-20">
      <img src="/images/about/cafe-cover.webp" alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] to-transparent" />
      <p className="absolute top-1.5 right-2 font-serif italic text-[8px] leading-tight text-amber-100/90 text-right -rotate-3">
        Good Food<br />Better Mood
      </p>
      <div className="absolute -bottom-3 left-2.5 w-9 h-9 rounded-full border-2 border-[#0B0B0D] bg-amber-900 flex items-center justify-center">
        <Coffee className="w-4 h-4 text-amber-200" />
      </div>
    </div>
    <div className="px-2.5 pt-4 pb-2">
      <p className="text-[11px] font-extrabold flex items-center gap-1">
        Urban Brew Café <BadgeCheck className="w-3 h-3 text-emerald-500" />
      </p>
      <p className="text-[7px] text-zinc-400 flex items-center gap-0.5 mt-0.5">
        <MapPin className="w-2 h-2" /> Berhampore, West Bengal
      </p>
      <p className="text-[7px] text-zinc-500 mt-1 leading-snug">Great coffee, delicious food and a cozy ambiance. Your everyday escape.</p>
      <div className="mt-1.5 grid grid-cols-3 gap-1">
        <span className="rounded-md bg-[#22C55E] py-1 text-center text-[7px] font-bold flex items-center justify-center gap-0.5">
          <MessageCircle className="w-2 h-2" /> WhatsApp
        </span>
        <span className="rounded-md border border-white/15 py-1 text-center text-[7px] font-bold flex items-center justify-center gap-0.5">
          <Phone className="w-2 h-2" /> Call
        </span>
        <span className="rounded-md border border-white/15 py-1 text-center text-[7px] font-bold flex items-center justify-center gap-0.5">
          <Navigation className="w-2 h-2" /> Directions
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2 border-b border-white/10 pb-1 text-[7px] text-zinc-400">
        <span className="text-white font-semibold border-b border-white pb-0.5">Menu</span>
        <span>About</span><span>Gallery</span><span>Reviews</span>
      </div>
      <div className="mt-1.5 flex items-center justify-between">
        <p className="text-[8px] font-bold">Popular Items</p>
        <p className="text-[7px] text-blue-400">View All →</p>
      </div>
      <div className="mt-1 grid grid-cols-3 gap-1">
        {[
          { src: '/images/about/food-cappuccino.webp', name: 'Cappuccino', price: '₹120' },
          { src: '/images/about/food-burger.webp', name: 'Classic Burger', price: '₹180' },
          { src: '/images/about/food-fries.webp', name: 'French Fries', price: '₹90' },
        ].map((f) => (
          <div key={f.name} className="rounded-md overflow-hidden bg-white/5">
            <img src={f.src} alt={f.name} className="w-full h-9 object-cover" />
            <div className="p-1">
              <p className="text-[6px] font-semibold truncate">{f.name}</p>
              <p className="text-[6px] text-amber-300">{f.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const heroStats = [
  { icon: Users, top: '10K+', sub: 'Businesses' },
  { icon: Eye, top: '1M+', sub: 'Monthly Visitors' },
  { icon: Star, top: '4.8/5', sub: 'User Rating' },
  { icon: Globe, top: '50+', sub: 'Business Categories' },
];

const features = [
  { icon: Rocket, title: 'Simple', text: 'No coding. No hassle. Just results.', bg: 'bg-blue-100 text-blue-600' },
  { icon: Globe, title: 'Beautiful', text: 'Professionally designed templates.', bg: 'bg-purple-100 text-purple-600' },
  { icon: Zap, title: 'Powerful', text: 'All your business info in one link.', bg: 'bg-amber-100 text-amber-600' },
  { icon: UsersRound, title: 'For Everyone', text: 'Built for local businesses, freelancers and creators.', bg: 'bg-sky-100 text-sky-600' },
];

const missionItems = [
  { icon: User, title: 'Accessibility', text: 'Simple tools for everyone' },
  { icon: TrendingUp, title: 'Growth', text: 'Help businesses grow' },
  { icon: Heart, title: 'Trust', text: 'Transparent & reliable', red: true },
  { icon: Globe, title: 'Global Impact', text: 'Stronger local communities' },
];

const journey = [
  { year: '2024', title: 'The Beginning', text: 'LinkOS was founded with a vision to simplify online presence for local businesses.', active: true },
  { year: '2025', title: 'Growing Together', text: '10K+ businesses joined. New templates and features launched.', active: false },
  { year: '2026', title: 'Bigger Impact Ahead', text: 'Expanding to more businesses, more tools, and a global community.', active: false },
];

const team = [
  { photo: '/images/about/team-asik.webp', name: 'Asik Iqbal', role: 'Founder & CEO' },
  { photo: '/images/about/team-nadia.webp', name: 'Nadia Rahman', role: 'Product' },
  { photo: '/images/about/team-rafid.webp', name: 'Rafid Hasan', role: 'Design' },
  { photo: '/images/about/team-samira.webp', name: 'Samira Akter', role: 'Community' },
];

const trustedBusinesses = [
  { icon: Coffee, name: 'Urban Brew Café', type: 'Café & Restaurant', bg: 'bg-amber-100 text-amber-700' },
  { icon: Scissors, name: 'Glow Studio', type: 'Salon & Beauty', bg: 'bg-purple-100 text-purple-700' },
  { icon: Car, name: 'DriveHub', type: 'Car Service', bg: 'bg-blue-100 text-blue-700' },
];

export default function AboutPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* ── Dark hero ── */}
      <div className="relative bg-[#04070F] overflow-hidden">
        {/* glow accents */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-600/20 blur-[100px]" aria-hidden="true" />
        <div className="absolute top-40 right-0 w-72 h-72 rounded-full bg-blue-500/10 blur-[90px]" aria-hidden="true" />

        <div className="relative max-w-lg md:max-w-5xl mx-auto px-4">
          {/* breadcrumb */}
          <nav aria-label="Breadcrumb" className="mt-2 flex items-center gap-1.5 text-sm text-zinc-400">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-white font-medium">About</span>
          </nav>

          {/* hero content + phone — stacked on mobile, side by side on desktop */}
          <div className="relative mt-5 pb-6 md:flex md:items-center md:justify-between md:gap-12 md:pb-10">
            <div className="max-w-[60%] md:max-w-md">
              <Pill dark>Our Story</Pill>
              <h1 className="mt-3 text-[26px] md:text-[40px] leading-[1.12] font-extrabold tracking-tight text-white">
                Built for<br />
                <span className="text-blue-500">Real Businesses</span>
              </h1>
              <p className="mt-3 text-sm md:text-[15px] leading-relaxed text-zinc-400">
                LinkOS helps local businesses create a beautiful online presence with a single link. Simple, powerful and made for everyone.
              </p>
              <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
                <Link to="/signup" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-3 text-sm font-bold text-white transition-colors w-fit">
                  Create Your Page <ArrowRight className="w-4 h-4" />
                </Link>
                <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-6 py-3 text-sm font-bold text-white transition-colors w-fit">
                  <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                    <Play className="w-2.5 h-2.5 fill-[#04070F] text-[#04070F]" />
                  </span>
                  Watch Video
                </button>
              </div>
            </div>
            <div className="mt-6 md:mt-0 flex justify-center md:block pointer-events-none">
              <PhoneMockup />
            </div>
          </div>

          {/* stats */}
          <div className="relative grid grid-cols-4 gap-2 md:gap-10 border-t border-white/10 py-4 md:py-6">
            {heroStats.map((s) => (
              <div key={s.sub} className="flex flex-col items-center gap-1 text-center">
                <s.icon className="w-5 h-5 text-blue-400" />
                <p className="text-sm md:text-base font-extrabold text-white leading-none">{s.top}</p>
                <p className="text-[9px] md:text-xs text-zinc-500 leading-tight">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Light content ── */}
      <main className="relative -mt-4 rounded-t-3xl bg-white">
        <div className="max-w-lg md:max-w-4xl mx-auto px-4">
          {/* About section */}
          <section className="pt-8">
            <Pill>About LinkOS</Pill>
            <h2 className="mt-3 text-[26px] md:text-[32px] leading-tight font-extrabold tracking-tight text-zinc-900">
              A simple idea for<br />a bigger impact
            </h2>
            <p className="mt-3 text-sm md:text-[15px] leading-relaxed text-zinc-600">
              We started <strong className="text-zinc-900">LinkOS</strong> with a simple belief — every business, no matter how small, deserves a beautiful online presence. From local cafés to salons, from workshops to retail shops, LinkOS makes it effortless to share your business with the world through a single, powerful link.
            </p>

            <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {features.map((f) => (
                <div key={f.title} className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-4 md:p-5">
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${f.bg}`}>
                    <f.icon className="w-5 h-5" />
                  </span>
                  <h3 className="mt-2.5 text-sm md:text-[15px] font-extrabold text-zinc-900">{f.title}</h3>
                  <p className="mt-0.5 text-xs md:text-[13px] leading-snug text-zinc-500">{f.text}</p>
                </div>
              ))}
            </div>

            {/* grow together CTA */}
            <div className="mt-5 relative overflow-hidden rounded-2xl bg-[#04070F] p-5 flex items-center gap-4">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-blue-600/20 blur-[60px]" aria-hidden="true" />
              <div className="relative w-20 h-20 rounded-full border border-blue-400/30 bg-blue-500/10 flex items-center justify-center shrink-0">
                <p className="font-serif italic text-[10px] leading-tight text-blue-200 text-center -rotate-6">
                  Local Businesses<br />Stronger<br />Together
                </p>
              </div>
              <div className="relative min-w-0 flex-1">
                <h3 className="text-lg font-extrabold text-white leading-tight">Let&apos;s grow together</h3>
                <p className="mt-1 text-xs text-zinc-400">Join thousands of businesses already using LinkOS.</p>
              </div>
              <Link to="/signup" aria-label="Create your page" className="relative w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white shrink-0 transition-colors">
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </section>

          {/* Trusted by */}
          <section className="pt-8">
            <h2 className="text-xl font-extrabold tracking-tight text-zinc-900">Trusted by businesses like yours</h2>
            <p className="mt-1.5 text-sm text-zinc-600">From local shops to growing brands — LinkOS is making a difference.</p>
            <div className="mt-4 grid grid-cols-3 gap-2.5 md:gap-4">
              {trustedBusinesses.map((b) => (
                <div key={b.name} className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-3 md:p-5 flex flex-col items-center text-center gap-2">
                  <span className={`w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center ${b.bg}`}>
                    <b.icon className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="text-[11px] md:text-sm font-extrabold text-zinc-900 leading-tight">{b.name}</p>
                    <p className="text-[9px] md:text-xs text-zinc-500 mt-0.5">{b.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Mission */}
          <section className="pt-10">
            <Pill>Our Mission</Pill>
            <h2 className="mt-3 text-[26px] md:text-[32px] leading-tight font-extrabold tracking-tight text-zinc-900">
              Empowering local businesses worldwide
            </h2>
            <p className="mt-3 text-sm md:text-[15px] leading-relaxed text-zinc-600">
              Our mission is to make digital presence easy, affordable and accessible for every business. We believe technology should work for you — not the other way around.
            </p>

            <div className="mt-5 rounded-2xl border border-zinc-100 bg-zinc-50/80 p-4 grid grid-cols-2 gap-x-4 gap-y-5">
              {missionItems.map((m) => (
                <div key={m.title} className="flex items-start gap-2.5">
                  <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${m.red ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-600'}`}>
                    <m.icon className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[13px] font-extrabold text-zinc-900 leading-tight">{m.title}</h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">{m.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Journey timeline */}
          <section className="pt-10">
            <Pill>Our Journey</Pill>
            <div className="mt-5 relative">
              <div className="absolute left-[52px] top-2 bottom-6 w-px bg-zinc-200" aria-hidden="true" />
              <div className="space-y-7">
                {journey.map((j) => (
                  <div key={j.year} className="flex gap-4">
                    <div className="w-10 pt-0.5 text-right text-sm font-extrabold text-zinc-900 shrink-0">{j.year}</div>
                    <div className="relative shrink-0 pt-1">
                      <span className={`block w-3.5 h-3.5 rounded-full ring-4 ring-white ${j.active ? 'bg-blue-600' : 'bg-white border-2 border-zinc-300'}`} />
                    </div>
                    <div className="min-w-0 pb-1">
                      <h3 className="text-sm font-extrabold text-zinc-900">{j.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-zinc-600">{j.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Team */}
          <section className="pt-10">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <UsersRound className="w-5 h-5" />
              </span>
              <div>
                <p className="text-xs font-semibold text-zinc-500">Meet the Team</p>
                <h2 className="text-lg font-extrabold tracking-tight text-zinc-900">The people behind LinkOS</h2>
              </div>
            </div>
            <p className="mt-2.5 text-sm text-zinc-600">A small team with a big vision — making the internet more open for local businesses.</p>

            <div className="mt-5 grid grid-cols-4 gap-3">
              {team.map((t) => (
                <div key={t.name} className="text-center">
                  <div className="aspect-square rounded-full overflow-hidden border-2 border-zinc-100">
                    <img src={t.photo} alt={t.name} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                  <p className="mt-2 text-[11px] font-extrabold text-zinc-900 leading-tight">{t.name}</p>
                  <p className="text-[9px] text-zinc-500 mt-0.5">{t.role}</p>
                </div>
              ))}
            </div>

            {/* quote */}
            <div className="mt-6 rounded-2xl bg-blue-50/80 border border-blue-100 p-5 flex gap-3">
              <Quote className="w-7 h-7 text-blue-500 fill-blue-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold leading-relaxed text-zinc-800">
                  &ldquo;LinkOS is not just a tool, it&apos;s a movement to empower local businesses.&rdquo;
                </p>
                <p className="mt-2 text-xs text-zinc-500">— Asik Iqbal, Founder &amp; CEO</p>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-10">
            <div className="relative overflow-hidden rounded-2xl bg-[#04070F] p-6">
              <div className="absolute -bottom-16 -right-10 w-56 h-56 rounded-full bg-blue-600/25 blur-[70px]" aria-hidden="true" />
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-blue-500/10 blur-[50px]" aria-hidden="true" />
              <div className="relative">
                <h2 className="text-xl font-extrabold tracking-tight text-white">Ready to create your page?</h2>
                <p className="mt-1.5 text-sm text-zinc-400">Join thousands of businesses already growing with LinkOS.</p>
                <Link to="/signup" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-3 text-sm font-bold text-white transition-colors">
                  Create Your Free Page <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
      <FullscreenMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
