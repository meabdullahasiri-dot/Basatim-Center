import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { MessageCircle, Printer, ReceiptText } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { buttonClasses } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardTitle } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { cn } from '@/components/ui/cn';
import { AgreementDocument } from '@/components/docs/AgreementDocument';
import { AGREEMENT_STATUS } from '@/domain/labels';
import { formatAmount } from '@/domain/money';
import { can } from '@/domain/permissions';
import { setAgreementStatusAction } from '@/server/actions/agreements';
import { requirePage } from '@/server/auth/session';
import { getDb } from '@/server/db/client';
import { agreements, invoices } from '@/server/db/schema';
import { getSettings } from '@/server/settings';
import { waLink } from '@/lib/whatsapp';

export const metadata: Metadata = { title: 'اتفاقية العمل' };

export default async function AgreementPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const user = await requirePage('agreements');
  const { id } = await params;
  const { created } = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const db = getDb();
  const [ag] = await db.select().from(agreements).where(eq(agreements.id, id));
  if (!ag) notFound();
  const s = await getSettings();
  const linked = await db.select({ id: invoices.id, number: invoices.number }).from(invoices).where(eq(invoices.agreementId, id));
  const st = AGREEMENT_STATUS[ag.status];
  const setStatus = setAgreementStatusAction.bind(null, ag.id);
  const wa = ag.customerPhone
    ? waLink(ag.customerPhone, `مرحباً ${ag.customerName}،\nتم استلام سيارتكم في ${s.centerName}\nرقم الاتفاقية: ${ag.number}\nالتكلفة التقديرية: ${formatAmount(ag.estimatedTotal)} ر.س\nسنبلغكم فور الانتهاء.`)
    : null;

  return (
    <>
      <PageHeader
        title={`اتفاقية ${ag.number}`}
        description={ag.customerName}
        back="/agreements"
        actions={
          <>
            <Badge tone={st.tone} dot>
              {st.label}
            </Badge>
            {wa && (
              <a href={wa} target="_blank" rel="noopener" className={buttonClasses('outline')}>
                <MessageCircle aria-hidden="true" />
                واتساب
              </a>
            )}
            <Link href={`/print/agreement/${ag.id}`} target="_blank" className={buttonClasses('primary')}>
              <Printer aria-hidden="true" />
              طباعة للتوقيع
            </Link>
          </>
        }
      />
      {created && <Alert tone="positive" className="mb-4">حُفظت الاتفاقية {ag.number}. اطبعها ليوقّع العميل.</Alert>}
      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            <AgreementDocument ag={ag} s={s} />
          </div>
        </div>
        <div className="space-y-4">
          <Card>
            <CardTitle>حالة العمل</CardTitle>
            <form action={setStatus} className="grid grid-cols-2 gap-2">
              {Object.entries(AGREEMENT_STATUS).map(([k, v]) => (
                <button
                  key={k}
                  name="status"
                  value={k}
                  type="submit"
                  className={cn(
                    'h-10 cursor-pointer rounded-xl text-callout font-semibold transition-colors',
                    ag.status === k ? 'bg-neutral text-on-neutral' : 'bg-surface-2 text-fg-secondary hover:bg-surface-3',
                  )}
                >
                  {v.label}
                </button>
              ))}
            </form>
          </Card>
          <Card>
            <CardTitle>الفاتورة</CardTitle>
            {linked.length ? (
              <ul className="space-y-2">
                {linked.map((l) => (
                  <li key={l.id}>
                    <Link href={`/invoices/${l.id}`} className="font-semibold text-fg-brand num hover:underline">
                      {l.number}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : can(user, 'invoices') ? (
              <>
                <p className="mb-3 text-callout text-fg-secondary">عند الانتهاء من العمل، حوّل الاتفاقية إلى فاتورة بنقرة واحدة. تُنقل البنود والعربون تلقائياً.</p>
                <Link href={`/invoices/new?agreement=${ag.id}`} className={buttonClasses('primary', 'md', 'w-full')}>
                  <ReceiptText aria-hidden="true" />
                  تحويل إلى فاتورة
                </Link>
              </>
            ) : (
              <p className="text-callout text-fg-tertiary">لم تصدر فاتورة بعد.</p>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
