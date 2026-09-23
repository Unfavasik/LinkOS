import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR, { useSWRConfig } from 'swr';
import { LayoutGrid, CreditCard, ClipboardList, IndianRupee, Pencil } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
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
} from './AdminShared';

/* ---------- Templates ---------- */

interface TemplateRow {
  id: string;
  name: string | null;
  category: string | null;
  description: string | null;
  accent_color?: string | null;
  cover_url?: string | null;
  preview_url?: string | null;
  tags?: string[] | null;
  popularity: number | null;
  is_pro: boolean | null;
  is_active: boolean | null;
  created_at: string;
}

async function fetchTemplates(): Promise<TemplateRow[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('templates')
    .select('id, name, category, description, accent_color, cover_url, preview_url, tags, popularity, is_pro, is_active, created_at')
    .order('popularity', { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as TemplateRow[];
}

export const AdminTemplatesPage: React.FC = () => {
  const { data: templates, error, mutate } = useSWR('admin-templates', fetchTemplates, { refreshInterval: 60_000 });
  const { mutate: globalMutate } = useSWRConfig();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const refreshAll = async () => {
    await mutate();
    // Revalidate the override map so user-facing previews update instantly
    await globalMutate('template-overrides');
  };

  const rows = useMemo(() => {
    const list = templates ?? [];
    const needle = q.trim().toLowerCase();
    return needle
      ? list.filter((t) => t.name?.toLowerCase().includes(needle) || t.category?.toLowerCase().includes(needle))
      : list;
  }, [templates, q]);

  const toggleActive = async (t: TemplateRow) => {
    setBusyId(t.id);
    try {
      const { error: upErr } = await supabase!.from('templates').update({ is_active: !t.is_active }).eq('id', t.id);
      if (upErr) throw upErr;
      await refreshAll();
    } catch (e) {
      console.log('[v0] template update failed:', e);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Templates"
        subtitle={`${templates?.filter((t) => t.is_active !== false).length ?? 0} active of ${templates?.length ?? 0} total.`}
        actions={<SearchInput value={q} onChange={setQ} label="Search templates" placeholder="Search name, category..." />}
      />

      {error ? (
        <div className={PANEL}>
          <ErrorState />
        </div>
      ) : !templates ? (
        <div className={PANEL}>
          <LoadingRows rows={6} />
        </div>
      ) : rows.length === 0 ? (
        <div className={PANEL}>
          <EmptyState title="No templates found" sub={q ? 'Try a different search.' : 'No templates yet.'} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {rows.map((t) => (
            <div key={t.id} className={`${PANEL} p-4 flex flex-col`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                    <LayoutGrid className="w-4.5 h-4.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-white truncate">{t.name || 'Untitled'}</p>
                    <p className="text-[11px] text-slate-500">{t.category || 'General'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {t.is_pro && <Badge tone="amber">Pro</Badge>}
                  <Badge tone={t.is_active === false ? 'red' : 'green'}>{t.is_active === false ? 'Off' : 'Active'}</Badge>
                </div>
              </div>
              {t.description && <p className="mt-2.5 text-[12px] text-slate-400 line-clamp-2">{t.description}</p>}
              {(t.cover_url?.trim() || t.preview_url?.trim()) && (
                <div className="mt-2.5 flex items-center gap-2">
                  {t.preview_url?.trim() ? <img src={t.preview_url.trim()} alt="" aria-hidden="true" className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10" /> : null}
                  {t.cover_url?.trim() ? <img src={t.cover_url.trim()} alt="" aria-hidden="true" className="flex-1 h-10 rounded-lg object-cover" /> : null}
                </div>
              )}
              <div className="mt-3 pt-3 border-t border-white/[0.05] flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500">Popularity: {t.popularity ?? 0}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/templates/${t.id}/edit`)}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-blue-500/15 text-blue-300 hover:bg-blue-500/25 transition-colors"
                  >
                    <span className="inline-flex items-center gap-1">
                      <Pencil className="w-3 h-3" aria-hidden="true" />
                      Edit
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleActive(t)}
                    disabled={busyId === t.id}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] disabled:opacity-50 transition-colors"
                  >
                    {t.is_active === false ? 'Enable' : 'Disable'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ---------- Plans & Payments ---------- */

interface OrderRow {
  id: string;
  customer_name: string | null;
  product_name: string | null;
  total_amount: number | null;
  status: string | null;
  created_at: string;
}

async function fetchOrders(): Promise<OrderRow[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('orders')
    .select('id, customer_name, product_name, total_amount, status, created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as OrderRow[];
}

const PLAN_PRICES: Record<string, { label: string; price: number; tone: string }> = {
  free: { label: 'Free', price: 0, tone: 'from-slate-500/20 to-slate-800/20 border-slate-500/30' },
  pro: { label: 'Pro', price: 199, tone: 'from-amber-500/20 to-amber-800/10 border-amber-500/30' },
  business: { label: 'Business', price: 499, tone: 'from-purple-500/20 to-purple-800/10 border-purple-500/30' },
};

export const AdminPlansPage: React.FC = () => {
  const { data: orders, error } = useSWR('admin-orders', fetchOrders, { refreshInterval: 60_000 });
  const { data: profiles } = useSWR('admin-plan-profiles', async () => {
    if (!isSupabaseConfigured || !supabase) return [];
    const { data, error: e } = await supabase.from('profiles').select('id, plan');
    if (e) throw e;
    return (data ?? []) as { id: string; plan: string | null }[];
  });

  const planCounts = useMemo(() => {
    const counts: Record<string, number> = { free: 0, pro: 0, business: 0 };
    for (const p of profiles ?? []) {
      const k = (p.plan || 'free').toLowerCase();
      counts[k in counts ? k : 'free'] += 1;
    }
    return counts;
  }, [profiles]);

  const totalUsers = profiles?.length || 0;
  const revenue = (orders ?? []).reduce((s, o) => s + (o.total_amount || 0), 0);

  return (
    <div>
      <PageHeader title="Plans & Payments" subtitle="Plan distribution and recent payments across LinkOS." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5">
        {Object.entries(PLAN_PRICES).map(([key, p]) => {
          const count = planCounts[key] ?? 0;
          const pct = totalUsers ? Math.round((count / totalUsers) * 100) : 0;
          return (
            <div key={key} className={`${PANEL} p-4 bg-gradient-to-br ${p.tone}`}>
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold text-white">{p.label} Plan</p>
                <Badge tone={planTone(key === 'free' ? null : key)}>{p.price === 0 ? '₹0' : `₹${p.price}/mo`}</Badge>
              </div>
              <p className="mt-2 text-2xl font-bold text-white">{count.toLocaleString('en-IN')}</p>
              <div className="mt-2 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                <div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">{pct}% of users</p>
            </div>
          );
        })}
      </div>

      <div className={`${PANEL} overflow-hidden`}>
        <div className="px-4 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
          <p className="text-[14px] font-semibold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            Recent Payments
          </p>
          <span className="text-[12px] font-semibold text-emerald-400 flex items-center gap-1">
            <IndianRupee className="w-3.5 h-3.5" aria-hidden="true" />
            {revenue.toLocaleString('en-IN')} total
          </span>
        </div>
        {error ? (
          <ErrorState />
        ) : !orders ? (
          <LoadingRows rows={5} />
        ) : orders.length === 0 ? (
          <EmptyState title="No payments yet" sub="Orders will appear here once customers start paying." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-white/[0.03] border-b border-white/[0.06]">
                <tr>
                  <th className={TH}>Customer</th>
                  <th className={TH}>Product</th>
                  <th className={TH}>Amount</th>
                  <th className={TH}>Status</th>
                  <th className={TH}>Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {orders.slice(0, 20).map((o) => (
                  <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className={`${TD} font-medium text-white`}>{o.customer_name || '—'}</td>
                    <td className={TD}>{o.product_name || '—'}</td>
                    <td className={`${TD} font-semibold text-emerald-400`}>
                      ₹{(o.total_amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className={TD}>
                      <Badge tone={(o.status || '').toLowerCase() === 'paid' ? 'green' : 'amber'}>{o.status || 'Pending'}</Badge>
                    </td>
                    <td className={TD}>{fmtDate(o.created_at)}</td>
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

/* ---------- Orders & Bookings ---------- */

interface QueueRow {
  id: string;
  token: number | null;
  customer_name: string | null;
  service_name: string | null;
  status: string | null;
  created_at: string;
}

async function fetchQueue(): Promise<QueueRow[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('queue_entries')
    .select('id, token, customer_name, service_name, status, created_at')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as QueueRow[];
}

export const AdminOrdersPage: React.FC = () => {
  const { data: orders, error } = useSWR('admin-orders', fetchOrders, { refreshInterval: 60_000 });
  const { data: queue, error: qErr } = useSWR('admin-queue', fetchQueue, { refreshInterval: 60_000 });

  return (
    <div>
      <PageHeader title="Orders & Bookings" subtitle="Customer orders and live queue bookings." />

      <div className={`${PANEL} overflow-hidden mb-5`}>
        <div className="px-4 py-3.5 border-b border-white/[0.06] flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-blue-400" aria-hidden="true" />
          <p className="text-[14px] font-semibold text-white">Orders</p>
        </div>
        {error ? (
          <ErrorState />
        ) : !orders ? (
          <LoadingRows rows={5} />
        ) : orders.length === 0 ? (
          <EmptyState title="No orders yet" sub="Orders placed on business pages will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-white/[0.03] border-b border-white/[0.06]">
                <tr>
                  <th className={TH}>#</th>
                  <th className={TH}>Customer</th>
                  <th className={TH}>Product</th>
                  <th className={TH}>Amount</th>
                  <th className={TH}>Status</th>
                  <th className={TH}>Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {orders.map((o, i) => (
                  <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className={TD}>{i + 1}</td>
                    <td className={`${TD} font-medium text-white`}>{o.customer_name || '—'}</td>
                    <td className={TD}>{o.product_name || '—'}</td>
                    <td className={`${TD} font-semibold text-emerald-400`}>₹{(o.total_amount || 0).toLocaleString('en-IN')}</td>
                    <td className={TD}>
                      <Badge tone={(o.status || '').toLowerCase() === 'paid' ? 'green' : 'amber'}>{o.status || 'Pending'}</Badge>
                    </td>
                    <td className={TD}>{fmtDate(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={`${PANEL} overflow-hidden`}>
        <div className="px-4 py-3.5 border-b border-white/[0.06]">
          <p className="text-[14px] font-semibold text-white">Queue Bookings</p>
        </div>
        {qErr ? (
          <ErrorState />
        ) : !queue ? (
          <LoadingRows rows={4} />
        ) : queue.length === 0 ? (
          <EmptyState title="No bookings yet" sub="Live queue tokens will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead className="bg-white/[0.03] border-b border-white/[0.06]">
                <tr>
                  <th className={TH}>Token</th>
                  <th className={TH}>Customer</th>
                  <th className={TH}>Service</th>
                  <th className={TH}>Status</th>
                  <th className={TH}>Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {queue.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className={`${TD} font-bold text-blue-400`}>#{t.token ?? '—'}</td>
                    <td className={`${TD} font-medium text-white`}>{t.customer_name || '—'}</td>
                    <td className={TD}>{t.service_name || '—'}</td>
                    <td className={TD}>
                      <Badge
                        tone={
                          (t.status || '').toLowerCase() === 'done'
                            ? 'slate'
                            : (t.status || '').toLowerCase() === 'serving'
                              ? 'green'
                              : 'amber'
                        }
                      >
                        {t.status || 'Waiting'}
                      </Badge>
                    </td>
                    <td className={TD}>{fmtDate(t.created_at)}</td>
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
