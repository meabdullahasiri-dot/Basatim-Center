import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { AgreementDocument } from '@/components/docs/AgreementDocument';
import { PrintToolbar } from '@/components/print/PrintToolbar';
import { requirePage } from '@/server/auth/session';
import { getDb } from '@/server/db/client';
import { agreements } from '@/server/db/schema';
import { getSettings } from '@/server/settings';

export default async function PrintAgreement({ params }: { params: Promise<{ id: string }> }) {
  await requirePage('agreements');
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const [ag] = await getDb().select().from(agreements).where(eq(agreements.id, id));
  if (!ag) notFound();
  const s = await getSettings();
  return (
    <>
      <PrintToolbar title={`اتفاقية ${ag.number}`} />
      <AgreementDocument ag={ag} s={s} />
    </>
  );
}
