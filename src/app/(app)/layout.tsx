import { count, eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { AppFrame } from '@/components/layout/Sidebar';
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
  const collapsed = (await cookies()).get('basatim_sidebar')?.value === 'collapsed';
  return (
    <AppFrame items={items} user={{ name: user.name, role: user.role, jobTitle: user.jobTitle }} newBookings={newBookings} initialCollapsed={collapsed}>
      {children}
    </AppFrame>
  );
}
