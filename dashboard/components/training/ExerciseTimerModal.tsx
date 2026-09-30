"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { OverlayPortal } from "@/components/ui/OverlayPortal";

interface ExerciseTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  initialSeconds?: number;
  onFinished?: () => void;
}

export function ExerciseTimerModal({
  isOpen,
  onClose,
  title,
  subtitle,
  initialSeconds = 45,
  onFinished,
}: ExerciseTimerModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const [targetSeconds, setTargetSeconds] = useState(initialSeconds);
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    setTargetSeconds(initialSeconds);
    setSecondsRemaining(initialSeconds);
    setIsRunning(false);
    setIsDone(false);
  }, [initialSeconds, isOpen]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setIsDone(true);
          if (onFinished) onFinished();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, onFinished]);

  if (!isOpen) return null;

  const m = Math.floor(secondsRemaining / 60);
  const s = secondsRemaining % 60;
  const timeFormatted = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  const progressPercent =
    targetSeconds > 0
      ? Math.max(0, Math.min(100, Math.round(((targetSeconds - secondsRemaining) / targetSeconds) * 100)))
      : 100;

  const handleReset = () => {
    setIsRunning(false);
    setIsDone(false);
    setSecondsRemaining(targetSeconds);
  };

  const handleAddSeconds = (secs: number) => {
    setTargetSeconds((prev) => prev + secs);
    setSecondsRemaining((prev) => prev + secs);
    setIsDone(false);
  };

  return (
    <OverlayPortal>
      <div className="fixed inset-0 z-[350] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          className={`w-full max-w-sm rounded-2xl p-6 sm:p-7 relative flex flex-col items-center text-center shadow-2xl ${
            isCyber
              ? "bg-[#090f24] border border-cyan-500/50 shadow-[0_0_40px_rgba(0,245,255,0.2)] text-white"
              : "bg-[#FFFDF8] border-4 border-black shadow-[8px_8px_0px_#000] text-black"
          }`}
        >
          {/* Header */}
          <div className="w-full flex items-center justify-between mb-4">
            <span
              className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                isCyber
                  ? "bg-cyan-950 text-cyan-300 border border-cyan-500/40"
                  : "bg-black text-[#FFE600]"
              }`}
            >
              ⏱️ Exercise Timer
            </span>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm hover:opacity-75"
            >
              ✕
            </button>
          </div>

          <h3 className="text-xl font-black tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}

          {/* Big Time Display */}
          <div className="my-6 relative flex flex-col items-center justify-center">
            <div
              className={`text-6xl font-black font-mono tracking-tight transition-transform ${
                isRunning ? "scale-105" : "scale-100"
              } ${
                isDone
                  ? isCyber
                    ? "text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.8)]"
                    : "text-emerald-600"
                  : isCyber
                  ? "text-cyan-400 drop-shadow-[0_0_15px_rgba(0,245,255,0.6)]"
                  : "text-black"
              }`}
            >
              {timeFormatted}
            </div>

            {isDone && (
              <span className="text-xs font-bold font-mono text-emerald-400 mt-2 animate-bounce">
                🎉 TIME COMPLETE!
              </span>
            )}
          </div>

          {/* Visual Progress Bar */}
          <div
            className={`w-full h-2 rounded-full overflow-hidden mb-6 ${
              isCyber ? "bg-slate-800" : "bg-gray-200"
            }`}
          >
            <div
              className={`h-full transition-all duration-300 ${
                isDone
                  ? "bg-emerald-500"
                  : isCyber
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                  : "bg-[#00F5FF]"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex gap-2 mb-6">
            {[15, 30, 60].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleAddSeconds(s)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all active:scale-95 ${
                  isCyber
                    ? "bg-slate-900 border border-slate-700 text-slate-300 hover:border-cyan-400"
                    : "bg-white border-2 border-black text-black shadow-[2px_2px_0px_#000]"
                }`}
              >
                +{s}s
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="w-full flex gap-3">
            <button
              type="button"
              onClick={handleReset}
              className={`w-1/3 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 ${
                isCyber
                  ? "bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800"
                  : "bg-gray-100 border-2 border-black text-black shadow-[2px_2px_0px_#000]"
              }`}
            >
              Reset
            </button>

            <button
              type="button"
              onClick={() => {
                if (isDone) {
                  handleReset();
                  setIsRunning(true);
                } else {
                  setIsRunning(!isRunning);
                }
              }}
              className={`w-2/3 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all active:scale-95 ${
                isRunning
                  ? isCyber
                    ? "bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                    : "bg-[#FFE17D] text-black border-2 border-black shadow-[3px_3px_0px_#000]"
                  : isCyber
                  ? "bg-cyan-500 text-black shadow-[0_0_20px_rgba(0,245,255,0.5)]"
                  : "bg-[#00F5FF] text-black border-2 border-black shadow-[3px_3px_0px_#000]"
              }`}
            >
              {isRunning ? "Pause" : isDone ? "Restart" : "Start Timer"}
            </button>
          </div>
        </motion.div>
      </div>
    </OverlayPortal>
  );
}
