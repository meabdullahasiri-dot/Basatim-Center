import { count, eq } from 'drizzle-orm';
import { Sidebar } from '@/components/layout/Sidebar';
import { NAV } from '@/components/layout/nav';
import { can } from '@/domain/permissions';
import { requirePage } from '@/server/auth/session';
import { getDb } from '@/server/db/client';
import { bookings } from '@/server/db/schema';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePage();
  const items = NAV.filter((i) => !i.perm || can(user, i.perm));
  let newBookings = 0;
  if (can(user, 'bookings')) {
    const [row] = await getDb().select({ n: count() }).from(bookings).where(eq(bookings.status, 'new'));
    newBookings = row?.n ?? 0;
  }
  return (
    <div className="min-h-screen">
      <Sidebar items={items} user={{ name: user.name, role: user.role, jobTitle: user.jobTitle }} newBookings={newBookings} />
      <main className="lg:ps-sidebar">
        <div className="mx-auto max-w-content px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
