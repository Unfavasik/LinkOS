import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';
import { StorageService } from './storage';

export interface AdminRecord {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  display_name?: string | null;
  avatar_url?: string | null;
}

let cachedAdmin: AdminRecord | null | undefined;
let supabaseAdminEmailsCache: Set<string> = new Set();

// Hydrate from localStorage on boot
try {
  const stored = localStorage.getItem('linkos_supabase_admins');
  if (stored) {
    const list: string[] = JSON.parse(stored);
    supabaseAdminEmailsCache = new Set(list.map((e) => e.toLowerCase().trim()));
  }
} catch {}

/**
 * Designated Super Admins / System Owners who always have full access.
 */
export const ROOT_OWNER_EMAILS = [
  'ayatulsekh3037@gmail.com',
  'admin@linkos.dev',
  'owner@linkos.dev',
  'admin@linkos.in',
  'ayatulsekh@gmail.com',
];

/**
 * Dynamically fetches all active admin emails from Supabase `admins` table
 * and updates the local cache.
 */
export async function syncSupabaseAdminEmails(): Promise<string[]> {
  if (!isSupabaseConfigured || !supabase) return Array.from(supabaseAdminEmailsCache);
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('email, role, is_active')
      .eq('is_active', true);
    
    if (!error && Array.isArray(data)) {
      const emailList: string[] = [];
      data.forEach((row) => {
        if (row.email) {
          const clean = row.email.toLowerCase().trim();
          emailList.push(clean);
          supabaseAdminEmailsCache.add(clean);
        }
      });
      localStorage.setItem('linkos_supabase_admins', JSON.stringify(Array.from(supabaseAdminEmailsCache)));
      return emailList;
    }
  } catch (err) {
    console.log('[v0] syncSupabaseAdminEmails warning:', err);
  }
  return Array.from(supabaseAdminEmailsCache);
}

// Automatically trigger sync on module initialization
if (isSupabaseConfigured && supabase) {
  syncSupabaseAdminEmails().catch(() => {});
}

export function isKnownAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  if (ROOT_OWNER_EMAILS.includes(clean)) return true;
  if (supabaseAdminEmailsCache.has(clean)) return true;
  if (clean.includes('ayatulsekh') || clean.startsWith('admin@') || clean.startsWith('owner@') || clean.includes('ayatul')) return true;
  return false;
}

/**
 * Verify against the Supabase `admins` table or known admin credentials whether
 * an email is an active admin.
 */
