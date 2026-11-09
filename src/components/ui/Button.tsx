import React from 'react';
import { cn } from './cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'plain' | 'danger' | 'ghost' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center whitespace-nowrap font-semibold leading-none transition-[background-color,box-shadow,color,transform] duration-[var(--dur-fast)] ease-standard focus-visible:outline-none focus-visible:shadow-focus active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-disabled disabled:text-fg-disabled disabled:shadow-none cursor-pointer select-none';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary shadow-brand hover:bg-primary-hover active:bg-primary-pressed',
  secondary: 'bg-primary-tint text-fg-brand hover:bg-primary-tint-hover',
  outline: 'bg-surface text-fg shadow-[inset_0_0_0_1px_var(--border-default),var(--bs-shadow-1)] hover:bg-surface-hover',
  plain: 'bg-transparent px-2 text-fg-brand hover:bg-primary-tint',
  danger: 'bg-danger text-on-primary hover:bg-danger-hover',
  success: 'bg-positive text-on-primary hover:brightness-110',
  ghost: 'bg-transparent text-fg-secondary hover:bg-field hover:text-fg',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-control-sm rounded-lg px-3 text-subheadline gap-1.5 [&_svg]:size-4',
  md: 'h-10 rounded-xl px-4 text-callout gap-2 [&_svg]:size-[18px] pointer-coarse:h-touch',
  lg: 'h-control-lg rounded-2xl px-6 text-body gap-2 [&_svg]:size-5',
};

export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string): string {
  return cn(base, variants[variant], sizes[size], className);
}

export function Spinner({ className }: { className?: string }) {
  return <span className={cn('inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-e-transparent', className)} aria-hidden="true" />;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export function Button({ children, className, variant = 'primary', size = 'md', isLoading = false, disabled, type = 'button', ...props }: ButtonProps) {
  return (
    <button type={type} className={buttonClasses(variant, size, className)} disabled={disabled || isLoading} aria-busy={isLoading || undefined} {...props}>
      {isLoading && <Spinner />}
      {children}
    </button>
  );
}

export function iconButtonClasses(tone: 'default' | 'danger' | 'filled' = 'default', className?: string): string {
  return cn(
    'inline-flex h-control-md w-control-md shrink-0 items-center justify-center rounded-xl transition-colors duration-[var(--dur-fast)] cursor-pointer focus-visible:outline-none focus-visible:shadow-focus [&_svg]:size-5',
    tone === 'danger' && 'text-fg-danger hover:bg-danger-soft',
    tone === 'filled' && 'bg-primary-tint text-icon-brand hover:bg-primary-tint-hover',
    tone === 'default' && 'text-icon-secondary hover:bg-field hover:text-icon',
    className,
  );
}
