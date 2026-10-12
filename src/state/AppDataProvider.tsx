import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { AppData } from "../types";
import type { AyahRange, PageRange, MemorizationStatus, ProgressHistoryEntry } from "../types/memorization";
import type { Settings } from "../types/settings";
import { AppStoreContext, type AppStore } from "./appStore";
import { emptyProgress } from "./selectors";
import { loadAppData, saveAppData } from "./storage";
import { createEmptyAppData } from "../utils/validation";
import { addRange, removeRange, surahMemorizedCount } from "../utils/progress";
import { getSurah } from "../data/surahs";
import { todayLocal } from "../utils/date";
import { createId } from "../utils/format";

export function AppDataProvider({ children }: { children: ReactNode }) {
  const initial = useRef(loadAppData());
  const [data, setData] = useState<AppData>(initial.current.data);
  const [storageWarning, setStorageWarning] = useState<string | null>(initial.current.message);

  // Persist on every change (metadata is never stored — only user data).
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const result = saveAppData(data);
    if (!result.ok && result.message) {
      setStorageWarning(result.message);
    }
  }, [data]);

  /** Mutate a single surah's progress, creating a record if needed. */
  const mutateProgress = useCallback(
    (
      surahNumber: number,
      fn: (prev: AppData["progress"][string]) => AppData["progress"][string],
      describe?: (next: AppData["progress"][string]) => string,
    ) => {
      setData((prev) => {
        const key = String(surahNumber);
        const current = prev.progress[key] ?? emptyProgress(surahNumber);
        let next = fn(current);
        const today = todayLocal();
        if (describe) {
          const entry: ProgressHistoryEntry = {
            date: today,
            timestamp: new Date().toISOString(),
            description: describe(next),
            ayahsMemorized: surahMemorizedCount(next),
          };
          next = { ...next, history: [entry, ...next.history].slice(0, 50) };
        }
        next = { ...next, lastUpdated: today };
        return { ...prev, progress: { ...prev.progress, [key]: next } };
      });
    },
    [],
  );

  const setSurahStatus = useCallback(
    (surah: number, status: MemorizationStatus) => {
      mutateProgress(
        surah,
        (p) => ({ ...p, status }),
        (p) => `Status diubah menjadi "${statusLabel(p.status)}".`,
      );
    },
    [mutateProgress],
  );

  const addSurahRange = useCallback(
    (surah: number, range: AyahRange) => {
      const meta = getSurah(surah);
      if (!meta) return;
      mutateProgress(
        surah,
        (p) => {
          const memorizedRanges = addRange(p.memorizedRanges, range, meta.ayahCount);
          // Auto-promote to in-progress on first recorded ayahs (never to memorized).
          const status: MemorizationStatus =
            p.status === "not-started" && memorizedRanges.length > 0 ? "in-progress" : p.status;
          return { ...p, memorizedRanges, status };
        },
        () => `Menambah hafalan ayat ${range.start}–${range.end}.`,
      );
    },
    [mutateProgress],
  );

  const removeSurahRange = useCallback(
    (surah: number, range: AyahRange) => {
      const meta = getSurah(surah);
      if (!meta) return;
      mutateProgress(
        surah,
        (p) => ({ ...p, memorizedRanges: removeRange(p.memorizedRanges, range, meta.ayahCount) }),
        () => `Menghapus hafalan ayat ${range.start}–${range.end}.`,
      );
    },
    [mutateProgress],
  );

  const setSurahPageRanges = useCallback(
    (surah: number, ranges: PageRange[]) => {
      mutateProgress(surah, (p) => ({ ...p, pageRanges: ranges }));
    },
    [mutateProgress],
  );

  const setSurahNotes = useCallback(
    (surah: number, notes: string) => {
      mutateProgress(surah, (p) => ({ ...p, notes }));
    },
    [mutateProgress],
  );

  // ---- Reviews ----
  const createReviewSession = useCallback((surahNumbers: number[]): string => {
    const id = createId("rev");
    setData((prev) => {
      const session = {
        id,
        date: todayLocal(),
        createdAt: new Date().toISOString(),
        items: surahNumbers.map((s) => ({ id: createId("item"), surah: s, done: false })),
        note: "",
        completed: false,
        completedAt: null,
      };
      return { ...prev, reviews: [session, ...prev.reviews] };
    });
    return id;
  }, []);

  const updateSession = useCallback(
    (sessionId: string, fn: (s: AppData["reviews"][number]) => AppData["reviews"][number]) => {
      setData((prev) => ({
        ...prev,
        reviews: prev.reviews.map((r) => (r.id === sessionId ? fn(r) : r)),
      }));
    },
    [],
  );

  const addReviewItem = useCallback(
    (sessionId: string, surah: number) => {
      updateSession(sessionId, (s) => ({
        ...s,
        items: [...s.items, { id: createId("item"), surah, done: false }],
      }));
    },
    [updateSession],
  );

  const removeReviewItem = useCallback(
    (sessionId: string, itemId: string) => {
      updateSession(sessionId, (s) => ({ ...s, items: s.items.filter((i) => i.id !== itemId) }));
    },
    [updateSession],
  );

  const toggleReviewItem = useCallback(
    (sessionId: string, itemId: string) => {
      updateSession(sessionId, (s) => ({
        ...s,
        items: s.items.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i)),
      }));
    },
    [updateSession],
  );

  const setReviewNote = useCallback(
    (sessionId: string, note: string) => {
      updateSession(sessionId, (s) => ({ ...s, note }));
    },
    [updateSession],
  );

  const completeReviewSession = useCallback(
    (sessionId: string) => {
      updateSession(sessionId, (s) => ({
        ...s,
        completed: true,
        completedAt: new Date().toISOString(),
        items: s.items.map((i) => ({ ...i, done: true })),
      }));
    },
    [updateSession],
  );

  const deleteReviewSession = useCallback((sessionId: string) => {
    setData((prev) => ({ ...prev, reviews: prev.reviews.filter((r) => r.id !== sessionId) }));
  }, []);

  // ---- Settings ----
  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setData((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  }, []);

  const updateGoal = useCallback((patch: Partial<Settings["goal"]>) => {
    setData((prev) => ({
      ...prev,
      settings: { ...prev.settings, goal: { ...prev.settings.goal, ...patch } },
    }));
  }, []);

  // ---- Backup / reset ----
  const importData = useCallback((incoming: AppData, mode: "replace" | "merge") => {
    setData((prev) => {
      if (mode === "replace") return incoming;
      // Merge: incoming progress overrides existing by surah; reviews concatenated by id.
      const mergedProgress = { ...prev.progress, ...incoming.progress };
      const existingReviewIds = new Set(prev.reviews.map((r) => r.id));
      const mergedReviews = [
        ...prev.reviews,
        ...incoming.reviews.filter((r) => !existingReviewIds.has(r.id)),
      ];
      return {
        schemaVersion: incoming.schemaVersion,
        progress: mergedProgress,
        reviews: mergedReviews,
        settings: incoming.settings,
      };
    });
  }, []);

  const replaceAll = useCallback((d: AppData) => setData(d), []);
  const resetData = useCallback(() => setData(createEmptyAppData()), []);
  const exportReviews = useCallback(() => data.reviews, [data.reviews]);

  const store = useMemo<AppStore>(
    () => ({
      data,
      storageWarning,
      setSurahStatus,
      addSurahRange,
      removeSurahRange,
      setSurahPageRanges,
      setSurahNotes,
      createReviewSession,
      addReviewItem,
      removeReviewItem,
      toggleReviewItem,
      setReviewNote,
      completeReviewSession,
      deleteReviewSession,
      updateSettings,
      updateGoal,
      importData,
      resetData,
      replaceAll,
      exportReviews,
    }),
    [
      data,
      storageWarning,
      setSurahStatus,
      addSurahRange,
      removeSurahRange,
      setSurahPageRanges,
      setSurahNotes,
      createReviewSession,
      addReviewItem,
      removeReviewItem,
      toggleReviewItem,
      setReviewNote,
      completeReviewSession,
      deleteReviewSession,
      updateSettings,
      updateGoal,
      importData,
      resetData,
      replaceAll,
      exportReviews,
    ],
  );

  return <AppStoreContext.Provider value={store}>{children}</AppStoreContext.Provider>;
}

function statusLabel(status: MemorizationStatus): string {
  switch (status) {
    case "not-started":
      return "Belum Dimulai";
    case "in-progress":
      return "Sedang Dihafal";
    case "memorized":
      return "Sudah Hafal";
    case "review":
      return "Muroja'ah";
  }
}
