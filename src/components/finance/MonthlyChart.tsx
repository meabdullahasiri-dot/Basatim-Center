'use client';
import { useState } from 'react';
import { formatAmount } from '@/domain/money';

export interface MonthPoint {
  key: string;
  label: string;
  income: number;
  expense: number;
}

/** أعمدة مجمّعة: الإيرادات مقابل المصروفات لكل شهر، بمحور واحد يبدأ من الصفر. */
export function MonthlyChart({ data }: { data: MonthPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.flatMap((d) => [d.income, d.expense]));
  const step = niceStep(max / 4);
  const top = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  return (
    <div>
      <div className="mb-3 flex items-center gap-4 text-footnote text-fg-secondary">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-[var(--chart-income)]" aria-hidden="true" />
          الإيرادات
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-[var(--chart-expense)]" aria-hidden="true" />
          المصروفات
        </span>
      </div>
      <div className="relative flex h-56 gap-2" role="img" aria-label="الإيرادات والمصروفات لآخر ستة أشهر">
        <div className="flex w-14 shrink-0 flex-col-reverse justify-between text-caption text-fg-tertiary num">
          {ticks.map((t) => (
            <span key={t} className="-mb-2 text-end leading-4">
              {compact(t)}
            </span>
          ))}
        </div>
        <div className="relative flex-1">
          <div className="absolute inset-0 flex flex-col-reverse justify-between" aria-hidden="true">
            {ticks.map((t) => (
              <div key={t} className={t === 0 ? 'h-px bg-line-strong' : 'h-px bg-line/60'} />
            ))}
          </div>
          <div className="relative flex h-full items-end justify-around">
            {data.map((d, i) => (
              <div
                key={d.key}
                className="group relative flex h-full flex-1 cursor-default items-end justify-center gap-[2px] px-1"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                aria-label={`${d.label}: الإيرادات ${formatAmount(d.income)}، المصروفات ${formatAmount(d.expense)}`}
              >
                {hover === i && <div className="absolute inset-y-0 inset-x-0.5 rounded-lg bg-field" aria-hidden="true" />}
                <div className="relative w-full max-w-5 rounded-t-[4px] bg-[var(--chart-income)]" style={{ height: `${(d.income / top) * 100}%` }} />
                <div className="relative w-full max-w-5 rounded-t-[4px] bg-[var(--chart-expense)]" style={{ height: `${(d.expense / top) * 100}%` }} />
                {hover === i && (
                  <div className="pointer-events-none absolute bottom-full z-10 mb-2 w-44 rounded-xl bg-elevated p-2.5 text-footnote shadow-3">
                    <div className="mb-1 font-semibold text-fg">{d.label}</div>
                    <Row color="var(--chart-income)" label="الإيرادات" v={d.income} />
                    <Row color="var(--chart-expense)" label="المصروفات" v={d.expense} />
                    <div className="mt-1 flex justify-between border-t border-line pt-1 font-semibold text-fg">
                      <span>الصافي</span>
                      <span className="num">{formatAmount(d.income - d.expense)}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-2 ps-16">
        {data.map((d) => (
          <div key={d.key} className="flex-1 pt-2 text-center text-caption text-fg-tertiary">
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function Row({ color, label, v }: { color: string; label: string; v: number }) {
  return (
    <div className="flex items-center justify-between gap-2 text-fg-secondary">
      <span className="flex items-center gap-1.5">
        <span className="size-2 rounded-sm" style={{ background: color }} aria-hidden="true" />
        {label}
      </span>
      <span className="num text-fg">{formatAmount(v)}</span>
    </div>
  );
}

function niceStep(raw: number): number {
  const exp = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 1))));
  const f = raw / exp;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * exp;
}

function compact(h: number): string {
  const r = h / 100;
  if (r >= 1000) return `${(r / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })}k`;
  return r.toLocaleString('en-US');
}
