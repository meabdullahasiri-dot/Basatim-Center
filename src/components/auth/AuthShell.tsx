import Link from 'next/link';
import { Logo } from '../brand/Logo';

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col justify-center px-6 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="inline-block">
            <Logo />
          </Link>
          <h1 className="mt-10 text-title-1 text-fg">{title}</h1>
          <p className="mt-1 text-callout text-fg-secondary">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-ink-950 lg:block">
        <div className="grid-bg absolute inset-0" aria-hidden="true" />
        <div className="glow -top-40 -start-20 size-[620px] bg-[radial-gradient(closest-side,rgba(254,97,17,.35),transparent)]" aria-hidden="true" />
        <div className="glow -bottom-52 end-0 size-[520px] bg-[radial-gradient(closest-side,rgba(255,179,71,.14),transparent)]" aria-hidden="true" />
        <div className="relative flex h-full flex-col justify-end p-14 text-white">
          <svg viewBox="0 0 200 200" className="spin-slow absolute top-16 end-16 size-56 text-brand-500/30" aria-hidden="true">
            <path
              fill="currentColor"
              d="M100 30l9 18 20-4 4 20 19 8-7 19 14 15-15 14 7 19-19 8-4 20-20-4-9 18-9-18-20 4-4-20-19-8 7-19-14-15 14-14-7-19 19-8 4-20 20 4zM100 70a30 30 0 100 60 30 30 0 000-60z"
            />
          </svg>
          <p className="font-display text-[44px] font-bold leading-tight">
            إدارة المركز
            <br />
            <span className="grad-text">بلمسة واحدة</span>
          </p>
          <p className="mt-4 max-w-md text-body text-ink-300">الفواتير، واتفاقيات العمل، والإيرادات والمصروفات، وطلبات الحجز من الموقع. كلها في مكان واحد وباللغة العربية.</p>
          <div className="road mt-10 w-48" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
