'use client';
import { useActionState, useState } from 'react';
import { addTransactionAction } from '@/server/actions/finance';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '@/domain/labels';
import { Alert } from '../ui/Alert';
import { Field, SelectInput, TextInput } from '../ui/Field';
import { SubmitButton } from '../ui/SubmitButton';
import { cn } from '../ui/cn';

export function TransactionForm({ today }: { today: string }) {
  const [state, action] = useActionState(addTransactionAction, null);
  const [kind, setKind] = useState<'expense' | 'income'>('expense');
  const fe = state?.fieldErrors ?? {};
  const cats = kind === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return (
    <form action={action} className="space-y-3" key={state?.nonce ?? 'f'}>
      <input type="hidden" name="kind" value={kind} />
      <div className="flex rounded-xl bg-surface-3 p-0.5" role="radiogroup" aria-label="نوع الحركة">
        {(['expense', 'income'] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={kind === k}
            onClick={() => setKind(k)}
            className={cn('h-9 flex-1 cursor-pointer rounded-[10px] text-callout font-semibold transition-colors', kind === k ? 'bg-elevated text-fg shadow-1' : 'text-fg-tertiary')}
          >
            {k === 'expense' ? 'مصروف' : 'إيراد'}
          </button>
        ))}
      </div>
      {state?.error && <Alert tone="danger">{state.error}</Alert>}
      {state?.ok && <Alert tone="positive">{state.message}</Alert>}
      <Field label="التصنيف" name="category" error={fe.category}>
        <SelectInput id="category" name="category" key={kind}>
          {cats.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </SelectInput>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="المبلغ (ر.س)" name="amount" error={fe.amount}>
          <TextInput id="amount" name="amount" inputMode="decimal" dir="ltr" required />
        </Field>
        <Field label="التاريخ" name="date" error={fe.date}>
          <TextInput id="date" name="date" type="date" dir="ltr" defaultValue={today} required />
        </Field>
      </div>
      <Field label="طريقة الدفع" name="method">
        <SelectInput id="method" name="method">
          {Object.entries(PAYMENT_METHODS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </SelectInput>
      </Field>
      <Field label="البيان" name="description">
        <TextInput id="description" name="description" placeholder={kind === 'expense' ? 'مثال: فلاتر زيت من المورد' : 'مثال: بيع إطار'} />
      </Field>
      <SubmitButton className="w-full">{kind === 'expense' ? 'تسجيل المصروف' : 'تسجيل الإيراد'}</SubmitButton>
    </form>
  );
}
