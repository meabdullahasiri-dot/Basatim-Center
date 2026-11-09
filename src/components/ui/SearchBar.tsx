import { Search } from 'lucide-react';
import Link from 'next/link';
import { cn } from './cn';

export function SearchBar({ q, placeholder, children }: { q?: string; placeholder: string; children?: React.ReactNode }) {
  return (
    <form className="mb-4 flex flex-wrap items-center gap-2" role="search">
      <label className="relative min-w-60 flex-1">
        <span className="sr-only">بحث</span>
        <Search className="pointer-events-none absolute start-3.5 top-1/2 size-[18px] -translate-y-1/2 text-icon-secondary" aria-hidden="true" />
        <input
          name="q"
          defaultValue={q}
          placeholder={placeholder}
          className="h-10 w-full rounded-full bg-surface ps-10 pe-4 text-body shadow-1 placeholder:text-fg-tertiary focus:outline-none focus:shadow-focus"
        />
      </label>
      {children}
    </form>
  );
}

export function FilterPills({ base, current, options, extra = {} }: { base: string; current?: string; options: { value: string; label: string }[]; extra?: Record<string, string | undefined> }) {
  const make = (v: string) => {
    const p = new URLSearchParams();
    Object.entries(extra).forEach(([k, val]) => val && p.set(k, val));
    if (v) p.set('status', v);
    const s = p.toString();
    return s ? `${base}?${s}` : base;
  };
  return (
    <div className="mb-4 flex flex-wrap gap-1.5">
      {[{ value: '', label: 'الكل' }, ...options].map((o) => (
        <Link
          key={o.value}
          href={make(o.value)}
          className={cn(
            'rounded-full px-3.5 py-1.5 text-subheadline font-medium transition-colors',
            (current ?? '') === o.value ? 'bg-neutral text-on-neutral' : 'bg-surface text-fg-secondary shadow-1 hover:text-fg',
          )}
        >
          {o.label}
        </Link>
      ))}
    </div>
  );
}
