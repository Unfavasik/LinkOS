-- LinkOS strict RLS hardening.
-- Applied to project clmjnwlicqqyyzqgmooy.
-- FORCE RLS ensures table owners are also subject to RLS policies.

begin;

alter table public.profiles force row level security;
alter table public.templates force row level security;
alter table public.products force row level security;
alter table public.links force row level security;
alter table public.analytics_events force row level security;
alter table public.customers force row level security;
alter table public.orders force row level security;
alter table public.queue_entries force row level security;
alter table public.admins force row level security;
alter table public.admin_invites force row level security;
alter table public.user_profiles force row level security;
alter table public.support_tickets force row level security;
alter table public.feedback force row level security;
alter table public.websites force row level security;
alter table public.website_revisions force row level security;
alter table public.website_products force row level security;
alter table public.website_messages force row level security;
alter table public.website_bookings force row level security;
alter table public.website_reviews force row level security;
alter table public.website_domains force row level security;
alter table public.website_analytics_events force row level security;
alter table public.website_payments force row level security;

commit;
