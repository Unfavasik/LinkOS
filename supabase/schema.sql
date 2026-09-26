-- ============================================================
-- LinkOS — complete Supabase schema (new project setup)
-- Run this whole file in: Supabase Dashboard → SQL Editor → New query → Run
-- Safe to re-run: uses IF NOT EXISTS / ON CONFLICT DO NOTHING.
-- ============================================================

-- ---------- Extensions ----------
create extension if not exists "pgcrypto";

-- ---------- Enums ----------
do $$ begin
  create type public.user_role as enum ('user', 'admin', 'owner', 'support');
exception when duplicate_object then null; end $$;

-- ============================================================
-- 1. profiles — business pages (id is client-generated text)
-- ============================================================
create table if not exists public.profiles (
  id text primary key,
  user_id text,
  business_name text,
  username text,
  category text,
  description text,
  logo_url text,
  cover_url text,
  avatar_url text,
  bio text,
  role text,
  github text,
  business_hours jsonb,
  gallery jsonb,
  stats jsonb,
  service_tags jsonb,
  twitter text,
  phone text,
  whatsapp text,
  whatsapp_message text,
  email text,
  website text,
  address text,
  city text,
  state text,
  country text,
  theme text default 'neutral',
  accent_color text default '#2563EB',
  button_style text default 'rounded',
  font_family text default 'inter',
  theme_mode text,
  template_id text,
  layout text,
  whatsapp_enabled boolean,
  plan text default 'free',
  verified boolean default false,
  instagram text,
  facebook text,
  youtube text,
  google_maps_url text,
  custom_links jsonb,
  queue_enabled boolean default false,
  services jsonb,
  service_details jsonb,
  reviews jsonb,
  social_links jsonb,
  quick_actions jsonb,
  pin_code text,
  is_published boolean default false,
  is_suspended boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists profiles_username_idx on public.profiles (username);
create index if not exists profiles_user_id_idx on public.profiles (user_id);

-- ============================================================
-- 2. public_profiles — public view of profiles (anon-readable)
-- ============================================================
create or replace view public.public_profiles
with (security_invoker = false) as
select
  id, user_id, business_name, username, category, description,
  logo_url, cover_url, avatar_url, bio, business_hours, gallery,
  stats, service_tags, phone, whatsapp, whatsapp_message, email,
  website, address, city, state, country, theme, accent_color,
  button_style, font_family, theme_mode, template_id, layout,
  whatsapp_enabled, plan, verified, instagram, facebook, youtube,
  google_maps_url, custom_links, queue_enabled, services,
  service_details, reviews, social_links, quick_actions,
  created_at, updated_at
from public.profiles;

-- ============================================================
-- 3. user_profiles — per-user account metadata
-- ============================================================
create table if not exists public.user_profiles (
  user_id text primary key,
  email text,
  display_name text,
  avatar_url text,
  role public.user_role default 'user',
  location text,
  phone text,
  bio text,
  github_url text,
  instagram_url text,
  youtube_url text,
  social_links jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 4. products
-- ============================================================
create table if not exists public.products (
  id text primary key,
  profile_id text not null,
  name text,
  description text,
  price numeric default 0,
  currency text default 'INR',
  image_url text,
  category text,
  available boolean default true,
  featured boolean default false,
  sort_order integer default 0,
  discount_pct numeric,
  offer_price numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists products_profile_idx on public.products (profile_id);

-- ============================================================
-- 5. links
-- ============================================================
create table if not exists public.links (
  id text primary key,
  profile_id text not null,
  title text,
  url text,
  icon text,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);
create index if not exists links_profile_idx on public.links (profile_id);

-- ============================================================
-- 6. analytics_events
-- ============================================================
create table if not exists public.analytics_events (
  id text primary key,
  profile_id text not null,
  event_type text not null,
  metadata jsonb,
  created_at timestamptz default now()
);
create index if not exists analytics_profile_idx on public.analytics_events (profile_id);
create index if not exists analytics_created_idx on public.analytics_events (created_at);

-- ============================================================
-- 7. customers
-- ============================================================
create table if not exists public.customers (
  id text primary key,
  profile_id text not null,
  name text,
  phone text,
  email text,
  notes text,
  total_orders integer default 0,
  total_spent numeric default 0,
  last_order_at timestamptz,
  created_at timestamptz default now()
);
create index if not exists customers_profile_idx on public.customers (profile_id);

-- ============================================================
-- 8. orders
-- ============================================================
create table if not exists public.orders (
  id text primary key,
  profile_id text not null,
  customer_id text,
  customer_name text,
  customer_phone text,
  product_name text,
  total_amount numeric default 0,
  notes text,
  items jsonb,
  status text default 'pending',
  total numeric,
  created_at timestamptz default now()
);
create index if not exists orders_profile_idx on public.orders (profile_id);

-- ============================================================
-- 9. queue_entries — live service queue
-- ============================================================
create table if not exists public.queue_entries (
  id text primary key,
  profile_id text not null,
  token integer,
  customer_name text,
  customer_phone text,
  service_name text,
  service_minutes integer default 0,
  status text default 'waiting',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists queue_profile_idx on public.queue_entries (profile_id);

-- ============================================================
-- 10. admins — admin panel access (uuid ids, DB-generated)
-- ============================================================
create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role text default 'admin',
  is_active boolean default true,
  display_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 11. admin_invites — pending admin invitations
-- ============================================================
create table if not exists public.admin_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role text default 'admin',
  status text default 'pending',
  invited_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists admin_invites_email_idx on public.admin_invites (email);

-- ============================================================
-- 12. support_tickets
-- ============================================================
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  email text,
  name text,
  subject text,
  message text,
  category text,
  status text default 'open',
  priority text default 'normal',
  admin_response text,
  metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 13. feedback
-- ============================================================
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  email text,
  name text,
  feedback_type text default 'general',
  message text,
  rating integer,
  page_url text,
  status text default 'new',
  admin_response text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 14. templates — admin-editable template overrides
-- ============================================================
create table if not exists public.templates (
  id text primary key,
  name text,
  description text,
  category text,
  theme text,
  accent_color text,
  button_style text,
  font_family text,
  layout text,
  services jsonb,
  cover_url text,
  preview_url text,
  popularity integer default 0,
  is_pro boolean default false,
  is_active boolean default true,
  tags jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- GRANTS — anon + authenticated full DML (matches the previous
-- project where RLS was disabled). service_role always has access.
-- ============================================================
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to anon, authenticated, service_role;
grant select on public.public_profiles to anon, authenticated, service_role;
grant usage, select on all sequences in schema public to anon, authenticated, service_role;
alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated, service_role;

-- ============================================================
-- GUIDES & TUTORIALS — admin-authored articles for the Resources
-- page. Steps are ordered JSON; each step can carry an image URL
-- (uploads are converted to WebP before the URL is stored).
-- ============================================================
create table if not exists public.guides (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  intro text default '',
  tag text default 'Guide',
  read_time text default '',
  hero_url text default '',
  hero_alt text default '',
  learn jsonb default '[]'::jsonb,
  video text default '',
  video_url text default '',
  tags jsonb default '[]'::jsonb,
  steps jsonb default '[]'::jsonb,
  is_published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- STORAGE — public buckets for image uploads (logos, products).
-- Avatars upload into `logos` (see StorageService.uploadImage).
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('logos', 'logos', true, 5242880, array['image/jpeg','image/png','image/webp','image/svg+xml']),
  ('products', 'products', true, 5242880, array['image/jpeg','image/png','image/webp','image/svg+xml'])
on conflict (id) do nothing;

-- Open access policy matching the project-wide "RLS disabled" setup.
drop policy if exists "allow all object access" on storage.objects;
create policy "allow all object access" on storage.objects
  for all to anon, authenticated using (true) with check (true);

-- ============================================================
-- SEED — admins + templates
-- NOTE: no owner is seeded here. Create the owner from the app
-- (Admin Panel → Manage Admins) or the Supabase dashboard after
-- the first login, so the account belongs to a real Auth user.
-- ============================================================
insert into public.admins (email, role, is_active, display_name)
values ('ayatulsekh3037@gmail.com', 'admin', true, 'Ayatul')
on conflict (email) do nothing;

insert into public.templates (id, name, category, description, theme, layout, popularity, is_pro, is_active, tags)
values
  ('cafe-pro', 'Urban Brew Café', 'Food & Cafe', 'Full-featured café & restaurant page — cover photo, menu with discounts, services, business hours, photo gallery and socials.', 'dark', 'cafe', 100, true, true, '["cafe", "restaurant", "menu", "gallery", "Bestseller"]'::jsonb),
  ('autocare-pro', 'AutoCare Service Centre', 'Services', 'Full-featured car & bike service page — dark garage cover, priced service cards, why-choose-us checklist, business hours, photo gallery and reviews.', 'neutral', 'garage', 100, true, true, '["auto", "car service", "bike service", "garage", "workshop", "Pro"]'::jsonb),
  ('godi-royal', 'Rofik Godi Centre', 'Retail', 'Premium dark-and-gold page for car seat covers & interior accessories — hero banner, product grid, trust stats, about section and sticky WhatsApp CTA.', 'charcoal', 'godi', 100, true, true, '["car seat covers", "car accessories", "auto", "premium", "dark", "Pro"]'::jsonb)
on conflict (id) do nothing;
