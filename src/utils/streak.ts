import type { ReviewSession } from "../types/review";
import { dayDiff, todayLocal } from "./date";

/** Unique set of local dates (YYYY-MM-DD) that have a completed session. */
export function activeDates(reviews: ReviewSession[]): string[] {
  const set = new Set<string>();
  for (const r of reviews) {
    if (r.completed && r.date) set.add(r.date);
  }
  return [...set].sort();
}

export interface StreakResult {
  current: number;
  longest: number;
  /** Local dates considered "active". */
  activeDays: string[];
}

/**
 * Compute current and longest streaks from completed review sessions.
 *
 * Rules:
 * - A day is "active" if at least one session was completed that local day.
 * - Multiple sessions on one day still count as a single day.
 * - A gap of a missed day breaks the running streak, EXCEPT the current streak
 *   is still considered alive if the most recent active day is today or
 *   yesterday (the user may simply not have reviewed yet today).
 */
export function computeStreak(reviews: ReviewSession[], now: Date = new Date()): StreakResult {
  const days = activeDates(reviews);
  if (days.length === 0) {
    return { current: 0, longest: 0, activeDays: [] };
  }

  // Longest run of consecutive calendar days.
  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i += 1) {
    const diff = dayDiff(days[i], days[i - 1]);
    if (diff === 1) {
      run += 1;
    } else if (diff === 0) {
      // same day (shouldn't happen after de-dupe) — ignore
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
  }

  // Current streak: walk backward from the most recent active day, but only if
  // that day is today or yesterday.
  const today = todayLocal(now);
  const last = days[days.length - 1];
  const sinceLast = dayDiff(today, last);

  let current = 0;
  if (sinceLast === 0 || sinceLast === 1) {
    current = 1;
    for (let i = days.length - 1; i > 0; i -= 1) {
      if (dayDiff(days[i], days[i - 1]) === 1) {
        current += 1;
      } else {
        break;
      }
    }
  }

  return { current, longest, activeDays: days };
}
