import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/auth/AuthShell';
import { SetupForm } from '@/components/auth/SetupForm';
import { hasAnyUser } from '@/server/users';

export const metadata: Metadata = { title: 'إعداد النظام', robots: { index: false } };

export default async function SetupPage() {
  if (await hasAnyUser()) redirect('/login');
  return (
    <AuthShell title="إعداد النظام لأول مرة" subtitle="أنشئ حساب مدير المركز. يملك المدير كل الصلاحيات ويمنحها للموظفين.">
      <SetupForm />
    </AuthShell>
  );
}
