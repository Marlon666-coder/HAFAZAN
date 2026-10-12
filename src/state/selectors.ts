import type { AppData } from "../types";
import type { AchievementStatus } from "../types/achievement";
import type { SurahProgress } from "../types/memorization";
import { EXPECTED_TOTAL_AYAHS, SURAHS, getSurah } from "../data/surahs";
import { ACHIEVEMENTS } from "../data/achievements";
import {
  completedJuzCount,
  juzBreakdown,
  memorizedGlobalRanges,
  surahMemorizedCount,
  touchedJuzCount,
} from "../utils/progress";
import { computeStreak } from "../utils/streak";
import { computeGoalPlan } from "../utils/goal";
import type { GoalPlan } from "../utils/goal";
import type { JuzProgress } from "../utils/progress";
import type { StreakResult } from "../utils/streak";

/** Total unique memorized ayahs across the whole mushaf. */
export function totalMemorizedAyahs(data: AppData): number {
  const ranges = memorizedGlobalRanges(data.progress);
  return ranges.reduce((sum, r) => sum + (r.end - r.start + 1), 0);
}

/** Overall progress percent (0..100) relative to 6236 ayahs. */
export function overallPercent(data: AppData): number {
  return (totalMemorizedAyahs(data) / EXPECTED_TOTAL_AYAHS) * 100;
}

/** Count of surahs whose status is explicitly `memorized`. */
export function memorizedSurahCount(data: AppData): number {
  return Object.values(data.progress).filter((p) => p.status === "memorized").length;
}

/**
 * Count of surahs marked `memorized` whose recorded ayah detail actually
 * covers every ayah. Used to distinguish status from true completeness.
 */
export function fullyRecordedSurahCount(data: AppData): number {
  let count = 0;
  for (const p of Object.values(data.progress)) {
    if (p.status !== "memorized") continue;
    const surah = getSurah(p.surah);
    if (surah && surahMemorizedCount(p) === surah.ayahCount) count += 1;
  }
  return count;
}

export function juzStats(data: AppData): JuzProgress[] {
  return juzBreakdown(data.progress);
}

export function streakStats(data: AppData, now?: Date): StreakResult {
  return computeStreak(data.reviews, now);
}

export function goalPlan(data: AppData, now?: Date): GoalPlan {
  return computeGoalPlan(data.settings.goal, totalMemorizedAyahs(data), now);
}

export interface SurahWithProgress {
  surah: (typeof SURAHS)[number];
  progress: SurahProgress;
  memorizedAyahs: number;
  percent: number;
}

/** Default empty progress for a surah that has no record yet. */
export function emptyProgress(surahNumber: number): SurahProgress {
  return {
    surah: surahNumber,
    status: "not-started",
    memorizedRanges: [],
    pageRanges: [],
    notes: "",
    lastUpdated: null,
    history: [],
  };
}

/** Join static surah metadata with the user's progress for all 114 surahs. */
export function allSurahsWithProgress(data: AppData): SurahWithProgress[] {
  return SURAHS.map((surah) => {
    const progress = data.progress[String(surah.number)] ?? emptyProgress(surah.number);
    const memorizedAyahs = surahMemorizedCount(progress);
    return {
      surah,
      progress,
      memorizedAyahs,
      percent: (memorizedAyahs / surah.ayahCount) * 100,
    };
  });
}

export function achievementStatuses(data: AppData, now?: Date): AchievementStatus[] {
  const juzDone = completedJuzCount(data.progress);
  const streak = computeStreak(data.reviews, now);
  return ACHIEVEMENTS.map((def) => {
    const current = def.kind === "juz" ? juzDone : streak.longest;
    return { def, current, unlocked: current >= def.threshold };
  });
}

export interface DashboardSummary {
  totalMemorized: number;
  overallPercent: number;
  memorizedSurahs: number;
  fullyRecordedSurahs: number;
  touchedJuz: number;
  completedJuz: number;
  streak: StreakResult;
  goal: GoalPlan;
  /** Surahs currently in progress, most-recently-updated first. */
  inProgress: SurahWithProgress[];
  /** Most recent completed review session, if any. */
  lastReviewDate: string | null;
  hasAnyData: boolean;
}

export function dashboardSummary(data: AppData, now?: Date): DashboardSummary {
  const withProgress = allSurahsWithProgress(data);
  const inProgress = withProgress
    .filter((s) => s.progress.status === "in-progress" || (s.memorizedAyahs > 0 && s.progress.status !== "memorized"))
    .sort((a, b) => (b.progress.lastUpdated ?? "").localeCompare(a.progress.lastUpdated ?? ""));

  const completedReviews = data.reviews.filter((r) => r.completed && r.date).map((r) => r.date).sort();
  const lastReviewDate = completedReviews.length ? completedReviews[completedReviews.length - 1] : null;

  const total = totalMemorizedAyahs(data);
  const hasAnyData =
    total > 0 ||
    data.reviews.length > 0 ||
    Object.values(data.progress).some((p) => p.status !== "not-started" || p.notes.trim() !== "");

  return {
    totalMemorized: total,
    overallPercent: (total / EXPECTED_TOTAL_AYAHS) * 100,
    memorizedSurahs: memorizedSurahCount(data),
    fullyRecordedSurahs: fullyRecordedSurahCount(data),
    touchedJuz: touchedJuzCount(data.progress),
    completedJuz: completedJuzCount(data.progress),
    streak: computeStreak(data.reviews, now),
    goal: goalPlan(data, now),
    inProgress,
    lastReviewDate,
    hasAnyData,
  };
}

export interface Recommendation {
  surahNumber: number | null;
  title: string;
  reason: string;
}

/**
 * A simple, transparent "what next" recommendation. No external AI; just a
 * priority order over the user's own data.
 */
export function nextRecommendation(data: AppData): Recommendation {
  const withProgress = allSurahsWithProgress(data);

  // 1. Continue an in-progress surah (least complete first to finish it off).
  const inProgress = withProgress
    .filter((s) => s.progress.status === "in-progress")
    .sort((a, b) => b.percent - a.percent);
  if (inProgress.length > 0) {
    const s = inProgress[0];
    return {
      surahNumber: s.surah.number,
      title: `Lanjutkan ${s.surah.nameLatin}`,
      reason: `Surah ini sedang dihafal (${Math.round(s.percent)}% tercatat). Menuntaskannya menjaga momentum.`,
    };
  }

  // 2. Review a memorized surah if none in progress.
  const memorized = withProgress.filter((s) => s.progress.status === "memorized");
  if (memorized.length > 0 && data.reviews.filter((r) => r.completed).length === 0) {
    const s = memorized[0];
    return {
      surahNumber: s.surah.number,
      title: `Muroja'ah ${s.surah.nameLatin}`,
      reason: "Mulai kebiasaan muroja'ah untuk menjaga hafalan yang sudah ada.",
    };
  }

  // 3. Start a new, short surah to build a habit.
  const notStarted = withProgress
    .filter((s) => s.progress.status === "not-started")
    .sort((a, b) => a.surah.ayahCount - b.surah.ayahCount);
  if (notStarted.length > 0) {
    const s = notStarted[0];
    return {
      surahNumber: s.surah.number,
      title: `Mulai ${s.surah.nameLatin}`,
      reason: `Surah pendek (${s.surah.ayahCount} ayat) — awal yang ringan untuk memulai.`,
    };
  }

  return {
    surahNumber: null,
    title: "Semua surah sudah ditandai",
    reason: "MasyaAllah. Fokuskan energi pada muroja'ah untuk menjaga hafalan.",
  };
}
