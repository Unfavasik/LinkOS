import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Bug, ChevronRight, Headset, LifeBuoy, Mail, MessageCircle } from 'lucide-react';

const QUICK_HELP = [
  { title: 'How do I edit a template?', desc: 'Step-by-step guide' },
  { title: 'How to connect my domain?', desc: 'Domain setup tutorial' },
  { title: 'How does billing work?', desc: 'Payment & subscription info' },
  { title: 'Can I use my own images?', desc: 'Customization guide' },
  { title: 'Do you offer refunds?', desc: 'Refund policy details' },
];

const QUICK_LINKS: { label: string; icon: React.ElementType; to?: string; href?: string }[] = [
  { label: 'Live Chat', icon: MessageCircle, to: '/help/contact' },
  { label: 'Email Us', icon: Mail, href: 'mailto:support@linkos.app' },
  { label: 'Help Center', icon: BookOpen, to: '/help' },
  { label: 'Report a Bug', icon: Bug, to: '/help/contact' },
];

/** Right rail for the contact form view — quick help links + live chat card. */
export const SupportRightRail: React.FC = () => {
  return (
    <aside className="flex flex-col gap-5">
      {/* Live chat — light-blue card first on mobile, dark card last on desktop */}
      <section
        className="order-1 md:order-2 rounded-2xl bg-blue-50 md:bg-[#0B1526] p-5 shadow-sm md:shadow-lg md:shadow-slate-900/10"
        aria-label="Live chat"
      >
        <div className="flex items-center gap-3">
          <span className="flex w-10 h-10 rounded-full bg-blue-100 md:bg-blue-500/20 items-center justify-center shrink-0">
            <Headset className="w-5 h-5 text-blue-600 md:text-blue-300" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-[14px] font-bold text-slate-900 md:text-white">Need immediate help?</h2>
            <p className="text-[11.5px] text-slate-600 md:text-slate-400">Chat with our support team now.</p>
          </div>

          {/* Mobile: button + online stacked at the right */}
          <div className="ml-auto md:hidden flex flex-col items-stretch gap-1.5 shrink-0">
            <button
              type="button"
              className="rounded-lg bg-blue-600 px-3.5 py-2 text-[12px] font-bold text-white active:bg-blue-700 transition-colors"
            >
              Start Live Chat
            </button>
            <span className="flex items-center justify-center gap-1.5 text-[10.5px] font-semibold text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              Online
            </span>
          </div>
        </div>

        {/* Desktop: button + online row below */}
        <div className="mt-4 hidden md:flex items-center justify-between gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-[12.5px] font-bold text-white hover:bg-blue-500 transition-colors"
          >
            Start Live Chat
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
            Online
          </span>
        </div>
      </section>

      {/* Mobile-only quick link cards */}
      <section className="order-2 md:hidden grid grid-cols-4 gap-2" aria-label="Quick support links">
        {QUICK_LINKS.map((l) => {
          const inner = (
            <>
              <span className="flex items-center justify-between">
                <l.icon className="w-4.5 h-4.5 text-slate-700" aria-hidden="true" />
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              </span>
              <span className="text-[10px] font-semibold text-slate-700 leading-tight">{l.label}</span>
            </>
          );
          const cls = 'rounded-xl bg-white p-2.5 shadow-sm flex flex-col justify-between gap-3 min-h-[76px]';
          if (l.href) {
            return (
              <a key={l.label} href={l.href} className={cls}>
                {inner}
              </a>
            );
          }
          return (
            <Link key={l.label} to={l.to ?? '/help/contact'} className={cls}>
              {inner}
            </Link>
          );
        })}
      </section>

      <section
        className="order-3 md:order-1 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
        aria-label="Quick help"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex w-9 h-9 rounded-full bg-blue-50 items-center justify-center">
            <LifeBuoy className="w-4.5 h-4.5 text-blue-600" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-[15px] font-bold text-slate-900">Quick Help</h2>
            <p className="text-[11px] text-slate-500">Find instant answers to common questions.</p>
          </div>
        </div>

        <ul className="mt-4 divide-y divide-slate-100">
          {QUICK_HELP.map((q) => (
            <li key={q.title}>
              <Link to="/help" className="group flex items-center gap-3 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block text-[12.5px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {q.title}
                  </span>
                  <span className="block text-[11px] text-slate-500">{q.desc}</span>
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
};
