import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import { ShieldCheck, ShieldOff, Store, Users as UsersIcon, ExternalLink } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { getCachedAdmin } from '../../lib/adminAuth';
import { can } from '../../lib/adminPermissions';
import {
  PageHeader,
  Badge,
  SearchInput,
  EmptyState,
  LoadingRows,
  ErrorState,
  PANEL,
  TH,
  TD,
  fmtDate,
  planTone,
  initials,
} from './AdminShared';

/* ---------- shared fetchers ---------- */

export interface ProfileRow {
  id: string;
  business_name: string | null;
  username: string | null;
  email: string | null;
  category: string | null;
  city: string | null;
  plan: string | null;
  verified: boolean | null;
  is_published: boolean | null;
  is_suspended: boolean | null;
  created_at: string;
  updated_at: string | null;
  logo_url: string | null;
  avatar_url: string | null;
}

const PROFILE_COLS =
  'id, business_name, username, email, category, city, plan, verified, is_published, is_suspended, created_at, updated_at, logo_url, avatar_url';

async function fetchProfiles(): Promise<ProfileRow[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLS)
    .order('created_at', { ascending: false })
    .limit(300);
  if (error) throw error;
  return (data ?? []) as ProfileRow[];
}

const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

/* ---------- Users ---------- */

interface AdminRow {
  id: string;
  email: string | null;
  role: string | null;
  is_active: boolean | null;
  created_at: string;
}

async function fetchAdmins(): Promise<AdminRow[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase.from('admins').select('id, email, role, is_active, created_at');
  if (error) throw error;
  return (data ?? []) as AdminRow[];
}

export const AdminUsersPage: React.FC = () => {
  const { data: profiles, error, mutate } = useSWR('admin-users', fetchProfiles, { refreshInterval: 60_000 });
  const { data: admins } = useSWR<AdminRow[]>('admin-admins', fetchAdmins, { refreshInterval: 60_000 });
  const [q, setQ] = useState('');

  const rows = useMemo(() => {
    const list = profiles ?? [];
    const needle = q.trim().toLowerCase();
    return needle
      ? list.filter(
          (r) =>
            r.business_name?.toLowerCase().includes(needle) ||
            r.email?.toLowerCase().includes(needle) ||
            r.username?.toLowerCase().includes(needle)
        )
      : list;
  }, [profiles, q]);

  const newThisMonth = (profiles ?? []).filter((p) => p.created_at >= monthStart).length;

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Everyone with a LinkOS account, including business owners."
        actions={<SearchInput value={q} onChange={setQ} label="Search users" placeholder="Search name, email..." />}
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-5">
        {[
          { label: 'Total Users', value: profiles?.length ?? 0, icon: UsersIcon, cls: 'bg-blue-500/15 text-blue-400' },
          { label: 'New This Month', value: newThisMonth, icon: ShieldCheck, cls: 'bg-emerald-500/15 text-emerald-400' },
          { label: 'Admins', value: admins?.length ?? 0, icon: ShieldOff, cls: 'bg-purple-500/15 text-purple-400' },
        ].map(({ label, value, icon: Icon, cls }) => (
          <div key={label} className={`${PANEL} p-4 flex items-center gap-3`}>
            <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cls}`}>
              <Icon className="w-5 h-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11px] text-slate-500">{label}</p>
              <p className="text-lg font-bold text-white">{typeof value === 'number' ? value.toLocaleString('en-IN') : value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={`${PANEL} overflow-hidden`}>
        {error ? (
          <ErrorState />
        ) : !profiles ? (
          <LoadingRows rows={6} />
        ) : rows.length === 0 ? (
          <EmptyState title="No users found" sub={q ? 'Try a different search.' : 'No signups yet.'} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-white/[0.03] border-b border-white/[0.06]">
                <tr>
                  <th className={TH}>#</th>
                  <th className={TH}>User</th>
                  <th className={TH}>Email</th>
                  <th className={TH}>Plan</th>
                  <th className={TH}>Status</th>
                  <th className={TH}>Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {rows.map((r, i) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className={TD}>{i + 1}</td>
                    <td className={TD}>
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-full bg-blue-500/15 text-blue-400 text-[11px] font-bold flex items-center justify-center shrink-0">
                          {initials(r.business_name || r.email)}
                        </span>
                        <span className="font-medium text-white">{r.business_name || '—'}</span>
                      </div>
                    </td>
                    <td className={TD}>{r.email || '—'}</td>
                    <td className={TD}>
                      <Badge tone={planTone(r.plan)}>{(r.plan || 'Free').toLowerCase() === 'free' ? 'Free' : r.plan}</Badge>
                    </td>
                    <td className={TD}>
                      {r.is_suspended ? (
                        <Badge tone="red">Suspended</Badge>
                      ) : r.is_published ? (
                        <Badge tone="green">Active</Badge>
                      ) : (
                        <Badge tone="slate">Draft</Badge>
                      )}
                    </td>
                    <td className={TD}>{fmtDate(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* keep mutate referenced for future refresh actions */}
      <span className="sr-only" onClick={() => mutate()} />
    </div>
  );
};

/* ---------- Businesses ---------- */

export const AdminBusinessesPage: React.FC = () => {
  const { data: profiles, error, mutate } = useSWR('admin-businesses-full', fetchProfiles, { refreshInterval: 60_000 });
  const [q, setQ] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  // Support role gets read-only preview access (no suspend/verify actions).
  const canModerate = can.suspendBusiness(getCachedAdmin()?.role);

  const rows = useMemo(() => {
    const list = profiles ?? [];
    const needle = q.trim().toLowerCase();
    return needle
      ? list.filter(
          (r) => r.business_name?.toLowerCase().includes(needle) || r.category?.toLowerCase().includes(needle)
        )
      : list;
  }, [profiles, q]);

  const toggleField = async (row: ProfileRow, field: 'is_suspended' | 'verified') => {
    setBusyId(row.id);
    try {
      const { error: upErr } = await supabase!.from('profiles').update({ [field]: !row[field] }).eq('id', row.id);
      if (upErr) throw upErr;
      await mutate();
    } catch (e) {
      console.log('[v0] business update failed:', e);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Businesses"
        subtitle="All business pages registered on LinkOS."
        actions={<SearchInput value={q} onChange={setQ} label="Search businesses" placeholder="Search business, category..." />}
      />

      <div className={`${PANEL} overflow-hidden`}>
        {error ? (
          <ErrorState />
        ) : !profiles ? (
          <LoadingRows rows={6} />
        ) : rows.length === 0 ? (
          <EmptyState title="No businesses found" sub={q ? 'Try a different search.' : 'No businesses registered yet.'} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-white/[0.03] border-b border-white/[0.06]">
                <tr>
                  <th className={TH}>#</th>
                  <th className={TH}>Business</th>
                  <th className={TH}>Category</th>
                  <th className={TH}>Plan</th>
                  <th className={TH}>Status</th>
                  <th className={TH}>Created</th>
                  <th className={TH}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {rows.map((r, i) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className={TD}>{i + 1}</td>
                    <td className={TD}>
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
                          <Store className="w-4 h-4" aria-hidden="true" />
                        </span>
                        <div className="leading-tight">
                          <p className="font-medium text-white">{r.business_name || '—'}</p>
                          <p className="text-[11px] text-slate-500">{r.city || r.email || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className={TD}>{r.category || '—'}</td>
                    <td className={TD}>
                      <Badge tone={planTone(r.plan)}>{(r.plan || 'Free').toLowerCase() === 'free' ? 'Free' : r.plan}</Badge>
                    </td>
                    <td className={TD}>
                      {r.is_suspended ? (
                        <Badge tone="red">Suspended</Badge>
                      ) : r.is_published ? (
                        <Badge tone="green">Live</Badge>
                      ) : (
                        <Badge tone="slate">Draft</Badge>
                      )}
                    </td>
                    <td className={TD}>{fmtDate(r.created_at)}</td>
                    <td className={TD}>
                      {canModerate && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggleField(r, 'is_suspended')}
                            disabled={busyId === r.id}
                            className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] disabled:opacity-50 transition-colors"
                          >
                            {r.is_suspended ? 'Unsuspend' : 'Suspend'}
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleField(r, 'verified')}
                            disabled={busyId === r.id}
                            aria-pressed={!!r.verified}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold disabled:opacity-50 transition-colors ${
                              r.verified
                                ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                                : 'bg-white/[0.05] text-slate-300 hover:bg-white/[0.1]'
                            }`}
                          >
                            {r.verified ? 'Verified' : 'Verify'}
                          </button>
                        </div>
                      )}
                    </td>
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

