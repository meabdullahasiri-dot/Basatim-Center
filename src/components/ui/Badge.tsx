import { cn } from './cn';

export type Tone = 'positive' | 'warning' | 'danger' | 'neutral' | 'info' | 'brand';

const tones: Record<Tone, string> = {
  positive: 'bg-positive-soft text-fg-positive',
  warning: 'bg-warning-soft text-fg-warning',
  danger: 'bg-danger-soft text-fg-danger',
  info: 'bg-info-soft text-fg-info',
  neutral: 'bg-surface-3 text-fg-secondary',
  brand: 'bg-primary-tint text-fg-brand',
};

export function Badge({ tone = 'neutral', children, dot, className }: { tone?: Tone; children: React.ReactNode; dot?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-caption font-semibold', tones[tone], className)}>
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}
