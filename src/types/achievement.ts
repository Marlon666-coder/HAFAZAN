export type AchievementKind = "juz" | "streak";

export interface AchievementDef {
  id: string;
  kind: AchievementKind;
  title: string;
  description: string;
  /** Threshold: number of juz, or number of consecutive streak days. */
  threshold: number;
}

export interface AchievementStatus {
  def: AchievementDef;
  unlocked: boolean;
  /** Current value toward the threshold (juz count or streak days). */
  current: number;
}
