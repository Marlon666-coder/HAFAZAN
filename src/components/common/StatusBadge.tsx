import { CircleDashed, Loader, CheckCircle2, RefreshCw } from "lucide-react";
import type { MemorizationStatus } from "../../types/memorization";
import { STATUS_META } from "../../utils/status";
import styles from "./StatusBadge.module.css";

const ICONS: Record<MemorizationStatus, typeof CircleDashed> = {
  "not-started": CircleDashed,
  "in-progress": Loader,
  memorized: CheckCircle2,
  review: RefreshCw,
};

export function StatusBadge({ status }: { status: MemorizationStatus }) {
  const meta = STATUS_META[status];
  const Icon = ICONS[status];
  return (
    <span className={`${styles.badge} ${styles[status]}`}>
      <Icon size={14} aria-hidden="true" />
      <span>{meta.label}</span>
    </span>
  );
}
