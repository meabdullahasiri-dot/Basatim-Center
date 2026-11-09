'use client';
import { useActionState } from 'react';
import { Save } from 'lucide-react';
import { createAgreementAction } from '@/server/actions/agreements';
import { Alert } from '../ui/Alert';
import { Card } from '../ui/Card';
import { Checkbox, Field, SelectInput, TextArea, TextInput } from '../ui/Field';
import { SubmitButton } from '../ui/SubmitButton';
import { CustomerFields } from './CustomerFields';
import { ItemsEditor } from './ItemsEditor';

export function AgreementForm({ terms, technicians }: { terms: string; technicians: string[] }) {
  const [state, action] = useActionState(createAgreementAction, null);
  const fe = state?.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-4 pb-24">
      {state?.error && <Alert tone="danger">{state.error}</Alert>}
      <CustomerFields errors={fe} />
      <Card>
        <h2 className="mb-4 text-headline">وصف العمل</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="شكوى العميل / المطلوب" name="complaint" required error={fe.complaint}>
            <TextArea id="complaint" name="complaint" rows={3} placeholder="مثال: صوت طقطقة من الأمام عند المطبات، والمكيف لا يبرد" required aria-invalid={!!fe.complaint} />
          </Field>
          <Field label="التشخيص المبدئي" name="diagnosis" hint="ما ظهر للمهندس عند الفحص الأولي">
            <TextArea id="diagnosis" name="diagnosis" rows={3} />
          </Field>
          <Field label="الفني / المهندس المسؤول" name="technician">
            {technicians.length ? (
              <SelectInput id="technician" name="technician" defaultValue="">
                <option value="">— اختر —</option>
                {technicians.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </SelectInput>
            ) : (
              <TextInput id="technician" name="technician" />
            )}
          </Field>
          <Field label="موعد التسليم المتوقع" name="expectedDelivery">
            <TextInput id="expectedDelivery" name="expectedDelivery" type="date" dir="ltr" />
          </Field>
        </div>
      </Card>
      <ItemsEditor vatRate={0} withDiscount={false} title="الأعمال والقطع المتوقعة (تقديرية)" />
      <Card>
        <h2 className="mb-4 text-headline">العربون والشروط</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="العربون المدفوع (ر.س)" name="deposit" error={fe.deposit} hint="يُنقل للفاتورة عند إصدارها">
            <TextInput id="deposit" name="deposit" inputMode="decimal" dir="ltr" placeholder="0.00" />
          </Field>
          <Field label="ملاحظات" name="notes" className="sm:col-span-2">
            <TextInput id="notes" name="notes" placeholder="مثال: العميل يطلب قطع وكالة فقط" />
          </Field>
          <Field label="شروط الاتفاقية" name="terms" className="sm:col-span-3">
            <TextArea id="terms" name="terms" rows={7} defaultValue={terms} className="text-callout" />
          </Field>
          <div className="sm:col-span-3">
            <Checkbox name="customerApproved" label="وافق العميل على الشروط والتكلفة التقديرية" hint="ويوقّع على النسخة المطبوعة عند الاستلام" />
          </div>
        </div>
      </Card>
      <div className="no-print fixed inset-x-0 bottom-0 z-20 border-t border-line bg-material backdrop-blur-xl lg:ps-[var(--sb-w,264px)]">
        <div className="mx-auto flex max-w-content items-center justify-end gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <SubmitButton size="lg">
            <Save aria-hidden="true" />
            حفظ الاتفاقية
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}