/* ---------- Pages ---------- */

export const AdminPagesPage: React.FC = () => {
  const { data: profiles, error } = useSWR('admin-pages', fetchProfiles, { refreshInterval: 60_000 });
  const [q, setQ] = useState('');

  const rows = useMemo(() => {
    const list = profiles ?? [];
    const needle = q.trim().toLowerCase();
    return needle
      ? list.filter((r) => r.business_name?.toLowerCase().includes(needle) || r.username?.toLowerCase().includes(needle))
      : list;
  }, [profiles, q]);

  const published = (profiles ?? []).filter((p) => p.is_published).length;

  return (
    <div>
      <PageHeader
        title="Pages"
        subtitle={`${published ?? 0} of ${profiles?.length ?? 0} pages are published live.`}
        actions={<SearchInput value={q} onChange={setQ} label="Search pages" placeholder="Search page, username..." />}
      />

      <div className={`${PANEL} overflow-hidden`}>
        {error ? (
          <ErrorState />
        ) : !profiles ? (
          <LoadingRows rows={6} />
        ) : rows.length === 0 ? (
          <EmptyState title="No pages found" sub={q ? 'Try a different search.' : 'No pages created yet.'} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead className="bg-white/[0.03] border-b border-white/[0.06]">
                <tr>
                  <th className={TH}>#</th>
                  <th className={TH}>Page</th>
                  <th className={TH}>Username</th>
                  <th className={TH}>Plan</th>
                  <th className={TH}>Status</th>
                  <th className={TH}>Updated</th>
                  <th className={TH}>View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {rows.map((r, i) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className={TD}>{i + 1}</td>
                    <td className={`${TD} font-medium text-white`}>{r.business_name || '—'}</td>
                    <td className={TD}>/{r.username || '—'}</td>
                    <td className={TD}>
                      <Badge tone={planTone(r.plan)}>{(r.plan || 'Free').toLowerCase() === 'free' ? 'Free' : r.plan}</Badge>
                    </td>
                    <td className={TD}>
                      {r.is_suspended ? (
                        <Badge tone="red">Suspended</Badge>
                      ) : r.is_published ? (
                        <Badge tone="green">Published</Badge>
                      ) : (
                        <Badge tone="slate">Draft</Badge>
                      )}
                    </td>
                    <td className={TD}>{fmtDate(r.updated_at || r.created_at)}</td>
                    <td className={TD}>
                      {r.username ? (
                        <a
                          href={`/${r.username}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-[12px] font-semibold"
                        >
                          Open <ExternalLink className="w-3 h-3" aria-hidden="true" />
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
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
