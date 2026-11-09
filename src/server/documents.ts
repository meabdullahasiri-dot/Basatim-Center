import 'server-only';
import { z } from 'zod';
import type { LineItem } from './db/schema';
import { normalizeDigits, toHalalas, toQtyMilli } from '@/domain/money';
import { optStr, str } from './actions/_helpers';

const rawItem = z.object({
  description: z.string().trim().min(1).max(300),
  kind: z.enum(['service', 'part']),
  qty: z.string(),
  unitPrice: z.string(),
});

export function parseItems(fd: FormData, { allowEmpty = false } = {}): { items: LineItem[] } | { error: string } {
  let raw: unknown;
  try {
    raw = JSON.parse(str(fd, 'items') || '[]');
  } catch {
    return { error: 'تعذّر قراءة البنود.' };
  }
  const parsed = z.array(z.unknown()).max(100).safeParse(raw);
  if (!parsed.success) return { error: 'تعذّر قراءة البنود.' };
  const items: LineItem[] = [];
  for (const [i, r] of parsed.data.entries()) {
    const row = rawItem.safeParse(r);
    if (!row.success) {
      // تجاهل الصف الفارغ تماماً
      if (r && typeof r === 'object' && !String((r as { description?: unknown }).description ?? '').trim()) continue;
      return { error: `البند رقم ${i + 1}: اكتب وصف البند.` };
    }
    const qty = toQtyMilli(row.data.qty || '1');
    const price = toHalalas(row.data.unitPrice || '0');
    if (qty === null || qty <= 0) return { error: `البند رقم ${i + 1}: الكمية غير صحيحة.` };
    if (price === null || price < 0) return { error: `البند رقم ${i + 1}: السعر غير صحيح.` };
    items.push({ description: row.data.description, kind: row.data.kind, qty, unitPrice: price });
  }
  if (!allowEmpty && items.length === 0) return { error: 'أضف بنداً واحداً على الأقل.' };
  return { items };
}

export function parseCustomer(fd: FormData): { value: CustomerFields } | { fieldErrors: Record<string, string> } {
  const customerName = str(fd, 'customerName').slice(0, 120);
  const fieldErrors: Record<string, string> = {};
  if (customerName.length < 2) fieldErrors.customerName = 'اكتب اسم العميل.';
  const phone = normalizeDigits(str(fd, 'customerPhone')).replace(/[^\d+]/g, '');
  if (phone && !/^\+?\d{9,15}$/.test(phone)) fieldErrors.customerPhone = 'رقم الجوال غير صحيح.';
  const odoRaw = normalizeDigits(str(fd, 'odometer')).replace(/[,\s]/g, '');
  if (odoRaw && !/^\d{1,7}$/.test(odoRaw)) fieldErrors.odometer = 'قراءة العداد أرقام فقط.';
  if (Object.keys(fieldErrors).length) return { fieldErrors };
  return {
    value: {
      customerName,
      customerPhone: phone || null,
      customerVat: optStr(fd, 'customerVat', 20),
      carMake: optStr(fd, 'carMake', 60),
      carModel: optStr(fd, 'carModel', 60),
      carYear: optStr(fd, 'carYear', 10),
      plateNumber: optStr(fd, 'plateNumber', 30),
      vin: optStr(fd, 'vin', 30),
      odometer: odoRaw ? Number(odoRaw) : null,
    },
  };
}

export interface CustomerFields {
  customerName: string;
  customerPhone: string | null;
  customerVat: string | null;
  carMake: string | null;
  carModel: string | null;
  carYear: string | null;
  plateNumber: string | null;
  vin: string | null;
  odometer: number | null;
}
