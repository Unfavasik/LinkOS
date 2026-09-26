# LinkOS security review and hardening plan

**Review date:** 2026-09-26  
**Supabase project:** `gbhtrermfcoeunjqykbg`  
**Production migration status:** Applied on 2026-09-26 after explicit approval; post-apply verification completed.

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

## Changes applied

- A transactional Supabase migration removes legacy policies, enables RLS across the 19 app tables, applies owner/staff/public-only policies, restricts table/default grants, and replaces the broad storage policy with per-user UUID-folder uploads.
- Database triggers protect profile identity/plan/verification/suspension and role fields; prevent admin self-promotion; constrain public order/queue/ticket/feedback writes; and restrict support-staff edits.
- Safe public profile and website read paths mask auth user IDs and strip internal ownership fields. Username/slug availability use boolean-only RPCs.
- Client changes derive admin authority from the authenticated Supabase session, stop trusting `profiles.role` or local cached allowlists, scope media uploads to the signed-in user's UUID folder, and avoid readback of private guest-order rows.

## Validation

- `npm run lint` — passed (TypeScript).
- `npm run build` — passed. Vite reported an existing `__dirname` configuration warning and an existing large-bundle warning.
- PostgreSQL migration syntax — accepted by the `pglast` parser; Supabase applied the migration successfully. Live post-check found all 19 tables with RLS enabled, zero sensitive direct anon SELECT grants, zero old broad storage policy, five LinkOS storage policies, and both public views present.
- Supabase security advisor initially flagged direct client execution on SECURITY DEFINER functions. The follow-up migration revoked trigger-only/internal RPC execution; live check now reports zero callable trigger functions, zero anon access to internal helpers, and the intentional two anon boolean RPCs. Advisor still reports the two SECURITY DEFINER public views (the safe projection needed for public access), authenticated policy helpers, the boolean-only username/public-profile RPCs, and disabled leaked-password protection. Leaked-password protection is a separate Auth setting and was not changed.
- `git diff --check` — passed.

## Deployment gate

Both approved migrations are live. The user explicitly chose to proceed without deploying the app; accordingly, public website routes using the older direct-table client query may fail until the merged app is deployed. Public views remain definer-secured with a reviewed field projection to preserve public pages while hiding auth user IDs and owner UUIDs. The Vercel connector was not enabled.
