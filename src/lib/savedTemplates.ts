import { supabase, isSupabaseConfigured } from './supabase';

export interface SavedTemplate {
  id: string;
  user_id: string;
  user_name: string;
  template_id: string;
  template_name: string;
  created_at: string;
}

const LOCAL_KEY = 'linkos_saved_templates_local';

function readLocal(): SavedTemplate[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeLocal(rows: SavedTemplate[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(rows));
}

function localKey(userId: string, templateId: string) {
  return `${userId}::${templateId}`;
}

/** All templates the user saved, newest first. */
export async function fetchSavedTemplates(userId: string): Promise<SavedTemplate[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('saved_templates')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data as SavedTemplate[];
      // RLS returns an empty list (not an error) for sessions without a
      // Supabase user — fall back to the local mirror when it has rows.
    } catch {
      // fall through to the local mirror
    }
  }
  return readLocal()
    .filter((row) => row.user_id === userId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

/** Whether a template is currently saved by the user. */
export async function isTemplateSaved(userId: string, templateId: string): Promise<boolean> {
  const rows = await fetchSavedTemplates(userId);
  return rows.some((row) => row.template_id === templateId);
}

/**
 * Saves a template for the user (recorded with their display name) or removes
 * the save if it already exists. Returns the new saved state.
 */
export async function toggleSavedTemplate(
  userId: string,
  userName: string,
  templateId: string,
  templateName: string
): Promise<boolean> {
  const existing = await fetchSavedTemplates(userId);
  const current = existing.find((row) => row.template_id === templateId);

  if (current) {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('saved_templates').delete().eq('id', current.id);
      } catch {
        // keep going — the local mirror is updated regardless
      }
    }
    writeLocal(readLocal().filter((row) => localKey(row.user_id, row.template_id) !== localKey(userId, templateId)));
    return false;
  }

  const row: SavedTemplate = {
    id: `sav_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    user_id: userId,
    user_name: userName,
    template_id: templateId,
    template_name: templateName,
    created_at: new Date().toISOString(),
  };
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('saved_templates').insert(row);
      if (error) throw error;
    } catch {
      // fall through to the local mirror
    }
  }
  writeLocal([row, ...readLocal().filter((r) => localKey(r.user_id, r.template_id) !== localKey(userId, templateId))]);
  return true;
}
