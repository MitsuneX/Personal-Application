"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { TrainingDay } from "@/lib/data/trainingSchedule";

interface SessionTimerWidgetProps {
  day: TrainingDay;
  todayDateKey: string;
  onFinishSession?: (durationMin: number) => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function parsePlannedSeconds(day: TrainingDay): number {
  let total = 0;
  for (const block of day.blocks) {
    if (block.duration) {
      const matchMin = block.duration.match(/(\d+)(?:-(\d+))?\s*(?:min|minute)/i);
      if (matchMin) {
        const val = matchMin[2] ? (parseInt(matchMin[1], 10) + parseInt(matchMin[2], 10)) / 2 : parseInt(matchMin[1], 10);
        total += Math.round(val * 60);
        continue;
      }
      const matchSec = block.duration.match(/(\d+)\s*(?:sec|second)/i);
      if (matchSec) {
        total += parseInt(matchSec[1], 10);
        continue;
      }
    }
    total += 300; // default 5 min per block
  }
  if (total === 0 && day.estimatedDuration) {
    const m = day.estimatedDuration.match(/(\d+)/);
    if (m) total = parseInt(m[1], 10) * 60;
  }
  return total > 0 ? total : 2580; // 43 mins
}

export function SessionTimerWidget({ day, todayDateKey, onFinishSession }: SessionTimerWidgetProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const {
    sessionTimer,
    startSessionTimer,
    pauseSessionTimer,
    resumeSessionTimer,
    resetSessionTimer,
    finishSessionTimer,
    tickSessionTimer,
  } = useDashboardStore();

  const [isExpanded, setIsExpanded] = useState(false);

  // Interval ticker that updates every 1000ms while running
  useEffect(() => {
    if (!sessionTimer.isRunning) return;

    const interval = setInterval(() => {
      tickSessionTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionTimer.isRunning, tickSessionTimer]);

  const plannedSeconds = parsePlannedSeconds(day);
  const elapsed = sessionTimer.elapsedSeconds;
  const active = sessionTimer.activeSeconds;
  const rest = Math.max(0, elapsed - active);

  const handleToggleTimer = () => {
    if (!sessionTimer.isRunning) {
      if (sessionTimer.startedAt) {
        resumeSessionTimer();
      } else {
        startSessionTimer(day.id);
      }
    } else {
      pauseSessionTimer();
    }
  };

  const handleFinish = () => {
    const totalElapsedSec = finishSessionTimer();
    const durationMin = Math.max(1, Math.round(totalElapsedSec / 60));
    if (onFinishSession) {
      onFinishSession(durationMin);
    }
  };

  if (day.isRestDay) return null;

  return (
    <div
      className={`rounded-2xl transition-all duration-200 overflow-hidden ${
        isCyber
          ? "bg-[rgba(9,15,36,0.92)] border border-cyan-500/40 shadow-[0_0_25px_rgba(0,245,255,0.12)] text-white backdrop-blur-md"
          : "bg-[#FFFDF8] border-3 border-black text-black shadow-[4px_4px_0px_#000]"
      }`}
    >
      {/* Compact Top Bar */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Title & Live Status */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
              sessionTimer.isRunning
                ? isCyber
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400 animate-pulse shadow-[0_0_15px_rgba(0,245,255,0.4)]"
                  : "bg-[#00F5FF] text-black border-2 border-black animate-pulse"
                : isCyber
                ? "bg-slate-900 border border-slate-700 text-slate-400"
                : "bg-gray-100 border-2 border-black text-black"
            }`}
          >
            ⏱️
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-black uppercase tracking-wider ${isCyber ? "text-cyan-400 font-mono" : "text-black"}`}>
                Session Timer
              </span>
              <span
                className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  sessionTimer.isRunning
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : sessionTimer.elapsedSeconds > 0
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {sessionTimer.isRunning ? "RUNNING" : sessionTimer.elapsedSeconds > 0 ? "PAUSED" : "READY"}
              </span>
            </div>
            <span className="text-[11px] text-gray-400 font-mono">
              {day.label} Training Session · Live Tracking
            </span>
          </div>
        </div>

        {/* Primary Metric Displays */}
        <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
          {/* Planned */}
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider font-bold text-gray-400">
              Planned
            </span>
            <span className={`text-sm font-mono font-bold ${isCyber ? "text-slate-300" : "text-gray-700"}`}>
              {formatTime(plannedSeconds)}
            </span>
          </div>

          {/* Active */}
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider font-bold text-gray-400">
              Active Time
            </span>
            <span className={`text-sm sm:text-base font-mono font-black ${isCyber ? "text-cyan-400" : "text-[#00F5FF]"}`}>
              {formatTime(active)}
            </span>
          </div>

          {/* Elapsed */}
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider font-bold text-gray-400">
              Elapsed
            </span>
            <span className={`text-sm sm:text-base font-mono font-black ${isCyber ? "text-emerald-400" : "text-emerald-600"}`}>
              {formatTime(elapsed)}
            </span>
          </div>

          {/* Rest / Pause */}
          <div className="hidden md:flex flex-col">
            <span className="text-[9px] uppercase tracking-wider font-bold text-gray-400">
              Rest / Pause
            </span>
            <span className={`text-sm font-mono font-bold ${isCyber ? "text-amber-400" : "text-amber-600"}`}>
              {formatTime(rest)}
            </span>
          </div>

          {/* Timer Buttons */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Play / Pause */}
            <button
              type="button"
              onClick={handleToggleTimer}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-150 flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                sessionTimer.isRunning
                  ? isCyber
                    ? "bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                    : "bg-[#FFE17D] hover:bg-amber-400 text-black border-2 border-black shadow-[2px_2px_0px_#000]"
                  : isCyber
                  ? "bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,245,255,0.5)]"
                  : "bg-[#00F5FF] hover:bg-[#FFE17D] text-black border-2 border-black shadow-[2px_2px_0px_#000]"
              }`}
            >
              <span>{sessionTimer.isRunning ? "⏸ Pause" : sessionTimer.startedAt ? "▶ Resume" : "▶ Start Session"}</span>
            </button>

            {/* Finish Session */}
            {sessionTimer.elapsedSeconds > 0 && (
              <button
                type="button"
                onClick={handleFinish}
                title="Finish session and record actual workout duration"
                className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                  isCyber
                    ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                    : "bg-[#10B981] hover:bg-emerald-400 text-white border-2 border-black shadow-[2px_2px_0px_#000]"
                }`}
              >
                ✓ Finish
              </button>
            )}

