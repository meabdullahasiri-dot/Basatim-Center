import { sql } from 'drizzle-orm';
import { bigint, boolean, date, index, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/** المبالغ كلها أعداد صحيحة بالهللة (1 ريال = 100 هللة) لتجنّب أخطاء الكسور. */
const money = (name: string) => bigint(name, { mode: 'number' }).notNull().default(0);

export const userRole = pgEnum('user_role', ['manager', 'staff']);
export const invoiceStatus = pgEnum('invoice_status', ['unpaid', 'partial', 'paid', 'void']);
export const agreementStatus = pgEnum('agreement_status', ['open', 'in_progress', 'completed', 'cancelled']);
export const txKind = pgEnum('tx_kind', ['income', 'expense']);
export const bookingStatus = pgEnum('booking_status', ['new', 'contacted', 'done', 'cancelled']);

export const users = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  username: text().notNull().unique(),
  passwordHash: text().notNull(),
  role: userRole().notNull().default('staff'),
  /** صلاحيات الموظف: invoices · agreements · finance · bookings (المدير يملكها كلها). */
  permissions: text().array().notNull().default(sql`'{}'::text[]`),
  jobTitle: text(),
  isActive: boolean().notNull().default(true),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable(
  'sessions',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text().notNull().unique(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
  },
  (t) => [index('sessions_user_idx').on(t.userId)],
);

export const loginAttempts = pgTable('login_attempts', {
  key: text().primaryKey(),
  count: integer().notNull().default(0),
  windowStart: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

/** إعدادات المركز: صف واحد فقط (id = 1). */
export const settings = pgTable('settings', {
  id: integer().primaryKey().default(1),
  centerName: text().notNull().default('مركز بساتم لصيانة السيارات'),
  centerNameEn: text().notNull().default('Basatim Auto Service Center'),
  crNumber: text(),
  vatEnabled: boolean().notNull().default(false),
  vatNumber: text(),
  vatRate: integer().notNull().default(15),
  phone: text(),
  whatsapp: text(),
  email: text(),
  city: text(),
  address: text(),
  mapUrl: text(),
  workingHours: text(),
  invoiceFooter: text(),
  agreementTerms: text(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

/** عدّادات الترقيم: فاتورة INV، اتفاقية AGR. */
export const counters = pgTable('counters', {
  key: text().primaryKey(),
  value: integer().notNull().default(0),
});

export interface LineItem {
  description: string;
  kind: 'service' | 'part';
  qty: number; // بالآلاف (1000 = قطعة واحدة) لدعم 1.5 لتر مثلاً
  unitPrice: number; // بالهللة
}

const customerAndVehicle = {
  customerName: text().notNull(),
  customerPhone: text(),
  customerVat: text(),
  carMake: text(),
  carModel: text(),
  carYear: text(),
  plateNumber: text(),
  vin: text(),
  odometer: integer(),
};

export const agreements = pgTable(
  'agreements',
  {
    id: uuid().primaryKey().defaultRandom(),
    number: text().notNull().unique(),
    date: date({ mode: 'string' }).notNull(),
    ...customerAndVehicle,
    complaint: text().notNull(),
    diagnosis: text(),
    items: jsonb().$type<LineItem[]>().notNull().default([]),
    estimatedTotal: money('estimated_total'),
    deposit: money('deposit'),
    expectedDelivery: date({ mode: 'string' }),
    technician: text(),
    terms: text(),
    status: agreementStatus().notNull().default('open'),
    customerApproved: boolean().notNull().default(false),
    notes: text(),
    createdBy: uuid().references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('agreements_date_idx').on(t.date)],
);

export const invoices = pgTable(
  'invoices',
  {
    id: uuid().primaryKey().defaultRandom(),
    number: text().notNull().unique(),
    issuedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    ...customerAndVehicle,
    items: jsonb().$type<LineItem[]>().notNull().default([]),
    subtotal: money('subtotal'),
    discount: money('discount'),
    vatRate: integer().notNull().default(0),
    vatAmount: money('vat_amount'),
    total: money('total'),
    paid: money('paid'),
    status: invoiceStatus().notNull().default('unpaid'),
    agreementId: uuid().references(() => agreements.id, { onDelete: 'set null' }),
    notes: text(),
    voidReason: text(),
    createdBy: uuid().references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('invoices_issued_idx').on(t.issuedAt)],
);

export const transactions = pgTable(
  'transactions',
  {
    id: uuid().primaryKey().defaultRandom(),
    kind: txKind().notNull(),
    category: text().notNull(),
    amount: money('amount'),
    date: date({ mode: 'string' }).notNull(),
    method: text().notNull().default('cash'),
    description: text(),
    invoiceId: uuid().references(() => invoices.id, { onDelete: 'cascade' }),
    createdBy: uuid().references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('transactions_date_idx').on(t.date), index('transactions_invoice_idx').on(t.invoiceId)],
);

/** فريق العمل الظاهر في الموقع التعريفي. */
export const teamMembers = pgTable('team_members', {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  title: text().notNull(),
  specialty: text(),
  years: integer(),
  showOnSite: boolean().notNull().default(true),
  sortOrder: integer().notNull().default(0),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

/** طلبات الحجز القادمة من الموقع. */
export const bookings = pgTable('bookings', {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  phone: text().notNull(),
  car: text(),
  service: text(),
  preferredDate: date({ mode: 'string' }),
  notes: text(),
  status: bookingStatus().notNull().default('new'),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
