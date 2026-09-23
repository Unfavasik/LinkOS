import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'How do I create a website using LinkOS?',
    a: 'Pick a template from our gallery, customize it with the drag-and-drop editor, connect your domain and hit publish — no coding needed.',
  },
  {
    q: 'Can I use a custom domain?',
    a: 'Yes! You can connect any domain you own from the Domains section of your dashboard. We handle SSL automatically.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'We offer a 14-day money-back guarantee on all paid plans. Contact support and we will process your refund.',
  },
  {
    q: 'Is coding required?',
    a: 'Not at all. LinkOS is built for non-developers — everything from content to colors can be changed visually.',
  },
  {
    q: 'Can I upgrade my plan later?',
    a: 'Absolutely. You can upgrade or downgrade your plan anytime from Settings — changes are prorated automatically.',
  },
  {
    q: 'How can I contact support?',
    a: 'Use this contact form, start a live chat, or email support@linkos.app. We usually reply within 1–6 hours.',
  },
];

/** Two-column FAQ accordion shown under the contact form. */
export const SupportFaq: React.FC = () => {
  const [open, setOpen] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <section className="mt-8" aria-label="Frequently asked questions">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-[20px] font-bold text-white md:text-slate-900">Frequently Asked Questions</h2>
          <p className="mt-0.5 text-[12.5px] text-slate-400 md:text-slate-500">Answers to the most common questions from our users.</p>
        </div>
        <Link to="/help" className="hidden sm:inline-flex items-center gap-1.5 text-[12.5px] font-bold text-blue-600 hover:text-blue-500 shrink-0">
          View All FAQs
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-3 items-start">
        {FAQS.map((faq, i) => {
          const isOpen = open.has(i);
          return (
            <div key={faq.q} className="rounded-xl border border-slate-200/80 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left"
              >
                <span className="text-[13px] font-semibold text-slate-800">{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>
              {isOpen && <p className="px-4 pb-4 -mt-1 text-[12.5px] leading-relaxed text-slate-500">{faq.a}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
};
