'use server';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getDb } from '../db/client';
import { agreements } from '../db/schema';
import { requireAction } from '../auth/session';
import { nextNumber } from '../settings';
import { parseCustomer, parseItems } from '../documents';
import { computeTotals } from '@/domain/totals';
import { toHalalas } from '@/domain/money';
import { failure, optStr, str, type ActionState } from './_helpers';
import { todayISO } from '@/lib/format';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function createAgreementAction(_: ActionState, fd: FormData): Promise<ActionState> {
  let id: string;
  try {
    const user = await requireAction('agreements');
    const customer = parseCustomer(fd);
    if ('fieldErrors' in customer) return { fieldErrors: customer.fieldErrors, error: 'راجع بيانات العميل.' };
    const complaint = str(fd, 'complaint').slice(0, 2000);
    if (complaint.length < 3) return { fieldErrors: { complaint: 'اكتب المشكلة أو الطلب كما وصفه العميل.' }, error: 'اكتب وصف المشكلة.' };
    const items = parseItems(fd, { allowEmpty: true });
    if ('error' in items) return { error: items.error };
    const deposit = toHalalas(str(fd, 'deposit') || '0');
    if (deposit === null || deposit < 0) return { fieldErrors: { deposit: 'قيمة العربون غير صحيحة.' } };
    const delivery = str(fd, 'expectedDelivery');
    const totals = computeTotals(items.items, 0, 0);

    id = await getDb().transaction(async (tx) => {
      const number = await nextNumber(tx, 'AGR');
      const [row] = await tx
        .insert(agreements)
        .values({
          number,
          date: todayISO(),
          ...customer.value,
          complaint,
          diagnosis: optStr(fd, 'diagnosis', 2000),
          items: items.items,
          estimatedTotal: totals.total,
          deposit,
          expectedDelivery: DATE.test(delivery) ? delivery : null,
          technician: optStr(fd, 'technician', 120),
          terms: optStr(fd, 'terms', 5000),
          customerApproved: fd.get('customerApproved') === 'on',
          notes: optStr(fd, 'notes', 1000),
          createdBy: user.id,
        })
        .returning({ id: agreements.id });
      return row.id;
    });
  } catch (err) {
    return failure(err);
  }
  revalidatePath('/agreements');
  redirect(`/agreements/${id}?created=1`);
}

const STATUSES = ['open', 'in_progress', 'completed', 'cancelled'] as const;

export async function setAgreementStatusAction(id: string, fd: FormData): Promise<void> {
  await requireAction('agreements');
  const status = str(fd, 'status');
  if (!(STATUSES as readonly string[]).includes(status)) return;
  await getDb()
    .update(agreements)
    .set({ status: status as (typeof STATUSES)[number], updatedAt: new Date() })
    .where(eq(agreements.id, id));
  revalidatePath(`/agreements/${id}`);
  revalidatePath('/agreements');
}
