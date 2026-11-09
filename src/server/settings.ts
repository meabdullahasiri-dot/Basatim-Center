import 'server-only';
import { eq } from 'drizzle-orm';
import { cache } from 'react';
import type { DbOrTx } from './db/client';
import { getDb } from './db/client';
import { counters, settings } from './db/schema';
import { sql } from 'drizzle-orm';

export type Settings = typeof settings.$inferSelect;

export const getSettings = cache(async (): Promise<Settings> => {
  const db = getDb();
  const [row] = await db.select().from(settings).where(eq(settings.id, 1));
  if (row) return row;
  const [created] = await db.insert(settings).values({ id: 1 }).onConflictDoNothing().returning();
  return created ?? (await db.select().from(settings).where(eq(settings.id, 1)))[0];
});

/** رقم تسلسلي آمن مع التزامن: INV-2026-0001 */
export async function nextNumber(db: DbOrTx, prefix: 'INV' | 'AGR'): Promise<string> {
  const year = new Date().getFullYear();
  const key = `${prefix}-${year}`;
  const [row] = await db
    .insert(counters)
    .values({ key, value: 1 })
    .onConflictDoUpdate({ target: counters.key, set: { value: sql`${counters.value} + 1` } })
    .returning({ value: counters.value });
  return `${prefix}-${year}-${String(row.value).padStart(4, '0')}`;
}
