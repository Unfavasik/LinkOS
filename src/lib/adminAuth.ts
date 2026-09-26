import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';
import { StorageService } from './storage';
import {
  clearAdminCache,
  getCachedAdminRecord,
  setCachedAdminRecord,
  type AdminRecord,
} from './adminCache';

export type { AdminRecord };
export { clearAdminCache };

/**
 * Verify whether an email maps to an active record in the Supabase `admins` table.
 */
export async function verifyAdmin(
  _email: string | null | undefined,
  _userId?: string | null
): Promise<AdminRecord | null> {
  // Fail closed. Never derive admin authority from client-supplied identity or
  // localStorage; use the email claim from the verified Supabase session.
  if (!isSupabaseConfigured || !supabase) {
    setCachedAdminRecord(null);
    return null;
  }
  try {
    const queryPromise = (async (): Promise<AdminRecord | null> => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      const authenticatedEmail = authData.user?.email?.toLowerCase().trim();
      if (authError || !authData.user || !authenticatedEmail) return null;

      const { data, error } = await supabase
        .from('admins')
        .select('id, email, role, is_active, display_name, avatar_url')
        .eq('email', authenticatedEmail)
        .eq('is_active', true)
        .maybeSingle();
      if (error) throw error;
      return (data as AdminRecord | null) ?? (await redeemInvite(authenticatedEmail));
    })();
    const timeoutPromise = new Promise<'timeout'>((resolve) =>
      setTimeout(() => resolve('timeout'), 4500)
    );
    const result = await Promise.race([queryPromise, timeoutPromise]);
    if (result === 'timeout') {
      setCachedAdminRecord(null);
      return null;
    }
    setCachedAdminRecord(result);
    return result;
  } catch (error) {
    console.log('[v0] Supabase admin lookup failed:', error);
    setCachedAdminRecord(null);
    return null;
  }
}

/**
 * If the email has a pending admin invite, promote it into an active admins
 * row with the invited role and mark the invite accepted. Returns the new
 * admin record, or null when there is no pending invite.
 */
async function redeemInvite(email: string): Promise<AdminRecord | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  const { data, error } = await supabase.rpc('redeem_linkos_admin_invite');
  if (error || !data) {
    if (error) console.log('[v0] invite redemption:', error.message);
    return null;
  }
  const record = (Array.isArray(data) ? data[0] : data) as AdminRecord | undefined;
  if (!record) return null;
  console.log('[v0] admin invite redeemed for', email, 'with role', record.role);
  return record;
}

export function getCachedAdmin(): AdminRecord | null {
  return getCachedAdminRecord();
}

/**
 * Where an authenticated user should land after sign-in/sign-up. Admins are
 * never sent to the user dashboard — they always go straight to the admin
 * panel, everywhere in the app.
 */
export async function resolvePostAuthRoute(
  email: string,
  userId?: string
): Promise<'/admin' | '/dashboard'> {
  const admin = await verifyAdmin(email, userId);
  return admin ? '/admin' : '/dashboard';
}

/** Update the signed-in admin's display name / avatar and refresh the cache.
 *  Matches by email — the stable identifier. Filtering by id silently matches
 *  zero rows when the admins row id drifts from the auth user id. */
export async function updateAdminProfile(
  admin: Pick<AdminRecord, 'id' | 'email'>,
  patch: { display_name?: string; avatar_url?: string | null }
): Promise<AdminRecord | null> {
  if (!isSupabaseConfigured || !supabase || !admin.email) return null;
  const { data, error } = await supabase
    .from('admins')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('email', admin.email.toLowerCase().trim())
    .select('id, email, role, is_active, display_name, avatar_url')
    .maybeSingle();
  if (error) {
    console.log('[v0] admin profile update failed:', error.message);
    return null;
  }
  if (data) setCachedAdminRecord(data as AdminRecord);
  return (data as AdminRecord) ?? null;
}

/** Reactive flag for nav UI: true when the active user is a verified admin. */
export function useIsAdmin(): boolean {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let alive = true;
    const user = StorageService.getActiveUser();
    if (!user) {
      setIsAdmin(false);
      return;
    }
    verifyAdmin(user.email, user.id).then((record) => {
      if (alive) setIsAdmin(!!record);
    });
    return () => {
      alive = false;
    };
  }, []);

  return isAdmin;
}
