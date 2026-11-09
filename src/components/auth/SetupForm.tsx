'use client';
import { useActionState } from 'react';
import { setupAction } from '@/server/actions/auth';
import { Alert } from '../ui/Alert';
import { Field, TextInput } from '../ui/Field';
import { SubmitButton } from '../ui/SubmitButton';

export function SetupForm() {
  const [state, action] = useActionState(setupAction, null);
  const fe = state?.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-4">
      {state?.error && <Alert tone="danger">{state.error}</Alert>}
      <Field label="اسم المدير" name="name" required error={fe.name}>
        <TextInput id="name" name="name" required aria-invalid={!!fe.name} />
      </Field>
      <Field label="اسم المستخدم (بالإنجليزية)" name="username" required error={fe.username} hint="مثال: manager">
        <TextInput id="username" name="username" dir="ltr" className="text-start" required aria-invalid={!!fe.username} />
      </Field>
      <Field label="كلمة المرور" name="password" required error={fe.password} hint="8 خانات على الأقل، حروف وأرقام">
        <TextInput id="password" name="password" type="password" dir="ltr" autoComplete="new-password" required aria-invalid={!!fe.password} />
      </Field>
      <Field label="تأكيد كلمة المرور" name="confirm" required error={fe.confirm}>
        <TextInput id="confirm" name="confirm" type="password" dir="ltr" autoComplete="new-password" required aria-invalid={!!fe.confirm} />
      </Field>
      <SubmitButton size="lg" className="w-full">
        إنشاء حساب المدير
      </SubmitButton>
    </form>
  );
}
