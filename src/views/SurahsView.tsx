import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, SearchX } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { StatusBadge } from "../components/common/StatusBadge";
import { ProgressBar } from "../components/common/ProgressBar";
import { EmptyState } from "../components/common/EmptyState";
import { useAppStore } from "../state/appStore";
import { allSurahsWithProgress } from "../state/selectors";
import { STATUS_META, STATUS_ORDER } from "../utils/status";
import type { MemorizationStatus } from "../types/memorization";
import { TOTAL_JUZ } from "../data/juz";
import styles from "./SurahsView.module.css";

type SortKey = "number" | "progress";

export function SurahsView() {
  const { data } = useAppStore();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<MemorizationStatus | "all">("all");
  const [juzFilter, setJuzFilter] = useState<number | "all">("all");
  const [sort, setSort] = useState<SortKey>("number");

  const all = useMemo(() => allSurahsWithProgress(data), [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = all.filter((s) => {
      if (statusFilter !== "all" && s.progress.status !== statusFilter) return false;
      if (juzFilter !== "all") {
        const inJuz = s.surah.juzSegments.some((seg) => seg.juz === juzFilter);
        if (!inJuz) return false;
      }
      if (q) {
        const haystack = `${s.surah.nameLatin} ${s.surah.nameArabic} ${s.surah.meaningIndonesia}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sort === "progress") {
        if (b.percent !== a.percent) return b.percent - a.percent;
        return a.surah.number - b.surah.number;
      }
      return a.surah.number - b.surah.number;
    });

    return list;
  }, [all, query, statusFilter, juzFilter, sort]);

  return (
    <>
      <PageHeader title="Daftar Surah" subtitle="114 surah Al-Qur'an beserta status hafalan Anda." />

      <div className={"card " + styles.controls}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} aria-hidden="true" />
          <input
            type="search"
            className="input"
            placeholder="Cari nama Latin, Arab, atau arti…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Cari surah"
          />
        </div>

        <div className={styles.filters}>
          <label className={styles.filterItem}>
            <span className="visually-hidden">Filter status</span>
            <select
              className="select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as MemorizationStatus | "all")}
              aria-label="Filter berdasarkan status"
            >
              <option value="all">Semua Status</option>
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.filterItem}>
            <span className="visually-hidden">Filter juz</span>
            <select
              className="select"
              value={juzFilter}
              onChange={(e) => setJuzFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
              aria-label="Filter berdasarkan juz"
            >
              <option value="all">Semua Juz</option>
              {Array.from({ length: TOTAL_JUZ }, (_, i) => i + 1).map((j) => (
                <option key={j} value={j}>
                  Juz {j}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.filterItem}>
            <span className="visually-hidden">Urutkan</span>
            <select
              className="select"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Urutkan surah"
            >
              <option value="number">Urut Nomor</option>
              <option value="progress">Urut Progres</option>
            </select>
          </label>
        </div>
      </div>

      <p className={styles.count} aria-live="polite">
        Menampilkan {filtered.length} dari {all.length} surah
      </p>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<SearchX size={28} />}
            title="Tidak ada surah ditemukan"
            description="Coba ubah kata kunci pencarian atau filter yang dipilih."
          />
        </div>
      ) : (
        <ul className={styles.list}>
          {filtered.map((s) => (
            <li key={s.surah.number}>
              <Link to={`/surahs/${s.surah.number}`} className={"card " + styles.item}>
                <span className={styles.num}>{s.surah.number}</span>
                <div className={styles.info}>
                  <div className={styles.nameRow}>
                    <strong className={styles.nameLatin}>{s.surah.nameLatin}</strong>
                    <span className={"arabic " + styles.nameArabic}>{s.surah.nameArabic}</span>
                  </div>
                  <span className="hint">
                    {s.surah.meaningIndonesia} · {s.surah.ayahCount} ayat ·{" "}
                    {s.surah.startJuz === s.surah.endJuz
                      ? `Juz ${s.surah.startJuz}`
                      : `Juz ${s.surah.startJuz}–${s.surah.endJuz}`}
                  </span>
                  <div className={styles.progressRow}>
                    <ProgressBar value={s.percent} label={`Progres ${s.surah.nameLatin}`} />
                    <span className={styles.progressText}>
                      {s.memorizedAyahs}/{s.surah.ayahCount}
                    </span>
                  </div>
                </div>
                <div className={styles.status}>
                  <StatusBadge status={s.progress.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
