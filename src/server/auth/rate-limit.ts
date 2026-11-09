import 'server-only';
import { eq, sql } from 'drizzle-orm';
import { getDb } from '../db/client';
import { loginAttempts } from '../db/schema';

const WINDOW_MS = 15 * 60 * 1000;
const MAX = 8;

/** يرجع true إن كان مسموحاً بمحاولة جديدة. */
export async function hit(key: string): Promise<boolean> {
  const db = getDb();
  const now = new Date();
  const [row] = await db.select().from(loginAttempts).where(eq(loginAttempts.key, key));
  if (!row || now.getTime() - row.windowStart.getTime() > WINDOW_MS) {
    await db
      .insert(loginAttempts)
      .values({ key, count: 1, windowStart: now })
      .onConflictDoUpdate({ target: loginAttempts.key, set: { count: 1, windowStart: now } });
    return true;
  }
  await db.update(loginAttempts).set({ count: sql`${loginAttempts.count} + 1` }).where(eq(loginAttempts.key, key));
  return row.count < MAX;
}

export async function clear(key: string): Promise<void> {
  await getDb().delete(loginAttempts).where(eq(loginAttempts.key, key));
}
