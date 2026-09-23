import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bug, Check, FileText, Lightbulb, ThumbsUp } from 'lucide-react';

const WHY_POINTS = [
  'Helps us improve faster',
  "Brings new features you'll love",
  'Makes LinkOS better for everyone',
  "You're shaping the future!",
];

const RECENT = [
  { icon: Lightbulb, iconCls: 'bg-amber-100 text-amber-500', title: 'Dark mode for editor', tag: 'Feature Request', tagCls: 'bg-blue-50 text-blue-600', time: '2 days ago', votes: 42 },
  { icon: Bug, iconCls: 'bg-red-100 text-red-500', title: 'Mobile menu issue', tag: 'Bug Report', tagCls: 'bg-red-50 text-red-500', time: '4 days ago', votes: 18 },
  { icon: Lightbulb, iconCls: 'bg-amber-100 text-amber-500', title: 'More eCommerce templates', tag: 'Feature Request', tagCls: 'bg-blue-50 text-blue-600', time: '6 days ago', votes: 36 },
  { icon: FileText, iconCls: 'bg-emerald-100 text-emerald-500', title: 'Custom domain guide', tag: 'Improvement', tagCls: 'bg-emerald-50 text-emerald-600', time: '1 week ago', votes: 24 },
  { icon: Lightbulb, iconCls: 'bg-amber-100 text-amber-500', title: 'Multi-language support', tag: 'Feature Request', tagCls: 'bg-blue-50 text-blue-600', time: '1 week ago', votes: 31 },
];

/**
 * Right rail next to the form — "why it matters" pitch and a recent
 * community feedback list.
 */
export const FeedbackRightRail: React.FC = () => {
  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-blue-50/80 border border-blue-100 p-5" aria-labelledby="why-matters">
        <div className="flex items-center gap-2.5">
          <span className="flex w-9 h-9 rounded-xl bg-blue-600 items-center justify-center shrink-0">
            <Check className="w-4.5 h-4.5 text-white" strokeWidth={3} aria-hidden="true" />
          </span>
          <h2 id="why-matters" className="text-[15px] font-bold text-slate-900">Why Your Feedback Matters?</h2>
        </div>
        <ul className="mt-4 space-y-2.5">
          {WHY_POINTS.map((point) => (
            <li key={point} className="flex items-center gap-2.5 text-[12.5px] font-medium text-slate-700">
              <span className="flex w-4.5 h-4.5 rounded-full bg-blue-600 items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3.5} aria-hidden="true" />
              </span>
              {point}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm" aria-labelledby="recent-feedback">
        <div className="flex items-center justify-between">
          <h2 id="recent-feedback" className="text-[15px] font-bold text-slate-900">Recent Feedback</h2>
          <Link to="/resources" className="flex items-center gap-1 text-[12px] font-semibold text-blue-600 hover:text-blue-500">
            View All
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
        <ul className="mt-3 divide-y divide-slate-100">
          {RECENT.map((item) => (
            <li key={item.title} className="flex items-center gap-3 py-3">
              <span className={`flex w-9 h-9 rounded-full items-center justify-center shrink-0 ${item.iconCls}`}>
                <item.icon className="w-4 h-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-semibold text-slate-800">{item.title}</p>
                <p className="mt-0.5 flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded-md text-[9.5px] font-bold ${item.tagCls}`}>{item.tag}</span>
                  <span className="text-[10.5px] text-slate-400">{item.time}</span>
                </p>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 shrink-0">
                <ThumbsUp className="w-3.5 h-3.5" aria-hidden="true" />
                {item.votes}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
