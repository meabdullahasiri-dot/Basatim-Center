import type { invoices } from '@/server/db/schema';
import type { Settings } from '@/server/settings';
import { formatAmount, formatQty, halalasToNumberString } from '@/domain/money';
import { lineTotal } from '@/domain/totals';
import { zatcaTlv } from '@/domain/zatca';
import { ITEM_KIND } from '@/domain/labels';
import { fmtDateTime } from '@/lib/format';
import { QrCode } from '../ui/QrCode';
import { DocHeader, PartyBox } from './DocHeader';

type Invoice = typeof invoices.$inferSelect;

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
  return (
    <article className="print-sheet relative mx-auto w-full max-w-[210mm] bg-white p-6 text-[#1b1e24] shadow-3 sm:rounded-card" style={{ colorScheme: 'light' }}>
      {inv.status === 'void' && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden="true">
          <span className="-rotate-12 rounded-2xl border-4 border-red-600/40 px-8 py-2 font-display text-[64px] font-bold text-red-600/30">ملغاة</span>
        </div>
      )}
      <DocHeader s={s} title={taxed ? 'فاتورة ضريبية مبسطة' : 'فاتورة'} titleEn={taxed ? 'Simplified Tax Invoice' : 'Invoice'} number={inv.number} date={fmtDateTime(inv.issuedAt)} />
      <PartyBox d={inv} />

      <table className="mt-4 w-full border-collapse text-[13px]">
        <thead>
          <tr className="bg-[#f6f7f9] text-[11px] text-[#525a6c]">
            <th className="rounded-s-lg px-2 py-2 text-start">#</th>
            <th className="px-2 py-2 text-start">الوصف</th>
            <th className="px-2 py-2 text-start">النوع</th>
            <th className="px-2 py-2 text-center">الكمية</th>
            <th className="px-2 py-2 text-center">سعر الوحدة</th>
            <th className="rounded-e-lg px-2 py-2 text-end">الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          {inv.items.map((it, i) => (
            <tr key={i} className="border-b border-[#eceef2]">
              <td className="px-2 py-2 num text-start text-[#677185]">{i + 1}</td>
              <td className="px-2 py-2 font-medium">{it.description}</td>
              <td className="px-2 py-2 text-[#525a6c]">{ITEM_KIND[it.kind]}</td>
              <td className="px-2 py-2 text-center num">{formatQty(it.qty)}</td>
              <td className="px-2 py-2 text-center num">{formatAmount(it.unitPrice)}</td>
              <td className="px-2 py-2 text-end font-semibold num">{formatAmount(lineTotal(it))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex items-start justify-between gap-6">
        <div className="flex items-start gap-3">
          {qr && (
            <div className="rounded-xl border border-[#d5d9e0] p-1.5">
              <QrCode value={qr} size={112} label="رمز الفاتورة الضريبية" />
            </div>
          )}
          <div className="max-w-[260px] text-[12px] text-[#525a6c]">
            {inv.notes && (
              <p className="mb-2">
                <b className="text-[#1b1e24]">ملاحظات: </b>
                {inv.notes}
              </p>
            )}
            {s.invoiceFooter && <p className="whitespace-pre-line">{s.invoiceFooter}</p>}
          </div>
        </div>
        <dl className="w-64 shrink-0 space-y-1 text-[13px]">
          <Line label="المجموع">{formatAmount(inv.subtotal)}</Line>
          {inv.discount > 0 && <Line label="الخصم">-{formatAmount(inv.discount)}</Line>}
          {taxed && <Line label="الإجمالي قبل الضريبة">{formatAmount(inv.subtotal - inv.discount)}</Line>}
          {taxed && <Line label={`ضريبة القيمة المضافة ${inv.vatRate}%`}>{formatAmount(inv.vatAmount)}</Line>}
          <div className="flex items-center justify-between rounded-xl bg-[#0f1115] px-3 py-2 text-[15px] font-bold text-white">
            <dt>الإجمالي{taxed ? ' شامل الضريبة' : ''}</dt>
            <dd className="num">{formatAmount(inv.total)} ر.س</dd>
          </div>
          {inv.status !== 'void' && (
            <>
              <Line label="المدفوع">{formatAmount(inv.paid)}</Line>
              <Line label="المتبقي" strong>
                {formatAmount(inv.total - inv.paid)}
              </Line>
            </>
          )}
        </dl>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-8 text-[12px] text-[#525a6c]">
        <div className="border-t border-dashed border-[#b1b8c4] pt-2 text-center">توقيع المركز</div>
        <div className="border-t border-dashed border-[#b1b8c4] pt-2 text-center">توقيع العميل</div>
      </div>
      <footer className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-[#eceef2] pt-3 text-[11px] text-[#677185]">
        <span>{[s.city, s.address].filter(Boolean).join(' — ')}</span>
        <span>شكراً لثقتكم بمركز بساتم</span>
      </footer>
    </article>
  );
}

function Line({ label, children, strong }: { label: string; children: React.ReactNode; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-1 ${strong ? 'font-bold text-[#c63408]' : 'text-[#434957]'}`}>
      <dt>{label}</dt>
      <dd className="num">{children}</dd>
    </div>
  );
}
