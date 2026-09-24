import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { StorageService } from '../../lib/storage';
import { verifyAdmin, getCachedAdmin, isKnownAdminEmail } from '../../lib/adminAuth';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { AdminLayout } from './AdminLayout';

/**
 * Guards the admin panel: allows verified admins and owner emails.
 * Handles instant cached entry, Supabase session auto-hydration, and failsafe timeout.
 */
export const AdminRoute: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'allowed' | 'denied'>(() => {
    const user = StorageService.getActiveUser();
    const cached = getCachedAdmin();
    // The cached admin must belong to the signed-in user — a stale record
    // left behind by a previous account must never grant instant entry.
    if (cached && user && cached.email.toLowerCase() === user.email?.toLowerCase()) {
      return 'allowed';
    }
    // Offline mode only: known owner emails get instant entry. When Supabase
    // is configured, verification must go through the `admins` table.
    if (user?.email && isKnownAdminEmail(user.email) && !isSupabaseConfigured) return 'allowed';
    return 'checking';
  });

  useEffect(() => {
    if (status !== 'checking') return;
    let alive = true;

    const checkAccess = async () => {
      // 1. Check local active user
      let user = StorageService.getActiveUser();

      // 2. If no local user, check Supabase session
      if (!user && isSupabaseConfigured && supabase) {
        try {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            user = {
              id: data.session.user.id,
              email: data.session.user.email || 'admin@linkos.dev',
            };
            StorageService.setActiveUser(user);
          }
        } catch (e) {
          console.log('[v0] AdminRoute session check error:', e);
        }
      }

      // 3. If still no user, check fallback owner
      if (!user) {
        // If on dev/demo or known owner context
        if (alive) setStatus('denied');
        return;
      }

      if (!isSupabaseConfigured && isKnownAdminEmail(user.email)) {
        if (alive) setStatus('allowed');
        return;
      }

      const admin = await verifyAdmin(user.email, user.id);
      if (alive) {
        setStatus(admin ? 'allowed' : 'denied');
      }
    };

    checkAccess();

    // Safety timeout: never stay stuck on loading for more than 2 seconds
    const timeout = setTimeout(() => {
      if (alive && status === 'checking') {
        const u = StorageService.getActiveUser();
        if (u?.email && isKnownAdminEmail(u.email) && !isSupabaseConfigured) {
          setStatus('allowed');
        } else {
          setStatus('denied');
        }
      }
    }, 2000);

    return () => {
      alive = false;
      clearTimeout(timeout);
    };
  }, [status]);

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-[#04070F] flex items-center justify-center" role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-3">
          <span className="w-9 h-9 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" aria-hidden="true" />
          <p className="text-[13px] text-slate-400 font-medium">Opening Admin Panel...</p>
        </div>
      </div>
    );
  }

  if (status === 'denied') return <Navigate to="/dashboard" replace />;

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};
