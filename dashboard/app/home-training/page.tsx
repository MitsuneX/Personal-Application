"use client";

import React, { useState, useMemo, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import {
  WEEKLY_TRAINING_SCHEDULE,
  getTodayTrainingDay,
  getTodayDateString,
  TrainingDay,
} from "@/lib/data/trainingSchedule";
import { TodayHeroSection } from "@/components/training/TodayHeroSection";
import { WeeklyTrainingRail } from "@/components/training/WeeklyTrainingRail";
import { SessionTimelineView } from "@/components/training/SessionTimelineView";
import { SundayRestExperience } from "@/components/training/SundayRestExperience";
import { RecentTrainingStrip } from "@/components/training/RecentTrainingStrip";
import { TrainingConsistencyStrip } from "@/components/training/TrainingConsistencyStrip";
import { TrainingQuoteRibbon } from "@/components/training/TrainingQuoteRibbon";

export default function HomeTrainingPage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const {
    trainingSessions,
    saveTrainingSession,
    hobbySkills,
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

  // Smooth scroll down to timeline
  const handleScrollToTimeline = useCallback(() => {
    const el = document.getElementById("session-timeline");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Update block state (COMPLETED, EXHAUSTED, or PENDING)
  const handleUpdateBlockState = useCallback(
    async (
      dayId: string,
      blockId: string,
      newState: "PENDING" | "COMPLETED" | "EXHAUSTED"
    ) => {
      const targetDay =
        WEEKLY_TRAINING_SCHEDULE.find((d) => d.id === dayId) || selectedDay;

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-7">
        {/* 1. Page Header / Command Context */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 dark:border-white/10 pb-4">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥋</span>
              <h1
                className={`text-2xl sm:text-3xl font-black tracking-tight ${
                  isCyber ? "text-white" : "text-black"
                }`}
              >
                Home Training
              </h1>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  isCyber
                    ? "bg-cyan-950 text-cyan-300 border border-cyan-500/40"
                    : "bg-black text-[#FFE600]"
                }`}
              >
                COMMAND CENTER
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              Adaptive martial arts & strength progression · Zero-failure recovery logging
            </p>
          </div>

          {/* Current Date & Active Streak Context */}
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`px-3 py-1 rounded-xl font-bold font-mono ${
                isCyber
                  ? "bg-slate-900 border border-slate-800 text-slate-300"
                  : "bg-white border border-black/30 text-gray-800"
              }`}
            >
              📅 {todayDateKey}
            </span>
          </div>
        </div>

        {/* 2. Today's Training Hero + Progress Panel */}
        <TodayHeroSection
          day={selectedDay}
          todayDay={todayDay}
          todayDateKey={todayDateKey}
          currentSession={currentSession}
          hobbySkills={hobbySkills}
          onScrollToTimeline={handleScrollToTimeline}
          onSelectToday={() => setSelectedDayId(todayDay.id)}
          onSelectDay={(dayId) => setSelectedDayId(dayId)}
        />

        {/* 3. Weekly Training Rail (Navigation) */}
        <WeeklyTrainingRail
          selectedDayId={selectedDayId}
          todayDayId={todayDay.id}
          sessions={trainingSessions}
          onSelectDay={(dayId) => setSelectedDayId(dayId)}
        />

        {/* 4. Active Session Display: Guided Timeline or Sunday Rest Experience */}
        {selectedDay.isRestDay ? (
          <SundayRestExperience day={selectedDay} />
        ) : (
          <SessionTimelineView
            day={selectedDay}
            currentSession={currentSession}
            onUpdateBlockState={handleUpdateBlockState}
          />
        )}

        {/* 5. Lower Supporting Grid: Recent Activity & Consistency */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
          <RecentTrainingStrip
            sessions={trainingSessions}
            onSelectDay={(dayId) => setSelectedDayId(dayId)}
          />
          <TrainingConsistencyStrip sessions={trainingSessions} />
        </div>

        {/* 6. Atmospheric Training Mantra Ribbon */}
        <div className="pt-1">
          <TrainingQuoteRibbon />
        </div>
      </div>
    </AppShell>
  );
}
