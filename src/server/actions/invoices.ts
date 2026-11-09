'use server';
import { and, eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getDb } from '../db/client';
import { agreements, invoices, transactions } from '../db/schema';
import { requireAction } from '../auth/session';
import { getSettings, nextNumber } from '../settings';
import { parseCustomer, parseItems } from '../documents';
import { computeTotals, paymentStatus } from '@/domain/totals';
import { toHalalas } from '@/domain/money';
import { PAYMENT_METHODS } from '@/domain/labels';
import { failure, optStr, str, type ActionState } from './_helpers';

function today(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Riyadh' });
}

export async function createInvoiceAction(_: ActionState, fd: FormData): Promise<ActionState> {
  let id: string;
  try {
    const user = await requireAction('invoices');
    const customer = parseCustomer(fd);
    if ('fieldErrors' in customer) return { fieldErrors: customer.fieldErrors, error: 'راجع بيانات العميل.' };
    const items = parseItems(fd);
    if ('error' in items) return { error: items.error };
    const discount = toHalalas(str(fd, 'discount') || '0');
    if (discount === null || discount < 0) return { fieldErrors: { discount: 'قيمة الخصم غير صحيحة.' } };
    const paidNow = toHalalas(str(fd, 'paidNow') || '0');
    if (paidNow === null || paidNow < 0) return { fieldErrors: { paidNow: 'المبلغ المدفوع غير صحيح.' } };
    const method = str(fd, 'method') in PAYMENT_METHODS ? str(fd, 'method') : 'cash';

    const s = await getSettings();
    const vatRate = s.vatEnabled ? s.vatRate : 0;
    const totals = computeTotals(items.items, discount, vatRate);
    if (paidNow > totals.total) return { fieldErrors: { paidNow: 'المبلغ المدفوع أكبر من إجمالي الفاتورة.' } };
    const agreementId = optStr(fd, 'agreementId', 40);

    id = await getDb().transaction(async (tx) => {
      const number = await nextNumber(tx, 'INV');
      const [inv] = await tx
        .insert(invoices)
        .values({
          number,
          ...customer.value,
          items: items.items,
          subtotal: totals.subtotal,
          discount: totals.discount,
          vatRate,
          vatAmount: totals.vatAmount,
          total: totals.total,
          paid: paidNow,
          status: paymentStatus(totals.total, paidNow),
          agreementId: agreementId && /^[0-9a-f-]{36}$/.test(agreementId) ? agreementId : null,
          notes: optStr(fd, 'notes', 1000),
          createdBy: user.id,
        })
        .returning({ id: invoices.id });
      if (paidNow > 0) {
        await tx.insert(transactions).values({
          kind: 'income',
          category: 'فواتير الصيانة',
          amount: paidNow,
          date: today(),
          method,
          description: `دفعة على الفاتورة ${number} — ${customer.value.customerName}`,
          invoiceId: inv.id,
          createdBy: user.id,
        });
      }
      if (agreementId && /^[0-9a-f-]{36}$/.test(agreementId)) {
        await tx.update(agreements).set({ status: 'completed', updatedAt: new Date() }).where(eq(agreements.id, agreementId));
      }
      return inv.id;
    });
  } catch (err) {
    return failure(err);
  }
  revalidatePath('/invoices');
  revalidatePath('/dashboard');
  redirect(`/invoices/${id}?created=1`);
}

export async function addPaymentAction(invoiceId: string, _: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const user = await requireAction('invoices');
    const amount = toHalalas(str(fd, 'amount'));
    if (amount === null || amount <= 0) return { fieldErrors: { amount: 'اكتب مبلغاً صحيحاً.' } };
    const method = str(fd, 'method') in PAYMENT_METHODS ? str(fd, 'method') : 'cash';
    const result = await getDb().transaction(async (tx) => {
      const [inv] = await tx.select().from(invoices).where(eq(invoices.id, invoiceId)).for('update');
      if (!inv) return { error: 'الفاتورة غير موجودة.' };
      if (inv.status === 'void') return { error: 'لا يمكن تسجيل دفعة على فاتورة ملغاة.' };
      const remaining = inv.total - inv.paid;
      if (amount > remaining) return { fieldErrors: { amount: 'المبلغ أكبر من المتبقي على الفاتورة.' } };
      const paid = inv.paid + amount;
      await tx.update(invoices).set({ paid, status: paymentStatus(inv.total, paid) }).where(eq(invoices.id, invoiceId));
      await tx.insert(transactions).values({
        kind: 'income',
        category: 'فواتير الصيانة',
        amount,
        date: today(),
        method,
        description: `دفعة على الفاتورة ${inv.number} — ${inv.customerName}`,
        invoiceId,
        createdBy: user.id,
      });
      return { ok: true, message: 'سُجّلت الدفعة.' };
    });
    revalidatePath(`/invoices/${invoiceId}`);
    revalidatePath('/finance');
    return result;
  } catch (err) {
    return failure(err);
  }
}

export async function voidInvoiceAction(invoiceId: string, _: ActionState, fd: FormData): Promise<ActionState> {
  try {
    await requireAction('manage');
    const reason = str(fd, 'reason').slice(0, 300);
    if (reason.length < 3) return { fieldErrors: { reason: 'اكتب سبب الإلغاء.' } };
    await getDb().transaction(async (tx) => {
      await tx.update(invoices).set({ status: 'void', voidReason: reason, paid: 0 }).where(and(eq(invoices.id, invoiceId), sql`${invoices.status} <> 'void'`));
      // تُحذف دفعات الفاتورة من الإيرادات حتى لا تُحتسب.
      await tx.delete(transactions).where(eq(transactions.invoiceId, invoiceId));
    });
    revalidatePath(`/invoices/${invoiceId}`);
    revalidatePath('/invoices');
    return { ok: true, message: 'أُلغيت الفاتورة.' };
  } catch (err) {
    return failure(err);
  }
}
