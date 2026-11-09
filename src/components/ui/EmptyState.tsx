import type { LucideIcon } from 'lucide-react';

export function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-4 py-12 text-center">
      <span className="grid size-16 place-items-center rounded-2xl rounded-es-sig bg-primary-tint text-icon-brand">
        <Icon className="size-7" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-headline text-fg">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-callout text-fg-secondary">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
