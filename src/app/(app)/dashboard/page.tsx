import type { Metadata } from 'next';
import Link from 'next/link';
import { count, desc, eq, inArray, sql } from 'drizzle-orm';
import { CalendarCheck, FileSignature, HandCoins, Plus, ReceiptText, TrendingUp, Wallet, Wrench } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { buttonClasses } from '@/components/ui/Button';
import { MonthlyChart } from '@/components/finance/MonthlyChart';
import { AGREEMENT_STATUS, INVOICE_STATUS } from '@/domain/labels';
import { formatAmount } from '@/domain/money';
import { can } from '@/domain/permissions';
import { requirePage } from '@/server/auth/session';
import { getDb } from '@/server/db/client';
import { agreements, bookings, invoices } from '@/server/db/schema';
import { lastMonths, monthRange, monthTotals } from '@/server/finance';
import { fmtDate, fmtHijri, todayISO } from '@/lib/format';

export const metadata: Metadata = { title: 'الرئيسية' };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requirePage();
  const { denied } = await searchParams;
  const db = getDb();
  const today = todayISO();
  const month = today.slice(0, 7);
  const canFin = can(user, 'finance');
  const canInv = can(user, 'invoices');
  const canAgr = can(user, 'agreements');
  const canBk = can(user, 'bookings');

  const [todayT, monthT, series, due, openAg, recentInv, recentAg, newBk] = await Promise.all([
    canFin ? monthTotals(today, today) : null,
    canFin ? monthTotals(monthRange(month).from, monthRange(month).to) : null,
    canFin ? lastMonths(month, 6) : null,
    canInv
      ? db
          .select({ n: count(), sum: sql<string>`coalesce(sum(${invoices.total} - ${invoices.paid}),0)` })
          .from(invoices)
          .where(inArray(invoices.status, ['unpaid', 'partial']))
      : null,
    canAgr ? db.select({ n: count() }).from(agreements).where(inArray(agreements.status, ['open', 'in_progress'])) : null,
    canInv ? db.select().from(invoices).orderBy(desc(invoices.issuedAt)).limit(5) : null,
    canAgr ? db.select().from(agreements).where(inArray(agreements.status, ['open', 'in_progress'])).orderBy(desc(agreements.createdAt)).limit(5) : null,
    canBk ? db.select().from(bookings).where(eq(bookings.status, 'new')).orderBy(desc(bookings.createdAt)).limit(5) : null,
  ]);
  const hour = Number(new Date().toLocaleString('en-US', { timeZone: 'Asia/Riyadh', hour: 'numeric', hour12: false }));
  const greet = hour < 12 ? 'صباح الخير' : 'مساء الخير';

  return (
    <>
      {denied && <Alert tone="warning" className="mb-4">ليست لديك صلاحية لفتح تلك الصفحة. اطلب من مدير المركز منحك الصلاحية.</Alert>}
      <section className="relative mb-6 overflow-hidden rounded-card bg-surface p-6 text-fg shadow-2 sm:p-8 dark:bg-ink-950 dark:text-white dark:shadow-3">
        <div className="grid-bg absolute inset-0" aria-hidden="true" />
        <div className="glow -top-32 -start-16 size-96 bg-[radial-gradient(closest-side,rgba(254,97,17,.18),transparent)] dark:bg-[radial-gradient(closest-side,rgba(254,97,17,.35),transparent)]" aria-hidden="true" />
        <Wrench className="absolute -bottom-6 end-6 size-40 -rotate-12 text-ink-900/[.04] dark:text-white/5" aria-hidden="true" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-callout text-fg-secondary dark:text-ink-300">
              {fmtHijri(new Date())} · <span className="num">{fmtDate(today)}</span>
            </p>
            <h1 className="mt-1 font-display text-[32px] font-bold leading-tight sm:text-[40px]">
              {greet}، <span className="grad-text">{user.name.split(' ')[0]}</span>
            </h1>
            <p className="mt-1 text-body text-fg-secondary dark:text-ink-300">هذا ملخص المركز اليوم.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canAgr && (
              <Link href="/agreements/new" className="inline-flex h-11 items-center gap-2 rounded-xl bg-field px-4 text-callout font-semibold text-fg hover:bg-field-hover dark:bg-white/10 dark:text-white dark:hover:bg-white/15">
                <FileSignature className="size-[18px]" aria-hidden="true" />
                استلام سيارة
              </Link>
            )}
            {canInv && (
              <Link href="/invoices/new" className={buttonClasses('primary', 'md', 'h-11 bg-brand-600 hover:bg-brand-500')}>
                <Plus aria-hidden="true" />
                فاتورة جديدة
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {canFin && todayT && <StatCard label="إيرادات اليوم" value={formatAmount(todayT.income)} detail="ر.س" icon={HandCoins} tone="positive" href="/finance" />}
        {canFin && monthT && <StatCard label="صافي الشهر" value={formatAmount(monthT.income - monthT.expense)} detail={`إيرادات ${formatAmount(monthT.income)} · مصروفات ${formatAmount(monthT.expense)}`} icon={TrendingUp} href="/finance" />}
        {canInv && due && <StatCard label="مستحقات على العملاء" value={formatAmount(Number(due[0].sum))} detail={`${due[0].n} فاتورة غير مسددة`} icon={ReceiptText} tone="danger" href="/invoices?status=unpaid" />}
        {canAgr && openAg && <StatCard label="سيارات في الورشة" value={openAg[0].n} detail="اتفاقيات مفتوحة أو قيد التنفيذ" icon={Wrench} tone="warning" href="/agreements?status=in_progress" />}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {canFin && series && (
          <Card className="lg:col-span-2">
            <CardTitle action={<Link href="/finance" className="text-subheadline text-fg-brand hover:underline">التفاصيل</Link>}>الإيرادات والمصروفات</CardTitle>
            <MonthlyChart data={series} />
          </Card>
        )}
        {recentAg && (
          <Card>
            <CardTitle action={<Link href="/agreements" className="text-subheadline text-fg-brand hover:underline">الكل</Link>}>سيارات في الورشة</CardTitle>
            {recentAg.length === 0 ? (
              <p className="text-callout text-fg-tertiary">لا توجد سيارات قيد العمل حالياً.</p>
            ) : (
              <ul className="divide-y divide-line">
                {recentAg.map((a) => (
                  <li key={a.id}>
                    <Link href={`/agreements/${a.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:text-fg-brand">
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{a.customerName}</span>
                        <span className="block truncate text-footnote text-fg-tertiary">{[a.carMake, a.carModel, a.plateNumber].filter(Boolean).join(' · ') || a.complaint}</span>
                      </span>
                      <Badge tone={AGREEMENT_STATUS[a.status].tone}>{AGREEMENT_STATUS[a.status].label}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
        {recentInv && (
          <Card>
            <CardTitle action={<Link href="/invoices" className="text-subheadline text-fg-brand hover:underline">الكل</Link>}>آخر الفواتير</CardTitle>
            {recentInv.length === 0 ? (
              <p className="text-callout text-fg-tertiary">لم تصدر فواتير بعد.</p>
            ) : (
              <ul className="divide-y divide-line">
                {recentInv.map((i) => (
                  <li key={i.id}>
                    <Link href={`/invoices/${i.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:text-fg-brand">
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{i.customerName}</span>
                        <span className="block text-footnote text-fg-tertiary num text-start">{i.number}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <b className="num">{formatAmount(i.total)}</b>
                        <Badge tone={INVOICE_STATUS[i.status].tone}>{INVOICE_STATUS[i.status].label}</Badge>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
        {newBk && (
          <Card>
            <CardTitle action={<Link href="/bookings" className="text-subheadline text-fg-brand hover:underline">الكل</Link>}>طلبات حجز جديدة من الموقع</CardTitle>
            {newBk.length === 0 ? (
              <p className="text-callout text-fg-tertiary">لا توجد طلبات جديدة.</p>
            ) : (
              <ul className="divide-y divide-line">
                {newBk.map((b) => (
                  <li key={b.id} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{b.name}</span>
                      <span className="block truncate text-footnote text-fg-tertiary">{[b.service, b.car].filter(Boolean).join(' · ')}</span>
                    </span>
                    <CalendarCheck className="size-5 text-icon-brand" aria-hidden="true" />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
        {!canFin && !canInv && !canAgr && !canBk && (
          <Card className="lg:col-span-2">
            <p className="flex items-center gap-2 text-callout text-fg-secondary">
              <Wallet className="size-5" aria-hidden="true" />
              لم تُمنح لك صلاحيات بعد. اطلب من مدير المركز تفعيل الصلاحيات المناسبة لحسابك.
            </p>
          </Card>
        )}
      </div>
    </>
  );
}
