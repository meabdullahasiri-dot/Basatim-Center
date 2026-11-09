'use client';
import { useEffect, useRef, useState } from 'react';
import { CarFront } from 'lucide-react';
import { STEPS } from '@/config/site';
import { cn } from '../ui/cn';

/** رحلة السيارة: أربع محطات على طريق، وسيارة تتحرك إلى المحطة النشطة. */
export function HowSteps() {
  const [active, setActive] = useState(0);
  const paused = useRef(false);
  const n = STEPS.length;

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => {
      if (!paused.current) setActive((a) => (a + 1) % n);
    }, 3200);
    return () => window.clearInterval(id);
  }, [n]);

  const pos = (i: number) => `${(i / (n - 1)) * 100}%`;

  return (
    <div onMouseEnter={() => (paused.current = true)} onMouseLeave={() => (paused.current = false)}>
      {/* الطريق */}
      <div className="relative mx-6 mt-14 h-16 sm:mx-10">
        <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-surface-3" />
        <div className="absolute start-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-l from-brand-400 to-brand-600 transition-[width] duration-[900ms] ease-[cubic-bezier(.65,0,.35,1)]" style={{ width: pos(active) }} />
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 border-t-2 border-dashed border-white/60 dark:border-white/20" />
        {STEPS.map((st, i) => (
          <button
            key={st.title}
            type="button"
            onClick={() => setActive(i)}
            onMouseEnter={() => setActive(i)}
            aria-label={st.title}
            aria-current={i === active ? 'step' : undefined}
            className={cn(
              'absolute top-1/2 grid size-11 -translate-y-1/2 translate-x-1/2 cursor-pointer place-items-center rounded-full border-4 font-display text-[17px] font-bold transition-all duration-500',
              i <= active ? 'border-brand-500 bg-brand-600 text-white' : 'border-surface-3 bg-surface text-fg-tertiary',
              i === active && 'scale-110 shadow-brand',
            )}
            style={{ insetInlineStart: pos(i) }}
          >
            {i + 1}
          </button>
        ))}
        <div className="step-car pointer-events-none absolute -top-9 translate-x-1/2" style={{ insetInlineStart: pos(active) }} aria-hidden="true">
          <span className="grid size-10 -scale-x-100 place-items-center rounded-xl bg-neutral text-on-neutral shadow-3">
            <CarFront className="size-5" />
          </span>
        </div>
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-4">
        {STEPS.map((st, i) => (
          <button
            key={st.title}
            type="button"
            onClick={() => setActive(i)}
            onMouseEnter={() => setActive(i)}
            className={cn(
              'cursor-pointer rounded-2xl p-4 text-start transition-all duration-300',
              i === active ? 'bg-surface shadow-3 md:-translate-y-1' : 'opacity-60 hover:opacity-100',
            )}
          >
            <span className="text-[13px] font-bold text-fg-brand">الخطوة {i + 1}</span>
            <h3 className="mt-1 text-[20px] font-bold">{st.title}</h3>
            <p className={cn('mt-1 text-[15px] leading-7 text-fg-secondary', i !== active && 'max-md:hidden')}>{st.text}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
