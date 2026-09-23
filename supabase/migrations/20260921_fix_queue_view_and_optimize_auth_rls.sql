-- LinkOS Supabase security hardening
-- Applied to project clmjnwlicqqyyzqgmooy.

begin;

-- Prevent the queue view from bypassing caller RLS policies.
alter view public.queue_status set (security_invoker = true);
alter view public.queue_status set (security_barrier = true);

-- Public queue status is limited to published, non-suspended profiles.
drop policy if exists queue_public_read on public.queue_entries;
create policy queue_public_read
  on public.queue_entries for select to anon, authenticated
  using (public.profile_is_public(profile_id));

-- Use init-plan-friendly auth checks for website ownership policies.
drop policy if exists websites_owner_all on public.websites;
create policy websites_owner_all on public.websites for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

drop policy if exists website_revisions_owner_all on public.website_revisions;
create policy website_revisions_owner_all on public.website_revisions for all to authenticated
  using (exists (select 1 from public.websites w where w.id = website_id and w.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.websites w where w.id = website_id and w.owner_id = (select auth.uid()) and created_by = (select auth.uid())));

drop policy if exists website_products_owner_all on public.website_products;
create policy website_products_owner_all on public.website_products for all to authenticated
  using (exists (select 1 from public.websites w where w.id = website_id and w.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.websites w where w.id = website_id and w.owner_id = (select auth.uid())));

drop policy if exists website_messages_owner_all on public.website_messages;
create policy website_messages_owner_all on public.website_messages for all to authenticated
  using (exists (select 1 from public.websites w where w.id = website_id and w.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.websites w where w.id = website_id and w.owner_id = (select auth.uid())));

drop policy if exists website_bookings_owner_all on public.website_bookings;
create policy website_bookings_owner_all on public.website_bookings for all to authenticated
  using (exists (select 1 from public.websites w where w.id = website_id and w.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.websites w where w.id = website_id and w.owner_id = (select auth.uid())));

drop policy if exists website_reviews_owner_all on public.website_reviews;
create policy website_reviews_owner_all on public.website_reviews for all to authenticated
  using (exists (select 1 from public.websites w where w.id = website_id and w.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.websites w where w.id = website_id and w.owner_id = (select auth.uid())));

drop policy if exists website_domains_owner_all on public.website_domains;
create policy website_domains_owner_all on public.website_domains for all to authenticated
  using (exists (select 1 from public.websites w where w.id = website_id and w.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.websites w where w.id = website_id and w.owner_id = (select auth.uid())));

drop policy if exists website_analytics_owner_read on public.website_analytics_events;
create policy website_analytics_owner_read on public.website_analytics_events for select to authenticated
  using (exists (select 1 from public.websites w where w.id = website_id and w.owner_id = (select auth.uid())));

drop policy if exists website_payments_owner_all on public.website_payments;
create policy website_payments_owner_all on public.website_payments for all to authenticated
  using (owner_id = (select auth.uid()) and exists (select 1 from public.websites w where w.id = website_id and w.owner_id = (select auth.uid())))
  with check (owner_id = (select auth.uid()) and exists (select 1 from public.websites w where w.id = website_id and w.owner_id = (select auth.uid())));

commit;
