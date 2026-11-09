'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Printer, X } from 'lucide-react';
import { Button } from '../ui/Button';

/** شريط أعلى صفحة الطباعة (لا يُطبع). */
export function PrintToolbar({ title }: { title: string }) {
  const router = useRouter();
  useEffect(() => {
    document.title = title;
  }, [title]);
  const close = () => {
    window.close();
    window.setTimeout(() => {
      if (window.closed) return;
      if (window.history.length > 1) router.back();
      else router.push('/dashboard');
    }, 200);
  };
  return (
    <div className="no-print sticky top-0 z-10 flex items-center justify-between gap-3 bg-ink-900 px-4 py-3 text-white">
      <p className="truncate text-callout font-medium">{title}</p>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => window.print()}>
          <Printer aria-hidden="true" />
          طباعة / حفظ PDF
        </Button>
        <Button size="sm" variant="ghost" className="text-ink-200 hover:bg-white/10 hover:text-white" onClick={close}>
          <X aria-hidden="true" />
          إغلاق
        </Button>
      </div>
    </div>
  );
}
