/**
 * Help Center article catalogue with admin CRUD.
 *
 * The Help Center pages read from here instead of hardcoded arrays, so the
 * admin panel can add or remove guides. The three launch articles seed the
 * store on first run; after that the stored list is the single source of
 * truth (seeds can be edited or removed like any other article).
 */

import { RESOURCE_ARTICLES, type ResourceArticle } from '../data/resources';

export type HelpCategory =
  | 'Getting Started'
  | 'Templates'
  | 'Account & Settings'
  | 'Billing & Payments'
  | 'Domains & SEO'
  | 'Troubleshooting';

export const HELP_CATEGORIES: HelpCategory[] = [
  'Getting Started',
  'Templates',
  'Account & Settings',
  'Billing & Payments',
  'Domains & SEO',
  'Troubleshooting',
];

export interface HelpArticleEntry {
  slug: string;
  category: HelpCategory;
  article: ResourceArticle;
}

const KEY = 'linkos_help_articles_v1';

const SEED: HelpArticleEntry[] = [
  {
    slug: 'create-your-first-page',
    category: 'Getting Started',
    article: RESOURCE_ARTICLES[0],
  },
  {
    slug: 'connect-custom-domain',
    category: 'Domains & SEO',
    article: {
      slug: 'connect-custom-domain',
      tag: 'Guide',
      tagColor: 'bg-blue-500',
      readTime: '4 min read',
      title: 'How to Connect a Custom Domain',
      intro:
        'Use your own domain (like yourbusiness.com) for your LinkOS page in just a few clicks. No technical setup required.',
      hero: '/images/resources/guide-hero.png',
      heroAlt: 'Laptop showing a LinkOS business page on a custom domain',
      learn: [
        'Buy or use an existing domain',
        'Connect it to your LinkOS page',
        'Verify the connection',
        'Enable free SSL security',
      ],
      steps: [
        {
          title: 'Step 1: Open Domain Settings',
          body: 'From your dashboard, go to Settings and tap "Custom Domain".',
        },
        {
          title: 'Step 2: Enter Your Domain',
          body: "Type your domain name (e.g. yourbusiness.com) and tap Connect. If you don't have one, you can buy it right inside LinkOS.",
        },
        {
          title: 'Step 3: Verify and Go Live',
          body: 'We check the connection automatically. Once verified, free SSL security is enabled and your page is live on your own domain.',
        },
      ],
    },
  },
  {
    slug: 'billing-and-payments',
    category: 'Billing & Payments',
    article: {
      slug: 'billing-and-payments',
      tag: 'Guide',
      tagColor: 'bg-blue-500',
      readTime: '3 min read',
      title: 'How Billing and Payments Work',
      intro: 'Learn about LinkOS plans, invoices, refunds and upgrades — everything about payments in one place.',
      hero: '/images/resources/guide-hero.png',
      heroAlt: 'Laptop showing the LinkOS pricing page',
      learn: ['Compare Free and Pro plans', 'Upgrade or downgrade anytime', 'Download invoices', 'Request a refund'],
      steps: [
        {
          title: 'Step 1: Choose a Plan',
          body: 'Start on the Free plan forever. When you need premium templates, a custom domain and analytics, upgrade to Pro.',
        },
        {
          title: 'Step 2: Pay Securely',
          body: 'Pay with UPI, card or net banking. Payments are processed securely and your page upgrades instantly.',
        },
        {
          title: 'Step 3: Manage or Cancel',
          body: 'Download invoices, change your plan or cancel anytime from Billing in Settings. Refunds are processed within 5-7 working days.',
        },
      ],
    },
  },
];

export function loadHelpArticles(): HelpArticleEntry[] {
  try {
    if (!localStorage.getItem(KEY)) localStorage.setItem(KEY, JSON.stringify(SEED));
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HelpArticleEntry[]) : [...SEED];
  } catch {
    return [...SEED];
  }
}

function persist(items: HelpArticleEntry[]): void {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export const slugify = (title: string): string =>
  title
    .toLowerCase()
    .replace(/^how to /, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

export function addHelpArticle(entry: HelpArticleEntry): { ok: boolean; error?: string } {
  const items = loadHelpArticles();
  if (items.some((a) => a.slug === entry.slug)) {
    return { ok: false, error: 'An article with this URL slug already exists.' };
  }
  persist([entry, ...items]);
  return { ok: true };
}

export function deleteHelpArticle(slug: string): void {
  persist(loadHelpArticles().filter((a) => a.slug !== slug));
}

export function getHelpArticle(slug: string): HelpArticleEntry | undefined {
  return loadHelpArticles().find((a) => a.slug === slug);
}
