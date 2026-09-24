import pg from 'pg';

const { Client } = pg;

const ref = process.env.SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');
const password = process.env.SUPABASE_DB_PASSWORD;
const regions = [
  'ap-south-1', 'us-east-1', 'us-west-1', 'ap-southeast-1', 'ap-northeast-1',
  'eu-west-1', 'eu-central-1', 'ap-south-2', 'eu-west-2', 'sa-east-1',
];

const sql = `
create table if not exists saved_templates (
  id text primary key,
  user_id text not null,
  user_name text not null default '',
  template_id text not null,
  template_name text not null default '',
  created_at timestamptz not null default now()
);
alter table saved_templates enable row level security;
drop policy if exists "Users can read own saved templates" on saved_templates;
create policy "Users can read own saved templates" on saved_templates for select using (auth.uid()::text = user_id);
drop policy if exists "Users can insert own saved templates" on saved_templates;
create policy "Users can insert own saved templates" on saved_templates for insert with check (auth.uid()::text = user_id);
drop policy if exists "Users can delete own saved templates" on saved_templates;
create policy "Users can delete own saved templates" on saved_templates for delete using (auth.uid()::text = user_id);
create index if not exists saved_templates_user_idx on saved_templates (user_id, created_at desc);
`;

for (const region of regions) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  const client = new Client({
    connectionString: `postgresql://postgres.${ref}:${encodeURIComponent(password)}@${host}:6543/postgres`,
    connectionTimeoutMillis: 8000,
  });
  try {
    await client.connect();
    await client.query(sql);
    console.log('OK via', host);
    await client.end();
    process.exit(0);
  } catch (e) {
    try { await client.end(); } catch {}
    console.log('fail:', host, '-', e.message.slice(0, 80));
  }
}
console.log('ALL REGIONS FAILED');
process.exit(1);
