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
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "dashboard-theme";
const DEFAULT_THEME: Theme = "brutal";

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
  const [state, dispatch] = useReducer(themeReducer, {
    theme: DEFAULT_THEME,
    isTransitioning: false,
  });

  // Hydrate from localStorage — runs synchronously before paint
  useLayoutEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const initial: Theme =
      stored === "brutal" || stored === "cyber" ? stored : DEFAULT_THEME;
    dispatch({ type: "SET_THEME", payload: initial });
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  // Keep data-theme in sync with state
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", state.theme);
    localStorage.setItem(STORAGE_KEY, state.theme);
  }, [state.theme]);

  const setTheme = useCallback(
    (theme: Theme) => {
      if (theme === state.theme) return;
      dispatch({ type: "SET_TRANSITIONING", payload: true });
      dispatch({ type: "SET_THEME", payload: theme });

      // Clear transitioning flag after CSS transitions complete
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
