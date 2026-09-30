"use client";

import React, { useState } from "react";
import { useTheme } from "@/lib/theme";
import { TrainingSessionEntry } from "@/lib/store/dashboardStore";
import {
  WEEKLY_TRAINING_SCHEDULE,
  getTotalDayXp,
} from "@/lib/data/trainingSchedule";

interface TrainingHistoryViewProps {
  sessions: TrainingSessionEntry[];
  onSelectDay?: (dayId: string) => void;
}

export function TrainingHistoryView({
  sessions,
  onSelectDay,
}: TrainingHistoryViewProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const [filter, setFilter] = useState<"ALL" | "COMPLETED" | "RECOVERY">("ALL");

  const filteredSessions = sessions.filter((s) => {
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
    <div
      className={`rounded-2xl p-4 md:p-5 flex flex-col gap-4 transition-all ${
        isCyber
          ? "bg-[rgba(10,16,32,0.85)] border border-cyan-500/30 shadow-[0_0_20px_rgba(0,245,255,0.08)] backdrop-blur-md"
          : "bg-[#FFFDF8] border-2 border-black shadow-[4px_4px_0px_#000]"
      }`}
    >
      {/* Header and Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">📜</span>
          <h3
            className={`text-xs font-bold uppercase tracking-wider ${
              isCyber ? "text-cyan-400 font-mono" : "text-black"
            }`}
          >
            Training Log History ({sessions.length})
          </h3>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {(["ALL", "COMPLETED", "RECOVERY"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                filter === tab
                  ? isCyber
                    ? "bg-cyan-500 text-black font-mono shadow-[0_0_10px_rgba(0,245,255,0.4)]"
                    : "bg-black text-white"
                  : isCyber
                  ? "bg-slate-800 text-slate-400 hover:text-slate-200"
                  : "bg-white text-gray-700 border border-black/20 hover:bg-gray-100"
              }`}
            >
              {tab === "ALL" ? "All Sessions" : tab === "COMPLETED" ? "Completed" : "Recovery"}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <div
          className={`rounded-xl p-8 text-center flex flex-col items-center justify-center gap-2 ${
            isCyber ? "bg-slate-900/50 border border-slate-800" : "bg-white border border-black/10"
          }`}
        >
          <span className="text-3xl">🥋</span>
          <p
            className={`text-sm font-bold ${
              isCyber ? "text-slate-300" : "text-gray-800"
            }`}
          >
            No training sessions logged yet
          </p>
          <p className="text-xs text-gray-500 max-w-sm">
            Check off exercises or log recovery in today&apos;s workout to start recording your training history.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
          {filteredSessions.map((session) => {
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
                onClick={() => onSelectDay && session.dayId && onSelectDay(session.dayId)}
                className={`p-3.5 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer ${
                  isCyber
                    ? "bg-slate-900/60 border border-slate-700/60 hover:border-cyan-500/50 hover:bg-slate-900/90"
                    : "bg-white border-2 border-black/80 shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000]"
                }`}
              >
                {/* Left: Date & Title */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                        isCyber ? "bg-slate-800 text-cyan-300" : "bg-black text-white"
                      }`}
                    >
                      {session.dateKey}
                    </span>
                    <span
                      className={`text-xs font-black uppercase tracking-wider ${
                        isCyber ? "text-slate-100" : "text-black"
                      }`}
                    >
                      {dayDef ? `${dayDef.label} · ${dayDef.title}` : session.dayId}
                    </span>
                  </div>

                  {/* Task counts */}
                  <div className="flex items-center gap-2.5 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <span>✓</span> {completedCount} Completed
                    </span>
                    {exhaustedCount > 0 && (
                      <span className="flex items-center gap-1 text-amber-400 font-semibold">
                        <span>⚡</span> {exhaustedCount} Exhausted
                      </span>
                    )}
                    {session.note && (
                      <span className="italic truncate max-w-[200px] text-slate-400">
                        “{session.note}”
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: XP & Status Pill */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="flex flex-col items-end">
                    <span
                      className={`text-xs font-mono font-bold ${
                        isCyber ? "text-cyan-400" : "text-black"
                      }`}
                    >
                      {session.xpEarned} / {totalAvailXp} XP
                    </span>
                    <span className="text-[10px] text-gray-400">{percent}% progress</span>
                  </div>

                  <span
                    className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
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
                      ? "Recovery Complete"
                      : "In Progress"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
