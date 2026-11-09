/**
 * Amounts in Arabic words («التفقيط») as written on Saudi financial documents:
 * «فقط ثمانية آلاف ريال لا غير». Riyals and halalas, up to 999,999,999.99.
 */

const UNITS = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
const TEENS = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
const TENS = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
const HUNDREDS = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

/** 1..999 */
function belowThousand(n: number): string {
  const parts: string[] = [];
  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (h) parts.push(HUNDREDS[h]);
  if (rest >= 10 && rest < 20) parts.push(TEENS[rest - 10]);
  else if (rest) {
    const u = rest % 10;
    const t = Math.floor(rest / 10);
    // «خمسة وعشرون»: the unit comes first.
    if (u && t) parts.push(`${UNITS[u]} و${TENS[t]}`);
    else parts.push(u ? UNITS[u] : TENS[t]);
  }
  return parts.join(' و');
}

/** A count of thousands or millions: «ألف / ألفان / ثلاثة آلاف / أحد عشر ألفاً / مائة ألف». */
function scaled(count: number, one: string, two: string, few: string, many: string): string {
  if (count === 1) return one;
  if (count === 2) return two;
  const words = belowThousand(count);
  if (count >= 3 && count <= 10) return `${words} ${few}`;
  const lastTwo = count % 100;
  return `${words} ${lastTwo >= 11 && lastTwo <= 99 ? many : one}`;
}

/** Whole number in words (0 → «صفر»). */
export function numberInWords(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 999_999_999) throw new RangeError('numberInWords: 0..999,999,999');
  if (n === 0) return 'صفر';
  const millions = Math.floor(n / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1000);
  const rest = n % 1000;
  const parts: string[] = [];
  if (millions) parts.push(scaled(millions, 'مليون', 'مليونان', 'ملايين', 'مليوناً'));
  if (thousands) parts.push(scaled(thousands, 'ألف', 'ألفان', 'آلاف', 'ألفاً'));
  if (rest) parts.push(belowThousand(rest));
  return parts.join(' و');
}

/** «فقط ثمانية آلاف ريال وخمسون هللة لا غير» from an amount in halalas. */
export function amountInWords(halalas: number): string {
  const riyals = Math.floor(halalas / 100);
  const h = halalas % 100;
  const text = h ? `${numberInWords(riyals)} ريال و${numberInWords(h)} هللة` : `${numberInWords(riyals)} ريال`;
  return `فقط ${text} لا غير`;
}
