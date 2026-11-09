'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { PICK_SERVICE_EVENT, SERVICES } from '@/config/site';
import { ServiceIcon } from './ServiceIcon';
import { cn } from '../ui/cn';

/** الخدمات كقائمة تفاعلية: اختر خدمة لتظهر تفاصيلها، وتتنقل تلقائياً حتى يتفاعل الزائر. */
export function ServicesExplorer() {
  const [active, setActive] = useState(0);
  const touched = useRef(false);
  const s = SERVICES[active];

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => {
      if (!touched.current) setActive((a) => (a + 1) % SERVICES.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, []);

  function pick(i: number) {
    touched.current = true;
    setActive(i);
  }

  function book() {
    window.dispatchEvent(new CustomEvent(PICK_SERVICE_EVENT, { detail: s.title }));
    document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,340px)_1fr]">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-1" role="tablist" aria-label="الخدمات" onMouseEnter={() => (touched.current = true)}>
        {SERVICES.map((sv, i) => (
          <button
            key={sv.title}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => pick(i)}
            onMouseEnter={() => pick(i)}
            className={cn(
              'group relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-2xl px-3 py-2.5 text-start text-[15px] font-semibold transition-colors duration-200 lg:py-3',
              i === active ? 'bg-surface text-fg shadow-2' : 'text-fg-secondary hover:bg-surface/70 hover:text-fg',
            )}
          >
            <span
              className={cn(
                'grid size-9 shrink-0 place-items-center rounded-xl rounded-es-sig transition-colors duration-200',
                i === active ? 'bg-brand-600 text-white' : 'bg-primary-tint text-icon-brand',
              )}
            >
              <ServiceIcon name={sv.icon} className="size-[18px]" />
            </span>
            <span className="leading-tight">{sv.title}</span>
            {i === active && <span className="absolute inset-y-3 start-0 w-1 rounded-full bg-brand-500" aria-hidden="true" />}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="relative isolate min-h-[340px] overflow-hidden rounded-[28px] border border-line bg-surface p-7 shadow-3 sm:p-10">
        <div className="pointer-events-none absolute -top-24 -end-24 -z-10 size-80 rounded-full bg-[radial-gradient(closest-side,rgba(254,97,17,.16),transparent)]" aria-hidden="true" />
        <ServiceIcon name={s.icon} className="pointer-events-none absolute -bottom-10 -end-6 -z-10 size-64 text-brand-500/[.07]" />
        <div key={active} className="animate-[fadeUp_.5s_ease_both]">
          <span className="grid size-16 place-items-center rounded-2xl rounded-es-sig bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-brand">
            <ServiceIcon name={s.icon} className="size-8" />
          </span>
          <h3 className="mt-6 text-[clamp(26px,3vw,36px)] font-bold leading-tight">{s.title}</h3>
          <p className="mt-3 max-w-xl text-[17px] leading-8 text-fg-secondary">{s.text}</p>
          <ul className="mt-5 grid gap-2 sm:grid-cols-3">
            {s.points.map((p) => (
              <li key={p} className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-[14px]">
                <Check className="size-4 shrink-0 text-fg-brand" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={book}
            className="mt-7 inline-flex h-12 cursor-pointer items-center gap-2 rounded-full bg-neutral px-6 text-[16px] font-bold text-on-neutral transition-transform hover:-translate-y-0.5"
          >
            احجز هذه الخدمة
            <ArrowLeft className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="absolute inset-x-10 bottom-5 flex gap-1.5" aria-hidden="true">
          {SERVICES.map((sv, i) => (
            <span key={sv.title} className={cn('h-1 flex-1 rounded-full transition-colors duration-300', i === active ? 'bg-brand-500' : 'bg-surface-3')} />
          ))}
        </div>
      </div>
    </div>
  );
}
