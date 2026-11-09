import { PrintFit } from '@/components/print/PrintFit';
import { requirePage } from '@/server/auth/session';

/** إطار صفحات الطباعة: بلا قائمة جانبية، وخلف تسجيل الدخول. */
export default async function PrintLayout({ children }: { children: React.ReactNode }) {
  await requirePage();
  return (
    <div className="min-h-screen bg-ink-200 pb-8 text-start print:bg-white print:pb-0">
      {children}
      <PrintFit />
    </div>
  );
}
