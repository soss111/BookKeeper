/**
 * Quick test: Neon DB connection.
 * Run: node test-db.js  (from server folder, or: node server/test-db.js from repo root)
 */
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set. Create server/.env with DATABASE_URL=postgresql://...');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

try {
  const result = await sql`SELECT version()`;
  const { version } = result[0];
  console.log('Neon connection OK');
  console.log('PostgreSQL:', version);
} catch (err) {
  console.error('Connection failed:', err.message);
  process.exit(1);
}
