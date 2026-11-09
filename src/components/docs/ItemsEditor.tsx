'use client';
import { useMemo, useState } from 'react';
import { Plus, Trash2, Wrench, Package } from 'lucide-react';
import { computeTotals } from '@/domain/totals';
import { formatAmount, toHalalas, toQtyMilli } from '@/domain/money';
import { Card } from '../ui/Card';
import { cn } from '../ui/cn';
import { Button, iconButtonClasses } from '../ui/Button';
import { TextInput } from '../ui/Field';

export interface DraftItem {
  description: string;
  kind: 'service' | 'part';
  qty: string;
  unitPrice: string;
}

const QUICK = ['تغيير زيت المحرك والفلتر', 'فحص كمبيوتر شامل', 'أجور يد', 'تغيير فحمات الفرامل', 'تعبئة فريون المكيف', 'وزن أذرعة', 'ترصيص كفرات'];

export function ItemsEditor({
  initial,
  vatRate,
  withDiscount = true,
  discountDefault = '',
  title = 'البنود',
  hideTotals,
}: {
  initial?: DraftItem[];
  vatRate: number;
  withDiscount?: boolean;
  discountDefault?: string;
  title?: string;
  hideTotals?: boolean;
}) {
  const [items, setItems] = useState<DraftItem[]>(initial?.length ? initial : [{ description: '', kind: 'service', qty: '1', unitPrice: '' }]);
  const [discount, setDiscount] = useState(discountDefault);

  const totals = useMemo(() => {
    const lines = items.map((i) => ({ qty: toQtyMilli(i.qty || '0') ?? 0, unitPrice: toHalalas(i.unitPrice || '0') ?? 0 }));
    return computeTotals(lines, toHalalas(discount || '0') ?? 0, vatRate);
  }, [items, discount, vatRate]);

  function update(i: number, patch: Partial<DraftItem>) {
    setItems((prev) => prev.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  }
  function add(description = '', kind: DraftItem['kind'] = 'service') {
    setItems((prev) => {
      const blank = prev.findIndex((p) => !p.description.trim());
      if (description && blank >= 0) return prev.map((p, j) => (j === blank ? { ...p, description, kind } : p));
      return [...prev, { description, kind, qty: '1', unitPrice: '' }];
    });
  }

  return (
    <Card>
      <input type="hidden" name="items" value={JSON.stringify(items)} />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-headline">{title}</h2>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => add('', 'service')}>
            <Wrench aria-hidden="true" />
            خدمة
          </Button>
          <Button variant="outline" size="sm" onClick={() => add('', 'part')}>
            <Package aria-hidden="true" />
            قطعة غيار
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {QUICK.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => add(q, 'service')}
            className="cursor-pointer rounded-full bg-surface-2 px-3 py-1 text-footnote text-fg-secondary transition-colors hover:bg-primary-tint hover:text-fg-brand"
          >
            + {q}
          </button>
        ))}
      </div>

      <div className="hidden grid-cols-[1fr_120px_84px_120px_110px_40px] gap-2 px-1 pb-2 text-caption font-semibold text-fg-tertiary md:grid">
        <span>الوصف</span>
        <span>النوع</span>
        <span>الكمية</span>
        <span>سعر الوحدة</span>
        <span>الإجمالي</span>
        <span />
      </div>
      <ol className="space-y-2">
        {items.map((it, i) => {
          const lt = Math.round(((toQtyMilli(it.qty || '0') ?? 0) * (toHalalas(it.unitPrice || '0') ?? 0)) / 1000);
          return (
            <li key={i} className="grid grid-cols-2 gap-2 rounded-2xl bg-surface-2 p-2 md:grid-cols-[1fr_120px_84px_120px_110px_40px] md:items-center md:bg-transparent md:p-0">
              <TextInput
                aria-label={`وصف البند ${i + 1}`}
                placeholder="مثال: تغيير زيت المحرك"
                value={it.description}
                onChange={(e) => update(i, { description: e.target.value })}
                className="col-span-2 md:col-span-1"
              />
              <div className="col-span-2 flex rounded-xl bg-field p-0.5 md:col-span-1" role="radiogroup" aria-label="نوع البند">
                {(['service', 'part'] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={it.kind === k}
                    onClick={() => update(i, { kind: k })}
                    className={cn('h-9 flex-1 cursor-pointer rounded-[10px] text-footnote font-semibold transition-colors', it.kind === k ? 'bg-surface text-fg shadow-1' : 'text-fg-tertiary')}
                  >
                    {k === 'service' ? 'خدمة' : 'قطعة'}
                  </button>
                ))}
              </div>
              <TextInput aria-label="الكمية" inputMode="decimal" dir="ltr" value={it.qty} onChange={(e) => update(i, { qty: e.target.value })} className="text-center" />
              <TextInput aria-label="سعر الوحدة" inputMode="decimal" dir="ltr" placeholder="0.00" value={it.unitPrice} onChange={(e) => update(i, { unitPrice: e.target.value })} className="text-center" />
              <div className="flex h-10 items-center text-callout font-semibold num md:justify-start">{formatAmount(lt)}</div>
              <button
                type="button"
                onClick={() => setItems((prev) => (prev.length > 1 ? prev.filter((_, j) => j !== i) : [{ description: '', kind: 'service', qty: '1', unitPrice: '' }]))}
                className={iconButtonClasses('danger', 'justify-self-end')}
                aria-label={`حذف البند ${i + 1}`}
                title="حذف البند"
              >
                <Trash2 aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ol>
      <Button variant="plain" size="sm" className="mt-2" onClick={() => add()}>
        <Plus aria-hidden="true" />
        إضافة بند
      </Button>

      {!hideTotals && (
        <div className="mt-4 grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
          <div>
            {withDiscount && (
              <label className="block max-w-48">
                <span className="mb-1.5 block text-subheadline font-medium text-fg-secondary">الخصم (ر.س)</span>
                <TextInput name="discount" inputMode="decimal" dir="ltr" placeholder="0.00" value={discount} onChange={(e) => setDiscount(e.target.value)} />
              </label>
            )}
          </div>
          <dl className="space-y-1.5 rounded-2xl bg-surface-2 p-4 text-callout">
            <Row label="المجموع">{formatAmount(totals.subtotal)}</Row>
            {totals.discount > 0 && <Row label="الخصم">-{formatAmount(totals.discount)}</Row>}
            {vatRate > 0 && <Row label={`ضريبة القيمة المضافة ${vatRate}%`}>{formatAmount(totals.vatAmount)}</Row>}
            <div className="flex items-center justify-between border-t border-line pt-2 text-headline">
              <dt>الإجمالي</dt>
              <dd className="num text-fg-brand">{formatAmount(totals.total)} ر.س</dd>
            </div>
          </dl>
        </div>
      )}
    </Card>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-fg-secondary">
      <dt>{label}</dt>
      <dd className="num">{children}</dd>
    </div>
  );
}
