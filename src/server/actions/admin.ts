'use server';
import { and, eq, ne } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getDb } from '../db/client';
import { bookings, sessions, settings, teamMembers, users } from '../db/schema';
import { requireAction } from '../auth/session';
import { hashPassword, passwordPolicy } from '../auth/password';
import { cleanPermissions } from '@/domain/permissions';
import { normalizeDigits } from '@/domain/money';
import { failure, optStr, str, type ActionState } from './_helpers';

const USERNAME = /^[a-zA-Z0-9._-]{3,32}$/;

/* ---------- المستخدمون والصلاحيات ---------- */

export async function createUserAction(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    await requireAction('manage');
    const name = str(fd, 'name').slice(0, 80);
    const username = str(fd, 'username').toLowerCase();
    const password = str(fd, 'password');
    const fieldErrors: Record<string, string> = {};
    if (name.length < 2) fieldErrors.name = 'اكتب الاسم.';
    if (!USERNAME.test(username)) fieldErrors.username = 'حروف إنجليزية وأرقام فقط (3 إلى 32 خانة).';
    const pw = passwordPolicy.safeParse(password);
    if (!pw.success) fieldErrors.password = pw.error.issues[0].message;
    if (Object.keys(fieldErrors).length) return { fieldErrors };
    const [exists] = await getDb().select({ id: users.id }).from(users).where(eq(users.username, username));
    if (exists) return { fieldErrors: { username: 'اسم المستخدم مستخدم من قبل.' } };
    const role = str(fd, 'role') === 'manager' ? 'manager' : 'staff';
    await getDb()
      .insert(users)
      .values({
        name,
        username,
        jobTitle: optStr(fd, 'jobTitle', 60),
        passwordHash: await hashPassword(password),
        role,
        permissions: role === 'manager' ? [] : cleanPermissions(fd.getAll('permissions').map(String)),
      });
    revalidatePath('/users');
    return { ok: true, nonce: Date.now(), message: `أُنشئ حساب ${name}.` };
  } catch (err) {
    return failure(err);
  }
}

export async function updateUserAction(id: string, _: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const me = await requireAction('manage');
    const role = str(fd, 'role') === 'manager' ? 'manager' : 'staff';
    const isActive = fd.get('isActive') === 'on';
    if (id === me.id && (role !== 'manager' || !isActive)) return { error: 'لا يمكنك سحب صلاحية المدير من حسابك أو إيقافه.' };
    const password = str(fd, 'password');
    const patch: Partial<typeof users.$inferInsert> = {
      role,
      isActive,
      jobTitle: optStr(fd, 'jobTitle', 60),
      permissions: role === 'manager' ? [] : cleanPermissions(fd.getAll('permissions').map(String)),
    };
    if (password) {
      const pw = passwordPolicy.safeParse(password);
      if (!pw.success) return { fieldErrors: { password: pw.error.issues[0].message } };
      patch.passwordHash = await hashPassword(password);
    }
    await getDb().update(users).set(patch).where(eq(users.id, id));
    if (password || !isActive) await getDb().delete(sessions).where(and(eq(sessions.userId, id), ne(sessions.userId, me.id)));
    revalidatePath('/users');
    return { ok: true, message: 'حُفظت التعديلات.' };
  } catch (err) {
    return failure(err);
  }
}

/* ---------- فريق العمل (للموقع) ---------- */

export async function saveTeamMemberAction(id: string | null, _: ActionState, fd: FormData): Promise<ActionState> {
  try {
    await requireAction('manage');
    const name = str(fd, 'name').slice(0, 80);
    const title = str(fd, 'title').slice(0, 80);
    if (name.length < 2 || title.length < 2) return { error: 'اكتب الاسم والمسمى الوظيفي.' };
    const yearsRaw = normalizeDigits(str(fd, 'years'));
    const values = {
      name,
      title,
      specialty: optStr(fd, 'specialty', 160),
      years: /^\d{1,2}$/.test(yearsRaw) ? Number(yearsRaw) : null,
      showOnSite: fd.get('showOnSite') === 'on',
      sortOrder: Number(normalizeDigits(str(fd, 'sortOrder'))) || 0,
    };
    if (id) await getDb().update(teamMembers).set(values).where(eq(teamMembers.id, id));
    else await getDb().insert(teamMembers).values(values);
    revalidatePath('/team');
    revalidatePath('/');
    return { ok: true, nonce: Date.now(), message: id ? 'حُفظت التعديلات.' : `أُضيف ${name} إلى الفريق.` };
  } catch (err) {
    return failure(err);
  }
}

export async function deleteTeamMemberAction(id: string): Promise<void> {
  await requireAction('manage');
  await getDb().delete(teamMembers).where(eq(teamMembers.id, id));
  revalidatePath('/team');
  revalidatePath('/');
}

/* ---------- طلبات الحجز ---------- */

export async function setBookingStatusAction(id: string, fd: FormData): Promise<void> {
  await requireAction('bookings');
  const status = str(fd, 'status');
  if (!['new', 'contacted', 'done', 'cancelled'].includes(status)) return;
  await getDb()
    .update(bookings)
    .set({ status: status as 'new' })
    .where(eq(bookings.id, id));
  revalidatePath('/bookings');
}

/* ---------- الإعدادات ---------- */

export async function saveSettingsAction(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    await requireAction('manage');
    const vatEnabled = fd.get('vatEnabled') === 'on';
    const vatNumber = normalizeDigits(str(fd, 'vatNumber'));
    if (vatEnabled && !/^3\d{13}3$/.test(vatNumber)) return { fieldErrors: { vatNumber: 'الرقم الضريبي 15 رقماً يبدأ بـ 3 وينتهي بـ 3.' }, error: 'راجع الرقم الضريبي.' };
    const centerName = str(fd, 'centerName').slice(0, 120);
    if (centerName.length < 3) return { fieldErrors: { centerName: 'اكتب اسم المركز.' } };
    const mapUrl = str(fd, 'mapUrl');
    if (mapUrl && !/^https:\/\//.test(mapUrl)) return { fieldErrors: { mapUrl: 'رابط الخريطة يبدأ بـ https://' } };
    await getDb()
      .insert(settings)
      .values({ id: 1, centerName })
      .onConflictDoNothing();
    await getDb()
      .update(settings)
      .set({
        centerName,
        centerNameEn: str(fd, 'centerNameEn').slice(0, 120) || 'Basatim Auto Service Center',
        crNumber: optStr(fd, 'crNumber', 20),
        vatEnabled,
        vatNumber: vatNumber || null,
        phone: optStr(fd, 'phone', 20),
        whatsapp: optStr(fd, 'whatsapp', 20),
        email: optStr(fd, 'email', 120),
        city: optStr(fd, 'city', 60),
        address: optStr(fd, 'address', 200),
        mapUrl: mapUrl || null,
        workingHours: optStr(fd, 'workingHours', 200),
        invoiceFooter: optStr(fd, 'invoiceFooter', 600),
        agreementTerms: optStr(fd, 'agreementTerms', 5000),
        updatedAt: new Date(),
      })
      .where(eq(settings.id, 1));
    revalidatePath('/', 'layout');
    return { ok: true, message: 'حُفظت الإعدادات.' };
  } catch (err) {
    return failure(err);
  }
}
