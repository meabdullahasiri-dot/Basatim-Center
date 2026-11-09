import { describe, expect, it } from 'vitest';
import { formatAmount, formatQty, toHalalas, toQtyMilli } from '../src/domain/money';
import { computeTotals, paymentStatus } from '../src/domain/totals';
import { zatcaTlv } from '../src/domain/zatca';
import { can } from '../src/domain/permissions';

describe('money', () => {
  it('parses riyals to halalas', () => {
    expect(toHalalas('150')).toBe(15000);
    expect(toHalalas('1,250.5')).toBe(125050);
    expect(toHalalas('١٢٠٫٧٥')).toBe(12075);
    expect(toHalalas('abc')).toBeNull();
    expect(toHalalas('1.234')).toBeNull();
  });
  it('formats', () => {
    expect(formatAmount(123456)).toBe('1,234.56');
    expect(formatQty(1500)).toBe('1.5');
    expect(toQtyMilli('2')).toBe(2000);
  });
});

describe('totals', () => {
  it('computes VAT after discount', () => {
    const t = computeTotals([{ qty: 1000, unitPrice: 20000 }, { qty: 2000, unitPrice: 5000 }], 5000, 15);
    expect(t).toEqual({ subtotal: 30000, discount: 5000, taxable: 25000, vatAmount: 3750, total: 28750 });
  });
  it('caps discount', () => {
    expect(computeTotals([{ qty: 1000, unitPrice: 100 }], 500, 0).total).toBe(0);
  });
  it('status', () => {
    expect(paymentStatus(100, 0)).toBe('unpaid');
    expect(paymentStatus(100, 50)).toBe('partial');
    expect(paymentStatus(100, 100)).toBe('paid');
  });
});

describe('zatca', () => {
  it('encodes the TLV sample from the ZATCA guideline', () => {
    const b64 = zatcaTlv({ seller: 'Bobs Records', vatNumber: '310122393500003', timestamp: '2022-04-25T15:30:00Z', total: '1000.00', vat: '150.00' });
    expect(b64).toBe('AQxCb2JzIFJlY29yZHMCDzMxMDEyMjM5MzUwMDAwMwMUMjAyMi0wNC0yNVQxNTozMDowMFoEBzEwMDAuMDAFBjE1MC4wMA==');
  });
});

describe('permissions', () => {
  it('manager can everything, staff only granted', () => {
    expect(can({ role: 'manager', permissions: [] }, 'manage')).toBe(true);
    expect(can({ role: 'staff', permissions: ['invoices'] }, 'invoices')).toBe(true);
    expect(can({ role: 'staff', permissions: ['invoices'] }, 'agreements')).toBe(false);
  });
});

import { amountInWords } from '../src/domain/amount-words';
import { cssString } from '../src/domain/print';

describe('print helpers', () => {
  it('writes amounts in Arabic words', () => {
    expect(amountInWords(59000)).toBe('فقط خمسمائة وتسعون ريال لا غير');
    expect(amountInWords(125050)).toBe('فقط ألف ومائتان وخمسون ريال وخمسون هللة لا غير');
  });
  it('escapes CSS strings', () => {
    expect(cssString('a"b</style>')).toBe('"a\\"b\\3C /style>"');
  });
});
