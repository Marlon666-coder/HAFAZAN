/** Formatting helpers for numbers and progress display. */

/** Format an integer with thousands separators (Indonesian locale style). */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("id-ID").format(Math.round(n));
}

/** Format a 0..100 percentage with one decimal, trimming trailing ".0". */
export function formatPercent(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
}

/** Clamp a number into [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Simple unique id generator (sufficient for local, single-user data). */
export function createId(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
