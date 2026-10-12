import { createContext, useContext } from "react";
import type { AppData } from "../types";
import type { MemorizationStatus, AyahRange, PageRange } from "../types/memorization";
import type { Settings } from "../types/settings";
import type { ReviewSession } from "../types/review";

export interface AppStore {
  data: AppData;
  /** True if storage is unavailable or data was recovered from corruption. */
  storageWarning: string | null;

  // Surah progress mutations.
  setSurahStatus: (surah: number, status: MemorizationStatus) => void;
  addSurahRange: (surah: number, range: AyahRange) => void;
  removeSurahRange: (surah: number, range: AyahRange) => void;
  setSurahPageRanges: (surah: number, ranges: PageRange[]) => void;
  setSurahNotes: (surah: number, notes: string) => void;

  // Reviews.
  createReviewSession: (surahNumbers: number[]) => string;
  addReviewItem: (sessionId: string, surah: number) => void;
  removeReviewItem: (sessionId: string, itemId: string) => void;
  toggleReviewItem: (sessionId: string, itemId: string) => void;
  setReviewNote: (sessionId: string, note: string) => void;
  completeReviewSession: (sessionId: string) => void;
  deleteReviewSession: (sessionId: string) => void;

  // Settings.
  updateSettings: (patch: Partial<Settings>) => void;
  updateGoal: (patch: Partial<Settings["goal"]>) => void;

  // Backup / reset.
  importData: (incoming: AppData, mode: "replace" | "merge") => void;
  resetData: () => void;
  replaceAll: (data: AppData) => void;
  exportReviews: () => ReviewSession[];
}

export const AppStoreContext = createContext<AppStore | null>(null);

export function useAppStore(): AppStore {
  const ctx = useContext(AppStoreContext);
  if (!ctx) {
    throw new Error("useAppStore must be used within AppDataProvider");
  }
  return ctx;
}
