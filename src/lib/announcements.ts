/**
 * Platform-wide announcements — Supabase-backed.
 *
 * Admins compose announcements in the admin panel; published ones appear on
 * the public /announcements page (linked from the Support Center sidebar).
 * Stored in the `announcements` table so every visitor sees the same feed
 * (the previous localStorage store was per-browser and invisible to users).
 */

import { supabase, isSupabaseConfigured } from './supabase';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  created_at: string;
  /** Drafts stay in the admin panel only; published items go public. */
  published: boolean;
}

function normalize(row: Record<string, unknown>): Announcement {
  return {
    id: row.id as string,
    title: (row.title as string) || '',
    body: (row.body as string) || '',
    created_at: (row.created_at as string) || new Date().toISOString(),
    published: row.published !== false,
  };
}

/** Every announcement, including drafts — admin only. */
export async function loadAnnouncements(): Promise<Announcement[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.log('[v0] load announcements failed:', error.message);
    return [];
  }
  return (data ?? []).map(normalize);
}

export async function addAnnouncement(input: {
  title: string;
  body: string;
  published: boolean;
}): Promise<Announcement | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from('announcements')
    .insert({ title: input.title.trim(), body: input.body.trim(), published: input.published })
    .select('*')
    .single();
  if (error) {
    console.log('[v0] add announcement failed:', error.message);
    return null;
  }
  return normalize(data);
}

export async function updateAnnouncement(
  id: string,
  patch: Partial<Pick<Announcement, 'title' | 'body' | 'published'>>,
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from('announcements').update(patch).eq('id', id);
  if (error) {
    console.log('[v0] update announcement failed:', error.message);
    return false;
  }
  return true;
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from('announcements').delete().eq('id', id);
  if (error) {
    console.log('[v0] delete announcement failed:', error.message);
    return false;
  }
  return true;
}

/** Published announcements for the public feed. */
export async function loadPublishedAnnouncements(): Promise<Announcement[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });
  if (error) {
    console.log('[v0] load published announcements failed:', error.message);
    return [];
  }
  return (data ?? []).map(normalize);
}
