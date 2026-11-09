import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { InvoiceDocument } from '@/components/docs/InvoiceDocument';
import { PrintToolbar } from '@/components/print/PrintToolbar';
import { requirePage } from '@/server/auth/session';
import { getDb } from '@/server/db/client';
import { invoices } from '@/server/db/schema';
import { getSettings } from '@/server/settings';

export default async function PrintInvoice({ params }: { params: Promise<{ id: string }> }) {
  await requirePage('invoices');
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const [inv] = await getDb().select().from(invoices).where(eq(invoices.id, id));
  if (!inv) notFound();
  const s = await getSettings();
  return (
    <>
      <PrintToolbar title={`فاتورة ${inv.number}`} />
      <InvoiceDocument inv={inv} s={s} />
    </>
  );
}
