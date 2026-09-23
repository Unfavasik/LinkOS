import React from 'react';
import { Heart, Lightbulb, MessageSquareHeart, Users } from 'lucide-react';

const STATS = [
  { icon: Lightbulb, label: 'Ideas Implemented', value: '120+', iconCls: 'bg-amber-400/15 text-amber-300' },
  { icon: Users, label: 'Active Contributors', value: '1.2K+', iconCls: 'bg-blue-400/15 text-blue-300' },
  { icon: Heart, label: 'Average Rating', value: '4.8/5', iconCls: 'bg-rose-400/15 text-rose-300' },
];

/**
 * Dark hero for the feedback page — headline, community stats and a
 * generated 3D chat-bubble illustration with handwritten accents.
 */
export const FeedbackHero: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-[#050D1F]">
      {/* Ambient glows */}
      <div aria-hidden="true" className="absolute -top-40 right-[-80px] w-[520px] h-[520px] rounded-full bg-blue-600/20 blur-[130px]" />
      <div aria-hidden="true" className="absolute top-32 -left-32 w-80 h-80 rounded-full bg-indigo-500/10 blur-[110px]" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-9 pb-10 md:pt-12 md:pb-14 grid md:grid-cols-[minmax(0,1fr)_360px] gap-10 items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-blue-300">
            <MessageSquareHeart className="w-3.5 h-3.5" aria-hidden="true" />
            We Value Your Opinion
          </span>

          <h1 className="mt-4 font-display text-[32px] leading-[1.12] sm:text-[40px] md:text-[44px] font-bold text-white text-balance">
            Your Feedback
            <br />
            Makes <span className="text-blue-400">LinkOS</span> Better
          </h1>

          <p className="mt-3.5 max-w-lg text-[13.5px] sm:text-[14.5px] leading-relaxed text-slate-400">
            Tell us what you love, what can be improved, or share new ideas.
            Your feedback helps us build a better experience for everyone.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-2.5 sm:gap-3 max-w-xl">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur px-3 py-3.5 sm:px-4 sm:flex sm:items-center sm:gap-3"
              >
                <span className={`hidden sm:flex w-10 h-10 rounded-xl items-center justify-center shrink-0 ${s.iconCls}`}>
                  <s.icon className="w-5 h-5" aria-hidden="true" />
                </span>
                <span className="flex sm:block items-center gap-2">
                  <s.icon className="w-4.5 h-4.5 sm:hidden text-amber-300" aria-hidden="true" />
                  <span>
                    <span className="block text-[16px] sm:text-[18px] font-bold text-white leading-tight">{s.value}</span>
                    <span className="block mt-0.5 text-[10px] sm:text-[11px] text-slate-400 leading-tight">{s.label}</span>
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Illustration — generated 3D chat bubble artwork with handwritten accents */}
        <div className="hidden md:flex relative items-center justify-center h-80" aria-hidden="true">
          <img
            src="/images/feedback-bubble.png"
            alt=""
            className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none mix-blend-screen [mask-image:radial-gradient(ellipse_62%_62%_at_50%_50%,black_55%,transparent_80%)]"
            draggable={false}
          />

          {/* Handwritten note + arrow */}
          <div className="absolute top-2 left-0">
            <p className="font-hand text-[26px] leading-[1.05] text-blue-300 -rotate-6">
              Small
              <br />
              Feedback
              <br />
              Big Changes!
            </p>
            <svg className="mt-1 ml-10 text-blue-300/80" width="52" height="40" viewBox="0 0 52 40" fill="none">
              <path d="M4 4c14 4 30 12 40 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M36 30l8 5 1-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Thanks card */}
          <div className="absolute bottom-2 right-0 flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur px-4 py-3 shadow-xl shadow-black/30">
            <span className="flex w-8 h-8 rounded-full bg-rose-500/20 items-center justify-center">
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400" aria-hidden="true" />
            </span>
            <p className="text-[11.5px] leading-snug text-slate-200">
              Thanks for
              <br />
              being part of LinkOS!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
