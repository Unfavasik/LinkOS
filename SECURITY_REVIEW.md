# LinkOS security review and hardening plan

**Review date:** 2026-09-26  
**Supabase project:** `gbhtrermfcoeunjqykbg`  
**Production migration status:** Prepared and syntax-checked; **not applied**.

## Live findings (read-only audit)

- The LinkOS public schema contains 19 application tables. RLS was disabled on 14; five had RLS enabled, but existing policies included broad public reads/writes.
- The `anon` role had direct table privileges across these tables. Where RLS was disabled, those grants allowed anonymous table access; where RLS was enabled, policies still needed review.
- `storage.objects` had one broad `allow all object access` policy (`ALL`, `USING true`, `WITH CHECK true`). The only LinkOS storage buckets found were public `logos` and `products`.
- Live column types were checked before writing policies/triggers: profile/user IDs are text; website owner IDs and support/feedback user IDs are UUIDs.

## Intended access model

| Actor | Intended access |
|---|---|
| Anonymous visitor | Read published public business profiles, their products/links, active templates, published guides/announcements, and live public websites; submit only the site's analytics, order, queue, feedback, and guest-ticket forms. No private reads. |
| Signed-in user | Read/manage their own profile, user profile, products/links, customers, orders, queue entries, websites, saved templates, assistant chats, and notifications. Read their own tickets/feedback; ticket owners can append a user reply but cannot change staff-controlled fields. |
| Support staff | Verified through an active `admins` row; handle support tickets/feedback and access public staff content. No admin membership management or other users' private business records. |
| Admin | Manage LinkOS operational/catalog/content data through active database role checks. |
| Owner | Exclusive admin-account and invitation management. Browser email allowlists/local caches do not grant admin authority. |

## Changes prepared

- A transactional Supabase migration removes legacy policies, enables RLS across the 19 app tables, applies owner/staff/public-only policies, restricts table/default grants, and replaces the broad storage policy with per-user UUID-folder uploads.
- Database triggers protect profile identity/plan/verification/suspension and role fields; prevent admin self-promotion; constrain public order/queue/ticket/feedback writes; and restrict support-staff edits.
- Safe public profile and website read paths mask auth user IDs and strip internal ownership fields. Username/slug availability use boolean-only RPCs.
- Client changes derive admin authority from the authenticated Supabase session, stop trusting `profiles.role` or local cached allowlists, scope media uploads to the signed-in user's UUID folder, and avoid readback of private guest-order rows.

## Validation

- `npm run lint` — passed (TypeScript).
- `npm run build` — passed. Vite reported an existing `__dirname` configuration warning and an existing large-bundle warning.
- PostgreSQL outer migration syntax — accepted by the `pglast` parser. This parses SQL statements but does not execute PL/pgSQL bodies or alter the live database.
- `git diff --check` — passed.

## Deployment gate

This migration changes production data permissions, public storage access, and user/admin access boundaries. The source patch is prepared on a review branch; the migration has **not** been run against Supabase. Deploy the matching application changes, then apply the migration through the normal Supabase migration workflow and verify owner, support, anonymous, and published-content flows. Review the migration before approval; it is intended to be safely re-runnable.
