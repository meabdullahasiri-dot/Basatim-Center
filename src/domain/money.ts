/** المبالغ داخل النظام بالهللة (عدد صحيح). */
export function toHalalas(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined) return null;
  const s = normalizeDigits(String(input)).replace(/[,\s٬]/g, '').replace('٫', '.');
  if (s === '') return null;
  if (!/^-?\d+(\.\d{0,2})?$/.test(s)) return null;
  const negative = s.startsWith('-');
  const [whole, frac = ''] = s.replace('-', '').split('.');
  const value = Number(whole) * 100 + Number((frac + '00').slice(0, 2));
  if (!Number.isSafeInteger(value)) return null;
  return negative ? -value : value;
}

/** يحوّل الأرقام العربية الهندية والفارسية إلى لاتينية. */
export function normalizeDigits(s: string): string {
  return s
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

export function halalasToNumberString(h: number): string {
  const neg = h < 0;
  const abs = Math.abs(h);
  return `${neg ? '-' : ''}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`;
}

/** 123456 ← «1,234.56» */
export function formatAmount(h: number): string {
  const neg = h < 0;
  const abs = Math.abs(h);
  const whole = Math.floor(abs / 100).toLocaleString('en-US');
  return `${neg ? '-' : ''}${whole}.${String(abs % 100).padStart(2, '0')}`;
}

export function formatSAR(h: number): string {
  return `${formatAmount(h)} ر.س`;
}

/** الكمية مخزّنة بالآلاف: 1500 = 1.5 */
export function toQtyMilli(input: string | number): number | null {
  const s = normalizeDigits(String(input)).trim();
  if (!/^\d+(\.\d{0,3})?$/.test(s)) return null;
  const [whole, frac = ''] = s.split('.');
  return Number(whole) * 1000 + Number((frac + '000').slice(0, 3));
}

export function formatQty(milli: number): string {
  const whole = Math.floor(milli / 1000);
  const frac = milli % 1000;
  if (!frac) return String(whole);
  return `${whole}.${String(frac).padStart(3, '0').replace(/0+$/, '')}`;
}
