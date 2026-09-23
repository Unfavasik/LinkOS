import React, { useMemo } from 'react';
import useSWR from 'swr';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, MousePointerClick, Eye, Settings as SettingsIcon, UserPlus, ShieldCheck } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { PageHeader, Badge, EmptyState, LoadingRows, ErrorState, PANEL, TH, TD, fmtDate } from './AdminShared';

/* ---------- Analytics ---------- */

interface EventRow {
  id: string;
  event_type: string | null;
  created_at: string;
}

async function fetchEvents(): Promise<EventRow[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('analytics_events')
    .select('id, event_type, created_at')
    .order('created_at', { ascending: false })
    .limit(1000);
  if (error) throw error;
  return (data ?? []) as EventRow[];
}

export const AdminAnalyticsPage: React.FC = () => {
  const { data: events, error } = useSWR('admin-analytics-events', fetchEvents, { refreshInterval: 60_000 });

  const { byDay, views, clicks } = useMemo(() => {
    const list = events ?? [];
    const days: Record<string, number> = {};
    let v = 0;
    let c = 0;
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days[d.toISOString().slice(0, 10)] = 0;
    }
    for (const e of list) {
      const key = e.created_at?.slice(0, 10);
      if (key && key in days) days[key] += 1;
      const t = (e.event_type || '').toLowerCase();
      if (t.includes('view')) v += 1;
      if (t.includes('click')) c += 1;
    }
    return {
      byDay: Object.entries(days).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        events: count,
      })),
      views: v,
      clicks: c,
    };
  }, [events]);

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Platform-wide visitor events from the last 14 days." />

      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-5">
        {[
          { label: 'Total Events', value: events?.length ?? 0, icon: BarChart3, cls: 'bg-blue-500/15 text-blue-400' },
          { label: 'Page Views', value: views, icon: Eye, cls: 'bg-emerald-500/15 text-emerald-400' },
          { label: 'Link Clicks', value: clicks, icon: MousePointerClick, cls: 'bg-purple-500/15 text-purple-400' },
        ].map(({ label, value, icon: Icon, cls }) => (
          <div key={label} className={`${PANEL} p-4`}>
            <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${cls}`}>
              <Icon className="w-4.5 h-4.5" aria-hidden="true" />
            </span>
            <p className="mt-2.5 text-xl font-bold text-white">{value.toLocaleString('en-IN')}</p>
            <p className="text-[11px] text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className={`${PANEL} p-4 mb-5`}>
        <p className="text-[14px] font-semibold text-white mb-3">Events per day</p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={byDay} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="evtGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#64748B', fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#0B1626', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: '#94A3B8' }}
              />
              <Area type="monotone" dataKey="events" stroke="#3B82F6" strokeWidth={2} fill="url(#evtGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`${PANEL} overflow-hidden`}>
        <div className="px-4 py-3.5 border-b border-white/[0.06]">
          <p className="text-[14px] font-semibold text-white">Recent Events</p>
        </div>
        {error ? (
          <ErrorState />
        ) : !events ? (
          <LoadingRows rows={5} />
        ) : events.length === 0 ? (
          <EmptyState title="No events yet" sub="Visitor activity will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px]">
              <thead className="bg-white/[0.03] border-b border-white/[0.06]">
                <tr>
                  <th className={TH}>Event</th>
                  <th className={TH}>Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {events.slice(0, 15).map((e) => (
                  <tr key={e.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className={`${TD} font-medium text-white capitalize`}>{(e.event_type || 'event').replace(/_/g, ' ')}</td>
                    <td className={TD}>{new Date(e.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------- Settings ---------- */

interface AdminAccount {
  id: string;
  email: string | null;
  role: string | null;
  is_active: boolean | null;
  created_at: string;
}

interface AdminInvite {
  id: string;
  email: string | null;
  role: string | null;
  status: string | null;
  created_at: string;
}

async function fetchAdminAccounts(): Promise<AdminAccount[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase.from('admins').select('id, email, role, is_active, created_at');
  if (error) throw error;
  return (data ?? []) as AdminAccount[];
}

async function fetchInvites(): Promise<AdminInvite[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('admin_invites')
    .select('id, email, role, status, created_at')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) return [];
  return (data ?? []) as AdminInvite[];
}

export const AdminSettingsPage: React.FC = () => {
  const { data: accounts, error } = useSWR('admin-accounts', fetchAdminAccounts);
  const { data: invites } = useSWR<AdminInvite[]>('admin-invites', fetchInvites);

  return (
    <div>
      <PageHeader title="Settings" subtitle="Admin accounts, invites and site configuration." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Version', value: 'LinkOS Admin v1.0.0', icon: SettingsIcon, cls: 'bg-blue-500/15 text-blue-400' },
          { label: 'Support', value: 'support@linkos.app', icon: ShieldCheck, cls: 'bg-emerald-500/15 text-emerald-400' },
          { label: 'Admin Accounts', value: String(accounts?.length ?? 0), icon: UserPlus, cls: 'bg-purple-500/15 text-purple-400' },
        ].map(({ label, value, icon: Icon, cls }) => (
          <div key={label} className={`${PANEL} p-4 flex items-center gap-3`}>
            <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cls}`}>
              <Icon className="w-5 h-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] text-slate-500">{label}</p>
              <p className="text-[14px] font-semibold text-white truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={`${PANEL} overflow-hidden mb-5`}>
        <div className="px-4 py-3.5 border-b border-white/[0.06]">
          <p className="text-[14px] font-semibold text-white">Admin Accounts</p>
        </div>
        {error ? (
          <ErrorState />
        ) : !accounts ? (
          <LoadingRows rows={3} />
        ) : accounts.length === 0 ? (
          <EmptyState title="No admin accounts" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead className="bg-white/[0.03] border-b border-white/[0.06]">
                <tr>
                  <th className={TH}>Email</th>
                  <th className={TH}>Role</th>
                  <th className={TH}>Status</th>
                  <th className={TH}>Since</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {accounts.map((a) => (
                  <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className={`${TD} font-medium text-white`}>{a.email || '—'}</td>
                    <td className={TD}>
                      <Badge tone={(a.role || '').toLowerCase() === 'owner' ? 'amber' : 'blue'}>{a.role || 'admin'}</Badge>
                    </td>
                    <td className={TD}>
                      <Badge tone={a.is_active ? 'green' : 'red'}>{a.is_active ? 'Active' : 'Disabled'}</Badge>
                    </td>
                    <td className={TD}>{fmtDate(a.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={`${PANEL} overflow-hidden`}>
        <div className="px-4 py-3.5 border-b border-white/[0.06]">
          <p className="text-[14px] font-semibold text-white">Admin Invites</p>
        </div>
        {!invites ? (
          <LoadingRows rows={2} />
        ) : invites.length === 0 ? (
          <EmptyState title="No invites yet" sub="Invited admins will be listed here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead className="bg-white/[0.03] border-b border-white/[0.06]">
                <tr>
                  <th className={TH}>Email</th>
                  <th className={TH}>Role</th>
                  <th className={TH}>Status</th>
                  <th className={TH}>Invited</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {invites.map((v) => (
                  <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className={`${TD} font-medium text-white`}>{v.email || '—'}</td>
                    <td className={TD}>{v.role || 'admin'}</td>
                    <td className={TD}>
                      <Badge tone={v.status === 'accepted' ? 'green' : 'amber'}>{v.status || 'pending'}</Badge>
                    </td>
                    <td className={TD}>{fmtDate(v.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
