import type { Permission } from '@/domain/permissions';

export interface NavItem {
  href: string;
  label: string;
  icon: 'dashboard' | 'invoice' | 'agreement' | 'finance' | 'booking' | 'team' | 'users' | 'settings';
  perm?: Permission | 'manage';
}

export const NAV: NavItem[] = [
  { href: '/dashboard', label: 'الرئيسية', icon: 'dashboard' },
  { href: '/invoices', label: 'الفواتير', icon: 'invoice', perm: 'invoices' },
  { href: '/agreements', label: 'اتفاقيات العمل', icon: 'agreement', perm: 'agreements' },
  { href: '/finance', label: 'الإيرادات والمصروفات', icon: 'finance', perm: 'finance' },
  { href: '/bookings', label: 'طلبات الحجز', icon: 'booking', perm: 'bookings' },
  { href: '/team', label: 'فريق العمل', icon: 'team', perm: 'manage' },
  { href: '/users', label: 'المستخدمون والصلاحيات', icon: 'users', perm: 'manage' },
  { href: '/settings', label: 'الإعدادات', icon: 'settings', perm: 'manage' },
];
