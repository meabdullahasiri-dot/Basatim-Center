'use server';
import { eq } from 'drizzle-orm';
import { hasAnyUser } from '../users';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getDb } from '../db/client';
import { users } from '../db/schema';
import { getDummyHash, hashPassword, passwordPolicy, verifyPassword } from '../auth/password';
import { clear, hit } from '../auth/rate-limit';
import { endSession, startSession } from '../auth/session';
import { str, type ActionState } from './_helpers';

const USERNAME = /^[a-zA-Z0-9._-]{3,32}$/;

export async function loginAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const username = str(fd, 'username').toLowerCase();
  const password = str(fd, 'password');
  if (!username || !password) return { error: 'أدخل اسم المستخدم وكلمة المرور.' };
  const h = await headers();
  const ip = (h.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'local';
  if (!(await hit(`login:${ip}:${username}`))) return { error: 'محاولات كثيرة. انتظر 15 دقيقة ثم حاول مجدداً.' };

  const [user] = await getDb().select().from(users).where(eq(users.username, username)).limit(1);
  const ok = user ? await verifyPassword(user.passwordHash, password) : (await verifyPassword(await getDummyHash(), password), false);
  if (!user || !ok || !user.isActive) return { error: 'اسم المستخدم أو كلمة المرور غير صحيحة.' };

  await clear(`login:${ip}:${username}`);
  await startSession(user.id);
  redirect('/dashboard');
}

export async function logoutAction(): Promise<void> {
  await endSession();
  redirect('/login');
}

/** إنشاء حساب المدير الأول — متاح فقط عندما لا يوجد أي مستخدم. */
export async function setupAction(_: ActionState, fd: FormData): Promise<ActionState> {
  if (await hasAnyUser()) return { error: 'تم إعداد النظام مسبقاً. سجّل الدخول.' };
  const name = str(fd, 'name');
  const username = str(fd, 'username').toLowerCase();
  const password = str(fd, 'password');
  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = 'اكتب الاسم.';
  if (!USERNAME.test(username)) fieldErrors.username = 'حروف إنجليزية وأرقام فقط (3 إلى 32 خانة).';
  const pw = passwordPolicy.safeParse(password);
  if (!pw.success) fieldErrors.password = pw.error.issues[0].message;
  if (password !== str(fd, 'confirm')) fieldErrors.confirm = 'كلمتا المرور غير متطابقتين.';
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const [user] = await getDb()
    .insert(users)
    .values({ name, username, passwordHash: await hashPassword(password), role: 'manager', jobTitle: 'مدير المركز' })
    .returning();
  await startSession(user.id);
  redirect('/dashboard');
}
