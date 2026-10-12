/**
 * Authoritative juz boundary table for the standard (Hafs / Madinah mushaf)
 * division of the Qur'an into 30 ajza'.
 *
 * `JUZ_START_POINTS[i]` is the first ayah of juz `(i + 1)`. Juz 1 always starts
 * at surah 1, ayah 1. These start points are the single source of truth from
 * which per-surah `juzSegments` are derived in `./surahs.ts`.
 *
 * Reference: standard Madinah mushaf juz divisions. Documented in the README.
 */
export interface JuzStart {
  /** Surah number where this juz begins. */
  surah: number;
  /** Ayah number (within that surah) where this juz begins. */
  ayah: number;
}

export const TOTAL_JUZ = 30;

export const JUZ_START_POINTS: JuzStart[] = [
  { surah: 1, ayah: 1 }, // Juz 1  — Al-Fatihah 1
  { surah: 2, ayah: 142 }, // Juz 2  — Al-Baqarah 142
  { surah: 2, ayah: 253 }, // Juz 3  — Al-Baqarah 253
  { surah: 3, ayah: 93 }, // Juz 4  — Ali 'Imran 93
  { surah: 4, ayah: 24 }, // Juz 5  — An-Nisa' 24
  { surah: 4, ayah: 148 }, // Juz 6  — An-Nisa' 148
  { surah: 5, ayah: 82 }, // Juz 7  — Al-Ma'idah 82
  { surah: 6, ayah: 111 }, // Juz 8  — Al-An'am 111
  { surah: 7, ayah: 88 }, // Juz 9  — Al-A'raf 88
  { surah: 8, ayah: 41 }, // Juz 10 — Al-Anfal 41
  { surah: 9, ayah: 93 }, // Juz 11 — At-Taubah 93
  { surah: 11, ayah: 6 }, // Juz 12 — Hud 6
  { surah: 12, ayah: 53 }, // Juz 13 — Yusuf 53
  { surah: 15, ayah: 1 }, // Juz 14 — Al-Hijr 1
  { surah: 17, ayah: 1 }, // Juz 15 — Al-Isra' 1
  { surah: 18, ayah: 75 }, // Juz 16 — Al-Kahfi 75
  { surah: 21, ayah: 1 }, // Juz 17 — Al-Anbiya' 1
  { surah: 23, ayah: 1 }, // Juz 18 — Al-Mu'minun 1
  { surah: 25, ayah: 21 }, // Juz 19 — Al-Furqan 21
  { surah: 27, ayah: 56 }, // Juz 20 — An-Naml 56
  { surah: 29, ayah: 46 }, // Juz 21 — Al-'Ankabut 46
  { surah: 33, ayah: 31 }, // Juz 22 — Al-Ahzab 31
  { surah: 36, ayah: 28 }, // Juz 23 — Yasin 28
  { surah: 39, ayah: 32 }, // Juz 24 — Az-Zumar 32
  { surah: 41, ayah: 47 }, // Juz 25 — Fussilat 47
  { surah: 46, ayah: 1 }, // Juz 26 — Al-Ahqaf 1
  { surah: 51, ayah: 31 }, // Juz 27 — Az-Zariyat 31
  { surah: 58, ayah: 1 }, // Juz 28 — Al-Mujadalah 1
  { surah: 67, ayah: 1 }, // Juz 29 — Al-Mulk 1
  { surah: 78, ayah: 1 }, // Juz 30 — An-Naba' 1
];
