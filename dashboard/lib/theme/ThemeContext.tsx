"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useReducer,
  type ReactNode,
} from "react";
import themeConfig from "@/theme-config.json";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Theme = "brutal" | "cyber";

interface ThemeState {
  theme: Theme;
  isTransitioning: boolean;
}

type ThemeAction =
  | { type: "SET_THEME"; payload: Theme }
  | { type: "SET_TRANSITIONING"; payload: boolean };

interface ThemeContextValue {
  theme: Theme;
  isTransitioning: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  config: typeof themeConfig;
}

// ─── Constants & Synchronous Helper ──────────────────────────────────────────

const STORAGE_KEY = "dashboard-theme";
const DEFAULT_THEME: Theme =
  themeConfig.defaultTheme === "neo-brutalism" ? "brutal" : "brutal";

function getInitialTheme(): Theme {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (stored === "brutal" || stored === "cyber") {
        return stored;
      }
    } catch {
      // Fallback if localStorage access fails
    }
  }
  return DEFAULT_THEME;
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function themeReducer(state: ThemeState, action: ThemeAction): ThemeState {
  switch (action.type) {
    case "SET_THEME":
      return { ...state, theme: action.payload };
    case "SET_TRANSITIONING":
      return { ...state, isTransitioning: action.payload };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

export const ThemeContext = createContext<ThemeContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Always start initial render with DEFAULT_THEME for 100% identical SSR and Client hydration
  const [state, dispatch] = useReducer(themeReducer, null, () => ({
    theme: DEFAULT_THEME,
    isTransitioning: false,
  }));

  // Synchronously sync stored theme after mount on client before paint
  useLayoutEffect(() => {
    const initial = getInitialTheme();
    if (initial !== state.theme) {
      dispatch({ type: "SET_THEME", payload: initial });
    }

    const root = document.documentElement;
    root.setAttribute("data-theme", initial);
    if (initial === "brutal") {
      root.classList.add("theme-neo-brutal");
      root.classList.remove("theme-cyber");
    } else {
      root.classList.add("theme-cyber");
      root.classList.remove("theme-neo-brutal");
    }
  }, []);

  // Sync data-theme and CSS root classes with theme state
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", state.theme);
    localStorage.setItem(STORAGE_KEY, state.theme);

    if (state.theme === "brutal") {
      root.classList.add("theme-neo-brutal");
      root.classList.remove("theme-cyber");
    } else {
      root.classList.add("theme-cyber");
      root.classList.remove("theme-neo-brutal");
    }
  }, [state.theme]);

  const setTheme = useCallback(
    (theme: Theme) => {
      if (theme === state.theme) return;
      dispatch({ type: "SET_TRANSITIONING", payload: true });
      dispatch({ type: "SET_THEME", payload: theme });

      const timer = setTimeout(() => {
        dispatch({ type: "SET_TRANSITIONING", payload: false });
      }, 700);

      return () => clearTimeout(timer);
    },
    [state.theme]
  );

  const toggleTheme = useCallback(() => {
    setTheme(state.theme === "brutal" ? "cyber" : "brutal");
  }, [state.theme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme: state.theme,
        isTransitioning: state.isTransitioning,
        toggleTheme,
        setTheme,
        config: themeConfig,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }
  return ctx;
}
