import { supabase, isSupabaseConfigured } from './supabase';

export interface NeedleChatTurn {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  prompt: string | null;
  response: Record<string, unknown> | null;
  created_at: string;
}

const LOCAL_KEY = 'linkos_needle_chats_local';

function readLocal(): NeedleChatTurn[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeLocal(turns: NeedleChatTurn[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(turns.slice(-100)));
  } catch {
    /* storage full — ignore */
  }
}

/** Persist one conversation turn. Supabase first, local mirror as fallback. */
export async function saveNeedleTurn(
  userId: string,
  role: 'user' | 'assistant',
  prompt: string | null,
  response: Record<string, unknown> | null,
): Promise<void> {
  const local: NeedleChatTurn = {
    id: `local-${crypto.randomUUID()}`,
    user_id: userId,
    role,
    prompt,
    response,
    created_at: new Date().toISOString(),
  };
  writeLocal([...readLocal(), local]);

  if (!isSupabaseConfigured || !supabase) return;
  const { error } = await supabase.from('needle_chats').insert({
    user_id: userId,
    role,
    prompt,
    response,
  });
  if (error) {
    // Demo sessions have no auth token, so RLS rejects the insert; the local
    // mirror above already kept the turn.
    console.log('[v0] saveNeedleTurn falling back to local store:', error.message);
  }
}

/** Load the user's recent Needle history, newest last. */
export async function fetchNeedleHistory(userId: string, limit = 30): Promise<NeedleChatTurn[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('needle_chats')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (!error && data && data.length > 0) {
      return data.slice(-limit) as NeedleChatTurn[];
    }
    if (error) console.log('[v0] fetchNeedleHistory failed:', error.message);
  }
  return readLocal()
    .filter((t) => t.user_id === userId)
    .slice(-limit);
}
