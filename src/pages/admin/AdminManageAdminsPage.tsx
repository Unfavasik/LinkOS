import React, { useCallback, useEffect, useState } from 'react';
import { UserPlus, ShieldCheck, Trash2, Mail, Loader2, Ban, RotateCcw, Crown, Lock } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { type AdminRecord } from '../../lib/adminAuth';
import { StorageService } from '../../lib/storage';

// Only these roles pass the admin_invites_role_check constraint.
const ROLE_OPTIONS = ['admin', 'support'] as const;

interface InviteRecord {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

const roleBadge = (role: string) => {
  switch (role) {
    case 'owner':
      return 'bg-amber-400/15 text-amber-300 ring-amber-400/30';
    case 'admin':
      return 'bg-blue-500/15 text-blue-300 ring-blue-400/30';
    case 'moderator':
      return 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/30';
    default:
      return 'bg-slate-500/15 text-slate-300 ring-slate-400/30';
  }
};

export const AdminManageAdminsPage: React.FC = () => {
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [invites, setInvites] = useState<InviteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Invite form
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>('admin');
  const [inviting, setInviting] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase is not configured.');
      setLoading(false);
      return;
    }
    const db = supabase;
    setLoading(true);
    const [a, i] = await Promise.all([
      db.from('admins').select('*').order('created_at', { ascending: true }),
      db.from('admin_invites').select('*').order('created_at', { ascending: false }),
    ]);
    if (a.error) setError(a.error.message);
    setAdmins((a.data as AdminRecord[]) ?? []);
    setInvites((i.data as InviteRecord[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setNotice('');
    const normalized = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setFormError('Enter a valid email address.');
      return;
    }
    if (admins.some((a) => a.email.toLowerCase() === normalized)) {
      setFormError('This email is already an admin.');
      return;
    }
    if (invites.some((i) => i.email.toLowerCase() === normalized && i.status === 'pending')) {
      setFormError('An invite for this email is already pending.');
      return;
    }

    setInviting(true);
    const inviterId = StorageService.getActiveUser()?.id || 'root_admin';

    // Insert directly into admins table so they have instant access
    await supabase!
      .from('admins')
      .upsert(
        {
          email: normalized,
          role,
          is_active: true,
          display_name: normalized.split('@')[0],
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      );

    // Also record invite for audit (non-blocking on failure)
    try {
      await supabase!
        .from('admin_invites')
        .insert({ email: normalized, role, status: 'accepted', invited_by: inviterId });
    } catch {
      // Audit log failure should not block admin creation
    }

    setInviting(false);
    setNotice(`Admin successfully added for ${normalized} with "${role}" role! They can now log in directly.`);
    setEmail('');
    setRole('admin');
    load();
  };

  const toggleActive = async (admin: AdminRecord) => {
    // The owner account must always stay active — deactivation is blocked.
    if (admin.role === 'owner') {
      setError('The owner account is always active and cannot be deactivated.');
      return;
    }
    setError('');
    const { error: upErr } = await supabase!
      .from('admins')
      .update({ is_active: !admin.is_active, updated_at: new Date().toISOString() })
      .eq('id', admin.id);
    if (upErr) setError(upErr.message);
    load();
  };

  const removeAdmin = async (admin: AdminRecord) => {
    setError('');
    const { error: delErr } = await supabase!.from('admins').delete().eq('id', admin.id);
    if (delErr) setError(delErr.message);
    load();
  };

  const revokeInvite = async (invite: InviteRecord) => {
    setError('');
    const { error: delErr } = await supabase!.from('admin_invites').delete().eq('id', invite.id);
    if (delErr) setError(delErr.message);
    load();
  };

  return (
    <div className="max-w-4xl">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-blue-400" aria-hidden="true" />
          Manage Admins
        </h1>
        <p className="mt-1 text-[13px] text-slate-400">
          Invite admins by email and control who has access to this panel.
        </p>
      </header>

      {/* Invite form */}
      <form
        onSubmit={handleInvite}
        className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-4 sm:p-5 mb-6"
        aria-label="Invite admin"
      >
        <h2 className="text-[14px] font-semibold text-white flex items-center gap-2 mb-3.5">
          <UserPlus className="w-4 h-4 text-blue-400" aria-hidden="true" />
          Invite Admin
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" aria-hidden="true" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@gmail.com"
              aria-label="Admin email"
              className="w-full h-11 pl-10 pr-3 rounded-xl bg-white/[0.04] border border-white/10 text-[13px] text-white placeholder:text-slate-500 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            aria-label="Admin role"
            className="h-11 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-[13px] text-white outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all [&>option]:bg-slate-900"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r} className="capitalize">
                {r}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={inviting || loading}
            className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-[13px] font-semibold text-white transition-colors flex items-center justify-center gap-2"
          >
            {inviting ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <UserPlus className="w-4 h-4" aria-hidden="true" />}
            {inviting ? 'Inviting...' : 'Create Invite'}
          </button>
        </div>
        {formError && <p className="mt-2.5 text-[12px] text-red-400">{formError}</p>}
        {notice && <p className="mt-2.5 text-[12px] text-emerald-400">{notice}</p>}
        <p className="mt-3 text-[11px] text-slate-500">
          The invited gmail receives its role automatically the first time it logs in.
        </p>
      </form>

      {error && <p className="mb-4 text-[12px] text-red-400">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-12" role="status" aria-label="Loading admins">
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" aria-hidden="true" />
        </div>
      ) : (
        <>
          {/* Pending invites */}
          {invites.filter((i) => i.status === 'pending').length > 0 && (
            <section className="mb-6" aria-label="Pending invites">
              <h2 className="text-[12px] font-semibold uppercase tracking-wide text-slate-500 mb-2.5">
                Pending Invites
              </h2>
              <ul className="space-y-2">
                {invites
                  .filter((i) => i.status === 'pending')
                  .map((invite) => (
                    <li
                      key={invite.id}
                      className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-dashed border-white/10 px-4 py-3"
                    >
                      <span className="w-9 h-9 rounded-full bg-slate-600/20 flex items-center justify-center text-[13px] font-bold text-slate-400">
                        {invite.email.charAt(0).toUpperCase()}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-slate-200 truncate">{invite.email}</p>
                        <p className="text-[11px] text-slate-500">
                          Invited as <span className="capitalize">{invite.role}</span> — waiting for first login
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => revokeInvite(invite)}
                        aria-label={`Revoke invite for ${invite.email}`}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Ban className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
              </ul>
            </section>
          )}

          {/* Admins list */}
          <section aria-label="Current admins">
            <h2 className="text-[12px] font-semibold uppercase tracking-wide text-slate-500 mb-2.5">
              Current Admins ({admins.length})
            </h2>
            <ul className="space-y-2">
              {admins.map((admin) => (
                <li
                  key={admin.id}
                  className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.08] px-4 py-3"
                >
                  {admin.avatar_url?.trim() ? (
                    <img
                      src={admin.avatar_url.trim()}
                      alt=""
                      aria-hidden="true"
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/30"
                    />
                  ) : (
                    <span className="w-9 h-9 rounded-full bg-blue-600/20 flex items-center justify-center text-[13px] font-bold text-blue-300">
                      {(admin.display_name || admin.email).charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-white truncate">
                      {admin.display_name || admin.email.split('@')[0]}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{admin.email}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ring-1 ${roleBadge(admin.role)}`}
                  >
                    {admin.role === 'owner' && <Crown className="inline w-3 h-3 mr-1 -mt-0.5" aria-hidden="true" />}
                    {admin.role}
                  </span>
                  {admin.role === 'owner' ? (
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-500/10 text-emerald-400"
                      title="The owner account is always active"
                    >
                      <Lock className="w-3 h-3" aria-hidden="true" /> Always Active
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleActive(admin)}
                      aria-label={admin.is_active ? `Deactivate ${admin.email}` : `Reactivate ${admin.email}`}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                        admin.is_active
                          ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-slate-500/10 text-slate-400 hover:bg-slate-500/20'
                      }`}
                    >
                      {admin.is_active ? 'Active' : 'Inactive'}
                    </button>
                  )}
                  {admin.role !== 'owner' && (
                    <button
                      type="button"
                      onClick={() => removeAdmin(admin)}
                      aria-label={`Remove admin ${admin.email}`}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
};
