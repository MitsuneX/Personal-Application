"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { useConfirm } from "@/lib/context/ConfirmContext";
import { useToast } from "@/components/ui/ToastProvider";
import { OverlayPortal } from "./OverlayPortal";
import { Z_INDEX } from "./ViewportBoundary";
import { isImageUrl } from "@/lib/utils/mediaResolver";

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
    <OverlayPortal>
      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 select-none"
            style={{
              zIndex: Z_INDEX.MODAL + 100,
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
              className="relative w-full max-w-md max-h-[calc(100vh-32px)] overflow-y-auto rounded-2xl pointer-events-auto flex flex-col z-10 shadow-2xl scrollbar-thin"
              style={{
                backgroundColor: isCyber ? "rgba(8, 12, 28, 0.96)" : "#FFFCDE",
                borderColor: isCyber ? `${accentColor}50` : "#000000",
                borderWidth: isCyber ? "1px" : "3px",
                boxShadow: isCyber
                  ? `0 0 40px ${accentColor}30, 0 10px 40px rgba(0,0,0,0.8)`
                  : "6px 6px 0 #000000",
              }}
            >
              {/* Header Banner */}
              <div
                className="p-5 pb-4 border-b flex items-start justify-between gap-3"
                style={{
                  borderColor: isCyber ? "rgba(255,255,255,0.08)" : "#000000",
                  backgroundColor: isCyber ? "rgba(0,0,0,0.2)" : "transparent",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 font-bold"
                    style={{
                      backgroundColor: `${accentColor}20`,
                      color: accentColor,
                      border: isCyber ? `1px solid ${accentColor}40` : "2px solid #000",
                    }}
                  >
                    {isDanger ? "⚠️" : "⚡"}
                  </div>
                  <div>
                    <h3
                      className="text-base font-black truncate leading-tight"
                      style={{ color: isCyber ? "#F8FAFC" : "#000000" }}
                    >
                      {title}
                    </h3>
                    <span className="text-[10px] font-mono uppercase tracking-widest opacity-60">
                      CONFIRMATION REQUIRED
                    </span>
                  </div>
                </div>

                <button
                  onClick={closeConfirm}
                  disabled={isLoading}
                  className="text-sm font-mono opacity-60 hover:opacity-100 transition-opacity p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Body Content */}
              <div className="p-5 space-y-4">
                <p
                  className="text-xs sm:text-sm font-semibold leading-relaxed"
                  style={{ color: isCyber ? "#94A3B8" : "#334155" }}
                >
                  {message}
                </p>

                {/* Item Preview Card */}
                {itemPreview && (
                  <div
                    className="p-3 rounded-xl border flex items-center gap-3"
                    style={{
                      backgroundColor: isCyber ? "rgba(255,255,255,0.03)" : "#FFFFFF",
                      borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#000000",
                      borderWidth: isCyber ? "1px" : "2px",
                      boxShadow: isCyber ? "none" : "2px 2px 0 #000000",
                    }}
                  >
                    {itemPreview.icon && (
                      typeof itemPreview.icon === "string" ? (
                        isImageUrl(itemPreview.icon) ? (
                          <img src={itemPreview.icon} alt="" className="w-6 h-6 object-contain rounded shrink-0" />
                        ) : itemPreview.icon.length <= 8 && !itemPreview.icon.includes(";") ? (
                          <span className="text-xl shrink-0">{itemPreview.icon}</span>
                        ) : (
                          <span className="text-xl shrink-0">🗑️</span>
                        )
                      ) : (
                        <span className="text-xl shrink-0">{itemPreview.icon}</span>
                      )
                    )}
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-xs font-black truncate"
                        style={{ color: isCyber ? "#E0E8FF" : "#000000" }}
                      >
                        {itemPreview.title}
                      </p>
                      {itemPreview.subtitle && (
                        <p className="text-[10px] font-mono opacity-70 truncate mt-0.5">
                          {itemPreview.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div
                className="p-4 bg-black/10 dark:bg-white/5 border-t flex items-center justify-end gap-2.5"
                style={{ borderColor: isCyber ? "rgba(255,255,255,0.08)" : "#000000" }}
              >
                <button
                  type="button"
                  onClick={closeConfirm}
                  disabled={isLoading}
                  className="px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border hover:opacity-80"
                  style={{
                    backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#FFFFFF",
                    borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#000000",
                    borderWidth: isCyber ? "1px" : "2px",
                    color: isCyber ? "#CBD5E1" : "#000000",
                  }}
                >
                  {cancelText}
                </button>

                <button
                  type="button"
                  onClick={handleConfirmAction}
                  disabled={isLoading}
                  className="px-5 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-2 text-white shadow-md active:scale-95 disabled:opacity-50"
                  style={{
                    backgroundColor: accentColor,
                    border: isCyber ? `1px solid ${accentColor}` : "2px solid #000000",
                    boxShadow: isCyber
                      ? `0 0 15px ${accentColor}40`
                      : "2.5px 2.5px 0 #000000",
                  }}
                >
                  {isLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>{confirmText}</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </OverlayPortal>
  );
}
