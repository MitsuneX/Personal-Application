"use client";

import React from "react";
import { useTheme } from "@/lib/theme";
import { TrainingDay } from "@/lib/data/trainingSchedule";

interface SundayRestExperienceProps {
  day: TrainingDay;
}

export function SundayRestExperience({ day }: SundayRestExperienceProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  return (
    <div
      className={`rounded-2xl p-6 sm:p-8 flex flex-col gap-6 transition-all ${
        isCyber
          ? "bg-[linear-gradient(135deg,rgba(15,10,35,0.9),rgba(8,5,24,0.95))] border border-purple-500/40 text-slate-100 shadow-[0_0_35px_rgba(168,85,247,0.12)]"
          : "bg-[#FAF5FF] border-3 border-black text-black shadow-[6px_6px_0px_#000]"
      }`}
    >
      {/* Rest Hero Header */}
      <div className="flex items-start gap-4">
        <span className="text-4xl sm:text-5xl">🧘</span>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                isCyber ? "bg-purple-950 text-purple-300 border border-purple-500/40 font-mono" : "bg-black text-[#FFE600]"
              }`}
            >
              Deliberate Rest Day
            </span>
            <span className="text-xs font-bold text-purple-400">
              Zero Physical Strain
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
            Full Biological Reset & Adaptive Recovery
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 dark:text-slate-300 max-w-2xl leading-relaxed">
            Muscles and nervous pathways do not strengthen during the workout itself; they adapt during deep rest.
            Sunday is an intentional pillar of your training regimen, not an interruption.
          </p>
        </div>
      </div>

      {/* Recovery Focus Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* Pillar 1 */}
        <div
          className={`p-4 rounded-xl flex flex-col gap-2 ${
            isCyber ? "bg-slate-900/60 border border-purple-500/20" : "bg-white border-2 border-black shadow-[2px_2px_0px_#000]"
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm text-purple-400">
            <span className="text-lg">🍗</span>
            <span>Protein Meal Prep</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-slate-300 leading-relaxed">
            Prepare nutrient-dense fuel (e.g. baked chicken breasts, eggs, high-bioavailability protein) to facilitate muscular repair and glycogen reloading for the week ahead.
          </p>
        </div>

        {/* Pillar 2 */}
        <div
          className={`p-4 rounded-xl flex flex-col gap-2 ${
            isCyber ? "bg-slate-900/60 border border-purple-500/20" : "bg-white border-2 border-black shadow-[2px_2px_0px_#000]"
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm text-cyan-400">
            <span className="text-lg">💧</span>
            <span>Cellular Hydration</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-slate-300 leading-relaxed">
            Drink ample water with essential electrolytes to prevent tendon stiffness and restore intracellular osmotic balance after intense boxing and kicking sessions.
          </p>
        </div>

        {/* Pillar 3 */}
        <div
          className={`p-4 rounded-xl flex flex-col gap-2 ${
            isCyber ? "bg-slate-900/60 border border-purple-500/20" : "bg-white border-2 border-black shadow-[2px_2px_0px_#000]"
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm text-amber-400">
            <span className="text-lg">😴</span>
            <span>Sleep Architecture</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-slate-300 leading-relaxed">
            Aim for 8–9 hours of undisturbed sleep. Human growth hormone secretion and neuromuscular synthesis peak during deep slow-wave non-REM cycles.
          </p>
        </div>
      </div>

      {/* Reassurance Banner */}
      <div
        className={`px-4 py-3 rounded-xl flex items-center justify-between text-xs font-semibold ${
          isCyber ? "bg-purple-950/40 text-purple-300 border border-purple-500/30" : "bg-purple-100 text-purple-950 border border-purple-200"
        }`}
      >
        <span>🛡️ Streak Continuity Preserved: Sunday rest days never deduct or break your training streak.</span>
        <span className="font-mono uppercase text-[10px] opacity-80">Scheduled Rest</span>
      </div>
    </div>
  );
}
