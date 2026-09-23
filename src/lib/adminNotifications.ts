import useSWR from 'swr';
import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Admin panel notifications, derived live from real platform activity:
 * new businesses, new customer inquiries and suspended pages.
 * Read-state is tracked client-side with a "last read" timestamp so the
 * unread badge survives reloads without needing a notifications table.
 */

export interface AdminNotification {
  id: string;
  kind: 'business' | 'inquiry' | 'suspended';
  title: string;
  detail: string;
  created_at: string;
  to: string;
}

const READ_KEY = 'linkos_admin_notifs_read_at';

export function getLastReadAt(): number {
  const v = Number(localStorage.getItem(READ_KEY));
  return Number.isFinite(v) ? v : 0;
}

export function markAllRead(): void {
  localStorage.setItem(READ_KEY, String(Date.now()));
}

export function unreadCount(items: AdminNotification[]): number {
  const last = getLastReadAt();
  return items.filter((n) => new Date(n.created_at).getTime() > last).length;
}

async function fetchNotifications(): Promise<AdminNotification[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const items: AdminNotification[] = [];

  try {
    const [biz, cust, susp] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, business_name, created_at')
        .gte('created_at', weekAgo)
        .order('created_at', { ascending: false })
        .limit(8),
      supabase
        .from('customers')
        .select('id, name, created_at')
        .gte('created_at', weekAgo)
        .order('created_at', { ascending: false })
        .limit(8),
      supabase
        .from('profiles')
        .select('id, business_name, updated_at')
        .eq('is_suspended', true)
        .order('updated_at', { ascending: false })
        .limit(5),
    ]);

    for (const b of biz.data ?? []) {
      items.push({
        id: `biz_${b.id}`,
        kind: 'business',
        title: 'New business registered',
        detail: b.business_name || 'Unnamed business',
        created_at: b.created_at,
        to: '/admin/businesses',
      });
    }
    for (const c of cust.data ?? []) {
      items.push({
        id: `inq_${c.id}`,
        kind: 'inquiry',
        title: 'New customer inquiry',
        detail: c.name || 'A customer reached out',
        created_at: c.created_at,
        to: '/admin/inquiries',
      });
    }
    for (const s of susp.data ?? []) {
      items.push({
        id: `susp_${s.id}`,
        kind: 'suspended',
        title: 'Page suspended',
        detail: s.business_name || 'Unnamed business',
        created_at: s.updated_at || new Date().toISOString(),
        to: '/admin/businesses',
      });
    }
  } catch (e) {
    console.warn('[v0] Failed to load admin notifications:', e);
  }

  return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 15);
}

/** Hook for the topbar bell. */
export function useAdminNotifications() {
  const { data, isLoading } = useSWR<AdminNotification[]>('admin-notifications', fetchNotifications, {
    refreshInterval: 60_000,
  });
  const items = data ?? [];
  return { items, unread: unreadCount(items), isLoading };
}
