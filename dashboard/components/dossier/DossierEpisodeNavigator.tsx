"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { ThemeAccentConfig } from "./DossierThemeAccent";
import { DossierEpisode } from "@/lib/store/dashboardStore";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { Tv, CheckCircle2, Play, Activity, Search, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";

export interface DossierEpisodeNavigatorProps {
  episodes?: DossierEpisode[];
  totalEpisodes?: number;
  episodesWatched?: number;
  themeConfig: ThemeAccentConfig;
  onToggleEpisodeWatched?: (epNumber: number) => void;
}

const PAGE_SIZE = 24; // Virtualized page size per season block

export function DossierEpisodeNavigator({
  episodes = [],
  totalEpisodes = 20,
  episodesWatched = 0,
  themeConfig,
  onToggleEpisodeWatched,
}: DossierEpisodeNavigatorProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const total = totalEpisodes > 0 ? totalEpisodes : 12;

  // Search & Navigation States
  const [searchQuery, setSearchQuery] = useState("");
  const [jumpInput, setJumpInput] = useState("");
  const [activeSeasonIndex, setActiveSeasonIndex] = useState(0);

  // Generate full episode list efficiently
  const fullEpList: DossierEpisode[] = useMemo(() => {
    return Array.from({ length: total }, (_, i) => {
      const epNum = i + 1;
      const existing = episodes.find((e) => e.number === epNum);
      const isWatched = epNum <= episodesWatched;
      return existing
        ? { ...existing, isWatched }
        : {
            number: epNum,
            title: `Episode ${epNum}`,
            runtime: "24m",
            isWatched,
          };
    });
  }, [total, episodes, episodesWatched]);

  // Group episodes into Seasons / Blocks of 24 episodes
  const seasons = useMemo(() => {
    const blocks: { name: string; episodes: DossierEpisode[]; startIndex: number; endIndex: number }[] = [];
    const numSeasons = Math.ceil(total / PAGE_SIZE);

    for (let s = 0; s < numSeasons; s++) {
      const start = s * PAGE_SIZE;
      const end = Math.min(total, (s + 1) * PAGE_SIZE);
      const slice = fullEpList.slice(start, end);
      blocks.push({
        name: `Season ${s + 1} (Eps ${start + 1}–${end})`,
        episodes: slice,
        startIndex: start + 1,
        endIndex: end,
      });
    }
    return blocks;
  }, [total, fullEpList]);

  // Auto-set active season based on current watched episode on mount
  useEffect(() => {
    const currentWatchedSeason = Math.floor(Math.max(0, episodesWatched - 1) / PAGE_SIZE);
    if (currentWatchedSeason >= 0 && currentWatchedSeason < seasons.length) {
      setActiveSeasonIndex(currentWatchedSeason);
    }
  }, [episodesWatched, seasons.length]);

  // Filter episodes by search query if active
  const filteredEpisodes = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return fullEpList.filter(
      (e) => e.number.toString() === q || e.title.toLowerCase().includes(q)
    );
  }, [searchQuery, fullEpList]);

  const activeSeason = seasons[activeSeasonIndex] || seasons[0];
  const episodesToRender = filteredEpisodes || activeSeason?.episodes || [];

  // Next unwatched episode for Continue Watching shortcut
  const nextEpisodeToWatch = Math.min(total, episodesWatched + 1);

  const handleJumpToEpisode = (e: React.FormEvent) => {
    e.preventDefault();
    const epNum = parseInt(jumpInput);
    if (isNaN(epNum) || epNum < 1 || epNum > total) return;

    const seasonIdx = Math.floor((epNum - 1) / PAGE_SIZE);
    setActiveSeasonIndex(seasonIdx);
    setSearchQuery(epNum.toString());
    setJumpInput("");
  };

  // Dynamic analytics calculations
  const avgDailyPace = episodesWatched > 0 ? (episodesWatched / Math.max(1, Math.min(7, episodesWatched))).toFixed(1) : "0";
  const estimatedMinsLeft = Math.max(0, total - episodesWatched) * 24;
  const hoursWatched = Math.round((episodesWatched * 24) / 60);

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
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
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

        <div className="flex items-center gap-2 flex-wrap">
          {/* Continue Watching Shortcut */}
          {episodesWatched < total && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onToggleEpisodeWatched?.(nextEpisodeToWatch)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-white cursor-pointer shadow-md"
              style={{ backgroundColor: themeConfig.primaryAccent }}
            >
              <Play size={13} fill="#FFF" />
              <span>Continue Ep {nextEpisodeToWatch}</span>
            </motion.button>
          )}

          <span
            className="text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg border"
            style={{ borderColor: themeConfig.primaryAccent, color: themeConfig.primaryAccent }}
          >
            {episodesWatched} / {total} Watched
          </span>
        </div>
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
            <p className="text-[10px] font-mono uppercase opacity-60">Total Time Watched</p>
            <p className="text-lg font-black" style={{ color: isCyber ? "#E0E8FF" : "#000" }}>{hoursWatched} Hours ({episodesWatched} Eps)</p>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase opacity-60">Estimated Time Left</p>
            <p className="text-lg font-black" style={{ color: "#10B981" }}>{estimatedMinsLeft > 60 ? `${(estimatedMinsLeft / 60).toFixed(1)} hrs` : `${estimatedMinsLeft} mins`}</p>
          </div>
        </div>
      </div>

      {/* Season Navigation & Search Bar Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        {/* Season Selector Tabs */}
        {seasons.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none">
            {seasons.map((season, idx) => {
              const isActive = activeSeasonIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveSeasonIndex(idx);
                    setSearchQuery("");
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap cursor-pointer transition-all border"
                  style={{
                    backgroundColor: isActive ? themeConfig.primaryAccent : isCyber ? "rgba(5,8,22,0.6)" : "#FFF",
                    borderColor: isActive ? themeConfig.primaryAccent : isCyber ? "rgba(255,255,255,0.15)" : "#000",
                    color: isActive ? "#FFF" : isCyber ? "#94A3B8" : "#334155",
                  }}
                >
                  {season.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Search & Jump Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Episode Search */}
          <div className="relative flex-1 sm:w-44">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50" />
            <input
              type="text"
              placeholder="Search episode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 rounded-lg text-xs font-mono border bg-black/10 dark:bg-white/5 outline-none"
              style={{ borderColor: isCyber ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.2)" }}
            />
          </div>

          {/* Jump to Episode Form */}
          <form onSubmit={handleJumpToEpisode} className="flex items-center gap-1">
            <input
              type="number"
              placeholder="Jump #"
              value={jumpInput}
              onChange={(e) => setJumpInput(e.target.value)}
              className="w-16 px-2 py-1 rounded-lg text-xs font-mono border bg-black/10 dark:bg-white/5 outline-none"
              style={{ borderColor: isCyber ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.2)" }}
            />
            <button
              type="submit"
              className="p-1.5 rounded-lg border text-xs font-mono font-bold cursor-pointer"
              style={{ backgroundColor: themeConfig.primaryAccent, color: "#FFF" }}
            >
              <ArrowRight size={13} />
            </button>
          </form>
        </div>
      </div>

      {/* Paginated / Virtualized Episode Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
        {episodesToRender.map((ep) => {
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
                boxShadow: ep.isWatched
                  ? `0 0 12px ${themeConfig.glowColor}`
                  : isCurrent
                  ? `0 0 12px ${themeConfig.secondaryAccent}50`
                  : "none",
              }}
            >
              <span className="text-[10px] font-mono opacity-60">EP</span>
              <span
                className="text-base font-black tabular-nums"
                style={{
                  color: ep.isWatched
                    ? themeConfig.primaryAccent
                    : isCurrent
                    ? themeConfig.secondaryAccent
                    : isCyber
                    ? "#E0E8FF"
                    : "#1A1A1A",
                }}
              >
                {ep.number}
              </span>
              <span className="text-[9px] font-mono opacity-50 truncate max-w-full">
                {ep.isWatched ? "✓ Watched" : isCurrent ? "▶ Current" : ep.runtime || "24m"}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
