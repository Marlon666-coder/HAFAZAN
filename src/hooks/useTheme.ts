import { useEffect } from "react";
import type { ThemePreference } from "../types/settings";

/**
 * Apply the chosen theme to <html data-theme>. For "system", follow the OS
 * preference and update live when it changes. Theme is persisted via settings.
 */
export function useTheme(preference: ThemePreference): void {
  useEffect(() => {
    const root = document.documentElement;

    const apply = (resolved: "light" | "dark") => {
      root.setAttribute("data-theme", resolved);
    };

    if (preference === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      apply(media.matches ? "dark" : "light");
      const handler = (e: MediaQueryListEvent) => apply(e.matches ? "dark" : "light");
      media.addEventListener("change", handler);
      return () => media.removeEventListener("change", handler);
    }

    apply(preference);
    return undefined;
  }, [preference]);
}
