"use client";

import React, { createContext, useContext, useReducer, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

type ToastAction =
  | { type: "ADD"; toast: Toast }
  | { type: "REMOVE"; id: string };

// ─── Context ──────────────────────────────────────────────────────────────────

interface ToastContextValue {
  toasts: Toast[];
  toast: (opts: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Reducer ──────────────────────────────────────────────────────────────────

function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case "ADD":
      return { toasts: [action.toast, ...state.toasts].slice(0, 5) };
    case "REMOVE":
      return { toasts: state.toasts.filter((t) => t.id !== action.id) };
    default:
      return state;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] });

  const toast = useCallback((opts: Omit<Toast, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    dispatch({ type: "ADD", toast: { id, duration: 4000, ...opts } });
  }, []);

  const dismiss = useCallback((id: string) => {
    dispatch({ type: "REMOVE", id });
  }, []);

  return (
    <ToastContext.Provider value={{ toasts: state.toasts, toast, dismiss }}>
      {children}
      <ToastViewport toasts={state.toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

// ─── Toast Icons ──────────────────────────────────────────────────────────────

const TOAST_ICONS: Record<ToastType, string> = {
  success: "✅",
  error: "❌",
  info: "ℹ️",
  warning: "⚠️",
};

const CYBER_TOAST_COLORS: Record<ToastType, { border: string; glow: string; label: string }> = {
  success: { border: "rgba(57,255,20,0.5)",  glow: "rgba(57,255,20,0.15)",  label: "#39FF14" },
  error:   { border: "rgba(255,59,59,0.5)",  glow: "rgba(255,59,59,0.15)",  label: "#FF3B3B" },
  info:    { border: "rgba(0,245,255,0.5)",  glow: "rgba(0,245,255,0.15)",  label: "#00F5FF" },
  warning: { border: "rgba(255,209,0,0.5)",  glow: "rgba(255,209,0,0.15)",  label: "#FFD100" },
};

const BRUTAL_TOAST_COLORS: Record<ToastType, { border: string; bg: string; label: string }> = {
  success: { border: "#16A34A", bg: "#F0FFF4", label: "#15803D" },
  error:   { border: "#DC2626", bg: "#FFF5F5", label: "#B91C1C" },
  info:    { border: "#2563EB", bg: "#EFF6FF", label: "#1D4ED8" },
  warning: { border: "#D97706", bg: "#FFFBEB", label: "#B45309" },
};

// ─── Individual Toast ─────────────────────────────────────────────────────────

function ToastItem({ toast, dismiss }: { toast: Toast; dismiss: (id: string) => void }) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const duration = toast.duration ?? 4000;

  useEffect(() => {
    const timer = setTimeout(() => dismiss(toast.id), duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration, dismiss]);

  const cyberColor = CYBER_TOAST_COLORS[toast.type];
  const brutalColor = BRUTAL_TOAST_COLORS[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.92 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className="relative w-80 rounded-xl overflow-hidden cursor-pointer"
      onClick={() => dismiss(toast.id)}
      style={
        isCyber
          ? {
              background: "rgba(5, 8, 22, 0.96)",
              border: `1px solid ${cyberColor.border}`,
              boxShadow: `0 0 24px ${cyberColor.glow}, 0 4px 20px rgba(0,0,0,0.5)`,
              backdropFilter: "blur(16px)",
            }
          : {
              background: brutalColor.bg,
              border: `3px solid ${brutalColor.border}`,
              boxShadow: `4px 4px 0px 0px #000`,
            }
      }
    >
      {/* Content */}
      <div className="flex items-start gap-3 p-4">
        <span className="text-xl shrink-0 mt-0.5">{TOAST_ICONS[toast.type]}</span>
        <div className="flex-1 min-w-0">
          {toast.title && (
            <p
              className="text-xs font-black uppercase tracking-wider truncate"
              style={{ color: isCyber ? cyberColor.label : brutalColor.label }}
            >
              {toast.title}
            </p>
          )}
          <p
            className="text-xs font-semibold leading-relaxed mt-0.5"
            style={{ color: isCyber ? "#E0E8FF" : "#1A1A1A" }}
          >
            {toast.message}
          </p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); dismiss(toast.id); }}
          className="shrink-0 text-xs opacity-40 hover:opacity-80 transition-opacity font-bold mt-0.5"
          style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}
        >
          ✕
        </button>
      </div>

      {/* Progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-[2px]"
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: duration / 1000, ease: "linear" }}
        style={{
          backgroundColor: isCyber ? cyberColor.label : brutalColor.border,
        }}
      />
    </motion.div>
  );
}

// ─── Viewport ─────────────────────────────────────────────────────────────────

function ToastViewport({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[9998] flex flex-col gap-3 items-end pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} dismiss={dismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
