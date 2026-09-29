"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { OverlayPortal } from "@/components/ui/OverlayPortal";
import { TrainingBlock } from "@/lib/data/trainingSchedule";

interface ExerciseDetailModalProps {
  isOpen: boolean;
  block: TrainingBlock | null;
  dayLabel: string;
  isCompleted: boolean;
  isExhausted: boolean;
  onClose: () => void;
  onToggleState: (blockId: string, targetState: "COMPLETED" | "EXHAUSTED") => void;
}

export function ExerciseDetailModal({
  isOpen,
  block,
  dayLabel,
  isCompleted,
  isExhausted,
  onClose,
  onToggleState,
}: ExerciseDetailModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !block) return null;

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
            className={`relative w-full max-w-lg rounded-2xl p-6 sm:p-7 flex flex-col gap-5 z-10 shadow-2xl ${
              isCyber
                ? "bg-[rgba(9,15,35,0.98)] border border-cyan-500/40 text-slate-100 shadow-[0_0_40px_rgba(0,245,255,0.15)]"
                : "bg-[#FFFDF8] border-3 border-black text-black shadow-[8px_8px_0px_#000]"
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-black/10 dark:border-white/10 pb-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                      isCyber
                        ? "bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-mono"
                        : "bg-black text-[#FFE600]"
                    }`}
                  >
                    {dayLabel} · Block Instruction
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isCompleted
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : isExhausted
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                        : isCyber
                        ? "bg-slate-800 text-slate-400"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {isCompleted
                      ? "✓ Completed"
                      : isExhausted
                      ? "⚡ Exhausted (Recovery)"
                      : "Pending"}
                  </span>
                </div>
                <h3 className="text-xl font-black tracking-tight">{block.title}</h3>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close details"
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-all cursor-pointer ${
                  isCyber
                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                    : "bg-black text-white hover:bg-[#D9381E]"
                }`}
              >
                ✕
              </button>
            </div>

            {/* Block Metadata Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              {block.duration && (
                <div
                  className={`p-2.5 rounded-xl flex flex-col gap-0.5 ${
                    isCyber ? "bg-slate-900/80 border border-slate-800" : "bg-white border border-black/20"
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-gray-400">Duration</span>
                  <span className="font-mono font-bold text-cyan-400">{block.duration}</span>
                </div>
              )}
              {block.rounds && (
                <div
                  className={`p-2.5 rounded-xl flex flex-col gap-0.5 ${
                    isCyber ? "bg-slate-900/80 border border-slate-800" : "bg-white border border-black/20"
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-gray-400">Rounds</span>
                  <span className="font-mono font-bold text-cyan-400">{block.rounds} Rounds</span>
                </div>
              )}
              {block.sets && (
                <div
                  className={`p-2.5 rounded-xl flex flex-col gap-0.5 ${
                    isCyber ? "bg-slate-900/80 border border-slate-800" : "bg-white border border-black/20"
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-gray-400">Sets</span>
                  <span className="font-mono font-bold text-cyan-400">{block.sets} Sets</span>
                </div>
              )}
              {block.rest && (
                <div
                  className={`p-2.5 rounded-xl flex flex-col gap-0.5 ${
                    isCyber ? "bg-slate-900/80 border border-slate-800" : "bg-white border border-black/20"
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-gray-400">Rest Interval</span>
                  <span className="font-mono font-bold text-amber-400">{block.rest}</span>
                </div>
              )}
              {block.intensity && (
                <div
                  className={`p-2.5 rounded-xl flex flex-col gap-0.5 ${
                    isCyber ? "bg-slate-900/80 border border-slate-800" : "bg-white border border-black/20"
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-gray-400">Intensity</span>
                  <span className="font-mono font-bold text-red-400">{block.intensity}</span>
                </div>
              )}
              <div
                className={`p-2.5 rounded-xl flex flex-col gap-0.5 ${
                  isCyber ? "bg-slate-900/80 border border-slate-800" : "bg-white border border-black/20"
                }`}
              >
                <span className="text-[10px] uppercase font-bold text-gray-400">XP Value</span>
                <span className="font-mono font-bold text-emerald-400">+{block.xp} XP</span>
              </div>
            </div>

            {/* Exercises & Round Breakdown */}
            <div className="flex flex-col gap-2.5 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Exercise Breakdown ({block.exercises.length})
              </span>
              <div className="flex flex-col gap-2">
                {block.exercises.map((ex, i) => (
                  <div
                    key={ex.id || i}
                    className={`p-3 rounded-xl flex flex-col gap-1 transition-all ${
                      isCyber
                        ? "bg-slate-900/60 border border-slate-800/80"
                        : "bg-white border border-black/15"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm">{ex.name}</span>
                      {ex.reps && (
                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                            isCyber ? "bg-cyan-950 text-cyan-300" : "bg-black text-white"
                          }`}
                        >
                          {ex.reps}
                        </span>
                      )}
                      {ex.duration && !ex.reps && (
                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                            isCyber ? "bg-cyan-950 text-cyan-300" : "bg-black text-white"
                          }`}
                        >
                          {ex.duration}
                        </span>
                      )}
                    </div>
                    {ex.detail && (
                      <p className="text-xs text-gray-400 dark:text-slate-300 leading-relaxed">
                        {ex.detail}
                      </p>
                    )}
                    {ex.notes && (
                      <p
                        className={`text-[11px] font-medium italic mt-0.5 ${
                          isCyber ? "text-amber-400 font-mono" : "text-[#D9381E]"
                        }`}
                      >
                        💡 Technique Cue: {ex.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Actions within modal */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-black/10 dark:border-white/10">
              <span className="text-xs text-gray-400 font-medium">Log your status:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onToggleState(block.id, "COMPLETED")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isCompleted
                      ? isCyber
                        ? "bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.6)] font-mono"
                        : "bg-[#10B981] text-white border-2 border-black"
                      : isCyber
                      ? "bg-slate-800 text-slate-300 hover:bg-emerald-950/60 hover:text-emerald-300"
                      : "bg-white text-black border-2 border-black hover:bg-emerald-50 shadow-[2px_2px_0px_#000]"
                  }`}
                >
                  <span>✓</span>
                  <span>{isCompleted ? "Completed (+XP)" : "Mark Complete"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleState(block.id, "EXHAUSTED")}
                  title="Log intentional recovery state. Preserves streak and records fatigue."
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isExhausted
                      ? isCyber
                        ? "bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.6)] font-mono"
                        : "bg-[#F59E0B] text-black border-2 border-black"
                      : isCyber
                      ? "bg-slate-800 text-slate-300 hover:bg-amber-950/60 hover:text-amber-300"
                      : "bg-white text-black border-2 border-black hover:bg-amber-50 shadow-[2px_2px_0px_#000]"
                  }`}
                >
                  <span>⚡</span>
                  <span>{isExhausted ? "Exhausted Logged" : "Log Exhausted"}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </OverlayPortal>
  );
}
