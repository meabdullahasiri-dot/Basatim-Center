import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { withRequiredTls } from '../src/server/db/url';

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (!url) {
    console.warn('DATABASE_URL غير مضبوط: تم تخطي الترحيل.');
    return;
  }
  const pool = new Pool({ connectionString: withRequiredTls(url), max: 1 });
  try {
    await migrate(drizzle(pool), { migrationsFolder: 'drizzle' });
    console.info('Migrations applied successfully.');
  } finally {
    await pool.end();
  }
}

main().catch((err: unknown) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
