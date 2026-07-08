import { useState, useRef, useEffect } from "react";
import { Palette } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

export default function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="تغيير اللون"
        title="تغيير اللون"
        className="text-ink/80 hover:text-primary transition-colors p-1.5 rounded-full hover:bg-surface"
      >
        <Palette className="w-5 h-5" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full mt-2 left-0 w-44 rounded-xl bg-surface border border-border shadow-xl p-2 z-50"
        >
          <p className="text-[11px] font-semibold text-muted px-2 py-1">اختر اللون</p>
          {themes.map((t) => (
            <button
              key={t.id}
              role="menuitemradio"
              aria-checked={theme === t.id}
              onClick={() => {
                setTheme(t.id);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors ${
                theme === t.id ? "bg-primary/10 text-primary" : "text-ink hover:bg-bg"
              }`}
            >
              <span
                className="w-5 h-5 rounded-full ring-2 ring-border"
                style={{ background: t.swatch }}
              />
              <span className="font-medium">{t.labelAr}</span>
              {theme === t.id && <span className="mr-auto text-primary">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
