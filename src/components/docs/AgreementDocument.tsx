import type { agreements } from '@/server/db/schema';
import type { Settings } from '@/server/settings';
import { formatAmount, formatQty } from '@/domain/money';
import { lineTotal } from '@/domain/totals';
import { ITEM_KIND } from '@/domain/labels';
import { fmtDate } from '@/lib/format';
import { DocHeader, PartyBox } from './DocHeader';

type Agreement = typeof agreements.$inferSelect;

export function AgreementDocument({ ag, s }: { ag: Agreement; s: Settings }) {
  return (
    <article className="print-sheet mx-auto w-full max-w-[210mm] bg-white p-6 text-[#1b1e24] shadow-3 sm:rounded-card" style={{ colorScheme: 'light' }}>
      <DocHeader s={s} title="اتفاقية عمل" titleEn="Work Order Agreement" number={ag.number} date={fmtDate(ag.date)} />
      <PartyBox d={ag} />
      <div className="mt-3 grid grid-cols-2 gap-3 text-[13px]">
        <Box title="شكوى العميل / المطلوب">{ag.complaint}</Box>
        <Box title="التشخيص المبدئي">{ag.diagnosis || '—'}</Box>
      </div>
      {ag.items.length > 0 && (
        <table className="mt-4 w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f6f7f9] text-[11px] text-[#525a6c]">
              <th className="rounded-s-lg px-2 py-2 text-start">#</th>
              <th className="px-2 py-2 text-start">العمل / القطعة</th>
              <th className="px-2 py-2 text-start">النوع</th>
              <th className="px-2 py-2 text-center">الكمية</th>
              <th className="px-2 py-2 text-center">السعر التقديري</th>
              <th className="rounded-e-lg px-2 py-2 text-end">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {ag.items.map((it, i) => (
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
      )}
      <div className="mt-3 grid grid-cols-3 gap-3 text-[13px]">
        <Stat label="التكلفة التقديرية" value={`${formatAmount(ag.estimatedTotal)} ر.س`} dark />
        <Stat label="العربون المدفوع" value={`${formatAmount(ag.deposit)} ر.س`} />
        <Stat label="موعد التسليم المتوقع" value={ag.expectedDelivery ? fmtDate(ag.expectedDelivery) : '—'} />
      </div>
      {ag.technician && (
        <p className="mt-3 text-[13px]">
          <span className="text-[#677185]">الفني المسؤول: </span>
          <b>{ag.technician}</b>
        </p>
      )}
      {ag.notes && (
        <p className="mt-1 text-[13px]">
          <span className="text-[#677185]">ملاحظات: </span>
          {ag.notes}
        </p>
      )}
      {ag.terms && (
        <section className="mt-4 rounded-xl bg-[#f6f7f9] p-3">
          <h3 className="mb-1 text-[12px] font-bold text-[#c63408]">الشروط والأحكام</h3>
          <p className="whitespace-pre-line text-[11.5px] leading-6 text-[#434957]">{ag.terms}</p>
        </section>
      )}
      <p className="mt-4 text-[12px] text-[#434957]">
        أقر أنا العميل الموضح اسمه أعلاه بموافقتي على ما ورد في هذه الاتفاقية{ag.customerApproved ? ' (تمت الموافقة عند الاستلام)' : ''}.
      </p>
      <div className="mt-10 grid grid-cols-3 gap-6 text-[12px] text-[#525a6c]">
        <div className="border-t border-dashed border-[#b1b8c4] pt-2 text-center">توقيع العميل</div>
        <div className="border-t border-dashed border-[#b1b8c4] pt-2 text-center">الفني المسؤول</div>
        <div className="border-t border-dashed border-[#b1b8c4] pt-2 text-center">ختم المركز</div>
      </div>
      <footer className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-[#eceef2] pt-3 text-[11px] text-[#677185]">
        <span>{[s.city, s.address].filter(Boolean).join(' — ')}</span>
        <span>{s.phone && <span className="num">{s.phone}</span>}</span>
      </footer>
    </article>
  );
}

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#d5d9e0] p-3">
      <div className="mb-1 text-[11px] font-semibold text-[#c63408]">{title}</div>
      <p className="whitespace-pre-line">{children}</p>
    </div>
  );
}

function Stat({ label, value, dark }: { label: string; value: string; dark?: boolean }) {
  return (
    <div className={`rounded-xl px-3 py-2 ${dark ? 'bg-[#0f1115] text-white' : 'border border-[#d5d9e0]'}`}>
      <div className={`text-[11px] ${dark ? 'text-[#b1b8c4]' : 'text-[#677185]'}`}>{label}</div>
      <div className="num text-start text-[15px] font-bold">{value}</div>
    </div>
  );
}
