/**
 * Shared admin session cache. Kept in its own module so both `storage.ts`
 * (which must clear the cache when the active user changes) and
 * `adminAuth.ts` (which owns verification) can import it without creating a
 * circular dependency.
 */
export interface AdminRecord {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  display_name?: string | null;
  avatar_url?: string | null;
}

let cachedAdmin: AdminRecord | null | undefined;

export function getCachedAdminRecord(): AdminRecord | null {
  return cachedAdmin ?? null;
}

export function setCachedAdminRecord(record: AdminRecord | null): void {
  cachedAdmin = record;
}

export function clearAdminCache(): void {
  cachedAdmin = undefined;
}
