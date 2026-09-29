"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import {
  WEEKLY_TRAINING_SCHEDULE,
  TrainingDay,
  getTotalDayXp,
} from "@/lib/data/trainingSchedule";
import { TrainingSessionEntry } from "@/lib/store/dashboardStore";

interface WeeklyScheduleOverviewProps {
  selectedDayId: string;
  onSelectDay: (dayId: string) => void;
  todayDayId: string;
  sessions: TrainingSessionEntry[];
}

export function WeeklyScheduleOverview({
  selectedDayId,
  onSelectDay,
  todayDayId,
  sessions,
}: WeeklyScheduleOverviewProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  // Map each day to its session status
  const getDayStatus = (day: TrainingDay) => {
    if (day.isRestDay) {
      return { label: "Rest & Reset", type: "rest" as const, color: "#8B5CF6" };
    }

    // Look for a session for this day in today's week
    const session = sessions.find((s) => s.dayId === day.id);
    if (!session) {
      return { label: "Not Started", type: "not_started" as const, color: "#94A3B8" };
    }

    if (session.status === "COMPLETED") {
      return { label: "Completed", type: "completed" as const, color: "#10B981" };
    }
    if (session.status === "RECOVERY_COMPLETE" || session.status === "EXHAUSTED") {
      return { label: "Recovery Complete", type: "exhausted" as const, color: "#F59E0B" };
    }
    if (session.status === "IN_PROGRESS") {
      return { label: "In Progress", type: "in_progress" as const, color: "#06B6D4" };
    }
    return { label: "Not Started", type: "not_started" as const, color: "#94A3B8" };
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">📅</span>
          <h2
            className={`text-base font-bold uppercase tracking-wider ${
              isCyber ? "text-cyan-400 font-mono" : "text-black"
            }`}
          >
            Weekly Schedule
          </h2>
        </div>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded ${
            isCyber ? "bg-slate-800 text-slate-300 font-mono" : "bg-black text-white"
          }`}
        >
          7-Day Routine
        </span>
      </div>

      {/* Grid of 7 Day Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {WEEKLY_TRAINING_SCHEDULE.map((day) => {
          const isToday = day.id === todayDayId;
          const isSelected = day.id === selectedDayId;
          const status = getDayStatus(day);
          const totalXp = getTotalDayXp(day);

          return (
            <motion.button
              key={day.id}
              type="button"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectDay(day.id)}
              className={`relative text-left p-3 rounded-xl transition-all duration-200 flex flex-col justify-between min-h-[135px] cursor-pointer ${
                isSelected
                  ? isCyber
                    ? "bg-[rgba(15,25,50,0.95)] border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,245,255,0.4)] ring-2 ring-cyan-500/20"
                    : "bg-[#FFE600] border-3 border-black shadow-[5px_5px_0px_#000]"
                  : isToday
                  ? isCyber
                    ? "bg-[rgba(12,20,40,0.85)] border-2 border-cyan-500/60 shadow-[0_0_15px_rgba(0,245,255,0.2)]"
                    : "bg-[#FFFDE8] border-2 border-black shadow-[3px_3px_0px_#000]"
                  : isCyber
                  ? "bg-[rgba(10,16,32,0.6)] border border-slate-700/50 hover:border-slate-500/70 hover:bg-[rgba(15,22,44,0.7)]"
                  : "bg-white border-2 border-black/80 shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000]"
              }`}
            >
              {/* Today Badge */}
              {isToday && (
                <div
                  className={`absolute -top-2.5 left-3 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    isCyber
                      ? "bg-cyan-500 text-black shadow-[0_0_10px_rgba(0,245,255,0.6)] font-mono animate-pulse"
                      : "bg-[#D9381E] text-white border border-black"
                  }`}
                >
                  TODAY
                </div>
              )}

              {/* Day Header */}
              <div className="flex items-center justify-between gap-1 w-full mt-1">
                <span
                  className={`text-xs font-black uppercase tracking-wider ${
                    isSelected
                      ? isCyber
                        ? "text-cyan-300"
                        : "text-black"
                      : isCyber
                      ? "text-slate-300"
                      : "text-black"
                  }`}
                >
                  {day.short}
                </span>

                {day.isRestDay ? (
                  <span className="text-xs">🛌</span>
                ) : status.type === "completed" ? (
                  <span className="text-xs text-emerald-400 font-bold">✓</span>
                ) : status.type === "exhausted" ? (
                  <span className="text-xs text-amber-400 font-bold">⚡</span>
                ) : null}
              </div>

              {/* Title & Duration */}
              <div className="my-1.5 flex flex-col gap-0.5">
                <p
                  className={`text-xs font-bold leading-tight line-clamp-2 ${
                    isCyber ? "text-slate-100" : "text-black"
                  }`}
                >
                  {day.title}
                </p>
                <span
                  className={`text-[10px] ${
                    isCyber ? "text-slate-400 font-mono" : "text-gray-600 font-medium"
                  }`}
                >
                  {day.isRestDay ? "Intentional Reset" : day.estimatedDuration}
                </span>
              </div>

              {/* Footer: XP & Status Pill */}
              <div className="mt-auto pt-1 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[10px]">
                {!day.isRestDay && totalXp > 0 ? (
                  <span
                    className={`font-semibold ${
                      isCyber ? "text-cyan-400 font-mono" : "text-black"
                    }`}
                  >
                    +{totalXp} XP
                  </span>
                ) : (
                  <span className="italic text-slate-400">Recovery</span>
                )}

                {/* Status indicator dot or pill */}
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    status.type === "completed"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : status.type === "exhausted"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                      : status.type === "in_progress"
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                      : status.type === "rest"
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/40"
                      : "bg-slate-700/40 text-slate-400"
                  }`}
                >
                  {status.label}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
