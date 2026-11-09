import Link from 'next/link';
import { CalendarCheck } from 'lucide-react';
import { Logo } from '../brand/Logo';
import { ThemeToggle } from '../layout/ThemeToggle';

const LINKS = [
  ['#services', 'خدماتنا'],
  ['#how', 'كيف نعمل'],
  ['#why', 'لماذا بساتم'],
  ['#team', 'فريقنا'],
  ['#contact', 'تواصل'],
] as const;

export function SiteHeader({ showTeam }: { showTeam: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-material text-fg backdrop-blur-xl dark:border-white/10 dark:bg-ink-950/85 dark:text-white">
      <div className="site-wrap flex h-[72px] items-center justify-between gap-4">
        <Link href="#top" aria-label="مركز بساتم — الرئيسية">
          <Logo />
        </Link>
        <nav className="site-nav hidden items-center gap-7 text-[16px] text-fg-secondary lg:flex dark:text-ink-300" data-spy aria-label="أقسام الموقع">
          {LINKS.filter(([h]) => showTeam || h !== '#team').map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="relative transition-colors after:absolute after:inset-x-0 after:-bottom-1.5 after:h-0.5 after:origin-center after:scale-x-0 after:rounded after:bg-brand-500 after:transition-transform after:duration-300 hover:text-fg dark:hover:text-white"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          <ThemeToggle className="dark:text-ink-300" />
          <a href="#book" className="inline-flex h-10 items-center gap-2 rounded-full bg-brand-600 px-4 text-[15px] font-bold text-white shadow-brand transition-transform hover:-translate-y-0.5 hover:bg-brand-500">
            <CalendarCheck className="size-[18px]" aria-hidden="true" />
            احجز موعدك
          </a>
        </div>
      </div>
    </header>
  );
}
