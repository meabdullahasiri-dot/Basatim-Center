import type { Metadata } from 'next';
import { asc } from 'drizzle-orm';
import { AgreementForm } from '@/components/docs/AgreementForm';
import { PageHeader } from '@/components/ui/PageHeader';
import { DEFAULT_AGREEMENT_TERMS } from '@/domain/terms';
import { requirePage } from '@/server/auth/session';
import { getDb } from '@/server/db/client';
import { teamMembers } from '@/server/db/schema';
import { getSettings } from '@/server/settings';

export const metadata: Metadata = { title: 'اتفاقية عمل جديدة' };

export default async function NewAgreementPage() {
  await requirePage('agreements');
  const s = await getSettings();
  const team = await getDb().select({ name: teamMembers.name, title: teamMembers.title }).from(teamMembers).orderBy(asc(teamMembers.sortOrder));
  return (
    <>
      <PageHeader title="اتفاقية عمل جديدة" description="سجّل بيانات السيارة والمطلوب والتكلفة التقديرية، ثم اطبعها ليوقّع العميل." back="/agreements" />
      <AgreementForm terms={s.agreementTerms || DEFAULT_AGREEMENT_TERMS} technicians={team.map((t) => `${t.name} — ${t.title}`)} />
    </>
  );
}
