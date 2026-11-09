import type { Metadata } from 'next';
import { eq } from 'drizzle-orm';
import { InvoiceForm } from '@/components/docs/InvoiceForm';
import { PageHeader } from '@/components/ui/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { halalasToNumberString, formatQty } from '@/domain/money';
import { requirePage } from '@/server/auth/session';
import { getDb } from '@/server/db/client';
import { agreements } from '@/server/db/schema';
import { getSettings } from '@/server/settings';

export const metadata: Metadata = { title: 'فاتورة جديدة' };

export default async function NewInvoicePage({ searchParams }: { searchParams: Promise<{ agreement?: string }> }) {
  await requirePage('invoices');
  const s = await getSettings();
  const { agreement } = await searchParams;
  const ag = agreement && /^[0-9a-f-]{36}$/.test(agreement) ? (await getDb().select().from(agreements).where(eq(agreements.id, agreement)))[0] : undefined;
  return (
    <>
      <PageHeader title="فاتورة جديدة" description={s.vatEnabled ? `فاتورة ضريبية مبسطة — ضريبة القيمة المضافة ${s.vatRate}%` : 'فاتورة صيانة'} back="/invoices" />
      {ag && (
        <Alert tone="info" className="mb-4">
          البيانات منقولة من اتفاقية العمل <b className="num">{ag.number}</b>. راجع البنود والأسعار قبل الإصدار.
        </Alert>
      )}
      <InvoiceForm
        vatRate={s.vatEnabled ? s.vatRate : 0}
        defaults={ag}
        agreementId={ag?.id}
        paidDefault={ag && ag.deposit > 0 ? halalasToNumberString(ag.deposit) : undefined}
        items={ag?.items.map((i) => ({ description: i.description, kind: i.kind, qty: formatQty(i.qty), unitPrice: halalasToNumberString(i.unitPrice) }))}
      />
    </>
  );
}
