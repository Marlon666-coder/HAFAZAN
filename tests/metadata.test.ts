import { describe, it, expect } from "vitest";
import { SURAHS, TOTAL_AYAHS, EXPECTED_TOTAL_AYAHS } from "../src/data/surahs";
import { JUZ_START_POINTS, TOTAL_JUZ } from "../src/data/juz";
import { JUZ_RANGES } from "../src/utils/progress";

describe("surah metadata integrity", () => {
  it("contains exactly 114 surahs", () => {
    expect(SURAHS).toHaveLength(114);
  });

  it("has sequential surah numbers 1..114", () => {
    SURAHS.forEach((s, i) => expect(s.number).toBe(i + 1));
  });

  it("has non-empty names, meanings, and positive ayah counts", () => {
    for (const s of SURAHS) {
      expect(s.nameArabic.trim().length).toBeGreaterThan(0);
      expect(s.nameLatin.trim().length).toBeGreaterThan(0);
      expect(s.meaningIndonesia.trim().length).toBeGreaterThan(0);
      expect(s.ayahCount).toBeGreaterThan(0);
    }
  });

  it("totals exactly 6236 ayahs (Hafs standard)", () => {
    expect(TOTAL_AYAHS).toBe(EXPECTED_TOTAL_AYAHS);
    expect(TOTAL_AYAHS).toBe(6236);
  });

  it("has valid, contiguous juz segments covering every ayah of each surah", () => {
    for (const s of SURAHS) {
      expect(s.juzSegments.length).toBeGreaterThan(0);
      // First segment starts at ayah 1, last ends at ayahCount.
      expect(s.juzSegments[0].startAyah).toBe(1);
      expect(s.juzSegments[s.juzSegments.length - 1].endAyah).toBe(s.ayahCount);

      for (let i = 0; i < s.juzSegments.length; i += 1) {
        const seg = s.juzSegments[i];
        expect(seg.startAyah).toBeLessThanOrEqual(seg.endAyah);
        expect(seg.juz).toBeGreaterThanOrEqual(1);
        expect(seg.juz).toBeLessThanOrEqual(TOTAL_JUZ);
        if (i > 0) {
          const prev = s.juzSegments[i - 1];
          expect(seg.startAyah).toBe(prev.endAyah + 1);
          expect(seg.juz).toBeGreaterThan(prev.juz);
        }
      }

      expect(s.startJuz).toBe(s.juzSegments[0].juz);
      expect(s.endJuz).toBe(s.juzSegments[s.juzSegments.length - 1].juz);
    }
  });

  it("has a surah crossing juz boundaries (Al-Baqarah spans juz 1-3)", () => {
    const baqarah = SURAHS[1];
    expect(baqarah.number).toBe(2);
    expect(baqarah.startJuz).toBe(1);
    expect(baqarah.endJuz).toBe(3);
    expect(baqarah.juzSegments.length).toBe(3);
  });

  it("has 30 juz ranges that tile the whole mushaf without gaps or overlaps", () => {
    expect(JUZ_RANGES).toHaveLength(TOTAL_JUZ);
    expect(JUZ_START_POINTS).toHaveLength(TOTAL_JUZ);
    expect(JUZ_RANGES[0].startGlobal).toBe(1);
    expect(JUZ_RANGES[TOTAL_JUZ - 1].endGlobal).toBe(6236);
    let sum = 0;
    for (let i = 0; i < JUZ_RANGES.length; i += 1) {
      const jr = JUZ_RANGES[i];
      expect(jr.endGlobal).toBeGreaterThanOrEqual(jr.startGlobal);
      sum += jr.totalAyahs;
      if (i > 0) {
        expect(jr.startGlobal).toBe(JUZ_RANGES[i - 1].endGlobal + 1);
      }
    }
    expect(sum).toBe(6236);
  });
});
