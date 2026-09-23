import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Only public browser variables are read here. Service-role credentials
// (SUPABASE_SECRET_KEY) belong exclusively in server-side environments.
// The active project is the base Supabase pair; fall back to the legacy
// VITE_ names.
export const supabaseUrl =
  import.meta.env.SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL ||
  '';
export const supabaseAnonKey =
  import.meta.env.SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('http') && 
  supabaseAnonKey.length > 10
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
