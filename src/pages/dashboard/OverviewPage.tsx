import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  FileText,
  Eye,
  Link2,
  TrendingUp,
  Plus,
  Crown,
  LayoutTemplate,
  BarChart3,
  QrCode,
  ArrowRight,
  Share2,
  UserPen,
} from 'lucide-react';
import { Profile } from '../../types';
import { ShareModal } from '../../components/profile/ShareModal';
import { StorageService } from '../../lib/storage';
import { buildPagesFromProfile } from './pagesData';
import useSWR from 'swr';
import { fetchMyWebsites, summarize } from '../../lib/websites';

export const OverviewPage: React.FC = () => {
  const { profile } = useOutletContext<{ profile: Profile | null; setProfile: (p: Profile | null) => void }>();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [liveStats, setLiveStats] = useState<{ views: string; clicks: string } | null>(null);

  const pages = buildPagesFromProfile(profile);

  // Real analytics for the signed-in user's page (demo fallback keeps its sample numbers)
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

  const ownerName = profile?.business_name
    ? profile.business_name.split(' ').slice(0, 2).join(' ')
    : 'My Business';
  const ownerEmail = profile?.email || '';
  const initials = ownerName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const isPro = profile?.plan === 'pro' || profile?.plan === 'business';

  const stats = [
    { icon: FileText, value: String(pages.length), label: 'Pages', color: 'text-blue-400' },
    { icon: Eye, value: liveStats?.views ?? pages[0]?.views ?? '0', label: 'Total Views', color: 'text-sky-400' },
    { icon: Link2, value: liveStats?.clicks ?? pages[0]?.clicks ?? '0', label: 'Link Clicks', color: 'text-fuchsia-400' },
    { icon: TrendingUp, value: liveStats ? liveStats.views : '—', label: 'This Month', color: 'text-emerald-400' },
  ];

  const quickActions = [
    { icon: Plus, label: 'New Page', to: '/dashboard/templates' },
    { icon: LayoutTemplate, label: 'Templates', to: '/dashboard/templates' },
    { icon: BarChart3, label: 'Analytics', to: '/dashboard/analytics' },
    { icon: QrCode, label: 'My QR Code', to: '/dashboard/qr' },
  ];

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Welcome card */}
      <section className="rounded-2xl bg-[#0B1424] border border-white/10 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={`${ownerName} profile photo`}
                className="w-14 h-14 rounded-full object-cover border-2 border-white/20 shrink-0"
              />
            ) : (
              <img
                src="/images/default-avatar.png"
                alt="Default avatar"
                className="w-14 h-14 rounded-full object-cover border-2 border-white/20 shrink-0"
              />
            )}
            <div>
              <p className="text-xs text-slate-400">Welcome back,</p>
              <p className="text-lg font-extrabold leading-tight flex items-center gap-1.5">
                {ownerName}
                <span className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center" aria-label="Verified">
                  <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 fill-none stroke-white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6.5 5 9l4.5-6" /></svg>
                </span>
                <Link
                  to="/dashboard/profile"
                  aria-label="Edit profile"
                  className="p-1 rounded-md text-slate-500 hover:text-blue-400 hover:bg-white/5 transition-colors"
                >
                  <UserPen className="w-3.5 h-3.5" />
                </Link>
              </p>
              <p className="text-[11px] text-slate-500">{ownerEmail}</p>
            </div>
          </div>
          {isPro && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1.5 text-[11px] font-bold text-amber-400 shrink-0">
              <Crown className="w-3.5 h-3.5" /> {profile?.plan === 'business' ? 'Business Plan' : 'Pro Plan'}
            </span>
          )}
        </div>
        <p className="mt-3.5 text-xs text-slate-400 leading-relaxed">
          Manage your business pages, track performance and grow faster with LinkOS.
        </p>
      </section>

      {/* Stats row */}
      <section className="grid grid-cols-4 gap-2.5">
        {stats.map(({ icon: Icon, value, label, color }) => (
          <div key={label} className="rounded-xl bg-[#0B1424] border border-white/10 p-3 flex flex-col items-center text-center gap-1">
            <Icon className={`w-5 h-5 ${color}`} />
            <span className="text-base font-extrabold leading-none">{value}</span>
            <span className="text-[9px] text-slate-500 leading-tight">{label}</span>
          </div>
        ))}
      </section>

      {/* My Websites — multi-website section */}
      <MyWebsitesSection />

      {/* Upgrade banner */}
      {!isPro && (
      <section className="rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#0B1424] to-[#0B1424] border border-amber-500/25 p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
            <Crown className="w-5 h-5 text-amber-400" />
          </span>
          <div>
            <p className="text-sm font-extrabold text-amber-400">Upgrade to Pro</p>
            <p className="text-[11px] text-slate-400 leading-snug">Get advanced analytics, custom domain, more templates and more.</p>
          </div>
        </div>
        <Link
          to="/dashboard/settings"
          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#1A1300] px-4 py-2 text-xs font-bold shrink-0 transition-colors"
        >
          Upgrade <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </section>
      )}

      {/* Quick Actions */}
      <section>
        <h2 className="text-base font-extrabold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-2.5">
          {quickActions.map(({ icon: Icon, label, to }) => (
            <Link
              key={label}
              to={to}
              className="rounded-xl bg-[#0B1424] border border-white/10 p-3 flex flex-col items-center gap-1.5 text-center hover:border-blue-500/40 transition-colors"
            >
              <Icon className="w-5 h-5 text-blue-400" />
              <span className="text-[10px] font-semibold text-slate-300 leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Explore Templates */}
      <section className="rounded-2xl bg-[#0B1424] border border-white/10 p-4 flex items-center justify-between gap-4 overflow-hidden">
        <div className="min-w-0">
          <p className="text-sm font-extrabold flex items-center gap-1.5">
            <LayoutTemplate className="w-4 h-4 text-blue-400" /> Explore Templates
          </p>
          <p className="mt-1 text-[11px] text-slate-400 leading-snug">Choose from 50+ professional templates for your business.</p>
          <Link
            to="/dashboard/templates"
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold transition-colors"
          >
            Browse <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="hidden sm:flex items-center gap-2 shrink-0 -rotate-3">
          <img src="/images/cafe/cover.webp" alt="" className="w-16 h-20 rounded-lg object-cover border border-white/10" />
          <img src="/images/cards/salon.webp" alt="" className="w-16 h-20 rounded-lg object-cover border border-white/10 rotate-6 translate-y-2" />
        </div>
      </section>

      {/* Share (header avatar action) */}
      {profile && (
        <button type="button" onClick={() => setIsShareOpen(true)} className="sr-only">
          <Share2 /> Share page
        </button>
      )}
      {profile && (
        <ShareModal profile={profile} isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
      )}
    </div>
  );
};

/** Prominent My Websites section on the main dashboard — lists every
 *  website the signed-in user owns (websites table, owner_id scoped). */
const MyWebsitesSection: React.FC = () => {
  const { data: sites } = useSWR('my-websites', fetchMyWebsites, { fallbackData: [] });
  const list = (sites ?? []).map(summarize);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-extrabold">My Websites</h2>
        <Link to="/dashboard/websites" className="text-xs font-semibold text-blue-400 inline-flex items-center gap-1">
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl bg-[#0B1424] border border-white/10 p-5 text-center">
          <p className="text-sm font-bold text-white">Your websites will appear here</p>
          <p className="mt-1 text-xs text-slate-400">Create your first website using one of our ready-made templates.</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Link
              to="/dashboard/websites/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-[11px] font-bold text-white hover:bg-blue-500"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Website
            </Link>
            <Link
              to="/dashboard/templates"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/15 text-[11px] font-bold text-slate-200 hover:bg-white/5"
            >
              Browse Templates
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {list.slice(0, 4).map((site) => (
            <Link
              key={site.id}
              to={`/dashboard/websites/${site.id}`}
              className="flex items-center gap-3 rounded-2xl bg-[#0B1424] border border-white/10 p-3.5 hover:border-white/20 transition-colors"
            >
              <img src={site.cover} alt={`${site.name} preview`} className="w-12 h-12 rounded-xl object-cover border border-white/10" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold truncate">{site.name}</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold shrink-0 ${
                      site.status === 'live' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${site.status === 'live' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    {site.status === 'live' ? 'Live' : 'Draft'}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-400 truncate">
                  {site.template_name} · <span className="font-mono text-blue-400">linkos.app/{site.slug}</span>
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};
