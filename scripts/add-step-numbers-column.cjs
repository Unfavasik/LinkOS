/* One-off: add show_step_numbers column to the guides table.
   Direct db.*.supabase.co is IPv6-only and unreachable from the sandbox,
   so connect through the regional IPv4 pooler instead. */
const { Client } = require('pg');

const REF = process.env.SUPABASE_DB_REF || 'clmjnwlicqqyyzqgmooy';
const REGIONS = ['ap-south-1', 'us-east-1', 'us-east-2', 'eu-west-1', 'eu-central-1', 'ap-southeast-1', 'ap-northeast-1', 'sa-east-1', 'us-west-1'];
const password = process.env.SUPABASE_DB_PASSWORD;

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
    const { rows: tables } = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;",
    );
    console.log(`[v0] ${host}: tables: ${tables.map((t) => t.table_name).join(', ') || '(none)'}`);
    const hasGuides = tables.some((t) => t.table_name === 'guides');
    if (hasGuides) {
      await client.query(
        'ALTER TABLE guides ADD COLUMN IF NOT EXISTS show_step_numbers boolean NOT NULL DEFAULT true;',
      );
      const { rows } = await client.query(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'guides' AND column_name = 'show_step_numbers';",
      );
      console.log(`[v0] guides.show_step_numbers present: ${rows.length > 0}`);
    }
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
      console.log('[v0] done via', host);
      return;
    } catch (err) {
      console.log(`[v0] ${host}: ${err.message}`);
    }
  }
  console.error('[v0] failed on all pooler regions');
  process.exit(1);
})();
