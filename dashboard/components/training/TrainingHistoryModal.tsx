"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { OverlayPortal } from "@/components/ui/OverlayPortal";
import { TrainingSessionEntry } from "@/lib/store/dashboardStore";
import {
  WEEKLY_TRAINING_SCHEDULE,
  getTotalDayXp,
} from "@/lib/data/trainingSchedule";

interface TrainingHistoryModalProps {
  isOpen: boolean;
  sessions: TrainingSessionEntry[];
  onClose: () => void;
  onSelectDay?: (dayId: string) => void;
}

export function TrainingHistoryModal({
  isOpen,
  sessions,
  onClose,
  onSelectDay,
}: TrainingHistoryModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const [filter, setFilter] = useState<"ALL" | "COMPLETED" | "RECOVERY">("ALL");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = sessions.filter((s) => {
    if (filter === "COMPLETED") return s.status === "COMPLETED";
    if (filter === "RECOVERY")
      return (
        s.status === "RECOVERY_COMPLETE" ||
        s.status === "EXHAUSTED" ||
        (s.exhaustedBlocks && s.exhaustedBlocks.length > 0)
      );
    return true;
  });

  return (
    <OverlayPortal>
      <AnimatePresence>
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`relative w-full max-w-2xl rounded-2xl p-6 sm:p-7 flex flex-col gap-5 z-10 shadow-2xl max-h-[85vh] ${
              isCyber
                ? "bg-[rgba(9,15,35,0.98)] border border-cyan-500/40 text-slate-100 shadow-[0_0_40px_rgba(0,245,255,0.15)]"
                : "bg-[#FFFDF8] border-3 border-black text-black shadow-[8px_8px_0px_#000]"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">📜</span>
                <div>
                  <h3 className="text-xl font-black tracking-tight">Full Training Log Archive</h3>
                  <p className="text-xs text-gray-400">
                    {sessions.length} total logged sessions · Preserved with real database persistence
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close history modal"
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-all cursor-pointer ${
                  isCyber
                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                    : "bg-black text-white hover:bg-[#D9381E]"
                }`}
              >
                ✕
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2">
              {(["ALL", "COMPLETED", "RECOVERY"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    filter === tab
                      ? isCyber
                        ? "bg-cyan-500 text-black font-mono shadow-[0_0_12px_rgba(0,245,255,0.4)]"
                        : "bg-black text-white"
                      : isCyber
                      ? "bg-slate-800 text-slate-400 hover:text-white"
                      : "bg-white text-gray-700 border border-black/20 hover:bg-gray-100"
                  }`}
                >
                  {tab === "ALL" ? `All (${sessions.length})` : tab === "COMPLETED" ? "Completed" : "Recovery"}
                </button>
              ))}
            </div>

            {/* Session Items List */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 scrollbar-thin">
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-400">
                  No records matching the selected filter.
                </div>
              ) : (
                filtered.map((session) => {
                  const dayDef = session.sessionSnapshot || WEEKLY_TRAINING_SCHEDULE.find((d) => d.id === session.dayId);
                  const totalAvailXp = dayDef ? getTotalDayXp(dayDef) : session.xpEarned;
                  const completedCount = session.completedBlocks?.length || 0;
                  const exhaustedCount = session.exhaustedBlocks?.length || 0;
                  const totalBlocks = dayDef ? dayDef.blocks.length : completedCount + exhaustedCount;
                  const percent = totalBlocks > 0 ? Math.min(100, Math.round(((completedCount + exhaustedCount) / totalBlocks) * 100)) : 0;

                  const isRecovery =
                    session.status === "RECOVERY_COMPLETE" ||
                    session.status === "EXHAUSTED" ||
                    exhaustedCount > 0;

                  return (
                    <div
                      key={session.id || session.dateKey}
                      onClick={() => {
                        if (session.dayId && onSelectDay) {
                          onSelectDay(session.dayId);
                          onClose();
                        }
                      }}
                      className={`p-4 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer ${
                        isCyber
                          ? "bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/90"
                          : "bg-white border-2 border-black/80 shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000]"
                      }`}
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                              isCyber ? "bg-slate-800 text-cyan-300" : "bg-black text-white"
                            }`}
                          >
                            {session.dateKey}
                          </span>
                          <span className="font-bold text-sm">
                            {dayDef ? `${dayDef.label} · ${dayDef.title}` : session.dayId}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="text-emerald-400 font-semibold">
                            ✓ {completedCount} Done
                          </span>
                          {exhaustedCount > 0 && (
                            <span className="text-amber-400 font-semibold">
                              ⚡ {exhaustedCount} Exhausted
                            </span>
                          )}
                          {session.durationMin && (
                            <span>⏱️ {session.durationMin} min</span>
                          )}
                          {session.note && (
                            <span className="italic truncate max-w-[200px] text-slate-300">
                              “{session.note}”
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <div className="flex flex-col items-end text-xs">
                          <span className="font-mono font-bold text-cyan-400">
                            {session.xpEarned} / {totalAvailXp} XP
                          </span>
                          <span className="text-[10px] text-gray-400">{percent}% progress</span>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                            session.status === "COMPLETED"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              : isRecovery
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                              : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                          }`}
                        >
                          {session.status === "COMPLETED"
                            ? "Completed"
                            : isRecovery
                            ? "Recovery Logged"
                            : "In Progress"}
                        </span>
                      </div>
                    </div>
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
