/**
 * Date helpers that operate on *local* calendar days (not UTC), which is
 * essential for correct streak behaviour across timezones and midnight.
 */

/** Format a Date as a local YYYY-MM-DD string. */
export function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Today's local date as YYYY-MM-DD. */
export function todayLocal(now: Date = new Date()): string {
  return toLocalDateString(now);
}

/** Parse a YYYY-MM-DD string into a local Date at midnight. */
export function parseLocalDate(value: string): Date {
  const [y, m, d] = value.split("-").map((p) => Number.parseInt(p, 10));
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** Whole-day difference (a - b) between two YYYY-MM-DD strings, in local days. */
export function dayDiff(a: string, b: string): number {
  const da = parseLocalDate(a).getTime();
  const db = parseLocalDate(b).getTime();
  // Use rounding to be robust against DST transitions (±1h).
  return Math.round((da - db) / (1000 * 60 * 60 * 24));
}

/** Add n days to a YYYY-MM-DD string, returning a new YYYY-MM-DD string. */
export function addDays(value: string, n: number): string {
  const d = parseLocalDate(value);
  d.setDate(d.getDate() + n);
  return toLocalDateString(d);
}

/** Is the given YYYY-MM-DD a valid calendar date? */
export function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = parseLocalDate(value);
  return toLocalDateString(d) === value;
}

const MONTHS_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const DAYS_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

/** Human-friendly Indonesian date, e.g. "Senin, 12 Oktober 2026". */
export function formatDateId(value: string): string {
  if (!isValidDateString(value)) return value;
  const d = parseLocalDate(value);
  return `${DAYS_ID[d.getDay()]}, ${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
}

export { DAYS_ID };
