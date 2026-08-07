"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { ThemeAccentConfig } from "./DossierThemeAccent";
import { DossierEpisode } from "@/lib/store/dashboardStore";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { Tv, CheckCircle2, Play, Activity } from "lucide-react";

export interface DossierEpisodeNavigatorProps {
  episodes?: DossierEpisode[];
  totalEpisodes?: number;
  episodesWatched?: number;
  themeConfig: ThemeAccentConfig;
  onToggleEpisodeWatched?: (epNumber: number) => void;
}

export function DossierEpisodeNavigator({
  episodes = [],
  totalEpisodes = 20,
  episodesWatched = 12,
  themeConfig,
  onToggleEpisodeWatched,
}: DossierEpisodeNavigatorProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const total = totalEpisodes > 0 ? totalEpisodes : 16;

  // Generate episode list if not fully provided
  const epList: DossierEpisode[] = Array.from({ length: total }, (_, i) => {
    const epNum = i + 1;
    const existing = episodes.find((e) => e.number === epNum);
    return (
      existing || {
        number: epNum,
        title: `Episode ${epNum}`,
        runtime: "60m",
        isWatched: epNum <= episodesWatched,
      }
    );
  });

  // Dynamic analytics calculations
  const avgDailyPace = episodesWatched > 0 ? (episodesWatched / Math.max(1, Math.min(7, episodesWatched))).toFixed(1) : "0";
  const estimatedMinsLeft = Math.max(0, total - episodesWatched) * 60;
  const hoursWatched = Math.round((episodesWatched * 60) / 60);

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const analyticsData = daysOfWeek.map((day, idx) => {
    const baseCount = Math.floor(episodesWatched / 7);
    const remainder = episodesWatched % 7;
    const count = baseCount + (idx < remainder ? 1 : 0);
    return { day, count };
  });

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
          <Tv size={20} style={{ color: themeConfig.primaryAccent }} />
          <h2
            className="text-lg font-black tracking-wide"
            style={{
              color: isCyber ? "#E0E8FF" : "#1A1A1A",
              fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
            }}
          >
            {isCyber ? "// EPISODE NAVIGATOR & ANALYTICS" : "Episode Navigator & Analytics"}
          </h2>
        </div>

        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md border" style={{ borderColor: themeConfig.primaryAccent, color: themeConfig.primaryAccent }}>
          {episodesWatched} / {total} Watched
        </span>
      </div>

      {/* Analytics Chart & Speed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 p-4 rounded-xl border bg-black/10 dark:bg-white/5">
        <div className="md:col-span-2">
          <p className="text-xs font-mono font-bold uppercase mb-2 opacity-70 flex items-center gap-1">
            <Activity size={14} style={{ color: themeConfig.primaryAccent }} />
            <span>Watching Pace (Episodes Per Day)</span>
          </p>
          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isCyber ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: isCyber ? "#94A3B8" : "#4B5563" }} />
                <YAxis tick={{ fontSize: 9, fill: isCyber ? "#94A3B8" : "#4B5563" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isCyber ? "#0A0F2C" : "#FFFFFF",
                    border: `1.5px solid ${themeConfig.primaryAccent}`,
                    borderRadius: "8px",
                    fontSize: "10px",
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {analyticsData.map((entry, idx) => (
                    <Cell key={idx} fill={idx % 2 === 0 ? themeConfig.primaryAccent : themeConfig.secondaryAccent} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-6">
          <div>
            <p className="text-[10px] font-mono uppercase opacity-60">Avg Daily Watching</p>
            <p className="text-lg font-black" style={{ color: themeConfig.primaryAccent }}>{avgDailyPace} Eps / Day</p>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase opacity-60">Total Hours Watched</p>
            <p className="text-lg font-black" style={{ color: isCyber ? "#E0E8FF" : "#000" }}>{hoursWatched} Hours ({episodesWatched} Eps)</p>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase opacity-60">Estimated Time Left</p>
            <p className="text-lg font-black" style={{ color: "#10B981" }}>{estimatedMinsLeft > 60 ? `${(estimatedMinsLeft / 60).toFixed(1)} hrs` : `${estimatedMinsLeft} mins`}</p>
          </div>
        </div>
      </div>

      {/* Episode Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
        {epList.map((ep) => {
          const isCurrent = ep.number === episodesWatched + 1;
          return (
            <motion.button
              key={ep.number}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onToggleEpisodeWatched?.(ep.number)}
              className="p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer relative overflow-hidden select-none"
              style={{
                backgroundColor: ep.isWatched
                  ? `${themeConfig.primaryAccent}18`
                  : isCurrent
                  ? `${themeConfig.secondaryAccent}25`
                  : isCyber
                  ? "rgba(5,8,22,0.6)"
                  : "#FFF5E4",
                borderColor: ep.isWatched
                  ? themeConfig.primaryAccent
                  : isCurrent
                  ? themeConfig.secondaryAccent
                  : isCyber
                  ? "rgba(255,255,255,0.1)"
                  : "#000000",
                boxShadow: ep.isWatched || isCurrent ? `0 0 12px ${themeConfig.glowColor}` : "none",
              }}
            >
              <div className="flex items-center gap-1">
                {ep.isWatched ? (
                  <CheckCircle2 size={12} style={{ color: themeConfig.primaryAccent }} />
                ) : isCurrent ? (
                  <Play size={12} fill="currentColor" style={{ color: themeConfig.secondaryAccent }} />
                ) : null}
                <span className="font-black text-xs">EP {ep.number}</span>
              </div>
              <span className="text-[9px] font-mono opacity-60 truncate w-full text-center">{ep.runtime}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
