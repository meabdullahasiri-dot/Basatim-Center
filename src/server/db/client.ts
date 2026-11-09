import 'server-only';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { withRequiredTls } from './url';

export type Database = NodePgDatabase<typeof schema>;
export type Tx = Parameters<Parameters<Database['transaction']>[0]>[0];
export type DbOrTx = Database | Tx;

const g = globalThis as unknown as { basatimDb?: Database };

export function getDb(): Database {
  if (g.basatimDb) return g.basatimDb;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL غير مضبوط. أضف قاعدة بيانات Postgres (مثل Neon) في إعدادات المشروع.');
  const pool = new Pool({ connectionString: withRequiredTls(url), max: 5, idleTimeoutMillis: 10_000 });
  pool.on('error', (err) => console.error('db: idle client error', err));
  g.basatimDb = drizzle(pool, { schema, casing: 'snake_case' });
  return g.basatimDb;
}

export { schema };
