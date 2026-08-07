"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { ThemeAccentConfig } from "./DossierThemeAccent";
import { CategoryRatings } from "@/lib/store/dashboardStore";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip
} from "recharts";
import { Award, Edit3, Check } from "lucide-react";

export interface DossierRatingRadarProps {
  ratings?: CategoryRatings;
  themeConfig: ThemeAccentConfig;
  onSaveRatings?: (ratings: CategoryRatings) => void;
}

const ALL_CATEGORIES: { key: keyof CategoryRatings; label: string }[] = [
  { key: "story", label: "Story" },
  { key: "characters", label: "Characters" },
  { key: "romance", label: "Romance" },
  { key: "comedy", label: "Comedy" },
  { key: "action", label: "Action" },
  { key: "drama", label: "Drama" },
  { key: "soundtrack", label: "Soundtrack" },
  { key: "ending", label: "Ending" },
  { key: "visuals", label: "Visuals" },
  { key: "cinematography", label: "Cinematography" },
  { key: "worldBuilding", label: "World Building" },
  { key: "emotion", label: "Emotion" },
  { key: "chemistry", label: "Chemistry" },
  { key: "pacing", label: "Pacing" },
];

export function DossierRatingRadar({ ratings, themeConfig, onSaveRatings }: DossierRatingRadarProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const [isEditing, setIsEditing] = useState(false);
  const [currentRatings, setCurrentRatings] = useState<CategoryRatings>(ratings || {});

  const handleRatingChange = (key: keyof CategoryRatings, value: number) => {
    const next = { ...currentRatings, [key]: value };
    setCurrentRatings(next);
  };

  const handleSave = () => {
    onSaveRatings?.(currentRatings);
    setIsEditing(false);
  };

  // Build chart subjects for active ratings
  const activeEntries = ALL_CATEGORIES.map((cat) => ({
    subject: cat.label,
    score: currentRatings[cat.key] ?? 0,
    key: cat.key,
  }));

  const ratedEntries = activeEntries.filter((e) => e.score > 0);
  const averageScore = ratedEntries.length > 0
    ? (ratedEntries.reduce((sum, e) => sum + e.score, 0) / ratedEntries.length).toFixed(1)
    : "0.0";

  return (
    <div
      className="p-6 rounded-2xl mb-8 relative border overflow-hidden"
      style={{
        backgroundColor: isCyber ? "rgba(10,15,44,0.75)" : "#FFFFFF",
        borderColor: isCyber ? `${themeConfig.primaryAccent}30` : "#000000",
        boxShadow: isCyber
          ? `0 0 25px ${themeConfig.glowColor}, inset 0 0 20px rgba(0,245,255,0.02)`
          : "4px 4px 0px #000000",
      }}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Award size={20} style={{ color: themeConfig.primaryAccent }} />
          <h2
            className="text-lg font-black tracking-wide"
            style={{
              color: isCyber ? "#E0E8FF" : "#1A1A1A",
              fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
            }}
          >
            {isCyber ? "// MULTI-CATEGORY RATING BREAKDOWN" : "Multi-Category Rating Breakdown"}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md border" style={{ borderColor: themeConfig.primaryAccent, color: themeConfig.primaryAccent }}>
            Overall: {averageScore} / 10
          </span>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider cursor-pointer border"
            style={{
              backgroundColor: isCyber ? "rgba(0,245,255,0.08)" : "#FFF",
              borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000",
              color: isCyber ? "#00F5FF" : "#000",
            }}
          >
            <Edit3 size={13} />
            <span>{isEditing ? "Done Rating" : "Rate Categories"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Recharts Radar Chart */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={activeEntries} margin={{ top: 10, right: 25, bottom: 10, left: 25 }}>
              <PolarGrid stroke={isCyber ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} />
              <PolarAngleAxis
                dataKey="subject"
                tick={{
                  fill: isCyber ? "#94A3B8" : "#4B5563",
                  fontSize: 9,
                  fontWeight: 700,
                }}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke={themeConfig.primaryAccent}
                fill={themeConfig.primaryAccent}
                fillOpacity={0.35}
                strokeWidth={2}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isCyber ? "#0A0F2C" : "#FFFFFF",
                  border: `1.5px solid ${themeConfig.primaryAccent}`,
                  borderRadius: "8px",
                  fontSize: "11px",
                  fontWeight: 800,
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Individual Category Sliders / Progress Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
          {ALL_CATEGORIES.map((cat) => {
            const val = currentRatings[cat.key] ?? 0;
            return (
              <div key={cat.key} className="p-2.5 rounded-xl border bg-black/10 dark:bg-white/5">
                <div className="flex justify-between items-center text-xs font-mono font-bold mb-1">
                  <span className="opacity-80">{cat.label}</span>
                  <span style={{ color: val > 0 ? themeConfig.primaryAccent : "inherit" }}>
                    {val > 0 ? `${val} / 10` : "Unrated"}
                  </span>
                </div>
                {isEditing ? (
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={val}
                    onChange={(e) => handleRatingChange(cat.key, parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                ) : (
                  <div className="w-full h-2 rounded-full overflow-hidden bg-black/20 dark:bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(val / 10) * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: themeConfig.primaryAccent }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {isEditing && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold text-white cursor-pointer shadow-lg"
            style={{ backgroundColor: themeConfig.primaryAccent }}
          >
            <Check size={14} />
            <span>Save Ratings</span>
          </button>
        </div>
      )}
    </div>
  );
}
