# LinkOS — Supabase Setup Rules (সম্পূর্ণ গাইড)

এই ফাইলে LinkOS প্রজেক্টের Supabase সেটআপের **সব নিয়ম, টেবিল, আর করণীয়** লেখা আছে।
নতুন কেউ সেটআপ করলে বা কিছু কাজ না করলে এই ফাইল ফলো করুন।

---

## ১. কাঠামো (Architecture) — কীভাবে অ্যাপ Supabase ব্যবহার করে

- LinkOS হলো একটা **React + Vite SPA** (Next.js নয়) — ব্রাউজার থেকে সরাসরি `@supabase/supabase-js` দিয়ে Supabase-এ যায়।
- অ্যাপ **anon (publishable) key** ব্যবহার করে — ব্রাউজারের লগইন সেশন Supabase Auth-এ তৈরি হয় না।
  ইউজার/অ্যাডমিন চেনা হয় অ্যাপের নিজস্ব পদ্ধতিতে (localStorage + `admins` টেবিল চেক)।
- যেহেতু Supabase Auth সেশন নেই, তাই **RLS (Row Level Security) চালু থাকলে anon key দিয়ে লেখা (INSERT/UPDATE/DELETE) নীরবে ব্যর্থ হয়** — কোনো এররও দেখায় না, শুধু ০টা রো আপডেট হয়। এটাই আগে অ্যাডমিন সেভ কাজ না করার কারণ ছিল।

> **মূল নিয়ম:** এই অ্যাপের সব টেবিলে **RLS বন্ধ (DISABLE)** রাখতে হবে, নাহলে অ্যাডমিন প্যানেল ও ইউজার ডেটা সেভ হবে না।

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

### বর্তমান অবস্থা (যাচাই করা)
- **সব ১০টি টেবিলেই RLS চালু ❌** — anon কী দিয়ে যেকোনো টেবিল পড়তে গেলে `42501 permission denied` আসে।
- ফলে গ্যালারি, অ্যাডমিন প্যানেল, অর্ডার — সব ডেটাবেস-নির্ভর ফিচার ব্যর্থ হচ্ছে।

### GRANT আর RLS — গুলিয়ে ফেলবেন না
- Dashboard-এ টেবিলের **Privileges/GRANT**-এ `SELECT` anon-এর জন্য দেখালেও সেটা যথেষ্ট নয়।
- **RLS (Row Level Security) চালু থাকলে GRANT থাকলেও প্রতিটি কোয়েরি ব্লক হয়** — কারণ RLS চালু মানে "প্রতিটি রো-এর জন্য পলিসি মানতে হবে", আর পলিসি না থাকলে কোনো রো-ই দেখা যায় না।
- তাই সমাধান GRANT দেওয়া নয় — **RLS বন্ধ করা** (নিচের SQL)।

### করণীয় — Supabase Dashboard → SQL Editor-এ চালান:

```sql
-- সব টেবিলের RLS বন্ধ করুন (এই অ্যাপের জন্য প্রয়োজন)
ALTER TABLE templates        DISABLE ROW LEVEL SECURITY;
ALTER TABLE admins           DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_invites    DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles         DISABLE ROW LEVEL SECURITY;
ALTER TABLE products         DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders           DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers        DISABLE ROW LEVEL SECURITY;
ALTER TABLE links            DISABLE ROW LEVEL SECURITY;
ALTER TABLE queue_entries    DISABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events DISABLE ROW LEVEL SECURITY;
```

### চালানোর পর মিলিয়ে দেখুন (SQL Editor-এ):

```sql
SELECT relname, relrowsecurity AS rls_on
FROM pg_class
WHERE relname IN ('templates','admins','admin_invites','profiles','products',
                  'orders','customers','links','queue_entries','analytics_events')
ORDER BY relname;
```

> সব সারিতে `rls_on = false` দেখালেই ঠিক আছে। কোনো সারিতে `true` থাকলে ওই টেবিলের উপরের `ALTER TABLE ... DISABLE` আবার চালান।

> **নিরাপত্তা নোট:** RLS বন্ধ মানে anon key যার কাছে আছে সে সব ডেটা পড়তে/লিখতে পারবে।
> এই অ্যাপ ইচ্ছাকৃতভাবে এই কাঠামোতে চলে (নিজস্ব লগইন, Supabase Auth নেই)।
> ভবিষ্যতে Supabase Auth + RLS পলিসিতে যেতে চাইলে আলাদা মাইগ্রেশন লাগবে।

### যাচাই কীভাবে বুঝবেন RLS সমস্যা
- অ্যাডমিন প্যানেলে Save দিলে "Saved" দেখায় কিন্তু রিফ্রেশ করলে পুরনো ডেটা ফেরা = RLS চালু।
- টেস্ট: SQL Editor-এ `SELECT * FROM templates;` দিয়ে দেখুন `updated_at` বদলাচ্ছে কিনা।

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

- `admins` টেবিলে ইমেইল থাকতে হবে এবং `is_active = true` হতে হবে (`src/lib/adminAuth.ts` যাচাই করে)।
- বর্তমান অ্যাডমিন: `hello.devasik@gmail.com`
- নতুন অ্যাডমিন যোগ করতে: অ্যাডমিন প্যানেল → People → Admins, অথবা সরাসরি:
  ```sql
  INSERT INTO admins (email, role, is_active) VALUES ('email@example.com', 'admin', true);
  ```

---

## ৮. নতুন প্রজেক্টে পুরো সেটআপ চেকলিস্ট (ক্রম অনুযায়ী)

1. ☐ Supabase প্রজেক্ট তৈরি
2. ☐ Vercel-এ Supabase ইন্টিগ্রেশন কানেক্ট (env vars অটো আসবে)
3. ☐ ১০টি টেবিল তৈরি (উপরের স্কিমা অনুযায়ী)
4. ☐ **সব টেবিলে RLS বন্ধ** (৪ নম্বর সেকশনের SQL)
5. ☐ `templates`-এ শুধু ৩টি রো সিড করা (৫ নম্বর সেকশন)
6. ☐ `admins`-এ অ্যাডমিন ইমেইল যোগ (৭ নম্বর সেকশন)
7. ☐ অ্যাডমিন প্যানেলে লগইন → Templates → Edit → Save → রিফ্রেশ করে সেভ হচ্ছে কিনা যাচাই
8. ☐ ইউজার প্রিভিউতে অ্যাডমিনের এডিট দেখা যাচ্ছে কিনা যাচাই

---

*সর্বশেষ আপডেট: ২০ সেপ্টেম্বর ২০২৬ — টেমপ্লেট ৩টিতে সীমাবদ্ধ, badge + Pro paywall যোগ হওয়ার পর।*
