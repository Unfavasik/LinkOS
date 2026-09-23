export type ResourceChip = 'All' | 'Guides' | 'Templates' | 'Tools' | 'Business Tips';

export interface ResourceCategory {
  id: string;
  title: string;
  description: string;
  meta: string;
  icon: 'book' | 'file' | 'wrench' | 'bulb' | 'play' | 'help';
  /** Pastel card background */
  bg: string;
  /** Icon tile background + icon color */
  tileBg: string;
  tileColor: string;
  metaColor: string;
  chips: ResourceChip[];
  href: string;
}

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  {
    id: 'guides',
    title: 'Guides & Tutorials',
    description: 'Step-by-step guides to create, customize and grow your business page.',
    meta: '12 articles',
    icon: 'book',
    bg: 'bg-blue-50',
    tileBg: 'bg-blue-100',
    tileColor: 'text-blue-600',
    metaColor: 'text-blue-600',
    chips: ['Guides'],
    href: '/resources/guides',
  },
  {
    id: 'templates',
    title: 'Website Templates',
    description: 'Professionally designed templates for different business types.',
    meta: '50+ templates',
    icon: 'file',
    bg: 'bg-emerald-50',
    tileBg: 'bg-emerald-100',
    tileColor: 'text-emerald-600',
    metaColor: 'text-emerald-600',
    chips: ['Templates'],
    href: '/templates',
  },
  {
    id: 'tools',
    title: 'Tools & Utilities',
    description: 'Free tools to help your business — QR code generator, bio link, etc.',
    meta: '8 tools',
    icon: 'wrench',
    bg: 'bg-orange-50',
    tileBg: 'bg-orange-100',
    tileColor: 'text-orange-500',
    metaColor: 'text-orange-500',
    chips: ['Tools'],
    href: '/dashboard/qr',
  },
  {
    id: 'tips',
    title: 'Business Tips',
    description: 'Practical tips to get more customers and grow online.',
    meta: '20+ articles',
    icon: 'bulb',
    bg: 'bg-violet-50',
    tileBg: 'bg-violet-100',
    tileColor: 'text-violet-600',
    metaColor: 'text-violet-600',
    chips: ['Business Tips'],
    href: '/resources/business-tips',
  },
  {
    id: 'videos',
    title: 'Video Tutorials',
    description: 'Short video guides for quick learning.',
    meta: '15 videos',
    icon: 'play',
    bg: 'bg-rose-50',
    tileBg: 'bg-rose-100',
    tileColor: 'text-rose-500',
    metaColor: 'text-rose-500',
    chips: ['Guides'],
    href: '/resources/guides',
  },
  {
    id: 'help',
    title: 'Help & Support',
    description: 'Find answers to common questions or contact our support team.',
    meta: 'Help Center',
    icon: 'help',
    bg: 'bg-sky-50',
    tileBg: 'bg-sky-100',
    tileColor: 'text-sky-600',
    metaColor: 'text-sky-600',
    chips: ['All'],
    href: '/about',
  },
];

export type ArticleTag = 'Guide' | 'Template' | 'Business Tip';

export interface ArticleStep {
  title: string;
  body: string;
  /** Optional illustrative visual rendered under the step */
  visual?: 'signup' | 'templates' | 'customize' | 'publish';
}

export interface ResourceArticle {
  slug: string;
  tag: ArticleTag;
  tagColor: string;
  readTime: string;
  title: string;
  intro: string;
  hero: string;
  heroAlt: string;
  learn: string[];
  video?: string;
  steps: ArticleStep[];
}

