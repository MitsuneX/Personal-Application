"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { useConfirm } from "@/lib/context/ConfirmContext";
import { useToast } from "@/components/ui/ToastProvider";

export function GlobalConfirmModal() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { isOpen, activeConfirm, closeConfirm, isLoading, setIsLoading } = useConfirm();
  const { success, error: toastError } = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        closeConfirm();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, closeConfirm]);

  if (!activeConfirm) return null;

  const {
    title,
    message,
    confirmText,
    cancelText = "Cancel",
    variant = "danger",
    itemPreview,
    onConfirm,
    successToast,
  } = activeConfirm;

  const handleConfirmAction = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      if (successToast) {
        success(successToast);
      }
      closeConfirm();
    } catch (err: any) {
      console.error("Action execution failed:", err);
      toastError(err?.message || "Action failed to complete.");
      setIsLoading(false);
    }
  };

  const isDanger = variant === "danger";

  // Variant color definitions
  const accentColor = isDanger
    ? isCyber
      ? "#EF4444"
      : "#DC2626"
    : isCyber
    ? "#00F5FF"
    : "#2563EB";

  const overlayBg = isCyber ? "rgba(2, 5, 15, 0.8)" : "rgba(0, 0, 0, 0.65)";

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6"
          style={{
            paddingLeft: "calc(var(--sidebar-width, 0px) + 1rem)",
            transition: "padding-left 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 pointer-events-auto"
            style={{
              backgroundColor: overlayBg,
              backdropFilter: isCyber ? "blur(8px)" : "none",
            }}
            onClick={() => !isLoading && closeConfirm()}
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="relative w-full max-w-md rounded-2xl overflow-hidden pointer-events-auto flex flex-col z-10 select-none shadow-2xl"
            style={{
              backgroundColor: isCyber ? "rgba(8, 12, 28, 0.95)" : "#FFFCDE",
              borderColor: isCyber ? `${accentColor}50` : "#000000",
              borderWidth: isCyber ? "1px" : "3px",
              boxShadow: isCyber
                ? `0 0 35px ${accentColor}30, 0 0 70px ${accentColor}10`
                : "6px 6px 0px #000000",
              color: isCyber ? "#F8FAFC" : "#0F172A",
            }}
          >
            {/* Header Icon Bar */}
            <div
              className="p-5 pb-4 border-b flex items-start gap-3.5"
              style={{
                borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#000000",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 font-bold border"
                style={{
                  backgroundColor: `${accentColor}20`,
                  color: accentColor,
                  borderColor: isCyber ? `${accentColor}60` : "#000000",
                  borderWidth: isCyber ? "1px" : "2px",
                }}
              >
                {isDanger ? "⚠️" : "ℹ️"}
              </div>

              <div className="min-w-0 flex-1">
                <h3
                  className="font-black text-lg leading-tight theme-text-primary uppercase tracking-tight"
                  style={{ color: isCyber ? "#F8FAFC" : "#0F172A" }}
                >
                  {title}
                </h3>
                {message && (
                  <p className="text-xs theme-text-secondary font-medium mt-1 leading-relaxed">
                    {message}
                  </p>
                )}
              </div>
            </div>

            {/* Contextual Item Preview Card */}
            {itemPreview && (
              <div className="p-4 bg-black/10 dark:bg-white/5 border-b border-white/10">
                <div
                  className="p-3 rounded-xl border flex items-center gap-3"
                  style={{
                    backgroundColor: isCyber ? "rgba(10,15,30,0.8)" : "#FFFFFF",
                    borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#000000",
                    borderWidth: isCyber ? "1px" : "2px",
                  }}
                >
                  {/* Thumbnail / Logo / Icon */}
                  {itemPreview.imageUrl ? (
                    <img
                      src={itemPreview.imageUrl}
                      alt={itemPreview.title || "Preview"}
                      className="w-12 h-12 rounded-lg object-cover shrink-0 border border-black/20"
                    />
                  ) : itemPreview.icon ? (
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0 font-bold border bg-black/5 dark:bg-white/5"
                      style={{ borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#000" }}
                    >
                      {itemPreview.icon}
                    </div>
                  ) : null}

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {itemPreview.title && (
                        <p className="font-black text-xs truncate theme-text-primary">
                          {itemPreview.title}
                        </p>
                      )}
                      {itemPreview.category && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border bg-black/10 dark:bg-white/10 opacity-80">
                          {itemPreview.category}
                        </span>
                      )}
                    </div>

                    {itemPreview.subtitle && (
                      <p className="text-[11px] theme-text-muted truncate mt-0.5 font-medium">
                        {itemPreview.subtitle}
                      </p>
                    )}

                    {itemPreview.description && (
                      <p className="text-[10px] theme-text-secondary line-clamp-2 mt-1 italic opacity-80">
                        "{itemPreview.description}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Warning Details Banner */}
            <div className="p-4 space-y-3">
              <p className="text-xs font-bold text-amber-500/90 dark:text-amber-400 flex items-center gap-1.5">
                <span>⚡ Warning:</span> This action cannot be undone.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => closeConfirm()}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: isCyber ? "rgba(255,255,255,0.08)" : "#E2E8F0",
                    color: isCyber ? "#94A3B8" : "#475569",
                    border: isCyber ? "1px solid rgba(255,255,255,0.15)" : "2px solid #000",
                  }}
                >
                  {cancelText}
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleConfirmAction}
                  className="flex-1 py-2.5 px-4 rounded-xl font-extrabold text-xs text-white transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shadow-md"
                  style={{
                    backgroundColor: accentColor,
                    border: isCyber ? "none" : "2px solid #000",
                    boxShadow: isCyber
                      ? `0 0 15px ${accentColor}60`
                      : "3px 3px 0 #000",
                  }}
                >
                  {isLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>{confirmText || (isDanger ? "Confirm Delete" : "Confirm Action")}</span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
