import { describe, it, expect } from "vitest";
import { computeStreak } from "../src/utils/streak";
import type { ReviewSession } from "../src/types/review";

function session(date: string, completed = true): ReviewSession {
  return {
    id: `s-${date}-${Math.random()}`,
    date,
    createdAt: `${date}T08:00:00.000Z`,
    items: [{ id: "i1", surah: 1, done: true }],
    note: "",
    completed,
    completedAt: completed ? `${date}T08:30:00.000Z` : null,
  };
}

describe("streak computation", () => {
  it("returns zero for no reviews", () => {
    const r = computeStreak([], new Date("2026-10-12T10:00:00"));
    expect(r).toEqual({ current: 0, longest: 0, activeDays: [] });
  });

  it("counts multiple sessions on the same day as one day", () => {
    const now = new Date("2026-10-12T10:00:00");
    const r = computeStreak([session("2026-10-12"), session("2026-10-12")], now);
    expect(r.current).toBe(1);
    expect(r.longest).toBe(1);
    expect(r.activeDays).toEqual(["2026-10-12"]);
  });

  it("computes consecutive-day streaks", () => {
    const now = new Date("2026-10-12T10:00:00");
    const r = computeStreak(
      [session("2026-10-10"), session("2026-10-11"), session("2026-10-12")],
      now,
    );
    expect(r.current).toBe(3);
    expect(r.longest).toBe(3);
  });

  it("breaks the current streak on a missed day", () => {
    const now = new Date("2026-10-12T10:00:00");
    // Last active 2 days ago -> current streak is 0.
    const r = computeStreak([session("2026-10-09"), session("2026-10-10")], now);
    expect(r.current).toBe(0);
    expect(r.longest).toBe(2);
  });

  it("keeps streak alive if last active day was yesterday", () => {
    const now = new Date("2026-10-12T10:00:00");
    const r = computeStreak([session("2026-10-10"), session("2026-10-11")], now);
    expect(r.current).toBe(2);
  });

  it("tracks the longest run even after a break", () => {
    const now = new Date("2026-10-20T10:00:00");
    const r = computeStreak(
      [
        session("2026-10-01"),
        session("2026-10-02"),
        session("2026-10-03"),
        session("2026-10-10"),
      ],
      now,
    );
    expect(r.longest).toBe(3);
    expect(r.current).toBe(0);
  });

  it("ignores incomplete sessions", () => {
    const now = new Date("2026-10-12T10:00:00");
    const r = computeStreak([session("2026-10-12", false)], now);
    expect(r.current).toBe(0);
    expect(r.longest).toBe(0);
  });
});
