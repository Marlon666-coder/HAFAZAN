/**
 * Static metadata for a single surah. This data is immutable reference data
 * and must never be persisted into the user's local progress store.
 */
export interface JuzSegment {
  /** Juz number this segment belongs to (1–30). */
  juz: number;
  /** First ayah of the surah that falls in this juz (1-indexed, inclusive). */
  startAyah: number;
  /** Last ayah of the surah that falls in this juz (1-indexed, inclusive). */
  endAyah: number;
}

export interface Surah {
  /** Surah number, 1–114. */
  number: number;
  /** Name in Arabic script. */
  nameArabic: string;
  /** Latin transliteration of the name. */
  nameLatin: string;
  /** Meaning of the name in Indonesian. */
  meaningIndonesia: string;
  /** Total number of ayahs in the surah. */
  ayahCount: number;
  /** First juz this surah appears in. */
  startJuz: number;
  /** Last juz this surah appears in. */
  endJuz: number;
  /** Ordered segments mapping ayah ranges to the juz they belong to. */
  juzSegments: JuzSegment[];
}
