import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { asc, eq } from 'drizzle-orm';
import { Printer, Plus, MessageCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { buttonClasses } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardTitle } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { InvoiceDocument } from '@/components/docs/InvoiceDocument';
import { PaymentForm, VoidForm } from '@/components/docs/InvoiceActions';
import { INVOICE_STATUS, PAYMENT_METHODS } from '@/domain/labels';
import { formatAmount, halalasToNumberString } from '@/domain/money';
import { can } from '@/domain/permissions';
import { requirePage } from '@/server/auth/session';
import { getDb } from '@/server/db/client';
import { invoices, transactions } from '@/server/db/schema';
import { getSettings } from '@/server/settings';
import { fmtDate } from '@/lib/format';
import { waLink } from '@/lib/whatsapp';

export const metadata: Metadata = { title: 'الفاتورة' };

export default async function InvoicePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const user = await requirePage('invoices');
  const { id } = await params;
  const { created } = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const db = getDb();
  const [inv] = await db.select().from(invoices).where(eq(invoices.id, id));
  if (!inv) notFound();
  const s = await getSettings();
  const payments = await db.select().from(transactions).where(eq(transactions.invoiceId, id)).orderBy(asc(transactions.createdAt));
  const st = INVOICE_STATUS[inv.status];
  const remaining = inv.total - inv.paid;
  const wa = inv.customerPhone
    ? waLink(
        inv.customerPhone,
        `مرحباً ${inv.customerName}،\nفاتورتكم رقم ${inv.number} من ${s.centerName}\nالإجمالي: ${formatAmount(inv.total)} ر.س${remaining > 0 && inv.status !== 'void' ? `\nالمتبقي: ${formatAmount(remaining)} ر.س` : ''}\nشكراً لثقتكم.`,
      )
    : null;

  return (
    <>
      <PageHeader
        title={`فاتورة ${inv.number}`}
        description={`${inv.customerName} · ${fmtDate(inv.issuedAt)}`}
        back="/invoices"
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
            <Link href={`/print/invoice/${inv.id}`} target="_blank" className={buttonClasses('primary')}>
              <Printer aria-hidden="true" />
              طباعة / PDF
            </Link>
          </>
        }
      />
      {created && <Alert tone="positive" className="mb-4">صدرت الفاتورة {inv.number}.</Alert>}
      {inv.status === 'void' && <Alert tone="warning" className="mb-4">هذه الفاتورة ملغاة. السبب: {inv.voidReason}</Alert>}
      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="overflow-x-auto rounded-card bg-ink-200 px-4 dark:bg-surface-2">
          <div className="w-fit min-w-full">
            <InvoiceDocument inv={inv} s={s} />
          </div>
        </div>
        <div className="space-y-4">
          {inv.status !== 'void' && remaining > 0 && (
            <Card>
              <CardTitle>تسجيل دفعة</CardTitle>
              <p className="-mt-2 mb-3 text-callout text-fg-secondary">
                المتبقي: <b className="num text-fg-danger">{formatAmount(remaining)} ر.س</b>
              </p>
              <PaymentForm invoiceId={inv.id} remaining={halalasToNumberString(remaining)} />
            </Card>
          )}
          <Card>
            <CardTitle>الدفعات</CardTitle>
            {payments.length === 0 ? (
              <p className="text-callout text-fg-tertiary">لا توجد دفعات مسجلة.</p>
            ) : (
              <ul className="divide-y divide-line">
                {payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-2 text-callout">
                    <span>
                      <span className="block">{PAYMENT_METHODS[p.method] ?? p.method}</span>
                      <span className="text-footnote text-fg-tertiary num">{fmtDate(p.date)}</span>
                    </span>
                    <b className="num text-fg-positive">+{formatAmount(p.amount)}</b>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Link href="/invoices/new" className={buttonClasses('outline', 'md', 'w-full')}>
            <Plus aria-hidden="true" />
            فاتورة جديدة
          </Link>
          {can(user, 'manage') && inv.status !== 'void' && <VoidForm invoiceId={inv.id} />}
        </div>
      </div>
    </>
  );
}
