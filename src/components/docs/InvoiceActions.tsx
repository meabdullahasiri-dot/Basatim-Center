'use client';
import { useActionState } from 'react';
import { addPaymentAction, voidInvoiceAction } from '@/server/actions/invoices';
import { PAYMENT_METHODS } from '@/domain/labels';
import { Alert } from '../ui/Alert';
import { Field, SelectInput, TextInput } from '../ui/Field';
import { SubmitButton } from '../ui/SubmitButton';

export function PaymentForm({ invoiceId, remaining }: { invoiceId: string; remaining: string }) {
  const [state, action] = useActionState(addPaymentAction.bind(null, invoiceId), null);
  return (
    <form action={action} className="space-y-3">
      {state?.error && <Alert tone="danger">{state.error}</Alert>}
      {state?.ok && <Alert tone="positive">{state.message}</Alert>}
      <Field label="المبلغ (ر.س)" name="amount" error={state?.fieldErrors?.amount}>
        <TextInput id="amount" name="amount" inputMode="decimal" dir="ltr" defaultValue={remaining} key={remaining} required />
      </Field>
      <Field label="طريقة الدفع" name="method">
        <SelectInput id="method" name="method" defaultValue="cash">
          {Object.entries(PAYMENT_METHODS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </SelectInput>
      </Field>
      <SubmitButton variant="success" className="w-full">
        تسجيل الدفعة
      </SubmitButton>
    </form>
  );
}

export function VoidForm({ invoiceId }: { invoiceId: string }) {
  const [state, action] = useActionState(voidInvoiceAction.bind(null, invoiceId), null);
  return (
    <details className="group rounded-2xl bg-danger-soft p-3">
      <summary className="cursor-pointer list-none text-callout font-semibold text-fg-danger">إلغاء الفاتورة…</summary>
      <form action={action} className="mt-3 space-y-3">
        {state?.error && <Alert tone="danger">{state.error}</Alert>}
        <p className="text-footnote text-fg-secondary">تُحذف دفعات الفاتورة من الإيرادات، ويبقى رقمها محفوظاً بعلامة «ملغاة». لا يمكن التراجع.</p>
        <Field label="سبب الإلغاء" name="reason" error={state?.fieldErrors?.reason}>
          <TextInput id="reason" name="reason" required />
        </Field>
        <SubmitButton variant="danger" size="sm">
          تأكيد الإلغاء
        </SubmitButton>
      </form>
    </details>
  );
}
