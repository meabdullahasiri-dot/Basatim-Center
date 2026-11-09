import type { Metadata } from 'next';
import Link from 'next/link';
import { and, desc, eq, ilike, or, type SQL } from 'drizzle-orm';
import { FileSignature, Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { buttonClasses } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, Td, Th } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterPills, SearchBar } from '@/components/ui/SearchBar';
import { AGREEMENT_STATUS } from '@/domain/labels';
import { formatAmount } from '@/domain/money';
import { requirePage } from '@/server/auth/session';
import { getDb } from '@/server/db/client';
import { agreements } from '@/server/db/schema';
import { fmtDate } from '@/lib/format';

export const metadata: Metadata = { title: 'اتفاقيات العمل' };

export default async function AgreementsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  await requirePage('agreements');
  const { q, status } = await searchParams;
  const where: SQL[] = [];
  if (status && status in AGREEMENT_STATUS) where.push(eq(agreements.status, status as 'open'));
  if (q?.trim()) {
    const like = `%${q.trim()}%`;
    where.push(or(ilike(agreements.number, like), ilike(agreements.customerName, like), ilike(agreements.customerPhone, like), ilike(agreements.plateNumber, like))!);
  }
  const rows = await getDb()
    .select()
    .from(agreements)
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(agreements.createdAt))
    .limit(200);
  return (
    <>
      <PageHeader
        title="اتفاقيات العمل"
        description="أوامر الإصلاح التي يوقّعها العميل عند استلام سيارته، وتتحول إلى فاتورة عند الانتهاء."
        actions={
          <Link href="/agreements/new" className={buttonClasses('primary')}>
            <Plus aria-hidden="true" />
            اتفاقية جديدة
          </Link>
        }
      />
      <SearchBar q={q} placeholder="ابحث برقم الاتفاقية أو العميل أو الجوال أو اللوحة">
        {status && <input type="hidden" name="status" value={status} />}
      </SearchBar>
      <FilterPills base="/agreements" current={status} extra={{ q }} options={Object.entries(AGREEMENT_STATUS).map(([value, v]) => ({ value, label: v.label }))} />
      {rows.length === 0 ? (
        <div className="rounded-card bg-surface shadow-2">
          <EmptyState
            icon={FileSignature}
            title={q || status ? 'لا توجد نتائج' : 'لا توجد اتفاقيات بعد'}
            description={q || status ? 'جرّب كلمة بحث أخرى.' : 'سجّل استلام سيارة العميل وما اتفقتم عليه، واطبعها ليوقّع عليها.'}
            action={
              !q && !status ? (
                <Link href="/agreements/new" className={buttonClasses('primary')}>
                  <Plus aria-hidden="true" />
                  اتفاقية جديدة
                </Link>
              ) : undefined
            }
          />
        </div>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>الرقم</Th>
              <Th>التاريخ</Th>
              <Th>العميل</Th>
              <Th>السيارة</Th>
              <Th>الفني</Th>
              <Th>التكلفة التقديرية</Th>
              <Th>الحالة</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="transition-colors hover:bg-surface-hover">
                <Td>
                  <Link href={`/agreements/${r.id}`} className="font-semibold text-fg-brand num hover:underline">
                    {r.number}
                  </Link>
                </Td>
                <Td className="text-fg-secondary">{fmtDate(r.date)}</Td>
                <Td className="font-medium">{r.customerName}</Td>
                <Td className="text-fg-secondary">{[r.carMake, r.carModel, r.plateNumber].filter(Boolean).join(' · ') || '—'}</Td>
                <Td className="text-fg-secondary">{r.technician || '—'}</Td>
                <Td className="num">{formatAmount(r.estimatedTotal)}</Td>
                <Td>
                  <Badge tone={AGREEMENT_STATUS[r.status].tone}>{AGREEMENT_STATUS[r.status].label}</Badge>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
