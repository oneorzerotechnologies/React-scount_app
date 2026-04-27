/**
 * Date helpers. API gives us ISO date strings (YYYY-MM-DD) or
 * full ISO 8601 timestamps. The app displays them as "25 Apr",
 * "25 Apr 2026", "Issued 25 Apr · Expires 25 May" etc.
 */

const shortFmt = new Intl.DateTimeFormat('en-MY', { day: 'numeric', month: 'short' });
const fullFmt  = new Intl.DateTimeFormat('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });

/** "25 Apr" */
export function formatDateShort(iso: string) {
  return shortFmt.format(new Date(iso));
}

/** "25 Apr 2026" */
export function formatDateFull(iso: string) {
  return fullFmt.format(new Date(iso));
}

/** Days from today (negative = past). Useful for "Overdue 4 days" etc. */
export function daysFromToday(iso: string) {
  const target = new Date(iso);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}
