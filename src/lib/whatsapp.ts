import { normalizeDigits } from '@/domain/money';

/** رابط واتساب برقم سعودي: 05xxxxxxxx ← 9665xxxxxxxx */
export function waLink(phone: string, text?: string): string {
  let p = normalizeDigits(phone).replace(/[^\d]/g, '');
  if (p.startsWith('00')) p = p.slice(2);
  if (p.startsWith('05')) p = '966' + p.slice(1);
  else if (p.startsWith('5') && p.length === 9) p = '966' + p;
  return `https://wa.me/${p}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}
