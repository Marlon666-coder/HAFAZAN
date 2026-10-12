import type { AppData } from "../types";
import { SCHEMA_VERSION } from "../types";
import { createEmptyAppData, sanitizeAppData } from "../utils/validation";

export const STORAGE_KEY = "hafazan:appdata:v1";

export interface LoadResult {
  data: AppData;
  /** True if we had to fall back to empty data due to a problem. */
  recovered: boolean;
  /** Human-readable note about what happened, if anything notable. */
  message: string | null;
}

/** Detect whether localStorage is usable in this environment. */
export function isStorageAvailable(): boolean {
  try {
    const k = "__hafazan_probe__";
    window.localStorage.setItem(k, "1");
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

/**
 * Migrate older-schema data forward. Currently only v1 exists, but the hook is
 * here so future schema bumps can transform data instead of discarding it.
 */
function migrate(raw: Record<string, unknown>): Record<string, unknown> {
  const version = typeof raw.schemaVersion === "number" ? raw.schemaVersion : 0;
  const data = { ...raw };

  // Example migration scaffold: v0 (unversioned) → v1.
  if (version < 1) {
    data.schemaVersion = 1;
  }

  return data;
}

/** Load + validate app data from localStorage, never throwing. */
export function loadAppData(): LoadResult {
  if (!isStorageAvailable()) {
    return {
      data: createEmptyAppData(),
      recovered: true,
      message:
        "Penyimpanan lokal tidak tersedia di peramban ini. Progres tidak akan tersimpan antar sesi.",
    };
  }

  const rawString = window.localStorage.getItem(STORAGE_KEY);
  if (!rawString) {
    return { data: createEmptyAppData(), recovered: false, message: null };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawString);
  } catch {
    // Corrupt JSON: keep the broken copy for safety, start fresh in memory.
    try {
      window.localStorage.setItem(`${STORAGE_KEY}:corrupt-backup`, rawString);
    } catch {
      /* ignore */
    }
    return {
      data: createEmptyAppData(),
      recovered: true,
      message:
        "Data tersimpan rusak dan tidak dapat dibaca. Salinan rusak disimpan terpisah, aplikasi dimulai dari kondisi kosong.",
    };
  }

  const migrated =
    typeof parsed === "object" && parsed !== null
      ? migrate(parsed as Record<string, unknown>)
      : parsed;

  const data = sanitizeAppData(migrated);
  return { data, recovered: false, message: null };
}

export interface SaveResult {
  ok: boolean;
  message: string | null;
}

/** Persist app data to localStorage. Returns a result instead of throwing. */
export function saveAppData(data: AppData): SaveResult {
  if (!isStorageAvailable()) {
    return { ok: false, message: "Penyimpanan lokal tidak tersedia; perubahan tidak tersimpan." };
  }
  try {
    const toStore: AppData = { ...data, schemaVersion: SCHEMA_VERSION };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    return { ok: true, message: null };
  } catch (err) {
    const quota =
      err instanceof DOMException &&
      (err.name === "QuotaExceededError" || err.name === "NS_ERROR_DOM_QUOTA_REACHED");
    return {
      ok: false,
      message: quota
        ? "Penyimpanan lokal penuh. Ekspor cadangan lalu kurangi data untuk melanjutkan."
        : "Gagal menyimpan perubahan ke penyimpanan lokal.",
    };
  }
}

/** Remove all stored app data (used by Reset). */
export function clearAppData(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Serialize app data for export as a pretty JSON string. */
export function exportToJson(data: AppData): string {
  return JSON.stringify({ ...data, schemaVersion: SCHEMA_VERSION, exportedAt: new Date().toISOString() }, null, 2);
}
