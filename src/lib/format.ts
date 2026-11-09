const TZ = 'Asia/Riyadh';

/** 2026/11/09 */
export function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d.length === 10 ? `${d}T00:00:00+03:00` : d) : d;
  return date.toLocaleDateString('en-CA', { timeZone: TZ }).replaceAll('-', '/');
}

export function fmtDateTime(d: Date): string {
  return `${fmtDate(d)} ${d.toLocaleTimeString('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })}`;
}

/** التاريخ الهجري التقريبي بأم القرى */
export function fmtHijri(d: Date): string {
  return d.toLocaleDateString('ar-SA-u-ca-islamic-umalqura-nu-latn', { timeZone: TZ, day: 'numeric', month: 'long', year: 'numeric' });
}

export function todayISO(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: TZ });
}
