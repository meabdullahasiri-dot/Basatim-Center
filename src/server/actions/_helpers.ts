import 'server-only';
import { AuthError } from '../auth/session';

export type ActionState = { ok?: boolean; error?: string; fieldErrors?: Record<string, string>; message?: string; nonce?: number } | null;

export function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === 'string' ? v.trim() : '';
}

export function optStr(fd: FormData, key: string, max = 500): string | null {
  const v = str(fd, key);
  return v ? v.slice(0, max) : null;
}

/** يحوّل الأخطاء غير المتوقعة إلى رسالة عربية واضحة دون كشف التفاصيل. */
export function failure(err: unknown): ActionState {
  if (err instanceof AuthError) return { error: err.message };
  if (err && typeof err === 'object' && 'digest' in err && String((err as { digest: unknown }).digest).startsWith('NEXT_REDIRECT')) throw err;
  console.error(err);
  return { error: 'حدث خطأ غير متوقع. حاول مرة أخرى.' };
}
