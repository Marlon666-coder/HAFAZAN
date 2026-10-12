export type ThemePreference = "light" | "dark" | "system";

export type ProgressDisplay = "ayah" | "percent";

export interface Goal {
  /** Target ayahs memorized per active day. 0 means not set. */
  dailyAyahTarget: number;
  /** Optional target pages per active day. 0 means not set. */
  dailyPageTarget: number;
  /** Optional explicit completion date (YYYY-MM-DD) or null. */
  targetDate: string | null;
  /** Optional months-to-khatam target, or null. */
  targetMonths: number | null;
  /**
   * Active days of the week, 0 = Sunday .. 6 = Saturday.
   * Empty array means "every day is active".
   */
  activeDays: number[];
}

export interface Settings {
  /** Local-only nickname. */
  nickname: string;
  /** Optional short bio. */
  bio: string;
  theme: ThemePreference;
  progressDisplay: ProgressDisplay;
  /** Ask for confirmation before destructive actions. */
  confirmDestructive: boolean;
  /** Preferred murattal reciter id (see src/data/reciters.ts). */
  reciterId: string;
  goal: Goal;
}
