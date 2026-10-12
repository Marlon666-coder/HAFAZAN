import { useEffect, useRef, useState } from "react";
import { Loader, WifiOff } from "lucide-react";
import { loadSurahText } from "../../data/quranText";
import styles from "./AyahTextPanel.module.css";

interface AyahTextPanelProps {
  surah: number;
  /** 0-based index of the ayah currently playing (for highlight + autoscroll). */
  activeIndex: number;
}

type Status = "idle" | "loading" | "ready" | "error";

/**
 * Shows Arabic ayah text next to the murattal player. Text is optional and
 * loaded on demand (then cached locally). On failure the panel degrades
 * gracefully without affecting playback or tracking.
 */
export function AyahTextPanel({ surah, activeIndex }: AyahTextPanelProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [ayahs, setAyahs] = useState<string[]>([]);
  const listRef = useRef<HTMLOListElement | null>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setAyahs([]);
    loadSurahText(surah)
      .then((result) => {
        if (cancelled) return;
        if (result) {
          setAyahs(result.ayahs);
          setStatus("ready");
        } else {
          setStatus("error");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [surah]);

  // Keep the active ayah visible as playback advances.
  useEffect(() => {
    if (status !== "ready") return;
    const el = itemRefs.current[activeIndex];
    if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIndex, status]);

  if (status === "loading") {
    return (
      <div className={styles.state}>
        <Loader size={18} className={styles.spin} aria-hidden="true" /> Memuat teks ayat…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={styles.state}>
        <WifiOff size={16} aria-hidden="true" /> Teks ayat tidak dapat dimuat (butuh koneksi internet). Pemutar murattal
        dan pencatatan tetap berfungsi.
      </div>
    );
  }

  if (status !== "ready") return null;

  return (
    <ol className={styles.list} ref={listRef} dir="rtl" lang="ar">
      {ayahs.map((text, i) => (
        <li
          key={i}
          ref={(el) => {
            itemRefs.current[i] = el;
          }}
          className={`${styles.ayah} ${i === activeIndex ? styles.active : ""}`}
          aria-current={i === activeIndex ? "true" : undefined}
        >
          <span className={styles.num} aria-hidden="true">
            {i + 1}
          </span>
          <span className={"arabic " + styles.text}>{text}</span>
        </li>
      ))}
    </ol>
  );
}
