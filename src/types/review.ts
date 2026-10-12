export interface ReviewItem {
  /** Stable id for list rendering + edits. */
  id: string;
  /** Surah number being reviewed. */
  surah: number;
  /** Whether this item has been checked off during the session. */
  done: boolean;
}

export interface ReviewSession {
  id: string;
  /** Local date, YYYY-MM-DD. */
  date: string;
  /** ISO timestamp when the session was created. */
  createdAt: string;
  items: ReviewItem[];
  /** Short note written after the muroja'ah session. */
  note: string;
  /** Whether the whole session has been marked completed. */
  completed: boolean;
  /** ISO timestamp when the session was completed, if any. */
  completedAt: string | null;
}
