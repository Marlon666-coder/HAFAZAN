import type { Goal } from "../types/settings";
import { EXPECTED_TOTAL_AYAHS } from "../data/surahs";
import { addDays, dayDiff, isValidDateString, todayLocal } from "./date";

export interface GoalPlan {
  /** Total memorized so far (unique ayahs). */
  memorizedAyahs: number;
  /** Ayahs still to memorize. */
  remainingAyahs: number;
  /** Whether the whole mushaf is already recorded. */
  complete: boolean;
  /** Number of available study days until target (null if not computable). */
  availableDays: number | null;
  /** Required ayahs per study day (ceil), or null. */
  ayahsPerDay: number | null;
  /** Estimated completion date (YYYY-MM-DD) based on the daily target, or null. */
  estimatedCompletionDate: string | null;
  /** Validation / realism warnings for the user. */
  warnings: string[];
}

/** Count active study days in [from, to] given the goal's active-day config. */
function countStudyDays(from: string, to: string, activeDays: number[]): number {
  const total = dayDiff(to, from);
  if (total < 0) return 0;
  // "Every day" if no specific days selected.
  if (activeDays.length === 0) return total + 1;

  let count = 0;
  for (let i = 0; i <= total; i += 1) {
    const d = addDays(from, i);
    const dow = new Date(d).getDay();
    if (activeDays.includes(dow)) count += 1;
  }
  return count;
}

/**
 * Transparent target calculator.
 *
 * ayahsPerDay = ceil(remainingAyahs / availableStudyDays)
 */
export function computeGoalPlan(
  goal: Goal,
  memorizedAyahs: number,
  now: Date = new Date(),
): GoalPlan {
  const remainingAyahs = Math.max(0, EXPECTED_TOTAL_AYAHS - memorizedAyahs);
  const complete = remainingAyahs === 0;
  const warnings: string[] = [];
  const today = todayLocal(now);

  if (complete) {
    return {
      memorizedAyahs,
      remainingAyahs: 0,
      complete: true,
      availableDays: 0,
      ayahsPerDay: 0,
      estimatedCompletionDate: null,
      warnings: [],
    };
  }

  // Determine the planning horizon.
  let availableDays: number | null = null;

  if (goal.targetDate) {
    if (!isValidDateString(goal.targetDate)) {
      warnings.push("Tanggal target tidak valid.");
    } else if (dayDiff(goal.targetDate, today) < 0) {
      warnings.push("Tanggal target sudah lewat. Pilih tanggal di masa depan.");
    } else {
      availableDays = countStudyDays(today, goal.targetDate, goal.activeDays);
      if (availableDays === 0) {
        warnings.push("Tidak ada hari belajar yang tersedia hingga tanggal target.");
      }
    }
  } else if (goal.targetMonths && goal.targetMonths > 0) {
    const horizon = addDays(today, Math.round(goal.targetMonths * 30));
    availableDays = countStudyDays(today, horizon, goal.activeDays);
  }

  let ayahsPerDay: number | null = null;
  let estimatedCompletionDate: string | null = null;

  if (availableDays !== null && availableDays > 0) {
    ayahsPerDay = Math.ceil(remainingAyahs / availableDays);
  } else if (goal.dailyAyahTarget > 0) {
    ayahsPerDay = goal.dailyAyahTarget;
  }

  // Estimate completion date from a daily pace (uses active-day cadence).
  if (ayahsPerDay && ayahsPerDay > 0) {
    const studyDaysNeeded = Math.ceil(remainingAyahs / ayahsPerDay);
    estimatedCompletionDate = projectDate(today, studyDaysNeeded, goal.activeDays);
  }

  // Realism checks.
  if (ayahsPerDay !== null) {
    if (ayahsPerDay > 50) {
      warnings.push(
        `Target ${ayahsPerDay} ayat/hari sangat tinggi. Pertimbangkan menambah waktu agar lebih realistis.`,
      );
    }
    if (goal.dailyAyahTarget > 0 && availableDays && availableDays > 0 && goal.dailyAyahTarget < ayahsPerDay) {
      warnings.push(
        `Target harian ${goal.dailyAyahTarget} ayat belum cukup untuk mencapai tanggal target (butuh ${ayahsPerDay}/hari).`,
      );
    }
  }

  return {
    memorizedAyahs,
    remainingAyahs,
    complete: false,
    availableDays,
    ayahsPerDay,
    estimatedCompletionDate,
    warnings,
  };
}

/** Project forward `studyDays` active days from `start`, returning a date. */
function projectDate(start: string, studyDays: number, activeDays: number[]): string {
  if (activeDays.length === 0) {
    return addDays(start, Math.max(0, studyDays - 1));
  }
  let remaining = studyDays;
  let cursor = start;
  // Guard against infinite loops (e.g., empty active day intersection).
  let guard = 0;
  while (remaining > 0 && guard < 20000) {
    const dow = new Date(cursor).getDay();
    if (activeDays.includes(dow)) {
      remaining -= 1;
      if (remaining === 0) break;
    }
    cursor = addDays(cursor, 1);
    guard += 1;
  }
  return cursor;
}
