import { useCallback, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, History } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { StatusBadge } from "../components/common/StatusBadge";
import { ProgressBar } from "../components/common/ProgressBar";
import { useToast } from "../components/feedback/ToastProvider";
import { MurattalPlayer } from "../components/surah/MurattalPlayer";
import { AyahTextPanel } from "../components/surah/AyahTextPanel";
import { useAppStore } from "../state/appStore";
import { emptyProgress } from "../state/selectors";
import { getSurah } from "../data/surahs";
import { surahMemorizedCount, normalizeRanges } from "../utils/progress";
import { STATUS_META, STATUS_ORDER } from "../utils/status";
import type { MemorizationStatus } from "../types/memorization";
import { formatDateId } from "../utils/date";
import styles from "./SurahDetailView.module.css";

export function SurahDetailView() {
  const { number } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const store = useAppStore();

  const surahNumber = Number(number);
  const surah = getSurah(surahNumber);

  const progress = store.data.progress[String(surahNumber)] ?? emptyProgress(surahNumber);

  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<string | null>(null);
  const [activeAyah, setActiveAyah] = useState(0);
  const [showText, setShowText] = useState(false);

  const handleAyahChange = useCallback((index: number) => setActiveAyah(index), []);

  const normalizedRanges = useMemo(
    () => (surah ? normalizeRanges(progress.memorizedRanges, surah.ayahCount) : []),
    [progress.memorizedRanges, surah],
  );
  const memorized = useMemo(() => surahMemorizedCount(progress), [progress]);

  if (!surah) {
    return (
      <>
        <PageHeader title="Surah tidak ditemukan" />
        <div className="card" style={{ padding: "1.5rem" }}>
          <p>Nomor surah tidak valid.</p>
          <Link to="/surahs" className="btn btn-primary btn-sm" style={{ marginTop: "1rem" }}>
            Kembali ke Daftar Surah
          </Link>
        </div>
      </>
    );
  }

  const percent = (memorized / surah.ayahCount) * 100;
  const notesValue = notesDraft ?? progress.notes;

  const handleAddRange = () => {
    setRangeError(null);
    const start = Number.parseInt(rangeStart, 10);
    const end = Number.parseInt(rangeEnd === "" ? rangeStart : rangeEnd, 10);
    if (!Number.isInteger(start) || !Number.isInteger(end)) {
      setRangeError("Masukkan nomor ayat yang valid.");
      return;
    }
    if (start < 1 || end < 1 || start > surah.ayahCount || end > surah.ayahCount) {
      setRangeError(`Nomor ayat harus antara 1 dan ${surah.ayahCount}.`);
      return;
    }
    if (start > end) {
      setRangeError("Ayat awal tidak boleh lebih besar dari ayat akhir.");
      return;
    }
    store.addSurahRange(surahNumber, { start, end });
    setRangeStart("");
    setRangeEnd("");
    notify(`Ayat ${start}–${end} ditambahkan ke hafalan ${surah.nameLatin}.`, "success");
  };

  const handleRemove = (start: number, end: number) => {
    store.removeSurahRange(surahNumber, { start, end });
    notify(`Ayat ${start}–${end} dihapus dari hafalan.`, "info");
  };

  const handleStatus = (status: MemorizationStatus) => {
    store.setSurahStatus(surahNumber, status);
    notify(`Status diubah menjadi "${STATUS_META[status].label}".`, "info");
  };

  const saveNotes = () => {
    if (notesDraft === null) return;
    store.setSurahNotes(surahNumber, notesDraft);
    setNotesDraft(null);
    notify("Catatan tersimpan.", "success");
  };

  return (
    <>
      <PageHeader
        title={surah.nameLatin}
        subtitle={`${surah.meaningIndonesia} · ${surah.ayahCount} ayat`}
        actions={
          <button type="button" className="btn btn-ghost" onClick={() => navigate("/surahs")}>
            <ArrowLeft size={16} /> Daftar Surah
          </button>
        }
      />

      <div className={styles.grid}>
        <section className={"card " + styles.block}>
          <div className={styles.headRow}>
            <span className={"arabic " + styles.arabicName}>{surah.nameArabic}</span>
            <StatusBadge status={progress.status} />
          </div>
          <div className={styles.metaRow}>
            <span className="hint">Surah ke-{surah.number}</span>
            <span className="hint">
              {surah.startJuz === surah.endJuz ? `Juz ${surah.startJuz}` : `Juz ${surah.startJuz}–${surah.endJuz}`}
            </span>
          </div>
          <div className={styles.progressSummary}>
            <ProgressBar value={percent} label="Progres hafalan surah" />
            <p className="hint" style={{ marginTop: "0.5rem" }}>
              {memorized} dari {surah.ayahCount} ayat unik tercatat ({Math.round(percent)}%).
            </p>
          </div>
        </section>

        <section className={"card " + styles.block}>
          <h2 className={styles.blockTitle}>Status Hafalan</h2>
          <div className={styles.statusChoices} role="group" aria-label="Ubah status hafalan">
            {STATUS_ORDER.map((s) => (
              <button
                key={s}
                type="button"
                className={`${styles.statusBtn} ${progress.status === s ? styles.statusActive : ""}`}
                aria-pressed={progress.status === s}
                onClick={() => handleStatus(s)}
              >
                {STATUS_META[s].label}
              </button>
            ))}
          </div>
          <p className="hint" style={{ marginTop: "0.75rem" }}>
            Mengubah status tidak otomatis menandai seluruh ayat. Catat rentang ayat secara terpisah di bawah.
          </p>
        </section>
      </div>

      <section className={"card " + styles.block}>
        <div className={styles.murattalHead}>
          <h2 className={styles.blockTitle} style={{ marginBottom: 0 }}>
            Murattal
          </h2>
          <label className={styles.textToggle}>
            <input type="checkbox" checked={showText} onChange={(e) => setShowText(e.target.checked)} />
            <span>Tampilkan teks ayat</span>
          </label>
        </div>
        <MurattalPlayer surah={surah.number} ayahCount={surah.ayahCount} onAyahChange={handleAyahChange} />
        {showText && (
          <div className={styles.textWrap}>
            <AyahTextPanel surah={surah.number} activeIndex={activeAyah} />
          </div>
        )}
      </section>

      <section className={"card " + styles.block}>
        <h2 className={styles.blockTitle}>Rentang Ayat yang Dihafal</h2>
        <div className={styles.rangeForm}>
          <div className={styles.rangeInputs}>
            <label className={styles.rangeField}>
              <span className="label">Dari ayat</span>
              <input
                type="number"
                inputMode="numeric"
                className="input"
                min={1}
                max={surah.ayahCount}
                value={rangeStart}
                onChange={(e) => setRangeStart(e.target.value)}
                placeholder="1"
              />
            </label>
            <label className={styles.rangeField}>
              <span className="label">Sampai ayat</span>
              <input
                type="number"
                inputMode="numeric"
                className="input"
                min={1}
                max={surah.ayahCount}
                value={rangeEnd}
                onChange={(e) => setRangeEnd(e.target.value)}
                placeholder={`${surah.ayahCount}`}
              />
            </label>
          </div>
          <button type="button" className="btn btn-primary" onClick={handleAddRange}>
            <Plus size={16} /> Tambah Rentang
          </button>
        </div>
        {rangeError && <p className="error-text" role="alert">{rangeError}</p>}

        {normalizedRanges.length === 0 ? (
          <p className="hint" style={{ marginTop: "0.75rem" }}>
            Belum ada rentang ayat yang dicatat. Tambahkan rentang di atas untuk mulai melacak.
          </p>
        ) : (
          <ul className={styles.rangeList}>
            {normalizedRanges.map((r) => (
              <li key={`${r.start}-${r.end}`} className={styles.rangeChip}>
                <span>
                  Ayat {r.start}
                  {r.end !== r.start ? `–${r.end}` : ""}{" "}
                  <span className="hint">({r.end - r.start + 1} ayat)</span>
                </span>
                <button
                  type="button"
                  className={styles.chipRemove}
                  onClick={() => handleRemove(r.start, r.end)}
                  aria-label={`Hapus rentang ayat ${r.start} sampai ${r.end}`}
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={"card " + styles.block}>
        <h2 className={styles.blockTitle}>Catatan Pribadi</h2>
        <textarea
          className="textarea"
          value={notesValue}
          onChange={(e) => setNotesDraft(e.target.value)}
          placeholder="Catat ayat yang sulit, kesalahan yang sering terjadi, atau hal yang perlu diperbaiki saat setoran…"
          aria-label="Catatan pribadi surah"
        />
        <div className={styles.notesActions}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={saveNotes}
            disabled={notesDraft === null}
          >
            Simpan Catatan
          </button>
          {notesDraft !== null && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setNotesDraft(null)}>
              Batal
            </button>
          )}
        </div>
      </section>

      <section className={"card " + styles.block}>
        <h2 className={styles.blockTitle}>
          <History size={18} aria-hidden="true" /> Riwayat Pembaruan
        </h2>
        {progress.history.length === 0 ? (
          <p className="hint">Belum ada riwayat pembaruan untuk surah ini.</p>
        ) : (
          <ul className={styles.history}>
            {progress.history.slice(0, 15).map((h, i) => (
              <li key={`${h.timestamp}-${i}`} className={styles.historyItem}>
                <span className={styles.historyDate}>{formatDateId(h.date)}</span>
                <span>{h.description}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
