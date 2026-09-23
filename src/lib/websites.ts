import { supabase, isSupabaseConfigured } from './supabase';
import { getTemplateById, type PageTemplate } from '../data/templates';
import type { Profile } from '../types';

export interface WebsiteRecord {
  id: string;
  owner_id: string;
  template_id: string;
  name: string;
  slug: string;
  status: 'draft' | 'live';
  content: Profile;
  created_at: string;
  updated_at: string;
}

export interface WebsiteSummary {
  id: string;
  name: string;
  slug: string;
  status: 'draft' | 'live';
  template_id: string;
  template_name: string;
  cover: string;
  updated_at: string;
  views: number;
}

const normalizeStatus = (s: unknown): 'draft' | 'live' => (s === 'live' ? 'live' : 'draft');

function toRecord(row: Record<string, unknown>): WebsiteRecord {
  return {
    id: row.id as string,
    owner_id: row.owner_id as string,
    template_id: (row.template_id as string) || '',
    name: (row.name as string) || 'My Website',
    slug: (row.slug as string) || '',
    status: normalizeStatus(row.status),
    content: (row.content ?? {}) as Profile,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

async function currentUserId(): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data?.user?.id ?? null;
}

/** Build a Profile-shaped content snapshot from template defaults.
 *  Templates are never modified — each website gets its own copy. */
export function templateContentSnapshot(tpl: PageTemplate, name: string): Profile {
  return {
    id: '',
    user_id: '',
    business_name: name,
    username: '',
    category: tpl.category,
    description: tpl.description,
    logo_url: '',
    cover_url: tpl.cover_url || '',
    bio: tpl.description,
    phone: '',
    whatsapp: '',
    whatsapp_message: '',
    email: '',
    website: '',
    address: '',
    city: '',
    state: '',
    country: '',
    theme: tpl.theme,
    accent_color: tpl.accent_color,
    button_style: tpl.button_style,
    font_family: tpl.font_family,
    template_id: tpl.id,
    layout: tpl.layout,
    plan: 'free',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as Profile;
}

async function uniqueSlug(base: string): Promise<string> {
  const clean =
    base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'site';
  if (!isSupabaseConfigured || !supabase) return `${clean}-${Date.now().toString(36)}`;
  let candidate = clean;
  for (let i = 0; i < 20; i++) {
    const { data } = await supabase
      .from('websites')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle();
    if (!data) return candidate;
    candidate = `${clean}-${Math.random().toString(36).slice(2, 6)}`;
  }
  return `${clean}-${Date.now().toString(36)}`;
}

export async function fetchMyWebsites(): Promise<WebsiteRecord[]> {
  const uid = await currentUserId();
  if (!uid || !isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('websites')
    .select('*')
    .eq('owner_id', uid)
    .order('updated_at', { ascending: false });
  if (error) {
    console.log('[v0] fetchMyWebsites failed:', error.message);
    return [];
  }
  return (data ?? []).map(toRecord);
}

export async function fetchWebsite(id: string): Promise<WebsiteRecord | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase.from('websites').select('*').eq('id', id).maybeSingle();
  if (error || !data) {
    console.log('[v0] fetchWebsite failed:', error?.message);
    return null;
  }
  return toRecord(data);
}

export async function fetchLiveWebsiteBySlug(slug: string): Promise<WebsiteRecord | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from('websites')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'live')
    .maybeSingle();
  if (error || !data) return null;
  return toRecord(data);
}

export async function createWebsiteFromTemplate(
  templateId: string,
  name: string,
): Promise<WebsiteRecord | null> {
  const uid = await currentUserId();
  const tpl = getTemplateById(templateId);
  if (!uid || !tpl || !isSupabaseConfigured || !supabase) return null;
  const slug = await uniqueSlug(name || tpl.name);
  const content = templateContentSnapshot(tpl, name || tpl.name);
  const { data, error } = await supabase
    .from('websites')
    .insert({ owner_id: uid, template_id: tpl.id, name: name || tpl.name, slug, status: 'draft', content })
    .select('*')
    .maybeSingle();
  if (error || !data) {
    console.log('[v0] createWebsiteFromTemplate failed:', error?.message);
    return null;
  }
  return toRecord(data);
}

export async function updateWebsite(
  id: string,
  patch: Partial<Pick<WebsiteRecord, 'name' | 'slug' | 'status' | 'content'>>,
): Promise<WebsiteRecord | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from('websites')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error || !data) {
    console.log('[v0] updateWebsite failed:', error?.message);
    return null;
  }
  return toRecord(data);
}

export async function setWebsiteStatus(id: string, status: 'draft' | 'live'): Promise<boolean> {
  const updated = await updateWebsite(id, { status });
  return updated?.status === status;
}

export async function deleteWebsite(id: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from('websites').delete().eq('id', id);
  if (error) {
    console.log('[v0] deleteWebsite failed:', error.message);
    return false;
  }
  return true;
}

export function websiteUrl(w: Pick<WebsiteRecord, 'slug'>): string {
  return `linkos.app/${w.slug}`;
}

export function summarize(w: WebsiteRecord): WebsiteSummary {
  const tpl = getTemplateById(w.template_id);
  return {
    id: w.id,
    name: w.name,
    slug: w.slug,
    status: w.status,
    template_id: w.template_id,
    template_name: tpl?.name || w.template_id || 'Custom',
    cover: w.content?.cover_url || w.content?.logo_url || '/images/cafe/cover.webp',
    updated_at: w.updated_at,
    views: 0,
  };
}
