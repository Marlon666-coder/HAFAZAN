import type { ReactNode } from "react";
import styles from "./StatCard.module.css";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  hint?: string;
  tone?: "primary" | "gold";
}

export function StatCard({ icon, label, value, hint, tone = "primary" }: StatCardProps) {
  return (
    <div className={`${styles.card} card`}>
      <span className={`${styles.icon} ${tone === "gold" ? styles.gold : ""}`} aria-hidden="true">
        {icon}
      </span>
      <div className={styles.body}>
        <span className={styles.label}>{label}</span>
        <strong className={styles.value}>{value}</strong>
        {hint && <span className={styles.hint}>{hint}</span>}
      </div>
    </div>
  );
}
