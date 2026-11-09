'use client';
import { useActionState } from 'react';
import { saveTeamMemberAction } from '@/server/actions/admin';
import { Alert } from '../ui/Alert';
import { Checkbox, Field, TextInput } from '../ui/Field';
import { SubmitButton } from '../ui/SubmitButton';

export interface TeamDefaults {
  id?: string;
  name?: string;
  title?: string;
  specialty?: string | null;
  years?: number | null;
  showOnSite?: boolean;
  sortOrder?: number;
}

export function TeamForm({ d = {} }: { d?: TeamDefaults }) {
  const [state, action] = useActionState(saveTeamMemberAction.bind(null, d.id ?? null), null);
  return (
    <form action={action} className="space-y-3" key={!d.id ? (state?.nonce ?? 'f') : 'f'}>
      {state?.error && <Alert tone="danger">{state.error}</Alert>}
      {state?.ok && <Alert tone="positive">{state.message}</Alert>}
      <div className="grid grid-cols-2 gap-3">
        <Field label="الاسم" name="name" required>
          <TextInput name="name" defaultValue={d.name} required />
        </Field>
        <Field label="المسمى" name="title" required>
          <TextInput name="title" defaultValue={d.title} placeholder="مهندس ميكانيكا" required list="team-titles" />
        </Field>
      </div>
      <Field label="التخصص" name="specialty">
        <TextInput name="specialty" defaultValue={d.specialty ?? ''} placeholder="كهرباء السيارات الحديثة والهجينة" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="سنوات الخبرة" name="years">
          <TextInput name="years" inputMode="numeric" dir="ltr" defaultValue={d.years ?? ''} />
        </Field>
        <Field label="الترتيب" name="sortOrder" hint="الأصغر يظهر أولاً">
          <TextInput name="sortOrder" inputMode="numeric" dir="ltr" defaultValue={d.sortOrder ?? 0} />
        </Field>
      </div>
      <Checkbox name="showOnSite" defaultChecked={d.showOnSite ?? true} label="إظهاره في الموقع التعريفي" />
      <datalist id="team-titles">
        {['مدير المركز', 'مهندس ميكانيكا', 'مهندس كهرباء', 'فني ميكانيكا', 'فني كهرباء', 'فني تكييف', 'فني سمكرة ودهان', 'مشرف الورشة', 'مستشار خدمة العملاء'].map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>
      <SubmitButton size="sm">{d.id ? 'حفظ' : 'إضافة إلى الفريق'}</SubmitButton>
    </form>
  );
}
