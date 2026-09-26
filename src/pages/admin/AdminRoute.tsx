import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { StorageService } from '../../lib/storage';
import { verifyAdmin } from '../../lib/adminAuth';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { AdminLayout } from './AdminLayout';

/** Guards the admin panel using a fresh active-admin lookup for the Supabase session. */
export const AdminRoute: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'allowed' | 'denied'>('checking');

  useEffect(() => {
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      setStatus('checking');
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (status !== 'checking') return;
    let alive = true;

    const checkAccess = async () => {
      // Restore the local user shape from the Supabase session when needed.
      let user = StorageService.getActiveUser();

      // A browser-local user alone is not authentication; verification below
      // always derives identity from the Supabase session.
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

      if (!user) {
        if (alive) setStatus('denied');
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
        setStatus('denied');
      }
    }, 5000);

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
