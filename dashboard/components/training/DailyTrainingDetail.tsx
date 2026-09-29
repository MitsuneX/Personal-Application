"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import {
  TrainingDay,
  TrainingBlock,
  getTotalDayXp,
  WEEKLY_TRAINING_SCHEDULE,
} from "@/lib/data/trainingSchedule";
import {
  TrainingSessionEntry,
  HobbySkillEntry,
} from "@/lib/store/dashboardStore";
import Link from "next/link";

interface DailyTrainingDetailProps {
  day: TrainingDay;
  todayDayId: string;
  todayDateKey: string;
  currentSession?: TrainingSessionEntry;
  onSelectDay: (dayId: string) => void;
  onUpdateBlockState: (
    dayId: string,
    blockId: string,
    newState: "PENDING" | "COMPLETED" | "EXHAUSTED"
  ) => Promise<void>;
  hobbySkills: HobbySkillEntry[];
}

export function DailyTrainingDetail({
  day,
  todayDayId,
  todayDateKey,
  currentSession,
  onSelectDay,
  onUpdateBlockState,
  hobbySkills,
}: DailyTrainingDetailProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const [savingBlockId, setSavingBlockId] = useState<string | null>(null);

  const completedBlocks = currentSession?.completedBlocks || [];
  const exhaustedBlocks = currentSession?.exhaustedBlocks || [];

  const isToday = day.id === todayDayId;
  const totalAvailableXp = getTotalDayXp(day);

  // Calculate current earned XP from completed blocks
  const earnedXp = day.blocks
    .filter((b) => completedBlocks.includes(b.id))
    .reduce((sum, b) => sum + b.xp, 0);

  const xpProgressPercent =
    totalAvailableXp > 0
      ? Math.min(100, Math.round((earnedXp / totalAvailableXp) * 100))
      : 0;

  // Derive day status
  const requiredBlocks = day.blocks.filter((b) => b.required);
  const completedCount = requiredBlocks.filter((b) =>
    completedBlocks.includes(b.id)
  ).length;
  const exhaustedCount = requiredBlocks.filter((b) =>
    exhaustedBlocks.includes(b.id)
  ).length;
  const totalRequired = requiredBlocks.length;

  let sessionStatusLabel = "Not Started";
  let sessionStatusType: "completed" | "exhausted" | "in_progress" | "not_started" = "not_started";

  if (totalRequired > 0) {
    if (completedCount === totalRequired) {
      sessionStatusLabel = "Completed";
      sessionStatusType = "completed";
    } else if (completedCount + exhaustedCount === totalRequired) {
      sessionStatusLabel = exhaustedCount > 0 ? "Recovery Complete" : "Completed";
      sessionStatusType = "exhausted";
    } else if (completedCount > 0 || exhaustedCount > 0) {
      sessionStatusLabel = `In Progress (${completedCount + exhaustedCount}/${totalRequired})`;
      sessionStatusType = "in_progress";
    }
  }

  // Find linked hobby skills matching categories or day hobbyLinks
  const matchedHobbies = hobbySkills.filter((h) => {
    const nameMatch = day.hobbyLinks?.some(
      (link) =>
        h.name.toLowerCase().includes(link.toLowerCase()) ||
        link.toLowerCase().includes(h.name.toLowerCase())
    );
    const categoryMatch = day.categories.some(
      (cat) =>
        h.category.toLowerCase().includes(cat.toLowerCase()) ||
        h.name.toLowerCase().includes(cat.toLowerCase())
    );
    return nameMatch || categoryMatch;
  });

  const handleToggleState = async (
    blockId: string,
    targetState: "COMPLETED" | "EXHAUSTED"
  ) => {
    if (savingBlockId) return;
    setSavingBlockId(blockId);

    const isCurrentCompleted = completedBlocks.includes(blockId);
    const isCurrentExhausted = exhaustedBlocks.includes(blockId);

    let nextState: "PENDING" | "COMPLETED" | "EXHAUSTED" = "PENDING";
    if (targetState === "COMPLETED") {
      nextState = isCurrentCompleted ? "PENDING" : "COMPLETED";
    } else {
      nextState = isCurrentExhausted ? "PENDING" : "EXHAUSTED";
    }

    try {
      await onUpdateBlockState(day.id, blockId, nextState);
    } finally {
      setSavingBlockId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Day Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {WEEKLY_TRAINING_SCHEDULE.map((d) => {
          const isSelected = d.id === day.id;
          const isCurrentToday = d.id === todayDayId;

          return (
            <button
              key={d.id}
              type="button"
              onClick={() => onSelectDay(d.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                isSelected
                  ? isCyber
                    ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,245,255,0.5)] font-mono"
                    : "bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_#000]"
                  : isCyber
                  ? "bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700/50"
                  : "bg-white text-gray-800 hover:bg-gray-100 border border-black/30"
              }`}
            >
              <span>{d.short}</span>
              {isCurrentToday && (
                <span
                  className={`text-[9px] px-1 py-0.2 rounded font-black ${
                    isSelected
                      ? isCyber
                        ? "bg-black text-cyan-400"
                        : "bg-black text-white"
                      : isCyber
                      ? "bg-cyan-950 text-cyan-300 border border-cyan-500/40"
                      : "bg-[#D9381E] text-white"
                  }`}
                >
                  TODAY
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Day Overview Header Card */}
      <div
        className={`relative overflow-hidden rounded-2xl p-5 transition-all ${
          isCyber
            ? "bg-[rgba(10,16,35,0.9)] border border-cyan-500/40 shadow-[0_0_25px_rgba(0,245,255,0.12)] backdrop-blur-md"
            : "bg-white border-3 border-black shadow-[6px_6px_0px_#000]"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                  isCyber
                    ? "bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-mono"
                    : "bg-black text-[#FFE600]"
                }`}
              >
                {day.label}
              </span>
              {isToday && (
                <span
                  className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                    isCyber
                      ? "bg-cyan-500 text-black font-mono shadow-[0_0_10px_rgba(0,245,255,0.6)]"
                      : "bg-[#D9381E] text-white border border-black"
                  }`}
                >
                  TODAY&apos;S SESSION
                </span>
              )}
              {day.categories.map((cat) => (
                <span
                  key={cat}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    isCyber
                      ? "bg-slate-800/80 text-slate-300 border border-slate-700/60"
                      : "bg-gray-100 text-black border border-black/30"
                  }`}
                >
                  {cat}
                </span>
              ))}
            </div>

            <h1
              className={`text-xl md:text-2xl font-black tracking-tight ${
                isCyber ? "text-white" : "text-black"
              }`}
            >
              {day.title}
            </h1>
            <p
              className={`text-xs md:text-sm ${
                isCyber ? "text-slate-300" : "text-gray-700"
              }`}
            >
              {day.subtitle}
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-xl flex flex-col items-center justify-center min-w-[90px] ${
                isCyber
                  ? "bg-slate-900/80 border border-cyan-500/30"
                  : "bg-[#FFFDE8] border-2 border-black shadow-[2px_2px_0px_#000]"
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-gray-400">Duration</span>
              <span
                className={`text-sm font-black ${
                  isCyber ? "text-cyan-300 font-mono" : "text-black"
                }`}
              >
                {day.estimatedDuration}
              </span>
            </div>

            {!day.isRestDay && (
              <div
                className={`p-3 rounded-xl flex flex-col items-center justify-center min-w-[90px] ${
                  isCyber
                    ? "bg-slate-900/80 border border-cyan-500/30"
                    : "bg-[#FFFDE8] border-2 border-black shadow-[2px_2px_0px_#000]"
                }`}
              >
                <span className="text-[10px] uppercase font-bold text-gray-400">Total XP</span>
                <span
                  className={`text-sm font-black ${
                    isCyber ? "text-emerald-400 font-mono" : "text-[#10B981]"
                  }`}
                >
                  +{totalAvailableXp} XP
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar (For Workout Days) */}
        {!day.isRestDay && (
          <div className="mt-5 pt-4 border-t border-black/10 dark:border-white/10 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className={`font-bold ${isCyber ? "text-slate-300" : "text-black"}`}>
                Session Progress:{" "}
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-black uppercase ${
                    sessionStatusType === "completed"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : sessionStatusType === "exhausted"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                      : sessionStatusType === "in_progress"
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                      : "bg-slate-700/40 text-slate-400"
                  }`}
                >
                  {sessionStatusLabel}
                </span>
              </span>

              <span
                className={`font-mono font-bold ${
                  isCyber ? "text-cyan-400" : "text-black"
                }`}
              >
                {earnedXp} / {totalAvailableXp} XP ({xpProgressPercent}%)
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div
              className={`h-3 w-full rounded-full overflow-hidden ${
                isCyber ? "bg-slate-800" : "bg-gray-200 border border-black/30"
              }`}
            >
              <div
                className={`h-full transition-all duration-500 ${
                  xpProgressPercent === 100
                    ? isCyber
                      ? "bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_0_12px_rgba(16,185,129,0.8)]"
                      : "bg-[#10B981]"
                    : exhaustedCount > 0
                    ? isCyber
                      ? "bg-gradient-to-r from-amber-500 to-cyan-400"
                      : "bg-[#F59E0B]"
                    : isCyber
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                    : "bg-[#FFE600]"
                }`}
                style={{ width: `${xpProgressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Rest Day Presentation (Sunday) */}
      {day.isRestDay ? (
        <div
          className={`rounded-2xl p-6 flex flex-col gap-4 ${
            isCyber
              ? "bg-[rgba(15,22,45,0.8)] border border-purple-500/40 shadow-[0_0_25px_rgba(168,85,247,0.15)]"
              : "bg-[#FAF5FF] border-3 border-black shadow-[5px_5px_0px_#000]"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">🧘</span>
            <div>
              <h2
                className={`text-lg font-black uppercase tracking-wider ${
                  isCyber ? "text-purple-300 font-mono" : "text-purple-900"
                }`}
              >
                Intentional Rest & Biological Reset
              </h2>
              <p
                className={`text-xs ${
                  isCyber ? "text-slate-300" : "text-purple-800 font-medium"
                }`}
              >
                Sunday is not a missed workout. It is an intentional day of recovery and nervous system restoration.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
            <div
              className={`p-3.5 rounded-xl flex flex-col gap-1 ${
                isCyber
                  ? "bg-slate-900/60 border border-purple-500/20"
                  : "bg-white border-2 border-black shadow-[2px_2px_0px_#000]"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-purple-400">
                <span>🍗</span> High-Protein Meal Prep
              </div>
              <p className="text-xs text-slate-300 dark:text-slate-300 text-gray-700">
                Cook protein sources (e.g. baked chicken breasts, eggs, tofu) to fuel muscle repair for the upcoming week.
              </p>
            </div>

            <div
              className={`p-3.5 rounded-xl flex flex-col gap-1 ${
                isCyber
                  ? "bg-slate-900/60 border border-purple-500/20"
                  : "bg-white border-2 border-black shadow-[2px_2px_0px_#000]"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-cyan-400">
                <span>💧</span> Hydration & Electrolytes
              </div>
              <p className="text-xs text-slate-300 dark:text-slate-300 text-gray-700">
                Replenish cellular fluid balance with pure water and mineral-rich foods to prevent joint and tendon soreness.
              </p>
            </div>

            <div
              className={`p-3.5 rounded-xl flex flex-col gap-1 ${
                isCyber
                  ? "bg-slate-900/60 border border-purple-500/20"
                  : "bg-white border-2 border-black shadow-[2px_2px_0px_#000]"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-amber-400">
                <span>😴</span> Sleep Schedule Reset
              </div>
              <p className="text-xs text-slate-300 dark:text-slate-300 text-gray-700">
                Aim for 8–9 hours of deep sleep. Human growth hormone and central nervous system repair peak during non-REM stages.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Workout Blocks List */
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2
              className={`text-sm font-bold uppercase tracking-wider ${
                isCyber ? "text-cyan-400 font-mono" : "text-black"
              }`}
            >
              Training Blocks ({day.blocks.length})
            </h2>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Complete
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Exhausted
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {day.blocks.map((block, index) => {
              const isCompleted = completedBlocks.includes(block.id);
              const isExhausted = exhaustedBlocks.includes(block.id);
              const isPending = !isCompleted && !isExhausted;
              const isSaving = savingBlockId === block.id;

              return (
                <div
                  key={block.id}
                  className={`rounded-xl p-4 md:p-5 transition-all flex flex-col gap-3.5 ${
                    isCompleted
                      ? isCyber
                        ? "bg-[rgba(10,35,25,0.85)] border-2 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                        : "bg-[#E6F9F0] border-2 border-black shadow-[4px_4px_0px_#000]"
                      : isExhausted
                      ? isCyber
                        ? "bg-[rgba(35,25,10,0.85)] border-2 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                        : "bg-[#FFF8E6] border-2 border-black shadow-[4px_4px_0px_#000]"
                      : isCyber
                      ? "bg-[rgba(12,18,36,0.7)] border border-slate-700/60 hover:border-slate-600"
                      : "bg-white border-2 border-black shadow-[3px_3px_0px_#000]"
                  }`}
                >
                  {/* Block Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          isCyber ? "bg-slate-800 text-slate-300" : "bg-black text-white"
                        }`}
                      >
                        #{index + 1}
                      </span>
                      <h3
                        className={`text-base font-bold ${
                          isCompleted
                            ? isCyber
                              ? "text-emerald-300"
                              : "text-emerald-900"
                            : isExhausted
                            ? isCyber
                              ? "text-amber-300"
                              : "text-amber-900"
                            : isCyber
                            ? "text-white"
                            : "text-black"
                        }`}
                      >
                        {block.title}
                      </h3>

                      {/* Detail Badges */}
                      {block.duration && (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            isCyber ? "bg-slate-800/90 text-cyan-300" : "bg-gray-100 text-black"
                          }`}
                        >
                          ⏱️ {block.duration}
                        </span>
                      )}
                      {block.rounds && (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            isCyber ? "bg-slate-800/90 text-cyan-300" : "bg-gray-100 text-black"
                          }`}
                        >
                          🥊 {block.rounds} Rounds
                        </span>
                      )}
                      {block.sets && (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            isCyber ? "bg-slate-800/90 text-cyan-300" : "bg-gray-100 text-black"
                          }`}
                        >
                          💪 {block.sets} Sets
                        </span>
                      )}
                      {block.rest && (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            isCyber ? "bg-slate-800/90 text-amber-300" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          Rest: {block.rest}
                        </span>
                      )}
                      {block.intensity && (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            isCyber ? "bg-red-950/60 text-red-300" : "bg-red-100 text-red-900"
                          }`}
                        >
                          Intensity: {block.intensity}
                        </span>
                      )}
                    </div>

                    {/* Action Controls: Complete & Exhausted */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {/* Complete Button */}
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleToggleState(block.id, "COMPLETED")}
                        aria-label={`Mark ${block.title} as completed`}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                          isCompleted
                            ? isCyber
                              ? "bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.6)] font-mono"
                              : "bg-[#10B981] text-white border-2 border-black shadow-[2px_2px_0px_#000]"
                            : isCyber
                            ? "bg-slate-800 text-slate-300 hover:bg-emerald-950/50 hover:text-emerald-300 border border-slate-700"
                            : "bg-white text-black hover:bg-emerald-50 border-2 border-black shadow-[2px_2px_0px_#000]"
                        }`}
                      >
                        <span>✓</span>
                        <span>{isCompleted ? "Completed" : "Complete"}</span>
                        <span className="text-[10px] opacity-80">+{block.xp} XP</span>
                      </button>

                      {/* Exhausted Button */}
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleToggleState(block.id, "EXHAUSTED")}
                        aria-label={`Mark ${block.title} as exhausted`}
                        title="I did what I could today, but my body was exhausted. Preserves streak and records recovery."
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                          isExhausted
                            ? isCyber
                              ? "bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.6)] font-mono"
                              : "bg-[#F59E0B] text-black border-2 border-black shadow-[2px_2px_0px_#000]"
                            : isCyber
                            ? "bg-slate-800 text-slate-300 hover:bg-amber-950/50 hover:text-amber-300 border border-slate-700"
                            : "bg-white text-black hover:bg-amber-50 border-2 border-black shadow-[2px_2px_0px_#000]"
                        }`}
                      >
                        <span>⚡</span>
                        <span>{isExhausted ? "Exhausted" : "Exhausted"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Status Banner inside Card */}
                  {isCompleted && (
                    <div
                      className={`text-xs px-3 py-1.5 rounded-lg flex items-center justify-between ${
                        isCyber
                          ? "bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 font-mono"
                          : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                      }`}
                    >
                      <span className="flex items-center gap-1.5 font-bold">
                        <span>✓</span> Task Completed Successfully
                      </span>
                      <span className="font-bold">+{block.xp} XP Earned</span>
                    </div>
                  )}

                  {isExhausted && (
                    <div
                      className={`text-xs px-3 py-1.5 rounded-lg flex items-center justify-between ${
                        isCyber
                          ? "bg-amber-950/40 text-amber-300 border border-amber-500/30 font-mono"
                          : "bg-amber-100 text-amber-900 border border-amber-300"
                      }`}
                    >
                      <span className="flex items-center gap-1.5 font-bold">
                        <span>⚡</span> Marked as Exhausted — Recovery Logged
                      </span>
                      <span className="italic opacity-90">Streak Preserved (0 XP)</span>
                    </div>
                  )}

                  {/* Exercises Checklist */}
                  <div
                    className={`rounded-lg p-3 flex flex-col gap-2 ${
                      isCyber ? "bg-slate-900/60" : "bg-gray-50 border border-black/10"
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                      Exercises & Instructions:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {block.exercises.map((ex) => (
                        <div
                          key={ex.id}
                          className={`p-2.5 rounded-lg flex flex-col gap-0.5 ${
                            isCyber
                              ? "bg-slate-800/50 border border-slate-700/40"
                              : "bg-white border border-black/20"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-xs font-bold ${
                                isCyber ? "text-slate-100" : "text-black"
                              }`}
                            >
                              {ex.name}
                            </span>
                            {ex.reps && (
                              <span
                                className={`text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded ${
                                  isCyber ? "bg-cyan-950 text-cyan-300" : "bg-black text-white"
                                }`}
                              >
                                {ex.reps}
                              </span>
                            )}
                            {ex.duration && !ex.reps && (
                              <span
                                className={`text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded ${
                                  isCyber ? "bg-cyan-950 text-cyan-300" : "bg-black text-white"
                                }`}
                              >
                                {ex.duration}
                              </span>
                            )}
                          </div>

                          {ex.detail && (
                            <p className="text-[11px] text-slate-300 dark:text-slate-300 text-gray-700">
                              {ex.detail}
                            </p>
                          )}

                          {ex.notes && (
                            <p
                              className={`text-[10px] italic ${
                                isCyber ? "text-amber-400/90 font-mono" : "text-[#D9381E] font-medium"
                              }`}
                            >
                              Cue: {ex.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Linked Hobbies Integration Section */}
      {matchedHobbies.length > 0 && (
        <div
          className={`rounded-2xl p-4 md:p-5 flex flex-col gap-3 ${
            isCyber
              ? "bg-[rgba(10,16,32,0.85)] border border-cyan-500/30 shadow-[0_0_15px_rgba(0,245,255,0.08)]"
              : "bg-white border-2 border-black shadow-[4px_4px_0px_#000]"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🎯</span>
              <h3
                className={`text-xs font-bold uppercase tracking-wider ${
                  isCyber ? "text-cyan-400 font-mono" : "text-black"
                }`}
              >
                Connected Hobbies & Disciplines
              </h3>
            </div>
            <Link
              href="/hobbies"
              className={`text-xs font-bold hover:underline flex items-center gap-1 ${
                isCyber ? "text-cyan-400 font-mono" : "text-black"
              }`}
            >
              Open Hobbies →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {matchedHobbies.map((hobby) => (
              <div
                key={hobby.id}
                className={`p-3 rounded-xl flex flex-col gap-2 ${
                  isCyber
                    ? "bg-slate-900/70 border border-slate-700/60"
                    : "bg-[#FFFDE8] border-2 border-black shadow-[2px_2px_0px_#000]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      isCyber ? "text-slate-100" : "text-black"
                    }`}
                  >
                    {hobby.name}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      isCyber ? "bg-cyan-950 text-cyan-300" : "bg-black text-white"
                    }`}
                  >
                    Lv.{hobby.level}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-400">Progression</span>
                    <span className="font-mono font-bold">{hobby.progress.toFixed(1)}%</span>
                  </div>
                  <div
                    className={`h-2 w-full rounded-full overflow-hidden ${
                      isCyber ? "bg-slate-800" : "bg-gray-200"
                    }`}
                  >
                    <div
                      className={`h-full ${isCyber ? "bg-cyan-400" : "bg-black"}`}
                      style={{ width: `${Math.min(100, hobby.progress)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-gray-400">
                  <span>Streak: 🔥 {hobby.streak}d</span>
                  <span>XP: {hobby.xp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
