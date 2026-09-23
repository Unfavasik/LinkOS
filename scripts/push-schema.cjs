// One-off script: pushes supabase/schema.sql to the new Supabase project,
// statement by statement so failures identify the exact statement.
const { Client } = require('pg');
const fs = require('fs');

const REGION = 'ap-northeast-1';

function splitStatements(sql) {
  const stmts = [];
  let cur = '';
  let inDollar = false;
  const lines = sql.split('\n');
  for (const line of lines) {
    if (/^\s*--/.test(line)) continue;
    cur += line + '\n';
    if (line.includes('$$')) inDollar = !inDollar;
    if (!inDollar && line.trim().endsWith(';')) {
      if (cur.trim()) stmts.push(cur.trim());
      cur = '';
    }
  }
  if (cur.trim()) stmts.push(cur.trim());
  return stmts;
}

(async () => {
  const ref = process.env.SUPABASE_URL_2.replace('https://', '').replace('.supabase.co', '');
  const client = new Client({
    host: `aws-0-${REGION}.pooler.supabase.com`,
    port: 6543,
    user: `postgres.${ref}`,
    password: process.env.SUPABASE_DB_PASSWORD,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });
  await client.connect();
  console.log('[v0] connected');

  // Wipe any pre-existing objects in public (user asked for a clean slate),
  // then restore Supabase's default grants on the schema.
  console.log('[v0] dropping existing public schema...');
  await client.query('drop schema public cascade;');
  await client.query('create schema public;');
  await client.query("grant usage on schema public to anon, authenticated, service_role;");
  await client.query("alter default privileges in schema public grant all on tables to anon, authenticated, service_role;");
  await client.query("alter default privileges in schema public grant all on functions to anon, authenticated, service_role;");
  console.log('[v0] public schema reset');

  const sql = fs.readFileSync('supabase/schema.sql', 'utf8');
  const stmts = splitStatements(sql);
  console.log(`[v0] ${stmts.length} statements`);
  for (let i = 0; i < stmts.length; i++) {
    const s = stmts[i];
    const label = s.split('\n')[0].slice(0, 70);
    try {
      await client.query(s);
      console.log(`[v0] ok  #${i}: ${label}`);
    } catch (e) {
      console.log(`[v0] ERR #${i}: ${label}`);
      console.log(`[v0]   -> ${e.message}`);
      console.log('[v0]   full statement:');
      console.log(s.slice(0, 800));
      break;
    }
  }
  await client.end();
})();
