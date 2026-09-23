import { Profile } from '../../types';
import { getTemplateById } from '../../data/templates';

export interface DashboardPageEntry {
  id: string;
  name: string;
  category: string;
  cover: string;
  link: string;
  status: 'Active' | 'Draft';
  views: string;
  clicks: string;
  rating: string | null;
  template: string;
}

const formatCount = (n: number): string => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n));

/**
 * Build the dashboard "Your Pages" list from the signed-in user's real profile.
 * Every user page is the same template system — only the username URL differs.
 * Falls back to the demo page only when no profile exists (fresh preview).
 */
export function buildPagesFromProfile(profile: Profile | null): DashboardPageEntry[] {
  if (profile) {
    const template = getTemplateById(profile.template_id || '');
    return [
      {
        id: profile.id,
        name: profile.business_name || 'My Business',
        category: profile.category || 'General Business',
        cover: profile.cover_url || profile.avatar_url || profile.logo_url || '/images/cafe/cover.webp',
        link: `linkos.in/${profile.username || 'mybusiness'}`,
        status: 'Active',
        views: '—',
        clicks: '—',
        rating: profile.stats?.rating != null ? String(profile.stats.rating) : null,
        template: template?.name || 'Classic',
      },
    ];
  }

  // No signed-in business — return nothing so the dashboard shows a real empty state
  return [];
}
