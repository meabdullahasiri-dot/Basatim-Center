import { CircleAlert, CircleCheck, Info } from 'lucide-react';
import { cn } from './cn';

export function Alert({ tone = 'info', children, className }: { tone?: 'info' | 'danger' | 'positive' | 'warning'; children: React.ReactNode; className?: string }) {
  const Icon = tone === 'positive' ? CircleCheck : tone === 'info' ? Info : CircleAlert;
  const tones = {
    info: 'bg-info-soft text-fg-info',
    danger: 'bg-danger-soft text-fg-danger',
    positive: 'bg-positive-soft text-fg-positive',
    warning: 'bg-warning-soft text-fg-warning',
  };
  return (
    <div role={tone === 'danger' ? 'alert' : 'status'} className={cn('flex items-start gap-2.5 rounded-2xl px-4 py-3 text-callout', tones[tone], className)}>
      <Icon className="mt-0.5 size-[18px] shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
