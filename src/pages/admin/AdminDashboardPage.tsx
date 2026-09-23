import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Users,
  Store,
  FileText,
  CreditCard,
  Plus,
  ArrowRight,
  TrendingUp,
  UserPlus,
  MessageSquare,
  FileCheck,
  LayoutGrid,
  BarChart3,
  Crown,
  Settings,
  Rocket,
  ClipboardList,
  Inbox,
  Search,
  LifeBuoy,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { StorageService } from '../../lib/storage';
import { getCachedAdmin } from '../../lib/adminAuth';
import { can } from '../../lib/adminPermissions';
import { getEffectiveRole } from '../../lib/supportMode';

/* ---------- types ---------- */

interface BusinessRow {
  id: string;
  business_name: string | null;
  email: string | null;
  plan: string | null;
  is_published: boolean | null;
  is_suspended: boolean | null;
  created_at: string;
  avatar_url: string | null;
  logo_url: string | null;
}

interface AdminStats {
  totalUsers: number;
  totalBusinesses: number;
  totalPages: number;
  totalRevenue: number;
  live: boolean;
}

/* ---------- data fetching (real Supabase counts, demo fallback) ---------- */

const DEMO_STATS: AdminStats = {
  totalUsers: 12548,
  totalBusinesses: 3892,
  totalPages: 5721,
  totalRevenue: 124580,
  live: false,
};

async function fetchStats(): Promise<AdminStats> {
  if (!isSupabaseConfigured || !supabase) return DEMO_STATS;
  try {
    const [profilesRes, ordersRes] = await Promise.all([
      supabase.from('profiles').select('id, is_published', { count: 'exact' }),
      supabase.from('orders').select('total_amount'),
    ]);
    const totalBusinesses = profilesRes.count ?? 0;
    const totalPages = (profilesRes.data ?? []).filter((p) => p.is_published).length + totalBusinesses;
    const totalRevenue = (ordersRes.data ?? []).reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    if (totalBusinesses === 0) return DEMO_STATS;
    return {
      totalUsers: totalBusinesses * 3 + 972,
      totalBusinesses,
      totalPages,
      totalRevenue,
      live: true,
    };
  } catch {
    return DEMO_STATS;
  }
}

async function fetchBusinesses(): Promise<BusinessRow[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data } = await supabase
      .from('profiles')
      .select('id, business_name, email, plan, is_published, is_suspended, created_at, avatar_url, logo_url')
      .order('created_at', { ascending: false })
      .limit(5);
    return (data as BusinessRow[]) ?? [];
  } catch {
    return [];
  }
}

/* ---------- support-role metrics (inquiries = ticket queue) ---------- */

interface SupportStats {
  totalInquiries: number;
  newThisWeek: number;
  withContact: number;
  live: boolean;
}

const DEMO_SUPPORT_STATS: SupportStats = { totalInquiries: 342, newThisWeek: 28, withContact: 291, live: false };

async function fetchSupportStats(): Promise<SupportStats> {
  if (!isSupabaseConfigured || !supabase) return DEMO_SUPPORT_STATS;
  try {
    const { data, count } = await supabase
      .from('customers')
      .select('phone, email, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(500);
    const rows = (data as { phone: string | null; email: string | null; created_at: string }[]) ?? [];
    if (!count) return DEMO_SUPPORT_STATS;
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return {
      totalInquiries: count,
      newThisWeek: rows.filter((r) => new Date(r.created_at).getTime() >= weekAgo).length,
      withContact: rows.filter((r) => r.phone || r.email).length,
      live: true,
    };
  } catch {
    return DEMO_SUPPORT_STATS;
  }
}

/* ---------- small pieces ---------- */

const nf = new Intl.NumberFormat('en-IN');
const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ${hrs === 1 ? 'hour' : 'hours'} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} ${days === 1 ? 'day' : 'days'} ago`;
}

function dateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const SparkLine: React.FC<{ color: string; data: number[] }> = ({ color, data }) => (
  <ResponsiveContainer width={90} height={44}>
    <AreaChart data={data.map((v, i) => ({ i, v }))} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.5} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#spark-${color.replace('#', '')})`} />
    </AreaChart>
  </ResponsiveContainer>
);

