import {
  LayoutDashboard,
  BookOpen,
  RefreshCw,
  Target,
  BarChart3,
  Settings,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/surahs", label: "Surah", icon: BookOpen },
  { to: "/review", label: "Muroja'ah", icon: RefreshCw },
  { to: "/goals", label: "Target", icon: Target },
  { to: "/statistics", label: "Statistik", icon: BarChart3 },
  { to: "/settings", label: "Pengaturan", icon: Settings },
];
