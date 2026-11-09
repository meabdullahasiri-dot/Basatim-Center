export interface Line {
  qty: number; // بالآلاف
  unitPrice: number; // بالهللة
}

export function lineTotal(l: Line): number {
  return Math.round((l.qty * l.unitPrice) / 1000);
}

export interface Totals {
  subtotal: number;
  discount: number;
  taxable: number;
  vatAmount: number;
  total: number;
}

/** إجمالي الفاتورة: (المجموع − الخصم) + الضريبة. الأسعار المدخلة غير شاملة للضريبة. */
export function computeTotals(lines: Line[], discount: number, vatRate: number): Totals {
  const subtotal = lines.reduce((s, l) => s + lineTotal(l), 0);
  const d = Math.min(Math.max(0, discount), subtotal);
  const taxable = subtotal - d;
  const vatAmount = Math.round((taxable * vatRate) / 100);
  return { subtotal, discount: d, taxable, vatAmount, total: taxable + vatAmount };
}

export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

export function paymentStatus(total: number, paid: number): PaymentStatus {
  if (paid <= 0) return total === 0 ? 'paid' : 'unpaid';
  return paid >= total ? 'paid' : 'partial';
}
