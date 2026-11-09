import type { Settings } from '@/server/settings';
import { cssString, printFooterLine } from '@/domain/print';
import { LogoMark } from '../brand/Logo';
import { cn } from '../ui/cn';

/**
 * إطار كل مستند مطبوع (بنفس أسلوب ركين):
 * - الترويسة: الشعار واسم المركز يميناً، عنوان المستند في الوسط، الرقم والتاريخ يساراً؛
 * - التذييل في كل ورقة: بيانات المركز في الوسط ورقم الصفحة يساراً؛
 * - الختام تحت آخر محتوى: التوقيعات وختم المركز.
 */
export function PrintSheet({
  s,
  title,
  subtitle,
  meta,
  closing,
  watermark,
  className,
  children,
}: {
  s: Settings;
  title: string;
  subtitle?: React.ReactNode;
  meta: Array<[string, React.ReactNode]>;
  closing: React.ReactNode;
  watermark?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const footer = printFooterLine(s);
  const pageCss = `@media print { @page { @bottom-center { content: ${cssString(footer)}; font-size: 7pt; color: #525a6c; } @bottom-left { content: "صفحة " counter(page) " من " counter(pages); font-size: 7.5pt; color: #525a6c; } } }`;
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageCss }} />
      <main dir="rtl" className={cn('print-page relative my-6 shadow-lg print:my-0', className)}>
        {watermark && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden="true">
            <span className="-rotate-12 rounded-2xl border-4 border-red-600/40 px-8 py-2 text-[64px] font-bold text-red-600/30">{watermark}</span>
          </div>
        )}
        <header className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b-2 border-brand-700 pb-3">
          <div className="flex items-center gap-2.5 justify-self-start">
            <LogoMark className="size-14" title={`شعار ${s.centerName}`} />
            <div className="leading-tight">
              <p className="text-[14px] font-bold text-ink-900">{s.centerName}</p>
              <p className="text-[10px] text-ink-500" dir="ltr">
                {s.centerNameEn}
              </p>
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-[19px] font-bold text-ink-900">{title}</h1>
            {subtitle && <div className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-500">{subtitle}</div>}
          </div>
          <div className="space-y-0.5 justify-self-end text-end text-[11px] text-ink-600">
            {meta.map(([k, v]) => (
              <p key={k}>
                {k}: <span className="font-semibold text-ink-900">{v}</span>
              </p>
            ))}
          </div>
        </header>
        {children}
        {closing}
        {/* على الشاشة يظهر التذييل تحت الورقة، وعند الطباعة يتكرر أسفل كل ورقة. */}
        <p className="mt-4 border-t border-ink-200 pt-1.5 text-center text-[10px] text-ink-500 print:hidden">{footer}</p>
      </main>
    </>
  );
}

/** جدول بعنوان وصفوف من زوجين (تسمية/قيمة) كما في نماذج ركين. */
export function PairGrid({ title, rows }: { title: string; rows: Array<[string, React.ReactNode, string?, React.ReactNode?]> }) {
  return (
    <table className="mb-3 w-full border-collapse text-[12px]">
      <thead>
        <tr>
          <th colSpan={4} className="border border-ink-300 bg-ink-100 px-3 py-1.5 text-center text-[13px] font-bold">
            {title}
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([l1, v1, l2, v2]) => (
          <tr key={l1}>
            <th className="w-[18%] border border-ink-300 bg-ink-50 px-3 py-1 text-start font-semibold text-ink-600">{l1}</th>
            <td className="border border-ink-300 px-3 py-1" colSpan={l2 ? 1 : 3}>
              {v1 || '—'}
            </td>
            {l2 && <th className="w-[18%] border border-ink-300 bg-ink-50 px-3 py-1 text-start font-semibold text-ink-600">{l2}</th>}
            {l2 && <td className="border border-ink-300 px-3 py-1">{v2 || '—'}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** ختم المركز: دائرة متقطعة يُختم فيها يدوياً. */
export function CenterStamp() {
  return <div className="mx-auto flex size-20 items-center justify-center rounded-full border-2 border-dashed border-ink-400 text-[10px] text-ink-500">ختم المركز</div>;
}

function SignBox({ title, name }: { title: string; name?: string | null }) {
  return (
    <div className="space-y-5">
      <p className="font-bold">{title}</p>
      {name ? <p className="-mt-3 text-ink-600">{name}</p> : null}
      <p className="border-t border-ink-400 pt-1 text-ink-500">التوقيع</p>
    </div>
  );
}

/** الختام: توقيع على كل طرف، والختم في الوسط. */
export function SignOff({ right, left }: { right: { title: string; name?: string | null }; left: { title: string; name?: string | null } }) {
  return (
    <div className="print-foot grid grid-cols-3 items-end gap-6 text-center text-[11px]">
      <SignBox {...right} />
      <CenterStamp />
      <SignBox {...left} />
    </div>
  );
}

/** «تويوتا كامري 2021» */
export function carLine(d: { carMake: string | null; carModel: string | null; carYear: string | null }): string {
  return [d.carMake, d.carModel, d.carYear].filter(Boolean).join(' ');
}
