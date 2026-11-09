import { cn } from '../ui/cn';

/** شعار بساتم: صامولة سداسية (رمز الميكانيكا) بداخلها حرف «ب». */
export function LogoMark({ className, title = 'شعار مركز بساتم' }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn('size-10 shrink-0', className)} role="img" aria-label={title}>
      <defs>
        <linearGradient id="bsLogoG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff8238" />
          <stop offset="1" stopColor="#c63408" />
        </linearGradient>
      </defs>
      <path d="M32 3.5 56.5 17.7v28.6L32 60.5 7.5 46.3V17.7Z" fill="url(#bsLogoG)" stroke="url(#bsLogoG)" strokeWidth="3" strokeLinejoin="round" />
      <path d="M32 11.5 49.5 21.6v20.8L32 52.5 14.5 42.4V21.6Z" fill="none" stroke="#fff" strokeOpacity=".22" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M44.5 22.5v8a6 6 0 0 1-6 6h-13a6 6 0 0 1-6-6v-3.5" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="32" cy="45" r="3.4" fill="#fff" />
    </svg>
  );
}

export function Logo({ className, subtitle = true, invert }: { className?: string; subtitle?: boolean; invert?: boolean }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className="leading-tight">
        <span className={cn('block font-display text-[19px] font-bold', invert ? 'text-white' : 'text-fg')}>بساتم</span>
        {subtitle && <span className={cn('block text-footnote', invert ? 'text-ink-300' : 'text-fg-tertiary')}>لصيانة السيارات</span>}
      </span>
    </span>
  );
}
