import 'server-only';
import { and, gte, lte, sql } from 'drizzle-orm';
import { getDb } from './db/client';
import { transactions } from './db/schema';
import type { MonthPoint } from '@/components/finance/MonthlyChart';

const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

export function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

export function monthRange(key: string): { from: string; to: string } {
  const [y, m] = key.split('-').map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { from: `${key}-01`, to: `${key}-${String(last).padStart(2, '0')}` };
}

export function shiftMonth(key: string, delta: number): string {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export async function monthTotals(from: string, to: string): Promise<{ income: number; expense: number }> {
  const [row] = await getDb()
    .select({
      income: sql<string>`coalesce(sum(case when ${transactions.kind}='income' then ${transactions.amount} end),0)`,
      expense: sql<string>`coalesce(sum(case when ${transactions.kind}='expense' then ${transactions.amount} end),0)`,
    })
    .from(transactions)
    .where(and(gte(transactions.date, from), lte(transactions.date, to)));
  return { income: Number(row.income), expense: Number(row.expense) };
}

export async function lastMonths(endKey: string, n = 6): Promise<MonthPoint[]> {
  const startKey = shiftMonth(endKey, -(n - 1));
  const rows = await getDb()
    .select({
      m: sql<string>`to_char(${transactions.date}, 'YYYY-MM')`,
      income: sql<string>`coalesce(sum(case when ${transactions.kind}='income' then ${transactions.amount} end),0)`,
      expense: sql<string>`coalesce(sum(case when ${transactions.kind}='expense' then ${transactions.amount} end),0)`,
    })
    .from(transactions)
    .where(and(gte(transactions.date, monthRange(startKey).from), lte(transactions.date, monthRange(endKey).to)))
    .groupBy(sql`1`);
  const map = new Map(rows.map((r) => [r.m, r]));
  return Array.from({ length: n }, (_, i) => {
    const key = shiftMonth(startKey, i);
    const r = map.get(key);
    const [, m] = key.split('-').map(Number);
    return { key, label: MONTHS[m - 1], income: Number(r?.income ?? 0), expense: Number(r?.expense ?? 0) };
  });
}
