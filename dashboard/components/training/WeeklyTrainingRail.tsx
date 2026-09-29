"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import {
  WEEKLY_TRAINING_SCHEDULE,
  TrainingDay,
} from "@/lib/data/trainingSchedule";
import { TrainingSessionEntry } from "@/lib/store/dashboardStore";

interface WeeklyTrainingRailProps {
  selectedDayId: string;
  todayDayId: string;
  sessions: TrainingSessionEntry[];
  onSelectDay: (dayId: string) => void;
}

export function WeeklyTrainingRail({
  selectedDayId,
  todayDayId,
  sessions,
  onSelectDay,
}: WeeklyTrainingRailProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const getDayStatus = (day: TrainingDay) => {
    if (day.isRestDay) {
      return { label: "REST", icon: "🛌", type: "rest" as const };
    }

    const session = sessions.find((s) => s.dayId === day.id);
    if (!session) {
      return { label: "PLAN", icon: "○", type: "not_started" as const };
    }

    if (session.status === "COMPLETED") {
      return { label: "DONE", icon: "✓", type: "completed" as const };
    }
    if (session.status === "RECOVERY_COMPLETE" || session.status === "EXHAUSTED") {
      return { label: "REC", icon: "⚡", type: "exhausted" as const };
    }
    if (session.status === "IN_PROGRESS") {
      return { label: "PROG", icon: "⏳", type: "in_progress" as const };
    }
    return { label: "PLAN", icon: "○", type: "not_started" as const };
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span
          className={`text-[11px] font-black uppercase tracking-wider ${
            isCyber ? "text-cyan-400 font-mono" : "text-black"
          }`}
        >
          Weekly Training Rail
        </span>
        <span className="text-[10px] text-gray-400 font-medium">
          Select any day to inspect plan
        </span>
      </div>

      {/* Horizontal Rail Container */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {WEEKLY_TRAINING_SCHEDULE.map((day) => {
          const isToday = day.id === todayDayId;
          const isSelected = day.id === selectedDayId;
          const status = getDayStatus(day);

          return (
            <motion.button
              key={day.id}
              type="button"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectDay(day.id)}
              className={`relative px-3 py-2.5 rounded-xl transition-all duration-200 text-left flex flex-col justify-between min-h-[72px] cursor-pointer ${
                isSelected
                  ? isCyber
                    ? "bg-slate-900 border-2 border-cyan-400 shadow-[0_0_15px_rgba(0,245,255,0.35)] ring-1 ring-cyan-400/40"
                    : "bg-[#FFE600] border-2.5 border-black shadow-[3px_3px_0px_#000]"
                  : isToday
                  ? isCyber
                    ? "bg-slate-900/90 border-2 border-cyan-500/60 shadow-[0_0_10px_rgba(0,245,255,0.15)]"
                    : "bg-[#FFFDE8] border-2 border-black shadow-[2px_2px_0px_#000]"
                  : isCyber
                  ? "bg-slate-950/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/50"
                  : "bg-white border border-black/40 hover:border-black shadow-[1px_1px_0px_#000]"
              }`}
            >
              {/* Today Tag Pill */}
              {isToday && (
                <span
                  className={`absolute -top-2 right-2 px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider ${
                    isCyber
                      ? "bg-cyan-500 text-black font-mono shadow-[0_0_8px_rgba(0,245,255,0.7)]"
                      : "bg-[#D9381E] text-white border border-black"
                  }`}
                >
                  TODAY
                </span>
              )}

              {/* Day Header Row */}
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-xs font-black uppercase tracking-wider ${
                    isSelected
                      ? isCyber
                        ? "text-cyan-300 font-mono"
                        : "text-black"
                      : isCyber
                      ? "text-slate-300 font-mono"
                      : "text-black"
                  }`}
                >
                  {day.short}
                </span>

                {/* Status Indicator */}
                <span
                  className={`text-[10px] font-bold flex items-center gap-0.5 ${
                    status.type === "completed"
                      ? "text-emerald-400"
                      : status.type === "exhausted"
                      ? "text-amber-400"
                      : status.type === "rest"
                      ? "text-purple-400"
                      : status.type === "in_progress"
                      ? "text-cyan-400"
                      : "text-gray-400"
                  }`}
                >
                  <span>{status.icon}</span>
                  <span className="text-[9px]">{status.label}</span>
                </span>
              </div>

              {/* Short Discipline Label */}
              <div className="mt-1">
                <p
                  className={`text-[11px] font-bold truncate leading-tight ${
                    isCyber ? "text-slate-200" : "text-black"
                  }`}
                >
                  {day.isRestDay ? "Rest & Reset" : day.categories[0] || day.title}
                </p>
                <span className="text-[9px] text-gray-400 block truncate">
                  {day.isRestDay ? "Biological Reset" : day.estimatedDuration}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
