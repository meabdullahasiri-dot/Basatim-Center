'use client';
import { Moon, Sun } from 'lucide-react';
import { cn } from '../ui/cn';

export function ThemeToggle({ className }: { className?: string }) {
  function toggle() {
    const dark = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', dark);
    document.cookie = `basatim_theme=${dark ? 'dark' : 'light'}; path=/; max-age=31536000; samesite=lax`;
  }
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="تبديل الوضع الداكن"
      title="تبديل الوضع الداكن"
      className={cn('grid size-10 shrink-0 cursor-pointer place-items-center rounded-full text-icon-secondary transition-[transform,color] duration-300 hover:-rotate-12 hover:text-icon-brand', className)}
    >
      <Sun className="size-5 dark:hidden" aria-hidden="true" />
      <Moon className="hidden size-5 dark:block" aria-hidden="true" />
    </button>
  );
}
