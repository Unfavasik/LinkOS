import pg from 'pg';

const { SUPABASE_DB_PASSWORD } = process.env;
const host = 'db.gbhtrermfcoeunjqykbg.supabase.co';

const client = new pg.Client({
  host,
  port: 5432,
  user: 'postgres',
  password: SUPABASE_DB_PASSWORD,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

await client.connect();

const before = await client.query(
  `SELECT column_name, data_type FROM information_schema.columns
   WHERE table_name = 'websites' AND column_name IN ('id', 'owner_id', 'slug')
   ORDER BY column_name`,
);
console.log('[v0] websites columns before:', before.rows);

// The app identifies users by the local active-user id, which is a text id
// (auth uids for real users, "user_*" ids for demo sessions). owner_id must
// accept both, so it has to be text — same as profiles.user_id.
const prof = await client.query(
  `SELECT data_type FROM information_schema.columns
   WHERE table_name = 'profiles' AND column_name = 'user_id'`,
);
console.log('[v0] profiles.user_id type:', prof.rows[0]?.data_type);

if (before.rows.find((r) => r.column_name === 'owner_id' && r.data_type === 'uuid')) {
  await client.query('ALTER TABLE websites ALTER COLUMN owner_id TYPE text USING owner_id::text');
  console.log('[v0] altered websites.owner_id to text');
} else {
  console.log('[v0] websites.owner_id already text or missing');
}

const after = await client.query(
  `SELECT column_name, data_type FROM information_schema.columns
   WHERE table_name = 'websites' AND column_name IN ('id', 'owner_id', 'slug')
   ORDER BY column_name`,
);
console.log('[v0] websites columns after:', after.rows);

await client.end();
