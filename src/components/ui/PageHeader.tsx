import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function PageHeader({ title, description, actions, back }: { title: string; description?: string; actions?: React.ReactNode; back?: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {back && (
          <Link href={back} className="mb-2 inline-flex items-center gap-1 text-subheadline font-medium text-fg-brand hover:underline">
            <ArrowRight className="size-4" aria-hidden="true" />
            رجوع
          </Link>
        )}
        <h1 className="text-title-2 text-fg">{title}</h1>
        {description && <p className="mt-1 text-callout text-fg-secondary">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
