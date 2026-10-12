import { useMemo } from "react";
import { Award, Lock, TrendingUp, BarChart3 } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { ProgressBar } from "../components/common/ProgressBar";
import { EmptyState } from "../components/common/EmptyState";
import { useAppStore } from "../state/appStore";
import {
  achievementStatuses,
  allSurahsWithProgress,
  juzStats,
  overallPercent,
  streakStats,
  totalMemorizedAyahs,
} from "../state/selectors";
import { STATUS_META, STATUS_ORDER } from "../utils/status";
import { formatNumber, formatPercent } from "../utils/format";
import { EXPECTED_TOTAL_AYAHS } from "../data/surahs";
import { ProgressTimeline } from "../components/statistics/ProgressTimeline";
import styles from "./StatisticsView.module.css";

export function StatisticsView() {
  const { data } = useAppStore();

  const juz = useMemo(() => juzStats(data), [data]);
  const total = useMemo(() => totalMemorizedAyahs(data), [data]);
  const pct = useMemo(() => overallPercent(data), [data]);
  const streak = useMemo(() => streakStats(data), [data]);
  const achievements = useMemo(() => achievementStatuses(data), [data]);
  const withProgress = useMemo(() => allSurahsWithProgress(data), [data]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { "not-started": 0, "in-progress": 0, memorized: 0, review: 0 };
    for (const s of withProgress) counts[s.progress.status] += 1;
    return counts;
  }, [withProgress]);

  const completedReviews = data.reviews.filter((r) => r.completed).length;

  const hasData =
    total > 0 || completedReviews > 0 || statusCounts["in-progress"] > 0 || statusCounts.memorized > 0;

  if (!hasData) {
    return (
      <>
        <PageHeader title="Statistik" subtitle="Perkembangan hafalan Anda, berdasarkan data yang dicatat." />
        <div className="card">
          <EmptyState
            icon={<BarChart3 size={28} />}
            title="Statistik akan berkembang seiring penggunaan"
            description="Catat hafalan dan sesi muroja'ah terlebih dahulu. Grafik, breakdown juz, dan pencapaian akan muncul di sini."
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Statistik" subtitle="Perkembangan hafalan Anda, berdasarkan data yang dicatat." />

      <section className={"card " + styles.block}>
        <div className={styles.overallHead}>
          <h2 className={styles.blockTitle}>Progres Keseluruhan</h2>
          <span className={styles.bigPct}>{formatPercent(pct)}</span>
        </div>
        <ProgressBar value={pct} label="Progres keseluruhan" />
        <p className="hint" style={{ marginTop: "0.5rem" }}>
          {formatNumber(total)} dari {formatNumber(EXPECTED_TOTAL_AYAHS)} ayat · streak aktif {streak.current} hari ·
          rekor {streak.longest} hari · {completedReviews} sesi muroja'ah selesai
        </p>
      </section>

      <section className={"card " + styles.block}>
        <h2 className={styles.blockTitle}>
          <TrendingUp size={18} aria-hidden="true" /> Progres dari Waktu ke Waktu
        </h2>
        <ProgressTimeline data={data} />
      </section>

      <section className={"card " + styles.block}>
        <h2 className={styles.blockTitle}>Ringkasan Status Surah</h2>
        <div className={styles.statusSummary}>
          {STATUS_ORDER.map((s) => (
            <div key={s} className={styles.statusItem}>
              <strong>{statusCounts[s]}</strong>
              <span className="hint">{STATUS_META[s].label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={"card " + styles.block}>
        <h2 className={styles.blockTitle}>Breakdown per Juz</h2>
        <ul className={styles.juzList}>
          {juz.map((j) => (
            <li key={j.juz} className={styles.juzItem}>
              <div className={styles.juzHead}>
                <span className={styles.juzLabel}>
                  Juz {j.juz}
                  {j.complete && <span className={styles.juzDone}> · Selesai</span>}
                </span>
                <span className="hint">
                  {j.memorizedAyahs}/{j.totalAyahs} ({Math.round(j.percent)}%)
                </span>
              </div>
              <ProgressBar value={j.percent} label={`Progres juz ${j.juz}`} tone={j.complete ? "primary" : "gold"} />
            </li>
          ))}
        </ul>
      </section>

      <section className={"card " + styles.block}>
        <h2 className={styles.blockTitle}>
          <Award size={18} aria-hidden="true" /> Pencapaian
        </h2>
        <div className={styles.badges}>
          {achievements.map((a) => (
            <div key={a.def.id} className={`${styles.badge} ${a.unlocked ? styles.unlocked : styles.locked}`}>
              <span className={styles.badgeIcon} aria-hidden="true">
                {a.unlocked ? <Award size={22} /> : <Lock size={20} />}
              </span>
              <div>
                <strong>{a.def.title}</strong>
                <p className="hint">{a.def.description}</p>
                <p className={styles.badgeProgress}>
                  {a.unlocked
                    ? "Tercapai"
                    : `${a.current}/${a.def.threshold} ${a.def.kind === "juz" ? "juz" : "hari"}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
