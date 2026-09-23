import { supabase, isSupabaseConfigured } from './supabase';
import { StorageService } from './storage';

/**
 * User feedback stored in the public.feedback table (feedback_type, message,
 * rating, page_url, status, admin_response, metadata). Visible to owner,
 * admin and support in the admin panel. Falls back to a local queue when
 * Supabase is unreachable so a submission is never lost.
 */

export type FeedbackType = 'general' | 'bug' | 'feature_request' | 'testimonial' | 'complaint';
export type FeedbackStatus = 'new' | 'reviewed' | 'planned' | 'resolved' | 'archived';

export interface FeedbackItem {
  id: string;
  user_id: string | null;
  email: string;
  name: string;
  feedback_type: FeedbackType;
  message: string;
  rating: number | null;
  page_url: string | null;
  status: FeedbackStatus;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
}

interface FeedbackRow {
  id: string;
  user_id: string | null;
  email: string;
  name: string;
  feedback_type: string | null;
  message: string;
  rating: number | null;
  page_url: string | null;
  status: string | null;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
}

const LS_KEY = 'linkos_feedback_v1';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function readLocal(): FeedbackItem[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as FeedbackItem[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(items: FeedbackItem[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  } catch {
    /* storage full — ignore */
  }
}

function rowToFeedback(row: FeedbackRow): FeedbackItem {
  return {
    id: row.id,
    user_id: row.user_id,
    email: row.email,
    name: row.name,
    feedback_type: (row.feedback_type as FeedbackType) || 'general',
    message: row.message,
    rating: row.rating,
    page_url: row.page_url,
    status: (row.status as FeedbackStatus) || 'new',
    admin_response: row.admin_response,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function submitFeedback(input: {
  feedback_type: FeedbackType;
  message: string;
  rating: number | null;
  subject?: string;
  email?: string;
}): Promise<FeedbackItem> {
  const user = StorageService.getActiveUser();
  const now = new Date().toISOString();
  const item: FeedbackItem = {
    id: crypto.randomUUID(),
    user_id: user?.id && UUID_RE.test(user.id) ? user.id : null,
    email: input.email?.trim() || user?.email || 'guest@linkos.app',
    name: user?.business_name || 'Guest user',
    feedback_type: input.feedback_type,
    message: input.subject?.trim() ? `${input.subject.trim()}\n\n${input.message}` : input.message,
    rating: input.rating,
    page_url: window.location.pathname,
    status: 'new',
    admin_response: null,
    created_at: now,
    updated_at: now,
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('feedback').insert({
        user_id: item.user_id,
        email: item.email,
        name: item.name,
        feedback_type: item.feedback_type,
        message: item.message,
        rating: item.rating,
        page_url: item.page_url,
        status: item.status,
      });
      if (!error) return item;
      console.warn('[v0] feedback insert failed, saving locally:', error.message);
    } catch (err) {
      console.warn('[v0] feedback insert error:', err);
    }
  }

  writeLocal([item, ...readLocal()]);
  return item;
}

export async function fetchAllFeedback(): Promise<FeedbackItem[]> {
  let remote: FeedbackItem[] | null = null;
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (!error && data) {
        remote = (data as FeedbackRow[]).map(rowToFeedback);
      } else if (error) {
        console.warn('[v0] feedback fetch failed:', error.message);
      }
    } catch (err) {
      console.warn('[v0] feedback fetch error:', err);
    }
  }
  if (!remote) return readLocal().sort((a, b) => b.created_at.localeCompare(a.created_at));
  const remoteIds = new Set(remote.map((f) => f.id));
  const localOnly = readLocal().filter((f) => !remoteIds.has(f.id));
  return [...remote, ...localOnly].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function setFeedbackStatus(id: string, status: FeedbackStatus): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('feedback')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (!error) return;
    } catch {
      /* fall through to local */
    }
  }
  const items = readLocal();
  const idx = items.findIndex((f) => f.id === id);
  if (idx !== -1) {
    items[idx] = { ...items[idx], status, updated_at: new Date().toISOString() };
    writeLocal(items);
  }
}

export async function replyToFeedback(id: string, response: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('feedback')
        .update({ admin_response: response, status: 'reviewed', updated_at: new Date().toISOString() })
        .eq('id', id);
      if (!error) return;
    } catch {
      /* fall through to local */
    }
  }
  const items = readLocal();
  const idx = items.findIndex((f) => f.id === id);
  if (idx !== -1) {
    items[idx] = {
      ...items[idx],
      admin_response: response,
      status: 'reviewed',
      updated_at: new Date().toISOString(),
    };
    writeLocal(items);
  }
}
