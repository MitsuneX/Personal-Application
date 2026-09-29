"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useTheme } from "@/lib/theme";
import { OverlayPortal } from "@/components/ui/OverlayPortal";
import { HobbySkillEntry } from "@/lib/store/dashboardStore";
import {
  WEEKLY_TRAINING_SCHEDULE,
  TrainingDay,
} from "@/lib/data/trainingSchedule";

interface ConnectedHobbyModalProps {
  isOpen: boolean;
  hobby: HobbySkillEntry | null;
  onClose: () => void;
  onSelectDay?: (dayId: string) => void;
}

export function ConnectedHobbyModal({
  isOpen,
  hobby,
  onClose,
  onSelectDay,
}: ConnectedHobbyModalProps) {
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

  if (!isOpen || !hobby) return null;

  // Find all canonical training days dynamically connected to this hobby
  const relatedDays: TrainingDay[] = WEEKLY_TRAINING_SCHEDULE.filter((day) => {
    const nameMatch = day.hobbyLinks?.some(
      (link) =>
        hobby.name.toLowerCase().includes(link.toLowerCase()) ||
        link.toLowerCase().includes(hobby.name.toLowerCase())
    );
    const categoryMatch = day.categories.some(
      (cat) =>
        hobby.category.toLowerCase().includes(cat.toLowerCase()) ||
        hobby.name.toLowerCase().includes(cat.toLowerCase())
    );
    return nameMatch || categoryMatch;
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
            className={`relative w-full max-w-lg rounded-2xl p-6 sm:p-7 flex flex-col gap-5 z-10 shadow-2xl ${
              isCyber
                ? "bg-[rgba(9,15,35,0.98)] border border-cyan-500/40 text-slate-100 shadow-[0_0_40px_rgba(0,245,255,0.15)]"
                : "bg-[#FFFDF8] border-3 border-black text-black shadow-[8px_8px_0px_#000]"
            }`}
          >
            {/* Header */}
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
                    Connected Hobby
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isCyber
                        ? "bg-slate-800 text-slate-300 font-mono"
                        : "bg-gray-100 text-gray-800 border border-black/20"
                    }`}
                  >
                    {hobby.category}
                  </span>
                </div>
                <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                  <span>🎯 {hobby.name}</span>
                </h3>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close hobby modal"
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-all cursor-pointer ${
                  isCyber
                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                    : "bg-black text-white hover:bg-[#D9381E]"
                }`}
              >
                ✕
              </button>
            </div>

            {/* Authoritative Hobby Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div
                className={`p-2.5 rounded-xl flex flex-col gap-0.5 ${
                  isCyber
                    ? "bg-slate-900/80 border border-slate-800"
                    : "bg-white border border-black/20"
                }`}
              >
                <span className="text-[10px] uppercase font-bold text-gray-400">Level</span>
                <span className="font-mono font-bold text-cyan-400">Lv. {hobby.level}</span>
              </div>

              <div
                className={`p-2.5 rounded-xl flex flex-col gap-0.5 ${
                  isCyber
                    ? "bg-slate-900/80 border border-slate-800"
                    : "bg-white border border-black/20"
                }`}
              >
                <span className="text-[10px] uppercase font-bold text-gray-400">Skill XP</span>
                <span className="font-mono font-bold text-cyan-400">+{hobby.xp || 0} XP</span>
              </div>

              <div
                className={`p-2.5 rounded-xl flex flex-col gap-0.5 ${
                  isCyber
                    ? "bg-slate-900/80 border border-slate-800"
                    : "bg-white border border-black/20"
                }`}
              >
                <span className="text-[10px] uppercase font-bold text-gray-400">Streak</span>
                <span className="font-mono font-bold text-amber-400">🔥 {hobby.streak || 0}d</span>
              </div>

              <div
                className={`p-2.5 rounded-xl flex flex-col gap-0.5 ${
                  isCyber
                    ? "bg-slate-900/80 border border-slate-800"
                    : "bg-white border border-black/20"
                }`}
              >
                <span className="text-[10px] uppercase font-bold text-gray-400">Total Logged</span>
                <span className="font-mono font-bold text-cyan-400">{hobby.totalMinutes || 0}m</span>
              </div>
            </div>

            {/* Cross-System Training Relationship */}
            <div className="flex flex-col gap-2">
              <span
                className={`text-[11px] font-black uppercase tracking-wider ${
                  isCyber ? "text-cyan-400 font-mono" : "text-black"
                }`}
              >
                Related Home Training Sessions ({relatedDays.length})
              </span>

              {relatedDays.length === 0 ? (
                <p className="text-xs text-gray-400 italic">
                  No specific home training routines mapped to this hobby title.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {relatedDays.map((day) => (
                    <div
                      key={day.id}
                      className={`p-3 rounded-xl flex items-center justify-between gap-3 text-xs transition-colors ${
                        isCyber
                          ? "bg-slate-900/60 border border-slate-800 hover:border-slate-700"
                          : "bg-white border border-black/20 hover:border-black"
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                              isCyber ? "bg-slate-800 text-cyan-300" : "bg-black text-white"
                            }`}
                          >
                            {day.short}
                          </span>
                          <span className={isCyber ? "text-slate-100" : "text-black"}>
                            {day.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400">
                          ⏱️ {day.estimatedDuration} · {day.blocks.length} Blocks
                        </span>
                      </div>

                      {onSelectDay && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectDay(day.id);
                            onClose();
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            isCyber
                              ? "bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40"
                              : "bg-gray-100 text-black hover:bg-[#FFE600] border border-black/40"
                          }`}
                        >
                          View Plan →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-3">
              <span className="text-[11px] text-gray-400">
                Authoritative source: Hobbies OS
              </span>

              <Link
                href="/hobbies"
                onClick={onClose}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md ${
                  isCyber
                    ? "bg-cyan-500 text-black font-mono hover:bg-cyan-400 shadow-[0_0_15px_rgba(0,245,255,0.4)]"
                    : "bg-[#FFE600] text-black border-2 border-black shadow-[3px_3px_0px_#000] hover:bg-[#FFD700]"
                }`}
              >
                <span>Open in Hobbies OS</span>
                <span>→</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </OverlayPortal>
  );
}
