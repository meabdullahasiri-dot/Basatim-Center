import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { cn } from './cn';

const tones = {
  brand: 'bg-primary-tint text-icon-brand',
  positive: 'bg-positive-soft text-fg-positive',
  danger: 'bg-danger-soft text-fg-danger',
  info: 'bg-info-soft text-fg-info',
  warning: 'bg-warning-soft text-fg-warning',
};

export function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = 'brand',
  href,
  emphasis,
}: {
  label: string;
  value: React.ReactNode;
  detail?: React.ReactNode;
  icon: LucideIcon;
  tone?: keyof typeof tones;
  href?: string;
  emphasis?: boolean;
}) {
  const body = (
    <div
      className={cn(
        'relative h-full overflow-hidden rounded-card p-4 shadow-2 transition-[transform,box-shadow] duration-[var(--dur-fast)] sm:p-5',
        emphasis ? 'bg-ink-950 text-white dark:bg-surface-3' : 'bg-surface',
        href && 'hover:-translate-y-px hover:shadow-3',
      )}
    >
      {emphasis && <div className="pointer-events-none absolute -top-16 -start-10 size-48 rounded-full bg-brand-500/25 blur-3xl" aria-hidden="true" />}
      <div className="relative flex items-start justify-between gap-3">
        <span className={cn('text-subheadline font-medium', emphasis ? 'text-ink-300' : 'text-fg-secondary')}>{label}</span>
        <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl rounded-es-sig', emphasis ? 'bg-brand-600 text-white' : tones[tone])}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      <div className="relative mt-2 text-title-2 sm:text-numeric num text-start">{value}</div>
      {detail && <div className={cn('relative mt-1 text-footnote', emphasis ? 'text-ink-300' : 'text-fg-tertiary')}>{detail}</div>}
    </div>
  );
  return href ? (
    <Link href={href} className="block rounded-card focus-visible:shadow-focus">
      {body}
    </Link>
  ) : (
    body
  );
}
