"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "@/lib/theme";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "info", duration = 3500) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newToast: ToastItem = { id, message, type, duration };

    setToasts((prev) => [...prev.slice(-4), newToast]); // keep max 5 toasts

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((message: string, duration?: number) => showToast(message, "success", duration), [showToast]);
  const error = useCallback((message: string, duration?: number) => showToast(message, "error", duration), [showToast]);
  const info = useCallback((message: string, duration?: number) => showToast(message, "info", duration), [showToast]);
  const warning = useCallback((message: string, duration?: number) => showToast(message, "warning", duration), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      {/* Toast Notification Container Overlay */}
      <div className="fixed bottom-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-2">
        <AnimatePresence mode="sync">
          {toasts.map((toast) => {
            const icons: Record<ToastType, string> = {
              success: "✓",
              error: "✕",
              info: "ℹ",
              warning: "⚠️",
            };

            const colors: Record<ToastType, { border: string; bg: string; text: string; glow: string }> = {
              success: { border: "#10B981", bg: "rgba(16,185,129,0.15)", text: "#10B981", glow: "rgba(16,185,129,0.3)" },
              error: { border: "#EF4444", bg: "rgba(239,68,68,0.15)", text: "#EF4444", glow: "rgba(239,68,68,0.3)" },
              info: { border: "#00F5FF", bg: "rgba(0,245,255,0.15)", text: "#00F5FF", glow: "rgba(0,245,255,0.3)" },
              warning: { border: "#F59E0B", bg: "rgba(245,158,11,0.15)", text: "#F59E0B", glow: "rgba(245,158,11,0.3)" },
            };

            const cfg = colors[toast.type];

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-auto p-3.5 rounded-xl border flex items-center gap-3 shadow-lg select-none"
                style={{
                  backgroundColor: isCyber ? "rgba(10,15,30,0.92)" : "#FFFFFF",
                  borderColor: isCyber ? cfg.border : "#000000",
                  borderWidth: isCyber ? "1px" : "2.5px",
                  boxShadow: isCyber ? `0 0 20px ${cfg.glow}` : "4px 4px 0 #000000",
                  color: isCyber ? "#F8FAFC" : "#0F172A",
                }}
              >
                <span
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                  style={{
                    backgroundColor: isCyber ? cfg.bg : "#000000",
                    color: isCyber ? cfg.text : "#FFFFFF",
                  }}
                >
                  {icons[toast.type]}
                </span>
                <p className="text-xs font-bold leading-snug flex-1 font-sans">
                  {toast.message}
                </p>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-xs opacity-50 hover:opacity-100 font-mono px-1 cursor-pointer"
                >
                  ✕
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
