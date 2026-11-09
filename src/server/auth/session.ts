import 'server-only';
import { and, eq, lt } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { getDb } from '../db/client';
import { sessions, users } from '../db/schema';
import { can, type Permission } from '@/domain/permissions';
import { randomToken, sha256Hex } from './crypto';

export const SESSION_COOKIE = 'basatim_session';
const MAX_AGE_MS = 12 * 60 * 60 * 1000;
const IDLE_MS = 2 * 60 * 60 * 1000;
const TOUCH_MS = 60 * 1000;

export type CurrentUser = typeof users.$inferSelect;

export async function startSession(userId: string): Promise<void> {
  const db = getDb();
  const token = randomToken(32);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + MAX_AGE_MS);
  await db.delete(sessions).where(lt(sessions.expiresAt, now));
  await db.insert(sessions).values({ userId, tokenHash: sha256Hex(token), expiresAt, lastSeenAt: now });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await getDb().delete(sessions).where(eq(sessions.tokenHash, sha256Hex(token)));
  store.delete(SESSION_COOKIE);
}

/** يقرأ المستخدم الحالي من قاعدة البيانات (مرة واحدة لكل طلب). */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token || token.length > 200) return null;
  const db = getDb();
  const [row] = await db
    .select({ s: sessions, u: users })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(eq(sessions.tokenHash, sha256Hex(token)))
    .limit(1);
  if (!row) return null;
  const now = Date.now();
  if (row.s.expiresAt.getTime() <= now || row.s.lastSeenAt.getTime() <= now - IDLE_MS || !row.u.isActive) {
    await db.delete(sessions).where(eq(sessions.id, row.s.id));
    return null;
  }
  if (now - row.s.lastSeenAt.getTime() > TOUCH_MS) {
    await db.update(sessions).set({ lastSeenAt: new Date(now) }).where(and(eq(sessions.id, row.s.id)));
  }
  return row.u;
});

/** للصفحات: يحوّل إلى الدخول، أو إلى الرئيسية إن لم تكن لديه الصلاحية. */
export async function requirePage(p?: Permission | 'manage'): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (p && !can(user, p)) redirect('/dashboard?denied=1');
  return user;
}

export class AuthError extends Error {}

/** للإجراءات (Server Actions): يرمي خطأ إن لم يكن مسموحاً. */
export async function requireAction(p?: Permission | 'manage'): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError('انتهت الجلسة. سجّل الدخول من جديد.');
  if (p && !can(user, p)) throw new AuthError('ليست لديك صلاحية لهذا الإجراء.');
  return user;
}
