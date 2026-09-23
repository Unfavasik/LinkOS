# LinkOS + Needle integration

LinkOS now includes an optional Python/FastAPI service for natural-language profile and product management. The browser sends a Supabase Auth access token to the service; the service validates that token with Supabase Auth, resolves the user's profile from `auth.users`, and performs only user-scoped writes with a backend-only service-role key.

## Components

The backend lives in `server/main.py` and exposes `GET /health` and `POST /v1/needle/run`. The frontend helper is `src/lib/needleApi.ts`; it reads the current Supabase session and never receives or imports the service-role key. The database migration `supabase/migrations/20260922_needle_profile_fields.sql` adds `profiles.social_links`, `profiles.whatsapp_enabled`, and server-side timestamp triggers.

Needle tools currently include `get_profile`, `update_profile`, `update_social_links`, `toggle_whatsapp`, `select_template`, `set_profile_image`, `create_product`, `update_product`, `delete_product`, `add_link`, and `delete_link`. Product, link, template, and image operations always resolve the authenticated user's profile on the server; the client cannot choose another user's `profile_id`.

The dashboard exposes these actions in `/dashboard/assistant` as **Needle Assistant**. Users can type a natural-language request or choose a quick action. Users can now attach a JPG, PNG, WEBP, GIF, or BMP image and say **“set avatar”** or **“set logo”**. The backend validates the authenticated user, converts the image to WebP with Pillow, uploads it to the public `logos` bucket under that user's folder, and updates only that user's `avatar_url` or `logo_url`. Maximum upload size is 5MB.

## Backend setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r server/requirements.txt
```

Set these variables only in the backend process:

```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_ONLY_SERVICE_ROLE_KEY
FRONTEND_ORIGINS=http://localhost:3000
NEEDLE_TELEMETRY=0
DO_NOT_TRACK=1
```

Run the service with:

```bash
source .venv/bin/activate
uvicorn server.main:app --host 0.0.0.0 --port 8000
```

The frontend uses only these browser-safe variables:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
VITE_NEEDLE_API_URL=http://localhost:8000
```

Apply the SQL migration in Supabase before using profile fields or Needle product tools. The existing LinkOS frontend login/signup flow must create a real Supabase Auth session; the backend intentionally rejects local/demo sessions and unsigned requests.

## API example

```ts
import { runNeedle } from './src/lib/needleApi';

const result = await runNeedle('add a product called Masala Tea for 80 rupees');
```

The service returns Needle's structured response, including `function_calls`, `reasoning`, `confidence`, and any tool result. Requests that do not match a declared tool are not executed. Image attachments use `POST /v1/needle/run-with-image` with multipart fields `prompt` and `image`; ordinary text requests use `POST /v1/needle/run`.

## Security checklist

The Vite config exposes only the `VITE_` prefix. Never set `SUPABASE_SERVICE_ROLE_KEY` or any other server secret with a `VITE_` prefix. Keep the backend behind HTTPS in production, set `FRONTEND_ORIGINS` to the exact deployed origin, rotate a leaked service-role key immediately, and keep the Supabase Auth leaked-password protection enabled in the project dashboard.