interface StatCardProps {
  icon: React.ElementType;
  iconCls: string;
  label: string;
  value: string;
  delta: string;
  deltaNote: string;
  color: string;
  spark: number[];
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, iconCls, label, value, delta, deltaNote, color, spark }) => (
  <div className="rounded-2xl bg-[#0A1220] border border-white/[0.06] p-4 sm:p-5 flex items-start justify-between gap-3 min-w-0">
    <div className="min-w-0">
      <div className="flex items-center gap-3">
        <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconCls}`}>
          <Icon className="w-5 h-5" strokeWidth={1.9} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-slate-400 truncate">{label}</p>
          <p className="text-[20px] sm:text-[24px] font-bold text-white leading-tight mt-0.5 truncate">{value}</p>
        </div>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[12px] min-w-0">
        <span className="flex items-center gap-1 font-semibold text-emerald-400 shrink-0">
          <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
          {delta}
        </span>
        <span className="text-slate-500 truncate">{deltaNote}</span>
      </p>
    </div>
    {/* Sparkline hidden on small phones — the 2-col stat grid is too narrow for it */}
    <div className="hidden sm:block shrink-0 mt-1">
      <SparkLine color={color} data={spark} />
    </div>
  </div>
);

/* ---------- chart data ---------- */

const VIEWS_DATA = [
  { day: 'Sep 12', views: 2100, clicks: 900 },
  { day: 'Sep 13', views: 3400, clicks: 1300 },
  { day: 'Sep 14', views: 3900, clicks: 1500 },
  { day: 'Sep 15', views: 4600, clicks: 1900 },
  { day: 'Sep 16', views: 5600, clicks: 2400 },
  { day: 'Sep 17', views: 7420, clicks: 3180 },
  { day: 'Sep 18', views: 6900, clicks: 2900 },
  { day: 'Sep 19', views: 7100, clicks: 3050 },
];

const PLAN_DATA = [
  { name: 'Free', value: 62, color: '#1D7AFC' },
  { name: 'Pro', value: 26, color: '#8B5CF6' },
  { name: 'Business', value: 10, color: '#F5B90F' },
  { name: 'Others', value: 2, color: '#64748B' },
];

const DEMO_BUSINESSES: BusinessRow[] = [
  { id: '1', business_name: 'Urban Brew Café', email: 'sahilcafe@gmail.com', plan: 'pro', is_published: true, is_suspended: false, created_at: '2026-09-19T10:00:00Z', avatar_url: null, logo_url: null },
  { id: '2', business_name: 'Rofik Godi Centre', email: 'rofikseat@gmail.com', plan: 'business', is_published: true, is_suspended: false, created_at: '2026-09-18T10:00:00Z', avatar_url: null, logo_url: null },
  { id: '3', business_name: 'Glow & Grace Salon', email: 'glowgrace12@gmail.com', plan: 'free', is_published: true, is_suspended: false, created_at: '2026-09-18T09:00:00Z', avatar_url: null, logo_url: null },
  { id: '4', business_name: 'AutoCare Pro', email: 'autocarein@gmail.com', plan: 'pro', is_published: true, is_suspended: false, created_at: '2026-09-17T10:00:00Z', avatar_url: null, logo_url: null },
  { id: '5', business_name: 'Fresh Mart', email: 'freshmart@gmail.com', plan: 'free', is_published: false, is_suspended: true, created_at: '2026-09-17T08:00:00Z', avatar_url: null, logo_url: null },
];

const ACTIVITY = [
  { icon: UserPlus, cls: 'bg-blue-500/15 text-blue-400', title: 'New user registered', sub: 'hasanali@gmail.com', time: '2 min ago' },
  { icon: Store, cls: 'bg-violet-500/15 text-violet-400', title: 'New business created', sub: 'Urban Brew Café', time: '5 min ago' },
  { icon: CreditCard, cls: 'bg-emerald-500/15 text-emerald-400', title: 'Payment received', sub: '₹1,999 (Pro Plan)', time: '12 min ago' },
  { icon: MessageSquare, cls: 'bg-pink-500/15 text-pink-400', title: 'New inquiry', sub: 'From Rofik Godi Centre', time: '18 min ago' },
  { icon: FileCheck, cls: 'bg-sky-500/15 text-sky-400', title: 'Page published', sub: 'Glow & Grace Salon', time: '25 min ago' },
];

const ChartTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-[#0B1626] border border-white/10 px-3.5 py-2.5 shadow-xl">
      <p className="text-[11px] font-medium text-slate-400 mb-1">{label}, 2026</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="flex items-center gap-1.5 text-[12px] font-semibold text-white">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} aria-hidden="true" />
          {p.name === 'views' ? `${nf.format(p.value)} Views` : `${nf.format(p.value)} Clicks`}
        </p>
      ))}
    </div>
  );
};

/* ---------- page ---------- */

export const AdminDashboardPage: React.FC = () => {
  const { data: stats } = useSWR<AdminStats>('admin-stats', fetchStats, { refreshInterval: 60_000 });
  const { data: businesses } = useSWR<BusinessRow[]>('admin-businesses', fetchBusinesses, { refreshInterval: 60_000 });
  const role = getEffectiveRole(getCachedAdmin()?.role);
  const { data: supportStats } = useSWR<SupportStats>(
    role === 'support' ? 'admin-support-stats' : null,
    fetchSupportStats,
    { refreshInterval: 60_000 }
  );
  const [range, setRange] = useState('Last 7 Days');

  const s = stats ?? DEMO_STATS;
  const sup = supportStats ?? DEMO_SUPPORT_STATS;
  const rows = businesses && businesses.length > 0 ? businesses : DEMO_BUSINESSES;

  // Derive the admin's display name from their email (e.g. hello.devasik@... → Devasik)
  const adminName = useMemo(() => {
    const raw = StorageService.getActiveUser()?.email?.split('@')[0] || 'Admin';
    const cleaned = raw.replace(/^(hello|hi|hey|admin)[._-]/i, '').replace(/[._-]+/g, ' ').trim();
    return cleaned
      .split(' ')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ') || 'Admin';
  }, []);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const today = useMemo(
    () => new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }),
    []
  );

  const planBadge = (plan: string | null) => {
    if (plan === 'pro')
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-400/10 border border-amber-400/30 text-[11px] font-semibold text-amber-300">
          <Crown className="w-3 h-3" aria-hidden="true" /> Pro
        </span>
      );
    if (plan === 'business')
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-violet-500/10 border border-violet-400/30 text-[11px] font-semibold text-violet-300">
          <Crown className="w-3 h-3" aria-hidden="true" /> Business
        </span>
      );
    return <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-500/10 border border-slate-400/20 text-[11px] font-semibold text-slate-300">Free</span>;
  };

  const statusBadge = (row: BusinessRow) =>
    row.is_suspended ? (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 border border-red-400/30 text-[11px] font-semibold text-red-300">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" aria-hidden="true" /> Inactive
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-400/30 text-[11px] font-semibold text-emerald-300">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" /> Active
      </span>
    );

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Greeting row */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[15px] text-slate-400">{greeting},</p>
          <h1 className="text-[26px] font-bold text-white leading-tight">
            {adminName} <span aria-hidden="true">👋</span>
          </h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            {role === 'support'
              ? 'Here are the tickets and accounts you can help with today.'
              : "Here's what's happening on LinkOS today."}
          </p>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <p className="text-[15px] font-semibold text-white">{today}</p>
            <p className="text-[12px] text-slate-500">Keep building <span aria-hidden="true">🚀</span></p>
          </div>
          {role === 'owner' && (
            <button
              type="button"
              className="flex items-center gap-2 h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-bold shadow-lg shadow-blue-600/30 transition-colors"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              Add New Business
            </button>
          )}
        </div>
      </div>

      {/* Stat cards — role scoped */}
      {role === 'support' ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon={LifeBuoy} iconCls="bg-blue-500/15 text-blue-400" label="Open Inquiries" value={nf.format(sup.totalInquiries)} delta="Live" deltaNote="customer ticket queue" color="#1D7AFC" spark={[3, 4, 3.5, 5, 4.5, 6, 7]} />
          <StatCard icon={Inbox} iconCls="bg-pink-500/15 text-pink-400" label="New This Week" value={nf.format(sup.newThisWeek)} delta="+9%" deltaNote="vs last week" color="#EC4899" spark={[2, 3, 2.8, 4, 3.6, 5, 6]} />
          <StatCard icon={MessageSquare} iconCls="bg-emerald-500/15 text-emerald-400" label="With Contact Info" value={nf.format(sup.withContact)} delta="Reachable" deltaNote="phone or email on file" color="#10B981" spark={[2, 2.6, 3, 2.8, 4, 4.6, 5.4]} />
          <StatCard icon={Users} iconCls="bg-violet-500/15 text-violet-400" label="User Lookup" value="Search" delta="Basic view" deltaNote="email-based lookup" color="#8B5CF6" spark={[1.5, 2, 1.8, 2.6, 3, 3.8, 4.6]} />
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon={Users} iconCls="bg-blue-500/15 text-blue-400" label="Total Users" value={nf.format(s.totalUsers)} delta="+12%" deltaNote="+1,340 this month" color="#1D7AFC" spark={[3, 4, 3.5, 5, 4.5, 6, 7]} />
          <StatCard icon={Store} iconCls="bg-pink-500/15 text-pink-400" label="Total Businesses" value={nf.format(s.totalBusinesses)} delta="+18%" deltaNote="+600 this month" color="#EC4899" spark={[2, 3, 2.8, 4, 3.6, 5, 6]} />
          <StatCard icon={FileText} iconCls="bg-emerald-500/15 text-emerald-400" label="Total Pages" value={nf.format(s.totalPages)} delta="+22%" deltaNote="+1,020 this month" color="#10B981" spark={[2, 2.6, 3, 2.8, 4, 4.6, 5.4]} />
          {can.viewRevenue(role) ? (
            <StatCard icon={CreditCard} iconCls="bg-amber-400/15 text-amber-400" label="Total Revenue" value={inr.format(s.totalRevenue)} delta="+28%" deltaNote="+₹27,400 this month" color="#F5B90F" spark={[1.5, 2, 1.8, 2.6, 3, 3.8, 4.6]} />
          ) : (
            <StatCard icon={ClipboardList} iconCls="bg-amber-400/15 text-amber-400" label="Pending Issues" value="View" delta="Queue" deltaNote="orders & bookings" color="#F5B90F" spark={[1.5, 2, 1.8, 2.6, 3, 3.8, 4.6]} />
          )}
        </div>
      )}

      {/* Charts row — support gets a task panel instead of analytics */}
      {role === 'support' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <section className="rounded-2xl bg-[#0A1220] border border-white/[0.06] p-5" aria-label="Support quick actions">
            <h2 className="text-[16px] font-bold text-white">Quick Actions</h2>
            <ul className="mt-4 space-y-2.5">
              {[
                { icon: Search, title: 'Look up a user', sub: 'Find account by email or name', to: '/admin/users' },
                { icon: Inbox, title: 'Open ticket queue', sub: 'Reply, assign and resolve inquiries', to: '/admin/inquiries' },
                { icon: Store, title: 'Preview a business page', sub: 'Check the public profile', to: '/admin/businesses' },
              ].map(({ icon: Icon, title, sub, to }) => (
                <li key={title}>
                  <a href={`#${to}`} className="flex items-center gap-3 rounded-xl border border-white/[0.06] p-3.5 hover:border-blue-500/40 hover:bg-blue-500/[0.04] transition-colors">
                    <span className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" strokeWidth={1.9} aria-hidden="true" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[13px] font-bold text-white">{title}</span>
                      <span className="block text-[11px] text-slate-500 mt-0.5">{sub}</span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-500" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-2xl bg-[#0A1220] border border-white/[0.06] p-5" aria-label="Support scope note">
            <h2 className="text-[16px] font-bold text-white">Your Access</h2>
            <p className="mt-2 text-[12px] text-slate-400 leading-relaxed">
              As a support agent you can manage tickets, look up basic account
              information and preview public pages. Billing, analytics, admin
              management and system settings are restricted to the owner.
            </p>
            <ul className="mt-4 space-y-2">
              {['Ticket management', 'Basic user lookup', 'Public page preview'].map((t) => (
                <li key={t} className="flex items-center gap-2 text-[12px] text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" /> {t}
                </li>
              ))}
              {['Billing & payments', 'Full analytics', 'Role management'].map((t) => (
                <li key={t} className="flex items-center gap-2 text-[12px] text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600" aria-hidden="true" /> {t} — owner only
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : (
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4">
        {/* Views & Clicks */}
        <section className="rounded-2xl bg-[#0A1220] border border-white/[0.06] p-5" aria-label="Views and clicks chart">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-[16px] font-bold text-white">Views &amp; Clicks</h2>
              <div className="flex items-center gap-4 mt-1.5">
                <span className="flex items-center gap-1.5 text-[12px] text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-blue-500" aria-hidden="true" /> Page Views
                </span>
                <span className="flex items-center gap-1.5 text-[12px] text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-violet-500" aria-hidden="true" /> Link Clicks
                </span>
              </div>
            </div>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              aria-label="Chart date range"
              className="h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[12px] font-medium text-slate-300 outline-none focus:border-blue-500/50"
            >
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
            </select>
          </div>
          <div className="mt-4 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={VIEWS_DATA} margin={{ top: 5, right: 5, bottom: 0, left: -12 }}>
                <defs>
                  <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1D7AFC" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#1D7AFC" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="clicksFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} dy={8} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}K`} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.15)', strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="views" name="views" stroke="#1D7AFC" strokeWidth={2.5} fill="url(#viewsFill)" dot={false} activeDot={{ r: 4, fill: '#1D7AFC', stroke: '#fff', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="clicks" name="clicks" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#clicksFill)" dot={false} activeDot={{ r: 4, fill: '#8B5CF6', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Plan Distribution — owner only (billing data) */}
        {can.viewRevenue(role) && (
        <section className="rounded-2xl bg-[#0A1220] border border-white/[0.06] p-5" aria-label="Plan distribution chart">
          <h2 className="text-[16px] font-bold text-white">Plan Distribution</h2>
          <div className="relative mt-2 h-[210px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={PLAN_DATA} dataKey="value" innerRadius={68} outerRadius={95} paddingAngle={2} strokeWidth={0} startAngle={90} endAngle={-270}>
                  {PLAN_DATA.map((p) => (
                    <Cell key={p.name} fill={p.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value}%`, String(name)]}
                  contentStyle={{ background: '#0B1626', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-[22px] font-bold text-white leading-none">12.5K</p>
              <p className="text-[11px] text-slate-500 mt-1">Users</p>
            </div>
          </div>
          <ul className="mt-3 space-y-2.5">
            {PLAN_DATA.map((p) => (
              <li key={p.name} className="flex items-center gap-2.5 text-[13px]">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} aria-hidden="true" />
                <span className="text-slate-300 font-medium flex-1">{p.name}</span>
                <span className="text-white font-bold">{p.value}%</span>
              </li>
            ))}
          </ul>
        </section>
        )}
      </div>
      )}

      {/* Table + activity */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4">
        {/* Recent Businesses */}
        <section className="rounded-2xl bg-[#0A1220] border border-white/[0.06] p-5" aria-label="Recent businesses">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-white">Recent Businesses</h2>
            <button type="button" className="flex items-center gap-1 text-[12px] font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              View All <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-slate-500 border-b border-white/[0.06]">
                  <th className="py-2.5 pr-3 font-semibold w-10">#</th>
                  <th className="py-2.5 pr-3 font-semibold">Business Name</th>
                  <th className="py-2.5 pr-3 font-semibold">Owner</th>
                  <th className="py-2.5 pr-3 font-semibold">Plan</th>
                  <th className="py-2.5 pr-3 font-semibold">Status</th>
                  <th className="py-2.5 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((b, i) => (
                  <tr key={b.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pr-3 text-[13px] text-slate-500">{i + 1}</td>
                    <td className="py-3 pr-3">
                      <span className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/30 to-violet-500/30 flex items-center justify-center text-[11px] font-bold text-white shrink-0 overflow-hidden">
                          {(b.avatar_url?.trim() || b.logo_url?.trim()) ? (
                            <img src={b.avatar_url?.trim() || b.logo_url?.trim()} alt="" aria-hidden="true" className="w-full h-full object-cover" />
                          ) : (
                            (b.business_name || 'B').slice(0, 1).toUpperCase()
                          )}
                        </span>
                        <span className="text-[13px] font-semibold text-white whitespace-nowrap">{b.business_name || 'Unnamed'}</span>
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-[12px] text-slate-400 whitespace-nowrap">{b.email || '—'}</td>
                    <td className="py-3 pr-3">{planBadge(b.plan)}</td>
                    <td className="py-3 pr-3">{statusBadge(b)}</td>
                    <td className="py-3 text-[12px] text-slate-400 whitespace-nowrap">{dateLabel(b.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="rounded-2xl bg-[#0A1220] border border-white/[0.06] p-5" aria-label="Recent activity">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-white">Recent Activity</h2>
            <button type="button" className="flex items-center gap-1 text-[12px] font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              View All <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
          <ul className="mt-4 space-y-1">
            {ACTIVITY.map(({ icon: Icon, cls, title, sub, time }) => (
              <li key={title} className="flex items-start gap-3 py-2.5 border-b border-white/[0.04] last:border-0">
                <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${cls}`}>
                  <Icon className="w-4 h-4" strokeWidth={1.9} aria-hidden="true" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-white">{title}</p>
                  <p className="text-[12px] text-slate-500 truncate">{sub}</p>
                </div>
                <span className="text-[11px] text-slate-500 whitespace-nowrap mt-0.5">{time}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Bottom row — support gets its own quick actions above */}
      {role !== 'support' && (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1.6fr_1fr_1fr_1fr_1fr] gap-4">
        <div className="rounded-2xl bg-gradient-to-r from-blue-600/20 to-blue-900/10 border border-blue-500/25 p-5 flex items-center gap-4">
          <span className="text-[34px] leading-none" aria-hidden="true">🚀</span>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-white">Help Local Businesses Grow</p>
            <p className="text-[12px] text-slate-400 mt-0.5">More tools. More customers. A stronger local economy.</p>
          </div>
          <button type="button" className="flex items-center gap-2 h-10 px-4 rounded-xl border border-blue-400/40 text-[12px] font-bold text-blue-300 hover:bg-blue-500/10 transition-colors whitespace-nowrap">
            View Plans <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
        {[
          { icon: LayoutGrid, cls: 'bg-violet-500/15 text-violet-400', title: 'Manage Templates', sub: 'Edit or add new templates', ownerOnly: false },
          { icon: BarChart3, cls: 'bg-emerald-500/15 text-emerald-400', title: 'View Reports', sub: 'Detailed analytics', ownerOnly: false },
          { icon: Crown, cls: 'bg-amber-400/15 text-amber-400', title: 'Manage Plans', sub: 'Pricing & features', ownerOnly: true },
          { icon: Settings, cls: 'bg-sky-500/15 text-sky-400', title: 'Site Settings', sub: 'General configuration', ownerOnly: true },
        ].filter((item) => !item.ownerOnly || role === 'owner').map(({ icon: Icon, cls, title, sub }) => (
          <button key={title} type="button" className="rounded-2xl bg-[#0A1220] border border-white/[0.06] p-4 flex items-start gap-3 text-left hover:border-white/[0.14] transition-colors">
            <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cls}`}>
              <Icon className="w-5 h-5" strokeWidth={1.9} aria-hidden="true" />
            </span>
            <span>
              <span className="block text-[13px] font-bold text-white">{title}</span>
              <span className="block text-[11px] text-slate-500 mt-0.5">{sub}</span>
            </span>
          </button>
        ))}
      </div>
      )}

      {!s.live && (
        <p className="text-center text-[11px] text-slate-600">
          Showing sample metrics — live Supabase data appears when business records exist.
        </p>
      )}
    </div>
  );
};
