import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { SettingsForm } from '@/components/admin/SettingsForm';
import { DEFAULT_AGREEMENT_TERMS } from '@/domain/terms';
import { requirePage } from '@/server/auth/session';
import { getSettings } from '@/server/settings';

export const metadata: Metadata = { title: 'الإعدادات' };

export default async function SettingsPage() {
  await requirePage('manage');
  const s = await getSettings();
  return (
    <div className="max-w-3xl">
      <PageHeader title="الإعدادات" description="بيانات المركز التي تظهر في الفواتير والاتفاقيات والموقع التعريفي." />
      <SettingsForm s={s} defaultTerms={DEFAULT_AGREEMENT_TERMS} />
    </div>
  );
}
