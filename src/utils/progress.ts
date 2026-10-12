import type { AyahRange, SurahProgress } from "../types/memorization";
import { JUZ_START_POINTS, TOTAL_JUZ } from "../data/juz";
import { SURAHS, getSurah } from "../data/surahs";

/**
 * Normalize a list of ayah ranges: sort, clamp invalid orders, drop empties,
 * and merge any overlapping or adjacent ranges into a minimal ascending set.
 * This is what guarantees no ayah is ever counted twice.
 */
export function normalizeRanges(ranges: AyahRange[], maxAyah: number): AyahRange[] {
  const cleaned = ranges
    .map((r) => {
      const start = Math.min(r.start, r.end);
      const end = Math.max(r.start, r.end);
      return { start, end };
    })
    .filter((r) => Number.isFinite(r.start) && Number.isFinite(r.end))
    .map((r) => ({
      start: Math.max(1, Math.round(r.start)),
      end: Math.min(maxAyah, Math.round(r.end)),
    }))
    .filter((r) => r.start <= r.end && r.start >= 1 && r.end <= maxAyah)
    .sort((a, b) => a.start - b.start);

  const merged: AyahRange[] = [];
  for (const r of cleaned) {
    const last = merged[merged.length - 1];
    // Merge if overlapping OR directly adjacent (end + 1 === next start).
    if (last && r.start <= last.end + 1) {
      last.end = Math.max(last.end, r.end);
    } else {
      merged.push({ ...r });
    }
  }
  return merged;
}

/** Count unique ayahs covered by a normalized (or unnormalized) range list. */
export function countAyahsInRanges(ranges: AyahRange[], maxAyah: number): number {
  const normalized = normalizeRanges(ranges, maxAyah);
  return normalized.reduce((sum, r) => sum + (r.end - r.start + 1), 0);
}

/** Add a range to an existing list and return a normalized merged result. */
export function addRange(
  existing: AyahRange[],
  range: AyahRange,
  maxAyah: number,
): AyahRange[] {
  return normalizeRanges([...existing, range], maxAyah);
}

/**
 * Remove an ayah range from a set of ranges (set subtraction), returning a
 * normalized result. Splits ranges where necessary.
 */
export function removeRange(
  existing: AyahRange[],
  remove: AyahRange,
  maxAyah: number,
): AyahRange[] {
  const base = normalizeRanges(existing, maxAyah);
  const rem = { start: Math.min(remove.start, remove.end), end: Math.max(remove.start, remove.end) };
  const result: AyahRange[] = [];
  for (const r of base) {
    // No overlap.
    if (rem.end < r.start || rem.start > r.end) {
      result.push(r);
      continue;
    }
    // Left remainder.
    if (rem.start > r.start) {
      result.push({ start: r.start, end: Math.min(r.end, rem.start - 1) });
    }
    // Right remainder.
    if (rem.end < r.end) {
      result.push({ start: Math.max(r.start, rem.end + 1), end: r.end });
    }
  }
  return normalizeRanges(result, maxAyah);
}

/** Total unique memorized ayahs for a single surah's progress record. */
export function surahMemorizedCount(progress: SurahProgress): number {
  const surah = getSurah(progress.surah);
  if (!surah) return 0;
  return countAyahsInRanges(progress.memorizedRanges, surah.ayahCount);
}

/* ------------------------------------------------------------------ */
/* Global ayah indexing + juz computation                              */
/* ------------------------------------------------------------------ */

/** Cumulative ayah offset before each surah (surah 1 → 0). */
const SURAH_OFFSET = (() => {
  const offsets = new Map<number, number>();
  let running = 0;
  for (const s of SURAHS) {
    offsets.set(s.number, running);
    running += s.ayahCount;
  }
  return offsets;
})();

/**
 * Convert a (surah, ayah) position into a 1-based global ayah index across the
 * whole mushaf. Useful for consistent cumulative progress math.
 */
export function globalAyahIndex(surah: number, ayah: number): number {
  const offset = SURAH_OFFSET.get(surah);
  if (offset === undefined) return 0;
  return offset + ayah;
}

export interface JuzRange {
  juz: number;
  /** Global (inclusive) start/end ayah indices across the whole mushaf. */
  startGlobal: number;
  endGlobal: number;
  /** Total ayahs in this juz. */
  totalAyahs: number;
}

/** Precomputed global ayah ranges for every juz, derived from JUZ_START_POINTS. */
export const JUZ_RANGES: JuzRange[] = (() => {
  const starts = JUZ_START_POINTS.map((p) => globalAyahIndex(p.surah, p.ayah));
  const totalAyahs = SURAHS.reduce((sum, s) => sum + s.ayahCount, 0);
  const ranges: JuzRange[] = [];
  for (let j = 0; j < TOTAL_JUZ; j += 1) {
    const startGlobal = starts[j];
    const endGlobal = j + 1 < TOTAL_JUZ ? starts[j + 1] - 1 : totalAyahs;
    ranges.push({
      juz: j + 1,
      startGlobal,
      endGlobal,
      totalAyahs: endGlobal - startGlobal + 1,
    });
  }
  return ranges;
})();

/**
 * Build the complete set of memorized global ayah indices from all progress.
 * Returned as a sorted, de-duplicated list of ascending global ranges.
 */
export function memorizedGlobalRanges(
  progress: Record<string, SurahProgress>,
): AyahRange[] {
  const globalRanges: AyahRange[] = [];
  for (const key of Object.keys(progress)) {
    const p = progress[key];
    const surah = getSurah(p.surah);
    if (!surah) continue;
    const normalized = normalizeRanges(p.memorizedRanges, surah.ayahCount);
    for (const r of normalized) {
      globalRanges.push({
        start: globalAyahIndex(p.surah, r.start),
        end: globalAyahIndex(p.surah, r.end),
      });
    }
  }
  // Max global index is the grand total.
  const maxGlobal = SURAHS.reduce((sum, s) => sum + s.ayahCount, 0);
  return normalizeRanges(globalRanges, maxGlobal);
}

/** Count how many global ayahs within [start,end] are covered by ranges. */
function countOverlap(ranges: AyahRange[], start: number, end: number): number {
  let total = 0;
  for (const r of ranges) {
    const lo = Math.max(r.start, start);
    const hi = Math.min(r.end, end);
    if (lo <= hi) total += hi - lo + 1;
  }
  return total;
}

export interface JuzProgress {
  juz: number;
  totalAyahs: number;
  memorizedAyahs: number;
  percent: number;
  complete: boolean;
}

/** Per-juz progress breakdown using valid ayah-range → juz mapping. */
export function juzBreakdown(progress: Record<string, SurahProgress>): JuzProgress[] {
  const globalRanges = memorizedGlobalRanges(progress);
  return JUZ_RANGES.map((jr) => {
    const memorizedAyahs = countOverlap(globalRanges, jr.startGlobal, jr.endGlobal);
    return {
      juz: jr.juz,
      totalAyahs: jr.totalAyahs,
      memorizedAyahs,
      percent: jr.totalAyahs === 0 ? 0 : (memorizedAyahs / jr.totalAyahs) * 100,
      complete: memorizedAyahs === jr.totalAyahs,
    };
  });
}

/** Count of fully-memorized juz (every ayah recorded). */
export function completedJuzCount(progress: Record<string, SurahProgress>): number {
  return juzBreakdown(progress).filter((j) => j.complete).length;
}

/** Number of juz that have *any* recorded progress. */
export function touchedJuzCount(progress: Record<string, SurahProgress>): number {
  return juzBreakdown(progress).filter((j) => j.memorizedAyahs > 0).length;
}
