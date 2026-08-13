"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { useDashboardStore, SoftDeleteHistoryEntry } from "@/lib/store/dashboardStore";
import { useConfirm } from "@/lib/context/ConfirmContext";
import { useToast } from "@/components/ui/ToastProvider";
import { OverlayPortal } from "@/components/ui/OverlayPortal";
import { Z_INDEX } from "@/components/ui/ViewportBoundary";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CategoryTab = "ALL" | "GAME_CHARACTER" | "HALL_OF_FAME";

export function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { confirm } = useConfirm();
  const { success: toastSuccess, error: toastError } = useToast();

  const { historyItems = [], fetchHistory, restoreHistoryItems, permanentDeleteHistoryItems } = useDashboardStore();

  const [activeTab, setActiveTab] = useState<CategoryTab>("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
      setSelectedIds([]);
    }
  }, [isOpen, fetchHistory]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    if (activeTab === "ALL") return historyItems;
    return historyItems.filter((item) => item.entityType === activeTab);
  }, [historyItems, activeTab]);

  const allVisibleSelected = filteredItems.length > 0 && filteredItems.every((item) => selectedIds.includes(item.id));

  // Selection handlers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      const visibleIdSet = new Set(filteredItems.map((i) => i.id));
      setSelectedIds((prev) => prev.filter((id) => !visibleIdSet.has(id)));
    } else {
      const combined = new Set([...selectedIds, ...filteredItems.map((i) => i.id)]);
      setSelectedIds(Array.from(combined));
    }
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  // Bulk Actions
  const handleBulkRestore = async () => {
    if (selectedIds.length === 0) return;
    setIsProcessing(true);
    try {
      await restoreHistoryItems(selectedIds);
      toastSuccess(`✓ Successfully restored ${selectedIds.length} item(s) from History.`);
      setSelectedIds([]);
    } catch {
      toastError("Failed to restore selected items.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkPermanentDelete = () => {
    if (selectedIds.length === 0) return;
    confirm({
      title: `Delete ${selectedIds.length} Selected Item(s) Permanently?`,
      message: "This action cannot be undone. Media assets will be safely preserved if referenced elsewhere.",
      variant: "danger",
      confirmText: `Permanently Delete (${selectedIds.length})`,
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          await permanentDeleteHistoryItems(selectedIds);
          toastSuccess(`✓ Permanently deleted ${selectedIds.length} item(s).`);
          setSelectedIds([]);
        } catch {
          toastError("Failed to permanently delete selected items.");
        } finally {
          setIsProcessing(false);
        }
      },
    });
  };

  if (!isOpen) return null;

  return (
    <OverlayPortal>
      <AnimatePresence>
        <div
          className="fixed inset-0 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
          style={{ zIndex: Z_INDEX.MODAL }}
        >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="relative w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[88vh]"
          style={{
            backgroundColor: isCyber ? "#050816" : "#FFFFFF",
            borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000000",
            borderWidth: isCyber ? "1.5px" : "3px",
            boxShadow: isCyber ? "0 0 50px rgba(0,245,255,0.15)" : "8px 8px 0 #000000",
          }}
        >
          {/* ── HEADER ── */}
          <div
            className="px-5 py-4 border-b flex flex-wrap items-center justify-between gap-3 shrink-0"
            style={{
              borderColor: isCyber ? "rgba(0,245,255,0.15)" : "#000000",
              backgroundColor: isCyber ? "rgba(10,15,44,0.95)" : "#F8FAFC",
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📜</span>
              <div>
                <h2 className="text-lg font-black tracking-tight" style={{ color: isCyber ? "#00F5FF" : "#000000" }}>
                  Persistent Record History
                </h2>
                <p className="text-xs font-mono opacity-60">
                  Soft-deleted characters and entries. Restore or permanently delete at any time.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-sm cursor-pointer transition-transform hover:scale-110"
              style={{
                backgroundColor: isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0",
                color: isCyber ? "#FFFFFF" : "#000000",
                border: isCyber ? "1px solid rgba(255,255,255,0.2)" : "2px solid #000",
              }}
            >
              ✕
            </button>
          </div>

          {/* ── CONTROLS & SELECTION BAR ── */}
          <div
            className="px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 shrink-0"
            style={{
              borderColor: isCyber ? "rgba(255,255,255,0.08)" : "#E2E8F0",
              backgroundColor: isCyber ? "rgba(5,8,22,0.8)" : "#F1F5F9",
            }}
          >
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-black/20 p-1 rounded-xl border border-white/10">
              {[
                { id: "ALL", label: "All Items", icon: "🌐" },
                { id: "GAME_CHARACTER", label: "Game Characters", icon: "🎮" },
                { id: "HALL_OF_FAME", label: "Character Dict", icon: "👑" },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as CategoryTab)}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    style={{
                      backgroundColor: isActive
                        ? isCyber
                          ? "rgba(0,245,255,0.2)"
                          : "#000000"
                        : "transparent",
                      color: isActive
                        ? isCyber
                          ? "#00F5FF"
                          : "#FFFFFF"
                        : isCyber
                        ? "#94A3B8"
                        : "#64748B",
                      border: isActive ? (isCyber ? "1px solid rgba(0,245,255,0.4)" : "1px solid #000") : "none",
                    }}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Selection Toggles & Bulk Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              {filteredItems.length > 0 && (
                <button
                  onClick={toggleSelectAllVisible}
                  className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer"
                  style={{
                    backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#E2E8F0",
                    borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#000000",
                    color: isCyber ? "#CBD5E1" : "#000000",
                  }}
                >
                  {allVisibleSelected ? "Unselect All Visible" : "Select All Visible"}
                </button>
              )}

              {selectedIds.length > 0 && (
                <>
                  <button
                    onClick={clearSelection}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-mono opacity-70 hover:opacity-100 cursor-pointer"
                  >
                    Clear ({selectedIds.length})
                  </button>

                  <button
                    disabled={isProcessing}
                    onClick={handleBulkRestore}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 text-white"
                    style={{
                      backgroundColor: "#10B981",
                      border: isCyber ? "none" : "2px solid #000",
                      boxShadow: isCyber ? "0 0 15px rgba(16,185,129,0.4)" : "2px 2px 0 #000",
                    }}
                  >
                    <span>↺</span>
                    <span>Restore Selected ({selectedIds.length})</span>
                  </button>

                  <button
                    disabled={isProcessing}
                    onClick={handleBulkPermanentDelete}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 text-white"
                    style={{
                      backgroundColor: "#EF4444",
                      border: isCyber ? "none" : "2px solid #000",
                      boxShadow: isCyber ? "0 0 15px rgba(239,68,68,0.4)" : "2px 2px 0 #000",
                    }}
                  >
                    <span>🗑️</span>
                    <span>Delete Permanently ({selectedIds.length})</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ── HISTORY ITEM LIST ── */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
            {filteredItems.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <span className="text-5xl opacity-40">📭</span>
                <p className="text-sm font-mono opacity-60">No soft-deleted records in History.</p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const snapshot = item.snapshot || {};
                const media = item.mediaReferences || {};
                const imageSrc =
                  media.cardImage ||
                  media.avatarUrl ||
                  media.imageUrl ||
                  media.portraitUrl ||
                  snapshot.cardImage ||
                  snapshot.avatarUrl ||
                  snapshot.imageUrl;

                const deletedDateStr = item.deletedAt
                  ? new Date(item.deletedAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "Recently";

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    className="p-3.5 rounded-2xl border flex items-center gap-4 transition-all"
                    style={{
                      backgroundColor: isSelected
                        ? isCyber
                          ? "rgba(0,245,255,0.08)"
                          : "#FEF3C7"
                        : isCyber
                        ? "rgba(10,15,44,0.6)"
                        : "#FFFFFF",
                      borderColor: isSelected
                        ? isCyber
                          ? "#00F5FF"
                          : "#000000"
                        : isCyber
                        ? "rgba(255,255,255,0.1)"
                        : "#E2E8F0",
                      boxShadow: isCyber
                        ? isSelected
                          ? "0 0 15px rgba(0,245,255,0.2)"
                          : "none"
                        : isSelected
                        ? "3px 3px 0 #000"
                        : "none",
                    }}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(item.id)}
                      className="w-5 h-5 rounded cursor-pointer accent-cyan-400 shrink-0"
                    />

                    {/* Media Thumbnail */}
                    <div
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border shrink-0 bg-black/40 flex items-center justify-center font-bold text-xl"
                      style={{
                        borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#000000",
                      }}
                    >
                      {imageSrc ? (
                        <img src={imageSrc} alt={item.name} className="w-full h-full object-cover object-center" />
                      ) : (
                        <span className="opacity-40">{item.name.charAt(0)}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-sm sm:text-base truncate" style={{ color: isCyber ? "#FFFFFF" : "#000000" }}>
                          {item.name}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                            item.entityType === "GAME_CHARACTER"
                              ? isCyber
                                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                                : "bg-cyan-200 text-black border border-black shadow-[1px_1px_0_#000]"
                              : isCyber
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : "bg-amber-200 text-black border border-black shadow-[1px_1px_0_#000]"
                          }`}
                        >
                          {item.entityType === "GAME_CHARACTER" ? "Game Character" : "Character Dict"}
                        </span>
                      </div>

                      <div className="text-xs font-mono opacity-70 flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                        <span>{item.category || "Uncategorized"}</span>
                        <span>•</span>
                        <span>Original ID: <code className="opacity-80">{item.originalRecordId}</code></span>
                      </div>

                      <div className="text-[11px] font-mono opacity-50 mt-1">
                        Deleted: {deletedDateStr}
                      </div>
                    </div>

                    {/* Individual Quick Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedIds([item.id]);
                          restoreHistoryItems([item.id]);
                        }}
                        className="p-2 rounded-xl text-xs font-mono font-bold border transition-transform hover:scale-105 cursor-pointer"
                        style={{
                          backgroundColor: "rgba(16,185,129,0.15)",
                          borderColor: "#10B981",
                          color: "#10B981",
                        }}
                        title="Restore exact original record"
                      >
                        ↺ Restore
                      </button>

                      <button
                        onClick={() => {
                          confirm({
                            title: `Delete "${item.name}" Permanently?`,
                            message: "This action cannot be undone. Referenced media will be safely preserved.",
                            variant: "danger",
                            onConfirm: async () => {
                              await permanentDeleteHistoryItems([item.id]);
                            },
                          });
                        }}
                        className="p-2 rounded-xl text-xs font-mono font-bold border transition-transform hover:scale-105 cursor-pointer"
                        style={{
                          backgroundColor: "rgba(239,68,68,0.15)",
                          borderColor: "#EF4444",
                          color: "#EF4444",
                        }}
                        title="Permanently delete from History"
                      >
                        🗑️
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  </OverlayPortal>
);
}
