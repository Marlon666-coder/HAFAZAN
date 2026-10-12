import type { MemorizationStatus } from "../types/memorization";

export interface StatusMeta {
  value: MemorizationStatus;
  label: string;
  /** Short textual indicator (not color-only) for accessibility. */
  short: string;
}

export const STATUS_META: Record<MemorizationStatus, StatusMeta> = {
  "not-started": { value: "not-started", label: "Belum Dimulai", short: "—" },
  "in-progress": { value: "in-progress", label: "Sedang Dihafal", short: "Proses" },
  memorized: { value: "memorized", label: "Sudah Hafal", short: "Hafal" },
  review: { value: "review", label: "Muroja'ah", short: "Ulang" },
};

export const STATUS_ORDER: MemorizationStatus[] = [
  "not-started",
  "in-progress",
  "memorized",
  "review",
];

export function statusLabel(status: MemorizationStatus): string {
  return STATUS_META[status].label;
}
