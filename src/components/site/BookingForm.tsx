'use client';
import { useActionState, useEffect, useState } from 'react';
import { CalendarCheck, CircleCheck } from 'lucide-react';
import { bookingAction } from '@/server/actions/booking';
import { PICK_SERVICE_EVENT, SERVICES } from '@/config/site';
import { Alert } from '../ui/Alert';
import { Field, SelectInput, TextArea, TextInput } from '../ui/Field';
import { SubmitButton } from '../ui/SubmitButton';

export function BookingForm({ minDate }: { minDate: string }) {
  const [state, action] = useActionState(bookingAction, null);
  const fe = state?.fieldErrors ?? {};
  const [service, setService] = useState('');
  // زر «احجز هذه الخدمة» في قسم الخدمات يختار الخدمة هنا تلقائياً.
  useEffect(() => {
    const onPick = (e: Event) => setService(String((e as CustomEvent<string>).detail ?? ''));
    window.addEventListener(PICK_SERVICE_EVENT, onPick);
    return () => window.removeEventListener(PICK_SERVICE_EVENT, onPick);
  }, []);
  if (state?.ok) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <span className="grid size-16 place-items-center rounded-2xl rounded-es-sig bg-positive-soft text-fg-positive">
          <CircleCheck className="size-8" aria-hidden="true" />
        </span>
        <p className="mt-4 text-headline">{state.message}</p>
      </div>
    );
  }
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      {state?.error && <Alert tone="danger" className="sm:col-span-2">{state.error}</Alert>}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <Field label="الاسم" name="b-name" required error={fe.name}>
        <TextInput id="b-name" name="name" autoComplete="name" required aria-invalid={!!fe.name} />
      </Field>
      <Field label="رقم الجوال" name="b-phone" required error={fe.phone}>
        <TextInput id="b-phone" name="phone" inputMode="tel" dir="ltr" placeholder="05xxxxxxxx" autoComplete="tel" required aria-invalid={!!fe.phone} />
      </Field>
      <Field label="السيارة" name="b-car">
        <TextInput id="b-car" name="car" placeholder="مثال: تويوتا كامري 2021" />
      </Field>
      <Field label="الخدمة المطلوبة" name="b-service">
        <SelectInput id="b-service" name="service" value={service} onChange={(e) => setService(e.target.value)}>
          <option value="">— اختر —</option>
          {SERVICES.map((s) => (
            <option key={s.title}>{s.title}</option>
          ))}
          <option>أخرى</option>
        </SelectInput>
      </Field>
      <Field label="اليوم المفضل" name="b-date">
        <TextInput id="b-date" name="preferredDate" type="date" min={minDate} dir="ltr" />
      </Field>
      <Field label="وصف مختصر للمشكلة" name="b-notes" className="sm:col-span-2">
        <TextArea id="b-notes" name="notes" rows={3} placeholder="مثال: صوت عند الفرملة، ولمبة المكينة تظهر" />
      </Field>
      <SubmitButton size="lg" className="sm:col-span-2">
        <CalendarCheck aria-hidden="true" />
        أرسل طلب الحجز
      </SubmitButton>
    </form>
  );
}
