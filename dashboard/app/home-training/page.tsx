"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useTheme } from "@/lib/theme";
import { useDashboardStore, TrainingSessionEntry } from "@/lib/store/dashboardStore";
import {
  WEEKLY_TRAINING_SCHEDULE,
  getTodayTrainingDay,
  getTodayDateString,
  TrainingDay,
  getTotalDayXp,
} from "@/lib/data/trainingSchedule";
import { TrainingQuoteCard } from "@/components/training/TrainingQuoteCard";
import { WeeklyScheduleOverview } from "@/components/training/WeeklyScheduleOverview";
import { DailyTrainingDetail } from "@/components/training/DailyTrainingDetail";
import { TrainingConsistencyCard } from "@/components/training/TrainingConsistencyCard";
import { TrainingHistoryView } from "@/components/training/TrainingHistoryView";

export default function HomeTrainingPage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const {
    trainingSessions,
    saveTrainingSession,
    hobbySkills,
    isHydrated,
  } = useDashboardStore();

  const todayDay = useMemo(() => getTodayTrainingDay(), []);
  const todayDateKey = useMemo(() => getTodayDateString(), []);

  const [selectedDayId, setSelectedDayId] = useState<string>(todayDay.id);

  const selectedDay = useMemo(() => {
    return (
      WEEKLY_TRAINING_SCHEDULE.find((d) => d.id === selectedDayId) || todayDay
    );
  }, [selectedDayId, todayDay]);

  // Find session for the selected day — prefer today's dateKey if selected day is today, or most recent session for that day
  const currentSession = useMemo(() => {
    if (selectedDay.id === todayDay.id) {
      return trainingSessions.find((s) => s.dateKey === todayDateKey);
    }
    return trainingSessions.find((s) => s.dayId === selectedDay.id);
  }, [trainingSessions, selectedDay.id, todayDay.id, todayDateKey]);

  // Update block state (COMPLETED, EXHAUSTED, or PENDING)
  const handleUpdateBlockState = useCallback(
    async (
      dayId: string,
      blockId: string,
      newState: "PENDING" | "COMPLETED" | "EXHAUSTED"
    ) => {
      const targetDay =
        WEEKLY_TRAINING_SCHEDULE.find((d) => d.id === dayId) || selectedDay;

      // Current session lists
      const existingCompleted = currentSession?.completedBlocks || [];
      const existingExhausted = currentSession?.exhaustedBlocks || [];

      let nextCompleted = [...existingCompleted];
      let nextExhausted = [...existingExhausted];

      if (newState === "COMPLETED") {
        if (!nextCompleted.includes(blockId)) nextCompleted.push(blockId);
        nextExhausted = nextExhausted.filter((id) => id !== blockId);
      } else if (newState === "EXHAUSTED") {
        if (!nextExhausted.includes(blockId)) nextExhausted.push(blockId);
        nextCompleted = nextCompleted.filter((id) => id !== blockId);
      } else {
        // PENDING
        nextCompleted = nextCompleted.filter((id) => id !== blockId);
        nextExhausted = nextExhausted.filter((id) => id !== blockId);
      }

      // Idempotent XP calculation from canonical schedule
      const xpEarned = targetDay.blocks
        .filter((b) => nextCompleted.includes(b.id))
        .reduce((sum, b) => sum + b.xp, 0);

      // Determine day status
      const requiredBlocks = targetDay.blocks.filter((b) => b.required);
      const allRequiredCompleted =
        requiredBlocks.length > 0 &&
        requiredBlocks.every((b) => nextCompleted.includes(b.id));
      const allRequiredAddressed =
        requiredBlocks.length > 0 &&
        requiredBlocks.every(
          (b) => nextCompleted.includes(b.id) || nextExhausted.includes(b.id)
        );

      let status = "NOT_STARTED";
      if (allRequiredCompleted) {
        status = "COMPLETED";
      } else if (allRequiredAddressed) {
        status = nextExhausted.length > 0 ? "RECOVERY_COMPLETE" : "COMPLETED";
      } else if (nextCompleted.length > 0 || nextExhausted.length > 0) {
        status = "IN_PROGRESS";
      }

      // Date key is today's date if training today, or previous session dateKey
      const dateKey =
        selectedDay.id === todayDay.id
          ? todayDateKey
          : currentSession?.dateKey || todayDateKey;

      await saveTrainingSession({
        dayId: targetDay.id,
        dateKey,
        status,
        completedBlocks: nextCompleted,
        exhaustedBlocks: nextExhausted,
        xpEarned,
      });
    },
    [selectedDay, currentSession, todayDay.id, todayDateKey, saveTrainingSession]
  );

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Hub Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥋</span>
              <h1
                className={`text-2xl md:text-3xl font-black tracking-tight ${
                  isCyber ? "text-white" : "text-black"
                }`}
              >
                Home Training Hub
              </h1>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  isCyber
                    ? "bg-cyan-950 text-cyan-400 border border-cyan-500/40"
                    : "bg-black text-[#FFE600]"
                }`}
              >
                MISC / TRAINING
              </span>
            </div>
            <p
              className={`text-xs md:text-sm ${
                isCyber ? "text-slate-400 font-mono" : "text-gray-600"
              }`}
            >
              Adaptive daily discipline · Shadowboxing, kicking mechanics, upper/lower strength & recovery.
            </p>
          </div>

          {/* Today Indicator Pill */}
          <div
            className={`p-3 rounded-xl flex items-center gap-3 self-start sm:self-auto ${
              isCyber
                ? "bg-slate-900/80 border border-cyan-500/30"
                : "bg-white border-2 border-black shadow-[3px_3px_0px_#000]"
            }`}
          >
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-gray-400">
                Today&apos;s Focus
              </span>
              <span
                className={`text-xs font-black ${
                  isCyber ? "text-cyan-300 font-mono" : "text-black"
                }`}
              >
                {todayDay.label} · {todayDay.title}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedDayId(todayDay.id)}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                selectedDayId === todayDay.id
                  ? isCyber
                    ? "bg-cyan-500 text-black font-mono shadow-[0_0_10px_rgba(0,245,255,0.4)]"
                    : "bg-black text-white"
                  : isCyber
                  ? "bg-slate-800 text-cyan-400 hover:bg-slate-700"
                  : "bg-gray-100 text-black hover:bg-gray-200"
              }`}
            >
              View Today
            </button>
          </div>
        </div>

        {/* Top Widgets: Motivational Quotes & Consistency Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TrainingQuoteCard />
          <TrainingConsistencyCard sessions={trainingSessions} />
        </div>

        {/* Weekly Schedule Overview */}
        <WeeklyScheduleOverview
          selectedDayId={selectedDayId}
          onSelectDay={(dayId) => setSelectedDayId(dayId)}
          todayDayId={todayDay.id}
          sessions={trainingSessions}
        />

        {/* Selected Day Training Details */}
        <DailyTrainingDetail
          day={selectedDay}
          todayDayId={todayDay.id}
          todayDateKey={todayDateKey}
          currentSession={currentSession}
          onSelectDay={(dayId) => setSelectedDayId(dayId)}
          onUpdateBlockState={handleUpdateBlockState}
          hobbySkills={hobbySkills}
        />

        {/* Training Log History */}
        <TrainingHistoryView
          sessions={trainingSessions}
          onSelectDay={(dayId) => setSelectedDayId(dayId)}
        />
      </div>
    </AppShell>
  );
}
