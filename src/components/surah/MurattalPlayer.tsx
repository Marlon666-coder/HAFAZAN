import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Repeat, Repeat1, Volume2, WifiOff } from "lucide-react";
import { surahAudioUrls, getReciter } from "../../data/reciters";
import { useAppStore } from "../../state/appStore";
import styles from "./MurattalPlayer.module.css";

interface MurattalPlayerProps {
  surah: number;
  ayahCount: number;
}

type LoopMode = "off" | "surah" | "ayah";

/**
 * Streams murattal (per-ayah audio) for a surah from everyayah.com using the
 * reciter chosen in settings. Fully fail-safe: any network/audio error is
 * surfaced as a gentle message and never breaks the surrounding tracker.
 *
 * Audio requires an internet connection; the core tracker stays offline-first.
 */
export function MurattalPlayer({ surah, ayahCount }: MurattalPlayerProps) {
  const { data } = useAppStore();
  const reciterId = data.settings.reciterId;
  const reciter = getReciter(reciterId);

  const urls = useMemo(() => surahAudioUrls(reciterId, surah, ayahCount), [reciterId, surah, ayahCount]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [current, setCurrent] = useState(0); // 0-based ayah index
  const [playing, setPlaying] = useState(false);
  const [loop, setLoop] = useState<LoopMode>("off");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Keep a single <audio> element across renders.
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  // Reset when surah or reciter changes.
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
    setPlaying(false);
    setCurrent(0);
    setError(null);
  }, [surah, reciterId]);

  // Wire event handlers; depends on loop + urls + current so handlers stay fresh.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const handleEnded = () => {
      if (loop === "ayah") {
        void playIndex(current);
        return;
      }
      const next = current + 1;
      if (next < urls.length) {
        setCurrent(next);
        void playIndex(next);
      } else if (loop === "surah") {
        setCurrent(0);
        void playIndex(0);
      } else {
        setPlaying(false);
      }
    };

    const handleError = () => {
      setLoading(false);
      setPlaying(false);
      setError(
        navigator.onLine
          ? "Gagal memuat audio dari sumber. Coba qari lain di Pengaturan atau ulangi nanti."
          : "Tidak ada koneksi internet. Audio murattal membutuhkan koneksi.",
      );
    };

    const handlePlaying = () => {
      setLoading(false);
      setError(null);
    };
    const handleWaiting = () => setLoading(true);

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("waiting", handleWaiting);
    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("waiting", handleWaiting);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loop, current, urls]);

  const playIndex = async (index: number): Promise<void> => {
    const audio = audioRef.current;
    if (!audio || index < 0 || index >= urls.length) return;
    try {
      setError(null);
      setLoading(true);
      audio.src = urls[index];
      await audio.play();
      setPlaying(true);
    } catch {
      // play() rejects on autoplay block or load failure; "error" event covers load.
      setLoading(false);
      setPlaying(false);
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      void playIndex(current);
    }
  };

  const prev = () => {
    const idx = Math.max(0, current - 1);
    setCurrent(idx);
    void playIndex(idx);
  };

  const next = () => {
    const idx = Math.min(urls.length - 1, current + 1);
    setCurrent(idx);
    void playIndex(idx);
  };

  const cycleLoop = () => {
    setLoop((m) => (m === "off" ? "surah" : m === "surah" ? "ayah" : "off"));
  };

  return (
    <div className={styles.player}>
      <div className={styles.head}>
        <span className={styles.reciter}>
          <Volume2 size={16} aria-hidden="true" /> {reciter.name}
        </span>
        <span className={styles.ayahLabel} aria-live="polite">
          {loading ? "Memuat…" : `Ayat ${current + 1} / ${ayahCount}`}
        </span>
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.ctrlBtn}
          onClick={prev}
          disabled={current === 0}
          aria-label="Ayat sebelumnya"
        >
          <SkipBack size={18} />
        </button>

        <button
          type="button"
          className={`${styles.ctrlBtn} ${styles.playBtn}`}
          onClick={togglePlay}
          aria-label={playing ? "Jeda" : "Putar murattal"}
        >
          {playing ? <Pause size={22} /> : <Play size={22} />}
        </button>

        <button
          type="button"
          className={styles.ctrlBtn}
          onClick={next}
          disabled={current >= urls.length - 1}
          aria-label="Ayat berikutnya"
        >
          <SkipForward size={18} />
        </button>

        <button
          type="button"
          className={`${styles.ctrlBtn} ${loop !== "off" ? styles.active : ""}`}
          onClick={cycleLoop}
          aria-label={
            loop === "off"
              ? "Aktifkan ulangi surah"
              : loop === "surah"
                ? "Ulangi satu ayat"
                : "Matikan pengulangan"
          }
          aria-pressed={loop !== "off"}
          title={loop === "off" ? "Tanpa ulang" : loop === "surah" ? "Ulangi surah" : "Ulangi ayat"}
        >
          {loop === "ayah" ? <Repeat1 size={18} /> : <Repeat size={18} />}
        </button>
      </div>

      <div className={styles.jump}>
        <label className={styles.jumpLabel}>
          <span className="visually-hidden">Pilih ayat untuk diputar</span>
          <select
            className="select"
            value={current}
            onChange={(e) => {
              const idx = Number(e.target.value);
              setCurrent(idx);
              void playIndex(idx);
            }}
            aria-label="Lompat ke ayat"
          >
            {Array.from({ length: ayahCount }, (_, i) => (
              <option key={i} value={i}>
                Ayat {i + 1}
              </option>
            ))}
          </select>
        </label>
        <span className={styles.loopHint}>
          {loop === "off" && "Putar berurutan"}
          {loop === "surah" && "Ulangi seluruh surah"}
          {loop === "ayah" && "Ulangi ayat ini"}
        </span>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          <WifiOff size={14} aria-hidden="true" /> {error}
        </p>
      )}
      <p className={styles.note}>
        Audio di-streaming dari sumber eksternal dan membutuhkan koneksi internet. Pencatatan hafalan tetap berfungsi tanpa koneksi.
      </p>
    </div>
  );
}
