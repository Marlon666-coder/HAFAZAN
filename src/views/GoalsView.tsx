import { useMemo } from "react";
import { AlertTriangle, CheckCircle2, CalendarClock } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { StatCard } from "../components/dashboard/StatCard";
import { useToast } from "../components/feedback/ToastProvider";
import { useAppStore } from "../state/appStore";
import { goalPlan, totalMemorizedAyahs } from "../state/selectors";
import { formatNumber } from "../utils/format";
import { formatDateId, DAYS_ID } from "../utils/date";
import { EXPECTED_TOTAL_AYAHS } from "../data/surahs";
import styles from "./GoalsView.module.css";

export function GoalsView() {
  const store = useAppStore();
  const { notify } = useToast();
  const goal = store.data.settings.goal;

  const memorized = useMemo(() => totalMemorizedAyahs(store.data), [store.data]);
  const plan = useMemo(() => goalPlan(store.data), [store.data]);

  const toggleDay = (day: number) => {
    const set = new Set(goal.activeDays);
    if (set.has(day)) set.delete(day);
    else set.add(day);
    store.updateGoal({ activeDays: [...set].sort((a, b) => a - b) });
  };

  return (
    <>
      <PageHeader title="Target & Jadwal" subtitle="Susun rencana hafalan yang realistis sesuai waktu Anda." />

      <section className={"card " + styles.block}>
        <h2 className={styles.blockTitle}>Pengaturan Target</h2>
        <div className={styles.formGrid}>
          <label>
            <span className="label">Target ayat per hari</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              className="input"
              value={goal.dailyAyahTarget || ""}
              onChange={(e) => store.updateGoal({ dailyAyahTarget: Math.max(0, Number(e.target.value) || 0) })}
              placeholder="mis. 5"
            />
          </label>
          <label>
            <span className="label">Target halaman per hari (opsional)</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              className="input"
              value={goal.dailyPageTarget || ""}
              onChange={(e) => store.updateGoal({ dailyPageTarget: Math.max(0, Number(e.target.value) || 0) })}
              placeholder="mis. 1"
            />
          </label>
          <label>
            <span className="label">Tanggal target selesai (opsional)</span>
            <input
              type="date"
              className="input"
              value={goal.targetDate ?? ""}
              onChange={(e) => store.updateGoal({ targetDate: e.target.value || null })}
            />
          </label>
          <label>
            <span className="label">Target khatam (bulan, opsional)</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              className="input"
              value={goal.targetMonths ?? ""}
              onChange={(e) =>
                store.updateGoal({ targetMonths: e.target.value ? Math.max(0, Number(e.target.value)) : null })
              }
              placeholder="mis. 24"
            />
          </label>
        </div>

        <fieldset className={styles.days}>
          <legend className="label">Hari belajar aktif (kosong = setiap hari)</legend>
          <div className={styles.dayBtns}>
            {DAYS_ID.map((name, idx) => (
              <button
                key={name}
                type="button"
                className={`${styles.dayBtn} ${goal.activeDays.includes(idx) ? styles.dayActive : ""}`}
                aria-pressed={goal.activeDays.includes(idx)}
                onClick={() => toggleDay(idx)}
              >
                {name.slice(0, 3)}
              </button>
            ))}
          </div>
        </fieldset>

        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            store.updateGoal({
              dailyAyahTarget: 0,
              dailyPageTarget: 0,
              targetDate: null,
              targetMonths: null,
              activeDays: [],
            });
            notify("Target direset.", "info");
          }}
        >
          Reset Target
        </button>
      </section>

      <section className={styles.statGrid}>
        <StatCard
          icon={<CheckCircle2 size={20} />}
          label="Sudah Dihafal"
          value={`${formatNumber(memorized)} ayat`}
          hint={`dari ${formatNumber(EXPECTED_TOTAL_AYAHS)}`}
        />
        <StatCard
          icon={<CalendarClock size={20} />}
          label="Sisa Ayat"
          value={`${formatNumber(plan.remainingAyahs)} ayat`}
          tone="gold"
        />
        <StatCard
          icon={<CalendarClock size={20} />}
          label="Hari Belajar Tersedia"
          value={plan.availableDays !== null ? `${formatNumber(plan.availableDays)} hari` : "—"}
          hint={plan.availableDays === null ? "atur tanggal/bulan target" : undefined}
        />
        <StatCard
          icon={<CheckCircle2 size={20} />}
          label="Estimasi Ayat/Hari"
          value={plan.ayahsPerDay !== null ? `${formatNumber(plan.ayahsPerDay)} ayat` : "—"}
          tone="gold"
        />
      </section>

      <section className={"card " + styles.block}>
        <h2 className={styles.blockTitle}>Hasil Perhitungan</h2>
        {plan.complete ? (
          <div className={styles.doneBanner}>
            <CheckCircle2 size={20} /> Seluruh 6.236 ayat telah tercatat. Target hafalan selesai — fokus pada muroja'ah.
          </div>
        ) : (
          <>
            <p className={styles.formula}>
              Rumus: <code>ayat per hari = sisa ayat ÷ hari belajar tersedia</code> (dibulatkan ke atas).
            </p>
            <ul className={styles.resultList}>
              <li>
                <span>Sisa ayat</span>
                <strong>{formatNumber(plan.remainingAyahs)}</strong>
              </li>
              <li>
                <span>Hari belajar tersedia</span>
                <strong>{plan.availableDays !== null ? formatNumber(plan.availableDays) : "Belum ditentukan"}</strong>
              </li>
              <li>
                <span>Estimasi ayat per hari</span>
                <strong>{plan.ayahsPerDay !== null ? formatNumber(plan.ayahsPerDay) : "—"}</strong>
              </li>
              <li>
                <span>Estimasi tanggal selesai</span>
                <strong>
                  {plan.estimatedCompletionDate ? formatDateId(plan.estimatedCompletionDate) : "—"}
                </strong>
              </li>
            </ul>
            <p className="hint" style={{ marginTop: "0.75rem" }}>
              Estimasi ini adalah perkiraan berdasarkan data yang Anda masukkan, bukan janji penyelesaian.
            </p>
          </>
        )}

        {plan.warnings.length > 0 && (
          <div className={styles.warnings} role="alert">
            {plan.warnings.map((w) => (
              <p key={w} className={styles.warning}>
                <AlertTriangle size={16} aria-hidden="true" /> {w}
              </p>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
