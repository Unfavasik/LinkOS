# LinkOS — Supabase Setup Rules (সম্পূর্ণ গাইড)

এই ফাইলে LinkOS প্রজেক্টের Supabase সেটআপের **সব নিয়ম, টেবিল, আর করণীয়** লেখা আছে।
নতুন কেউ সেটআপ করলে বা কিছু কাজ না করলে এই ফাইল ফলো করুন।

---

## ১. কাঠামো (Architecture) — কীভাবে অ্যাপ Supabase ব্যবহার করে

- LinkOS হলো React + Vite SPA; browser app `@supabase/supabase-js` দিয়ে Supabase Auth ও database-এ যায়।
- ব্যবহারকারীর পরিচয় verified Supabase session থেকে আসে; admin/support/owner capability `admins` টেবিলের সক্রিয় role থেকে যাচাই হয়। localStorage বা profile-এর `role` authorization নয়।
- **RLS সব public application table-এ চালু রাখতে হবে।** anon/publishable key public; তা কখনো private table access-এর বিকল্প নয়। access নির্ধারণ করে table grants ও RLS policies।
- Service-role/secret key browser bundle-এ দেওয়া যাবে না।

> **মূল নিয়ম:** কোনো troubleshooting-এর জন্য RLS বন্ধ করবেন না। সমস্যা হলে Supabase logs, session, grants এবং policy predicates যাচাই করুন।

---

## ২. Environment Variables (প্রজেক্টে আগে থেকেই সেট করা)

| Variable | কাজ |
|---|---|
| `SUPABASE_URL` | প্রজেক্টের REST API ঠিকানা |
| `SUPABASE_PUBLISHABLE_KEY` | ব্রাউজার (anon) কী — অ্যাপ এটা দিয়ে চলে |
| `SUPABASE_SECRET_KEY` | সার্ভিস কী — শুধু স্ক্রিপ্ট/টেস্টে, কখনো ব্রাউজারে নয় |
| `SUPABASE_JWKS_URL` | JWT ভেরিফিকেশন (ভবিষ্যতের জন্য) |
| `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` | ডেভ রিডাইরেক্ট |

এগুলো Vercel ইন্টিগ্রেশন থেকে অটো ইনজেক্ট হয় — **আলাদা করে যোগ করতে হয় না।**

---

## ৩. ব্যবহৃত টেবিল (১০টি) এবং প্রতিটির কাজ

| টেবিল | কাজ | কে লেখে |
|---|---|---|
| `templates` | টেমপ্লেট ক্যাটালগ — নাম, বর্ণনা, কভার, অ্যাভাটার, badge, Pro ফ্ল্যাগ | অ্যাডমিন প্যানেল |
| `admins` | কোন ইমেইল অ্যাডমিন (`is_active = true`) | অ্যাডমিন প্যানেল |
| `admin_invites` | নতুন অ্যাডমিন ইনভাইট | অ্যাডমিন প্যানেল |
| `profiles` | **প্রতিটি ইউজারের পুরো সাইট ডেটা** — নাম, লোগো, কভার, সার্ভিস, রঙ, টেমপ্লেট, প্ল্যান, publish স্টেট | ইউজার (Use this Template / এডিটর) |
| `products` | ইউজারের প্রোডাক্ট/মেনু আইটেম | ইউজার |
| `orders` | অর্ডার | ইউজার |
| `customers` | কাস্টমার লিস্ট | ইউজার |
| `links` | ইউজারের লিংক | ইউজার |
| `queue_entries` | কিউ সিস্টেমের এন্ট্রি | ইউজার |
| `analytics_events` | ভিজিট/ক্লিক ট্র্যাকিং | অ্যাপ অটো |

---

## ৪. RLS নিয়ম — সবচেয়ে গুরুত্বপূর্ণ ধাপ

### Production security state

- 2026-09-26-এ LinkOS-এর ১৯টি public application table-এ RLS enable করা হয়েছে।
- Anonymous visitor কেবল প্রকাশিত business content পড়তে পারে এবং সীমিত public workflows—analytics, order, queue, feedback, guest support-ticket—submit করতে পারে। private data সরাসরি পড়তে পারে না।
- Signed-in user নিজের profile ও ব্যবসার data-তে সীমাবদ্ধ। Admin/support/owner access `admins` টেবিলের active role অনুযায়ী আলাদা।
- `storage.objects`-এ পুরোনো unrestricted `allow all object access` policy সরিয়ে public logo/product read ও user-UUID-folder scoped write বসানো হয়েছে।

### নতুন/পরিবর্তিত database install

Migration files-ই authoritative; Supabase Dashboard-এ গিয়ে RLS disable করার কোনো manual SQL চালাবেন না। Existing project-এ `supabase/migrations/20260925_linkos_least_privilege_rls.sql` apply হয়েছে। Fresh setup-এ project-এর documented Supabase migration workflow দিয়ে migrations apply করুন এবং `README`/release notes-এর sequence অনুসরণ করুন।

### GRANT ও RLS একসাথে

- GRANT privilege শুধু operation চালানোর সামর্থ্য দেয়; RLS প্রতিটি row-তে অনুমতি যাচাই করে। দুইটিই মিলতে হবে।
- RLS বন্ধ করা **সমাধান নয়**—anon key দিয়ে private row leak বা overwrite হতে পারে।
- RLS failure হলে `auth.uid()`, session email, table grants, column grants, policy predicates এবং Supabase logs যাচাই করুন। Admin role app cache/email allowlist দিয়ে সেট করবেন না।

### যাচাই

