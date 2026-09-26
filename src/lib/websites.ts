import { supabase, isSupabaseConfigured } from './supabase';
import { getTemplateById, type PageTemplate } from '../data/templates';
import { StorageService } from './storage';
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
    owner_id: (row.owner_id as string) || '',
    template_id: (row.template_id as string) || '',
    name: (row.name as string) || 'My Website',
    slug: (row.slug as string) || '',
    status: normalizeStatus(row.status),
    content: (row.content ?? {}) as Profile,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

/** Website ownership always comes from the authenticated Supabase session. */
async function currentUserId(): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user?.id ?? null;
}
/** Build a Profile-shaped content snapshot for a new website.
 *  Design (theme, layout, fonts) comes from the template; all business
 *  content is prefilled from the user's existing My Page profile so the
 *  website starts with the same data the My Page editor shows. Templates
 *  are never modified — each website gets its own copy. */
export function templateContentSnapshot(
  tpl: PageTemplate,
  name: string,
  profile?: Profile | null,
): Profile {
  const p = profile ?? null;
  return {
    id: '',
    user_id: p?.id ?? '',
    business_name: name || p?.business_name || '',
    username: '',
    category: p?.category || tpl.category,
    description: p?.description ?? '',
    logo_url: p?.logo_url ?? '',
    cover_url: p?.cover_url ?? '',
    bio: p?.bio ?? '',
    phone: p?.phone ?? '',
    whatsapp: p?.whatsapp ?? '',
    whatsapp_message: p?.whatsapp_message ?? '',
    email: p?.email ?? '',
    website: p?.website ?? '',
    address: p?.address ?? '',
    city: p?.city ?? '',
    state: p?.state ?? '',
    country: p?.country ?? '',
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

export function slugify(base: string): string {
  return (
    base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'site'
  );
}

/** Is this slug free on the /site/ namespace? Requires a signed-in builder. */
export async function isSlugAvailable(slug: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return true;
  const { data } = await supabase.rpc('is_linkos_slug_available', { p_slug: slug });
  return data === true;
}

/** Suggest up to 3 available slugs derived from the user's chosen name,
 *  e.g. "devasik" -> ["devasik-2", "devasik-cafe", "devasik-official"]. */
export async function suggestSlugs(base: string): Promise<string[]> {
  const clean = slugify(base);
  const suffixes = ['-2', '-3', '-official', '-bd', '-online'];
  const candidates = [`${clean}-2`, `${clean}-3`, `${clean}-official`, `${clean}-bd`, `${clean}-online`];
  const available: string[] = [];
  for (const candidate of candidates) {
    if (await isSlugAvailable(candidate)) available.push(candidate);
    if (available.length >= 3) break;
  }
  void suffixes;
  return available;
}

async function uniqueSlug(base: string): Promise<string> {
  const clean = slugify(base);
  if (!isSupabaseConfigured || !supabase) return `${clean}-${Date.now().toString(36)}`;
  let candidate = clean;
  for (let i = 0; i < 20; i++) {
    const { data, error } = await supabase.rpc('is_linkos_slug_available', { p_slug: candidate });
    if (!error && data === true) return candidate;
    candidate = `${clean}-${Math.random().toString(36).slice(2, 6)}`;
  }
  return `${clean}-${Date.now().toString(36)}`;
}

export async function fetchMyWebsites(): Promise<WebsiteRecord[]> {
  const uid = await currentUserId();
  if (!uid || !supabase) return [];
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
  if (!isSupabaseConfigured || !supabase || !(await currentUserId())) return null;
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
    .from('public_websites')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'live')
    .maybeSingle();
  if (error || !data) return null;
  return toRecord(data);
}

/** Create a user-owned website from fully-customized wizard content.
 *  Used by the apply wizard's Create Website flow: the wizard collects all
 *  content (prefilled from the user's My Page) and we store it as this
 *  website's own snapshot. The template library is never modified. */
export async function createWebsiteFromContent(
  templateId: string,
  name: string,
  content: Profile,
  preferredSlug?: string,
): Promise<WebsiteRecord | null> {
  const uid = await currentUserId();
  const tpl = getTemplateById(templateId);
  if (!uid || !tpl || !supabase) return null;
  const slug = await uniqueSlug(preferredSlug?.trim() || name || tpl.name);
  const { data, error } = await supabase
    .from('websites')
    .insert({ owner_id: uid, template_id: tpl.id, name: name.trim() || tpl.name, slug, status: 'live', content })
    .select('*')
    .maybeSingle();
  if (error || !data) {
    console.log('[v0] createWebsiteFromContent Supabase insert failed:', error?.message);
    return null;
  }
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
  // Prefill content from the user's My Page profile so the new website
  // starts with the same business data the My Page editor shows.
  const profile = await StorageService.getCurrentUserProfile();
  const content = templateContentSnapshot(tpl, name || tpl.name, profile);
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
  if (!isSupabaseConfigured || !supabase || !(await currentUserId())) return null;
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
  if (!isSupabaseConfigured || !supabase || !(await currentUserId())) return false;
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
