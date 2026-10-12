export type MemorizationStatus = "not-started" | "in-progress" | "memorized" | "review";

/** Inclusive ayah range [start, end], 1-indexed within a surah. */
export interface AyahRange {
  start: number;
  end: number;
}

/** Optional page range the user memorized (mushaf page numbers). */
export interface PageRange {
  start: number;
  end: number;
}

export interface ProgressHistoryEntry {
  /** Local date, YYYY-MM-DD. */
  date: string;
  /** ISO timestamp of the change. */
  timestamp: string;
  /** Human-readable description of what changed. */
  description: string;
  /** Total unique memorized ayahs for this surah after the change. */
  ayahsMemorized: number;
}

export interface SurahProgress {
  surah: number;
  status: MemorizationStatus;
  /** Normalized, non-overlapping, ascending ayah ranges the user memorized. */
  memorizedRanges: AyahRange[];
  /** Optional memorized page ranges. */
  pageRanges: PageRange[];
  /** Free-form personal notes. */
  notes: string;
  /** Local date (YYYY-MM-DD) of last update, or null if never touched. */
  lastUpdated: string | null;
  /** Per-surah history of progress changes. */
  history: ProgressHistoryEntry[];
}
