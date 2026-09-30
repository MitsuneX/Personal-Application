"use client";

import React, { useState } from "react";
import { useTheme } from "@/lib/theme";
import { TrainingDay, TrainingBlock } from "@/lib/data/trainingSchedule";
import { TrainingSessionEntry } from "@/lib/store/dashboardStore";
import { ExerciseDetailModal } from "@/components/training/ExerciseDetailModal";

interface SessionTimelineViewProps {
  day: TrainingDay;
  currentSession?: TrainingSessionEntry;
  onUpdateBlockState: (
    dayId: string,
    blockId: string,
    newState: "PENDING" | "COMPLETED" | "EXHAUSTED"
  ) => Promise<void>;
  onStartTimer?: (title: string, duration?: string) => void;
}

export function SessionTimelineView({
  day,
  currentSession,
  onUpdateBlockState,
  onStartTimer,
}: SessionTimelineViewProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const [savingBlockId, setSavingBlockId] = useState<string | null>(null);
  const [inspectingBlock, setInspectingBlock] = useState<TrainingBlock | null>(null);

  const completedBlocks = currentSession?.completedBlocks || [];
  const exhaustedBlocks = currentSession?.exhaustedBlocks || [];

  const handleToggleState = async (
    blockId: string,
    targetState: "COMPLETED" | "EXHAUSTED"
  ) => {
    if (savingBlockId) return;
    setSavingBlockId(blockId);

    const isCurrentCompleted = completedBlocks.includes(blockId);
    const isCurrentExhausted = exhaustedBlocks.includes(blockId);

    let nextState: "PENDING" | "COMPLETED" | "EXHAUSTED" = "PENDING";
    if (targetState === "COMPLETED") {
      nextState = isCurrentCompleted ? "PENDING" : "COMPLETED";
    } else {
      nextState = isCurrentExhausted ? "PENDING" : "EXHAUSTED";
    }

    try {
      await onUpdateBlockState(day.id, blockId, nextState);
    } finally {
      setSavingBlockId(null);
    }
  };

  return (
    <div id="session-timeline" className="flex flex-col gap-4">
      {/* Timeline Section Title */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-base">⚡</span>
          <h3
            className={`text-sm font-black uppercase tracking-wider ${
              isCyber ? "text-cyan-400 font-mono" : "text-black"
            }`}
          >
            Guided Workout Timeline ({day.blocks.length} Blocks)
          </h3>
        </div>

        <span className="text-[11px] text-gray-400 font-medium">
          Step-by-step training progression
        </span>
      </div>

      {/* Vertical Timeline Container */}
      <div className="relative pl-6 sm:pl-8 flex flex-col gap-6">
        {/* Continuous Connecting Rail Line */}
        <div
          className={`absolute left-3 sm:left-4 top-4 bottom-4 w-0.5 ${
            isCyber
              ? "bg-gradient-to-b from-cyan-500/50 via-slate-700 to-cyan-500/20 shadow-[0_0_8px_rgba(0,245,255,0.3)]"
              : "bg-black"
          }`}
        />

        {day.blocks.map((block, index) => {
          const stepNumber = String(index + 1).padStart(2, "0");
          const isCompleted = completedBlocks.includes(block.id);
          const isExhausted = exhaustedBlocks.includes(block.id);
          const isSaving = savingBlockId === block.id;

          return (
            <div key={block.id} className="relative flex flex-col gap-3 group">
              {/* Timeline Step Node Circle on Rail */}
              <div
                className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black transition-all ${
                  isCompleted
                    ? isCyber
                      ? "bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.8)] font-mono"
                      : "bg-[#10B981] text-white border-2 border-black"
                    : isExhausted
                    ? isCyber
                      ? "bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.8)] font-mono"
                      : "bg-[#F59E0B] text-black border-2 border-black"
                    : isCyber
                    ? "bg-slate-900 border-2 border-slate-700 text-slate-300 font-mono group-hover:border-cyan-400"
                    : "bg-white border-2 border-black text-black group-hover:bg-[#FFE600]"
                }`}
              >
                {isCompleted ? "✓" : isExhausted ? "⚡" : stepNumber}
              </div>

              {/* Block Surface Container (Selective Container, No Nested Boxes!) */}
              <div
                className={`rounded-2xl p-4 sm:p-5 transition-all duration-200 flex flex-col gap-3 ${
                  isCompleted
                    ? isCyber
                      ? "bg-[rgba(6,28,20,0.85)] border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                      : "bg-[#F0FDF4] border-2 border-black shadow-[3px_3px_0px_#000]"
                    : isExhausted
                    ? isCyber
                      ? "bg-[rgba(32,22,8,0.85)] border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
                      : "bg-[#FFFBEB] border-2 border-black shadow-[3px_3px_0px_#000]"
                    : isCyber
                    ? "bg-[rgba(10,16,36,0.7)] border border-slate-800 hover:border-slate-700"
                    : "bg-white border-2 border-black shadow-[3px_3px_0px_#000]"
                }`}
              >
                {/* Block Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 dark:border-white/10 pb-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-black uppercase font-mono px-1.5 py-0.5 rounded ${
                          isCyber ? "bg-slate-800 text-cyan-300" : "bg-black text-white"
                        }`}
                      >
                        STEP {stepNumber}
                      </span>

                      <h4
                        className={`text-base font-black tracking-tight ${
                          isCompleted
                            ? isCyber
                              ? "text-emerald-300"
                              : "text-emerald-950"
                            : isExhausted
                            ? isCyber
                              ? "text-amber-300"
                              : "text-amber-950"
                            : isCyber
                            ? "text-white"
                            : "text-black"
                        }`}
                      >
                        {block.title}
                      </h4>

                      {/* Detail Chips */}
                      {block.duration && (
                        <span className="text-[10px] font-semibold text-gray-400">
                          ⏱️ {block.duration}
                        </span>
                      )}
                      {block.rounds && (
                        <span className="text-[10px] font-semibold text-gray-400">
                          🥊 {block.rounds} Rounds
                        </span>
                      )}
                      {block.sets && (
                        <span className="text-[10px] font-semibold text-gray-400">
                          💪 {block.sets} Sets
                        </span>
                      )}
                      {block.rest && (
                        <span className="text-[10px] font-semibold text-amber-500">
                          Rest: {block.rest}
                        </span>
                      )}
                      {block.intensity && (
                        <span className="text-[10px] font-semibold text-red-400">
                          Intensity: {block.intensity}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions: Complete, Exhausted, Details */}
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    {/* Complete Button */}
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => handleToggleState(block.id, "COMPLETED")}
                      aria-label={`Mark ${block.title} completed`}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                        isCompleted
                          ? isCyber
                            ? "bg-emerald-500 text-black font-mono shadow-[0_0_12px_rgba(16,185,129,0.6)]"
                            : "bg-[#10B981] text-white border-2 border-black"
                          : isCyber
                          ? "bg-slate-800 text-slate-300 hover:bg-emerald-950/60 hover:text-emerald-300 border border-slate-700"
                          : "bg-white text-black border-2 border-black hover:bg-emerald-50 shadow-[2px_2px_0px_#000]"
                      }`}
                    >
                      <span>✓</span>
                      <span>{isCompleted ? "Done (+XP)" : "Complete"}</span>
                      <span className="text-[10px] opacity-80">+{block.xp}</span>
                    </button>

                    {/* Exhausted Button */}
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => handleToggleState(block.id, "EXHAUSTED")}
                      title="Log intentional recovery state. Preserves streak without pretending completed."
                      aria-label={`Mark ${block.title} exhausted`}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                        isExhausted
                          ? isCyber
                            ? "bg-amber-500 text-black font-mono shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                            : "bg-[#F59E0B] text-black border-2 border-black"
                          : isCyber
                          ? "bg-slate-800 text-slate-300 hover:bg-amber-950/60 hover:text-amber-300 border border-slate-700"
                          : "bg-white text-black border-2 border-black hover:bg-amber-50 shadow-[2px_2px_0px_#000]"
                      }`}
                    >
                      <span>⚡</span>
                      <span>{isExhausted ? "Recovery" : "Exhausted"}</span>
                    </button>

                    {/* Detail Pop-out Button */}
                    <button
                      type="button"
                      onClick={() => setInspectingBlock(block)}
                      title="View full exercise instructions, cues, and details"
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        isCyber
                          ? "bg-slate-800/80 text-cyan-400 hover:bg-slate-700"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-black/30"
                      }`}
                    >
                      <span>ℹ️</span>
                      <span className="hidden sm:inline">Details</span>
                    </button>
                  </div>
                </div>

                {/* Status Notice if Complete or Exhausted */}
                {isCompleted && (
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <span>✓</span> Completed successfully
                    </span>
                    <span className="font-mono">+{block.xp} XP Earned</span>
                  </div>
                )}
                {isExhausted && (
                  <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                    <span className="flex items-center gap-1.5">
                      <span>⚡</span> Marked as Exhausted · Bodily recovery honored
                    </span>
                    <span className="font-mono text-[11px] opacity-80">Streak Preserved (0 XP)</span>
                  </div>
                )}

                {/* Compact Scannable Exercise Rows (NO NESTED BOXES!) */}
                <div className="flex flex-col divide-y divide-black/5 dark:divide-white/5 pt-1">
                  {block.exercises.map((ex) => (
                    <div
                      key={ex.id}
                      onClick={() => setInspectingBlock(block)}
                      className="py-2 flex items-center justify-between gap-3 text-xs cursor-pointer group/row hover:bg-black/5 dark:hover:bg-white/5 px-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-gray-400 text-xs">○</span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`font-semibold ${
                              isCyber ? "text-slate-100" : "text-black"
                            }`}
                          >
                            {ex.name}
                          </span>
                          {ex.detail && (
                            <span className="text-gray-400 text-[11px]">
                              — {ex.detail}
                            </span>
                          )}
                          {ex.notes && (
                            <span
                              className={`text-[10px] font-medium italic ${
                                isCyber ? "text-amber-400 font-mono" : "text-[#D9381E]"
                              }`}
                            >
                              · {ex.notes}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Reps or Duration tag */}
                      <div className="shrink-0 flex items-center gap-1.5">
                        {ex.reps && (
                          <span
                            className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                              isCyber ? "bg-slate-800 text-cyan-300" : "bg-gray-100 text-black border border-black/20"
                            }`}
                          >
                            {ex.reps}
                          </span>
                        )}
                        {ex.duration && !ex.reps && (
                          <div className="flex items-center gap-1">
                            <span
                              className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                                isCyber ? "bg-slate-800 text-cyan-300" : "bg-gray-100 text-black border border-black/20"
                              }`}
                            >
                              {ex.duration}
                            </span>
                            {onStartTimer && (
                              <button
                                type="button"
                                onClick={() => onStartTimer(ex.name, ex.duration)}
                                title="Start exercise timer"
                                className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold transition-all cursor-pointer ${
                                  isCyber
                                    ? "bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-400/30"
                                    : "bg-[#FFE17D] hover:bg-amber-300 text-black border border-black shadow-[1px_1px_0px_#000]"
                                }`}
                              >
                                ⏱️
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pop-out Exercise Detail Modal */}
      {inspectingBlock && (
        <ExerciseDetailModal
          isOpen={!!inspectingBlock}
          block={inspectingBlock}
          dayLabel={day.label}
          isCompleted={completedBlocks.includes(inspectingBlock.id)}
          isExhausted={exhaustedBlocks.includes(inspectingBlock.id)}
          onClose={() => setInspectingBlock(null)}
          onToggleState={handleToggleState}
          onStartTimer={onStartTimer}
        />
      )}
    </div>
  );
}
