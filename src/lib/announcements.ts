/**
 * Platform-wide announcements.
 *
 * Admins compose announcements in the admin panel; published ones appear on
 * the public /announcements page (linked from the Support Center sidebar).
 * Stored in localStorage under a versioned key, seeded with launch copy so
 * the public page is never empty on first run.
 */

export interface Announcement {
  id: string;
  title: string;
  body: string;
  created_at: string;
  /** Drafts stay in the admin panel only; published items go public. */
  published: boolean;
}

const KEY = 'linkos_announcements_v1';

const SEED: Announcement[] = [
  {
    id: 'seed-ann-1',
    title: 'LinkOS Pro is here',
    body:
      'Upgrade to Pro for premium templates, a custom domain, advanced analytics and priority support. Your first 14 days are on us.',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    published: true,
  },
  {
    id: 'seed-ann-2',
    title: 'New: QR codes for every page',
    body:
      'Every business page now gets a scannable QR code you can download and print on menus, flyers and packaging. Find it under Dashboard → QR Code.',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    published: true,
  },
];

function seedIfEmpty(): void {
  if (localStorage.getItem(KEY)) return;
  localStorage.setItem(KEY, JSON.stringify(SEED));
}

export function loadAnnouncements(): Announcement[] {
  try {
    seedIfEmpty();
    const raw = localStorage.getItem(KEY);
    const items = raw ? (JSON.parse(raw) as Announcement[]) : [];
    return items.sort((a, b) => b.created_at.localeCompare(a.created_at));
  } catch {
    return [...SEED];
  }
}

function persist(items: Announcement[]): void {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function addAnnouncement(input: { title: string; body: string; published: boolean }): Announcement {
  const item: Announcement = {
    id: crypto.randomUUID(),
    title: input.title.trim(),
    body: input.body.trim(),
    created_at: new Date().toISOString(),
    published: input.published,
  };
  persist([item, ...loadAnnouncements()]);
  return item;
}

export function updateAnnouncement(id: string, patch: Partial<Pick<Announcement, 'title' | 'body' | 'published'>>): void {
  persist(loadAnnouncements().map((a) => (a.id === id ? { ...a, ...patch } : a)));
}

export function deleteAnnouncement(id: string): void {
  persist(loadAnnouncements().filter((a) => a.id !== id));
}

export function loadPublishedAnnouncements(): Announcement[] {
  return loadAnnouncements().filter((a) => a.published);
}
