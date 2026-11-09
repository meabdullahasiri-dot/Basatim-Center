import { cn } from './cn';

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-x-auto rounded-card bg-surface shadow-2', className)}>
      <table className="w-full min-w-[640px] border-collapse text-body">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={cn('bg-surface-2 px-4 py-2.5 text-start text-caption font-semibold text-fg-secondary first:rounded-ss-card last:rounded-se-card', className)}>{children}</th>;
}

export function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn('border-t border-line px-4 py-2.5 align-middle', className)}>{children}</td>;
}
