import styles from "./ProgressBar.module.css";
import { clamp } from "../../utils/format";

interface ProgressBarProps {
  value: number; // 0..100
  label?: string;
  tone?: "primary" | "gold";
}

export function ProgressBar({ value, label, tone = "primary" }: ProgressBarProps) {
  const pct = clamp(value, 0, 100);
  return (
    <div
      className={styles.track}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={`${styles.fill} ${tone === "gold" ? styles.gold : ""}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
