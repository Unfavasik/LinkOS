import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  MoreVertical,
  Copy,
  Check,
  ExternalLink,
  Share2,
  Edit3,
  Scissors,
  QrCode,
  Eye,
  Link2,
  CalendarDays,
  TrendingUp,
  Globe,
  Instagram,
  Search,
  MessageCircle,
  MoreHorizontal,
  ChevronDown,
} from 'lucide-react';
import { Profile } from '../../types';
import { StorageService } from '../../lib/storage';
import { buildPagesFromProfile } from './pagesData';

const CHART_POINTS = [180, 320, 420, 640, 780, 1248, 1080, 1420];
const CHART_DAYS = ['Sep 13', 'Sep 14', 'Sep 15', 'Sep 16', 'Sep 17', 'Sep 18', 'Sep 19'];
const TOOLTIP_INDEX = 5; // Sep 17 — 1,248 views

const REFERRERS = [
  { icon: Globe, label: 'Direct', pct: 52, color: 'bg-blue-500' },
  { icon: Instagram, label: 'Instagram', pct: 18, color: 'bg-fuchsia-500' },
  { icon: Search, label: 'Google Search', pct: 14, color: 'bg-emerald-400' },
  { icon: MessageCircle, label: 'WhatsApp', pct: 9, color: 'bg-emerald-500' },
  { icon: MoreHorizontal, label: 'Other', pct: 7, color: 'bg-slate-500' },
];

const ACTIVITY = [
  { icon: Eye, color: 'bg-blue-500/20 text-blue-400', title: 'New page view', sub: 'from West Bengal, India', time: '2 min ago' },
  { icon: Link2, color: 'bg-fuchsia-500/20 text-fuchsia-400', title: 'Link clicked (Menu)', sub: 'from Instagram', time: '5 min ago' },
  { icon: CalendarDays, color: 'bg-emerald-500/20 text-emerald-400', title: 'New booking', sub: 'Table for 2 • Sep 20', time: '12 min ago' },
  { icon: Share2, color: 'bg-sky-500/20 text-sky-400', title: 'Page shared', sub: 'via WhatsApp', time: '28 min ago' },
];

