-- Remove implicit/existing client EXECUTE access from internal SECURITY DEFINER
-- trigger functions and from helpers that are only called inside safe views.
-- Keep grants only for policy helpers/RPCs the client actually needs.
begin;

revoke execute on function public.guard_linkos_profile_fields() from public, anon, authenticated;
revoke execute on function public.guard_linkos_user_profile_fields() from public, anon, authenticated;
revoke execute on function public.guard_linkos_admin_fields() from public, anon, authenticated;
revoke execute on function public.guard_linkos_ticket_fields() from public, anon, authenticated;
revoke execute on function public.guard_linkos_feedback_fields() from public, anon, authenticated;
revoke execute on function public.guard_linkos_public_order_insert() from public, anon, authenticated;
revoke execute on function public.guard_linkos_public_queue_insert() from public, anon, authenticated;
revoke execute on function public.is_public_linkos_website(text) from public, anon, authenticated;

revoke execute on function public.is_linkos_staff() from public, anon;
revoke execute on function public.is_linkos_manager() from public, anon;
revoke execute on function public.is_linkos_owner() from public, anon;
revoke execute on function public.owns_linkos_profile(text) from public, anon;
revoke execute on function public.is_linkos_slug_available(text) from public, anon;
revoke execute on function public.redeem_linkos_admin_invite() from public, anon;

-- These two functions are intentionally callable: RLS uses the public-profile
-- predicate, and signup/profile editing needs only a boolean username result.
revoke execute on function public.is_public_linkos_profile(text) from public;
revoke execute on function public.is_linkos_username_available(text,text) from public;
grant execute on function public.is_public_linkos_profile(text) to anon, authenticated;
grant execute on function public.is_linkos_username_available(text,text) to anon, authenticated;

grant execute on function public.is_linkos_staff() to authenticated;
grant execute on function public.is_linkos_manager() to authenticated;
grant execute on function public.is_linkos_owner() to authenticated;
grant execute on function public.owns_linkos_profile(text) to authenticated;
grant execute on function public.is_linkos_slug_available(text) to authenticated;
grant execute on function public.redeem_linkos_admin_invite() to authenticated;

-- public_profiles contains only fields intended for public business pages.
-- Use an invoker view and let base-table RLS enforce published/non-suspended rows.
drop policy if exists profiles_public_read on public.profiles;
revoke select on public.profiles from anon;
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
grant select on public.public_profiles to anon, authenticated;

create or replace view public.public_websites
with (security_invoker = false, security_barrier = true)
as select id, template_id, name, slug, status,
  (content - 'id' - 'user_id' - 'owner_id' - 'owner_email' - 'role'
    - 'is_suspended' - 'is_published') as content,
  created_at, updated_at
from public.websites w
where w.status = 'live'
  and not exists (
    select 1 from public.profiles p
    where p.user_id = w.owner_id::text and p.is_suspended is true
  );
grant select on public.public_websites to anon, authenticated;

commit;
