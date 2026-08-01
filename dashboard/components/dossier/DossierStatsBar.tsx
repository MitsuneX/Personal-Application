"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { ThemeAccentConfig } from "./DossierThemeAccent";
import { Tv, CheckCircle, Percent, Calendar, Star, RefreshCw } from "lucide-react";

function useAnimatedNumber(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (target === 0) return;

    const steps = duration / 16;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target, duration]);

  return count;
}

export interface DossierStatsBarProps {
  episodesWatched: number;
  totalEpisodes: number;
  rating: number;
  startDate?: string;
  finishDate?: string;
  rewatchCount?: number;
  themeConfig: ThemeAccentConfig;
}

export function DossierStatsBar({
  episodesWatched,
  totalEpisodes,
  rating,
  startDate,
  finishDate,
  rewatchCount = 0,
  themeConfig,
}: DossierStatsBarProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const total = totalEpisodes > 0 ? totalEpisodes : 1;
  const pct = Math.min(100, Math.round((episodesWatched / total) * 100));

  // Compute days taken
  const daysTaken = (() => {
    if (!startDate || !finishDate) return 0;
    const s = new Date(startDate).getTime();
    const f = new Date(finishDate).getTime();
    if (isNaN(s) || isNaN(f)) return 0;
    return Math.max(1, Math.ceil((f - s) / (1000 * 60 * 60 * 24)));
  })();

  const animWatched = useAnimatedNumber(episodesWatched);
  const animTotal = useAnimatedNumber(totalEpisodes);
  const animPct = useAnimatedNumber(pct);
  const animDays = useAnimatedNumber(daysTaken);
  const animRating = useAnimatedNumber(rating);
  const animRewatch = useAnimatedNumber(rewatchCount);

  const stats = [
    { label: "Episodes Watched", value: `${animWatched}`, icon: Tv, color: themeConfig.primaryAccent },
    { label: "Total Episodes", value: `${animTotal > 0 ? animTotal : "?"}`, icon: CheckCircle, color: "#3B82F6" },
    { label: "Completion", value: `${animPct}%`, icon: Percent, color: "#10B981" },
    { label: "Days Taken", value: daysTaken > 0 ? `${animDays} Days` : "In Progress", icon: Calendar, color: "#F59E0B" },
    { label: "Personal Score", value: `${animRating}/10`, icon: Star, color: "#EC4899" },
    { label: "Rewatch Count", value: `${animRewatch}x`, icon: RefreshCw, color: "#8B5CF6" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
      {stats.map((s, idx) => {
        const IconComp = s.icon;
        return (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            whileHover={{ scale: 1.03, y: -2 }}
            className="p-4 rounded-xl flex flex-col justify-between gap-2 relative overflow-hidden select-none border"
            style={{
              backgroundColor: isCyber ? "rgba(10,15,44,0.75)" : "#FFFFFF",
              borderColor: isCyber ? `${s.color}40` : "#000000",
              boxShadow: isCyber
                ? `0 0 20px ${s.color}15, inset 0 0 15px ${s.color}08`
                : "3.5px 3.5px 0px #000000",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase opacity-60">
                {s.label}
              </span>
              <IconComp size={16} style={{ color: s.color }} />
            </div>

            <span
              className="text-2xl font-black tabular-nums tracking-tight"
              style={{
                color: isCyber ? "#E0E8FF" : "#1A1A1A",
                fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
              }}
            >
              {s.value}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