export const RESOURCE_ARTICLES: ResourceArticle[] = [
  {
    slug: 'how-to-create-your-first-business-page',
    tag: 'Guide',
    tagColor: 'bg-blue-500',
    readTime: '5 min read',
    title: 'How to Create Your First Business Page',
    intro:
      'Follow this simple step-by-step guide to create a beautiful business page on LinkOS in just a few minutes. No coding. No hassle.',
    hero: '/images/resources/guide-hero.png',
    heroAlt: 'Laptop showing a LinkOS business page for a cafe',
    learn: [
      'How to create a LinkOS account',
      'Choose the right template',
      'Add your business details (name, photos, contact, etc.)',
      'Customize your page',
      'Publish and share with your customers',
    ],
    video: 'Watch Video Tutorial (3:45)',
    steps: [
      {
        title: 'Step 1: Create an Account',
        body: 'Go to LinkOS and click on "Create Your Page". Sign up using your email or continue with Google.',
        visual: 'signup',
      },
      {
        title: 'Step 2: Choose a Template',
        body: 'Browse our professionally designed templates and choose the one that fits your business.',
        visual: 'templates',
      },
      {
        title: 'Step 3: Add Your Business Details',
        body: 'Add your business name, logo, photos, menu or services, contact info and opening hours. Everything updates live as you type.',
        visual: 'customize',
      },
      {
        title: 'Step 4: Publish and Share',
        body: 'Hit publish and your page is live instantly. Share the link on WhatsApp, Facebook or print your QR code to attract more customers.',
        visual: 'publish',
      },
    ],
  },
  {
    slug: 'best-templates-for-restaurants-and-cafes',
    tag: 'Template',
    tagColor: 'bg-emerald-500',
    readTime: '12 templates',
    title: 'Best Templates for Restaurants & Cafés',
    intro:
      'A curated collection of the best LinkOS templates for restaurants, cafés and food businesses — with menus, galleries, reviews and online ordering built in.',
    hero: '/images/cafe/interior.webp',
    heroAlt: 'Cozy cafe interior',
    learn: [
      'Which templates work best for food businesses',
      'How to show your menu beautifully',
      'Adding photos that make customers hungry',
      'Collecting reviews and repeat orders',
      'Sharing your page with a QR code',
    ],
    steps: [
      {
        title: 'Step 1: Pick a Food Template',
        body: 'Open the Templates gallery and filter by "Food & Cafe". Preview any template to see how it looks on mobile and desktop.',
      },
      {
        title: 'Step 2: Add Your Menu',
        body: 'Use the built-in menu sections to list items with photos, prices and descriptions. Group items into categories like Starters, Mains and Drinks.',
      },
      {
        title: 'Step 3: Publish and Share',
        body: 'Publish your page and share the link or QR code on tables, receipts and social media.',
      },
    ],
  },
  {
    slug: '10-ways-to-get-more-customers-online',
    tag: 'Business Tip',
    tagColor: 'bg-violet-500',
    readTime: '8 min read',
    title: '10 Ways to Get More Customers Online',
    intro:
      'Practical, low-cost tips to bring more customers to your business page — from WhatsApp sharing to local SEO and review strategies.',
    hero: '/images/resources/growth-tips.png',
    heroAlt: 'Analytics dashboard showing business growth',
    learn: [
      'Share your page where customers already are',
      'Get found on Google with your business page',
      'Turn happy customers into reviews',
      'Use photos to build trust instantly',
      'Track what works with analytics',
    ],
    steps: [
      {
        title: '1. Share Your Link Everywhere',
        body: 'Add your LinkOS page link to your WhatsApp status, Facebook page, Instagram bio and Google Business profile.',
      },
      {
        title: '2. Ask for Reviews',
        body: 'After a good experience, ask happy customers to leave a review on your page. Social proof brings new customers.',
      },
      {
        title: '3. Keep Photos Fresh',
        body: 'Update your photos regularly. Pages with fresh, real photos get significantly more visits and orders.',
      },
    ],
  },
];

export const POPULAR_RESOURCES: {
  slug: string;
  title: string;
  tag: ArticleTag;
  tagColor: string;
  meta: string;
  thumb: string;
}[] = [
  {
    slug: 'how-to-create-your-first-business-page',
    title: 'How to Create Your First Business Page',
    tag: 'Guide',
    tagColor: 'bg-blue-500',
    meta: '5 min read',
    thumb: '/images/resources/guide-hero.png',
  },
  {
    slug: 'best-templates-for-restaurants-and-cafes',
    title: 'Best Templates for Restaurants & Cafés',
    tag: 'Template',
    tagColor: 'bg-emerald-500',
    meta: '12 templates',
    thumb: '/images/cafe/interior.webp',
  },
  {
    slug: '10-ways-to-get-more-customers-online',
    title: '10 Ways to Get More Customers Online',
    tag: 'Business Tip',
    tagColor: 'bg-violet-500',
    meta: '8 min read',
    thumb: '/images/resources/growth-tips.png',
  },
];
