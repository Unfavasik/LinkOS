import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  ArrowRight,
  BookOpen,
  Bug,
  Check,
  Copy,
  Heart,
  LifeBuoy,
  Lightbulb,
  MessageSquareHeart,
  PlusCircle,
  Users,
} from 'lucide-react';
import { LinkOsLogo } from '../common/LinkOsLogo';

const NEXT_STEPS = [
  { title: "We've received your feedback", desc: 'Your submission is now in our system.' },
  { title: 'Our team will review it', desc: "We'll carefully check and consider your feedback." },
  { title: "You'll be updated", desc: "We'll notify you if there are any updates or changes." },
];

const EXPLORE = [
  { icon: Lightbulb, iconCls: 'bg-blue-50 text-blue-600', title: 'Request a Feature', desc: 'Have an idea? Let us know!', to: '/help/feedback' },
  { icon: Bug, iconCls: 'bg-red-50 text-red-500', title: 'Report a Bug', desc: 'Found something not working?', to: '/help/feedback' },
  { icon: BookOpen, iconCls: 'bg-emerald-50 text-emerald-600', title: "Read What's New", desc: 'Check out our latest updates.', to: '/resources' },
  { icon: Users, iconCls: 'bg-violet-50 text-violet-600', title: 'Join Community', desc: 'Share ideas and connect with other users.', to: '/resources' },
];

/** Confetti pieces drawn around the success check (pure CSS). */
const CONFETTI_PIECES = [
  { cls: 'top-0 left-6 w-1.5 h-3 bg-blue-500 rotate-12' },
  { cls: '-top-2 left-16 w-1.5 h-2.5 bg-violet-500 -rotate-45' },
  { cls: 'top-6 -left-2 w-1.5 h-2.5 bg-emerald-500 rotate-45' },
  { cls: 'top-1/2 -left-6 w-1.5 h-3 bg-blue-400 -rotate-12' },
  { cls: '-top-3 right-10 w-1.5 h-3 bg-emerald-400 rotate-45' },
  { cls: 'top-4 -right-3 w-1.5 h-2.5 bg-violet-400 -rotate-12' },
  { cls: 'top-1/2 -right-6 w-1.5 h-3 bg-blue-500 rotate-12' },
  { cls: 'bottom-2 left-2 w-1.5 h-2.5 bg-amber-400 -rotate-45' },
  { cls: 'bottom-0 right-8 w-1.5 h-3 bg-blue-300 rotate-45' },
];

/**
 * Thank-you view shown after a successful submission — confetti, ticket ID
 * with copy button, next steps and ways to stay involved.
 */
