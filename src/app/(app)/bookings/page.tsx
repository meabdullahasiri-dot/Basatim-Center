import type { Metadata } from 'next';
import { desc, eq } from 'drizzle-orm';
import { CalendarCheck, MessageCircle, Phone } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterPills } from '@/components/ui/SearchBar';
import { buttonClasses } from '@/components/ui/Button';
import { cn } from '@/components/ui/cn';
import { BOOKING_STATUS } from '@/domain/labels';
import { setBookingStatusAction } from '@/server/actions/admin';
import { requirePage } from '@/server/auth/session';
import { getDb } from '@/server/db/client';
import { bookings } from '@/server/db/schema';
import { fmtDate, fmtDateTime } from '@/lib/format';
import { waLink } from '@/lib/whatsapp';

export const metadata: Metadata = { title: 'طلبات الحجز' };

export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requirePage('bookings');
  const { status } = await searchParams;
  const valid = status && status in BOOKING_STATUS ? (status as 'new') : undefined;
  const list = await getDb()
    .select()
    .from(bookings)
    .where(valid ? eq(bookings.status, valid) : undefined)
    .orderBy(desc(bookings.createdAt))
    .limit(200);
  return (
    <>
      <PageHeader title="طلبات الحجز" description="الطلبات التي يرسلها العملاء من نموذج «احجز موعدك» في الموقع." />
      <FilterPills base="/bookings" current={status} options={Object.entries(BOOKING_STATUS).map(([value, v]) => ({ value, label: v.label }))} />
      {list.length === 0 ? (
        <Card>
          <EmptyState icon={CalendarCheck} title="لا توجد طلبات" description="عندما يحجز عميل من الموقع سيظهر طلبه هنا مع رقم جواله." />
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map((b) => {
            const st = BOOKING_STATUS[b.status];
            return (
              <Card key={b.id} className="flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold">{b.name}</div>
                    <div className="text-footnote text-fg-tertiary num text-start">{fmtDateTime(b.createdAt)}</div>
                  </div>
                  <Badge tone={st.tone} dot={b.status === 'new'}>
                    {st.label}
                  </Badge>
                </div>
                <dl className="mt-3 space-y-1 text-callout">
                  {b.service && <Info k="الخدمة" v={b.service} />}
                  {b.car && <Info k="السيارة" v={b.car} />}
                  {b.preferredDate && <Info k="الموعد المفضل" v={fmtDate(b.preferredDate)} />}
                  {b.notes && <Info k="ملاحظات" v={b.notes} />}
                </dl>
                <div className="mt-auto flex gap-2 pt-4">
                  <a href={`tel:${b.phone}`} className={buttonClasses('outline', 'sm', 'flex-1')}>
                    <Phone aria-hidden="true" />
                    <span className="num">{b.phone}</span>
                  </a>
                  <a href={waLink(b.phone, `مرحباً ${b.name}، معك مركز بساتم لصيانة السيارات بخصوص طلب حجزك.`)} target="_blank" rel="noopener" className={buttonClasses('success', 'sm')}>
                    <MessageCircle aria-hidden="true" />
                    واتساب
                  </a>
                </div>
                <form action={setBookingStatusAction.bind(null, b.id)} className="mt-2 grid grid-cols-4 gap-1">
                  {Object.entries(BOOKING_STATUS).map(([k, v]) => (
                    <button
                      key={k}
                      name="status"
                      value={k}
                      className={cn('h-8 cursor-pointer rounded-lg text-footnote font-semibold', b.status === k ? 'bg-neutral text-on-neutral' : 'bg-surface-2 text-fg-secondary hover:bg-surface-3')}
                    >
                      {v.label}
                    </button>
                  ))}
                </form>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 text-fg-tertiary">{k}:</dt>
      <dd>{v}</dd>
    </div>
  );
}
