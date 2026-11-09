import type { invoices } from '@/server/db/schema';
import type { Settings } from '@/server/settings';
import { formatAmount, formatQty, halalasToNumberString } from '@/domain/money';
import { amountInWords } from '@/domain/amount-words';
import { lineTotal } from '@/domain/totals';
import { zatcaTlv } from '@/domain/zatca';
import { INVOICE_STATUS, ITEM_KIND } from '@/domain/labels';
import { fmtDateTime, fmtHijri } from '@/lib/format';
import { QrCode } from '../ui/QrCode';
import { PairGrid, PrintSheet, SignOff, carLine } from '../print/PrintSheet';

type Invoice = typeof invoices.$inferSelect;

const cell = 'border border-ink-300 px-2.5 py-1.5';
const head = 'border border-ink-300 bg-ink-100 px-2.5 py-1.5 font-bold';

export function InvoiceDocument({ inv, s }: { inv: Invoice; s: Settings }) {
  const taxed = inv.vatRate > 0;
  const qr = taxed
    ? zatcaTlv({
        seller: s.centerName,
        vatNumber: s.vatNumber ?? '',
        timestamp: inv.issuedAt.toISOString().replace(/\.\d{3}Z$/, 'Z'),
        total: halalasToNumberString(inv.total),
        vat: halalasToNumberString(inv.vatAmount),
      })
    : null;
  const remaining = inv.total - inv.paid;

  return (
    <PrintSheet
      s={s}
      title={taxed ? 'فاتورة ضريبية مبسطة' : 'فاتورة'}
      subtitle={taxed ? 'Simplified Tax Invoice' : 'Invoice'}
      watermark={inv.status === 'void' ? 'ملغاة' : undefined}
      meta={[
        ['رقم الفاتورة', <span key="n" dir="ltr">{inv.number}</span>],
        ['التاريخ', <span key="d" dir="ltr">{fmtDateTime(inv.issuedAt)}</span>],
        ['الموافق', fmtHijri(inv.issuedAt)],
        ['الحالة', INVOICE_STATUS[inv.status].label],
      ]}
      closing={<SignOff right={{ title: 'المستلم (العميل)', name: inv.customerName }} left={{ title: 'المحاسب' }} />}
    >
      <PairGrid
        title="بيانات العميل والسيارة"
        rows={[
          ['اسم العميل', inv.customerName, 'رقم الجوال', inv.customerPhone && <span dir="ltr">{inv.customerPhone}</span>],
          ...(inv.customerVat ? [['الرقم الضريبي للعميل', <span key="v" dir="ltr">{inv.customerVat}</span>] as [string, React.ReactNode]] : []),
          ['السيارة', carLine(inv), 'رقم اللوحة', inv.plateNumber],
          ['قراءة العداد', inv.odometer != null ? `${inv.odometer.toLocaleString('en-US')} كم` : null, 'رقم الهيكل (VIN)', inv.vin && <span dir="ltr">{inv.vin}</span>],
        ]}
      />

      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr>
            <th className={`${head} w-9 text-center`}>م</th>
            <th className={`${head} text-start`}>البيان</th>
            <th className={`${head} w-24 text-center`}>النوع</th>
            <th className={`${head} w-16 text-center`}>الكمية</th>
            <th className={`${head} w-24 text-center`}>سعر الوحدة</th>
            <th className={`${head} w-28 text-center`}>الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          {inv.items.map((it, i) => (
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

      <div className="avoid-break mt-4 grid grid-cols-[1fr_auto] items-start gap-6">
        <div className="space-y-2 text-[12px]">
          {qr && (
            <div className="flex items-center gap-3">
              <div className="border border-ink-300 p-1">
                <QrCode value={qr} size={104} label="رمز الفاتورة الضريبية" />
              </div>
              <p className="max-w-48 text-[10.5px] leading-5 text-ink-500">رمز الاستجابة السريعة للفاتورة الضريبية وفق متطلبات هيئة الزكاة والضريبة والجمارك.</p>
            </div>
          )}
          {inv.notes && (
            <p>
              <b>ملاحظات: </b>
              {inv.notes}
            </p>
          )}
          {s.invoiceFooter && <p className="whitespace-pre-line text-ink-600">{s.invoiceFooter}</p>}
        </div>
        <table className="w-72 border-collapse text-[12px]">
          <tbody>
            <Total label="المجموع" value={inv.subtotal} />
            {inv.discount > 0 && <Total label="الخصم" value={-inv.discount} />}
            {taxed && <Total label="الإجمالي قبل الضريبة" value={inv.subtotal - inv.discount} />}
            {taxed && <Total label={`ضريبة القيمة المضافة (${inv.vatRate}%)`} value={inv.vatAmount} />}
            <Total label={taxed ? 'الإجمالي شامل الضريبة' : 'الإجمالي'} value={inv.total} strong />
            {inv.status !== 'void' && <Total label="المدفوع" value={inv.paid} />}
            {inv.status !== 'void' && <Total label="المتبقي" value={remaining} strong={remaining > 0} />}
          </tbody>
        </table>
      </div>

      <table className="avoid-break mt-3 w-full border-collapse text-[12px]">
        <tbody>
          <tr>
            <th className="w-[18%] border border-ink-300 bg-ink-50 px-3 py-1.5 text-start font-semibold text-ink-600">المبلغ كتابةً</th>
            <td className="border border-ink-300 px-3 py-1.5">
              <strong className="tabular-nums">#{formatAmount(inv.total)}#</strong> {amountInWords(inv.total)}
            </td>
          </tr>
        </tbody>
      </table>
    </PrintSheet>
  );
}

function Total({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <tr>
      <th className={`border border-ink-300 px-3 py-1.5 text-start ${strong ? 'bg-ink-100 font-bold text-ink-900' : 'bg-ink-50 font-semibold text-ink-600'}`}>{label}</th>
      <td className={`w-28 border border-ink-300 px-3 py-1.5 text-center tabular-nums ${strong ? 'bg-ink-100 font-bold' : ''}`}>
        {formatAmount(value)}
        {strong && <span className="ms-1 text-[10px] font-semibold">ر.س</span>}
      </td>
    </tr>
  );
}
