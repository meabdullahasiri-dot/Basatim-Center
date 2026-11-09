'use client';
import { Printer, X } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '../ui/Button';

export function PrintToolbar({ title }: { title: string }) {
  useEffect(() => {
    document.title = title;
  }, [title]);
  return (
    <div className="no-print sticky top-0 z-10 mb-4 flex items-center justify-between gap-3 bg-material px-4 py-3 backdrop-blur-xl">
      <span className="text-callout text-fg-secondary">اختر «حفظ كملف PDF» من نافذة الطباعة لحفظ نسخة إلكترونية.</span>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => window.close()}>
          <X aria-hidden="true" />
          إغلاق
        </Button>
        <Button onClick={() => window.print()}>
          <Printer aria-hidden="true" />
          طباعة
        </Button>
      </div>
    </div>
  );
}
