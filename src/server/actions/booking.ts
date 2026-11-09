'use server';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getDb } from '../db/client';
import { bookings } from '../db/schema';
import { hit } from '../auth/rate-limit';
import { normalizeDigits } from '@/domain/money';
import { failure, optStr, str, type ActionState } from './_helpers';

/** نموذج «احجز موعدك» العام في الموقع. */
export async function bookingAction(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    if (str(fd, 'website')) return { ok: true, message: 'وصل طلبك.' }; // مصيدة الروبوتات
    const name = str(fd, 'name').slice(0, 80);
    const phone = normalizeDigits(str(fd, 'phone')).replace(/[^\d+]/g, '');
    const fieldErrors: Record<string, string> = {};
    if (name.length < 2) fieldErrors.name = 'اكتب اسمك.';
    if (!/^(\+?966|0)?5\d{8}$/.test(phone)) fieldErrors.phone = 'اكتب رقم جوال سعودي صحيح، مثل 0501234567.';
    const date = str(fd, 'preferredDate');
    if (Object.keys(fieldErrors).length) return { fieldErrors };
    const h = await headers();
    const ip = (h.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'local';
    if (!(await hit(`booking:${ip}`))) return { error: 'أرسلت طلبات كثيرة. حاول لاحقاً أو تواصل معنا هاتفياً.' };
    await getDb()
      .insert(bookings)
      .values({
        name,
        phone,
        car: optStr(fd, 'car', 80),
        service: optStr(fd, 'service', 80),
        preferredDate: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null,
        notes: optStr(fd, 'notes', 500),
      });
    revalidatePath('/bookings');
    return { ok: true, message: `شكراً ${name}! وصل طلبك وسنتواصل معك قريباً لتأكيد الموعد.` };
  } catch (err) {
    return failure(err);
  }
}
