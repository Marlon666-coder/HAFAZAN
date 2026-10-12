import { useMemo } from "react";
import type { AppData } from "../../types";
import { formatDateId } from "../../utils/date";
import { formatNumber } from "../../utils/format";
import styles from "./ProgressTimeline.module.css";

interface ProgressTimelineProps {
  data: AppData;
}

interface Point {
  date: string;
  total: number;
}

/**
 * Build a per-day cumulative memorized-ayah series from each surah's history.
 * We take each surah's latest recorded ayah count per day, then sum across
 * surahs cumulatively over time. This is an approximation from recorded
 * history (the only time-series data we store) and is clearly labelled as such.
 */
function buildSeries(data: AppData): Point[] {
  // date -> surah -> ayahs memorized snapshot on that date
  const byDate = new Map<string, Map<number, number>>();
  for (const key of Object.keys(data.progress)) {
    const p = data.progress[key];
    for (const h of p.history) {
      if (!h.date) continue;
      const day = byDate.get(h.date) ?? new Map<number, number>();
      // Keep the last snapshot of the day (history is newest-first, so only set once).
      if (!day.has(p.surah)) day.set(p.surah, h.ayahsMemorized);
      byDate.set(h.date, day);
    }
  }

  const dates = [...byDate.keys()].sort();
  if (dates.length === 0) return [];

  // Running latest-known snapshot per surah.
  const latest = new Map<number, number>();
  const points: Point[] = [];
  for (const date of dates) {
    const day = byDate.get(date)!;
    for (const [surah, count] of day) latest.set(surah, count);
    const total = [...latest.values()].reduce((sum, v) => sum + v, 0);
    points.push({ date, total });
  }
  return points;
}

export function ProgressTimeline({ data }: ProgressTimelineProps) {
  const series = useMemo(() => buildSeries(data), [data]);

  if (series.length < 2) {
    return (
      <p className="hint">
        Grafik akan muncul setelah ada perubahan hafalan pada beberapa hari berbeda. Teruslah mencatat progres harian.
      </p>
    );
  }

  const width = 640;
  const height = 180;
  const pad = 24;
  const maxTotal = Math.max(...series.map((p) => p.total), 1);
  const n = series.length;

  const x = (i: number) => pad + (i / (n - 1)) * (width - pad * 2);
  const y = (v: number) => height - pad - (v / maxTotal) * (height - pad * 2);

  const linePath = series.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p.total).toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${x(n - 1).toFixed(1)} ${height - pad} L ${x(0).toFixed(1)} ${height - pad} Z`;

  const last = series[series.length - 1];

  return (
    <div>
      <svg
        className={styles.chart}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Grafik progres kumulatif. Terakhir ${formatNumber(last.total)} ayat pada ${formatDateId(last.date)}.`}
        preserveAspectRatio="none"
      >
        <path d={areaPath} className={styles.area} />
        <path d={linePath} className={styles.line} />
        {series.map((p, i) => (
          <circle key={p.date} cx={x(i)} cy={y(p.total)} r={2.5} className={styles.dot}>
            <title>{`${formatDateId(p.date)}: ${formatNumber(p.total)} ayat`}</title>
          </circle>
        ))}
      </svg>
      <div className={styles.axis}>
        <span className="hint">{formatDateId(series[0].date)}</span>
        <span className="hint">{formatDateId(last.date)}</span>
      </div>
    </div>
  );
}
