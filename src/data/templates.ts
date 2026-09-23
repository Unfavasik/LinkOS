import { Profile } from '../types';
import { QueueType } from './industries';
import { ServiceItem } from '../types';

export type TemplateCategory =
  | 'Business'
  | 'Food & Cafe'
  | 'Retail'
  | 'Services'
  | 'Beauty & Spa'
  | 'Fitness'
  | 'Creative'
  | 'Real Estate'
  | 'Education'
  | 'Events'
  | 'Health'
  | 'Tech';

export type TemplateLayout =
  | 'classic' | 'banner' | 'split' | 'minimal' | 'bold'
  /* Refero-inspired design languages — each a genuinely distinct page structure */
  | 'terminal' | 'editorial' | 'storybook' | 'aurora' | 'swiss'
  | 'velvet' | 'bonfire' | 'darkroom' | 'graphite' | 'bento'
  | 'blueprint' | 'brutal' | 'notebook' | 'sticker' | 'linen'
  | 'candy' | 'mono' | 'dusk' | 'forest' | 'market'
  | 'cafe' | 'garage' | 'godi';

export interface PageTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  tags: string[];
  theme: Profile['theme'];
  accent_color: string;
  button_style: Profile['button_style'];
  font_family: Profile['font_family'];
  layout: TemplateLayout;
  popularity: number;
  is_pro: boolean;
  /* Admin-configured overrides (from the Supabase templates table) */
  cover_url?: string;
  preview_url?: string;
  industry_id?: string;
  queue_type?: QueueType;
  queue_label?: string;
  services?: ServiceItem[];
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  'Food & Cafe',
  'Services',
  'Retail',
];

const BASE_TEMPLATES: PageTemplate[] = [
  {
    id: 'cafe-pro',
    name: 'Urban Brew Café',
    category: 'Food & Cafe',
    description: 'Full-featured café & restaurant page — cover photo, menu with discounts, services, business hours, photo gallery and socials.',
    tags: ['cafe', 'restaurant', 'menu', 'gallery', 'bestseller'],
    theme: 'dark',
    accent_color: '#22C55E',
    button_style: 'rounded',
    font_family: 'inter',
    layout: 'cafe',
    popularity: 100,
    is_pro: true,
  },
  {
    id: 'autocare-pro',
    name: 'AutoCare Service Centre',
    category: 'Services',
    description: 'Full-featured car & bike service page — dark garage cover, priced service cards, why-choose-us checklist, business hours, photo gallery and reviews.',
    tags: ['auto', 'car service', 'bike service', 'garage', 'workshop'],
    theme: 'neutral',
    accent_color: '#2563EB',
    button_style: 'rounded',
    font_family: 'inter',
    layout: 'garage',
    popularity: 100,
    is_pro: true,
  },
  {
    id: 'godi-royal',
    name: 'Rofik Godi Centre',
    category: 'Retail',
    description: 'Premium dark-and-gold page for car seat covers & interior accessories — hero banner, product grid, trust stats, about section and sticky WhatsApp CTA.',
    tags: ['car seat covers', 'car accessories', 'auto', 'premium', 'dark'],
    theme: 'charcoal',
    accent_color: '#E8C87A',
    button_style: 'rounded',
    font_family: 'inter',
    layout: 'godi',
    popularity: 100,
    is_pro: true,
  },
];

export function getTemplateById(id: string | undefined | null): PageTemplate | undefined {
  if (!id) return undefined;
  return TEMPLATES.find((t) => t.id === id);
}

export const TEMPLATES: PageTemplate[] = BASE_TEMPLATES;
export const ALL_TEMPLATES = TEMPLATES;