export const FeedbackSuccess: React.FC<{ ticketId: string; onReset: () => void }> = ({ ticketId, onReset }) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    confetti({
      particleCount: 110,
      spread: 80,
      origin: { y: 0.55 },
      disableForReducedMotion: true,
    });
  }, []);

  const copyTicket = async () => {
    try {
      await navigator.clipboard.writeText(ticketId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const submittedAt = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-8 shadow-sm" aria-live="polite">
      <div className="relative max-w-2xl mx-auto text-center">
        <p className="font-hand absolute -top-2 right-0 hidden md:block text-[24px] leading-[1.05] text-blue-500 rotate-6" aria-hidden="true">
          Your Voice
          <br />
          Matters!
        </p>

        {/* Success check + confetti */}
        <div className="relative inline-flex items-center justify-center" aria-hidden="true">
          {CONFETTI_PIECES.map((p, i) => (
            <span key={i} className={`absolute rounded-full ${p.cls}`} />
          ))}
          <span className="flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500 shadow-xl shadow-emerald-500/30">
            <Check className="w-12 h-12 text-white" strokeWidth={3} />
          </span>
          <span className="absolute inset-0 rounded-full bg-emerald-500/20 scale-[1.35]" />
        </div>

        <h1 className="mt-6 font-display text-[26px] sm:text-[30px] font-bold text-slate-900 text-balance">
          Thank You for Your Feedback!
        </h1>
        <p className="mt-2 text-[14px] text-slate-500">Your feedback has been submitted successfully.</p>
        <p className="mx-auto mt-3 max-w-md text-[12.5px] leading-relaxed text-slate-400">
          We really appreciate you taking the time to help us improve LinkOS.
          Your suggestions play a big role in shaping a better experience for everyone.
        </p>

        {/* Ticket ID */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-left">
          <span className="flex w-11 h-11 rounded-xl bg-blue-600 items-center justify-center shrink-0">
            <MessageSquareHeart className="w-5 h-5 text-white" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-slate-400">Ticket ID</p>
            <p className="mt-0.5 flex items-center gap-2 text-[15px] font-bold text-slate-900">
              {ticketId}
              <button
                type="button"
                onClick={copyTicket}
                aria-label="Copy ticket ID"
                className="text-slate-400 hover:text-blue-600 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </p>
          </div>
          <div className="sm:text-right">
            <span className="inline-flex px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-600 text-[11px] font-bold">
              Submitted
            </span>
            <p className="mt-1 text-[11px] text-slate-400">{submittedAt}</p>
          </div>
        </div>

        {/* Next steps */}
        <div className="mt-8">
          <div className="flex items-center gap-3" aria-hidden="true">
            <span className="flex-1 border-t border-dashed border-slate-200" />
            <h2 className="text-[15px] font-bold text-slate-900">What happens next?</h2>
            <span className="flex-1 border-t border-dashed border-slate-200" />
          </div>
          <ol className="relative mt-5 grid sm:grid-cols-3 gap-5 text-left">
            <div aria-hidden="true" className="hidden sm:block absolute top-5 left-[17%] right-[17%] border-t-2 border-dashed border-slate-200" />
            {NEXT_STEPS.map((step, i) => (
              <li key={step.title} className="relative flex items-start gap-3">
                <span
                  className={`relative z-10 flex w-10 h-10 rounded-full items-center justify-center text-[14px] font-bold shrink-0 ${
                    i === 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {i + 1}
                </span>
                <div>
                  <p className="text-[13px] font-bold text-slate-900 leading-snug">{step.title}</p>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-slate-400">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/help/tickets"
            className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 transition text-[13.5px] font-bold text-white flex items-center justify-center gap-2"
          >
            <LifeBuoy className="w-4.5 h-4.5" aria-hidden="true" />
            Track My Feedback
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={onReset}
            className="h-12 px-6 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-[13.5px] font-semibold text-slate-700 flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4.5 h-4.5 text-blue-600" aria-hidden="true" />
            Submit Another Feedback
          </button>
        </div>
      </div>

      {/* While you're here */}
      <div className="mt-8 rounded-2xl bg-slate-50 border border-slate-100 p-5 text-left">
        <h2 className="text-[15px] font-bold text-slate-900">While you&apos;re here...</h2>
        <p className="mt-0.5 text-[12px] text-slate-500">Here are a few more ways you can get involved.</p>
        <div className="mt-4 grid sm:grid-cols-2 md:grid-cols-4 gap-3">
          {EXPLORE.map((card) => (
            <Link
              key={card.title}
              to={card.to}
              className="group rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition"
            >
              <div className="flex items-center justify-between">
                <span className={`flex w-9 h-9 rounded-lg items-center justify-center ${card.iconCls}`}>
                  <card.icon className="w-4.5 h-4.5" aria-hidden="true" />
                </span>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" aria-hidden="true" />
              </div>
              <p className="mt-3 text-[13px] font-bold text-slate-900">{card.title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{card.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <LinkOsLogo size="sm" tone="dark" />
        <nav className="flex items-center gap-5 text-[11.5px] text-slate-500" aria-label="Footer">
          <Link to="/help" className="hover:text-slate-800">Terms of Service</Link>
          <Link to="/help" className="hover:text-slate-800">Privacy Policy</Link>
          <Link to="/help" className="hover:text-slate-800">Help Center</Link>
        </nav>
        <p className="flex items-center gap-1 text-[11.5px] text-slate-500">
          Making the web more creative place.
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" aria-hidden="true" />
        </p>
      </footer>
    </section>
  );
};
