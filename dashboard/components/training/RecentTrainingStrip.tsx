"use client";

import React, { useState } from "react";
import { useTheme } from "@/lib/theme";
import { TrainingSessionEntry } from "@/lib/store/dashboardStore";
import {
  WEEKLY_TRAINING_SCHEDULE,
  getTotalDayXp,
} from "@/lib/data/trainingSchedule";
import { TrainingHistoryModal } from "@/components/training/TrainingHistoryModal";

interface RecentTrainingStripProps {
  sessions: TrainingSessionEntry[];
  onSelectDay?: (dayId: string) => void;
}

export function RecentTrainingStrip({
  sessions,
  onSelectDay,
}: RecentTrainingStripProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  // Take the most recent 3 sessions for compact presentation
  const recentSessions = sessions.slice(0, 3);

  return (
    <div
      className={`rounded-2xl p-5 sm:p-6 flex flex-col gap-4 transition-all ${
        isCyber
          ? "bg-[rgba(8,14,32,0.85)] border border-cyan-500/30 text-slate-100 shadow-[0_0_25px_rgba(0,245,255,0.06)] backdrop-blur-md"
          : "bg-[#FFFDF8] border-2 border-black text-black shadow-[4px_4px_0px_#000]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">📜</span>
          <h4
            className={`text-xs font-black uppercase tracking-wider ${
              isCyber ? "text-cyan-400 font-mono" : "text-black"
            }`}
          >
            Recent Training Activity
          </h4>
        </div>

        {sessions.length > 0 && (
          <button
            type="button"
            onClick={() => setHistoryModalOpen(true)}
            className={`text-xs font-bold transition-all flex items-center gap-1 cursor-pointer hover:underline ${
              isCyber ? "text-cyan-300 font-mono" : "text-black font-semibold"
            }`}
          >
            <span>View All ({sessions.length})</span>
            <span>→</span>
          </button>
        )}
      </div>

      {/* Content */}
      {recentSessions.length === 0 ? (
        <div className="py-6 text-center flex flex-col items-center justify-center gap-1 text-xs text-gray-400">
          <span className="text-xl">🥋</span>
          <p className="font-semibold text-slate-300 dark:text-slate-300 text-gray-700">
            No past training sessions recorded yet
          </p>
          <p className="text-[11px] text-gray-500">
            Check off exercises or log recovery in today&apos;s workout to start building your log.
          </p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-black/5 dark:divide-white/5">
          {recentSessions.map((session) => {
            const dayDef = WEEKLY_TRAINING_SCHEDULE.find((d) => d.id === session.dayId);
            const totalAvailXp = dayDef ? getTotalDayXp(dayDef) : session.xpEarned;
            const completedCount = session.completedBlocks?.length || 0;
            const exhaustedCount = session.exhaustedBlocks?.length || 0;

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
                  }
                }}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 cursor-pointer group hover:bg-black/5 dark:hover:bg-white/5 px-2 rounded-lg transition-colors"
              >
                {/* Left: Date + Workout Title */}
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      isCyber ? "bg-slate-800 text-cyan-300" : "bg-black text-white"
                    }`}
                  >
                    {session.dateKey}
                  </span>

                  <div>
                    <span className="font-bold text-xs sm:text-sm">
                      {dayDef ? `${dayDef.label} · ${dayDef.title}` : session.dayId}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                      <span className="text-emerald-400 font-semibold">
                        ✓ {completedCount} Done
                      </span>
                      {exhaustedCount > 0 && (
                        <span className="text-amber-400 font-semibold">
                          ⚡ {exhaustedCount} Rec
                        </span>
                      )}
                      {session.durationMin && (
                        <span>⏱️ {session.durationMin}m</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: XP + Status */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    +{session.xpEarned} XP
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
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
                      ? "Recovery"
                      : "In Progress"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full History Pop-Out Modal */}
      <TrainingHistoryModal
        isOpen={historyModalOpen}
        sessions={sessions}
        onClose={() => setHistoryModalOpen(false)}
        onSelectDay={onSelectDay}
      />
    </div>
  );
}
