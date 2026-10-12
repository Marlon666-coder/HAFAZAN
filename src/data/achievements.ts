import type { AchievementDef } from "../types/achievement";

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "juz-1", kind: "juz", title: "Hafal 1 Juz", description: "Menyelesaikan hafalan 1 juz penuh.", threshold: 1 },
  { id: "juz-5", kind: "juz", title: "Hafal 5 Juz", description: "Menyelesaikan hafalan 5 juz penuh.", threshold: 5 },
  { id: "juz-10", kind: "juz", title: "Hafal 10 Juz", description: "Menyelesaikan hafalan 10 juz penuh.", threshold: 10 },
  { id: "juz-15", kind: "juz", title: "Hafal 15 Juz", description: "Menyelesaikan hafalan 15 juz penuh.", threshold: 15 },
  { id: "juz-20", kind: "juz", title: "Hafal 20 Juz", description: "Menyelesaikan hafalan 20 juz penuh.", threshold: 20 },
  { id: "juz-25", kind: "juz", title: "Hafal 25 Juz", description: "Menyelesaikan hafalan 25 juz penuh.", threshold: 25 },
  { id: "juz-30", kind: "juz", title: "Hafal 30 Juz", description: "Menyelesaikan hafalan seluruh 30 juz.", threshold: 30 },
  { id: "streak-7", kind: "streak", title: "Istiqamah 7 Hari", description: "Muroja'ah konsisten selama 7 hari berturut-turut.", threshold: 7 },
  { id: "streak-30", kind: "streak", title: "Istiqamah 30 Hari", description: "Muroja'ah konsisten selama 30 hari berturut-turut.", threshold: 30 },
];
