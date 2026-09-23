/**
 * Role-based access control for the LinkOS admin panel.
 *
 * Roles mirror the `admins.role` values in Supabase:
 *  - owner   (Super Admin): full system control
 *  - admin:  management tasks, no destructive / system-level access
 *  - support: customer support only, most limited access
 */

export type AdminRole = 'owner' | 'admin' | 'support';

export type AdminSection =
  | 'dashboard'
  | 'users'
  | 'businesses'
  | 'pages'
  | 'templates'
  | 'plans'
  | 'orders'
  | 'inquiries'
  | 'reviews'
  | 'qr-codes'
  | 'announcements'
  | 'analytics'
  | 'settings'
  | 'manage-admins';

/** Which roles may open each admin section. */
const SECTION_ACCESS: Record<AdminSection, AdminRole[]> = {
  dashboard: ['owner', 'admin', 'support'],
  // Support sees a basic lookup view only.
  users: ['owner', 'admin', 'support'],
  // Support gets page preview only (no publish/suspend actions).
  businesses: ['owner', 'admin', 'support'],
  pages: ['owner', 'admin'],
  templates: ['owner', 'admin'],
  // Billing is owner-only.
  plans: ['owner'],
  orders: ['owner', 'admin'],
  // Inquiries double as the support ticket queue.
  inquiries: ['owner', 'admin', 'support'],
  reviews: ['owner', 'admin'],
  'qr-codes': ['owner', 'admin'],
  announcements: ['owner', 'admin'],
  analytics: ['owner', 'admin'],
  // System settings and admin/role management are owner-only.
  settings: ['owner'],
  'manage-admins': ['owner'],
};

export function normalizeRole(role: string | null | undefined): AdminRole {
  const r = (role || '').toLowerCase().replace(/[\s_-]/g, '');
  if (r === 'owner' || r === 'superadmin' || r === 'super') return 'owner';
  if (r === 'support') return 'support';
  return 'admin';
}

export function canAccessSection(role: string | null | undefined, section: AdminSection): boolean {
  return SECTION_ACCESS[section].includes(normalizeRole(role));
}

export function getAllowedSections(role: string | null | undefined): AdminSection[] {
  const r = normalizeRole(role);
  return (Object.keys(SECTION_ACCESS) as AdminSection[]).filter((s) => SECTION_ACCESS[s].includes(r));
}

/* ---------- fine-grained capabilities (permission matrix) ---------- */

export const can = {
  /** Suspend/unsuspend a business page. */
  suspendBusiness: (role: string | null | undefined) =>
    ['owner', 'admin'].includes(normalizeRole(role)),
  /** Verify a business. */
  verifyBusiness: (role: string | null | undefined) =>
    ['owner', 'admin'].includes(normalizeRole(role)),
  /** Permanently delete users or templates. */
  permanentDelete: (role: string | null | undefined) => normalizeRole(role) === 'owner',
  /** Invite admins / change roles. */
  manageAdmins: (role: string | null | undefined) => normalizeRole(role) === 'owner',
  /** View billing, plans and payments. */
  viewBilling: (role: string | null | undefined) => normalizeRole(role) === 'owner',
  /** System settings, feature flags, maintenance mode. */
  manageSystemSettings: (role: string | null | undefined) => normalizeRole(role) === 'owner',
  /** Full analytics; admin gets limited, support none. */
  fullAnalytics: (role: string | null | undefined) => normalizeRole(role) === 'owner',
  /** Revenue figures on the dashboard. */
  viewRevenue: (role: string | null | undefined) => normalizeRole(role) === 'owner',
};
