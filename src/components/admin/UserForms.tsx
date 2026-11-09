'use client';
import { useActionState, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { createUserAction, updateUserAction } from '@/server/actions/admin';
import { PERMISSIONS, PERMISSION_LABELS } from '@/domain/permissions';
import { Alert } from '../ui/Alert';
import { Checkbox, Field, SelectInput, TextInput } from '../ui/Field';
import { SubmitButton } from '../ui/SubmitButton';

function RolePerms({ role: initialRole, perms }: { role: 'manager' | 'staff'; perms: string[] }) {
  const [role, setRole] = useState(initialRole);
  return (
    <>
      <Field label="نوع الحساب" name="role">
        <SelectInput name="role" value={role} onChange={(e) => setRole(e.target.value as 'manager' | 'staff')}>
          <option value="staff">موظف (بصلاحيات محددة)</option>
          <option value="manager">مدير (كل الصلاحيات)</option>
        </SelectInput>
      </Field>
      {role === 'staff' ? (
        <fieldset className="rounded-2xl bg-surface-2 p-2">
          <legend className="sr-only">الصلاحيات</legend>
          <div className="px-2 pt-1 text-subheadline font-medium text-fg-secondary">الصلاحيات</div>
          {PERMISSIONS.map((p) => (
            <Checkbox key={p} name="permissions" value={p} defaultChecked={perms.includes(p)} label={PERMISSION_LABELS[p].label} hint={PERMISSION_LABELS[p].hint} />
          ))}
        </fieldset>
      ) : (
        <p className="rounded-2xl bg-primary-tint p-3 text-footnote text-fg-brand">المدير يرى كل شيء: الفواتير والاتفاقيات والمالية والإعدادات وإدارة المستخدمين.</p>
      )}
    </>
  );
}

export function CreateUserForm() {
  const [state, action] = useActionState(createUserAction, null);
  const fe = state?.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-3" key={state?.nonce ?? 'new'}>
      {state?.error && <Alert tone="danger">{state.error}</Alert>}
      {state?.ok && <Alert tone="positive">{state.message}</Alert>}
      <Field label="الاسم" name="name" required error={fe.name}>
        <TextInput id="name" name="name" required />
      </Field>
      <Field label="المسمى الوظيفي" name="jobTitle">
        <TextInput id="jobTitle" name="jobTitle" placeholder="مهندس / ميكانيكي / محاسب" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="اسم المستخدم" name="username" required error={fe.username}>
          <TextInput id="username" name="username" dir="ltr" required />
        </Field>
        <Field label="كلمة المرور" name="password" required error={fe.password}>
          <TextInput id="password" name="password" type="password" dir="ltr" autoComplete="new-password" required />
        </Field>
      </div>
      <RolePerms role="staff" perms={['invoices']} />
      <SubmitButton className="w-full">
        <UserPlus aria-hidden="true" />
        إضافة المستخدم
      </SubmitButton>
    </form>
  );
}

export function EditUserForm({ user, isSelf }: { user: { id: string; role: 'manager' | 'staff'; permissions: string[]; jobTitle: string | null; isActive: boolean }; isSelf: boolean }) {
  const [state, action] = useActionState(updateUserAction.bind(null, user.id), null);
  return (
    <form action={action} className="mt-3 space-y-3 border-t border-line pt-3">
      {state?.error && <Alert tone="danger">{state.error}</Alert>}
      {state?.ok && <Alert tone="positive">{state.message}</Alert>}
      <Field label="المسمى الوظيفي" name="jobTitle">
        <TextInput name="jobTitle" defaultValue={user.jobTitle ?? ''} />
      </Field>
      <RolePerms role={user.role} perms={user.permissions} />
      <Field label="كلمة مرور جديدة" name="password" hint="اتركها فارغة لإبقاء الحالية" error={state?.fieldErrors?.password}>
        <TextInput name="password" type="password" dir="ltr" autoComplete="new-password" />
      </Field>
      {!isSelf && <Checkbox name="isActive" defaultChecked={user.isActive} label="الحساب مفعّل" hint="الحساب الموقوف لا يستطيع الدخول" />}
      {isSelf && <input type="hidden" name="isActive" value="on" />}
      <SubmitButton size="sm">حفظ</SubmitButton>
    </form>
  );
}
