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

/* ---- Local fallback store -------------------------------------------------
 * Sessions without a Supabase auth token (demo login) are rejected by the
 * websites RLS policies, and Supabase may be unreachable entirely. Mirror
 * the StorageService convention: try Supabase first, keep a local copy so
 * the feature always works. */

const LOCAL_WEBSITES_KEY = 'linkos_websites_local';

function readLocalWebsites(): WebsiteRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_WEBSITES_KEY);
    return raw ? (JSON.parse(raw) as WebsiteRecord[]) : [];
  } catch {
    return [];
  }
}

function writeLocalWebsites(records: WebsiteRecord[]) {
  try {
    localStorage.setItem(LOCAL_WEBSITES_KEY, JSON.stringify(records));
  } catch {
    /* storage full or unavailable — non-fatal */
  }
}

function upsertLocalWebsite(record: WebsiteRecord) {
  const all = readLocalWebsites().filter((r) => r.id !== record.id);
  all.unshift(record);
  writeLocalWebsites(all);
}

function getLocalWebsite(id: string): WebsiteRecord | null {
  return readLocalWebsites().find((r) => r.id === id) ?? null;
}

/** websites.owner_id is a uuid column, but local session ids (demo login)
 *  are plain strings like "user_anant_1". Derive a stable uuid from the
 *  local id so ownership stays consistent across sessions. */
async function localOwnerUuid(localId: string): Promise<string> {
  const data = new TextEncoder().encode(`linkos-website-owner:${localId}`);
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-1', data));
  digest[6] = (digest[6] & 0x0f) | 0x50; // uuid version 5
  digest[8] = (digest[8] & 0x3f) | 0x80; // RFC 4122 variant
  const hex = Array.from(digest, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

async function currentUserId(): Promise<string | null> {
  // The app keys all Supabase rows (profiles, products) by the local
  // active-user id — real logins store the auth uid there, while demo
  // sessions have no auth token at all. Prefer the local id so website
  // ownership matches the rest of the user's data.
  const active = StorageService.getActiveUser();
  if (active?.id) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(active.id)
      ? active.id
      : localOwnerUuid(active.id);
  }
  if (!isSupabaseConfigured || !supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data?.user?.id ?? null;
}

/** The signed-in user's email, used to stamp website ownership. */
async function currentUserEmail(): Promise<string | null> {
  const active = StorageService.getActiveUser();
  if (active?.email) return active.email;
  if (!isSupabaseConfigured || !supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data?.user?.email ?? null;
}

/** Stamp the website's content snapshot with its owner's id and email so
 *  ownership is readable straight from the websites table row. */
async function ownershipStamp(uid: string): Promise<Record<string, unknown>> {
  const email = await currentUserEmail();
  return email ? { owner_id: uid, owner_email: email } : { owner_id: uid };
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

/** Is this slug free on the public /site/ namespace? */
export async function isSlugAvailable(slug: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return true;
  const { data } = await supabase.from('websites').select('id').eq('slug', slug).maybeSingle();
  return !data;
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
  if (!uid) return [];
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('websites')
    .select('*')
    .eq('owner_id', uid)
    .order('updated_at', { ascending: false });
  if (error) {
    console.log('[v0] fetchMyWebsites failed:', error.message);
    // Fall back to the local store so demo sessions still see their sites.
    return readLocalWebsites().filter((r) => r.owner_id === uid);
  }
  const remote = (data ?? []).map(toRecord);
  const remoteIds = new Set(remote.map((r) => r.id));
  const localOnly = readLocalWebsites().filter((r) => r.owner_id === uid && !remoteIds.has(r.id));
  return [...remote, ...localOnly];
}

export async function fetchWebsite(id: string): Promise<WebsiteRecord | null> {
  const local = getLocalWebsite(id);
  if (!isSupabaseConfigured || !supabase) return local;
  const { data, error } = await supabase.from('websites').select('*').eq('id', id).maybeSingle();
  if (error || !data) {
    if (local) return local;
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
  if (!uid || !tpl) return null;
  const slug = await uniqueSlug(preferredSlug?.trim() || name || tpl.name);
  if (!isSupabaseConfigured || !supabase) return null;
  const stamp = await ownershipStamp(uid);
  const { data, error } = await supabase
    .from('websites')
    .insert({ owner_id: uid, template_id: tpl.id, name: name.trim() || tpl.name, slug, status: 'live', content: { ...content, ...stamp } })
    .select('*')
    .maybeSingle();
  if (error || !data) {
    // Demo sessions have no auth token, so RLS rejects the insert. Keep the
    // site in the local store so the flow still completes end to end.
    console.log('[v0] createWebsiteFromContent falling back to local store:', error?.message);
    const record: WebsiteRecord = {
      id: `local-${crypto.randomUUID()}`,
      owner_id: uid,
      template_id: tpl.id,
      name: name.trim() || tpl.name,
      slug,
      status: 'live',
      content: { ...content, ...stamp },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    upsertLocalWebsite(record);
    return record;
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
  const stamp = await ownershipStamp(uid);
  const { data, error } = await supabase
    .from('websites')
    .insert({ owner_id: uid, template_id: tpl.id, name: name || tpl.name, slug, status: 'draft', content: { ...content, ...stamp } })
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
  if (!isSupabaseConfigured || !supabase) {
    // Local-only record (demo session): apply the patch locally.
    const local = getLocalWebsite(id);
    if (!local) return null;
    const updated = { ...local, ...patch, updated_at: new Date().toISOString() };
    upsertLocalWebsite(updated);
    return updated;
  }
  const { data, error } = await supabase
    .from('websites')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error || !data) {
    console.log('[v0] updateWebsite failed:', error?.message);
    const local = getLocalWebsite(id);
    if (local) {
      const updated = { ...local, ...patch, updated_at: new Date().toISOString() };
      upsertLocalWebsite(updated);
      return updated;
    }
    return null;
  }
  return toRecord(data);
}

export async function setWebsiteStatus(id: string, status: 'draft' | 'live'): Promise<boolean> {
  const updated = await updateWebsite(id, { status });
  return updated?.status === status;
}

export async function deleteWebsite(id: string): Promise<boolean> {
  writeLocalWebsites(readLocalWebsites().filter((r) => r.id !== id));
  if (!isSupabaseConfigured || !supabase) return true;
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
