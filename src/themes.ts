export type ThemeId = "emerald" | "ocean" | "sunset" | "violet" | "midnight";

export interface ThemeDef {
  id: ThemeId;
  labelAr: string; // Arabic label shown in tooltip / aria-label
  swatch: string; // CSS gradient preview
}

// Single source of truth — the CSS palettes in index.css must match these ids.
export const themes: ThemeDef[] = [
  { id: "emerald", labelAr: "زمردي", swatch: "linear-gradient(135deg,#3d8a5e,#9be7b4)" },
  { id: "ocean", labelAr: "محيطي", swatch: "linear-gradient(135deg,#0e7490,#38bdf8)" },
  { id: "sunset", labelAr: "غروبي", swatch: "linear-gradient(135deg,#f97316,#fb923c)" },
  { id: "violet", labelAr: "بنفسجي", swatch: "linear-gradient(135deg,#6d28d9,#a78bfa)" },
  { id: "midnight", labelAr: "ليلي", swatch: "linear-gradient(135deg,#22d3ee,#0b0f14)" },
];

export const STORAGE_KEY = "cydia-theme";
export const DEFAULT_THEME: ThemeId = "emerald";
