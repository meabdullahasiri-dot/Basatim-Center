/**
 * رمز QR للفاتورة الضريبية المبسطة (المرحلة الأولى من الفوترة الإلكترونية — هيئة الزكاة والضريبة والجمارك).
 * الصيغة TLV مشفرة Base64 بخمسة حقول: اسم البائع، الرقم الضريبي، وقت الإصدار، الإجمالي شامل الضريبة، مبلغ الضريبة.
 */
export function zatcaTlv(fields: { seller: string; vatNumber: string; timestamp: string; total: string; vat: string }): string {
  const values = [fields.seller, fields.vatNumber, fields.timestamp, fields.total, fields.vat];
  const parts: number[] = [];
  values.forEach((v, i) => {
    const bytes = Array.from(new TextEncoder().encode(v));
    if (bytes.length > 255) throw new Error('TLV value too long');
    parts.push(i + 1, bytes.length, ...bytes);
  });
  return bytesToBase64(parts);
}

function bytesToBase64(bytes: number[]): string {
  if (typeof Buffer !== 'undefined') return Buffer.from(bytes).toString('base64');
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}
