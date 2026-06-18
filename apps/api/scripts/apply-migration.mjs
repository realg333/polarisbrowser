import 'dotenv/config';
import postgres from 'postgres';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationPath = join(__dirname, '../../../supabase/migrations/20250617000000_sprint4_cloud_billing.sql');

const sql = postgres(process.env.DATABASE_URL, { prepare: false, ssl: 'require', max: 1 });

try {
  const query = readFileSync(migrationPath, 'utf8');
  await sql.unsafe(query);
  const tables = await sql`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
  `;
  console.log('Migration OK. Tables:', tables.map((t) => t.tablename).join(', '));
} catch (err) {
  console.error('Migration FAIL:', err.message);
  process.exit(1);
} finally {
  await sql.end();
}
