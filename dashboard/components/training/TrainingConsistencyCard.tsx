"use client";

import React, { useMemo } from "react";
import { useTheme } from "@/lib/theme";
import { TrainingSessionEntry } from "@/lib/store/dashboardStore";
import { WEEKLY_TRAINING_SCHEDULE } from "@/lib/data/trainingSchedule";

interface TrainingConsistencyCardProps {
  sessions: TrainingSessionEntry[];
}

export function TrainingConsistencyCard({ sessions }: TrainingConsistencyCardProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const stats = useMemo(() => {
    let completedCount = 0;
    let recoveryCount = 0;
    let totalXp = 0;

    sessions.forEach((s) => {
      if (s.status === "COMPLETED") {
        completedCount++;
      } else if (s.status === "RECOVERY_COMPLETE" || s.status === "EXHAUSTED" || (s.exhaustedBlocks && s.exhaustedBlocks.length > 0)) {
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

      // Check if there is an engaged session on this date
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
        // If it's today and not yet finished, don't break streak yet
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
      totalEngagements: completedCount + recoveryCount,
      totalXp,
    };
  }, [sessions]);

  return (
    <div
      className={`rounded-2xl p-4 md:p-5 flex flex-col justify-between gap-4 transition-all ${
        isCyber
          ? "bg-[rgba(10,16,32,0.85)] border border-cyan-500/30 shadow-[0_0_20px_rgba(0,245,255,0.08)] backdrop-blur-md"
          : "bg-[#FFFDF8] border-2 border-black shadow-[4px_4px_0px_#000]"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔥</span>
          <h3
            className={`text-xs font-bold uppercase tracking-wider ${
              isCyber ? "text-cyan-400 font-mono" : "text-black"
            }`}
          >
            Consistency & Progress
          </h3>
        </div>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
            isCyber ? "bg-slate-800 text-cyan-300 font-mono" : "bg-black text-[#FFE600]"
          }`}
        >
          Adaptive Habit
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Streak */}
        <div
          className={`p-3 rounded-xl flex flex-col items-center justify-center ${
            isCyber
              ? "bg-slate-900/70 border border-slate-700/60"
              : "bg-white border-2 border-black shadow-[2px_2px_0px_#000]"
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-gray-400">Current Streak</span>
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
          <span className="text-[9px] text-gray-400 mt-0.5">Sun rest preserved</span>
        </div>

        {/* Completed Sessions */}
        <div
          className={`p-3 rounded-xl flex flex-col items-center justify-center ${
            isCyber
              ? "bg-slate-900/70 border border-slate-700/60"
              : "bg-white border-2 border-black shadow-[2px_2px_0px_#000]"
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-gray-400">Fully Completed</span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-base text-emerald-400 font-bold">✓</span>
            <span
              className={`text-lg font-black ${
                isCyber ? "text-emerald-400 font-mono" : "text-[#10B981]"
              }`}
            >
              {stats.completedCount}
            </span>
          </div>
          <span className="text-[9px] text-gray-400 mt-0.5">Full routines</span>
        </div>

        {/* Recovery / Exhausted Logged */}
        <div
          className={`p-3 rounded-xl flex flex-col items-center justify-center ${
            isCyber
              ? "bg-slate-900/70 border border-slate-700/60"
              : "bg-white border-2 border-black shadow-[2px_2px_0px_#000]"
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-gray-400">Recovery Logged</span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-base text-amber-400 font-bold">⚡</span>
            <span
              className={`text-lg font-black ${
                isCyber ? "text-amber-400 font-mono" : "text-[#F59E0B]"
              }`}
            >
              {stats.recoveryCount}
            </span>
          </div>
          <span className="text-[9px] text-gray-400 mt-0.5">Honored fatigue</span>
        </div>

        {/* Total Training XP */}
        <div
          className={`p-3 rounded-xl flex flex-col items-center justify-center ${
            isCyber
              ? "bg-slate-900/70 border border-slate-700/60"
              : "bg-white border-2 border-black shadow-[2px_2px_0px_#000]"
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-gray-400">Training XP</span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-base">⭐</span>
            <span
              className={`text-lg font-black ${
                isCyber ? "text-cyan-400 font-mono" : "text-black"
              }`}
            >
              {stats.totalXp}
            </span>
          </div>
          <span className="text-[9px] text-gray-400 mt-0.5">All-time earned</span>
        </div>
      </div>
    </div>
  );
}
