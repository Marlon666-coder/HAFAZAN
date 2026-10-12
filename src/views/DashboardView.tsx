import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookMarked,
  Percent,
  CheckCircle2,
  Layers,
  Flame,
  Target as TargetIcon,
  Sparkles,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { StatCard } from "../components/dashboard/StatCard";
import { ProgressBar } from "../components/common/ProgressBar";
import { StatusBadge } from "../components/common/StatusBadge";
import { EmptyState } from "../components/common/EmptyState";
import { useAppStore } from "../state/appStore";
import { dashboardSummary, nextRecommendation } from "../state/selectors";
import { formatNumber, formatPercent } from "../utils/format";
import { formatDateId } from "../utils/date";
import { EXPECTED_TOTAL_AYAHS } from "../data/surahs";
import styles from "./DashboardView.module.css";

export function DashboardView() {
  const { data } = useAppStore();
  const navigate = useNavigate();

  const summary = useMemo(() => dashboardSummary(data), [data]);
  const recommendation = useMemo(() => nextRecommendation(data), [data]);

  const dailyTarget = data.settings.goal.dailyAyahTarget;
  const goalProgressToday = dailyTarget > 0 ? dailyTarget : null;

  if (!summary.hasAnyData) {
    return (
      <>
        <PageHeader title="Dashboard" subtitle="Jaga Hafalan. Rawat Konsistensi. Dekatkan Hati." />
        <div className="card">
          <EmptyState
            icon={<Sparkles size={28} />}
            title="Selamat datang di HAFAZAN"
            description="Belum ada progres yang tercatat. Mulailah dengan membuka daftar surah dan menandai hafalan Anda, atau catat sesi muroja'ah pertama."
            action={
              <div className={styles.emptyActions}>
                <Link to="/surahs" className="btn btn-primary">
                  Mulai Catat Hafalan
                </Link>
                <Link to="/review" className="btn btn-ghost">
                  Catat Muroja'ah
                </Link>
              </div>
            }
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Ringkasan perkembangan hafalan Anda hari ini."
        actions={
          <>
            <Link to="/review" className="btn btn-ghost">
              <RefreshCw size={16} /> Muroja'ah
            </Link>
            <Link to="/surahs" className="btn btn-primary">
              Perbarui Progres
            </Link>
          </>
        }
      />

      <section className={styles.statGrid} aria-label="Ringkasan statistik">
        <StatCard
          icon={<BookMarked size={20} />}
          label="Ayat Dihafal"
          value={formatNumber(summary.totalMemorized)}
          hint={`dari ${formatNumber(EXPECTED_TOTAL_AYAHS)} ayat`}
        />
        <StatCard
          icon={<Percent size={20} />}
          label="Progres Ayat"
          value={formatPercent(summary.overallPercent)}
          tone="gold"
        />
        <StatCard
          icon={<CheckCircle2 size={20} />}
          label="Surah Selesai"
          value={`${summary.memorizedSurahs}`}
          hint={`${summary.fullyRecordedSurahs} tercatat lengkap`}
        />
        <StatCard
          icon={<Layers size={20} />}
          label="Juz Tercakup"
          value={`${summary.touchedJuz}`}
          hint={`${summary.completedJuz} juz selesai penuh`}
          tone="gold"
        />
        <StatCard
          icon={<Flame size={20} />}
          label="Streak Muroja'ah"
          value={`${summary.streak.current} hari`}
          hint={`rekor ${summary.streak.longest} hari`}
        />
        <StatCard
          icon={<TargetIcon size={20} />}
          label="Target Harian"
          value={goalProgressToday ? `${goalProgressToday} ayat` : "Belum diatur"}
          hint={goalProgressToday ? "ayat per hari" : "atur di menu Target"}
        />
      </section>

      <section className={styles.overallCard + " card"}>
        <div className={styles.overallHead}>
          <h2 className={styles.sectionTitle}>Progres Keseluruhan</h2>
          <span className={styles.overallPct}>{formatPercent(summary.overallPercent)}</span>
        </div>
        <ProgressBar value={summary.overallPercent} label="Progres hafalan keseluruhan" />
        <p className="hint" style={{ marginTop: "0.75rem" }}>
          {formatNumber(summary.totalMemorized)} dari {formatNumber(EXPECTED_TOTAL_AYAHS)} ayat telah ditandai hafal.
        </p>
      </section>

      <div className={styles.columns}>
        <section className={styles.recommendationCard + " card"}>
          <h2 className={styles.sectionTitle}>
            <Sparkles size={18} aria-hidden="true" /> Rekomendasi Berikutnya
          </h2>
          <p className={styles.recoTitle}>{recommendation.title}</p>
          <p className="hint">{recommendation.reason}</p>
          {recommendation.surahNumber && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => navigate(`/surahs/${recommendation.surahNumber}`)}
            >
              Buka Surah <ArrowRight size={14} />
            </button>
          )}
        </section>

        <section className={styles.reviewCard + " card"}>
          <h2 className={styles.sectionTitle}>Aktivitas Muroja'ah Terakhir</h2>
          {summary.lastReviewDate ? (
            <p className={styles.recoTitle}>{formatDateId(summary.lastReviewDate)}</p>
          ) : (
            <p className="hint">Belum ada sesi muroja'ah yang diselesaikan.</p>
          )}
          <Link to="/review" className="btn btn-ghost btn-sm">
            <RefreshCw size={14} /> Catat Muroja'ah
          </Link>
        </section>
      </div>

      <section className={"card " + styles.inProgressCard}>
        <h2 className={styles.sectionTitle}>Sedang Dihafal</h2>
        {summary.inProgress.length === 0 ? (
          <p className="hint">Belum ada surah yang sedang dihafal. Tandai salah satu surah untuk memulai.</p>
        ) : (
          <ul className={styles.inProgressList}>
            {summary.inProgress.slice(0, 5).map((s) => (
              <li key={s.surah.number}>
                <Link to={`/surahs/${s.surah.number}`} className={styles.inProgressItem}>
                  <div className={styles.inProgressMain}>
                    <span className={styles.surahNum}>{s.surah.number}</span>
                    <div>
                      <strong>{s.surah.nameLatin}</strong>
                      <span className="hint">
                        {s.memorizedAyahs}/{s.surah.ayahCount} ayat
                      </span>
                    </div>
                  </div>
                  <div className={styles.inProgressRight}>
                    <StatusBadge status={s.progress.status} />
                    <div className={styles.miniBar}>
                      <ProgressBar value={s.percent} label={`Progres ${s.surah.nameLatin}`} />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
