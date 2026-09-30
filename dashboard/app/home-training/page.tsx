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
import { SessionTimerWidget } from "@/components/training/SessionTimerWidget";
import { ExerciseTimerModal } from "@/components/training/ExerciseTimerModal";
import { TrainingCustomizerModal } from "@/components/training/TrainingCustomizerModal";

export default function HomeTrainingPage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const {
    trainingSessions,
    saveTrainingSession,
    hobbySkills,
    customTrainingPlans,
    saveCustomTrainingPlan,
    resetCustomTrainingPlan,
  } = useDashboardStore();

  const todayDay = useMemo(() => getTodayTrainingDay(), []);
  const todayDateKey = useMemo(() => getTodayDateString(), []);

  const [selectedDayId, setSelectedDayId] = useState<string>(todayDay.id);

  // Modals state
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [timerModal, setTimerModal] = useState<{
    isOpen: boolean;
    title: string;
    subtitle?: string;
    initialSeconds: number;
  }>({
    isOpen: false,
    title: "",
    initialSeconds: 45,
  });

  // Session-only override state for temporary today adjustments
  const [sessionOnlyOverrides, setSessionOnlyOverrides] = useState<Record<string, TrainingDay>>({});

  // Canonical baseline day
  const canonicalDay = useMemo(() => {
    return (
      WEEKLY_TRAINING_SCHEDULE.find((d) => d.id === selectedDayId) || todayDay
    );
  }, [selectedDayId, todayDay]);

  const isDayCustomized = Boolean(
    customTrainingPlans[selectedDayId] || sessionOnlyOverrides[selectedDayId]
  );

  // Effective Day: Session-only override > Saved custom plan > Canonical schedule
  const effectiveDay: TrainingDay = useMemo(() => {
    if (sessionOnlyOverrides[selectedDayId]) {
      return sessionOnlyOverrides[selectedDayId];
    }
    const custom = customTrainingPlans[selectedDayId];
    if (custom && custom.blocks && custom.blocks.length > 0) {
      return {
        ...canonicalDay,
        ...custom,
        blocks: custom.blocks,
      };
    }
    return canonicalDay;
  }, [selectedDayId, sessionOnlyOverrides, customTrainingPlans, canonicalDay]);

  // Find session for the selected day — prefer today's dateKey if selected day is today, or most recent session for that day
  const currentSession = useMemo(() => {
    if (effectiveDay.id === todayDay.id) {
      return trainingSessions.find((s) => s.dateKey === todayDateKey);
    }
    return trainingSessions.find((s) => s.dayId === effectiveDay.id);
  }, [trainingSessions, effectiveDay.id, todayDay.id, todayDateKey]);

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
      const targetDay = effectiveDay;

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

      // Idempotent XP calculation from active schedule
      const xpEarned = targetDay.blocks
        .filter((b) => nextCompleted.includes(b.id))
        .reduce((sum, b) => sum + (b.xp || 0), 0);

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
        effectiveDay.id === todayDay.id
          ? todayDateKey
          : currentSession?.dateKey || todayDateKey;

      // Save training session with historical snapshot of the exact routine at this time
      await saveTrainingSession({
        dayId: targetDay.id,
        dateKey,
        status,
        completedBlocks: nextCompleted,
        exhaustedBlocks: nextExhausted,
        xpEarned,
        sessionSnapshot: targetDay,
      });
    },
    [effectiveDay, currentSession, todayDay.id, todayDateKey, saveTrainingSession]
  );

  const handleStartTimer = (title: string, duration?: string) => {
    let secs = 45;
    if (duration) {
      const minM = duration.match(/(\d+)\s*(?:min|minute)/i);
      if (minM) secs = parseInt(minM[1], 10) * 60;
      const secM = duration.match(/(\d+)\s*(?:sec|second|s\b)/i);
      if (secM) secs = parseInt(secM[1], 10);
    }
    setTimerModal({
      isOpen: true,
      title,
      subtitle: duration ? `Target: ${duration}` : undefined,
      initialSeconds: secs,
    });
  };

  const handleSaveCustomPlan = async (customDay: TrainingDay, isSessionOnly: boolean) => {
    if (isSessionOnly) {
      setSessionOnlyOverrides((prev) => ({
        ...prev,
        [customDay.id]: customDay,
      }));
    } else {
      // Clear session-only override if user saves as permanent
      setSessionOnlyOverrides((prev) => {
        const next = { ...prev };
        delete next[customDay.id];
        return next;
      });
      await saveCustomTrainingPlan(customDay.id, customDay);
    }
  };

  const handleResetCustomPlan = async () => {
    setSessionOnlyOverrides((prev) => {
      const next = { ...prev };
      delete next[selectedDayId];
      return next;
    });
    await resetCustomTrainingPlan(selectedDayId);
  };

  const handleFinishSessionWithDuration = async (durationMin: number) => {
    const dateKey =
      effectiveDay.id === todayDay.id
        ? todayDateKey
        : currentSession?.dateKey || todayDateKey;

    await saveTrainingSession({
      dayId: effectiveDay.id,
      dateKey,
      status: currentSession?.status || "IN_PROGRESS",
      completedBlocks: currentSession?.completedBlocks || [],
      exhaustedBlocks: currentSession?.exhaustedBlocks || [],
      xpEarned: currentSession?.xpEarned || 0,
      durationMin,
      sessionSnapshot: effectiveDay,
    });
  };

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

          {/* Header Action Tools */}
          <div className="flex items-center gap-2.5 flex-wrap text-xs">
            <button
              type="button"
              onClick={() =>
                setTimerModal({
                  isOpen: true,
                  title: "Custom Activity Timer",
                  subtitle: "Deep Stretch / Extra Conditioning",
                  initialSeconds: 300,
                })
              }
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                isCyber
                  ? "bg-slate-900 border border-slate-700 text-cyan-300 hover:border-cyan-400"
                  : "bg-white border-2 border-black text-black shadow-[2px_2px_0px_#000]"
              }`}
            >
              <span>⏱️</span>
              <span>+ Custom Timer</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCustomizerOpen(true)}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                isCyber
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 hover:bg-cyan-500/30"
                  : "bg-[#FFE17D] hover:bg-amber-300 text-black border-2 border-black shadow-[2px_2px_0px_#000]"
              }`}
            >
              <span>⚙️</span>
              <span>Customize Training</span>
            </button>

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

        {/* Global Live Session Timer Widget */}
        <SessionTimerWidget
          day={effectiveDay}
          todayDateKey={todayDateKey}
          onFinishSession={handleFinishSessionWithDuration}
        />

        {/* 2. Today's Training Hero + Progress Panel */}
        <TodayHeroSection
          day={effectiveDay}
          todayDay={todayDay}
          todayDateKey={todayDateKey}
          currentSession={currentSession}
          hobbySkills={hobbySkills}
          onScrollToTimeline={handleScrollToTimeline}
          onSelectToday={() => setSelectedDayId(todayDay.id)}
          onSelectDay={(dayId) => setSelectedDayId(dayId)}
          onCustomize={() => setIsCustomizerOpen(true)}
        />

        {/* 3. Weekly Training Rail (Navigation) */}
        <WeeklyTrainingRail
          selectedDayId={selectedDayId}
          todayDayId={todayDay.id}
          sessions={trainingSessions}
          onSelectDay={(dayId) => setSelectedDayId(dayId)}
        />

        {/* 4. Active Session Display: Guided Timeline or Sunday Rest Experience */}
        {effectiveDay.isRestDay ? (
          <SundayRestExperience day={effectiveDay} />
        ) : (
          <SessionTimelineView
            day={effectiveDay}
            currentSession={currentSession}
            onUpdateBlockState={handleUpdateBlockState}
            onStartTimer={handleStartTimer}
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

      {/* Training Customizer Modal */}
      <TrainingCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        day={effectiveDay}
        canonicalDay={canonicalDay}
        isCustomized={isDayCustomized}
        onSavePlan={handleSaveCustomPlan}
        onResetToDefault={handleResetCustomPlan}
      />

      {/* Individual Exercise / Custom Timer Modal */}
      <ExerciseTimerModal
        isOpen={timerModal.isOpen}
        onClose={() => setTimerModal({ ...timerModal, isOpen: false })}
        title={timerModal.title}
        subtitle={timerModal.subtitle}
        initialSeconds={timerModal.initialSeconds}
      />
    </AppShell>
  );
}

