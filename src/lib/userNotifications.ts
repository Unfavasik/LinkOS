/**
 * User-facing notifications — Supabase-backed (`user_notifications` table).
 *
 * Admins can send a notification to every user (broadcast) or to one
 * specific user (recipient_id). Published announcements also fan out here
 * as kind='announcement' items. Read-state is tracked client-side with a
 * "last read" timestamp so broadcast rows stay shareable across users.
 */

import useSWR from 'swr';
import { supabase, isSupabaseConfigured } from './supabase';
import { StorageService } from './storage';

export interface UserNotification {
  id: string;
  /** Target user's local id; null/absent means the row is a broadcast. */
  recipient_id: string | null;
  broadcast: boolean;
  kind: 'general' | 'announcement';
  title: string;
  body: string;
  link: string | null;
  created_at: string;
}

const READ_KEY = 'linkos_user_notifs_read_at';

export function getLastReadAt(): number {
  const v = Number(localStorage.getItem(READ_KEY));
  return Number.isFinite(v) ? v : 0;
}

export function markAllNotificationsRead(): void {
  localStorage.setItem(READ_KEY, String(Date.now()));
}

export function unreadCount(items: UserNotification[]): number {
  const last = getLastReadAt();
  return items.filter((n) => new Date(n.created_at).getTime() > last).length;
}

function normalize(row: Record<string, unknown>): UserNotification {
  return {
    id: row.id as string,
    recipient_id: (row.recipient_id as string) || null,
    broadcast: row.broadcast !== false,
    kind: row.kind === 'announcement' ? 'announcement' : 'general',
    title: (row.title as string) || '',
    body: (row.body as string) || '',
    link: (row.link as string) || null,
    created_at: (row.created_at as string) || new Date().toISOString(),
  };
}

async function fetchMyNotifications(): Promise<UserNotification[]> {
  const uid = StorageService.getActiveUser()?.id;
  if (!isSupabaseConfigured || !supabase || !uid) return [];
  const { data, error } = await supabase
    .from('user_notifications')
    .select('*')
    .or(`broadcast.eq.true,recipient_id.eq.${uid}`)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) {
    console.log('[v0] fetch user notifications failed:', error.message);
    return [];
  }
  return (data ?? []).map(normalize);
}

/** Hook for the dashboard bell and the notifications page. */
export function useUserNotifications() {
  const { data, isLoading, mutate } = useSWR<UserNotification[]>('user-notifications', fetchMyNotifications, {
    refreshInterval: 60_000,
  });
  const items = data ?? [];
  return { items, unread: unreadCount(items), isLoading, refresh: mutate };
}

export async function sendNotification(input: {
  /** Omit to notify every user. */
  recipientId?: string | null;
  kind?: 'general' | 'announcement';
  title: string;
  body?: string;
  link?: string | null;
}): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const broadcast = !input.recipientId;
  const { error } = await supabase.from('user_notifications').insert({
    recipient_id: input.recipientId ?? null,
    broadcast,
    kind: input.kind ?? 'general',
    title: input.title.trim(),
    body: (input.body ?? '').trim(),
    link: input.link ?? null,
  });
  if (error) {
    console.log('[v0] send notification failed:', error.message);
    return false;
  }
  return true;
}
