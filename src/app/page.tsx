import type { Metadata } from 'next';
import { asc, eq } from 'drizzle-orm';
import { ArrowLeft, BadgeCheck, Clock, FileCheck2, Mail, MapPin, MessageCircle, Phone, ReceiptText, ScanLine, ShieldCheck } from 'lucide-react';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteEffects } from '@/components/site/SiteEffects';
import { HeroCar } from '@/components/site/HeroCar';
import { BookingForm } from '@/components/site/BookingForm';
import { ServicesExplorer } from '@/components/site/ServicesExplorer';
import { HowSteps } from '@/components/site/HowSteps';
import { TeamDeck } from '@/components/site/TeamDeck';
import { Logo } from '@/components/brand/Logo';
import { FEATURES, SERVICES } from '@/config/site';
import { getDb } from '@/server/db/client';
import { teamMembers } from '@/server/db/schema';
import { getSettings } from '@/server/settings';
import { waLink } from '@/lib/whatsapp';
import { todayISO } from '@/lib/format';

export const metadata: Metadata = {
  title: { absolute: 'مركز بساتم لصيانة السيارات | فحص وصيانة بأيدي مهندسين محترفين' },
  openGraph: { title: 'مركز بساتم لصيانة السيارات', description: 'فحص بالكمبيوتر، ميكانيكا، كهرباء، تكييف، وصيانة دورية بشفافية كاملة في السعر.', type: 'website', locale: 'ar_SA' },
};

export const dynamic = 'force-dynamic';

const FEATURE_ICONS = [FileCheck2, BadgeCheck, ReceiptText, ShieldCheck];

function Heading({ kicker, title, text }: { kicker: string; title: string; text?: string }) {
  return (
    <div className="mb-10 max-w-2xl">
      <p className="kicker reveal">{kicker}</p>
      <h2 className="reveal mt-2 text-[clamp(32px,4.4vw,52px)] font-bold leading-tight">{title}</h2>
      {text && <p className="reveal mt-2 text-fg-secondary">{text}</p>}
    </div>
  );
}

