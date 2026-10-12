/**
 * Murattal reciters served from everyayah.com, which exposes a stable,
 * predictable per-ayah URL scheme:
 *
 *   https://everyayah.com/data/{folder}/{SSS}{AAA}.mp3
 *
 * where SSS = zero-padded surah number (3 digits) and AAA = zero-padded ayah
 * number (3 digits). Because the pattern is derivable from the surah/ayah
 * numbers we already have locally, no external metadata API is needed — only
 * the audio files themselves are fetched (streamed) at playback time.
 *
 * NOTE: Audio requires an internet connection. The core tracker remains fully
 * local; audio failures never affect tracking.
 */
export interface Reciter {
  /** Stable id persisted in settings. */
  id: string;
  /** Display name. */
  name: string;
  /** everyayah.com data folder (encodes reciter + bitrate). */
  folder: string;
}

export const RECITERS: Reciter[] = [
  { id: "alafasy", name: "Mishary Rashid Alafasy", folder: "Alafasy_128kbps" },
  { id: "abdulbasit", name: "Abdul Basit (Murattal)", folder: "Abdul_Basit_Murattal_192kbps" },
  { id: "husary", name: "Mahmoud Khalil Al-Husary", folder: "Husary_128kbps" },
  { id: "sudais", name: "Abdurrahman As-Sudais", folder: "Abdurrashid_Sufi_192kbps" },
  { id: "minshawi", name: "Muhammad Al-Minshawi (Murattal)", folder: "Minshawy_Murattal_128kbps" },
  { id: "shuraim", name: "Saud Ash-Shuraim", folder: "Saood_ash-Shuraym_128kbps" },
];

export const DEFAULT_RECITER_ID = "alafasy";

const RECITER_BY_ID = new Map<string, Reciter>(RECITERS.map((r) => [r.id, r]));

export function getReciter(id: string): Reciter {
  return RECITER_BY_ID.get(id) ?? RECITERS[0];
}

function pad3(n: number): string {
  return String(n).padStart(3, "0");
}

const AUDIO_BASE = "https://everyayah.com/data";

/** URL for a single ayah's recitation. */
export function ayahAudioUrl(reciterId: string, surah: number, ayah: number): string {
  const reciter = getReciter(reciterId);
  return `${AUDIO_BASE}/${reciter.folder}/${pad3(surah)}${pad3(ayah)}.mp3`;
}

/** Ordered list of per-ayah URLs for a whole surah. */
export function surahAudioUrls(reciterId: string, surah: number, ayahCount: number): string[] {
  const urls: string[] = [];
  for (let a = 1; a <= ayahCount; a += 1) {
    urls.push(ayahAudioUrl(reciterId, surah, a));
  }
  return urls;
}
