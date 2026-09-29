"use client";

import React, { useMemo } from "react";
import { useTheme } from "@/lib/theme";
import { TrainingSessionEntry } from "@/lib/store/dashboardStore";

interface TrainingConsistencyStripProps {
  sessions: TrainingSessionEntry[];
}

export function TrainingConsistencyStrip({ sessions }: TrainingConsistencyStripProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const stats = useMemo(() => {
    let completedCount = 0;
    let recoveryCount = 0;
    let totalXp = 0;

    sessions.forEach((s) => {
      if (s.status === "COMPLETED") {
        completedCount++;
      } else if (
        s.status === "RECOVERY_COMPLETE" ||
        s.status === "EXHAUSTED" ||
        (s.exhaustedBlocks && s.exhaustedBlocks.length > 0)
      ) {
        recoveryCount++;
      }
      totalXp += s.xpEarned || 0;
    });

    // Compute streak backwards from today
    // Sunday does not break streak
    // Completed or Recovery days preserve/continue streak
    let streak = 0;
    const now = new Date();

    for (let i = 0; i < 60; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(now.getDate() - i);
      const dateKey = checkDate.toISOString().slice(0, 10);
      const dayOfWeek = checkDate.getDay(); // 0 = Sunday

      const session = sessions.find((s) => s.dateKey === dateKey);
      const isEngaged =
        session &&
        (session.status === "COMPLETED" ||
          session.status === "RECOVERY_COMPLETE" ||
          session.status === "EXHAUSTED" ||
          (session.completedBlocks && session.completedBlocks.length > 0) ||
          (session.exhaustedBlocks && session.exhaustedBlocks.length > 0));

      if (dayOfWeek === 0) {
        // Sunday: Rest day — does NOT break streak
        continue;
      }

      if (isEngaged) {
        streak++;
      } else {
        if (i === 0) {
          continue;
        }
        break;
      }
    }

    return {
      streak,
      completedCount,
      recoveryCount,
      totalXp,
    };
  }, [sessions]);

  return (
    <div
      className={`rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-4 transition-all ${
        isCyber
          ? "bg-[rgba(8,14,32,0.85)] border border-cyan-500/30 text-slate-100 shadow-[0_0_25px_rgba(0,245,255,0.06)] backdrop-blur-md"
          : "bg-[#FFFDF8] border-2 border-black text-black shadow-[4px_4px_0px_#000]"
      }`}
    >
      <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">🔥</span>
          <h4
            className={`text-xs font-black uppercase tracking-wider ${
              isCyber ? "text-cyan-400 font-mono" : "text-black"
            }`}
          >
            Habit Consistency & XP
          </h4>
        </div>
        <span className="text-[10px] font-mono text-gray-400">
          Sunday rest preserved
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-center">
        {/* Streak */}
        <div
          className={`p-3 rounded-xl flex flex-col items-center justify-center ${
            isCyber ? "bg-slate-900/60 border border-slate-800" : "bg-white border border-black/20"
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-gray-400">Active Streak</span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-base">🔥</span>
            <span
              className={`text-lg font-black ${
                isCyber ? "text-amber-400 font-mono" : "text-[#D9381E]"
              }`}
            >
              {stats.streak} {stats.streak === 1 ? "Day" : "Days"}
            </span>
          </div>
        </div>

        {/* Total Training XP */}
        <div
          className={`p-3 rounded-xl flex flex-col items-center justify-center ${
            isCyber ? "bg-slate-900/60 border border-slate-800" : "bg-white border border-black/20"
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-gray-400">Total Training XP</span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-base">⭐</span>
            <span
              className={`text-lg font-black ${
                isCyber ? "text-cyan-400 font-mono" : "text-black"
              }`}
            >
              +{stats.totalXp}
            </span>
          </div>
        </div>

        {/* Completed Routines */}
        <div
          className={`p-3 rounded-xl flex flex-col items-center justify-center ${
            isCyber ? "bg-slate-900/60 border border-slate-800" : "bg-white border border-black/20"
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-gray-400">Full Routines</span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-emerald-400 font-bold">✓</span>
            <span
              className={`text-base font-black ${
                isCyber ? "text-emerald-400 font-mono" : "text-[#10B981]"
              }`}
            >
              {stats.completedCount}
            </span>
          </div>
        </div>

        {/* Recovery Logged */}
        <div
          className={`p-3 rounded-xl flex flex-col items-center justify-center ${
            isCyber ? "bg-slate-900/60 border border-slate-800" : "bg-white border border-black/20"
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-gray-400">Recovery Days</span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-amber-400 font-bold">⚡</span>
            <span
              className={`text-base font-black ${
                isCyber ? "text-amber-400 font-mono" : "text-[#F59E0B]"
              }`}
            >
              {stats.recoveryCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
