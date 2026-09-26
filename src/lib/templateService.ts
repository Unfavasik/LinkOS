import useSWR from 'swr';
import { supabase, isSupabaseConfigured } from './supabase';
import { PageTemplate } from '../data/templates';
import { Product } from '../types';

/** Default services/tags stored on a template row (jsonb `services` column). */
export interface TemplateServices {
  tags: string[];
  items: Product[];
}

/**
 * Admin-editable template overrides stored in the Supabase `templates` table.
 * The local `src/data/templates.ts` stays the base; whatever the admin saves
 * here is merged on top so template previews reflect admin updates instantly.
 * Pages a user has already published keep their own copied values, so they
 * are never affected by later template edits.
 */
export interface TemplateOverride {
  id: string;
  name?: string | null;
  description?: string | null;
  category?: string | null;
  theme?: string | null;
  accent_color?: string | null;
  button_style?: string | null;
  font_family?: string | null;
  layout?: string | null;
  services?: TemplateServices | null;
  cover_url?: string | null;
  preview_url?: string | null;
  popularity?: number | null;
  is_pro?: boolean | null;
  is_active?: boolean | null;
  tags?: string[] | null;
}

const OVERRIDE_COLS = 'id, name, description, category, theme, accent_color, button_style, font_family, layout, services, cover_url, preview_url, popularity, is_pro, is_active, tags';

/** The database row is an override layer; older rows may only contain an id. */
export function normalizeTemplateOverride(local: PageTemplate, override?: TemplateOverride): TemplateOverride | undefined {
  if (!override) return undefined;
  return {
    ...override,
    name: override.name || local.name,
    description: override.description || local.description,
    category: override.category || local.category,
    theme: override.theme || local.theme,
    accent_color: override.accent_color || local.accent_color,
    button_style: override.button_style || local.button_style,
    font_family: override.font_family || local.font_family,
    layout: override.layout || local.layout,
    popularity: override.popularity ?? local.popularity,
    is_pro: override.is_pro ?? local.is_pro,
    tags: Array.isArray(override.tags) && override.tags.length > 0 ? override.tags : local.tags,
  };
}

export async function fetchTemplateOverrides(): Promise<Record<string, TemplateOverride>> {
  if (!isSupabaseConfigured || !supabase) return {};
  const { data, error } = await supabase.from('templates').select(OVERRIDE_COLS);
  if (error) {
    console.log('[v0] template overrides fetch failed:', error.message);
    return {};
  }
  const map: Record<string, TemplateOverride> = {};
  for (const row of (data ?? []) as TemplateOverride[]) map[row.id] = row;
  return map;
}

export function useTemplateOverrides() {
  return useSWR('template-overrides', fetchTemplateOverrides, {
    revalidateOnFocus: false,
    dedupingInterval: 30_000,
  });
}

/** Merge an admin override row on top of the local base template. */
export function mergeTemplate(local: PageTemplate, o?: TemplateOverride): PageTemplate {
  const override = normalizeTemplateOverride(local, o);
  if (!override) return local;
  return {
    ...local,
    name: override.name as string,
    description: override.description as string,
    category: override.category as PageTemplate['category'],
    theme: override.theme as PageTemplate['theme'],
    accent_color: override.accent_color as string,
    button_style: override.button_style as PageTemplate['button_style'],
    font_family: override.font_family as PageTemplate['font_family'],
    layout: override.layout as PageTemplate['layout'],
    popularity: override.popularity as number,
    is_pro: override.is_pro as boolean,
    cover_url: override.cover_url || local.cover_url,
    preview_url: override.preview_url || local.preview_url,
    tags: override.tags as string[],
  };
}

/** Admin-set badge (Bestseller / New / Pro / Hot) — falls back to Pro for pro templates. */
export function templateBadge(t: { tags?: string[]; is_pro?: boolean }): string | null {
  const tag = (t.tags ?? []).find((x) => ['Bestseller', 'New', 'Pro', 'Hot'].includes(x));
  return tag ?? (t.is_pro ? 'Pro' : null);
}

/** Whether using this template requires a premium plan. */
export function isProTemplate(t: { tags?: string[]; is_pro?: boolean }): boolean {
  return (t.tags ?? []).includes('Pro') || t.is_pro === true;
}

/** Update editable fields of a template from the admin panel. */
export async function updateTemplate(
  id: string,
  patch: Partial<Pick<TemplateOverride, 'name' | 'description' | 'category' | 'theme' | 'accent_color' | 'button_style' | 'font_family' | 'layout' | 'services' | 'cover_url' | 'preview_url' | 'popularity' | 'is_pro' | 'is_active' | 'tags'>>
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured || !supabase) return { error: 'Supabase is not connected' };
  const { error } = await supabase
    .from('templates')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id);
  return error ? { error: error.message } : {};
}
