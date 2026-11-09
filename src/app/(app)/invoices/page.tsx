import type { Metadata } from 'next';
import Link from 'next/link';
import { and, desc, eq, ilike, or, sql, type SQL } from 'drizzle-orm';
import { Plus, ReceiptText } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { buttonClasses } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, Td, Th } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterPills, SearchBar } from '@/components/ui/SearchBar';
import { INVOICE_STATUS } from '@/domain/labels';
import { formatAmount } from '@/domain/money';
import { requirePage } from '@/server/auth/session';
import { getDb } from '@/server/db/client';
import { invoices } from '@/server/db/schema';
import { fmtDate } from '@/lib/format';

export const metadata: Metadata = { title: 'الفواتير' };

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  await requirePage('invoices');
  const { q, status } = await searchParams;
  const where: SQL[] = [];
  if (status && status in INVOICE_STATUS) where.push(eq(invoices.status, status as 'paid'));
  if (q?.trim()) {
    const like = `%${q.trim()}%`;
    where.push(or(ilike(invoices.number, like), ilike(invoices.customerName, like), ilike(invoices.customerPhone, like), ilike(invoices.plateNumber, like))!);
  }
  const rows = await getDb()
    .select()
    .from(invoices)
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(invoices.issuedAt))
    .limit(200);
  const [sum] = await getDb()
    .select({ total: sql<number>`coalesce(sum(${invoices.total}),0)::bigint`, due: sql<number>`coalesce(sum(${invoices.total} - ${invoices.paid}),0)::bigint` })
    .from(invoices)
    .where(sql`${invoices.status} <> 'void'`);

  return (
    <>
      <PageHeader
        title="الفواتير"
        description={`إجمالي الفواتير ${formatAmount(Number(sum.total))} ر.س · المستحق على العملاء ${formatAmount(Number(sum.due))} ر.س`}
        actions={
          <Link href="/invoices/new" className={buttonClasses('primary')}>
            <Plus aria-hidden="true" />
            فاتورة جديدة
          </Link>
        }
      />
      <SearchBar q={q} placeholder="ابحث برقم الفاتورة أو اسم العميل أو الجوال أو اللوحة">
        {status && <input type="hidden" name="status" value={status} />}
      </SearchBar>
      <FilterPills base="/invoices" current={status} extra={{ q }} options={Object.entries(INVOICE_STATUS).map(([value, v]) => ({ value, label: v.label }))} />
      {rows.length === 0 ? (
        <div className="rounded-card bg-surface shadow-2">
          <EmptyState
            icon={ReceiptText}
            title={q || status ? 'لا توجد نتائج' : 'لا توجد فواتير بعد'}
            description={q || status ? 'جرّب كلمة بحث أخرى.' : 'أصدر أول فاتورة للمركز، وستُسجّل دفعاتها في الإيرادات تلقائياً.'}
            action={
              !q && !status ? (
                <Link href="/invoices/new" className={buttonClasses('primary')}>
                  <Plus aria-hidden="true" />
                  فاتورة جديدة
                </Link>
              ) : undefined
            }
          />
        </div>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>رقم الفاتورة</Th>
              <Th>التاريخ</Th>
              <Th>العميل</Th>
              <Th>السيارة</Th>
              <Th>الإجمالي</Th>
              <Th>المتبقي</Th>
              <Th>الحالة</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="transition-colors hover:bg-surface-hover">
                <Td>
                  <Link href={`/invoices/${r.id}`} className="font-semibold text-fg-brand num hover:underline">
                    {r.number}
                  </Link>
                </Td>
                <Td className="text-fg-secondary">{fmtDate(r.issuedAt)}</Td>
                <Td>
                  <div className="font-medium">{r.customerName}</div>
                  {r.customerPhone && <div className="text-footnote text-fg-tertiary num">{r.customerPhone}</div>}
                </Td>
                <Td className="text-fg-secondary">{[r.carMake, r.carModel, r.plateNumber].filter(Boolean).join(' · ') || '—'}</Td>
                <Td className="font-semibold num">{formatAmount(r.total)}</Td>
                <Td className="num">{r.status === 'void' ? '—' : formatAmount(r.total - r.paid)}</Td>
                <Td>
                  <Badge tone={INVOICE_STATUS[r.status].tone}>{INVOICE_STATUS[r.status].label}</Badge>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
