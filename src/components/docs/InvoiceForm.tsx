'use client';
import { useActionState } from 'react';
import { Save } from 'lucide-react';
import { createInvoiceAction } from '@/server/actions/invoices';
import { PAYMENT_METHODS } from '@/domain/labels';
import { Alert } from '../ui/Alert';
import { Card } from '../ui/Card';
import { Field, SelectInput, TextArea, TextInput } from '../ui/Field';
import { SubmitButton } from '../ui/SubmitButton';
import { CustomerFields, type CustomerDefaults } from './CustomerFields';
import { ItemsEditor, type DraftItem } from './ItemsEditor';

export function InvoiceForm({ vatRate, defaults, items, agreementId, paidDefault }: { vatRate: number; defaults?: CustomerDefaults; items?: DraftItem[]; agreementId?: string; paidDefault?: string }) {
  const [state, action] = useActionState(createInvoiceAction, null);
  const fe = state?.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-4 pb-24">
      {agreementId && <input type="hidden" name="agreementId" value={agreementId} />}
      {state?.error && <Alert tone="danger">{state.error}</Alert>}
      <CustomerFields d={defaults} errors={fe} showVat={vatRate > 0} />
      <ItemsEditor vatRate={vatRate} initial={items} />
      {fe.discount && <Alert tone="danger">{fe.discount}</Alert>}
      <Card>
        <h2 className="mb-4 text-headline">الدفع والملاحظات</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="المبلغ المدفوع الآن (ر.س)" name="paidNow" error={fe.paidNow} hint="اتركه فارغاً إن كانت الفاتورة آجلة">
            <TextInput id="paidNow" name="paidNow" inputMode="decimal" dir="ltr" placeholder="0.00" defaultValue={paidDefault} aria-invalid={!!fe.paidNow} />
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
          <Field label="ملاحظات على الفاتورة" name="notes" className="sm:col-span-3">
            <TextArea id="notes" name="notes" rows={2} placeholder="مثال: ضمان 3 أشهر على القطع" />
          </Field>
        </div>
      </Card>
      <div className="no-print fixed inset-x-0 bottom-0 z-20 border-t border-line bg-material backdrop-blur-xl lg:ps-sidebar">
        <div className="mx-auto flex max-w-content items-center justify-end gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <SubmitButton size="lg">
            <Save aria-hidden="true" />
            إصدار الفاتورة
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}