```sql
select c.relname as table_name,
       c.relrowsecurity as rls_enabled,
       c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
  and c.relname = any(array[
    'profiles','user_profiles','products','links','analytics_events','customers',
    'orders','queue_entries','admins','admin_invites','support_tickets','feedback',
    'templates','guides','announcements','websites','user_notifications',
    'needle_chats','saved_templates'
  ])
order by c.relname;
```

১৯টি application table-এই `rls_enabled = true` প্রত্যাশিত। Policy/grant audit ছাড়া কোনো table-এ RLS disable করবেন না।

---

## ৫. `templates` টেবিল — স্কিমা ও নিয়ম

### কলাম
`id, name, category, description, tags (jsonb array), theme, accent_color, button_style, font_family, layout, popularity, is_pro, industry_id, queue_type, queue_label, services, preview_url, cover_url, is_active, created_at, updated_at`

### নিয়ম
1. **শুধু ৩টি টেমপ্লেট থাকবে** — অন্য কোনো রো যোগ করবেন না:

| id | নাম | ক্যাটাগরি |
|---|---|---|
| `cafe-pro` | Urban Brew Café | Food & Cafe |
| `autocare-pro` | AutoCare Service Centre | Services |
| `godi-royal` | Rofik Godi Centre | Retail |

2. **`id` কোডের টেমপ্লেট id-র সাথে মিলতে হবে** (`src/data/templates.ts`) — না মিললে প্রিভিউতে অ্যাডমিনের এডিট দেখাবে না।
3. **`tags` কলাম দুই কাজ করে:**
   - Badge tag: `Bestseller` / `New` / `Pro` / `Hot` — গ্যালারি কার্ডে রঙিন ব্যাজ
   - সার্চ ট্যাগ: `cafe`, `car seat covers` ইত্যাদি
   - অ্যাডমিন এডিটর badge বদলালে সার্চ ট্যাগ অক্ষত থাকে — হাতে এডিট করলে দুটোই একসাথে রাখুন।
4. **`Pro` badge ��া `is_pro = true`** মানে free ইউজারকে প্রিমিয়াম কিনতে হবে (paywall)।
5. **`is_active = false`** করলে টেমপ্লেট গ্যালারি থেকে হাইড হয়ে যায়।
6. **`cover_url`** = কার্ড + প্রিভিউ হিরো ব্যাকগ্রাউন্ড, **`preview_url`** = গোল অ্যাভাটার/লোগো।

### অ্যাডমিন এডিট → ইউজার প্রিভিউ কীভাবে যায়
- অ্যাডমিন প্যানেল (`/admin/templates` → Edit) সেভ করলে `templates` টেবিল আপডেট হয়।
- ইউজারের গ্যালারি/প্রিভিউ পেজ SWR (`template-overrides` কী) দিয়ে টেবিল থেকে ওভাররাইড টেনে লোকাল টেমপ্লেটের উপর মার্জ করে — তাই অ্যাডমিন বদলালে ইউজারের প্রিভিউতে সাথে সাথে নতুন ভার্সন দেখায়।

---

## ৬. `profiles` টেবিল — ইউজারের সাইট (অ্যাডমিন টেমপ্লেট এডিট এটায় ঢোকে না)

- ইউজার "Use this Template" চাপলে টেমপ্লেটের ডেটা **কপি হয়ে** তার `profiles` রো-তে চলে যায় (নিজের নাম, লোগো, রঙসহ)।
- পরে অ্যাডমিন টেমপ্লেট যতই বদলাক, **পাবলিশড ইউজার সাইট কখনো বদলাবে না** — শুধু প্রিভিউ বদলায়। এটা ইচ্ছাকৃত নিয়ম।
- গুরুত্বপূর্ণ কলাম: `user_id` (মালিক), `template_id`, `plan` (free/premium — Pro আনলক), `is_published`, `is_suspended`, `accent_color`, `logo_url`, `cover_url`।

---

## ৭. অ্যাডমিন চেনার নিয়ম

- Admin access কেবল authenticated Supabase session-এর সাথে মেলা `admins` row এবং `is_active = true` থেকে আসে। Roles: `owner`, `admin`, `support`।
- `owner` admin membership/invite পরিচালনা করতে পারে; `admin` operational/catalog/content data পরিচালনা করে; `support` support tickets/feedback-এ সীমিত।
- নিজের `admins.role`, `profiles.role` বা localStorage edit করে privilege পাওয়া যায় না। Browser/email allowlist authorization নয়।
- Admin যোগ করতে app-এর `/admin` → People → Admins invitation flow ব্যবহার করুন; সরাসরি client-side SQL/anon key দিয়ে privilege grant করবেন না।

---

## ৮. নতুন প্রজেক্টে পুরো সেটআপ চেকলিস্ট

1. ☐ Supabase প্রজেক্ট তৈরি ও environment variables সংযুক্ত করুন।
2. ☐ Repository migration workflow দিয়ে সব `supabase/migrations` apply করুন।
3. ☐ `supabase/schema.sql` ও migration sequence-এর সাথে schema মিলিয়ে নিন।
4. ☐ ১৯টি LinkOS public application table-এ RLS enabled আছে নিশ্চিত করুন; **RLS disable করবেন না**।
5. ☐ `templates`-এ প্রত্যাশিত seed rows আছে যাচাই করুন।
6. ☐ Owner account/admin invite-টি authenticated invite flow দিয়ে স্থাপন করুন।
7. ☐ Anonymous, signed-in user, support, admin ও owner role test করুন; private data cross-account দেখা যায় কি না যাচাই করুন।
8. ☐ Public website, checkout/order, queue, feedback, uploads ও dashboard CRUD-এ smoke test চালান।

---

---

*সর্বশেষ আপডেট: ২০ সেপ্টেম্বর ২০২৬ — টেমপ্লেট ৩টিতে সীমাবদ্ধ, badge + Pro paywall যোগ হওয়ার পর।*
