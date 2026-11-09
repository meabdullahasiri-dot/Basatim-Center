import type { agreements } from '@/server/db/schema';
import type { Settings } from '@/server/settings';
import { formatAmount, formatQty } from '@/domain/money';
import { amountInWords } from '@/domain/amount-words';
import { lineTotal } from '@/domain/totals';
import { AGREEMENT_STATUS, ITEM_KIND } from '@/domain/labels';
import { fmtDate, fmtHijri } from '@/lib/format';
import { PairGrid, PrintSheet, SignOff, carLine } from '../print/PrintSheet';

type Agreement = typeof agreements.$inferSelect;

const cell = 'border border-ink-300 px-2.5 py-1';
const head = 'border border-ink-300 bg-ink-100 px-2.5 py-1 font-bold';

export function AgreementDocument({ ag, s }: { ag: Agreement; s: Settings }) {
  const terms = (ag.terms ?? '')
    .split(/\r?\n/)
    .map((t) => t.trim().replace(/^\d+[.)-]\s*/, ''))
    .filter(Boolean);
  return (
    <PrintSheet
      s={s}
      title="اتفاقية عمل"
      subtitle="Work Order Agreement"
      meta={[
        ['رقم الاتفاقية', <span key="n" dir="ltr">{ag.number}</span>],
        ['التاريخ', <span key="d" dir="ltr">{fmtDate(ag.date)}</span>],
        ['الموافق', fmtHijri(new Date(`${ag.date}T12:00:00+03:00`))],
        ['الحالة', AGREEMENT_STATUS[ag.status].label],
      ]}
      closing={<SignOff right={{ title: 'العميل', name: ag.customerName }} left={{ title: 'الفني المسؤول', name: ag.technician?.split(' — ')[0] }} />}
    >
      <PairGrid
        title="بيانات العميل والسيارة"
        rows={[
          ['اسم العميل', ag.customerName, 'رقم الجوال', ag.customerPhone && <span dir="ltr">{ag.customerPhone}</span>],
          ['السيارة', carLine(ag), 'رقم اللوحة', ag.plateNumber],
          ['قراءة العداد', ag.odometer != null ? `${ag.odometer.toLocaleString('en-US')} كم` : null, 'رقم الهيكل (VIN)', ag.vin && <span dir="ltr">{ag.vin}</span>],
        ]}
      />
      <PairGrid
        title="وصف العمل"
        rows={[
          ['شكوى العميل / المطلوب', <span key="c" className="whitespace-pre-line">{ag.complaint}</span>],
          ['التشخيص المبدئي', ag.diagnosis && <span className="whitespace-pre-line">{ag.diagnosis}</span>],
          ['الفني المسؤول', ag.technician, 'موعد التسليم المتوقع', ag.expectedDelivery && <span dir="ltr">{fmtDate(ag.expectedDelivery)}</span>],
          ...(ag.notes ? [['ملاحظات', ag.notes] as [string, React.ReactNode]] : []),
        ]}
      />

      {ag.items.length > 0 && (
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr>
              <th colSpan={6} className={`${head} text-center text-[13px]`}>
                الأعمال والقطع المتوقعة (تقديرية)
              </th>
            </tr>
            <tr>
              <th className={`${head} w-9 text-center`}>م</th>
              <th className={`${head} text-start`}>البيان</th>
              <th className={`${head} w-24 text-center`}>النوع</th>
              <th className={`${head} w-16 text-center`}>الكمية</th>
              <th className={`${head} w-24 text-center`}>السعر التقديري</th>
              <th className={`${head} w-28 text-center`}>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {ag.items.map((it, i) => (
              <tr key={i} className="avoid-break">
                <td className={`${cell} text-center tabular-nums`}>{i + 1}</td>
                <td className={cell}>{it.description}</td>
                <td className={`${cell} text-center text-ink-600`}>{ITEM_KIND[it.kind]}</td>
                <td className={`${cell} text-center tabular-nums`}>{formatQty(it.qty)}</td>
                <td className={`${cell} text-center tabular-nums`}>{formatAmount(it.unitPrice)}</td>
                <td className={`${cell} text-center font-semibold tabular-nums`}>{formatAmount(lineTotal(it))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <table className="avoid-break mt-3 w-full border-collapse text-[12px]">
        <tbody>
          <tr>
            <th className="w-[18%] border border-ink-300 bg-ink-100 px-3 py-1 text-start font-bold">التكلفة التقديرية</th>
            <td className="border border-ink-300 px-3 py-1">
              <strong className="tabular-nums">#{formatAmount(ag.estimatedTotal)}#</strong> {ag.estimatedTotal > 0 ? amountInWords(ag.estimatedTotal) : ''}
            </td>
          </tr>
          <tr>
            <th className="border border-ink-300 bg-ink-50 px-3 py-1 text-start font-semibold text-ink-600">العربون المدفوع</th>
            <td className="border border-ink-300 px-3 py-1 tabular-nums">{formatAmount(ag.deposit)} ر.س</td>
          </tr>
        </tbody>
      </table>

      {terms.length > 0 && (
        <section className="avoid-break mt-3 border border-ink-300">
          <h2 className="border-b border-ink-300 bg-ink-100 px-3 py-1.5 text-center text-[13px] font-bold">الشروط والأحكام</h2>
          <ol className="list-decimal py-1.5 pe-3 ps-8 text-[10.5px] leading-5 text-ink-700">
            {terms.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ol>
        </section>
      )}

      <p className="avoid-break mt-3 text-[11.5px] leading-6">
        أقر أنا <b>{ag.customerName}</b> بأنني سلّمت السيارة الموضحة بياناتها أعلاه إلى {s.centerName}، واطلعت على الأعمال المطلوبة والتكلفة التقديرية والشروط والأحكام، وأوافق عليها
        {ag.customerApproved ? '.' : '، ولا يبدأ العمل إلا بعد توقيعي.'}
      </p>
    </PrintSheet>
  );
}
