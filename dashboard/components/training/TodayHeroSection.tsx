"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { TrainingDay, getTotalDayXp } from "@/lib/data/trainingSchedule";
import { TrainingSessionEntry, HobbySkillEntry } from "@/lib/store/dashboardStore";
import Link from "next/link";
import { ConnectedHobbyModal } from "@/components/training/ConnectedHobbyModal";

interface TodayHeroSectionProps {
  day: TrainingDay;
  todayDay: TrainingDay;
  todayDateKey: string;
  currentSession?: TrainingSessionEntry;
  hobbySkills: HobbySkillEntry[];
  onScrollToTimeline: () => void;
  onSelectToday: () => void;
  onSelectDay?: (dayId: string) => void;
}

export function TodayHeroSection({
  day,
  todayDay,
  todayDateKey,
  currentSession,
  hobbySkills,
  onScrollToTimeline,
  onSelectToday,
  onSelectDay,
}: TodayHeroSectionProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const [inspectingHobby, setInspectingHobby] = useState<HobbySkillEntry | null>(null);

  const isViewingToday = day.id === todayDay.id;

  const totalAvailableXp = getTotalDayXp(day);
  const completedBlocks = currentSession?.completedBlocks || [];
  const exhaustedBlocks = currentSession?.exhaustedBlocks || [];

  const earnedXp = day.blocks
    .filter((b) => completedBlocks.includes(b.id))
    .reduce((sum, b) => sum + b.xp, 0);

  const xpPercent =
    totalAvailableXp > 0
      ? Math.min(100, Math.round((earnedXp / totalAvailableXp) * 100))
      : 0;

  const requiredBlocks = day.blocks.filter((b) => b.required);
  const totalRequired = requiredBlocks.length;
  const completedCount = requiredBlocks.filter((b) =>
    completedBlocks.includes(b.id)
  ).length;
  const exhaustedCount = requiredBlocks.filter((b) =>
    exhaustedBlocks.includes(b.id)
  ).length;
  const pendingCount = Math.max(0, totalRequired - completedCount - exhaustedCount);

  let statusLabel = "Not Started";
  let statusColor = isCyber ? "text-slate-400 bg-slate-800/60" : "text-gray-600 bg-gray-100";

  if (day.isRestDay) {
    statusLabel = "Rest & Reset Day";
    statusColor = isCyber ? "text-purple-400 bg-purple-950/60 border border-purple-500/30" : "text-purple-900 bg-purple-100 border border-purple-300";
  } else if (completedCount === totalRequired && totalRequired > 0) {
    statusLabel = "Session Fully Completed";
    statusColor = isCyber ? "text-emerald-400 bg-emerald-950/60 border border-emerald-500/40" : "text-emerald-900 bg-emerald-100 border border-emerald-300";
  } else if (completedCount + exhaustedCount === totalRequired && totalRequired > 0) {
    statusLabel = "Recovery Complete";
    statusColor = isCyber ? "text-amber-400 bg-amber-950/60 border border-amber-500/40" : "text-amber-900 bg-amber-100 border border-amber-300";
  } else if (completedCount > 0 || exhaustedCount > 0) {
    statusLabel = `In Progress (${completedCount + exhaustedCount}/${totalRequired})`;
    statusColor = isCyber ? "text-cyan-400 bg-cyan-950/60 border border-cyan-500/40" : "text-blue-900 bg-blue-100 border border-blue-300";
  }

  // Connected hobbies lookup
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

  return (
    <div
      className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
        isCyber
          ? "bg-[linear-gradient(135deg,rgba(8,16,38,0.95),rgba(4,10,24,0.98))] border border-cyan-500/40 shadow-[0_0_35px_rgba(0,245,255,0.12)] text-white backdrop-blur-md"
          : "bg-[#FFFDF8] border-3 border-black text-black shadow-[6px_6px_0px_#000]"
      }`}
    >
      {/* Cyber Subtle Glow Aura in background */}
      {isCyber && (
        <>
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/8 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {/* Viewing Other Day Banner Notice */}
      {!isViewingToday && (
        <div
          className={`px-6 py-2 flex items-center justify-between text-xs font-bold border-b ${
            isCyber
              ? "bg-cyan-950/50 border-cyan-500/30 text-cyan-300 font-mono"
              : "bg-[#FFE600] border-black text-black"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span>You are viewing {day.label}&apos;s schedule ({day.title}). Today is {todayDay.label}.</span>
          </div>
          <button
            type="button"
            onClick={onSelectToday}
            className={`px-2.5 py-0.5 rounded text-[11px] font-black uppercase transition-all cursor-pointer ${
              isCyber
                ? "bg-cyan-500 text-black hover:bg-cyan-400"
                : "bg-black text-white hover:bg-[#D9381E]"
            }`}
          >
            Switch to Today →
          </button>
        </div>
      )}

      <div className="p-6 sm:p-8 flex flex-col lg:flex-row gap-6 lg:items-center justify-between">
        {/* Left Hero Content */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Overline Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded ${
                isViewingToday
                  ? isCyber
                    ? "bg-cyan-500 text-black font-mono shadow-[0_0_12px_rgba(0,245,255,0.6)]"
                    : "bg-[#D9381E] text-white border border-black"
                  : isCyber
                  ? "bg-slate-800 text-slate-300 font-mono"
                  : "bg-black text-white"
              }`}
            >
              {isViewingToday ? "TODAY'S COMMAND" : `${day.label.toUpperCase()} PLAN`}
            </span>

            <span
              className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${statusColor}`}
            >
              {statusLabel}
            </span>

            {day.categories.map((cat) => (
              <span
                key={cat}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                  isCyber
                    ? "bg-slate-900/80 text-slate-300 border border-slate-700/60"
                    : "bg-white text-black border border-black/30"
                }`}
              >
                {cat}
              </span>
            ))}
          </div>

          {/* Workout Title */}
          <div>
            <h2
              className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight ${
                isCyber ? "text-white" : "text-black"
              }`}
            >
              {day.title}
            </h2>
            <p
              className={`text-xs sm:text-sm mt-1 max-w-xl ${
                isCyber ? "text-slate-300" : "text-gray-700"
              }`}
            >
              {day.subtitle}
            </p>
          </div>

          {/* Metrics Strip */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap pt-1 text-xs">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="text-base">⏱️</span>
              <span className={isCyber ? "text-cyan-300 font-mono" : "text-black"}>
                {day.estimatedDuration}
              </span>
            </span>

            <span className="text-gray-500">•</span>

            <span className="flex items-center gap-1.5 font-bold">
              <span className="text-base">🥊</span>
              <span className={isCyber ? "text-slate-200" : "text-black"}>
                {day.blocks.length} Training Blocks
              </span>
            </span>

            {!day.isRestDay && (
              <>
                <span className="text-gray-500">•</span>
                <span className="flex items-center gap-1.5 font-bold">
                  <span className="text-base">⚡</span>
                  <span className={isCyber ? "text-emerald-400 font-mono" : "text-[#10B981]"}>
                    +{totalAvailableXp} Available XP
                  </span>
                </span>
              </>
            )}
          </div>

          {/* Connected Hobbies Badges */}
          {matchedHobbies.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Connected Hobbies:
              </span>
              {matchedHobbies.map((hobby) => (
                <button
                  key={hobby.id}
                  type="button"
                  onClick={() => setInspectingHobby(hobby)}
                  title={`Inspect ${hobby.name} level & connected training`}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isCyber
                      ? "bg-slate-900/80 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400"
                      : "bg-[#FFFDE8] hover:bg-[#FFE600] text-black border border-black/80 shadow-[2px_2px_0px_#000]"
                  }`}
                >
                  <span>🎯 {hobby.name}</span>
                  <span className="text-[10px] opacity-75 font-mono">Lv.{hobby.level}</span>
                  <span className="text-[10px] opacity-50">ℹ️</span>
                </button>
              ))}
            </div>
          )}

          {/* Primary Action Button */}
          {!day.isRestDay && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onScrollToTimeline}
                className={`px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 ${
                  isCyber
                    ? "bg-cyan-500 hover:bg-cyan-400 text-black font-mono shadow-[0_0_20px_rgba(0,245,255,0.4)]"
                    : "bg-[#FFE600] hover:bg-[#FFD700] text-black border-2 border-black shadow-[4px_4px_0px_#000]"
                }`}
              >
                <span>{completedCount > 0 ? "Continue Session" : "Start Guided Timeline"}</span>
                <span>↓</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Progress Card */}
        {!day.isRestDay ? (
          <div
            className={`w-full lg:w-72 rounded-xl p-5 flex flex-col justify-between gap-4 self-stretch ${
              isCyber
                ? "bg-[rgba(10,18,42,0.8)] border border-cyan-500/30"
                : "bg-white border-2 border-black shadow-[3px_3px_0px_#000]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Session Completion
              </span>
              <span
                className={`text-lg font-black font-mono ${
                  isCyber ? "text-cyan-400" : "text-black"
                }`}
              >
                {xpPercent}%
              </span>
            </div>

            {/* Custom Sleek Bar */}
            <div className="flex flex-col gap-1.5">
              <div
                className={`h-2.5 w-full rounded-full overflow-hidden ${
                  isCyber ? "bg-slate-800" : "bg-gray-200"
                }`}
              >
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    xpPercent === 100
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
                  style={{ width: `${xpPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">XP Progress</span>
                <span className="font-mono font-bold">
                  {earnedXp} / {totalAvailableXp} XP
                </span>
              </div>
            </div>

            {/* Task Breakdown Chips */}
            <div className="pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1 text-emerald-400 font-bold">
                <span>✓</span>
                <span>{completedCount} Done</span>
              </div>
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <span>⚡</span>
                <span>{exhaustedCount} Rec</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400 font-medium">
                <span>○</span>
                <span>{pendingCount} Left</span>
              </div>
            </div>
          </div>
        ) : (
          /* Sunday Rest Notice */
          <div
            className={`w-full lg:w-72 rounded-xl p-5 flex flex-col justify-center items-center text-center gap-2 self-stretch ${
              isCyber
                ? "bg-purple-950/40 border border-purple-500/30"
                : "bg-purple-50 border-2 border-purple-900/30"
            }`}
          >
            <span className="text-3xl">🧘</span>
            <span className="text-xs font-black uppercase tracking-wider text-purple-400">
              Active Recovery
            </span>
            <p className="text-xs text-slate-300 dark:text-slate-300 text-gray-700">
              Zero workout load today. Nutrition & biological repair prioritized.
            </p>
          </div>
        )}
      </div>

      {/* Pop-out Connected Hobby Modal */}
      {inspectingHobby && (
        <ConnectedHobbyModal
          isOpen={!!inspectingHobby}
          hobby={inspectingHobby}
          onClose={() => setInspectingHobby(null)}
          onSelectDay={onSelectDay}
        />
      )}
    </div>
  );
}
