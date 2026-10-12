import { describe, it, expect } from "vitest";
import { computeGoalPlan } from "../src/utils/goal";
import type { Goal } from "../src/types/settings";
import { EXPECTED_TOTAL_AYAHS } from "../src/data/surahs";

const baseGoal: Goal = {
  dailyAyahTarget: 0,
  dailyPageTarget: 0,
  targetDate: null,
  targetMonths: null,
  activeDays: [],
};

describe("goal / target calculator", () => {
  it("computes remaining ayahs from actual memorized", () => {
    const plan = computeGoalPlan(baseGoal, 236, new Date("2026-10-12"));
    expect(plan.remainingAyahs).toBe(EXPECTED_TOTAL_AYAHS - 236);
    expect(plan.complete).toBe(false);
  });

  it("reports complete when all ayahs memorized", () => {
    const plan = computeGoalPlan(baseGoal, EXPECTED_TOTAL_AYAHS, new Date("2026-10-12"));
    expect(plan.complete).toBe(true);
    expect(plan.remainingAyahs).toBe(0);
    expect(plan.ayahsPerDay).toBe(0);
  });

  it("rounds ayahs-per-day up (ceil)", () => {
    const now = new Date("2026-10-12");
    // 10 remaining over 3 inclusive days (today..+2) => ceil(10/3) = 4
    const goal: Goal = { ...baseGoal, targetDate: "2026-10-14" };
    const plan = computeGoalPlan(goal, EXPECTED_TOTAL_AYAHS - 10, now);
    expect(plan.availableDays).toBe(3);
    expect(plan.ayahsPerDay).toBe(4);
  });

  it("warns when the target date is in the past", () => {
    const now = new Date("2026-10-12");
    const goal: Goal = { ...baseGoal, targetDate: "2026-10-01" };
    const plan = computeGoalPlan(goal, 0, now);
    expect(plan.warnings.some((w) => w.toLowerCase().includes("lewat"))).toBe(true);
  });

  it("warns on an invalid date string", () => {
    const now = new Date("2026-10-12");
    const goal: Goal = { ...baseGoal, targetDate: "2026-13-99" };
    const plan = computeGoalPlan(goal, 0, now);
    expect(plan.warnings.some((w) => w.toLowerCase().includes("tidak valid"))).toBe(true);
  });

  it("respects active days when counting available study days", () => {
    const now = new Date("2026-10-12"); // Monday
    // Only Mondays active, window of 8 days => 2 Mondays (12th and 19th).
    const goal: Goal = { ...baseGoal, targetDate: "2026-10-19", activeDays: [1] };
    const plan = computeGoalPlan(goal, EXPECTED_TOTAL_AYAHS - 10, now);
    expect(plan.availableDays).toBe(2);
    expect(plan.ayahsPerDay).toBe(5);
  });
});
