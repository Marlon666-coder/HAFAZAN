import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { ToastProvider } from "./components/feedback/ToastProvider";
import { useAppStore } from "./state/appStore";
import { useTheme } from "./hooks/useTheme";
import { DashboardView } from "./views/DashboardView";
import { SurahsView } from "./views/SurahsView";
import { SurahDetailView } from "./views/SurahDetailView";
import { ReviewView } from "./views/ReviewView";
import { GoalsView } from "./views/GoalsView";
import { StatisticsView } from "./views/StatisticsView";
import { SettingsView } from "./views/SettingsView";

export function App() {
  const { data } = useAppStore();
  useTheme(data.settings.theme);

  return (
    <ToastProvider>
      <AppLayout>
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route path="/surahs" element={<SurahsView />} />
          <Route path="/surahs/:number" element={<SurahDetailView />} />
          <Route path="/review" element={<ReviewView />} />
          <Route path="/goals" element={<GoalsView />} />
          <Route path="/statistics" element={<StatisticsView />} />
          <Route path="/settings" element={<SettingsView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </ToastProvider>
  );
}
