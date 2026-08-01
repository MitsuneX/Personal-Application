"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { ThemeAccentConfig } from "./DossierThemeAccent";
import { CategoryRatings } from "@/lib/store/dashboardStore";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip
} from "recharts";
import { Award, Star } from "lucide-react";

export interface DossierRatingRadarProps {
  ratings?: CategoryRatings;
  themeConfig: ThemeAccentConfig;
}

export function DossierRatingRadar({ ratings, themeConfig }: DossierRatingRadarProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const defaultRatings: CategoryRatings = ratings || {
    story: 9.5,
    characters: 9.8,
    ending: 9.0,
    ost: 9.2,
    romance: 8.8,
    comedy: 8.5,
    action: 9.6,
    visuals: 9.4,
    rewatchValue: 9.0,
  };

  const chartData = [
    { subject: "Story", score: defaultRatings.story },
    { subject: "Characters", score: defaultRatings.characters },
    { subject: "Ending", score: defaultRatings.ending },
    { subject: "OST / Music", score: defaultRatings.ost },
    { subject: "Romance", score: defaultRatings.romance },
    { subject: "Comedy", score: defaultRatings.comedy },
    { subject: "Action", score: defaultRatings.action },
    { subject: "Visuals", score: defaultRatings.visuals },
    { subject: "Rewatch", score: defaultRatings.rewatchValue },
  ];

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
      <div className="flex items-center gap-2 mb-6">
        <Award size={20} style={{ color: themeConfig.primaryAccent }} />
        <h2
          className="text-lg font-black tracking-wide"
          style={{
            color: isCyber ? "#E0E8FF" : "#1A1A1A",
            fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
          }}
        >
          {isCyber ? "// CATEGORY RATING BREAKDOWN" : "Multi-Category Rating Breakdown"}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Recharts Radar Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid stroke={isCyber ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} />
              <PolarAngleAxis
                dataKey="subject"
                tick={{
                  fill: isCyber ? "#94A3B8" : "#4B5563",
                  fontSize: 10,
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

        {/* Individual Category Progress Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {chartData.map((item) => (
            <div key={item.subject} className="p-2.5 rounded-xl border bg-black/10 dark:bg-white/5">
              <div className="flex justify-between items-center text-xs font-mono font-bold mb-1">
                <span className="opacity-80">{item.subject}</span>
                <span style={{ color: themeConfig.primaryAccent }}>{item.score} / 10</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden bg-black/20 dark:bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.score / 10) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: themeConfig.primaryAccent }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
