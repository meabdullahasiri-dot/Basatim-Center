/** سطر التذييل في كل ورقة مطبوعة: الاسم · السجل التجاري · الرقم الضريبي · الهاتف · العنوان. */
export function printFooterLine(s: {
  centerName: string;
  crNumber: string | null;
  vatEnabled: boolean;
  vatNumber: string | null;
  phone: string | null;
  city: string | null;
  address: string | null;
}): string {
  const place = [s.city, s.address].filter(Boolean).join(' — ');
  return [
    s.crNumber ? `السجل التجاري: ${s.crNumber}` : null,
    s.vatEnabled && s.vatNumber ? `الرقم الضريبي: ${s.vatNumber}` : null,
    s.phone ? `هاتف: ${s.phone}` : null,
    place || null,
  ]
    .filter(Boolean)
    .join(' · ');
}

/** نص CSS آمن لا يُنهي السلسلة ولا عنصر <style> المحيط (من ركين). */
export function cssString(text: string): string {
  return `"${text.replace(/[\\"]/g, '\\$&').replace(/[\r\n]+/g, ' ').replace(/</g, '\\3C ')}"`;
}
