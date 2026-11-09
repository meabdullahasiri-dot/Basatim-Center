import 'server-only';
import { count } from 'drizzle-orm';
import { getDb } from './db/client';
import { users } from './db/schema';

export async function hasAnyUser(): Promise<boolean> {
  const [row] = await getDb().select({ n: count() }).from(users);
  return (row?.n ?? 0) > 0;
}