export default async function Home() {
  const [s, team] = await Promise.all([
    getSettings(),
    getDb().select().from(teamMembers).where(eq(teamMembers.showOnSite, true)).orderBy(asc(teamMembers.sortOrder), asc(teamMembers.createdAt)),
  ]);
  const wa = s.whatsapp ? waLink(s.whatsapp, 'السلام عليكم، أرغب في حجز موعد صيانة لسيارتي.') : null;

  const stats = [
    { k: 'خدمة متكاملة', v: <span data-count={SERVICES.length}>{SERVICES.length}</span> },
    team.length > 0 ? { k: 'من المهندسين والفنيين', v: <span data-count={team.length}>{team.length}</span> } : { k: 'مهندسون وفنيون', v: 'خبراء' },
    { k: 'السعر قبل البدء', v: 'مكتوب' },
    { k: 'فاتورة على واتساب', v: 'فورية' },
  ];

  return (
    <div className="site bg-canvas" id="top">
      <SiteEffects />
      <SiteHeader showTeam={team.length > 0} />

      {/* ============ الواجهة ============ */}
      <section data-hero className="relative isolate overflow-hidden bg-canvas pb-14 pt-12 text-fg sm:pt-16 dark:bg-ink-950 dark:text-white">
        <div className="grid-bg absolute inset-0 -z-10" aria-hidden="true" />
        <div data-hero-glow className="glow -top-64 -end-40 -z-10 size-[820px] bg-[radial-gradient(closest-side,rgba(254,97,17,.16),transparent)] dark:bg-[radial-gradient(closest-side,rgba(254,97,17,.30),transparent)]" aria-hidden="true" />
        <div className="site-wrap grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <span className="reveal inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 text-[15px] text-fg-secondary dark:border-white/10 dark:bg-white/5 dark:text-ink-300">
              <span className="size-2 rounded-full bg-[#22c55e] shadow-[0_0_10px_#22c55e]" />
              {s.workingHours || 'نستقبل سيارتك اليوم'}
            </span>
            <h1 className="reveal mt-6 text-[clamp(44px,6.4vw,84px)] font-bold leading-[1.12]">
              سيارتك بين أيدٍ
              <br />
              <span className="grad-text inline-block pb-2">تعرفها جيداً</span>
            </h1>
            <p className="reveal mt-3 max-w-lg text-[clamp(17px,1.8vw,20px)] leading-[1.85] text-fg-secondary dark:text-ink-300">
              نشخّص العطل بدقة، ونتفق معك على السعر كتابةً قبل أن نبدأ، ثم نسلّمك سيارتك بفاتورة واضحة.
            </p>
            <div className="reveal mt-8 flex flex-wrap gap-3">
              <a href="#book" className="inline-flex h-14 items-center gap-2 rounded-full bg-brand-600 px-7 text-[17px] font-bold text-white shadow-brand transition-transform hover:-translate-y-0.5 hover:bg-brand-500">
                احجز موعد صيانة
                <ArrowLeft className="size-5" aria-hidden="true" />
              </a>
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex h-14 items-center gap-2 rounded-full border border-line bg-surface px-7 text-[17px] font-bold transition-colors hover:border-brand-400 dark:border-white/15 dark:bg-white/5"
                >
                  <MessageCircle className="size-5" aria-hidden="true" />
                  واتساب
                </a>
              )}
            </div>
          </div>
          <div className="reveal relative">
            <HeroCar />
            <div className="float-y absolute -top-2 start-2 rounded-2xl border border-line bg-surface/90 px-4 py-2.5 text-[14px] shadow-3 backdrop-blur sm:start-6 dark:border-white/10 dark:bg-ink-900/80">
              <div className="flex items-center gap-2 text-fg-positive">
                <ScanLine className="size-4" aria-hidden="true" />
                <b>فحص كمبيوتر</b>
              </div>
              <div className="text-[12px] text-fg-tertiary dark:text-ink-400">تشخيص دقيق قبل أي إصلاح</div>
            </div>
          </div>
        </div>

        <div className="site-wrap mt-12">
          <dl className="reveal grid grid-cols-2 overflow-hidden rounded-[22px] border border-line bg-surface/80 backdrop-blur lg:grid-cols-4 dark:border-white/10 dark:bg-white/[.03]">
            {stats.map((st, i) => (
              <div key={i} className="border-line p-5 text-center max-lg:[&:nth-child(-n+2)]:border-b lg:[&:not(:first-child)]:border-s dark:border-white/10 [&:nth-child(even)]:border-s">
                <dd className="font-display text-[clamp(28px,3.2vw,38px)] font-bold leading-tight">{st.v}</dd>
                <dt className="text-[14px] text-fg-tertiary dark:text-ink-400">{st.k}</dt>
              </div>
            ))}
          </dl>
        </div>
        <div className="road absolute inset-x-0 bottom-0 opacity-60" aria-hidden="true" />
      </section>

      {/* ============ الخدمات ============ */}
      <section id="services" className="scroll-mt-20 py-24">
        <div className="site-wrap">
          <Heading kicker="ماذا نقدّم" title="خدماتنا" text="اختر خدمة لتعرف تفاصيلها، واحجزها بنقرة." />
          <div className="reveal">
            <ServicesExplorer />
          </div>
        </div>
      </section>

      {/* ============ كيف نعمل ============ */}
      <section id="how" className="scroll-mt-20 bg-surface-2 py-24">
        <div className="site-wrap">
          <Heading kicker="رحلة سيارتك" title="كيف نعمل" />
          <div className="reveal">
            <HowSteps />
          </div>
        </div>
      </section>

      {/* ============ لماذا بساتم ============ */}
      <section id="why" className="scroll-mt-20 py-24">
        <div className="site-wrap grid items-center gap-12 lg:grid-cols-2">
          <p className="reveal font-display text-[clamp(26px,3vw,40px)] leading-[1.6]">
            ثقتك تبدأ من <strong className="text-fg-brand">الوضوح</strong>: تعرف ما الذي سيُصلح، وكم سيكلّف، ومتى تستلم سيارتك، <strong className="text-fg-brand">قبل أن نبدأ</strong>.
          </p>
          <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {FEATURES.map((f, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <li key={f.title} className="reveal flex gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl rounded-es-sig bg-primary-tint text-icon-brand">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span>
                    <b className="block text-[17px]">{f.title}</b>
                    <span className="text-[15px] leading-7 text-fg-secondary">{f.text}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ============ الفريق ============ */}
      {team.length > 0 && (
        <section id="team" className="scroll-mt-20 bg-surface-2 py-24">
          <div className="site-wrap">
            <Heading kicker="من يعتني بسيارتك" title="فريقنا" text="انقر على البطاقة لتتعرّف على تخصص كل عضو وسنوات خبرته." />
            <TeamDeck team={team.map((m) => ({ id: m.id, name: m.name, title: m.title, specialty: m.specialty, years: m.years }))} />
          </div>
        </section>
      )}

      {/* ============ الحجز والتواصل ============ */}
      <section id="contact" className="scroll-mt-20 py-24">
        <div className="site-wrap grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <div id="book" className="reveal scroll-mt-24 rounded-[28px] border border-line bg-surface p-6 shadow-3 sm:p-8">
            <p className="kicker">احجز الآن</p>
            <h2 className="mt-2 text-[clamp(30px,3.6vw,44px)] font-bold leading-tight">احجز موعد صيانة</h2>
            <p className="mb-6 mt-1 text-fg-secondary">أرسل طلبك وسنتصل بك لتأكيد الموعد.</p>
            <BookingForm minDate={todayISO()} />
          </div>
          <aside className="reveal relative isolate overflow-hidden rounded-[28px] border border-line bg-surface p-6 sm:p-8 dark:border-0 dark:bg-ink-950 dark:text-white">
            <div className="glow -top-40 -end-24 -z-10 size-96 bg-[radial-gradient(closest-side,rgba(254,97,17,.16),transparent)] dark:bg-[radial-gradient(closest-side,rgba(254,97,17,.35),transparent)]" aria-hidden="true" />
            <h2 className="text-[28px] font-bold">زورونا</h2>
            <ul className="mt-6 space-y-5 text-[16px]">
              {(s.city || s.address) && (
                <Contact icon={MapPin} label="العنوان">
                  {[s.city, s.address].filter(Boolean).join(' — ')}
                  {s.mapUrl && (
                    <a href={s.mapUrl} target="_blank" rel="noopener" className="mt-1 block text-[14px] font-bold text-fg-brand hover:underline">
                      افتح الموقع على الخريطة ↗
                    </a>
                  )}
                </Contact>
              )}
              {s.workingHours && (
                <Contact icon={Clock} label="أوقات العمل">
                  {s.workingHours}
                </Contact>
              )}
              {s.phone && (
                <Contact icon={Phone} label="الهاتف">
                  <a href={`tel:${s.phone}`} className="num hover:text-fg-brand">
                    {s.phone}
                  </a>
                </Contact>
              )}
              {s.email && (
                <Contact icon={Mail} label="البريد">
                  <a href={`mailto:${s.email}`} dir="ltr" className="hover:text-fg-brand">
                    {s.email}
                  </a>
                </Contact>
              )}
              {!s.phone && !s.address && !s.workingHours && <li className="text-fg-tertiary">ستظهر بيانات التواصل هنا بعد إضافتها من «الإعدادات» في النظام.</li>}
            </ul>
            {wa && (
              <a href={wa} target="_blank" rel="noopener" className="mt-8 flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#1d9b5c] text-[17px] font-bold text-white transition-colors hover:bg-[#178a50]">
                <MessageCircle className="size-5" aria-hidden="true" />
                راسلنا على واتساب
              </a>
            )}
          </aside>
        </div>
      </section>

      <footer className="border-t border-line py-10">
        <div className="site-wrap flex flex-wrap items-center justify-between gap-4 text-[15px] text-fg-tertiary">
          <Logo />
          <span>
            © <span className="num">{new Date().getFullYear()}</span> {s.centerName}
            {s.crNumber && (
              <>
                {' '}· س.ت <span className="num">{s.crNumber}</span>
              </>
            )}
          </span>
        </div>
      </footer>
    </div>
  );
}

function Contact({ icon: Icon, label, children }: { icon: typeof MapPin; label: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl rounded-es-sig bg-primary-tint text-icon-brand dark:bg-white/10 dark:text-brand-300">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span>
        <span className="block text-[13px] text-fg-tertiary dark:text-ink-400">{label}</span>
        {children}
      </span>
    </li>
  );
}
