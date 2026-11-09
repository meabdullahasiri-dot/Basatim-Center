import type { Metadata } from 'next';
import Link from 'next/link';
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight, Scale, Trash2, Wallet } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, Td, Th } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { iconButtonClasses, buttonClasses } from '@/components/ui/Button';
import { MonthlyChart } from '@/components/finance/MonthlyChart';
import { TransactionForm } from '@/components/finance/TransactionForm';
import { PAYMENT_METHODS } from '@/domain/labels';
import { formatAmount } from '@/domain/money';
import { can } from '@/domain/permissions';
import { deleteTransactionAction } from '@/server/actions/finance';
import { requirePage } from '@/server/auth/session';
import { getDb } from '@/server/db/client';
import { transactions } from '@/server/db/schema';
import { lastMonths, monthLabel, monthRange, monthTotals, shiftMonth } from '@/server/finance';
import { fmtDate, todayISO } from '@/lib/format';

export const metadata: Metadata = { title: 'الإيرادات والمصروفات' };

export default async function FinancePage({ searchParams }: { searchParams: Promise<{ month?: string; kind?: string }> }) {
  const user = await requirePage('finance');
  const sp = await searchParams;
  const today = todayISO();
  const month = sp.month && /^\d{4}-(0[1-9]|1[0-2])$/.test(sp.month) ? sp.month : today.slice(0, 7);
  const kind = sp.kind === 'income' || sp.kind === 'expense' ? sp.kind : undefined;
  const { from, to } = monthRange(month);
  const db = getDb();
  const [totals, prev, series, rows, byCat] = await Promise.all([
    monthTotals(from, to),
    monthTotals(monthRange(shiftMonth(month, -1)).from, monthRange(shiftMonth(month, -1)).to),
    lastMonths(month, 6),
    db
      .select()
      .from(transactions)
      .where(and(gte(transactions.date, from), lte(transactions.date, to), kind ? eq(transactions.kind, kind) : undefined))
      .orderBy(desc(transactions.date), desc(transactions.createdAt))
      .limit(300),
    db
      .select({ category: transactions.category, total: sql<string>`sum(${transactions.amount})` })
      .from(transactions)
      .where(and(gte(transactions.date, from), lte(transactions.date, to), eq(transactions.kind, 'expense')))
      .groupBy(transactions.category)
      .orderBy(sql`2 desc`),
  ]);
  const net = totals.income - totals.expense;
  const delta = (cur: number, p: number) => (p > 0 ? `${cur >= p ? '▲' : '▼'} ${Math.abs(Math.round(((cur - p) / p) * 100))}% عن الشهر السابق` : 'لا بيانات للشهر السابق');
  const maxCat = Math.max(1, ...byCat.map((c) => Number(c.total)));
  const link = (m: string, k?: string) => `/finance?month=${m}${k ? `&kind=${k}` : ''}`;

  return (
    <>
      <PageHeader
        title="الإيرادات والمصروفات"
        description="دفعات الفواتير تُسجّل في الإيرادات تلقائياً. سجّل هنا المصروفات وأي إيرادات أخرى."
        actions={
          <div className="flex items-center gap-1 rounded-xl bg-surface p-1 shadow-1">
            <Link href={link(shiftMonth(month, -1), kind)} className={iconButtonClasses('default', 'size-9')} aria-label="الشهر السابق" title="الشهر السابق">
              <ChevronRight aria-hidden="true" />
            </Link>
            <span className="min-w-28 text-center text-callout font-semibold">{monthLabel(month)}</span>
            <Link href={link(shiftMonth(month, 1), kind)} className={iconButtonClasses('default', 'size-9')} aria-label="الشهر التالي" title="الشهر التالي">
              <ChevronLeft aria-hidden="true" />
            </Link>
          </div>
        }
      />
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <StatCard label="صافي الربح" value={formatAmount(net)} detail={net >= 0 ? 'ر.س — ربح هذا الشهر' : 'ر.س — خسارة هذا الشهر'} icon={Scale} emphasis />
        <StatCard label="الإيرادات" value={formatAmount(totals.income)} detail={delta(totals.income, prev.income)} icon={ArrowDownLeft} tone="positive" href={link(month, 'income')} />
        <StatCard label="المصروفات" value={formatAmount(totals.expense)} detail={delta(totals.expense, prev.expense)} icon={ArrowUpRight} tone="info" href={link(month, 'expense')} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="space-y-4 min-w-0">
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <Card>
              <CardTitle>آخر 6 أشهر</CardTitle>
              <MonthlyChart data={series} />
            </Card>
            <Card>
              <CardTitle>المصروفات حسب التصنيف</CardTitle>
              {byCat.length === 0 ? (
                <p className="text-callout text-fg-tertiary">لا مصروفات في هذا الشهر.</p>
              ) : (
                <ul className="space-y-3">
                  {byCat.map((c) => (
                    <li key={c.category}>
                      <div className="mb-1 flex justify-between text-callout">
                        <span>{c.category}</span>
                        <span className="num font-semibold">{formatAmount(Number(c.total))}</span>
                      </div>
                      <div className="h-2 rounded-full bg-surface-3">
                        <div className="h-2 rounded-full bg-[var(--chart-expense)]" style={{ width: `${(Number(c.total) / maxCat) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-headline">حركات {monthLabel(month)}</h2>
            <div className="flex gap-1.5">
              {[
                ['', 'الكل'],
                ['income', 'الإيرادات'],
                ['expense', 'المصروفات'],
              ].map(([k, l]) => (
                <Link key={k} href={link(month, k || undefined)} className={(kind ?? '') === k ? buttonClasses('primary', 'sm') : buttonClasses('outline', 'sm')}>
                  {l}
                </Link>
              ))}
            </div>
          </div>
          {rows.length === 0 ? (
            <div className="rounded-card bg-surface shadow-2">
              <EmptyState icon={Wallet} title="لا توجد حركات" description="سجّل المصروفات من النموذج، وستظهر دفعات الفواتير هنا تلقائياً." />
            </div>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>التاريخ</Th>
                  <Th>النوع</Th>
                  <Th>التصنيف</Th>
                  <Th>البيان</Th>
                  <Th>الطريقة</Th>
                  <Th>المبلغ</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-hover">
                    <Td className="text-fg-secondary num text-start">{fmtDate(r.date)}</Td>
                    <Td>
                      <Badge tone={r.kind === 'income' ? 'positive' : 'info'}>{r.kind === 'income' ? 'إيراد' : 'مصروف'}</Badge>
                    </Td>
                    <Td>{r.category}</Td>
                    <Td className="max-w-64 text-fg-secondary">
                      {r.invoiceId ? (
                        <Link href={`/invoices/${r.invoiceId}`} className="text-fg-brand hover:underline">
                          {r.description}
                        </Link>
                      ) : (
                        r.description || '—'
                      )}
                    </Td>
                    <Td className="text-fg-secondary">{PAYMENT_METHODS[r.method] ?? r.method}</Td>
                    <Td className={`font-semibold num ${r.kind === 'income' ? 'text-fg-positive' : 'text-fg'}`}>
                      {r.kind === 'income' ? '+' : '-'}
                      {formatAmount(r.amount)}
                    </Td>
                    <Td className="w-12">
                      {!r.invoiceId && can(user, 'manage') && (
                        <form action={deleteTransactionAction.bind(null, r.id)}>
                          <button type="submit" className={iconButtonClasses('danger', 'size-8')} aria-label="حذف الحركة" title="حذف الحركة">
                            <Trash2 aria-hidden="true" className="size-4" />
                          </button>
                        </form>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
        <div>
          <Card className="xl:sticky xl:top-6">
            <CardTitle>حركة جديدة</CardTitle>
            <TransactionForm today={today} />
          </Card>
        </div>
      </div>
    </>
  );
}
