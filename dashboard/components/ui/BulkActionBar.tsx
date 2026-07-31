"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";

export interface BulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  onDeleteSelected?: () => void;
  onFavoriteSelected?: () => void;
  onExportSelected?: () => void;
  onChangeCategory?: () => void;
  onCancel: () => void;
  customActions?: Array<{
    label: string;
    icon?: string;
    onClick: () => void;
    danger?: boolean;
  }>;
}

export function BulkActionBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onDeleteSelected,
  onFavoriteSelected,
  onExportSelected,
  onChangeCategory,
  onCancel,
  customActions = [],
}: BulkActionBarProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  if (selectedCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-2xl flex items-center gap-3 flex-wrap shadow-2xl backdrop-blur-md max-w-[95vw] md:max-w-2xl"
        style={{
          backgroundColor: isCyber ? "rgba(10, 15, 30, 0.92)" : "#FFFFFF",
          borderColor: isCyber ? "#00F5FF" : "#000000",
          borderWidth: isCyber ? "1.5px" : "3px",
          boxShadow: isCyber
            ? "0 0 35px rgba(0,245,255,0.3), inset 0 0 15px rgba(0,245,255,0.1)"
            : "6px 6px 0 #000000",
        }}
      >
        {/* Count Badge */}
        <div className="flex items-center gap-2">
          <span
            className="px-2.5 py-1 rounded-lg text-xs font-mono font-black shrink-0"
            style={{
              backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#000000",
              color: isCyber ? "#00F5FF" : "#FFFFFF",
              border: isCyber ? "1px solid rgba(0,245,255,0.4)" : "none",
            }}
          >
            {selectedCount} Selected
          </span>

          {onSelectAll && selectedCount < totalCount && (
            <button
              onClick={onSelectAll}
              className="text-[11px] font-bold theme-text-secondary hover:underline cursor-pointer"
            >
              Select All ({totalCount})
            </button>
          )}

          {onDeselectAll && selectedCount === totalCount && (
            <button
              onClick={onDeselectAll}
              className="text-[11px] font-bold theme-text-secondary hover:underline cursor-pointer"
            >
              Deselect All
            </button>
          )}
        </div>

        <div className="h-4 w-[1px] bg-slate-400/30 shrink-0 hidden sm:block" />

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {onFavoriteSelected && (
            <button
              onClick={onFavoriteSelected}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1"
              style={{
                backgroundColor: isCyber ? "rgba(250,204,21,0.15)" : "#FEF08A",
                color: isCyber ? "#FACC15" : "#854D0E",
                border: isCyber ? "1px solid rgba(250,204,21,0.3)" : "1.5px solid #000",
              }}
              title="Favorite Selected"
            >
              <span>⭐</span> Favorite
            </button>
          )}

          {onChangeCategory && (
            <button
              onClick={onChangeCategory}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1"
              style={{
                backgroundColor: isCyber ? "rgba(191,95,255,0.15)" : "#F3E8FF",
                color: isCyber ? "#BF5FFF" : "#6B21A8",
                border: isCyber ? "1px solid rgba(191,95,255,0.3)" : "1.5px solid #000",
              }}
              title="Change Category"
            >
              <span>📁</span> Move
            </button>
          )}

          {onExportSelected && (
            <button
              onClick={onExportSelected}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1"
              style={{
                backgroundColor: isCyber ? "rgba(59,130,246,0.15)" : "#DBEAFE",
                color: isCyber ? "#60A5FA" : "#1E40AF",
                border: isCyber ? "1px solid rgba(59,130,246,0.3)" : "1.5px solid #000",
              }}
              title="Export Selected"
            >
              <span>📦</span> Export
            </button>
          )}

          {customActions.map((act) => (
            <button
              key={act.label}
              onClick={act.onClick}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1"
              style={{
                backgroundColor: act.danger
                  ? isCyber ? "rgba(239,68,68,0.2)" : "#FEE2E2"
                  : isCyber ? "rgba(255,255,255,0.1)" : "#F1F5F9",
                color: act.danger ? "#EF4444" : isCyber ? "#F8FAFC" : "#0F172A",
                border: act.danger
                  ? isCyber ? "1px solid rgba(239,68,68,0.4)" : "1.5px solid #000"
                  : isCyber ? "1px solid rgba(255,255,255,0.2)" : "1.5px solid #000",
              }}
            >
              {act.icon && <span>{act.icon}</span>} {act.label}
            </button>
          ))}

          {onDeleteSelected && (
            <button
              onClick={onDeleteSelected}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1 bg-red-600 text-white shadow-sm"
              style={{
                border: isCyber ? "1px solid rgba(239,68,68,0.5)" : "1.5px solid #000",
              }}
              title="Delete Selected"
            >
              <span>🗑️</span> Delete ({selectedCount})
            </button>
          )}

          <button
            onClick={onCancel}
            className="p-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 cursor-pointer ml-1"
            title="Cancel Selection"
          >
            ✕
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
