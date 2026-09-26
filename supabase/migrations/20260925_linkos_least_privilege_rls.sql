-- LinkOS least-privilege hardening for the live LinkOS Supabase project.
-- Reviewed against project ref gbhtrermfcoeunjqykbg on 2026-09-25.
-- Preserves published public reads and the public submission flows used by the site.
-- Deploy the matching application changes before or together with this migration.

begin;

-- RLS policy helpers use the authenticated JWT email and never trust client
-- supplied role/profile fields. Functions are SECURITY DEFINER so they can
-- read the protected admins/profiles tables without recursive RLS evaluation.
create or replace function public.is_linkos_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admins a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and a.is_active is true
      and a.role in ('owner', 'admin', 'support')
  );
$$;

create or replace function public.is_linkos_manager()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admins a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and a.is_active is true
      and a.role in ('owner', 'admin')
  );
$$;

create or replace function public.is_linkos_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admins a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and a.is_active is true
      and a.role = 'owner'
  );
$$;

create or replace function public.owns_linkos_profile(p_profile_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null and exists (
    select 1 from public.profiles p
    where p.id = p_profile_id and p.user_id = auth.uid()::text
  );
$$;

create or replace function public.is_public_linkos_profile(p_profile_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = p_profile_id
      and p.is_published is true
      and coalesce(p.is_suspended, false) is false
  );
$$;

create or replace function public.is_public_linkos_website(p_slug text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.websites w
    where lower(w.slug) = lower(p_slug)
      and w.status = 'live'
      and not exists (
        select 1 from public.profiles p
        where p.user_id = w.owner_id::text and p.is_suspended is true
      )
  );
$$;

create or replace function public.is_linkos_slug_available(p_slug text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists (select 1 from public.websites w where lower(w.slug) = lower(p_slug));
$$;

create or replace function public.is_linkos_username_available(
  p_username text,
  p_current_profile_id text default null
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists (
    select 1 from public.profiles p
    where lower(p.username) = lower(trim(p_username))
      and (
        p_current_profile_id is null
        or not (p.id = p_current_profile_id and p.user_id = auth.uid()::text)
      )
  );
$$;

revoke all on function public.is_linkos_staff() from public;
revoke all on function public.is_linkos_manager() from public;
revoke all on function public.is_linkos_owner() from public;
revoke all on function public.owns_linkos_profile(text) from public;
revoke all on function public.is_public_linkos_profile(text) from public;
revoke all on function public.is_linkos_slug_available(text) from public;
revoke all on function public.is_linkos_username_available(text,text) from public;
revoke all on function public.is_public_linkos_website(text) from public;
grant execute on function public.is_linkos_staff() to authenticated;
grant execute on function public.is_linkos_manager() to authenticated;
grant execute on function public.is_linkos_owner() to authenticated;
grant execute on function public.owns_linkos_profile(text) to authenticated;
grant execute on function public.is_public_linkos_profile(text) to anon, authenticated;
grant execute on function public.is_linkos_slug_available(text) to authenticated;
grant execute on function public.is_linkos_username_available(text,text) to anon, authenticated;

-- Remove permissive legacy policies first, including policies not represented
-- in source control, then establish a known policy set below.
do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = any (array[
        'profiles','user_profiles','products','links','analytics_events',
        'customers','orders','queue_entries','admins','admin_invites',
        'support_tickets','feedback','templates','guides','announcements',
        'websites','user_notifications','needle_chats','saved_templates'
      ])
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','user_profiles','products','links','analytics_events',
    'customers','orders','queue_entries','admins','admin_invites',
    'support_tickets','feedback','templates','guides','announcements',
    'websites','user_notifications','needle_chats','saved_templates'
  ] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- Protect privilege-bearing fields even when users update their own profile.
create or replace function public.guard_linkos_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.is_linkos_manager() then
    return new;
  end if;
  if auth.uid() is null then
    raise exception 'A signed-in LinkOS account is required';
  end if;
  if tg_op = 'INSERT' then
    new.user_id := auth.uid()::text;
    -- Authorization uses admins.role; public profile role is never self-assigned.
    new.role := 'user';
    new.plan := 'free';
    new.verified := false;
    new.is_suspended := false;
  else
    new.id := old.id;
    new.user_id := old.user_id;
    new.role := old.role;
    new.plan := old.plan;
    new.verified := old.verified;
    new.is_suspended := old.is_suspended;
    new.created_at := old.created_at;
  end if;
  return new;
end;
$$;

drop trigger if exists guard_linkos_profile_fields on public.profiles;
create trigger guard_linkos_profile_fields
before insert or update on public.profiles
for each row execute function public.guard_linkos_profile_fields();

create or replace function public.guard_linkos_user_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.is_linkos_manager() then
    return new;
  end if;
  if auth.uid() is null then
    raise exception 'A signed-in LinkOS account is required';
  end if;
  if tg_op = 'INSERT' then
    new.user_id := auth.uid()::text;
    new.role := 'user'::public.user_role;
  else
    new.user_id := old.user_id;
    new.role := old.role;
    new.created_at := old.created_at;
  end if;
  return new;
end;
$$;

drop trigger if exists guard_linkos_user_profile_fields on public.user_profiles;
create trigger guard_linkos_user_profile_fields
before insert or update on public.user_profiles
for each row execute function public.guard_linkos_user_profile_fields();

-- Admin records are only self-editable for display/avatar. Owner is the only
-- role allowed to change membership, status, or roles.
create or replace function public.guard_linkos_admin_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.is_linkos_owner() then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;
  if not public.is_linkos_staff()
     or lower(old.email) <> lower(coalesce(auth.jwt() ->> 'email', '')) then
    raise exception 'Only the owner may manage admin membership';
  end if;
  if tg_op = 'DELETE' then
    raise exception 'Only the owner may remove admins';
  end if;
  if (to_jsonb(new) - array['display_name','avatar_url','updated_at'])
       is distinct from
     (to_jsonb(old) - array['display_name','avatar_url','updated_at']) then
    raise exception 'Admins may only edit their own display name and avatar';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_linkos_admin_fields on public.admins;
create trigger guard_linkos_admin_fields
before update or delete on public.admins
for each row execute function public.guard_linkos_admin_fields();

-- Regular users may append conversation metadata to their own support ticket,
-- but may not change staff-controlled status, priority, or response fields.
create or replace function public.guard_linkos_ticket_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old_replies jsonb;
  v_new_replies jsonb;
  i integer;
begin
  if public.is_linkos_manager() then return new; end if;
  if tg_op = 'INSERT' then
    if auth.uid() is null then new.user_id := null; else new.user_id := auth.uid(); end if;
    new.status := 'open';
    new.priority := 'normal';
    new.admin_response := null;
    new.metadata := jsonb_build_object(
      'ticket_id', coalesce(new.metadata ->> 'ticket_id', gen_random_uuid()::text),
      'replies', '[]'::jsonb
    );
    new.created_at := now();
    new.updated_at := now();
    return new;
  end if;
  if public.is_linkos_staff() then
    if tg_op = 'DELETE' then raise exception 'Support staff cannot delete tickets'; end if;
    if new.user_id is distinct from old.user_id
       or new.email is distinct from old.email
       or new.name is distinct from old.name
       or new.subject is distinct from old.subject
       or new.message is distinct from old.message
       or new.category is distinct from old.category
       or new.created_at is distinct from old.created_at
       or (new.metadata ->> 'ticket_id') is distinct from (old.metadata ->> 'ticket_id') then
      raise exception 'Support staff cannot alter ticket identity or original content';
    end if;
    return new;
  end if;
  if auth.uid() is null or old.user_id is distinct from auth.uid() then
    raise exception 'Only the ticket owner or support staff may edit this ticket';
  end if;
  if old.status in ('resolved','closed') then
    raise exception 'This ticket is locked';
  end if;
  if new.user_id is distinct from old.user_id
     or new.email is distinct from old.email
     or new.name is distinct from old.name
     or new.subject is distinct from old.subject
     or new.message is distinct from old.message
     or new.category is distinct from old.category
     or new.priority is distinct from old.priority
     or new.admin_response is distinct from old.admin_response
     or new.status not in (old.status, 'open')
     or (new.metadata ->> 'ticket_id') is distinct from (old.metadata ->> 'ticket_id') then
    raise exception 'Ticket fields are restricted';
  end if;
  v_old_replies := coalesce(old.metadata -> 'replies', '[]'::jsonb);
  v_new_replies := coalesce(new.metadata -> 'replies', '[]'::jsonb);
  if jsonb_typeof(v_old_replies) is distinct from 'array'
     or jsonb_typeof(v_new_replies) is distinct from 'array'
     or jsonb_array_length(v_new_replies) <> jsonb_array_length(v_old_replies) + 1 then
    raise exception 'A user may append one reply at a time';
  end if;
  for i in 0..jsonb_array_length(v_old_replies) - 1 loop
    if v_old_replies -> i is distinct from v_new_replies -> i then
      raise exception 'Existing ticket replies cannot be changed';
    end if;
  end loop;
  if v_new_replies -> jsonb_array_length(v_old_replies) ->> 'by_role' is distinct from 'user' then
    raise exception 'Only the ticket owner may append user replies';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_linkos_ticket_fields on public.support_tickets;
create trigger guard_linkos_ticket_fields
before insert or update on public.support_tickets
for each row execute function public.guard_linkos_ticket_fields();

create or replace function public.guard_linkos_feedback_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.is_linkos_manager() then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;
  if tg_op = 'INSERT' then
    if auth.uid() is null then new.user_id := null; else new.user_id := auth.uid(); end if;
    new.status := 'new';
    new.admin_response := null;
    new.created_at := now();
    new.updated_at := now();
    return new;
  end if;
  if public.is_linkos_staff() then
    if tg_op = 'DELETE' then raise exception 'Support staff cannot delete feedback'; end if;
    if new.user_id is distinct from old.user_id
       or new.email is distinct from old.email
       or new.name is distinct from old.name
       or new.feedback_type is distinct from old.feedback_type
       or new.message is distinct from old.message
       or new.rating is distinct from old.rating
       or new.page_url is distinct from old.page_url
       or new.created_at is distinct from old.created_at then
      raise exception 'Support staff may only change feedback status and response';
    end if;
    return new;
  end if;
  raise exception 'Only staff may update feedback';
end;
$$;
drop trigger if exists guard_linkos_feedback_fields on public.feedback;
create trigger guard_linkos_feedback_fields
before insert or update on public.feedback
for each row execute function public.guard_linkos_feedback_fields();

create or replace function public.guard_linkos_public_order_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.is_linkos_manager() then return new; end if;
  new.status := 'pending';
  new.created_at := now();
  return new;
end;
$$;
drop trigger if exists guard_linkos_public_order_insert on public.orders;
create trigger guard_linkos_public_order_insert
before insert on public.orders
for each row execute function public.guard_linkos_public_order_insert();

create or replace function public.guard_linkos_public_queue_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.is_linkos_manager() then return new; end if;
  new.status := 'waiting';
  new.created_at := now();
  new.updated_at := now();
  return new;
end;
$$;
drop trigger if exists guard_linkos_public_queue_insert on public.queue_entries;
create trigger guard_linkos_public_queue_insert
before insert on public.queue_entries
for each row execute function public.guard_linkos_public_queue_insert();

-- Invited users redeem their own pending invitation only after signing in with
-- the invited email. No client may promote itself by writing admins directly.
create or replace function public.redeem_linkos_admin_invite()
returns setof public.admins
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text;
  v_invite public.admin_invites%rowtype;
  v_admin public.admins%rowtype;
begin
  v_email := lower(coalesce(auth.jwt() ->> 'email', ''));
  if auth.uid() is null or v_email = '' then
    return;
  end if;
  select * into v_admin from public.admins
  where lower(email) = v_email
  limit 1;
  if found then
    if v_admin.is_active is true then return next v_admin; end if;
    -- Do not silently reactivate a previously disabled admin via an old invite.
    return;
  end if;
  select * into v_invite
  from public.admin_invites
  where lower(email) = v_email and status = 'pending'
    and role in ('admin','support')
  order by created_at desc
  limit 1
  for update;
  if not found then
    return;
  end if;
  insert into public.admins(email, role, is_active, display_name)
  values (v_email, v_invite.role, true, split_part(v_email, '@', 1))
  returning * into v_admin;
  update public.admin_invites
  set status = 'accepted', updated_at = now()
  where id = v_invite.id;
  return next v_admin;
end;
$$;
revoke all on function public.redeem_linkos_admin_invite() from public;
grant execute on function public.redeem_linkos_admin_invite() to authenticated;

-- RLS policies. Public users may only read published content and create the
-- specific public submissions used by the site; no anonymous private reads.
create policy profiles_owner_read on public.profiles
for select to authenticated using (user_id = auth.uid()::text);
create policy profiles_owner_insert on public.profiles
for insert to authenticated with check (user_id = auth.uid()::text);
create policy profiles_owner_update on public.profiles
for update to authenticated using (user_id = auth.uid()::text)
with check (user_id = auth.uid()::text);
create policy profiles_owner_delete on public.profiles
for delete to authenticated using (user_id = auth.uid()::text);
create policy profiles_staff_manage on public.profiles
for all to authenticated using (public.is_linkos_manager())
with check (public.is_linkos_manager());

create policy user_profiles_self on public.user_profiles
for all to authenticated using (user_id = auth.uid()::text)
with check (user_id = auth.uid()::text);
create policy products_public_read on public.products
for select to anon, authenticated using (public.is_public_linkos_profile(profile_id));
create policy products_owner_all on public.products
for all to authenticated using (public.owns_linkos_profile(profile_id))
with check (public.owns_linkos_profile(profile_id));
create policy products_staff_all on public.products
for all to authenticated using (public.is_linkos_manager())
with check (public.is_linkos_manager());

create policy links_public_read on public.links
for select to anon, authenticated using (public.is_public_linkos_profile(profile_id));
create policy links_owner_all on public.links
for all to authenticated using (public.owns_linkos_profile(profile_id))
with check (public.owns_linkos_profile(profile_id));
create policy links_staff_all on public.links
for all to authenticated using (public.is_linkos_manager())
with check (public.is_linkos_manager());

create policy analytics_public_insert on public.analytics_events
for insert to anon, authenticated with check (public.is_public_linkos_profile(profile_id));
create policy analytics_owner_read on public.analytics_events
for select to authenticated using (public.owns_linkos_profile(profile_id));
create policy analytics_staff_all on public.analytics_events
for all to authenticated using (public.is_linkos_manager())
with check (public.is_linkos_manager());

create policy customers_owner_all on public.customers
for all to authenticated using (public.owns_linkos_profile(profile_id))
with check (public.owns_linkos_profile(profile_id));
create policy customers_staff_all on public.customers
for all to authenticated using (public.is_linkos_manager())
with check (public.is_linkos_manager());

create policy orders_public_insert on public.orders
for insert to anon, authenticated with check (public.is_public_linkos_profile(profile_id));
create policy orders_owner_all on public.orders
for all to authenticated using (public.owns_linkos_profile(profile_id))
with check (public.owns_linkos_profile(profile_id));
create policy orders_staff_all on public.orders
for all to authenticated using (public.is_linkos_manager())
with check (public.is_linkos_manager());

create policy queue_entries_public_insert on public.queue_entries
for insert to anon, authenticated with check (public.is_public_linkos_profile(profile_id));
create policy queue_entries_owner_all on public.queue_entries
for all to authenticated using (public.owns_linkos_profile(profile_id))
with check (public.owns_linkos_profile(profile_id));
create policy queue_entries_staff_all on public.queue_entries
for all to authenticated using (public.is_linkos_manager())
with check (public.is_linkos_manager());

create policy admins_self_read on public.admins
for select to authenticated
using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));
create policy admins_owner_manage on public.admins
for all to authenticated using (public.is_linkos_owner())
with check (public.is_linkos_owner());
create policy admins_self_profile_update on public.admins
for update to authenticated
using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')) and is_active is true)
with check (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')) and is_active is true);

create policy admin_invites_owner_all on public.admin_invites
for all to authenticated using (public.is_linkos_owner())
with check (public.is_linkos_owner());

create policy support_tickets_public_insert on public.support_tickets
for insert to anon with check (user_id is null);
create policy support_tickets_user_insert on public.support_tickets
for insert to authenticated with check (user_id = auth.uid());
create policy support_tickets_user_read on public.support_tickets
for select to authenticated using (user_id = auth.uid());
create policy support_tickets_user_update on public.support_tickets
for update to authenticated using (user_id = auth.uid())
with check (user_id = auth.uid());
create policy support_tickets_staff_read on public.support_tickets
for select to authenticated using (public.is_linkos_staff());
create policy support_tickets_staff_update on public.support_tickets
for update to authenticated using (public.is_linkos_staff())
with check (public.is_linkos_staff());
create policy support_tickets_manager_delete on public.support_tickets
for delete to authenticated using (public.is_linkos_manager());

create policy feedback_public_insert on public.feedback
for insert to anon with check (user_id is null);
create policy feedback_user_insert on public.feedback
for insert to authenticated with check (user_id is null or user_id = auth.uid());
create policy feedback_user_read on public.feedback
for select to authenticated using (user_id = auth.uid());
create policy feedback_staff_read on public.feedback
for select to authenticated using (public.is_linkos_staff());
create policy feedback_staff_update on public.feedback
for update to authenticated using (public.is_linkos_staff())
with check (public.is_linkos_staff());
create policy feedback_manager_delete on public.feedback
for delete to authenticated using (public.is_linkos_manager());

create policy templates_public_read on public.templates
for select to anon, authenticated using (is_active is true);
create policy templates_staff_read on public.templates
for select to authenticated using (public.is_linkos_staff());
create policy templates_manager_manage on public.templates
for all to authenticated using (public.is_linkos_manager())
with check (public.is_linkos_manager());

create policy guides_public_read on public.guides
for select to anon, authenticated using (is_published is true);
create policy guides_staff_read on public.guides
for select to authenticated using (public.is_linkos_staff());
create policy guides_manager_manage on public.guides
for all to authenticated using (public.is_linkos_manager())
with check (public.is_linkos_manager());

create policy announcements_public_read on public.announcements
for select to anon, authenticated using (published is true);
create policy announcements_staff_read on public.announcements
for select to authenticated using (public.is_linkos_staff());
create policy announcements_manager_manage on public.announcements
for all to authenticated using (public.is_linkos_manager())
with check (public.is_linkos_manager());

-- Public site rows are determined by a safe slug predicate; private owner rows
-- remain visible only to the matching authenticated owner or managers.
create policy websites_owner_all on public.websites
for all to authenticated using (owner_id = auth.uid())
with check (owner_id = auth.uid());
create policy websites_manager_manage on public.websites
for all to authenticated using (public.is_linkos_manager())
with check (public.is_linkos_manager());

create policy notifications_user_read on public.user_notifications
for select to authenticated
using (recipient_id = auth.uid()::text or broadcast is true);
create policy notifications_staff_insert on public.user_notifications
for insert to authenticated with check (public.is_linkos_manager());
create policy notifications_manager_all on public.user_notifications
for all to authenticated using (public.is_linkos_manager())
with check (public.is_linkos_manager());

create policy needle_chats_self_all on public.needle_chats
for all to authenticated using (user_id = auth.uid()::text)
with check (user_id = auth.uid()::text);
create policy needle_chats_staff_read on public.needle_chats
for select to authenticated using (public.is_linkos_manager());

create policy saved_templates_self_select on public.saved_templates
for select to authenticated using (user_id = auth.uid()::text);
create policy saved_templates_self_insert on public.saved_templates
for insert to authenticated with check (user_id = auth.uid()::text);
create policy saved_templates_self_delete on public.saved_templates
for delete to authenticated using (user_id = auth.uid()::text);

-- Tighten grants to match the policies; anon reads published data through
-- safe views and may perform narrowly scoped public submissions.
revoke all privileges on all tables in schema public from anon, authenticated;
revoke all privileges on all sequences in schema public from anon, authenticated;
grant usage on schema public to anon, authenticated;
alter default privileges in schema public
  revoke select, insert, update, delete on tables from anon, authenticated;
alter default privileges in schema public
  revoke usage, select, update on sequences from anon, authenticated;

grant select on public.products, public.links, public.templates,
  public.guides, public.announcements, public.public_profiles to anon;
grant insert on public.analytics_events, public.orders, public.queue_entries,
  public.support_tickets, public.feedback to anon;

grant select, insert, update, delete on public.profiles, public.user_profiles,
  public.products, public.links, public.analytics_events, public.customers,
  public.orders, public.queue_entries, public.admins, public.admin_invites,
  public.support_tickets, public.feedback, public.templates, public.guides,
  public.announcements, public.websites, public.user_notifications,
  public.needle_chats, public.saved_templates to authenticated;
grant select on public.public_profiles to authenticated;

-- Safe public projection: the view owner reads the protected base table, but
-- the view only returns published, non-suspended profiles and masks user_id.
create or replace view public.public_profiles
with (security_invoker = false, security_barrier = true)
as select id, null::text as user_id, business_name, username, category,
  description, logo_url, cover_url, avatar_url, bio, business_hours, gallery,
  stats, service_tags, phone, whatsapp, whatsapp_message, email, website,
  address, city, state, country, theme, accent_color, button_style,
  font_family, theme_mode, template_id, layout, whatsapp_enabled, plan,
  verified, instagram, facebook, youtube, google_maps_url, custom_links,
  queue_enabled, services, service_details, reviews, social_links, quick_actions,
  created_at, updated_at
from public.profiles
where is_published is true and coalesce(is_suspended, false) is false;

create or replace view public.public_websites
with (security_invoker = false, security_barrier = true)
as select id, template_id, name, slug, status,
  (content - 'user_id' - 'owner_email' - 'role' - 'is_suspended') as content,
  created_at, updated_at
from public.websites
where public.is_public_linkos_website(slug);
grant select on public.public_websites to anon, authenticated;
-- Public buckets stay readable via public URLs. Uploads are authenticated and
-- scoped to the caller's UUID folder; managers may manage LinkOS media.
-- Replace the live broad policy found during the 2026-09-25 audit and make
-- this migration safely re-runnable without removing unrelated future policies.
drop policy if exists "allow all object access" on storage.objects;
drop policy if exists linkos_public_media_read on storage.objects;
drop policy if exists linkos_user_media_insert on storage.objects;
drop policy if exists linkos_user_media_update on storage.objects;
drop policy if exists linkos_user_media_delete on storage.objects;
drop policy if exists linkos_staff_media_all on storage.objects;
create policy linkos_public_media_read on storage.objects
for select to anon, authenticated
using (bucket_id in ('logos','products'));
create policy linkos_user_media_insert on storage.objects
for insert to authenticated
with check (
  bucket_id in ('logos','products')
  and (storage.foldername(name))[1] = auth.uid()::text
);
create policy linkos_user_media_update on storage.objects
for update to authenticated
using (
  bucket_id in ('logos','products')
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id in ('logos','products')
  and (storage.foldername(name))[1] = auth.uid()::text
);
create policy linkos_user_media_delete on storage.objects
for delete to authenticated
using (
  bucket_id in ('logos','products')
  and (storage.foldername(name))[1] = auth.uid()::text
);
create policy linkos_staff_media_all on storage.objects
for all to authenticated
using (public.is_linkos_manager() and bucket_id in ('logos','products'))
with check (public.is_linkos_manager() and bucket_id in ('logos','products'));

commit;
