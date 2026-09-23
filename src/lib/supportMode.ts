/**
 * Support Mode — a restricted admin panel view.
 *
 * Support staff are always in support mode. Owners and admins can also
 * temporarily switch into it to see exactly what support sees (and to work
 * ticket queues without full-power tools in the way). The flag is per-browser
 * and never changes the admin's real role.
 */
import { normalizeRole, type AdminRole } from './adminPermissions';

const KEY = 'linkos_admin_support_mode_v1';

export function isSupportModeActive(): boolean {
  try {
    return localStorage.getItem(KEY) === 'on';
  } catch {
    return false;
  }
}

export function setSupportMode(on: boolean): void {
  try {
    if (on) localStorage.setItem(KEY, 'on');
    else localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable — mode just won't persist */
  }
}

/** The role the panel should behave as, accounting for Support Mode. */
export function getEffectiveRole(role: string | null | undefined): AdminRole {
  const actual = normalizeRole(role);
  if (actual === 'support') return 'support';
  if (isSupportModeActive()) return 'support';
  return actual;
}
