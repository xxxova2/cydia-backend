import { useCallback, useEffect, useState } from "react";
import { themes, STORAGE_KEY, DEFAULT_THEME, type ThemeId } from "../themes";

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);

  // Read the value the pre-paint inline script already applied (no flash).
  useEffect(() => {
    const current = (document.documentElement.dataset.theme as ThemeId) || DEFAULT_THEME;
    setThemeState(current);
  }, []);

  const setTheme = useCallback((id: ThemeId) => {
    setThemeState(id);
    document.documentElement.dataset.theme = id;
    document.documentElement.classList.remove("preload");
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  return { theme, setTheme, themes };
}
