import React from 'react';

/* Shared dark-theme building blocks for all admin sub-pages */

export const PANEL = 'bg-[#060B16] border border-white/[0.06] rounded-2xl';
export const TH =
  'px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap';
export const TD = 'px-4 py-3 text-[13px] text-slate-300 align-middle';

const BADGE_TONES: Record<string, string> = {
  green: 'bg-emerald-500/15 text-emerald-400',
  red: 'bg-red-500/15 text-red-400',
  blue: 'bg-blue-500/15 text-blue-400',
  purple: 'bg-purple-500/15 text-purple-400',
  amber: 'bg-amber-500/15 text-amber-400',
  slate: 'bg-white/[0.07] text-slate-400',
};

export const Badge: React.FC<{ tone?: keyof typeof BADGE_TONES; children: React.ReactNode }> = ({
  tone = 'slate',
  children,
}) => (
  <span
    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${BADGE_TONES[tone]}`}
  >
    {children}
  </span>
);

export const PageHeader: React.FC<{
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}> = ({ title, subtitle, actions }) => (
  <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-white">{title}</h1>
      {subtitle && <p className="mt-1 text-[13px] text-slate-500">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

export const SearchInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label: string;
}> = ({ value, onChange, placeholder, label }) => (
  <div className="relative w-full sm:w-72">
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={label}
      className="w-full h-10 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[13px] text-slate-200 placeholder:text-slate-500 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
    />
  </div>
);

export const EmptyState: React.FC<{ title: string; sub?: string }> = ({ title, sub }) => (
  <div className="py-14 text-center">
    <p className="text-[14px] font-semibold text-slate-300">{title}</p>
    {sub && <p className="mt-1 text-[12px] text-slate-500">{sub}</p>}
  </div>
);

export const LoadingRows: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="p-4 space-y-2.5" aria-label="Loading" role="status">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-9 rounded-lg bg-white/[0.04] animate-pulse" />
    ))}
  </div>
);

export const ErrorState: React.FC<{ message?: string }> = ({ message }) => (
  <div className="py-12 text-center">
    <p className="text-[14px] font-semibold text-red-400">Could not load data</p>
    <p className="mt-1 text-[12px] text-slate-500">{message || 'Please try again in a moment.'}</p>
  </div>
);

export const fmtDate = (iso: string | null | undefined): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const planTone = (plan: string | null | undefined): keyof typeof BADGE_TONES => {
  const p = (plan || 'free').toLowerCase();
  if (p === 'pro') return 'amber';
  if (p === 'business') return 'purple';
  return 'slate';
};

export const initials = (name: string | null | undefined): string =>
  (name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('') || '?';
