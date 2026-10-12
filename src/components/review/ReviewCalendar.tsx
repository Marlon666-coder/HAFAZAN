import { useMemo } from "react";
import { addDays, todayLocal } from "../../utils/date";
import styles from "./ReviewCalendar.module.css";

interface ReviewCalendarProps {
  /** Local YYYY-MM-DD dates with completed activity. */
  activeDays: string[];
  /** How many weeks back to show. */
  weeks?: number;
}

/**
 * A compact GitHub-style activity calendar covering the last `weeks` weeks.
 * Pure CSS/SVG-free grid; no extra dependencies.
 */
export function ReviewCalendar({ activeDays, weeks = 12 }: ReviewCalendarProps) {
  const activeSet = useMemo(() => new Set(activeDays), [activeDays]);
  const today = todayLocal();

  const cells = useMemo(() => {
    const totalDays = weeks * 7;
    // Align the end to the current week (end on today).
    const result: { date: string; active: boolean; future: boolean }[] = [];
    const start = addDays(today, -(totalDays - 1));
    for (let i = 0; i < totalDays; i += 1) {
      const date = addDays(start, i);
      result.push({ date, active: activeSet.has(date), future: date > today });
    }
    return result;
  }, [activeSet, today, weeks]);

  const activeCount = cells.filter((c) => c.active).length;

  return (
    <div>
      <div className={styles.grid} role="img" aria-label={`${activeCount} hari aktif dalam ${weeks} minggu terakhir`}>
        {cells.map((c) => (
          <span
            key={c.date}
            className={`${styles.cell} ${c.active ? styles.active : ""} ${c.future ? styles.future : ""}`}
            title={`${c.date}${c.active ? " · aktif" : ""}`}
          />
        ))}
      </div>
      <div className={styles.legend}>
        <span className={styles.cell} /> Tidak aktif
        <span className={`${styles.cell} ${styles.active}`} /> Aktif
        <span className={styles.count}>{activeCount} hari aktif</span>
      </div>
    </div>
  );
}
