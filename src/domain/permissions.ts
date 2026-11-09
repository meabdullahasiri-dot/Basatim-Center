export const PERMISSIONS = ['invoices', 'agreements', 'finance', 'bookings'] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const PERMISSION_LABELS: Record<Permission, { label: string; hint: string }> = {
  invoices: { label: 'إصدار الفواتير', hint: 'إنشاء الفواتير وتسجيل الدفعات وطباعتها' },
  agreements: { label: 'اتفاقيات العمل', hint: 'إنشاء اتفاقيات العمل (أوامر الإصلاح) ومتابعتها' },
  finance: { label: 'الإيرادات والمصروفات', hint: 'عرض الحركات المالية وتسجيل المصروفات' },
  bookings: { label: 'طلبات الحجز', hint: 'متابعة طلبات الحجز القادمة من الموقع' },
};

export interface Actor {
  role: 'manager' | 'staff';
  permissions: string[];
}

export function can(actor: Actor, p: Permission | 'manage'): boolean {
  if (actor.role === 'manager') return true;
  if (p === 'manage') return false;
  return actor.permissions.includes(p);
}

export function cleanPermissions(input: string[]): Permission[] {
  return PERMISSIONS.filter((p) => input.includes(p));
}
