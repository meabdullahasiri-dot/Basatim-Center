import type { Metadata } from 'next';
import { asc } from 'drizzle-orm';
import { Trash2, Users } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { iconButtonClasses } from '@/components/ui/Button';
import { TeamForm } from '@/components/admin/TeamForm';
import { deleteTeamMemberAction } from '@/server/actions/admin';
import { requirePage } from '@/server/auth/session';
import { getDb } from '@/server/db/client';
import { teamMembers } from '@/server/db/schema';

export const metadata: Metadata = { title: 'فريق العمل' };

export default async function TeamPage() {
  await requirePage('manage');
  const list = await getDb().select().from(teamMembers).orderBy(asc(teamMembers.sortOrder), asc(teamMembers.createdAt));
  return (
    <>
      <PageHeader title="فريق العمل" description="المهندسون والفنيون الذين يظهرون في قسم «فريقنا» بالموقع، ويُختارون كفني مسؤول في اتفاقيات العمل." />
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div>
          {list.length === 0 ? (
            <Card>
              <EmptyState icon={Users} title="أضف أعضاء الفريق" description="ابدأ بالمدير، ثم المهندسين والفنيين. سيظهرون في الموقع بتصميم أنيق." />
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {list.map((m) => (
                <Card key={m.id}>
                  <div className="flex items-start gap-3">
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl rounded-es-sig bg-primary-tint font-display text-[20px] font-bold text-fg-brand dark:bg-ink-950 dark:text-brand-400">{m.name.charAt(0)}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold">{m.name}</div>
                      <div className="text-footnote text-fg-brand">{m.title}</div>
                      {m.specialty && <div className="text-footnote text-fg-tertiary">{m.specialty}</div>}
                      <div className="mt-1.5 flex gap-1">
                        {m.years != null && <Badge>خبرة {m.years} سنة</Badge>}
                        {!m.showOnSite && <Badge tone="warning">مخفي من الموقع</Badge>}
                      </div>
                    </div>
                    <form action={deleteTeamMemberAction.bind(null, m.id)}>
                      <button type="submit" className={iconButtonClasses('danger', 'size-9')} aria-label={`حذف ${m.name}`} title="حذف">
                        <Trash2 aria-hidden="true" className="size-4" />
                      </button>
                    </form>
                  </div>
                  <details>
                    <summary className="mt-3 cursor-pointer list-none text-subheadline font-semibold text-fg-brand">تعديل</summary>
                    <div className="mt-3 border-t border-line pt-3">
                      <TeamForm d={m} />
                    </div>
                  </details>
                </Card>
              ))}
            </div>
          )}
        </div>
        <Card className="h-fit">
          <CardTitle>عضو جديد</CardTitle>
          <TeamForm />
        </Card>
      </div>
    </>
  );
}
