/**
 * Guides & Tutorials — Supabase-backed article catalogue.
 *
 * Public pages read published guides; the admin panel creates, edits and
 * deletes them. Steps are ordered and each step can carry an image (uploaded
 * images are converted to WebP by StorageService.uploadImage) or a plain URL.
 */

import { supabase, isSupabaseConfigured } from './supabase';

export interface GuideStep {
  title: string;
  body: string;
  /** Supabase Storage (WebP) or external image URL */
  image_url?: string;
  image_alt?: string;
}

export interface Guide {
  id?: string;
  slug: string;
  title: string;
  intro: string;
  tag: string;
  read_time: string;
  hero_url: string;
  hero_alt: string;
  learn: string[];
  /** Button label for the video CTA, e.g. "Watch Video Tutorial (3:45)" */
  video: string;
  /** Supabase Storage (WebM) or external video URL; empty = no video */
  video_url: string;
  /** Topic tags shown as chips, e.g. ["Getting Started", "Templates"] */
  tags: string[];
  steps: GuideStep[];
  /** When false the published guide hides "Step 1, Step 2…" numbering. */
  show_step_numbers: boolean;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

export const GUIDE_TAG_OPTIONS = ['Guide', 'Template', 'Business Tip', 'Tutorial'] as const;

export const slugifyGuide = (title: string): string =>
  title
    .toLowerCase()
    .replace(/^how to /, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

function normalize(row: Record<string, unknown>): Guide {
  return {
    id: row.id as string,
    slug: (row.slug as string) || '',
    title: (row.title as string) || '',
    intro: (row.intro as string) || '',
    tag: (row.tag as string) || 'Guide',
    read_time: (row.read_time as string) || '',
    hero_url: (row.hero_url as string) || '',
    hero_alt: (row.hero_alt as string) || '',
    learn: Array.isArray(row.learn) ? (row.learn as string[]) : [],
    video: (row.video as string) || '',
    video_url: (row.video_url as string) || '',
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    steps: Array.isArray(row.steps) ? (row.steps as GuideStep[]) : [],
    show_step_numbers: row.show_step_numbers !== false,
    is_published: row.is_published !== false,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

/** Published guides for the public list/article pages. */
export async function loadPublishedGuides(): Promise<Guide[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('guides')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(normalize);
}

/** Every guide, including drafts — admin only. */
export async function loadAllGuides(): Promise<Guide[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('guides')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(normalize);
}

export async function getGuideBySlug(slug: string): Promise<Guide | undefined> {
  if (!isSupabaseConfigured || !supabase) return undefined;
  const { data, error } = await supabase.from('guides').select('*').eq('slug', slug).maybeSingle();
  if (error) return undefined;
  return data ? normalize(data) : undefined;
}

export async function saveGuide(guide: Guide): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) return { ok: false, error: 'Supabase is not connected.' };
  const payload = {
    slug: guide.slug,
    title: guide.title,
    intro: guide.intro,
    tag: guide.tag,
    read_time: guide.read_time,
    hero_url: guide.hero_url,
    hero_alt: guide.hero_alt,
    learn: guide.learn,
    video: guide.video,
    video_url: guide.video_url,
    tags: guide.tags,
    steps: guide.steps,
    show_step_numbers: guide.show_step_numbers,
    is_published: guide.is_published,
    updated_at: new Date().toISOString(),
  };
  const { error } = guide.id
    ? await supabase.from('guides').update(payload).eq('id', guide.id)
    : await supabase.from('guides').insert(payload);
  if (error) {
    if (/duplicate key|unique/i.test(error.message)) {
      return { ok: false, error: 'A guide with this URL slug already exists.' };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function deleteGuide(id: string): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) return { ok: false, error: 'Supabase is not connected.' };
  const { error } = await supabase.from('guides').delete().eq('id', id);
  return error ? { ok: false, error: error.message } : { ok: true };
}
