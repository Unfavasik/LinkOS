export type PlanTier = 'free' | 'pro' | 'business';

export type EventType =
  | 'page_view'
  | 'whatsapp_click'
  | 'call_click'
  | 'directions_click'
  | 'product_click'
  | 'link_click'
  | 'qr_visit'
  | 'share_click';

export interface CustomLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
  enabled?: boolean;
  sort_order?: number;
}

export interface Profile {
  id: string;
  user_id: string;
  business_name: string;
  username: string;
  category: string;
  description: string;
  logo_url: string;
  cover_url?: string;
  avatar_url?: string;
  bio?: string;
  role?: string;
  github?: string;
  business_hours?: { days: string; hours: string }[];
  gallery?: string[];
  stats?: { rating?: number; customers?: string; years?: string };
  service_tags?: string[];
  twitter?: string;
  phone: string;
  whatsapp: string;
  whatsapp_message?: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  country: string;
  theme: 'neutral' | 'warm' | 'midnight' | 'emerald' | 'charcoal' | 'cream' | 'dark';
  accent_color: string;
  button_style: 'pill' | 'rounded' | 'sharp';
  font_family: 'inter' | 'serif' | 'mono' | 'playfair';
  theme_mode?: 'light' | 'dark';
  template_id?: string;
  layout?: string;
  whatsapp_enabled?: boolean;
  plan: PlanTier;
  verified?: boolean;
  is_suspended?: boolean;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  google_maps_url?: string;
  custom_links?: CustomLink[];
  queue_enabled?: boolean;
  services?: ServiceItem[];
  service_details?: { name: string; description: string; icon?: string; enabled: boolean }[];
  reviews?: Review[];
  social_links?: { platform: string; url: string; enabled: boolean }[];
  quick_actions?: string[];
  pin_code?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  profile_id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image_url: string;
  category: string;
  available: boolean;
  featured: boolean;
  sort_order: number;
  discount_pct?: number;
  offer_price?: number;
  created_at: string;
  updated_at: string;
}

export interface LinkItem {
  id: string;
  profile_id: string;
  title: string;
  url: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  profile_id: string;
  event_type: EventType;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AnalyticsSummary {
  total_views: number;
  unique_visitors: number;
  whatsapp_clicks: number;
  call_clicks: number;
  direction_clicks: number;
  product_clicks: number;
  link_clicks: number;
  qr_visits: number;
}

export interface Customer {
  id: string;
  profile_id: string;
  name: string;
  phone: string;
  email: string;
  notes?: string;
  total_orders?: number;
  total_spent?: number;
  last_order_at?: string;
  created_at: string;
}

export interface Order {
  id: string;
  profile_id: string;
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  product_name?: string;
  total_amount?: number;
  notes?: string;
  items?: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  total?: number;
  created_at: string;
}

export interface Review {
  id: string;
  author_name: string;
  rating: number;
  text: string;
  date: string;
}

/* ---------- Industry services & live queue ---------- */

export interface ServiceItem {
  name: string;
  price: number;
  minutes: number;
}

export type QueueEntryStatus = 'waiting' | 'serving' | 'done';

export interface QueueEntry {
  id: string;
  profile_id: string;
  token: number;
  customer_name: string;
  customer_phone: string;
  service_name: string;
  service_minutes: number;
  status: QueueEntryStatus;
  created_at: string;
  updated_at: string;
}
