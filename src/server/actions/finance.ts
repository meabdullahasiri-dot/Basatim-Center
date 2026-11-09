'use server';
import { and, eq, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getDb } from '../db/client';
import { transactions } from '../db/schema';
import { requireAction } from '../auth/session';
import { toHalalas } from '@/domain/money';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '@/domain/labels';
import { failure, optStr, str, type ActionState } from './_helpers';

export async function addTransactionAction(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const user = await requireAction('finance');
    const kind = str(fd, 'kind') === 'income' ? 'income' : 'expense';
    const category = str(fd, 'category');
    const allowed = kind === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const fieldErrors: Record<string, string> = {};
    if (!allowed.includes(category)) fieldErrors.category = 'اختر التصنيف.';
    const amount = toHalalas(str(fd, 'amount'));
    if (amount === null || amount <= 0) fieldErrors.amount = 'اكتب مبلغاً صحيحاً.';
    const date = str(fd, 'date');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fieldErrors.date = 'اختر التاريخ.';
    if (Object.keys(fieldErrors).length) return { fieldErrors };
    await getDb()
      .insert(transactions)
      .values({
        kind,
        category,
        amount: amount!,
        date,
        method: str(fd, 'method') in PAYMENT_METHODS ? str(fd, 'method') : 'cash',
        description: optStr(fd, 'description', 300),
        createdBy: user.id,
      });
    revalidatePath('/finance');
    revalidatePath('/dashboard');
    return { ok: true, nonce: Date.now(), message: kind === 'income' ? 'سُجّل الإيراد.' : 'سُجّل المصروف.' };
  } catch (err) {
    return failure(err);
  }
}

/** حذف حركة يدوية (المدير فقط). حركات الفواتير تُدار من الفاتورة نفسها. */
export async function deleteTransactionAction(id: string): Promise<void> {
  await requireAction('manage');
  await getDb()
    .delete(transactions)
    .where(and(eq(transactions.id, id), isNull(transactions.invoiceId)));
  revalidatePath('/finance');
}
