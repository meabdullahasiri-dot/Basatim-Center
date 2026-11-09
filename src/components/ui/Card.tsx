import React from 'react';
import { cn } from './cn';

export function Card({ className, flat, ...props }: React.HTMLAttributes<HTMLDivElement> & { flat?: boolean }) {
  return <div className={cn('rounded-card bg-surface p-4 sm:p-5', flat ? 'bg-surface-2' : 'shadow-2', className)} {...props} />;
}

export function CardTitle({ children, action, className }: { children: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mb-4 flex items-center justify-between gap-3', className)}>
      <h2 className="text-headline text-fg">{children}</h2>
      {action}
    </div>
  );
}
