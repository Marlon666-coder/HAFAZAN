import type { AppData, SurahProgress } from "../types";
import { SCHEMA_VERSION } from "../types";
import type { MemorizationStatus } from "../types/memorization";
import type { ThemePreference, ProgressDisplay } from "../types/settings";
import { DEFAULT_RECITER_ID, RECITERS } from "../data/reciters";

const STATUSES: MemorizationStatus[] = ["not-started", "in-progress", "memorized", "review"];
const THEMES: ThemePreference[] = ["light", "dark", "system"];
const DISPLAYS: ProgressDisplay[] = ["ayah", "percent"];

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function num(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function bool(v: unknown, fallback: boolean): boolean {
  return typeof v === "boolean" ? v : fallback;
}

/** Build a fresh, empty-but-valid app data object. */
export function createEmptyAppData(): AppData {
  return {
    schemaVersion: SCHEMA_VERSION,
    progress: {},
    reviews: [],
    settings: {
      nickname: "",
      bio: "",
      theme: "system",
      progressDisplay: "percent",
      confirmDestructive: true,
      reciterId: DEFAULT_RECITER_ID,
      goal: {
        dailyAyahTarget: 0,
        dailyPageTarget: 0,
        targetDate: null,
        targetMonths: null,
        activeDays: [],
      },
    },
  };
}

function sanitizeProgressEntry(raw: unknown, surahNumber: number): SurahProgress {
  const o = isObject(raw) ? raw : {};
  const status = STATUSES.includes(o.status as MemorizationStatus)
    ? (o.status as MemorizationStatus)
    : "not-started";

  const memorizedRanges = Array.isArray(o.memorizedRanges)
    ? o.memorizedRanges
        .filter(isObject)
        .map((r) => ({ start: num(r.start, 0), end: num(r.end, 0) }))
        .filter((r) => r.start >= 1 && r.end >= r.start)
    : [];

  const pageRanges = Array.isArray(o.pageRanges)
    ? o.pageRanges
        .filter(isObject)
        .map((r) => ({ start: num(r.start, 0), end: num(r.end, 0) }))
        .filter((r) => r.start >= 1 && r.end >= r.start)
    : [];

  const history = Array.isArray(o.history)
    ? o.history.filter(isObject).map((h) => ({
        date: str(h.date),
        timestamp: str(h.timestamp),
        description: str(h.description),
        ayahsMemorized: num(h.ayahsMemorized, 0),
      }))
    : [];

  return {
    surah: surahNumber,
    status,
    memorizedRanges,
    pageRanges,
    notes: str(o.notes),
    lastUpdated: typeof o.lastUpdated === "string" ? o.lastUpdated : null,
    history,
  };
}

/**
 * Validate + repair arbitrary parsed JSON into a safe AppData object.
 * Never throws; unknown/corrupt fields fall back to safe defaults so a single
 * bad value can never wipe the whole dataset.
 */
export function sanitizeAppData(raw: unknown): AppData {
  const base = createEmptyAppData();
  if (!isObject(raw)) return base;

  // Progress.
  if (isObject(raw.progress)) {
    for (const key of Object.keys(raw.progress)) {
      const n = Number.parseInt(key, 10);
      if (!Number.isInteger(n) || n < 1 || n > 114) continue;
      base.progress[String(n)] = sanitizeProgressEntry(raw.progress[key], n);
    }
  }

  // Reviews.
  if (Array.isArray(raw.reviews)) {
    base.reviews = raw.reviews.filter(isObject).map((r) => ({
      id: str(r.id) || `rev_${Math.random().toString(36).slice(2)}`,
      date: str(r.date),
      createdAt: str(r.createdAt),
      items: Array.isArray(r.items)
        ? r.items.filter(isObject).map((it) => ({
            id: str(it.id) || `item_${Math.random().toString(36).slice(2)}`,
            surah: num(it.surah, 1),
            done: bool(it.done, false),
          }))
        : [],
      note: str(r.note),
      completed: bool(r.completed, false),
      completedAt: typeof r.completedAt === "string" ? r.completedAt : null,
    }));
  }

  // Settings.
  if (isObject(raw.settings)) {
    const s = raw.settings;
    const g = isObject(s.goal) ? s.goal : {};
    base.settings = {
      nickname: str(s.nickname),
      bio: str(s.bio),
      theme: THEMES.includes(s.theme as ThemePreference) ? (s.theme as ThemePreference) : "system",
      progressDisplay: DISPLAYS.includes(s.progressDisplay as ProgressDisplay)
        ? (s.progressDisplay as ProgressDisplay)
        : "percent",
      confirmDestructive: bool(s.confirmDestructive, true),
      reciterId: RECITERS.some((r) => r.id === s.reciterId) ? (s.reciterId as string) : DEFAULT_RECITER_ID,
      goal: {
        dailyAyahTarget: Math.max(0, num(g.dailyAyahTarget, 0)),
        dailyPageTarget: Math.max(0, num(g.dailyPageTarget, 0)),
        targetDate: typeof g.targetDate === "string" ? g.targetDate : null,
        targetMonths:
          typeof g.targetMonths === "number" && Number.isFinite(g.targetMonths)
            ? g.targetMonths
            : null,
        activeDays: Array.isArray(g.activeDays)
          ? g.activeDays.filter((d): d is number => typeof d === "number" && d >= 0 && d <= 6)
          : [],
      },
    };
  }

  return base;
}

/** Lightweight check that a parsed object looks like an importable backup. */
export function looksLikeBackup(raw: unknown): raw is Partial<AppData> {
  return isObject(raw) && ("progress" in raw || "reviews" in raw || "settings" in raw);
}
