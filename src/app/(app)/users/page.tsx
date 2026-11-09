import type { Metadata } from 'next';
import { asc } from 'drizzle-orm';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CreateUserForm, EditUserForm } from '@/components/admin/UserForms';
import { PERMISSION_LABELS, type Permission } from '@/domain/permissions';
import { requirePage } from '@/server/auth/session';
import { getDb } from '@/server/db/client';
import { users } from '@/server/db/schema';

export const metadata: Metadata = { title: 'المستخدمون والصلاحيات' };

export default async function UsersPage() {
  const me = await requirePage('manage');
  const list = await getDb().select().from(users).orderBy(asc(users.createdAt));
  return (
    <>
      <PageHeader title="المستخدمون والصلاحيات" description="أنشئ حساباً لكل موظف، وحدّد ما يستطيع فعله: إصدار الفواتير، أو الاتفاقيات، أو كلها." />
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="grid content-start gap-3 md:grid-cols-2">
          {list.map((u) => (
            <Card key={u.id} className={u.isActive ? '' : 'opacity-70'}>
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary-tint font-bold text-fg-brand">{u.name.charAt(0)}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{u.name}</span>
                    {u.id === me.id && <Badge tone="brand">أنت</Badge>}
                    {!u.isActive && <Badge tone="danger">موقوف</Badge>}
                  </div>
                  <div className="text-footnote text-fg-tertiary">
                    <span dir="ltr">@{u.username}</span> · {u.jobTitle || (u.role === 'manager' ? 'مدير' : 'موظف')}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {u.role === 'manager' ? (
                      <Badge tone="brand">كل الصلاحيات</Badge>
                    ) : u.permissions.length ? (
                      u.permissions.map((p) => <Badge key={p}>{PERMISSION_LABELS[p as Permission]?.label ?? p}</Badge>)
                    ) : (
                      <Badge tone="warning">بلا صلاحيات</Badge>
                    )}
                  </div>
                </div>
              </div>
              <details className="group">
                <summary className="mt-3 cursor-pointer list-none text-subheadline font-semibold text-fg-brand">تعديل الصلاحيات</summary>
                <EditUserForm user={u} isSelf={u.id === me.id} />
              </details>
            </Card>
          ))}
        </div>
        <Card className="h-fit">
          <CardTitle>مستخدم جديد</CardTitle>
          <CreateUserForm />
        </Card>
      </div>
    </>
  );
}
