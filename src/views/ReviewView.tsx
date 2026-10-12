import { useMemo, useState } from "react";
import { Plus, Trash2, Check, CalendarDays, Flame } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { EmptyState } from "../components/common/EmptyState";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { useToast } from "../components/feedback/ToastProvider";
import { useAppStore } from "../state/appStore";
import { streakStats } from "../state/selectors";
import { getSurah, SURAHS } from "../data/surahs";
import { todayLocal, formatDateId } from "../utils/date";
import { ReviewCalendar } from "../components/review/ReviewCalendar";
import styles from "./ReviewView.module.css";

export function ReviewView() {
  const store = useAppStore();
  const { notify } = useToast();
  const [selectValue, setSelectValue] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const today = todayLocal();
  const streak = useMemo(() => streakStats(store.data), [store.data]);

  const todaysSessions = useMemo(
    () => store.data.reviews.filter((r) => r.date === today),
    [store.data.reviews, today],
  );
  const activeSession = todaysSessions.find((s) => !s.completed) ?? null;

  const pastSessions = useMemo(
    () =>
      [...store.data.reviews]
        .filter((r) => r.completed)
        .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)),
    [store.data.reviews],
  );

  const startSession = () => {
    const first = selectValue ? [Number(selectValue)] : [];
    store.createReviewSession(first);
    setSelectValue("");
    notify("Sesi muroja'ah dimulai.", "success");
  };

  const handleComplete = (sessionId: string) => {
    store.completeReviewSession(sessionId);
    notify("Sesi muroja'ah ditandai selesai. Semoga istiqamah!", "success");
  };

  return (
    <>
      <PageHeader
        title="Muroja'ah Harian"
        subtitle="Catat sesi mengulang hafalan untuk menjaga konsistensi."
        actions={
          <div className={styles.streakPill}>
            <Flame size={16} aria-hidden="true" />
            <span>
              Streak {streak.current} hari · rekor {streak.longest}
            </span>
          </div>
        }
      />

      <section className={"card " + styles.block}>
        <h2 className={styles.blockTitle}>Sesi Hari Ini — {formatDateId(today)}</h2>

        {!activeSession ? (
          <div className={styles.startRow}>
            <label className={styles.startSelect}>
              <span className="visually-hidden">Pilih surah pertama</span>
              <select
                className="select"
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
                aria-label="Pilih surah untuk muroja'ah"
              >
                <option value="">Pilih surah (opsional)…</option>
                {SURAHS.map((s) => (
                  <option key={s.number} value={s.number}>
                    {s.number}. {s.nameLatin}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className="btn btn-primary" onClick={startSession}>
              <Plus size={16} /> Mulai Sesi
            </button>
          </div>
        ) : (
          <ActiveSession sessionId={activeSession.id} onComplete={() => handleComplete(activeSession.id)} />
        )}
      </section>

      <section className={"card " + styles.block}>
        <h2 className={styles.blockTitle}>
          <CalendarDays size={18} aria-hidden="true" /> Kalender Aktivitas
        </h2>
        <ReviewCalendar activeDays={streak.activeDays} />
      </section>

      <section className={"card " + styles.block}>
        <h2 className={styles.blockTitle}>Riwayat Muroja'ah</h2>
        {pastSessions.length === 0 ? (
          <EmptyState
            title="Belum ada riwayat"
            description="Sesi muroja'ah yang Anda selesaikan akan tampil di sini, lengkap dengan tanggalnya."
          />
        ) : (
          <ul className={styles.history}>
            {pastSessions.map((s) => (
              <li key={s.id} className={styles.historyItem}>
                <div>
                  <strong>{formatDateId(s.date)}</strong>
                  <p className="hint">
                    {s.items.length} surah
                    {s.items.length > 0
                      ? `: ${s.items
                          .map((i) => getSurah(i.surah)?.nameLatin ?? `#${i.surah}`)
                          .join(", ")}`
                      : ""}
                  </p>
                  {s.note && <p className={styles.noteText}>“{s.note}”</p>}
                </div>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => setConfirmDelete(s.id)}
                  aria-label={`Hapus sesi ${formatDateId(s.date)}`}
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Hapus sesi muroja'ah?"
        message="Sesi ini akan dihapus dari riwayat dan dapat memengaruhi perhitungan streak. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
        danger
        onConfirm={() => {
          if (confirmDelete) {
            store.deleteReviewSession(confirmDelete);
            notify("Sesi dihapus.", "info");
          }
          setConfirmDelete(null);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  );
}

interface ActiveSessionProps {
  sessionId: string;
  onComplete: () => void;
}

function ActiveSession({ sessionId, onComplete }: ActiveSessionProps) {
  const store = useAppStore();
  const session = store.data.reviews.find((r) => r.id === sessionId);
  if (!session) return null;

  const existing = new Set(session.items.map((i) => i.surah));
  const allDone = session.items.length > 0 && session.items.every((i) => i.done);

  return (
    <div className={styles.active}>
      <div className={styles.addRow}>
        <label className={styles.startSelect}>
          <span className="visually-hidden">Tambah surah ke sesi</span>
          <select
            className="select"
            value=""
            onChange={(e) => {
              const n = Number(e.target.value);
              if (n) store.addReviewItem(sessionId, n);
            }}
            aria-label="Tambah surah ke sesi muroja'ah"
          >
            <option value="">Tambah surah…</option>
            {SURAHS.filter((s) => !existing.has(s.number)).map((s) => (
              <option key={s.number} value={s.number}>
                {s.number}. {s.nameLatin}
              </option>
            ))}
          </select>
        </label>
      </div>

      {session.items.length === 0 ? (
        <p className="hint">Tambahkan minimal satu surah untuk diulang pada sesi ini.</p>
      ) : (
        <ul className={styles.items}>
          {session.items.map((item) => {
            const surah = getSurah(item.surah);
            return (
              <li key={item.id} className={styles.item}>
                <label className={styles.itemLabel}>
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => store.toggleReviewItem(sessionId, item.id)}
                  />
                  <span>
                    {surah ? `${surah.number}. ${surah.nameLatin}` : `#${item.surah}`}
                  </span>
                </label>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => store.removeReviewItem(sessionId, item.id)}
                  aria-label={`Hapus ${surah?.nameLatin ?? "surah"} dari sesi`}
                >
                  <Trash2 size={16} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <label className="label" htmlFor="review-note">
        Catatan setelah muroja'ah
      </label>
      <textarea
        id="review-note"
        className="textarea"
        value={session.note}
        onChange={(e) => store.setReviewNote(sessionId, e.target.value)}
        placeholder="Bagaimana sesi hari ini? Catat hal yang perlu diperbaiki…"
      />

      <button
        type="button"
        className="btn btn-primary"
        onClick={onComplete}
        disabled={session.items.length === 0}
        style={{ marginTop: "0.75rem" }}
      >
        <Check size={16} /> Tandai Sesi Selesai
      </button>
      {!allDone && session.items.length > 0 && (
        <p className="hint" style={{ marginTop: "0.5rem" }}>
          Menandai sesi selesai akan mencentang seluruh item dan menghitung hari ini sebagai hari aktif.
        </p>
      )}
    </div>
  );
}
