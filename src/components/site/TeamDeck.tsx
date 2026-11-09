'use client';
import { useRef, useState } from 'react';
import { RotateCw, Wrench } from 'lucide-react';
import { cn } from '../ui/cn';

export interface TeamCard {
  id: string;
  name: string;
  title: string;
  specialty: string | null;
  years: number | null;
}

const MAX_YEARS = 25;

/** بطاقات الفريق: تميل مع المؤشر، وتنقلب بالنقر لتكشف التخصص وعدّاد سنوات الخبرة. */
export function TeamDeck({ team }: { team: TeamCard[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {team.map((m, i) => (
        <MemberCard key={m.id} m={m} index={i} />
      ))}
    </div>
  );
}

function MemberCard({ m, index }: { m: TeamCard; index: number }) {
  const [flipped, setFlipped] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  function tilt(e: React.MouseEvent) {
    const el = ref.current;
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--ry', `${x * 14}deg`);
    el.style.setProperty('--rx', `${-y * 12}deg`);
    el.style.setProperty('--gx', `${(x + 0.5) * 100}%`);
    el.style.setProperty('--gy', `${(y + 0.5) * 100}%`);
  }
  function reset() {
    ref.current?.style.setProperty('--ry', '0deg');
    ref.current?.style.setProperty('--rx', '0deg');
  }

  const years = Math.min(m.years ?? 0, MAX_YEARS);
  const angle = -90 + (years / MAX_YEARS) * 180;
  const initial = m.name.replace(/^م\.\s*/, '').trim().charAt(0);

  return (
    <div className="flip-scene reveal" style={{ transitionDelay: `${index * 80}ms` }}>
      <button
        ref={ref}
        type="button"
        onClick={() => setFlipped((f) => !f)}
        onMouseMove={tilt}
        onMouseLeave={reset}
        aria-pressed={flipped}
        aria-label={`${m.name}، ${m.title}. انقر لعرض ${flipped ? 'الوجه الأمامي' : 'التخصص وسنوات الخبرة'}`}
        data-flipped={flipped}
        className="flip-card block h-[340px] w-full cursor-pointer rounded-[26px] text-start focus-visible:outline-none focus-visible:shadow-focus"
      >
        {/* الوجه الأمامي */}
        <div className="flip-face flex flex-col border border-line bg-surface shadow-2 dark:bg-ink-900">
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 [button:hover_&]:opacity-100"
            style={{ background: 'radial-gradient(260px circle at var(--gx,50%) var(--gy,50%), rgba(254,97,17,.16), transparent 65%)' }}
            aria-hidden="true"
          />
          <div className="relative grid flex-1 place-items-center">
            <svg viewBox="0 0 200 200" className="spin-slow absolute size-60 text-brand-500/10" aria-hidden="true">
              <path
                fill="currentColor"
                d="M100 30l9 18 20-4 4 20 19 8-7 19 14 15-15 14 7 19-19 8-4 20-20-4-9 18-9-18-20 4-4-20-19-8 7-19-14-15 14-14-7-19 19-8 4-20 20 4zM100 70a30 30 0 100 60 30 30 0 000-60z"
              />
            </svg>
            <span className="relative grid size-28 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-800 font-display text-[54px] font-bold text-white shadow-brand ring-8 ring-surface dark:ring-ink-900">
              {initial}
            </span>
          </div>
          <div className="relative p-5 pt-0 text-center">
            <h3 className="text-[20px] font-bold leading-tight">{m.name}</h3>
            <p className="mt-1 text-[15px] font-semibold text-fg-brand">{m.title}</p>
            <span className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-fg-tertiary">
              <RotateCw className="size-3.5" aria-hidden="true" />
              انقر للتعرّف أكثر
            </span>
          </div>
        </div>

        {/* الوجه الخلفي */}
        <div className="flip-face flip-back flex flex-col bg-gradient-to-br from-brand-600 to-brand-900 p-6 text-white shadow-3">
          <Wrench className="pointer-events-none absolute -bottom-6 -start-6 size-36 -rotate-12 text-white/10" aria-hidden="true" />
          <p className="text-[13px] font-semibold text-white/75">{m.title}</p>
          <h3 className="text-[20px] font-bold leading-tight">{m.name}</h3>
          <div className="relative mx-auto mt-4 w-40">
            <svg viewBox="0 0 120 70" className="w-full" aria-hidden="true">
              <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="9" strokeLinecap="round" />
              <path
                d="M10 60 A50 50 0 0 1 110 60"
                fill="none"
                stroke="#fff"
                strokeWidth="9"
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray={`${flipped ? (years / MAX_YEARS) * 100 : 0} 100`}
                style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(.34,1.36,.64,1) .25s' }}
              />
              <g className="gauge-needle" style={{ transform: `rotate(${flipped ? angle : -90}deg)`, transformOrigin: '60px 60px' }}>
                <line x1="60" y1="60" x2="60" y2="22" stroke="#ffd0a8" strokeWidth="3" strokeLinecap="round" />
              </g>
              <circle cx="60" cy="60" r="6" fill="#fff" />
            </svg>
            <div className="-mt-1 text-center">
              <b className="font-display text-[34px] leading-none tabular-nums">{m.years ?? '—'}</b>
              <span className="block text-[12px] text-white/75">سنة خبرة</span>
            </div>
          </div>
          <p className={cn('mt-auto text-[14px] leading-6 text-white/90', !m.specialty && 'text-white/60')}>{m.specialty || 'عضو في فريق مركز بساتم'}</p>
        </div>
      </button>
    </div>
  );
}
