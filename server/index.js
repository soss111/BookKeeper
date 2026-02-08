/**
 * BookKeeper API – stores user data in Neon Postgres.
 * Set DATABASE_URL in server/.env (Neon connection string from console.neon.tech).
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { neon } from '@neondatabase/serverless';

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '5mb' }));

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.warn('DATABASE_URL not set – API will return 503. Set it in .env or environment.');
}

const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

async function ensureTables() {
  if (!sql) return;
  await sql`
    CREATE TABLE IF NOT EXISTS bookkeeper_data (
      user_id TEXT PRIMARY KEY,
      data JSONB NOT NULL DEFAULT '{}',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS sales_invoices (
      user_id TEXT NOT NULL,
      id TEXT NOT NULL,
      data JSONB NOT NULL DEFAULT '{}',
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (user_id, id)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS purchase_invoices (
      user_id TEXT NOT NULL,
      id TEXT NOT NULL,
      data JSONB NOT NULL DEFAULT '{}',
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (user_id, id)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS clients (
      user_id TEXT NOT NULL,
      id TEXT NOT NULL,
      data JSONB NOT NULL DEFAULT '{}',
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (user_id, id)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS company_profile (
      user_id TEXT PRIMARY KEY,
      data JSONB NOT NULL DEFAULT '{}',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

// GET /api/health – test DB connection (optional)
app.get('/api/health', async (req, res) => {
  if (!sql) {
    return res.status(503).json({ ok: false, error: 'DATABASE_URL not set' });
  }
  try {
    await sql`SELECT 1`;
    res.json({ ok: true, database: 'connected' });
  } catch (err) {
    console.error('Health check:', err);
    res.status(503).json({ ok: false, error: err.message || 'Database error' });
  }
});

// GET /api/data?userId=email@example.com
app.get('/api/data', async (req, res) => {
  const userId = (req.query.userId || '').trim();
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }
  if (!sql) {
    return res.status(503).json({ error: 'Database not configured' });
  }
  try {
    await ensureTables();
    const [salesRows, purchaseRows, clientRows, profileRows] = await Promise.all([
      sql`SELECT data FROM sales_invoices WHERE user_id = ${userId} ORDER BY (data->>'createdAt') DESC NULLS LAST`,
      sql`SELECT data FROM purchase_invoices WHERE user_id = ${userId} ORDER BY (data->>'createdAt') DESC NULLS LAST`,
      sql`SELECT data FROM clients WHERE user_id = ${userId} ORDER BY (data->>'name') ASC NULLS LAST`,
      sql`SELECT data FROM company_profile WHERE user_id = ${userId}`
    ]);
    const hasNewTables = salesRows.length > 0 || purchaseRows.length > 0 || clientRows.length > 0 || profileRows.length > 0;
    if (hasNewTables) {
      return res.json({
        invoices: salesRows.map(r => r.data),
        purchaseInvoices: purchaseRows.map(r => r.data),
        clients: clientRows.map(r => r.data),
        companyProfile: (profileRows[0]?.data) ?? {}
      });
    }
    const legacy = await sql`SELECT data FROM bookkeeper_data WHERE user_id = ${userId}`;
    const data = legacy[0]?.data ?? {};
    res.json({
      invoices: data.invoices ?? [],
      purchaseInvoices: data.purchaseInvoices ?? [],
      clients: data.clients ?? [],
      companyProfile: data.companyProfile ?? {}
    });
  } catch (err) {
    console.error('GET /api/data', err);
    res.status(500).json({ error: err.message || 'Database error' });
  }
});

// POST /api/data – body: { userId, invoices?, purchaseInvoices?, clients?, companyProfile? }
app.post('/api/data', async (req, res) => {
  const userId = (req.body?.userId || '').trim();
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }
  if (!sql) {
    return res.status(503).json({ error: 'Database not configured' });
  }
  try {
    await ensureTables();
    const invoices = req.body.invoices ?? [];
    const purchaseInvoices = req.body.purchaseInvoices ?? [];
    const clients = req.body.clients ?? [];
    const companyProfile = req.body.companyProfile ?? {};
    await sql`DELETE FROM sales_invoices WHERE user_id = ${userId}`;
    await sql`DELETE FROM purchase_invoices WHERE user_id = ${userId}`;
    await sql`DELETE FROM clients WHERE user_id = ${userId}`;
    for (const inv of invoices) {
      const id = inv.id || String(inv.number || Date.now());
      await sql`
        INSERT INTO sales_invoices (user_id, id, data, updated_at)
        VALUES (${userId}, ${id}, ${JSON.stringify(inv)}::jsonb, NOW())
        ON CONFLICT (user_id, id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
      `;
    }
    for (const inv of purchaseInvoices) {
      const id = inv.id || String(inv.number || Date.now());
      await sql`
        INSERT INTO purchase_invoices (user_id, id, data, updated_at)
        VALUES (${userId}, ${id}, ${JSON.stringify(inv)}::jsonb, NOW())
        ON CONFLICT (user_id, id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
      `;
    }
    for (const c of clients) {
      const id = c.id || String(Date.now());
      await sql`
        INSERT INTO clients (user_id, id, data, updated_at)
        VALUES (${userId}, ${id}, ${JSON.stringify(c)}::jsonb, NOW())
        ON CONFLICT (user_id, id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
      `;
    }
    await sql`
      INSERT INTO company_profile (user_id, data, updated_at)
      VALUES (${userId}, ${JSON.stringify(companyProfile)}::jsonb, NOW())
      ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
    `;
    const payload = { invoices, purchaseInvoices, clients, companyProfile };
    await sql`
      INSERT INTO bookkeeper_data (user_id, data, updated_at)
      VALUES (${userId}, ${JSON.stringify(payload)}::jsonb, NOW())
      ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
    `;
    res.json({ ok: true });
  } catch (err) {
    console.error('POST /api/data', err);
    res.status(500).json({ error: err.message || 'Database error' });
  }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`BookKeeper API on http://localhost:${PORT}`);
  if (!DATABASE_URL) console.log('Set DATABASE_URL to connect to Neon.');
});
