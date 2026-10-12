import { describe, it, expect } from "vitest";
import {
  normalizeRanges,
  countAyahsInRanges,
  addRange,
  removeRange,
  juzBreakdown,
  completedJuzCount,
} from "../src/utils/progress";
import type { SurahProgress } from "../src/types/memorization";
import { SURAHS } from "../src/data/surahs";

describe("ayah range normalization", () => {
  it("merges overlapping ranges", () => {
    const result = normalizeRanges([{ start: 1, end: 5 }, { start: 4, end: 8 }], 100);
    expect(result).toEqual([{ start: 1, end: 8 }]);
  });

  it("merges adjacent ranges", () => {
    const result = normalizeRanges([{ start: 1, end: 3 }, { start: 4, end: 6 }], 100);
    expect(result).toEqual([{ start: 1, end: 6 }]);
  });

  it("keeps disjoint ranges separate and sorted", () => {
    const result = normalizeRanges([{ start: 10, end: 12 }, { start: 1, end: 3 }], 100);
    expect(result).toEqual([{ start: 1, end: 3 }, { start: 10, end: 12 }]);
  });

  it("fixes reversed ranges and clamps to bounds", () => {
    const result = normalizeRanges([{ start: 8, end: 4 }, { start: 0, end: 200 }], 50);
    expect(result).toEqual([{ start: 1, end: 50 }]);
  });
});

describe("ayah counting (no double counting)", () => {
  it("counts unique ayahs across overlapping ranges once", () => {
    const count = countAyahsInRanges([{ start: 1, end: 5 }, { start: 3, end: 7 }], 100);
    expect(count).toBe(7);
  });

  it("adding the same range twice does not increase the count", () => {
    let ranges = addRange([], { start: 1, end: 10 }, 100);
    ranges = addRange(ranges, { start: 1, end: 10 }, 100);
    expect(countAyahsInRanges(ranges, 100)).toBe(10);
  });
});

describe("range removal", () => {
  it("removes a middle slice, splitting the range", () => {
    const result = removeRange([{ start: 1, end: 10 }], { start: 4, end: 6 }, 100);
    expect(result).toEqual([{ start: 1, end: 3 }, { start: 7, end: 10 }]);
  });

  it("removing a full range yields empty", () => {
    const result = removeRange([{ start: 1, end: 10 }], { start: 1, end: 10 }, 100);
    expect(result).toEqual([]);
  });

  it("removal updates the counted total correctly", () => {
    const after = removeRange([{ start: 1, end: 10 }], { start: 5, end: 10 }, 100);
    expect(countAyahsInRanges(after, 100)).toBe(4);
  });
});

function makeProgress(surah: number, ranges: { start: number; end: number }[]): SurahProgress {
  return {
    surah,
    status: "in-progress",
    memorizedRanges: ranges,
    pageRanges: [],
    notes: "",
    lastUpdated: "2026-01-01",
    history: [],
  };
}

describe("juz breakdown", () => {
  it("reports 0 progress on empty data", () => {
    const breakdown = juzBreakdown({});
    expect(breakdown).toHaveLength(30);
    expect(breakdown.every((j) => j.memorizedAyahs === 0 && !j.complete)).toBe(true);
  });

  it("counts juz 30 complete when all its surahs are fully memorized", () => {
    // Juz 30 is surahs 78..114, each fully memorized.
    const progress: Record<string, SurahProgress> = {};
    for (const s of SURAHS.filter((x) => x.number >= 78)) {
      progress[String(s.number)] = makeProgress(s.number, [{ start: 1, end: s.ayahCount }]);
    }
    const juz30 = juzBreakdown(progress).find((j) => j.juz === 30)!;
    expect(juz30.complete).toBe(true);
    expect(juz30.memorizedAyahs).toBe(juz30.totalAyahs);
    expect(completedJuzCount(progress)).toBe(1);
  });

  it("does not mark a juz complete from a single finished surah inside it", () => {
    // An-Naba (78) fully memorized, but juz 30 has many more surahs.
    const naba = SURAHS[77];
    const progress: Record<string, SurahProgress> = {
      "78": makeProgress(78, [{ start: 1, end: naba.ayahCount }]),
    };
    const juz30 = juzBreakdown(progress).find((j) => j.juz === 30)!;
    expect(juz30.complete).toBe(false);
    expect(juz30.memorizedAyahs).toBe(naba.ayahCount);
    expect(completedJuzCount(progress)).toBe(0);
  });
});
