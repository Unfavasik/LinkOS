import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Bug,
  Headset,
  LifeBuoy,
  Lightbulb,
  Megaphone,
  PenSquare,
  Star,
  Users,
} from 'lucide-react';

const FORM_ITEMS = [
  { label: 'Give Feedback', to: '/help/feedback', icon: PenSquare, active: true },
  { label: 'Feature Requests', to: '/help/feedback', icon: Lightbulb },
  { label: 'Bug Reports', to: '/help/feedback', icon: Bug },
  { label: "What's New", to: '/resources', icon: Megaphone },
  { label: 'Roadmap', to: '/resources', icon: BookOpen },
  { label: 'Community Ideas', to: '/resources', icon: Users },
];

const SUCCESS_ITEMS = [
  { label: 'Give Feedback', to: '/help/feedback', icon: PenSquare, active: true },
  { label: 'My Tickets', to: '/help/tickets', icon: LifeBuoy },
  { label: 'Feature Requests', to: '/help/feedback', icon: Lightbulb },
  { label: 'Bug Reports', to: '/help/feedback', icon: Bug },
  { label: "What's New", to: '/resources', icon: Megaphone },
  { label: 'Help & Docs', to: '/help', icon: BookOpen },
  { label: 'Community', to: '/resources', icon: Users },
  { label: 'Contact Support', to: '/help/contact', icon: Headset },
];

/**
 * Support-center sidebar shown next to the feedback form and the
 * thank-you view. Hidden on mobile, where the tab bar takes over.
 */
export const FeedbackSidebar: React.FC<{ variant: 'form' | 'success' }> = ({ variant }) => {
  const items = variant === 'form' ? FORM_ITEMS : SUCCESS_ITEMS;

  return (
    <aside className="hidden md:block">
      <p className="px-1 mb-2.5 text-[12px] font-bold uppercase tracking-wider text-slate-500">Support Center</p>
      <nav aria-label="Support center" className="space-y-1.5">
        {items.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            aria-current={item.active ? 'page' : undefined}
            className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold border transition-colors ${
              item.active
                ? 'bg-blue-50 border-blue-200 text-blue-600'
                : 'bg-white/60 border-transparent text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <item.icon className={`w-4.5 h-4.5 ${item.active ? 'text-blue-600' : 'text-slate-400'}`} aria-hidden="true" />
            {item.label}
          </Link>
        ))}
      </nav>

      {variant === 'form' ? (
        <div className="mt-5 rounded-2xl bg-gradient-to-b from-blue-600 to-blue-700 p-5 text-white shadow-lg shadow-blue-600/20">
          <span className="flex w-10 h-10 rounded-full bg-white/15 items-center justify-center">
            <Star className="w-5 h-5 text-white fill-white" aria-hidden="true" />
          </span>
          <p className="mt-3 text-[14px] font-bold leading-snug">Help us improve LinkOS</p>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-blue-100">
            Even a small suggestion can make a big difference.
          </p>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="flex w-10 h-10 rounded-xl bg-blue-600 items-center justify-center">
            <Headset className="w-5 h-5 text-white" aria-hidden="true" />
          </span>
          <p className="mt-3 text-[14px] font-bold text-slate-900">Need urgent help?</p>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-slate-500">
            Our support team is here to help you.
          </p>
          <Link
            to="/help/contact"
            className="mt-3.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Contact Support
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}
    </aside>
  );
};
