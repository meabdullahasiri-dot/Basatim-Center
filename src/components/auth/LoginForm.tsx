'use client';
import { useActionState } from 'react';
import { LogIn } from 'lucide-react';
import { loginAction } from '@/server/actions/auth';
import { Alert } from '../ui/Alert';
import { Field, TextInput } from '../ui/Field';
import { SubmitButton } from '../ui/SubmitButton';

export function LoginForm() {
  const [state, action] = useActionState(loginAction, null);
  return (
    <form action={action} className="space-y-4">
      {state?.error && <Alert tone="danger">{state.error}</Alert>}
      <Field label="اسم المستخدم" name="username">
        <TextInput id="username" name="username" autoComplete="username" dir="ltr" className="text-start" required autoFocus />
      </Field>
      <Field label="كلمة المرور" name="password">
        <TextInput id="password" name="password" type="password" autoComplete="current-password" dir="ltr" className="text-start" required />
      </Field>
      <SubmitButton size="lg" className="w-full">
        <LogIn aria-hidden="true" />
        دخول
      </SubmitButton>
    </form>
  );
}
