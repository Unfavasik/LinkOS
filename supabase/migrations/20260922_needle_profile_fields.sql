-- LinkOS Needle integration fields and timestamp triggers.

begin;

alter table public.profiles
  add column if not exists social_links jsonb not null default '{}'::jsonb,
  add column if not exists whatsapp_enabled boolean not null default true;

-- Existing projects already have updated_at on both tables; these triggers
-- ensure backend writes and dashboard edits always refresh it server-side.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

-- Keep the columns available to the existing owner policies, but do not
-- grant any new public write capability.
commit;
