import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Bug,
  Clock,
  Headset,
  LifeBuoy,
  Lightbulb,
  Mail,
  Megaphone,
  MessageCircle,
} from 'lucide-react';

const FORM_ITEMS = [
  { label: 'Contact Form', desc: 'Send us a message', icon: Mail, to: '/help/contact', active: true },
  { label: 'My Tickets', desc: 'Track your tickets', icon: LifeBuoy, to: '/help/tickets' },
  { label: 'Live Chat', desc: 'Chat with our team', icon: MessageCircle, to: '/help/contact', online: true },
  { label: 'Email Us', desc: 'support@linkos.app', icon: Mail, to: '/help/contact' },
  { label: 'Help Center', desc: 'Browse articles', icon: BookOpen, to: '/help' },
  { label: 'Report a Bug', desc: 'Found an issue?', icon: Bug, to: '/help/contact' },
  { label: 'Feature Request', desc: 'Share your idea', icon: Lightbulb, to: '/help/contact' },
];

const TRACK_ITEMS = [
  { label: 'Contact Support', icon: Headset, to: '/help/contact' },
  { label: 'My Tickets', icon: LifeBuoy, to: '/help/tickets', active: true },
  { label: 'Knowledge Base', icon: BookOpen, to: '/resources' },
  { label: 'Live Chat', icon: MessageCircle, to: '/help/contact', online: true },
  { label: 'Announcements', icon: Megaphone, to: '/announcements' },
];

/**
 * Support-center sidebar for the contact page. "form" shows the Get Support
 * channel list with support hours; "track" shows the ticket-center nav used
 * on the Track My Ticket view. Hidden on mobile.
 */
export const SupportSidebar: React.FC<{ variant: 'form' | 'track' }> = ({ variant }) => {
  if (variant === 'track') {
    return (
      <aside className="hidden md:block">
        <p className="px-1 mb-2.5 text-[15px] font-bold text-slate-900">Support Center</p>
        <nav aria-label="Support center" className="space-y-1.5">
          {TRACK_ITEMS.map((item) => (
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
              <span className="flex-1">{item.label}</span>
              {item.online && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                  Online
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <img
            src="/images/support-helper.png"
            alt="LinkOS support agent giving a thumbs up"
            className="w-full h-36 object-cover object-top rounded-xl"
            draggable={false}
          />
          <p className="mt-3 text-[14px] font-bold text-slate-900">Need more help?</p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-slate-500">Chat with our support team.</p>
          <button
            type="button"
            className="mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2.5 text-[12px] font-bold text-white hover:bg-blue-500 transition-colors"
          >
            Start Live Chat
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden md:block">
      <p className="px-1 text-[16px] font-bold text-slate-900">Get Support</p>
      <p className="px-1 mt-0.5 mb-3 text-[12px] text-slate-500">Choose the best way to reach us.</p>
      <nav aria-label="Get support" className="space-y-2">
        {FORM_ITEMS.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            aria-current={item.active ? 'page' : undefined}
            className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 transition-colors ${
              item.active
                ? 'bg-blue-50 border-blue-200'
                : 'bg-white/70 border-transparent hover:bg-white hover:border-slate-200'
            }`}
          >
            <span
              className={`flex w-9 h-9 rounded-lg items-center justify-center shrink-0 ${
                item.active ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
              }`}
            >
              <item.icon className="w-4.5 h-4.5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className={`block text-[13px] font-bold ${item.active ? 'text-blue-600' : 'text-slate-800'}`}>
                {item.label}
              </span>
              <span className="block truncate text-[11px] text-slate-500">{item.desc}</span>
            </span>
            {item.online && (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                Online
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-center gap-2.5">
          <span className="flex w-8 h-8 rounded-full bg-blue-100 items-center justify-center">
            <Clock className="w-4 h-4 text-blue-600" aria-hidden="true" />
          </span>
          <p className="text-[13px] font-bold text-blue-700">Support Hours</p>
        </div>
        <p className="mt-2.5 text-[11.5px] leading-relaxed text-slate-600">
          Mon – Sat: 9:00 AM – 10:00 PM (IST)
          <br />
          Sunday: 10:00 AM – 6:00 PM (IST)
        </p>
      </div>
    </aside>
  );
};
