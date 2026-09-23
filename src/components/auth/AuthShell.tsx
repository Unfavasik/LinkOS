import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { LinkOsLogo } from '../common/LinkOsLogo';

const BRAND_TILES = [
  { src: '/images/cafe/interior.webp', alt: 'Café interior', cls: 'left-6 top-10 w-40 h-28 -rotate-6' },
  { src: '/images/collage/gym.webp', alt: 'Gym', cls: 'right-10 top-4 w-36 h-28 rotate-6' },
  { src: '/images/collage/car-detailing.webp', alt: 'Car detailing workshop', cls: 'left-16 bottom-16 w-36 h-28 rotate-3' },
  { src: '/images/collage/clothing.webp', alt: 'Clothing store', cls: 'right-16 bottom-6 w-40 h-32 -rotate-3' },
];

export const AuthShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-[#060D1A] text-white font-sans relative overflow-hidden">
    {/* Ambient glow */}
    <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[560px] h-[360px] rounded-full bg-blue-600/20 blur-[110px] pointer-events-none" aria-hidden="true" />

    <div className="relative md:grid md:grid-cols-[1.1fr_1fr] md:min-h-screen">
      {/* Brand panel — desktop only */}
      <aside className="hidden md:flex flex-col justify-between relative overflow-hidden border-r border-white/[0.06] bg-gradient-to-br from-[#081226] via-[#060D1A] to-[#0A1830] p-12 xl:p-16">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-600/15 blur-[110px] pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" aria-hidden="true" />

        <div className="relative">
          <Link to="/" aria-label="LinkOS home">
            <LinkOsLogo size="lg" tone="light" />
          </Link>
          <p className="mt-2 text-[13px] text-zinc-400">Build. Launch. Grow.</p>
        </div>

        <div className="relative my-10" aria-hidden="true">
          {BRAND_TILES.map((img, i) => (
            <div key={i} className={`absolute ${img.cls} rounded-2xl overflow-hidden border border-white/15 shadow-xl shadow-black/50`}>
              <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
            </div>
          ))}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="font-serif italic text-2xl leading-snug text-white -rotate-3">
              Your Business<br />Online<br />In Minutes
            </p>
            <svg viewBox="0 0 80 12" className="w-24 h-3 mx-auto mt-2 stroke-[#1D7AFC] fill-none" strokeWidth="2.5" strokeLinecap="round">
              <path d="M2 8 C 25 2, 55 2, 78 6" />
            </svg>
          </div>
        </div>

        <div className="relative">
          <blockquote className="text-[15px] leading-relaxed text-zinc-300 text-pretty">
            "LinkOS gave my café a beautiful online page in minutes. Customers find us, call us and order — all from one link."
          </blockquote>
          <p className="mt-3 text-[12px] font-semibold text-zinc-400">
            Rahim Uddin <span className="font-normal text-zinc-500">· Owner, Urban Brew Café</span>
          </p>
          <div className="mt-8 flex items-center gap-8 text-[12px] text-zinc-400">
            <span><strong className="block text-lg font-extrabold text-white">10K+</strong> Businesses</span>
            <span><strong className="block text-lg font-extrabold text-white">1M+</strong> Monthly Visitors</span>
            <span><strong className="block text-lg font-extrabold text-white">4.8/5</strong> Average Rating</span>
          </div>
        </div>
      </aside>

      {/* Form column */}
      <div className="relative max-w-md mx-auto px-5 pt-5 pb-10 md:max-w-lg md:px-10 md:pt-8 md:flex md:flex-col md:justify-center">
        {/* Header */}
        <header className="relative flex items-center justify-center h-12">
          <Link
            to="/"
            aria-label="Go back"
            className="absolute left-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <Link to="/" aria-label="LinkOS home" className="md:hidden">
            <LinkOsLogo size="md" tone="light" />
          </Link>
        </header>
        <p className="text-center text-[11px] text-zinc-400 mt-1.5 md:hidden">Local Businesses. Global Opportunities.</p>
        {children}
      </div>
    </div>
  </div>
);

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" />
    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
  </svg>
);

const AppleIcon = () => (
  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8.98-.2 1.92-.86 3.16-.77 1.48.12 2.61.7 3.36 1.75-3.09 1.86-2.36 5.94.48 7.13-.57 1.5-1.31 2.99-2.08 4.06ZM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25Z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#1877F2" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.49h-2.8V24C19.62 23.1 24 18.1 24 12.07Z" />
  </svg>
);

interface SocialButtonsProps {
  dividerLabel: string;
  onSocial: (provider: 'google' | 'apple' | 'facebook') => void;
}

export const SocialButtons: React.FC<SocialButtonsProps> = ({ dividerLabel, onSocial }) => (
  <>
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
      <div className="relative flex justify-center">
        <span className="bg-[#0B1626] px-3 text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">{dividerLabel}</span>
      </div>
    </div>
    <div className="space-y-2.5">
      <button type="button" onClick={() => onSocial('google')} className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[13px] font-semibold text-zinc-100 transition-colors">
        <GoogleIcon /> Continue with Google
      </button>
      <button type="button" onClick={() => onSocial('apple')} className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[13px] font-semibold text-zinc-100 transition-colors">
        <AppleIcon /> Continue with Apple
      </button>
      <button type="button" onClick={() => onSocial('facebook')} className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[13px] font-semibold text-zinc-100 transition-colors">
        <FacebookIcon /> Continue with Facebook
      </button>
    </div>
  </>
);
