import { describe, it, expect, beforeEach } from "vitest";
import { loadAppData, saveAppData, clearAppData, exportToJson, STORAGE_KEY } from "../src/state/storage";
import { sanitizeAppData, createEmptyAppData } from "../src/utils/validation";
import type { AppData } from "../src/types";

beforeEach(() => {
  window.localStorage.clear();
});

describe("storage load/save", () => {
  it("returns empty data when nothing is stored", () => {
    const result = loadAppData();
    expect(result.recovered).toBe(false);
    expect(result.data.progress).toEqual({});
    expect(result.data.reviews).toEqual([]);
  });

  it("round-trips saved data", () => {
    const data = createEmptyAppData();
    data.progress["1"] = {
      surah: 1,
      status: "memorized",
      memorizedRanges: [{ start: 1, end: 7 }],
      pageRanges: [],
      notes: "selesai",
      lastUpdated: "2026-10-12",
      history: [],
    };
    const saved = saveAppData(data);
    expect(saved.ok).toBe(true);

    const loaded = loadAppData();
    expect(loaded.data.progress["1"].status).toBe("memorized");
    expect(loaded.data.progress["1"].memorizedRanges).toEqual([{ start: 1, end: 7 }]);
  });

  it("recovers gracefully from corrupt JSON", () => {
    window.localStorage.setItem(STORAGE_KEY, "{ not valid json ");
    const result = loadAppData();
    expect(result.recovered).toBe(true);
    expect(result.data.progress).toEqual({});
    // A corrupt backup copy is retained.
    expect(window.localStorage.getItem(`${STORAGE_KEY}:corrupt-backup`)).toBeTruthy();
  });

  it("sanitizes out-of-schema values instead of discarding everything", () => {
    const dirty = {
      schemaVersion: 1,
      progress: {
        "2": { status: "nonsense", memorizedRanges: [{ start: 5, end: 1 }], notes: 123 },
        "999": { status: "memorized" }, // invalid surah number, dropped
      },
      reviews: "not-an-array",
      settings: { theme: "neon" },
    };
    const data = sanitizeAppData(dirty);
    expect(Object.keys(data.progress)).toEqual(["2"]);
    expect(data.progress["2"].status).toBe("not-started"); // invalid status reset
    expect(data.reviews).toEqual([]);
    expect(data.settings.theme).toBe("system"); // invalid theme reset
  });

  it("clears data on reset", () => {
    saveAppData(createEmptyAppData());
    clearAppData();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

describe("export / import", () => {
  it("exports valid JSON that re-imports consistently", () => {
    const data: AppData = createEmptyAppData();
    data.settings.nickname = "Marlo";
    data.progress["114"] = {
      surah: 114,
      status: "memorized",
      memorizedRanges: [{ start: 1, end: 6 }],
      pageRanges: [],
      notes: "",
      lastUpdated: "2026-10-12",
      history: [],
    };

    const json = exportToJson(data);
    const parsed = JSON.parse(json);
    const reimported = sanitizeAppData(parsed);

    expect(reimported.settings.nickname).toBe("Marlo");
    expect(reimported.progress["114"].memorizedRanges).toEqual([{ start: 1, end: 6 }]);
  });

  it("migrates unversioned data to current schema", () => {
    const legacy = { progress: {}, reviews: [], settings: {} };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));
    const result = loadAppData();
    expect(result.data.schemaVersion).toBe(1);
  });
});
