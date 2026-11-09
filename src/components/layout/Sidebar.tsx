'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { CalendarCheck, FileSignature, LayoutDashboard, LogOut, Menu, ReceiptText, Settings, ShieldCheck, Users, Wallet, X, ExternalLink } from 'lucide-react';
import type { NavItem } from './nav';
import { Logo } from '../brand/Logo';
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

export function Sidebar({ items, user, newBookings }: { items: NavItem[]; user: { name: string; role: string; jobTitle: string | null }; newBookings: number }) {
  const pathname = usePathname();
  // القائمة على الجوال تُغلق تلقائياً عند الانتقال لصفحة أخرى.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  const setOpen = (v: boolean) => setOpenAt(v ? pathname : null);

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="القائمة الرئيسية">
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        const active = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'group relative flex h-11 items-center gap-3 rounded-xl px-3 text-callout font-medium transition-colors duration-[var(--dur-fast)]',
              active ? 'bg-white/10 text-white' : 'text-ink-300 hover:bg-white/5 hover:text-white',
            )}
          >
            {active && <span className="absolute inset-y-2 start-0 w-1 rounded-full bg-brand-500" aria-hidden="true" />}
            <Icon className={cn('size-5', active ? 'text-brand-400' : 'text-ink-400 group-hover:text-ink-200')} aria-hidden="true" />
            <span className="flex-1">{item.label}</span>
            {item.icon === 'booking' && newBookings > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1.5 text-caption text-white">{newBookings}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="m-3 rounded-2xl bg-white/5 p-3">
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-600/20 font-bold text-brand-300">{user.name.trim().charAt(0)}</span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-callout font-semibold text-white">{user.name}</div>
          <div className="truncate text-footnote text-ink-400">{user.role === 'manager' ? 'مدير المركز' : user.jobTitle || 'موظف'}</div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1">
        <Link href="/" target="_blank" className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg text-subheadline text-ink-300 hover:bg-white/5 hover:text-white">
          <ExternalLink className="size-4" aria-hidden="true" />
          الموقع
        </Link>
        <ThemeToggle className="size-9 text-ink-300 hover:text-brand-300" />
        <form action={logoutAction} className="flex-1">
          <button type="submit" className="flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg text-subheadline text-ink-300 hover:bg-white/5 hover:text-red-300">
            <LogOut className="size-4" aria-hidden="true" />
            خروج
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
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
          'no-print fixed inset-y-0 start-0 z-50 flex w-sidebar flex-col overflow-y-auto bg-ink-950 transition-transform duration-[var(--dur-slow)] ease-standard dark:border-e dark:border-line',
          open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0',
        )}
      >
        <div className="pointer-events-none absolute -top-24 -start-24 size-64 rounded-full bg-brand-600/20 blur-3xl" aria-hidden="true" />
        <div className="relative flex h-header items-center justify-between px-5">
          <Link href="/dashboard">
            <Logo invert />
          </Link>
          <button type="button" onClick={() => setOpen(false)} className="grid size-9 cursor-pointer place-items-center rounded-lg text-ink-300 hover:bg-white/10 lg:hidden" aria-label="إغلاق القائمة">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="relative mx-5 mb-4 h-px bg-gradient-to-l from-transparent via-white/15 to-transparent" />
        <div className="relative flex flex-1 flex-col">{nav}</div>
        <div className="relative">{footer}</div>
      </aside>
    </>
  );
}
