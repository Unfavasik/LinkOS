import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { getCachedAdmin } from '../../lib/adminAuth';
import { canAccessSection, type AdminSection } from '../../lib/adminPermissions';
import { getEffectiveRole } from '../../lib/supportMode';

/**
 * Wraps an admin route and only renders it when the signed-in admin's role
 * may access the section. Otherwise shows a restricted panel instead of the
 * page content (nav links for disallowed sections are hidden too).
 * Support Mode further restricts owner/admin to the support section set.
 */
export const AdminSectionGuard: React.FC<{
  section: AdminSection;
  children: React.ReactNode;
}> = ({ section, children }) => {
  const role = getEffectiveRole(getCachedAdmin()?.role);

  if (!canAccessSection(role, section)) {
    return (
      <div className="max-w-lg mx-auto mt-10">
        <div
          role="alert"
          className="rounded-2xl bg-[#0A1220] border border-amber-400/25 p-8 text-center"
        >
          <span className="mx-auto w-12 h-12 rounded-2xl bg-amber-400/10 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-amber-400" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-[17px] font-bold text-white">Access restricted</h2>
          <p className="mt-1.5 text-[13px] text-slate-400 leading-relaxed">
            Your role (<span className="font-semibold text-slate-200 capitalize">{role || 'unknown'}</span>) does
            not have permission to open this section. Contact the owner if you
            believe this is a mistake.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
