-- LinkOS — Production Supabase Schema & Row Level Security (RLS)
-- Run this SQL in your Supabase SQL Editor (https://app.supabase.com)

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. PROFILES TABLE
create table if not exists public.profiles (
  id text primary key default uuid_generate_v4()::text,
  user_id uuid references auth.users(id) on delete cascade,
  business_name text not null,
  username text unique not null,
  category text,
  description text,
  logo_url text,
  cover_url text,
  phone text,
  whatsapp text,
  whatsapp_message text,
  email text,
  website text,
  address text,
  city text,
  state text,
  country text default 'India',
  theme text default 'neutral',
  accent_color text default '#18181B',
  button_style text default 'rounded',
  font_family text default 'inter',
  plan text default 'free',
  verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index username for sub-millisecond public routing
create index if not exists idx_profiles_username on public.profiles (lower(username));
create index if not exists idx_profiles_user_id on public.profiles (user_id);

-- 3. PRODUCTS TABLE
create table if not exists public.products (
  id text primary key default uuid_generate_v4()::text,
  profile_id text references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  price numeric(10, 2) not null default 0.00,
  currency text default '₹',
  image_url text,
  category text,
  available boolean default true,
  featured boolean default false,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_products_profile_id on public.products (profile_id);

-- 4. LINKS TABLE
create table if not exists public.links (
  id text primary key default uuid_generate_v4()::text,
  profile_id text references public.profiles(id) on delete cascade not null,
  title text not null,
  url text not null,
  icon text default 'link',
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_links_profile_id on public.links (profile_id);

-- 5. ANALYTICS EVENTS TABLE
create table if not exists public.analytics_events (
  id text primary key default uuid_generate_v4()::text,
  profile_id text references public.profiles(id) on delete cascade not null,
  event_type text not null, -- 'page_view', 'whatsapp_click', 'call_click', 'directions_click', 'product_click', 'link_click', 'qr_visit'
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_analytics_profile_id on public.analytics_events (profile_id);
create index if not exists idx_analytics_created_at on public.analytics_events (created_at);

-- 6. CUSTOMERS TABLE
create table if not exists public.customers (
  id text primary key default uuid_generate_v4()::text,
  profile_id text references public.profiles(id) on delete cascade not null,
  name text not null,
  phone text,
  email text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_customers_profile_id on public.customers (profile_id);

-- 7. ORDERS TABLE
create table if not exists public.orders (
  id text primary key default uuid_generate_v4()::text,
  profile_id text references public.profiles(id) on delete cascade not null,
  customer_id text references public.customers(id) on delete set null,
  customer_name text,
  customer_phone text,
  items jsonb default '[]'::jsonb,
  status text default 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
  total numeric(10, 2) default 0.00,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_orders_profile_id on public.orders (profile_id);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.links enable row level security;
alter table public.analytics_events enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;

-- PROFILES POLICIES
-- Anyone can view profiles (needed for public pages)
create policy "Allow public view for profiles"
  on public.profiles for select
  using (true);

-- Authenticated owner can insert their own profile
create policy "Allow user to create their own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id or auth.uid() is not null);

-- Authenticated owner can update their own profile
create policy "Allow user to update their own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

-- Authenticated owner can delete their own profile
create policy "Allow user to delete their own profile"
  on public.profiles for delete
  using (auth.uid() = user_id);

-- PRODUCTS POLICIES
-- Anyone can view available products for public storefront
create policy "Allow public view for available products"
  on public.products for select
  using (true);

-- Authenticated owner can manage products
create policy "Allow owner to insert products"
  on public.products for insert
  with check (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  );

create policy "Allow owner to update products"
  on public.products for update
  using (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  );

create policy "Allow owner to delete products"
  on public.products for delete
  using (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  );

-- LINKS POLICIES
create policy "Allow public view for active links"
  on public.links for select
  using (true);

create policy "Allow owner to manage links"
  on public.links for all
  using (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  );

-- ANALYTICS EVENTS POLICIES
-- Anyone (visitors) can insert analytics events
create policy "Allow public to record analytics events"
  on public.analytics_events for insert
  with check (true);

-- Only profile owners can view analytics
create policy "Allow profile owner to read analytics"
  on public.analytics_events for select
  using (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  );

-- CUSTOMERS & ORDERS POLICIES
create policy "Allow owner to manage customers"
  on public.customers for all
  using (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  );

create policy "Allow public to insert orders/enquiries"
  on public.orders for insert
  with check (true);

create policy "Allow owner to manage orders"
  on public.orders for all
  using (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  );

-- ====================================================================
-- STORAGE BUCKETS (logos, products)
-- ====================================================================
-- Run in Supabase SQL editor to create public buckets:
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true), ('products', 'products', true)
on conflict (id) do nothing;

create policy "Allow public read of logos"
  on storage.objects for select
  using (bucket_id = 'logos');

create policy "Allow authenticated upload of logos"
  on storage.objects for insert
  with check (bucket_id = 'logos' and auth.role() = 'authenticated');

create policy "Allow public read of products"
  on storage.objects for select
  using (bucket_id = 'products');

create policy "Allow authenticated upload of products"
  on storage.objects for insert
  with check (bucket_id = 'products' and auth.role() = 'authenticated');
