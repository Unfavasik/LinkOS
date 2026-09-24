/* One-off: create the websites table for multi-website support.
   Direct db.*.supabase.co is IPv6-only and unreachable from the sandbox,
   so connect through the regional IPv4 pooler instead. */
const { Client } = require('pg');

const REF = process.env.SUPABASE_DB_REF || 'gbhtrermfcoeunjqykbg';
const REGIONS = ['ap-south-1', 'us-east-1', 'us-east-2', 'eu-west-1', 'eu-central-1', 'ap-southeast-1', 'ap-northeast-1', 'sa-east-1', 'us-west-1'];
const password = process.env.SUPABASE_DB_PASSWORD;

const DDL = `
CREATE TABLE IF NOT EXISTS public.websites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id text NOT NULL DEFAULT '',
  name text NOT NULL DEFAULT 'My Website',
  slug text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','live')),
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS websites_owner_idx ON public.websites (owner_id);
CREATE INDEX IF NOT EXISTS websites_slug_idx ON public.websites (slug);

ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "websites_owner_select" ON public.websites;
CREATE POLICY "websites_owner_select" ON public.websites
  FOR SELECT TO authenticated USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "websites_owner_insert" ON public.websites;
CREATE POLICY "websites_owner_insert" ON public.websites
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "websites_owner_update" ON public.websites;
CREATE POLICY "websites_owner_update" ON public.websites
  FOR UPDATE TO authenticated USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "websites_owner_delete" ON public.websites;
CREATE POLICY "websites_owner_delete" ON public.websites
  FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- Public read for published sites (anon visitors via /site/:slug)
DROP POLICY IF EXISTS "websites_public_read_live" ON public.websites;
CREATE POLICY "websites_public_read_live" ON public.websites
  FOR SELECT TO anon USING (status = 'live');

GRANT SELECT, INSERT, UPDATE, DELETE ON public.websites TO authenticated;
GRANT SELECT ON public.websites TO anon;
`;

async function runOn(host) {
  const client = new Client({
    host,
    port: 5432,
    user: `postgres.${REF}`,
    password,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  });
  try {
    await client.connect();
    await client.query(DDL);
    const { rows } = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'websites' AND table_schema = 'public';",
    );
    console.log(`[v0] ${host}: websites columns: ${rows.map((r) => r.column_name).join(', ')}`);
    return true;
  } finally {
    await client.end().catch(() => {});
  }
}

(async () => {
  for (const region of REGIONS) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    try {
      await runOn(host);
      console.log('[v0] migration done via', host);
      return;
    } catch (err) {
      console.log(`[v0] ${host}: ${err.message}`);
    }
  }
  console.error('[v0] migration failed on all pooler regions');
  process.exit(1);
})();
