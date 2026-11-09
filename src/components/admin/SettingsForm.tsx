'use client';
import { useActionState, useState } from 'react';
import { Save } from 'lucide-react';
import { saveSettingsAction } from '@/server/actions/admin';
import type { Settings } from '@/server/settings';
import { Alert } from '../ui/Alert';
import { Card } from '../ui/Card';
import { Checkbox, Field, TextArea, TextInput } from '../ui/Field';
import { SubmitButton } from '../ui/SubmitButton';

export function SettingsForm({ s, defaultTerms }: { s: Settings; defaultTerms: string }) {
  const [state, action] = useActionState(saveSettingsAction, null);
  const [vat, setVat] = useState(s.vatEnabled);
  const fe = state?.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-4">
      {state?.error && <Alert tone="danger">{state.error}</Alert>}
      {state?.ok && <Alert tone="positive">{state.message}</Alert>}
      <Card>
        <h2 className="mb-4 text-headline">بيانات المركز</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="اسم المركز" name="centerName" required error={fe.centerName}>
            <TextInput id="centerName" name="centerName" defaultValue={s.centerName} required />
          </Field>
          <Field label="الاسم بالإنجليزية" name="centerNameEn">
            <TextInput id="centerNameEn" name="centerNameEn" dir="ltr" defaultValue={s.centerNameEn} />
          </Field>
          <Field label="رقم السجل التجاري" name="crNumber">
            <TextInput id="crNumber" name="crNumber" dir="ltr" inputMode="numeric" defaultValue={s.crNumber ?? ''} />
          </Field>
          <Field label="المدينة" name="city">
            <TextInput id="city" name="city" defaultValue={s.city ?? ''} />
          </Field>
          <Field label="العنوان" name="address" className="sm:col-span-2">
            <TextInput id="address" name="address" defaultValue={s.address ?? ''} placeholder="الحي، الشارع" />
          </Field>
        </div>
      </Card>
      <Card>
        <h2 className="mb-1 text-headline">ضريبة القيمة المضافة</h2>
        <p className="mb-3 text-callout text-fg-secondary">عند التفعيل تصبح الفواتير «فاتورة ضريبية مبسطة» بضريبة {s.vatRate}% ورمز QR متوافق مع المرحلة الأولى من الفوترة الإلكترونية (هيئة الزكاة والضريبة والجمارك).</p>
        <Checkbox name="vatEnabled" checked={vat} onChange={(e) => setVat(e.target.checked)} label="المركز مسجّل في ضريبة القيمة المضافة" />
        {vat && (
          <Field label="الرقم الضريبي" name="vatNumber" error={fe.vatNumber} className="mt-3 max-w-sm" hint="15 رقماً يبدأ بـ 3 وينتهي بـ 3">
            <TextInput id="vatNumber" name="vatNumber" dir="ltr" inputMode="numeric" defaultValue={s.vatNumber ?? ''} aria-invalid={!!fe.vatNumber} />
          </Field>
        )}
      </Card>
      <Card>
        <h2 className="mb-4 text-headline">التواصل (يظهر في الموقع والفواتير)</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="الهاتف" name="phone">
            <TextInput id="phone" name="phone" dir="ltr" inputMode="tel" defaultValue={s.phone ?? ''} />
          </Field>
          <Field label="واتساب" name="whatsapp" hint="مثال: 0501234567">
            <TextInput id="whatsapp" name="whatsapp" dir="ltr" inputMode="tel" defaultValue={s.whatsapp ?? ''} />
          </Field>
          <Field label="البريد الإلكتروني" name="email">
            <TextInput id="email" name="email" type="email" dir="ltr" defaultValue={s.email ?? ''} />
          </Field>
          <Field label="أوقات العمل" name="workingHours">
            <TextInput id="workingHours" name="workingHours" defaultValue={s.workingHours ?? ''} placeholder="السبت – الخميس: 8 ص – 10 م" />
          </Field>
          <Field label="رابط الموقع على خرائط جوجل" name="mapUrl" error={fe.mapUrl} className="sm:col-span-2">
            <TextInput id="mapUrl" name="mapUrl" dir="ltr" defaultValue={s.mapUrl ?? ''} placeholder="https://maps.app.goo.gl/..." />
          </Field>
        </div>
      </Card>
      <Card>
        <h2 className="mb-4 text-headline">نصوص المستندات</h2>
        <div className="grid gap-3">
          <Field label="تذييل الفاتورة" name="invoiceFooter" hint="مثال: الضمان، أو بيانات الحساب البنكي">
            <TextArea id="invoiceFooter" name="invoiceFooter" rows={3} defaultValue={s.invoiceFooter ?? ''} />
          </Field>
          <Field label="الشروط الافتراضية لاتفاقية العمل" name="agreementTerms">
            <TextArea id="agreementTerms" name="agreementTerms" rows={8} defaultValue={s.agreementTerms || defaultTerms} className="text-callout" />
          </Field>
        </div>
      </Card>
      <SubmitButton size="lg">
        <Save aria-hidden="true" />
        حفظ الإعدادات
      </SubmitButton>
    </form>
  );
}