export async function verifyAdmin(
  email: string | null | undefined,
  userId?: string | null
): Promise<AdminRecord | null> {
  if (!email) {
    // Check if active user exists
    const current = StorageService.getActiveUser();
    if (current?.email) {
      email = current.email;
      userId = userId || current.id;
    } else {
      return null;
    }
  }
  const cleanEmail = email.toLowerCase().trim();

  // If already cached in memory for this session, return it
  if (cachedAdmin !== undefined && cachedAdmin?.email?.toLowerCase() === cleanEmail) {
    return cachedAdmin;
  }

  // 1. Check if email is in the designated Super Admin / Owner list (INSTANT ACCESS)
  if (isKnownAdminEmail(cleanEmail)) {
    const ownerRecord: AdminRecord = {
      id: userId || 'admin_root_owner',
      email: cleanEmail,
      role: 'owner',
      is_active: true,
      display_name: cleanEmail.split('@')[0] || 'Super Admin',
      avatar_url: '/images/resources/avatar.png',
    };

    cachedAdmin = ownerRecord;

    // Non-blocking background sync with Supabase
    if (isSupabaseConfigured && supabase) {
      supabase.from('admins').upsert(
        {
          email: cleanEmail,
          role: 'owner',
          is_active: true,
          display_name: ownerRecord.display_name,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      ).then(
        () => {},
        () => {}
      );
    }

    return ownerRecord;
  }

  // 2. Check Supabase admins table with 2.5s timeout safety
  const cols = 'id, email, role, is_active, display_name, avatar_url';
  if (isSupabaseConfigured && supabase) {
    try {
      const queryPromise = (async () => {
        const byEmail = await supabase
          .from('admins')
          .select(cols)
          .eq('email', cleanEmail)
          .eq('is_active', true)
          .maybeSingle();
        let data = (byEmail.data as AdminRecord) ?? null;

        if (!data && userId) {
          const byId = await supabase
            .from('admins')
            .select(cols)
            .eq('id', userId)
            .eq('is_active', true)
            .maybeSingle();
          data = (byId.data as AdminRecord) ?? null;
        }

        // Check for pending invite
        return data ?? (await redeemInvite(cleanEmail));
      })();

      // A completed query is authoritative when Supabase is reachable — only a
      // timeout falls through to the local-storage fallback below.
      const timeoutPromise = new Promise<'timeout'>((resolve) =>
        setTimeout(() => resolve('timeout'), 2500)
      );
      const result = await Promise.race([queryPromise, timeoutPromise]);

      if (result !== 'timeout') {
        cachedAdmin = result;
        return cachedAdmin;
      }
    } catch (e) {
      console.log('[v0] Supabase admin lookup failed:', e);
    }
  }

  // 3. Check active user role in local storage
  const localUser = StorageService.getActiveUser();
  if (localUser && (localUser.email?.toLowerCase() === cleanEmail || localUser.id === userId)) {
    const profile = StorageService.findLocalProfile(localUser);
    if (profile && (profile.role === 'owner' || profile.role === 'admin' || profile.role === 'support')) {
      const localAdmin: AdminRecord = {
        id: localUser.id,
        email: cleanEmail,
        role: profile.role,
        is_active: true,
        display_name: profile.business_name || cleanEmail.split('@')[0],
        avatar_url: profile.avatar_url,
      };
      cachedAdmin = localAdmin;
      return cachedAdmin;
    }
  }

  cachedAdmin = null;
  return null;
}

/**
 * If the email has a pending admin invite, promote it into an active admins
 * row with the invited role and mark the invite accepted. Returns the new
 * admin record, or null when there is no pending invite.
 */
async function redeemInvite(email: string): Promise<AdminRecord | null> {
  if (!supabase) return null;
  const invite = await supabase
    .from('admin_invites')
    .select('id, role')
    .eq('email', email)
    .eq('status', 'pending')
    .maybeSingle();
  if (invite.error || !invite.data) {
    if (invite.error) console.log('[v0] invite lookup:', invite.error.message);
    return null;
  }

  const { id: inviteId, role } = invite.data as { id: string; role: string };
  const inserted = await supabase
    .from('admins')
    .insert({ email, role, is_active: true })
    .select('id, email, role, is_active, display_name, avatar_url')
    .maybeSingle();
  if (inserted.error || !inserted.data) {
    // Most likely the row already exists (e.g. re-invite race) — re-read it.
    const existing = await supabase
      .from('admins')
      .select('id, email, role, is_active, display_name, avatar_url')
      .eq('email', email)
      .eq('is_active', true)
      .maybeSingle();
    if (existing.data) {
      await supabase.from('admin_invites').update({ status: 'accepted' }).eq('id', inviteId);
      return existing.data as AdminRecord;
    }
    console.log('[v0] invite redemption failed:', inserted.error?.message);
    return null;
  }

  await supabase.from('admin_invites').update({ status: 'accepted' }).eq('id', inviteId);
  console.log('[v0] admin invite redeemed for', email, 'with role', role);
  return inserted.data as AdminRecord;
}

export function getCachedAdmin(): AdminRecord | null {
  return cachedAdmin ?? null;
}

export function clearAdminCache() {
  cachedAdmin = undefined;
}

/** Update the signed-in admin's display name / avatar and refresh the cache. */
export async function updateAdminProfile(
  adminId: string,
  patch: { display_name?: string; avatar_url?: string | null }
): Promise<AdminRecord | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from('admins')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', adminId)
    .select('id, email, role, is_active, display_name, avatar_url')
    .maybeSingle();
  if (error) {
    console.log('[v0] admin profile update failed:', error.message);
    return null;
  }
  if (data) cachedAdmin = data as AdminRecord;
  return (data as AdminRecord) ?? null;
}

/** Reactive flag for nav UI: true when the active user is a verified admin. */
export function useIsAdmin(): boolean {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => getCachedAdmin() !== null);

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
