import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import './fonts/fonts.css';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'مركز بساتم لصيانة السيارات', template: '%s | مركز بساتم' },
  description: 'مركز بساتم لصيانة السيارات: فحص بالكمبيوتر، ميكانيكا، كهرباء، تكييف، وصيانة دورية بأيدي مهندسين وفنيين محترفين.',
  applicationName: 'بساتم',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f5f7' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0c0f' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  const dark = store.get('basatim_theme')?.value === 'dark';
  return (
    <html lang="ar" dir="rtl" className={dark ? 'dark' : undefined}>
      <body className="min-h-screen bg-canvas text-fg antialiased">{children}</body>
    </html>
  );
}
