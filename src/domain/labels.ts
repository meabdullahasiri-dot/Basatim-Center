export const INVOICE_STATUS: Record<string, { label: string; tone: 'positive' | 'warning' | 'danger' | 'neutral' | 'info' }> = {
  unpaid: { label: 'غير مدفوعة', tone: 'danger' },
  partial: { label: 'مدفوعة جزئياً', tone: 'warning' },
  paid: { label: 'مدفوعة', tone: 'positive' },
  void: { label: 'ملغاة', tone: 'neutral' },
};

export const AGREEMENT_STATUS: Record<string, { label: string; tone: 'positive' | 'warning' | 'danger' | 'neutral' | 'info' }> = {
  open: { label: 'جديدة', tone: 'info' },
  in_progress: { label: 'قيد التنفيذ', tone: 'warning' },
  completed: { label: 'مكتملة', tone: 'positive' },
  cancelled: { label: 'ملغاة', tone: 'neutral' },
};

export const BOOKING_STATUS: Record<string, { label: string; tone: 'positive' | 'warning' | 'danger' | 'neutral' | 'info' }> = {
  new: { label: 'جديد', tone: 'info' },
  contacted: { label: 'تم التواصل', tone: 'warning' },
  done: { label: 'تم', tone: 'positive' },
  cancelled: { label: 'ملغى', tone: 'neutral' },
};

export const PAYMENT_METHODS: Record<string, string> = {
  cash: 'نقداً',
  card: 'مدى / بطاقة',
  transfer: 'تحويل بنكي',
  other: 'أخرى',
};

export const INCOME_CATEGORIES = ['فواتير الصيانة', 'بيع قطع غيار', 'خدمات أخرى', 'إيرادات أخرى'];
export const EXPENSE_CATEGORIES = [
  'قطع غيار ومواد',
  'رواتب وأجور',
  'إيجار',
  'كهرباء وماء',
  'معدات وأدوات',
  'صيانة المركز',
  'تسويق وإعلان',
  'رسوم حكومية',
  'مصروفات أخرى',
];

export const ITEM_KIND: Record<string, string> = { service: 'خدمة / أجور', part: 'قطعة غيار' };
