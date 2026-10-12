/**
 * Optional Arabic ayah text fetched on demand from the public AlQuran Cloud
 * API (https://alquran.cloud). This is used ONLY to display the text alongside
 * the murattal player, so the reader can follow while listening.
 *
 * Design constraints honoured:
 * - Fetched on demand per surah, then cached in localStorage so repeat visits
 *   and offline sessions still show previously-loaded surahs.
 * - Fully fail-safe: any network/parse error returns null and the UI degrades
 *   gracefully. The core tracker never depends on this.
 * - No API key, no auth.
 */

const CACHE_PREFIX = "hafazan:ayahtext:v1:";
// Uthmani script edition (Arabic text only).
const EDITION = "quran-uthmani";

export interface SurahText {
  surah: number;
  /** ayahs[i] is the Arabic text of ayah (i + 1). */
  ayahs: string[];
}

function cacheKey(surah: number): string {
  return `${CACHE_PREFIX}${EDITION}:${surah}`;
}

function readCache(surah: number): SurahText | null {
  try {
    const raw = window.localStorage.getItem(cacheKey(surah));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      Array.isArray((parsed as SurahText).ayahs) &&
      (parsed as SurahText).ayahs.every((a) => typeof a === "string")
    ) {
      return parsed as SurahText;
    }
    return null;
  } catch {
    return null;
  }
}

function writeCache(value: SurahText): void {
  try {
    window.localStorage.setItem(cacheKey(value.surah), JSON.stringify(value));
  } catch {
    /* quota or unavailable — safe to ignore, text is non-essential */
  }
}

/**
 * Load Arabic text for a whole surah. Returns cached data instantly when
 * available; otherwise fetches once and caches. Returns null on any failure.
 */
export async function loadSurahText(surah: number): Promise<SurahText | null> {
  const cached = readCache(surah);
  if (cached) return cached;

  try {
    const res = await fetch(`https://api.alquran.cloud/v1/surah/${surah}/${EDITION}`);
    if (!res.ok) return null;
    const json: unknown = await res.json();
    const ayahsRaw = (json as { data?: { ayahs?: { text?: unknown }[] } })?.data?.ayahs;
    if (!Array.isArray(ayahsRaw)) return null;
    const ayahs = ayahsRaw.map((a) => (typeof a.text === "string" ? a.text : ""));
    if (ayahs.length === 0 || ayahs.some((t) => t === "")) return null;
    const value: SurahText = { surah, ayahs };
    writeCache(value);
    return value;
  } catch {
    return null;
  }
}

/** Whether a surah's text is already cached locally (available offline). */
export function hasCachedText(surah: number): boolean {
  return readCache(surah) !== null;
}
