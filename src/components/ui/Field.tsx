import React from 'react';
import { cn } from './cn';

const control =
  'w-full rounded-xl bg-field px-3 text-body text-fg placeholder:text-fg-tertiary transition-[background-color,box-shadow] duration-[var(--dur-fast)] hover:bg-field-hover focus:bg-surface focus:outline-none focus:shadow-[inset_0_0_0_1px_var(--border-focus),var(--bs-shadow-focus)] disabled:opacity-60 aria-[invalid=true]:shadow-[inset_0_0_0_1px_var(--border-danger)]';

export function Label({ children, htmlFor, required, className }: { children: React.ReactNode; htmlFor?: string; required?: boolean; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={cn('mb-1.5 block text-subheadline font-medium text-fg-secondary', className)}>
      {children}
      {required && <span className="ms-0.5 text-fg-danger" aria-hidden="true">*</span>}
    </label>
  );
}

export function TextInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, 'h-10 pointer-coarse:h-touch', className)} {...props} />;
}

export function TextArea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, 'min-h-24 py-2.5 leading-7', className)} {...props} />;
}

export function SelectInput({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(control, 'h-10 cursor-pointer pe-8 pointer-coarse:h-touch', className)} {...props}>
      {children}
    </select>
  );
}

export function Field({
  label,
  name,
  required,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label htmlFor={name} required={required}>
        {label}
      </Label>
      {children}
      {error ? <p className="mt-1 text-footnote text-fg-danger">{error}</p> : hint ? <p className="mt-1 text-footnote text-fg-tertiary">{hint}</p> : null}
    </div>
  );
}

export function Checkbox({ label, hint, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl p-2 hover:bg-surface-2">
      <input type="checkbox" className="mt-1 size-4 shrink-0 cursor-pointer accent-[var(--bg-brand)]" {...props} />
      <span>
        <span className="block text-callout font-medium text-fg">{label}</span>
        {hint && <span className="block text-footnote text-fg-tertiary">{hint}</span>}
      </span>
    </label>
  );
}