            {/* Reset */}
            {sessionTimer.elapsedSeconds > 0 && (
              <button
                type="button"
                onClick={resetSessionTimer}
                title="Reset timer"
                className="p-2 rounded-xl text-xs font-bold text-gray-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
              >
                ↺
              </button>
            )}

            {/* Expand Details */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-gray-400 hover:text-white p-1"
              title="Toggle timer metrics breakdown"
            >
              {isExpanded ? "▲" : "▼"}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Breakdown Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`px-5 py-4 border-t text-xs font-mono grid grid-cols-2 sm:grid-cols-4 gap-4 ${
              isCyber
                ? "bg-slate-950/60 border-slate-800 text-slate-300"
                : "bg-gray-50 border-black/15 text-gray-800"
            }`}
          >
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">
                Expected Plan
              </span>
              <span className="font-bold text-sm">{formatTime(plannedSeconds)}</span>
              <p className="text-[10px] text-gray-500 mt-0.5">Calculated from scheduled blocks</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">
                Active Workout
              </span>
              <span className="font-bold text-sm text-cyan-400">{formatTime(active)}</span>
              <p className="text-[10px] text-gray-500 mt-0.5">Actively tracked work intervals</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">
                Rest & Transitions
              </span>
              <span className="font-bold text-sm text-amber-400">{formatTime(rest)}</span>
              <p className="text-[10px] text-gray-500 mt-0.5">Rests, hydration & breaks</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">
                Total Elapsed Session
              </span>
              <span className="font-bold text-sm text-emerald-400">{formatTime(elapsed)}</span>
              <p className="text-[10px] text-gray-500 mt-0.5">Clock time since session start</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
