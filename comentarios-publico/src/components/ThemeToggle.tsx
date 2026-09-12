import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved;

  const prefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  return prefersDark ? "dark" : "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Cambiar tema"
      className="
        inline-flex items-center gap-2 rounded-full border px-3.5 py-2
        border-[var(--border)] bg-[var(--surface)] text-[var(--text)]
        transition hover:-translate-y-px hover:border-[var(--accent)]
      "
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
      <span className="hidden text-sm font-semibold sm:inline">
        {isDark ? "Claro" : "Oscuro"}
      </span>
    </button>
  );
}
