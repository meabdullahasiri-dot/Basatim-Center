'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  CalendarCheck,
  ExternalLink,
  FileSignature,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelRightClose,
  PanelRightOpen,
  ReceiptText,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import type { NavItem } from './nav';
import { Logo, LogoMark } from '../brand/Logo';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '../ui/cn';
import { logoutAction } from '@/server/actions/auth';

const ICONS = {
  dashboard: LayoutDashboard,
  invoice: ReceiptText,
  agreement: FileSignature,
  finance: Wallet,
  booking: CalendarCheck,
  team: Users,
  users: ShieldCheck,
  settings: Settings,
};

const FULL = 264;
const RAIL = 76;

/**
 * هيكل النظام: القائمة الجانبية + المحتوى.
 * على الحاسب يمكن طي القائمة إلى شريط أيقونات (يُحفظ الاختيار)، وعلى الجوال تفتح كدرج.
 * عرض القائمة يُمرَّر كمتغير CSS ‎--sb-w‎ لتتبعه الأشرطة الثابتة (أزرار الحفظ).
 */
export function AppFrame({
  items,
  user,
  newBookings,
  initialCollapsed,
  children,
}: {
  items: NavItem[];
  user: { name: string; role: string; jobTitle: string | null };
  newBookings: number;
  initialCollapsed: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  // الدرج على الجوال يُغلق تلقائياً عند الانتقال لصفحة أخرى.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  const setOpen = (v: boolean) => setOpenAt(v ? pathname : null);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `basatim_sidebar=${next ? 'collapsed' : 'open'}; path=/; max-age=31536000; samesite=lax`;
  }

  // على الجوال تظهر القائمة كاملة دائماً داخل الدرج.
  const rail = collapsed && !open;
  const width = collapsed ? RAIL : FULL;

  return (
    <div className="min-h-screen" style={{ '--sb-w': `${width}px` } as React.CSSProperties}>
      {/* شريط الجوال */}
      <div className="no-print sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-material px-4 backdrop-blur-xl lg:hidden">
        <Link href="/dashboard">
          <Logo subtitle={false} />
        </Link>
        <button type="button" onClick={() => setOpen(true)} className="grid size-10 cursor-pointer place-items-center rounded-xl hover:bg-field" aria-label="فتح القائمة">
          <Menu className="size-6" aria-hidden="true" />
        </button>
      </div>
      {open && <div className="no-print fixed inset-0 z-40 bg-overlay backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} aria-hidden="true" />}

      <aside
        className={cn(
          'no-print fixed inset-y-0 start-0 z-50 flex flex-col overflow-x-hidden overflow-y-auto border-e border-line bg-surface transition-[transform,width] duration-[var(--dur-slow)] ease-standard dark:border-white/5 dark:bg-ink-950',
          open ? 'w-sidebar translate-x-0' : 'w-sidebar translate-x-full lg:translate-x-0',
          rail && 'lg:w-[76px]',
        )}
      >
        <div className="pointer-events-none absolute -top-24 -start-24 size-64 rounded-full bg-brand-500/10 blur-3xl dark:bg-brand-600/20" aria-hidden="true" />

        <div className={cn('relative flex h-header shrink-0 items-center gap-2', rail ? 'lg:justify-center lg:px-0' : 'justify-between px-5')}>
          <Link href="/dashboard" className={cn(rail && 'lg:hidden')}>
            <Logo />
          </Link>
          {rail && (
            <Link href="/dashboard" className="hidden lg:block" aria-label="الرئيسية">
              <LogoMark />
            </Link>
          )}
          <button
            type="button"
            onClick={toggleCollapsed}
            className={cn('hidden size-9 shrink-0 cursor-pointer place-items-center rounded-lg text-icon-secondary hover:bg-field hover:text-icon lg:grid', rail && 'lg:hidden')}
            aria-label="إخفاء القائمة"
            title="إخفاء القائمة"
          >
            <PanelRightClose className="size-5" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => setOpen(false)} className="grid size-9 cursor-pointer place-items-center rounded-lg text-icon-secondary hover:bg-field lg:hidden" aria-label="إغلاق القائمة">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {rail && (
          <button
            type="button"
            onClick={toggleCollapsed}
            className="mx-auto mb-2 hidden size-10 shrink-0 cursor-pointer place-items-center rounded-xl text-icon-secondary hover:bg-field hover:text-icon lg:grid"
            aria-label="إظهار القائمة"
            title="إظهار القائمة"
          >
            <PanelRightOpen className="size-5" aria-hidden="true" />
          </button>
        )}

        <div className="relative mx-5 mb-3 h-px shrink-0 bg-gradient-to-l from-transparent via-line-strong to-transparent dark:via-white/15" />

        <nav className={cn('relative flex flex-1 flex-col gap-1', rail ? 'lg:px-3' : 'px-3')} aria-label="القائمة الرئيسية">
          {items.map((item) => {
            const Icon = ICONS[item.icon];
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            const badge = item.icon === 'booking' && newBookings > 0 ? newBookings : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                title={rail ? item.label : undefined}
                className={cn(
                  'group relative flex h-11 shrink-0 items-center gap-3 rounded-xl px-3 text-callout font-medium transition-colors duration-[var(--dur-fast)]',
                  rail && 'lg:justify-center lg:px-0',
                  active
                    ? 'bg-primary-tint text-fg-brand dark:bg-white/10 dark:text-white'
                    : 'text-fg-secondary hover:bg-field hover:text-fg dark:text-ink-300 dark:hover:bg-white/5 dark:hover:text-white',
                )}
              >
                {active && <span className="absolute inset-y-2 start-0 w-1 rounded-full bg-brand-500" aria-hidden="true" />}
                <Icon className={cn('size-5 shrink-0', active ? 'text-icon-brand dark:text-brand-400' : 'text-icon-secondary group-hover:text-icon')} aria-hidden="true" />
                <span className={cn('flex-1 whitespace-nowrap', rail && 'lg:sr-only')}>{item.label}</span>
                {badge > 0 && (
                  <span
                    className={cn(
                      'grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1.5 text-caption text-white',
                      rail && 'lg:absolute lg:end-1.5 lg:top-1 lg:h-4 lg:min-w-4 lg:px-1 lg:text-[10px]',
                    )}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className={cn('relative m-3 shrink-0 rounded-2xl bg-surface-2 p-3 dark:bg-white/5', rail && 'lg:mx-2 lg:p-2')}>
          <div className={cn('flex items-center gap-3', rail && 'lg:justify-center')}>
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-tint font-bold text-fg-brand dark:bg-brand-600/20 dark:text-brand-300" title={rail ? user.name : undefined}>
              {user.name.trim().charAt(0)}
            </span>
            <div className={cn('min-w-0 flex-1', rail && 'lg:hidden')}>
              <div className="truncate text-callout font-semibold text-fg dark:text-white">{user.name}</div>
              <div className="truncate text-footnote text-fg-tertiary dark:text-ink-400">{user.role === 'manager' ? 'مدير المركز' : user.jobTitle || 'موظف'}</div>
            </div>
          </div>
          <div className={cn('mt-3 flex items-center gap-1', rail && 'lg:flex-col')}>
            <Link
              href="/"
              target="_blank"
              title="الموقع"
              className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg text-subheadline text-fg-secondary hover:bg-field hover:text-fg dark:text-ink-300 dark:hover:bg-white/5 dark:hover:text-white"
            >
              <ExternalLink className="size-4" aria-hidden="true" />
              <span className={cn(rail && 'lg:sr-only')}>الموقع</span>
            </Link>
            <ThemeToggle className="size-9 dark:text-ink-300" />
            <form action={logoutAction} className="flex-1 lg:w-full">
              <button
                type="submit"
                title="خروج"
                className="flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg text-subheadline text-fg-secondary hover:bg-danger-soft hover:text-fg-danger dark:text-ink-300"
              >
                <LogOut className="size-4" aria-hidden="true" />
                <span className={cn(rail && 'lg:sr-only')}>خروج</span>
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main className="transition-[padding] duration-[var(--dur-slow)] ease-standard lg:ps-[var(--sb-w)]">
        <div className="mx-auto max-w-content px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
