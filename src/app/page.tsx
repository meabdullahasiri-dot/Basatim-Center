import type { Metadata } from 'next';
import { asc, eq } from 'drizzle-orm';
import { ArrowLeft, BadgeCheck, Clock, Cog, Disc3, Droplets, FileCheck2, Mail, MapPin, MessageCircle, Phone, ScanLine, ShieldCheck, Snowflake, Sparkles, Users, Wrench, Zap, CircleDot, ReceiptText } from 'lucide-react';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteEffects } from '@/components/site/SiteEffects';
import { HeroCar } from '@/components/site/HeroCar';
import { BookingForm } from '@/components/site/BookingForm';
import { Logo } from '@/components/brand/Logo';
import { FEATURES, SERVICES, STEPS } from '@/config/site';
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

const ICONS = { scan: ScanLine, engine: Wrench, gear: Cog, bolt: Zap, snow: Snowflake, disc: Disc3, oil: Droplets, tire: CircleDot };
const FEATURE_ICONS = [FileCheck2, BadgeCheck, ReceiptText, ShieldCheck];

export default async function Home() {
  const [s, team] = await Promise.all([
    getSettings(),
    getDb().select().from(teamMembers).where(eq(teamMembers.showOnSite, true)).orderBy(asc(teamMembers.sortOrder), asc(teamMembers.createdAt)),
  ]);
  const wa = s.whatsapp ? waLink(s.whatsapp, 'السلام عليكم، أرغب في حجز موعد صيانة لسيارتي.') : null;
  const engineers = team.filter((t) => t.title.includes('مهندس')).length;

  return (
    <div className="site bg-canvas" id="top">
      <SiteEffects />
      <SiteHeader showTeam={team.length > 0} />

      {/* ============ الواجهة ============ */}
      <section data-hero className="relative isolate overflow-hidden bg-ink-950 pb-16 pt-14 text-white sm:pt-20">
        <div className="grid-bg absolute inset-0 -z-10" aria-hidden="true" />
        <div data-hero-glow className="glow -top-64 -end-40 -z-10 size-[820px] bg-[radial-gradient(closest-side,rgba(254,97,17,.30),transparent)]" aria-hidden="true" />
        <div className="glow -bottom-72 start-[6%] -z-10 size-[560px] bg-[radial-gradient(closest-side,rgba(255,179,71,.12),transparent)]" aria-hidden="true" />
        <div className="site-wrap grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <span className="reveal inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[15px] text-ink-300">
              <span className="size-2 rounded-full bg-[#22c55e] shadow-[0_0_10px_#22c55e]" />
              {s.workingHours || 'نستقبل سيارتك اليوم'}
            </span>
            <h1 className="reveal mt-6 text-[clamp(44px,6.6vw,88px)] font-bold leading-[1.12]">
              سيارتك بين أيدٍ
              <br />
              <span className="grad-text inline-block pb-2">تعرفها جيداً</span>
            </h1>
            <p className="reveal mt-4 max-w-xl text-[clamp(18px,2vw,21px)] leading-[1.85] text-ink-300">
              {s.centerName}: فريق من المهندسين والميكانيكيين يشخّص العطل بدقة، ويتفق معك على السعر كتابةً قبل أن يبدأ، ثم يسلّمك سيارتك بفاتورة واضحة.
            </p>
            <div className="reveal mt-8 flex flex-wrap gap-3">
              <a href="#book" className="inline-flex h-14 items-center gap-2 rounded-full bg-brand-600 px-7 text-[17px] font-bold shadow-brand transition-transform hover:-translate-y-0.5 hover:bg-brand-500">
                احجز موعد صيانة
                <ArrowLeft className="size-5" aria-hidden="true" />
              </a>
              {wa ? (
                <a href={wa} target="_blank" rel="noopener" className="inline-flex h-14 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 text-[17px] font-bold transition-colors hover:border-brand-400">
                  <MessageCircle className="size-5" aria-hidden="true" />
                  تواصل عبر واتساب
                </a>
              ) : (
                <a href="#services" className="inline-flex h-14 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 text-[17px] font-bold transition-colors hover:border-brand-400">
                  استعرض خدماتنا
                </a>
              )}
            </div>
          </div>
          <div className="reveal relative">
            <HeroCar />
            <div className="float-y absolute -top-2 start-2 rounded-2xl border border-white/10 bg-ink-900/80 px-4 py-2.5 text-[14px] backdrop-blur sm:start-6">
              <div className="flex items-center gap-2 text-[#4ade80]">
                <ScanLine className="size-4" aria-hidden="true" />
                <b>فحص كمبيوتر</b>
              </div>
              <div className="text-[12px] text-ink-400">تشخيص دقيق قبل أي إصلاح</div>
            </div>
            <div className="float-y absolute -bottom-2 end-2 rounded-2xl border border-white/10 bg-ink-900/80 px-4 py-2.5 text-[14px] backdrop-blur [animation-delay:-2.5s] sm:end-8">
              <div className="flex items-center gap-2 text-brand-300">
                <FileCheck2 className="size-4" aria-hidden="true" />
                <b>اتفاقية بالسعر</b>
              </div>
              <div className="text-[12px] text-ink-400">قبل البدء… لا مفاجآت</div>
            </div>
          </div>
        </div>

        <div className="site-wrap mt-16 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { k: 'خدمات متكاملة', v: <span data-count={SERVICES.length}>{SERVICES.length}</span>, sub: 'تحت سقف واحد' },
            team.length > 0
              ? { k: 'فريق العمل', v: <span data-count={team.length}>{team.length}</span>, sub: engineers ? `منهم ${engineers} مهندسين` : 'مهندسون وفنيون' }
              : { k: 'فريق العمل', v: 'خبراء', sub: 'مهندسون وميكانيكيون' },
            { k: 'التسعير', v: 'مكتوب', sub: 'باتفاقية قبل البدء' },
            { k: 'الفواتير', v: 'إلكترونية', sub: 'مفصّلة وتصلك على واتساب' },
          ].map((st, i) => (
            <div key={i} className="glow-card reveal rounded-[22px] border border-white/10 bg-white/[.03] p-5 transition-colors hover:border-brand-500/50">
              <small className="text-[14px] text-ink-400">{st.k}</small>
              <b className="mt-1 block font-display text-[clamp(28px,3.4vw,40px)] leading-tight">{st.v}</b>
              <span className="text-[13px] text-ink-400">{st.sub}</span>
            </div>
          ))}
        </div>
        <div className="road absolute inset-x-0 bottom-0 opacity-60" aria-hidden="true" />
      </section>

      {/* ============ الخدمات ============ */}
      <section id="services" className="scroll-mt-20 py-24">
        <div className="site-wrap">
          <p className="kicker reveal">ماذا نقدّم</p>
          <h2 className="reveal mt-2 text-[clamp(34px,4.6vw,56px)] font-bold leading-tight">خدماتنا</h2>
          <p className="reveal mt-3 max-w-2xl text-fg-secondary">كل ما تحتاجه سيارتك في مكان واحد، من الفحص بالكمبيوتر حتى الصيانة الدورية.</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((sv) => {
              const Icon = ICONS[sv.icon];
              return (
                <article key={sv.title} className="glow-card reveal group rounded-[22px] border border-line bg-surface p-6 shadow-2 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-brand-500/60">
                  <span className="grid size-12 place-items-center rounded-[14px] rounded-es-sig bg-primary-tint text-icon-brand transition-colors group-hover:bg-brand-600 group-hover:text-white">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-[21px] font-bold">{sv.title}</h3>
                  <p className="mt-2 text-[15px] leading-7 text-fg-secondary">{sv.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ كيف نعمل ============ */}
      <section id="how" className="scroll-mt-20 bg-surface py-24">
        <div className="site-wrap">
          <p className="kicker reveal">رحلة سيارتك</p>
          <h2 className="reveal mt-2 text-[clamp(34px,4.6vw,56px)] font-bold leading-tight">كيف نعمل</h2>
          <ol className="relative mt-12 grid gap-6 md:grid-cols-4">
            <div className="absolute inset-x-[12%] top-7 hidden h-0.5 bg-gradient-to-l from-brand-500 via-brand-300 to-transparent md:block" aria-hidden="true" />
            {STEPS.map((st, i) => (
              <li key={st.title} className="reveal relative">
                <span className="relative grid size-14 place-items-center rounded-2xl rounded-es-sig bg-ink-950 font-display text-[24px] font-bold text-brand-400 shadow-3 dark:bg-surface-3">
                  {i + 1}
                </span>
                <h3 className="mt-5 text-[22px] font-bold">{st.title}</h3>
                <p className="mt-1 text-[16px] leading-7 text-fg-secondary">{st.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============ لماذا بساتم ============ */}
      <section id="why" className="scroll-mt-20 py-24">
        <div className="site-wrap grid items-center gap-12 lg:grid-cols-[1fr_1.15fr]">
          <div>
            <p className="kicker reveal">لماذا بساتم</p>
            <p className="reveal mt-4 font-display text-[clamp(26px,3vw,38px)] leading-[1.6]">
              نؤمن أن ثقتك تبدأ من <strong className="text-fg-brand">الوضوح</strong>: تعرف ما الذي سيُصلح، وكم سيكلّف، ومتى تستلم سيارتك، <strong className="text-fg-brand">قبل أن نبدأ</strong>.
            </p>
            <a href="#book" className="reveal mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-neutral px-6 font-bold text-on-neutral transition-transform hover:-translate-y-0.5">
              <Sparkles className="size-5" aria-hidden="true" />
              جرّب الفرق بنفسك
            </a>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <div key={f.title} className="glow-card reveal rounded-[22px] border border-line bg-surface p-6 shadow-2">
                  <Icon className="size-7 text-icon-brand" aria-hidden="true" />
                  <h3 className="mt-4 text-[19px] font-bold">{f.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-7 text-fg-secondary">{f.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ الفريق ============ */}
      {team.length > 0 && (
        <section id="team" className="scroll-mt-20 bg-surface py-24">
          <div className="site-wrap">
            <p className="kicker reveal">من يعتني بسيارتك</p>
            <h2 className="reveal mt-2 text-[clamp(34px,4.6vw,56px)] font-bold leading-tight">فريقنا</h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((m) => (
                <article key={m.id} className="glow-card reveal overflow-hidden rounded-[22px] border border-line bg-canvas">
                  <div className="relative grid h-36 place-items-center overflow-hidden bg-ink-950">
                    <div className="grid-bg absolute inset-0" aria-hidden="true" />
                    <div className="absolute -top-16 size-48 rounded-full bg-[radial-gradient(closest-side,rgba(254,97,17,.4),transparent)]" aria-hidden="true" />
                    <span className="relative font-display text-[64px] font-bold text-white/90">{m.name.trim().charAt(0)}</span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-[20px] font-bold">{m.name}</h3>
                    <p className="text-[15px] font-semibold text-fg-brand">{m.title}</p>
                    {m.specialty && <p className="mt-1 text-[14px] leading-6 text-fg-secondary">{m.specialty}</p>}
                    {m.years != null && m.years > 0 && (
                      <span className="mt-3 inline-block rounded-full bg-primary-tint px-3 py-0.5 text-[13px] font-bold text-fg-brand">خبرة {m.years} سنة</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
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
          <aside className="reveal relative isolate overflow-hidden rounded-[28px] bg-ink-950 p-6 text-white sm:p-8">
            <div className="glow -top-40 -end-24 -z-10 size-96 bg-[radial-gradient(closest-side,rgba(254,97,17,.35),transparent)]" aria-hidden="true" />
            <h2 className="text-[28px] font-bold">زورونا</h2>
            <ul className="mt-6 space-y-5 text-[16px]">
              {(s.city || s.address) && (
                <Contact icon={MapPin} label="العنوان">
                  {[s.city, s.address].filter(Boolean).join(' — ')}
                  {s.mapUrl && (
                    <a href={s.mapUrl} target="_blank" rel="noopener" className="mt-1 block text-[14px] font-bold text-brand-300 hover:underline">
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
                  <a href={`tel:${s.phone}`} className="num hover:text-brand-300">
                    {s.phone}
                  </a>
                </Contact>
              )}
              {s.email && (
                <Contact icon={Mail} label="البريد">
                  <a href={`mailto:${s.email}`} dir="ltr" className="hover:text-brand-300">
                    {s.email}
                  </a>
                </Contact>
              )}
              {!s.phone && !s.address && !s.workingHours && (
                <li className="text-ink-400">ستظهر بيانات التواصل هنا بعد إضافتها من «الإعدادات» في النظام.</li>
              )}
            </ul>
            {wa && (
              <a href={wa} target="_blank" rel="noopener" className="mt-8 flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#1d9b5c] text-[17px] font-bold transition-colors hover:bg-[#178a50]">
                <MessageCircle className="size-5" aria-hidden="true" />
                راسلنا على واتساب
              </a>
            )}
            <Users className="absolute -bottom-8 -start-8 size-40 text-white/[.04]" aria-hidden="true" />
          </aside>
        </div>
      </section>

      <footer className="border-t border-line py-10">
        <div className="site-wrap flex flex-wrap items-center justify-between gap-4 text-[15px] text-fg-tertiary">
          <Logo />
          <a href="/login" className="hover:text-fg-brand">دخول الموظفين</a>
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
      <span className="grid size-11 shrink-0 place-items-center rounded-xl rounded-es-sig bg-white/10 text-brand-300">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span>
        <span className="block text-[13px] text-ink-400">{label}</span>
        {children}
      </span>
    </li>
  );
}