export const PageDetailPage: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const { profile } = useOutletContext<{ profile: Profile | null; setProfile: (p: Profile | null) => void }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [range, setRange] = useState('Last 7 Days');
  const [liveStats, setLiveStats] = useState<{ views: string; clicks: string } | null>(null);

  const pages = useMemo(() => buildPagesFromProfile(profile), [profile]);
  const page = useMemo(
    () => pages.find((p) => p.id === pageId || p.link.endsWith(`/${pageId}`)) ?? pages[0],
    [pages, pageId],
  );

  // Real analytics for this page (demo fallback keeps its sample numbers)
  useEffect(() => {
    let mounted = true;
    if (!profile) {
      setLiveStats(null);
      return;
    }
    StorageService.getAnalytics(profile.id)
      .then((a) => {
        if (!mounted) return;
        const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n));
        setLiveStats({ views: fmt(a.totalViews), clicks: fmt(a.linkClicks) });
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [profile]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/${page.link.replace('linkos.in/', '')}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Build SVG path for the chart (viewBox 0 0 320 140)
  const max = Math.max(...CHART_POINTS) * 1.1;
  const pts = CHART_POINTS.map((v, i) => [
    10 + (i * 300) / (CHART_POINTS.length - 1),
    130 - (v / max) * 115,
  ]);
  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},130 L${pts[0][0].toFixed(1)},130 Z`;
  const [tipX, tipY] = pts[TOOLTIP_INDEX];

  const perfStats = [
    { icon: Eye, value: liveStats?.views ?? page.views, label: 'Views', color: 'text-blue-400' },
    { icon: Link2, value: liveStats?.clicks ?? page.clicks, label: 'Clicks', color: 'text-emerald-400' },
    { icon: CalendarDays, value: '12', label: 'Bookings', color: 'text-fuchsia-400' },
    { icon: TrendingUp, value: '+68%', label: 'Growth', color: 'text-emerald-400' },
  ];

  const actions = [
    { icon: Edit3, label: 'Edit Page', to: '/dashboard/editor' },
    { icon: Scissors, label: 'Customize', to: '/dashboard/editor' },
    { icon: QrCode, label: 'QR Code', to: '/dashboard/qr' },
    { icon: MoreVertical, label: 'More', to: '/dashboard/settings' },
  ];

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            aria-label="Back to dashboard"
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-extrabold truncate">{page.name}</h1>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold text-emerald-400 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {page.status}
          </span>
        </div>
        <button type="button" aria-label="Page options" className="p-2 rounded-full hover:bg-white/10 text-slate-400 shrink-0">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <nav className="flex gap-1 rounded-xl bg-[#0B1424] border border-white/10 p-1">
        {[
          { label: 'Overview', active: true },
          { label: 'Edit', to: '/dashboard/editor' },
          { label: 'Analytics', to: '/dashboard/analytics' },
          { label: 'Settings', to: '/dashboard/settings' },
        ].map((t) =>
          t.active ? (
            <span key={t.label} className="flex-1 text-center py-2 rounded-lg bg-blue-600 text-xs font-bold text-white">
              {t.label}
            </span>
          ) : (
            <Link key={t.label} to={t.to!} className="flex-1 text-center py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
              {t.label}
            </Link>
          ),
        )}
      </nav>

      {/* Page summary card */}
      <section className="rounded-2xl bg-[#0B1424] border border-white/10 p-4 flex items-center gap-4">
        {page.cover?.trim() ? (
          <img src={page.cover.trim()} alt={`${page.name} cover`} className="w-20 h-20 rounded-xl object-cover border border-white/10 shrink-0" />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-blue-500/10 border border-white/10 shrink-0 flex items-center justify-center text-xs font-bold text-blue-400">
            {page.name.charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold truncate">{page.name}</p>
          <p className="text-[11px] text-slate-400">{page.category}</p>
          <button
            type="button"
            onClick={handleCopy}
            className="mt-1 text-[11px] text-blue-400 font-medium inline-flex items-center gap-1.5 hover:underline"
          >
            {page.link}
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
          <div className="mt-2.5 flex items-center gap-2">
            <a
              href={`/${page.link.replace('linkos.in/', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 text-[11px] font-bold transition-colors"
            >
              View Page <ExternalLink className="w-3 h-3" />
            </a>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 px-3.5 py-1.5 text-[11px] font-bold text-slate-200 transition-colors"
            >
              <Share2 className="w-3 h-3" /> Share
            </button>
          </div>
        </div>
      </section>

      {/* Action grid */}
      <section className="grid grid-cols-4 gap-2.5">
        {actions.map(({ icon: Icon, label, to }) => (
          <Link
            key={label}
            to={to}
            className="rounded-xl bg-[#0B1424] border border-white/10 p-3 flex flex-col items-center gap-1.5 text-center hover:border-blue-500/40 transition-colors"
          >
            <Icon className="w-5 h-5 text-blue-400" />
            <span className="text-[10px] font-semibold text-slate-300">{label}</span>
          </Link>
        ))}
      </section>

      {/* Performance */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-extrabold">Performance</h2>
          <button
            type="button"
            onClick={() => setRange(range === 'Last 7 Days' ? 'Last 30 Days' : 'Last 7 Days')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-slate-300 hover:bg-white/10 transition-colors"
          >
            {range} <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2.5">
          {perfStats.map(({ icon: Icon, value, label, color }) => (
            <div key={label} className="rounded-xl bg-[#0B1424] border border-white/10 p-3 flex flex-col items-center text-center gap-1">
              <Icon className={`w-5 h-5 ${color}`} />
              <span className="text-base font-extrabold leading-none">{value}</span>
              <span className="text-[9px] text-slate-500">{label}</span>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="mt-3 rounded-2xl bg-[#0B1424] border border-white/10 p-4">
          <div className="relative">
            <svg viewBox="0 0 320 140" className="w-full h-36" role="img" aria-label="Views over the last 7 days">
              <defs>
                <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0, 1, 2, 3].map((i) => (
                <line key={i} x1="10" x2="310" y1={15 + i * 32} y2={15 + i * 32} stroke="#FFFFFF" strokeOpacity="0.05" />
              ))}
              <path d={area} fill="url(#chartFill)" />
              <path d={line} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={tipX} x2={tipX} y1={tipY} y2="130" stroke="#FFFFFF" strokeOpacity="0.25" strokeDasharray="3 3" />
              <circle cx={tipX} cy={tipY} r="4.5" fill="#3B82F6" stroke="#fff" strokeWidth="2" />
            </svg>
            <div
              className="absolute -translate-x-1/2 -translate-y-full rounded-lg bg-[#1A2740] border border-white/15 px-2.5 py-1.5 text-center shadow-lg"
              style={{ left: `${(tipX / 320) * 100}%`, top: `${(tipY / 140) * 100}%`, marginTop: '-8px' }}
            >
              <p className="text-[10px] font-extrabold text-white leading-none">1,248 Views</p>
              <p className="text-[8px] text-slate-400 mt-0.5">Sep 17, 2026</p>
            </div>
          </div>
          <div className="mt-1 flex justify-between text-[9px] text-slate-500 px-1">
            {CHART_DAYS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Top Referrers */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-extrabold">Top Referrers</h2>
          <Link to="/dashboard/analytics" className="text-xs font-semibold text-blue-400">View All</Link>
        </div>
        <div className="rounded-2xl bg-[#0B1424] border border-white/10 p-4 space-y-3">
          {REFERRERS.map(({ icon: Icon, label, pct, color }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                <Icon className="w-3.5 h-3.5 text-slate-300" />
              </span>
              <span className="text-xs font-medium text-slate-300 w-24 shrink-0">{label}</span>
              <span className="text-[11px] font-bold text-slate-200 w-8 text-right shrink-0">{pct}%</span>
              <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-extrabold">Recent Activity</h2>
          <Link to="/dashboard/analytics" className="text-xs font-semibold text-blue-400">View All</Link>
        </div>
        <div className="rounded-2xl bg-[#0B1424] border border-white/10 divide-y divide-white/5">
          {ACTIVITY.map(({ icon: Icon, color, title, sub, time }) => (
            <div key={title} className="flex items-center gap-3 p-3.5">
              <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="w-4 h-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold">{title}</p>
                <p className="text-[10px] text-slate-500 truncate">{sub}</p>
              </div>
              <span className="text-[10px] text-slate-500 shrink-0">{time}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
