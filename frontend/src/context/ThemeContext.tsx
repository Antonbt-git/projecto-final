import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext =
  createContext<ThemeContextType | undefined>(
    undefined
  );

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({
  children,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved =
      localStorage.getItem("theme");

    if (
      saved === "light" ||
      saved === "dark"
    ) {
      return saved;
    }

    return window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((current) =>
      current === "light"
        ? "dark"
        : "light"
    );
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme debe utilizarse dentro de ThemeProvider"
    );
  }

  return context;
}