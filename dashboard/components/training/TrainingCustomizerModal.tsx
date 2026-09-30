"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { OverlayPortal } from "@/components/ui/OverlayPortal";
import {
  TrainingDay,
  TrainingBlock,
  TrainingExercise,
  TrainingBlockType,
} from "@/lib/data/trainingSchedule";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/lib/context/ConfirmContext";

interface TrainingCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: TrainingDay;
  canonicalDay: TrainingDay;
  isCustomized: boolean;
  onSavePlan: (customDay: TrainingDay, isSessionOnly: boolean) => Promise<void>;
  onResetToDefault: () => Promise<void>;
}

export function TrainingCustomizerModal({
  isOpen,
  onClose,
  day,
  canonicalDay,
  isCustomized,
  onSavePlan,
  onResetToDefault,
}: TrainingCustomizerModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const toast = useToast();
  const { confirm } = useConfirm();

  // Working copy of day plan
  const [workingDay, setWorkingDay] = useState<TrainingDay>(() => JSON.parse(JSON.stringify(day)));
  const [selectedBlockIdx, setSelectedBlockIdx] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  // Exercise editor modal/drawer state
  const [editingExercise, setEditingExercise] = useState<{
    blockIdx: number;
    exIdx: number;
    data: TrainingExercise;
  } | null>(null);

  // Block editor state
  const [editingBlock, setEditingBlock] = useState<{
    blockIdx: number;
    data: TrainingBlock;
  } | null>(null);

  // Synchronize working day on open
  useEffect(() => {
    if (isOpen) {
      setWorkingDay(JSON.parse(JSON.stringify(day)));
      setSelectedBlockIdx(0);
      setEditingExercise(null);
      setEditingBlock(null);
    }
  }, [isOpen, day]);

  if (!isOpen) return null;

  const currentBlock = workingDay.blocks[selectedBlockIdx] || workingDay.blocks[0];

  // ── Block Manipulations ──
  const handleMoveBlock = (index: number, direction: "up" | "down") => {
    const newIdx = direction === "up" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= workingDay.blocks.length) return;

    const newBlocks = [...workingDay.blocks];
    const [moved] = newBlocks.splice(index, 1);
    newBlocks.splice(newIdx, 0, moved);

    setWorkingDay({ ...workingDay, blocks: newBlocks });
    setSelectedBlockIdx(newIdx);
  };

  const handleAddBlock = () => {
    const newBlock: TrainingBlock = {
      id: `custom_block_${Date.now()}`,
      title: "New Training Block",
      type: "strength",
      duration: "5 minutes",
      xp: 25,
      required: true,
      exercises: [
        {
          id: `custom_ex_${Date.now()}`,
          name: "Exercise 1",
          duration: "45 seconds",
          notes: "Focus on form and controlled pacing",
        },
      ],
    };

    const newBlocks = [...workingDay.blocks, newBlock];
    setWorkingDay({ ...workingDay, blocks: newBlocks });
    setSelectedBlockIdx(newBlocks.length - 1);
  };

  const handleDeleteBlock = (index: number) => {
    if (workingDay.blocks.length <= 1) {
      toast.warning("A training day must have at least one block.");
      return;
    }

    const newBlocks = workingDay.blocks.filter((_, i) => i !== index);
    setWorkingDay({ ...workingDay, blocks: newBlocks });
    setSelectedBlockIdx(Math.max(0, index - 1));
  };

  // ── Exercise Manipulations ──
  const handleMoveExercise = (blockIdx: number, exIdx: number, direction: "up" | "down") => {
    const targetBlock = workingDay.blocks[blockIdx];
    if (!targetBlock) return;

    const newExIdx = direction === "up" ? exIdx - 1 : exIdx + 1;
    if (newExIdx < 0 || newExIdx >= targetBlock.exercises.length) return;

    const newExercises = [...targetBlock.exercises];
    const [moved] = newExercises.splice(exIdx, 1);
    newExercises.splice(newExIdx, 0, moved);

    const newBlocks = [...workingDay.blocks];
    newBlocks[blockIdx] = { ...targetBlock, exercises: newExercises };
    setWorkingDay({ ...workingDay, blocks: newBlocks });
  };

  const handleAddExercise = (blockIdx: number) => {
    const targetBlock = workingDay.blocks[blockIdx];
    if (!targetBlock) return;

    const newEx: TrainingExercise = {
      id: `custom_ex_${Date.now()}`,
      name: "New Exercise",
      reps: "10-12",
      notes: "Steady breathing",
    };

    const newBlocks = [...workingDay.blocks];
    newBlocks[blockIdx] = {
      ...targetBlock,
      exercises: [...targetBlock.exercises, newEx],
    };
    setWorkingDay({ ...workingDay, blocks: newBlocks });
  };

  const handleDeleteExercise = (blockIdx: number, exIdx: number) => {
    const targetBlock = workingDay.blocks[blockIdx];
    if (!targetBlock) return;

    const newExercises = targetBlock.exercises.filter((_, i) => i !== exIdx);
    const newBlocks = [...workingDay.blocks];
    newBlocks[blockIdx] = { ...targetBlock, exercises: newExercises };
    setWorkingDay({ ...workingDay, blocks: newBlocks });
  };

  // ── Save & Reset Handlers ──
  const handleSave = async (isSessionOnly: boolean) => {
    setIsSaving(true);
    try {
      await onSavePlan(workingDay, isSessionOnly);
      toast.success(
        isSessionOnly
          ? "Applied to today's active session!"
          : `Customized routine saved for ${workingDay.label}s!`
      );
      onClose();
    } catch {
      toast.error("Failed to save training plan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    confirm({
      title: "Reset Schedule to Default",
      message: `Restore the canonical default training routine for ${day.label}? This will not remove your completed training history.`,
      confirmText: "Reset to Default",
      cancelText: "Keep Custom Routine",
      variant: "warning",
      actionType: "restore",
      onConfirm: async () => {
        setIsSaving(true);
        try {
          await onResetToDefault();
          toast.success(`Reset ${day.label} to default routine.`);
          onClose();
        } catch {
          toast.error("Failed to reset schedule.");
        } finally {
          setIsSaving(false);
        }
      },
    });
  };

  return (
    <OverlayPortal>
      <div className="fixed inset-0 z-[320] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className={`w-full max-w-5xl h-[92vh] max-h-[920px] rounded-2xl flex flex-col shadow-2xl overflow-hidden ${
            isCyber
              ? "bg-[#090e21] border border-cyan-500/50 shadow-[0_0_50px_rgba(0,245,255,0.2)] text-slate-100"
              : "bg-[#FFFDF0] border-4 border-black shadow-[10px_10px_0px_#000] text-black"
          }`}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b flex items-center justify-between gap-4 border-slate-700/50">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚙️</span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className={`text-lg font-black tracking-tight ${isCyber ? "font-mono text-cyan-300" : "text-black"}`}>
                    Customize {workingDay.label} Training Routine
                  </h2>
                  {isCustomized && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30">
                      User Customized
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Reorder, add, or edit blocks and exercises. Default routine remains safe in archive.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isCustomized && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                >
                  ↺ Reset to Default
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm hover:opacity-75"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Builder Body: Two Columns */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
            {/* Left Column: Blocks Manager */}
            <div className="md:col-span-5 border-r border-slate-700/40 p-4 sm:p-5 flex flex-col gap-3 overflow-y-auto">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">
                  Training Blocks ({workingDay.blocks.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddBlock}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                    isCyber
                      ? "bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/30"
                      : "bg-[#FFE17D] border-2 border-black text-black shadow-[2px_2px_0px_#000]"
                  }`}
                >
                  + Add Block
                </button>
              </div>

              {/* Blocks List */}
              <div className="flex flex-col gap-2.5">
                {workingDay.blocks.map((block, idx) => {
                  const isSelected = selectedBlockIdx === idx;
                  return (
                    <div
                      key={block.id || idx}
                      onClick={() => setSelectedBlockIdx(idx)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? isCyber
                            ? "bg-cyan-500/15 border-cyan-400 shadow-[0_0_15px_rgba(0,245,255,0.2)] text-white"
                            : "bg-[#FFE600] border-2 border-black shadow-[3px_3px_0px_#000] text-black"
                          : isCyber
                          ? "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                          : "bg-white border-2 border-gray-300 text-gray-800"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold opacity-60">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-sm truncate">{block.title}</span>
                          {!block.required && (
                            <span className="text-[9px] uppercase px-1 rounded bg-slate-700/60 text-slate-300">
                              Optional
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] opacity-70 flex gap-2 mt-0.5 font-mono">
                          <span>{block.exercises.length} exercises</span>
                          <span>•</span>
                          <span>{block.duration || "5 min"}</span>
                          <span>•</span>
                          <span>+{block.xp} XP</span>
                        </div>
                      </div>

                      {/* Reorder Buttons (Accessible Drag Fallback) */}
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveBlock(idx, "up")}
                          title="Move Block Up"
                          className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold disabled:opacity-30 hover:bg-black/10 dark:hover:bg-white/10"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          disabled={idx === workingDay.blocks.length - 1}
                          onClick={() => handleMoveBlock(idx, "down")}
                          title="Move Block Down"
                          className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold disabled:opacity-30 hover:bg-black/10 dark:hover:bg-white/10"
                        >
                          ▼
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingBlock({ blockIdx: idx, data: { ...block } })}
                          title="Edit Block Settings"
                          className="w-6 h-6 rounded flex items-center justify-center text-xs hover:bg-black/10 dark:hover:bg-white/10"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBlock(idx)}
                          title="Delete Block"
                          className="w-6 h-6 rounded flex items-center justify-center text-xs text-red-400 hover:bg-red-500/20"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Exercises Manager inside Selected Block */}
            <div className="md:col-span-7 p-4 sm:p-6 flex flex-col gap-4 overflow-y-auto">
              {currentBlock ? (
                <>
                  <div className="flex items-center justify-between border-b pb-3 border-slate-700/40">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold uppercase text-cyan-400">
                          Selected Block:
                        </span>
                        <h3 className="text-base font-bold">{currentBlock.title}</h3>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Manage individual exercises, reps, durations, and cues for this block.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddExercise(selectedBlockIdx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                        isCyber
                          ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,245,255,0.3)] hover:bg-cyan-400"
                          : "bg-[#00F5FF] text-black border-2 border-black shadow-[2px_2px_0px_#000]"
                      }`}
                    >
                      <span>+ Add Exercise</span>
                    </button>
                  </div>

                  {/* Exercises List inside Block */}
                  <div className="flex flex-col gap-3">
                    {currentBlock.exercises.map((ex, exIdx) => (
                      <div
                        key={ex.id || exIdx}
                        className={`p-3.5 rounded-xl border flex flex-col gap-2 transition-all ${
                          isCyber
                            ? "bg-slate-900/60 border-slate-800 text-slate-200"
                            : "bg-white border-2 border-black shadow-[2px_2px_0px_#000] text-black"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm">{ex.name}</span>
                              {ex.reps && (
                                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                                  {ex.reps}
                                </span>
                              )}
                              {ex.duration && (
                                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                  ⏱️ {ex.duration}
                                </span>
                              )}
                              {ex.rest && (
                                <span className="text-xs font-mono text-amber-400">
                                  Rest: {ex.rest}
                                </span>
                              )}
                            </div>

                            {ex.notes && (
                              <p className="text-xs text-amber-400/90 italic mt-1 font-mono">
                                💡 {ex.notes}
                              </p>
                            )}
                          </div>

                          {/* Exercise Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              disabled={exIdx === 0}
                              onClick={() => handleMoveExercise(selectedBlockIdx, exIdx, "up")}
                              title="Move Exercise Up"
                              className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold disabled:opacity-30 hover:bg-black/10 dark:hover:bg-white/10"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              disabled={exIdx === currentBlock.exercises.length - 1}
                              onClick={() => handleMoveExercise(selectedBlockIdx, exIdx, "down")}
                              title="Move Exercise Down"
                              className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold disabled:opacity-30 hover:bg-black/10 dark:hover:bg-white/10"
                            >
                              ▼
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingExercise({ blockIdx: selectedBlockIdx, exIdx, data: { ...ex } })}
                              title="Edit Exercise"
                              className="w-6 h-6 rounded flex items-center justify-center text-xs hover:bg-black/10 dark:hover:bg-white/10"
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteExercise(selectedBlockIdx, exIdx)}
                              title="Delete Exercise"
                              className="w-6 h-6 rounded flex items-center justify-center text-xs text-red-400 hover:bg-red-500/20"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {currentBlock.exercises.length === 0 && (
                      <p className="text-xs text-gray-400 italic py-4 text-center">
                        No exercises in this block yet. Click &quot;+ Add Exercise&quot; above.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
                  Select a block to manage its exercises.
                </div>
              )}
            </div>
          </div>

          {/* Footer Save Bar */}
          <div className="px-6 py-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-slate-700/50 bg-slate-950/40">
            <span className="text-xs text-gray-400 font-mono">
              Save as your weekly {workingDay.label} schedule or apply for today&apos;s session only.
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold border opacity-70 hover:opacity-100 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSave(true)}
                title="Apply modifications only to today's active session without altering weekly routine"
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                  isCyber
                    ? "bg-slate-800 text-cyan-300 hover:bg-slate-700 border border-cyan-500/40"
                    : "bg-white text-black border-2 border-black shadow-[2px_2px_0px_#000]"
                }`}
              >
                {isSaving ? "Saving..." : "Apply to Today Only"}
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSave(false)}
                title="Save as permanent customized routine for this training day"
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  isCyber
                    ? "bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(0,245,255,0.4)]"
                    : "bg-[#00F5FF] hover:bg-[#FFE17D] text-black border-2 border-black shadow-[3px_3px_0px_#000]"
                }`}
              >
                {isSaving ? "Saving..." : `Save ${workingDay.label} Routine`}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Nested Exercise Edit Sub-Modal */}
        <AnimatePresence>
          {editingExercise && (
            <div className="fixed inset-0 z-[360] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`w-full max-w-md p-6 rounded-2xl ${
                  isCyber
                    ? "bg-[#0d1326] border border-cyan-500/50 shadow-2xl text-white"
                    : "bg-[#FFFDF8] border-3 border-black shadow-[6px_6px_0px_#000] text-black"
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base font-bold">Edit Exercise</h4>
                  <button
                    type="button"
                    onClick={() => setEditingExercise(null)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold mb-1">Exercise Name:</label>
                    <input
                      type="text"
                      value={editingExercise.data.name}
                      onChange={(e) =>
                        setEditingExercise({
                          ...editingExercise,
                          data: { ...editingExercise.data, name: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-black/20 dark:bg-white/5 border border-slate-700 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold mb-1">Target Reps:</label>
                      <input
                        type="text"
                        value={editingExercise.data.reps || ""}
                        onChange={(e) =>
                          setEditingExercise({
                            ...editingExercise,
                            data: { ...editingExercise.data, reps: e.target.value },
                          })
                        }
                        placeholder="e.g. 10-12, 15"
                        className="w-full px-3 py-2 rounded-lg bg-black/20 dark:bg-white/5 border border-slate-700 outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">Duration (Timed):</label>
                      <input
                        type="text"
                        value={editingExercise.data.duration || ""}
                        onChange={(e) =>
                          setEditingExercise({
                            ...editingExercise,
                            data: { ...editingExercise.data, duration: e.target.value },
                          })
                        }
                        placeholder="e.g. 45 seconds"
                        className="w-full px-3 py-2 rounded-lg bg-black/20 dark:bg-white/5 border border-slate-700 outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold mb-1">Rest Interval:</label>
                      <input
                        type="text"
                        value={editingExercise.data.rest || ""}
                        onChange={(e) =>
                          setEditingExercise({
                            ...editingExercise,
                            data: { ...editingExercise.data, rest: e.target.value },
                          })
                        }
                        placeholder="e.g. 30 seconds"
                        className="w-full px-3 py-2 rounded-lg bg-black/20 dark:bg-white/5 border border-slate-700 outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">Intensity:</label>
                      <input
                        type="text"
                        value={editingExercise.data.intensity || ""}
                        onChange={(e) =>
                          setEditingExercise({
                            ...editingExercise,
                            data: { ...editingExercise.data, intensity: e.target.value },
                          })
                        }
                        placeholder="e.g. Moderate, ~80%"
                        className="w-full px-3 py-2 rounded-lg bg-black/20 dark:bg-white/5 border border-slate-700 outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Technique Notes / Cues:</label>
                    <textarea
                      rows={2}
                      value={editingExercise.data.notes || ""}
                      onChange={(e) =>
                        setEditingExercise({
                          ...editingExercise,
                          data: { ...editingExercise.data, notes: e.target.value },
                        })
                      }
                      placeholder="e.g. Keep chest high, neutral wrist"
                      className="w-full px-3 py-2 rounded-lg bg-black/20 dark:bg-white/5 border border-slate-700 outline-none resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingExercise(null)}
                      className="px-3 py-1.5 rounded-lg border opacity-70"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const { blockIdx, exIdx, data } = editingExercise;
                        const newBlocks = [...workingDay.blocks];
                        newBlocks[blockIdx].exercises[exIdx] = data;
                        setWorkingDay({ ...workingDay, blocks: newBlocks });
                        setEditingExercise(null);
                      }}
                      className="px-4 py-1.5 rounded-lg font-bold bg-cyan-500 text-black"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Nested Block Edit Sub-Modal */}
        <AnimatePresence>
          {editingBlock && (
            <div className="fixed inset-0 z-[360] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`w-full max-w-md p-6 rounded-2xl ${
                  isCyber
                    ? "bg-[#0d1326] border border-cyan-500/50 shadow-2xl text-white"
                    : "bg-[#FFFDF8] border-3 border-black shadow-[6px_6px_0px_#000] text-black"
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base font-bold">Edit Block Settings</h4>
                  <button
                    type="button"
                    onClick={() => setEditingBlock(null)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold mb-1">Block Title:</label>
                    <input
                      type="text"
                      value={editingBlock.data.title}
                      onChange={(e) =>
                        setEditingBlock({
                          ...editingBlock,
                          data: { ...editingBlock.data, title: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-black/20 dark:bg-white/5 border border-slate-700 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold mb-1">Estimated Duration:</label>
                      <input
                        type="text"
                        value={editingBlock.data.duration || ""}
                        onChange={(e) =>
                          setEditingBlock({
                            ...editingBlock,
                            data: { ...editingBlock.data, duration: e.target.value },
                          })
                        }
                        placeholder="e.g. 8 minutes"
                        className="w-full px-3 py-2 rounded-lg bg-black/20 dark:bg-white/5 border border-slate-700 outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">Awarded XP:</label>
                      <input
                        type="number"
                        value={editingBlock.data.xp}
                        onChange={(e) =>
                          setEditingBlock({
                            ...editingBlock,
                            data: { ...editingBlock.data, xp: parseInt(e.target.value, 10) || 0 },
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-black/20 dark:bg-white/5 border border-slate-700 outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="block-required"
                      checked={editingBlock.data.required}
                      onChange={(e) =>
                        setEditingBlock({
                          ...editingBlock,
                          data: { ...editingBlock.data, required: e.target.checked },
                        })
                      }
                      className="w-4 h-4 accent-cyan-400"
                    />
                    <label htmlFor="block-required" className="font-bold cursor-pointer">
                      Required Block (Counts toward daily session completion)
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setEditingBlock(null)}
                      className="px-3 py-1.5 rounded-lg border opacity-70"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const { blockIdx, data } = editingBlock;
                        const newBlocks = [...workingDay.blocks];
                        newBlocks[blockIdx] = data;
                        setWorkingDay({ ...workingDay, blocks: newBlocks });
                        setEditingBlock(null);
                      }}
                      className="px-4 py-1.5 rounded-lg font-bold bg-cyan-500 text-black"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </OverlayPortal>
  );
}
