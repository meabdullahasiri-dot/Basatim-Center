import { defineConfig } from 'drizzle-kit';

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL_UNPOOLED (or DATABASE_URL) is required for drizzle-kit');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/server/db/schema.ts',
  out: './drizzle',
  dbCredentials: { url },
  strict: true,
  casing: 'snake_case',
  verbose: true,
});
