import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/auth/AuthShell';
import { LoginForm } from '@/components/auth/LoginForm';
import { hasAnyUser } from '@/server/users';
import { getCurrentUser } from '@/server/auth/session';

export const metadata: Metadata = { title: 'تسجيل الدخول', robots: { index: false } };

export default async function LoginPage() {
  if (!(await hasAnyUser())) redirect('/setup');
  if (await getCurrentUser()) redirect('/dashboard');
  return (
    <AuthShell title="مرحباً بعودتك" subtitle="سجّل الدخول إلى نظام مركز بساتم">
      <LoginForm />
    </AuthShell>
  );
}
