import React from 'react';
import { Heart, MessageSquareText, ShieldCheck, Sparkles, Zap } from 'lucide-react';

const CHIPS = [
  { icon: Zap, iconCls: 'bg-amber-400/15 text-amber-300', title: 'Fast Response', desc: 'Usually within 1–6 hours' },
  { icon: ShieldCheck, iconCls: 'bg-emerald-400/15 text-emerald-300', title: 'Reliable Support', desc: 'Real people, real solutions' },
  { icon: Heart, iconCls: 'bg-rose-400/15 text-rose-300', title: 'Here for You', desc: 'Your success matters' },
];

/**
 * Dark hero for the contact support page — headline, trust chips and the
 * generated 3D support-agent illustration with a chat bubble accent.
 */
export const SupportHero: React.FC = () => {
  return (
    <section className="relative overflow-hidden" aria-label="Contact support">
      <div className="absolute -top-32 left-1/3 w-[420px] h-[420px] rounded-full bg-blue-600/20 blur-[110px]" aria-hidden="true" />
      <div className="absolute top-20 -right-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-[90px]" aria-hidden="true" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-10 grid md:grid-cols-[minmax(0,1fr)_minmax(0,440px)] gap-10 items-center">
        {/* Mobile-only character accent, top-right of the hero */}
        <div className="md:hidden absolute -top-3 right-0 w-44 h-48 pointer-events-none" aria-hidden="true">
          <img
            src="/images/support-hero-character.png"
            alt=""
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover object-top mix-blend-lighten [mask-image:radial-gradient(ellipse_70%_70%_at_50%_45%,black_50%,transparent_78%)]"
          />
          <p className="font-hand absolute -right-1 top-24 text-[13px] leading-[1.2] text-blue-300 rotate-6 text-right">
            Real People,
            <br />
            Real Support
          </p>
        </div>

        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1.5 text-[10.5px] font-bold tracking-[0.12em] text-blue-300">
            <Sparkles className="w-3 h-3" aria-hidden="true" />
            SUPPORT CENTER
          </span>
          <h1 className="mt-4 font-display text-[34px] sm:text-[44px] font-bold leading-[1.06] text-white">
            Contact <span className="text-blue-400 md:text-white">Support</span>
          </h1>
          <p className="mt-3 max-w-md text-[14px] leading-relaxed text-slate-400">
            We&apos;re here to help. Get in touch with our team and we&apos;ll make sure you get the support you need.
          </p>

          <div className="mt-6 md:mt-7 grid grid-cols-3 gap-2 md:flex md:flex-wrap md:gap-3">
            {CHIPS.map((chip) => (
              <div
                key={chip.title}
                className="flex items-center gap-2 md:gap-3 rounded-xl md:rounded-2xl border border-white/10 bg-white/[0.04] px-2.5 py-2.5 md:px-4 md:py-3"
              >
                <span className={`flex w-7 h-7 md:w-9 md:h-9 rounded-lg items-center justify-center shrink-0 ${chip.iconCls}`}>
                  <chip.icon className="w-3.5 h-3.5 md:w-4.5 md:h-4.5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[10.5px] md:text-[13px] font-bold text-white leading-tight">{chip.title}</span>
                  <span className="block text-[9px] md:text-[11px] text-slate-400 leading-tight mt-0.5">{chip.desc}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Illustration — generated 3D support agent with chat bubble */}
        <div className="hidden md:block relative h-[320px]" aria-hidden="true">
          <img
            src="/images/support-hero-character.png"
            alt=""
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover object-top mix-blend-lighten [mask-image:radial-gradient(ellipse_70%_70%_at_50%_45%,black_55%,transparent_82%)]"
          />
          <div className="absolute top-8 left-0 flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3 shadow-xl shadow-black/30">
            <span className="flex w-8 h-8 rounded-full bg-blue-600 items-center justify-center">
              <MessageSquareText className="w-4 h-4 text-white" />
            </span>
            <p className="text-[12.5px] font-bold leading-tight text-slate-900">
              How can
              <br />
              we help you?
            </p>
          </div>
          <p className="font-hand absolute -top-1 right-0 text-[22px] leading-[1.1] text-blue-300 rotate-6 text-right">
            Real People,
            <br />
            Real Support,
            <br />
            Always Here
            <br />
            for You!
          </p>
        </div>
      </div>
    </section>
  );
};
