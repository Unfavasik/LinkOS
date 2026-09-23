import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { ArrowRight, Check, Clock, FileText, Home, Mail, Ticket, Users } from 'lucide-react';
import type { SupportTicket } from '../../lib/supportTickets';
import { SupportFooter } from './SupportFooter';

const INFO_ITEMS = [
  { icon: Mail, title: "You'll get an email", desc: "We've sent a confirmation to your email address." },
  { icon: Clock, title: 'Response Time', desc: 'Usually within 1–6 hours.' },
  { icon: Users, title: 'Our Support Team', desc: 'Real people. Real solutions.' },
];

const CONFETTI_PIECES = [
  { cls: 'top-2 left-10 w-1.5 h-3 bg-emerald-500 rotate-12' },
  { cls: '-top-1 left-24 w-1.5 h-2.5 bg-violet-500 -rotate-45' },
  { cls: 'top-10 -left-1 w-1.5 h-2.5 bg-emerald-400 rotate-45' },
  { cls: 'top-1/3 -left-8 w-1.5 h-3 bg-blue-400 -rotate-12' },
  { cls: '-top-3 left-1/2 w-1.5 h-3 bg-emerald-400 rotate-45' },
  { cls: 'top-6 -right-6 w-1.5 h-2.5 bg-violet-400 -rotate-12' },
  { cls: 'top-1/3 -right-10 w-1.5 h-3 bg-blue-500 rotate-12' },
  { cls: 'top-1/2 right-2 w-1.5 h-2.5 bg-emerald-500 -rotate-45' },
  { cls: 'top-1/2 left-4 w-1.5 h-2.5 bg-blue-300 rotate-45' },
];

/**
 * "Your Request Has Been Submitted!" view — blue check with confetti, the
 * ticket ID card, action buttons, reassurance items and the help banner,
 * followed by the dark marketing footer.
 */
export const SupportSuccess: React.FC<{
  ticket: SupportTicket | null;
  onTrack: () => void;
  onBack: () => void;
}> = ({ ticket, onTrack, onBack }) => {
  useEffect(() => {
    confetti({
      particleCount: 110,
      spread: 80,
      origin: { y: 0.4 },
      colors: ['#2563EB', '#10B981', '#8B5CF6', '#93C5FD'],
      disableForReducedMotion: true,
    });
  }, []);

  const submittedAt = ticket
    ? new Date(ticket.created_at).toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '';

  return (
    <div className="bg-white">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-14" aria-live="polite">
        {/* Check + confetti */}
        <div className="flex justify-center">
          <div className="relative inline-flex items-center justify-center" aria-hidden="true">
            {CONFETTI_PIECES.map((p, i) => (
              <span key={i} className={`absolute rounded-full ${p.cls}`} />
            ))}
            <span className="flex items-center justify-center w-24 h-24 rounded-full bg-blue-100" />
            <span className="absolute flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 shadow-xl shadow-blue-600/30">
              <Check className="w-9 h-9 text-white" strokeWidth={3.2} />
            </span>
          </div>
        </div>

        <h1 className="mt-6 text-center font-display text-[28px] sm:text-[34px] font-bold text-slate-900 text-balance">
          Your Request Has Been Submitted!
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-center text-[13.5px] leading-relaxed text-slate-500">
          Thank you for contacting LinkOS Support. We&apos;ve received your message and our team will get back to you
          as soon as possible.
        </p>

        {/* Ticket ID card */}
        <div className="mt-8 mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              <span className="flex w-12 h-12 rounded-xl bg-blue-50 items-center justify-center shrink-0">
                <FileText className="w-5.5 h-5.5 text-blue-600" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[11.5px] text-slate-500">Ticket ID</p>
                <p className="text-[17px] font-bold text-slate-900 break-all">{ticket?.ticket_id}</p>
                <p className="mt-0.5 text-[11.5px] text-slate-500">Please keep this ID for future reference.</p>
              </div>
            </div>
            <div className="sm:text-right shrink-0">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-[11.5px] font-bold text-blue-600">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" aria-hidden="true" />
                Open
              </span>
              <p className="mt-1.5 text-[11px] text-slate-400">Submitted on</p>
              <p className="text-[12px] font-semibold text-slate-600">{submittedAt}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 mx-auto max-w-2xl grid sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={onTrack}
            className="h-12 rounded-xl bg-blue-600 hover:bg-blue-500 transition flex items-center justify-center gap-2 text-[13.5px] font-bold text-white"
          >
            <Ticket className="w-4.5 h-4.5" aria-hidden="true" />
            Track My Ticket
          </button>
          <button
            type="button"
            onClick={onBack}
            className="h-12 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition flex items-center justify-center gap-2 text-[13.5px] font-bold text-slate-700"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
            Back to Support
          </button>
          <Link
            to="/"
            className="h-12 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition flex items-center justify-center gap-2 text-[13.5px] font-bold text-slate-700"
          >
            <Home className="w-4.5 h-4.5" aria-hidden="true" />
            Go to Home
          </Link>
        </div>

        {/* Reassurance items */}
        <div className="mt-10 mx-auto max-w-3xl grid sm:grid-cols-3 gap-6">
          {INFO_ITEMS.map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <span className="flex w-11 h-11 rounded-full bg-blue-50 items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-blue-600" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[13.5px] font-bold text-slate-900">{item.title}</p>
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Not-alone banner */}
        <div className="mt-10 mx-auto max-w-4xl rounded-2xl bg-blue-50 border border-blue-100 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-5 p-5 sm:p-6">
            <img
              src="/images/support-helper.png"
              alt="LinkOS support agent giving a thumbs up"
              className="w-28 h-28 rounded-2xl object-cover object-top shrink-0"
              draggable={false}
            />
            <div className="flex-1 text-center sm:text-left">
              <p className="text-[11px] font-bold tracking-wider text-blue-600">NEED IMMEDIATE HELP?</p>
              <p className="mt-1 font-display text-[22px] font-bold text-slate-900">You&apos;re not alone!</p>
              <p className="mt-1 text-[12.5px] text-slate-600">While you wait, check our Help Center for quick answers.</p>
            </div>
            <Link
              to="/help"
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-5 py-3 text-[13px] font-bold text-slate-800 shadow-sm hover:bg-slate-50 transition-colors"
            >
              Browse Help Center
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </main>

      <SupportFooter />
    </div>
  );
};
