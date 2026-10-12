export * from "./surah";
export * from "./memorization";
export * from "./review";
export * from "./settings";
export * from "./achievement";

import type { SurahProgress } from "./memorization";
import type { ReviewSession } from "./review";
import type { Settings } from "./settings";

export const SCHEMA_VERSION = 1;

/** The complete, persisted application state (user-owned, local only). */
export interface AppData {
  schemaVersion: number;
  /** Progress per surah, keyed by surah number as string. */
  progress: Record<string, SurahProgress>;
  /** Muroja'ah sessions, most-recent-first is not guaranteed; sort on read. */
  reviews: ReviewSession[];
  settings: Settings;
}
