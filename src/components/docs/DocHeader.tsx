import { LogoMark } from '../brand/Logo';
import type { Settings } from '@/server/settings';

export function DocHeader({ s, title, titleEn, number, date }: { s: Settings; title: string; titleEn: string; number: string; date: string }) {
  return (
    <header className="relative overflow-hidden rounded-2xl bg-[#0f1115] p-5 text-white print:rounded-xl">
      <div className="pointer-events-none absolute -top-20 -start-10 size-56 rounded-full bg-[radial-gradient(closest-side,rgba(254,97,17,.45),transparent)]" aria-hidden="true" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <LogoMark className="size-14" />
          <div>
            <div className="font-display text-[20px] font-bold leading-tight">{s.centerName}</div>
            <div className="text-[12px] text-[#b1b8c4]" dir="ltr">
              {s.centerNameEn}
            </div>
            <div className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-[#b1b8c4]">
              {s.crNumber && <span>س.ت: <span className="num">{s.crNumber}</span></span>}
              {s.vatEnabled && s.vatNumber && <span>الرقم الضريبي: <span className="num">{s.vatNumber}</span></span>}
              {s.phone && <span>هاتف: <span className="num">{s.phone}</span></span>}
            </div>
          </div>
        </div>
        <div className="text-end">
          <div className="font-display text-[20px] font-bold text-[#ffae71]">{title}</div>
          <div className="text-[11px] uppercase tracking-wider text-[#b1b8c4]" dir="ltr">
            {titleEn}
          </div>
          <div className="mt-2 text-[12px]">
            <span className="text-[#b1b8c4]">الرقم: </span>
            <b className="num">{number}</b>
          </div>
          <div className="text-[12px]">
            <span className="text-[#b1b8c4]">التاريخ: </span>
            <span className="num">{date}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export function PartyBox({ d }: { d: { customerName: string; customerPhone: string | null; customerVat?: string | null; carMake: string | null; carModel: string | null; carYear: string | null; plateNumber: string | null; vin: string | null; odometer: number | null } }) {
  const car = [d.carMake, d.carModel, d.carYear].filter(Boolean).join(' ');
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
      <div className="rounded-xl border border-[#d5d9e0] p-3">
        <div className="mb-1 text-[11px] font-semibold text-[#c63408]">العميل</div>
        <div className="font-semibold">{d.customerName}</div>
        {d.customerPhone && <div className="num text-start text-[#525a6c]">{d.customerPhone}</div>}
        {d.customerVat && (
          <div className="text-[#525a6c]">
            الرقم الضريبي: <span className="num">{d.customerVat}</span>
          </div>
        )}
      </div>
      <div className="rounded-xl border border-[#d5d9e0] p-3">
        <div className="mb-1 text-[11px] font-semibold text-[#c63408]">السيارة</div>
        <div className="font-semibold">{car || '—'}</div>
        <div className="flex flex-wrap gap-x-3 text-[#525a6c]">
          {d.plateNumber && <span>اللوحة: {d.plateNumber}</span>}
          {d.odometer != null && (
            <span>
              العداد: <span className="num">{d.odometer.toLocaleString('en-US')}</span> كم
            </span>
          )}
          {d.vin && (
            <span>
              VIN: <span className="num">{d.vin}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
