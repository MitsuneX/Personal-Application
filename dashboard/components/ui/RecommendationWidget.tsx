"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { computeRecommendations } from "@/lib/recommendations";
import { useRouter } from "next/navigation";
import type { Recommendation } from "@/lib/recommendations";

const TYPE_ICONS: Record<Recommendation["type"], string> = {
  anime: "⛩️",
  drama: "🎬",
  talent: "🏆",
};

const TYPE_LABELS: Record<Recommendation["type"], string> = {
  anime: "ANIME",
  drama: "DRAMA",
  talent: "TALENT",
};

const TYPE_CYBER_COLORS: Record<Recommendation["type"], string> = {
  anime: "#BF5FFF",
  drama: "#FF7EB9",
  talent: "#FFD700",
};

const TYPE_BRUTAL_COLORS: Record<Recommendation["type"], string> = {
  anime: "#7B2FBE",
  drama: "#CC3377",
  talent: "#CC8800",
};

function ScoreBar({ score, isCyber, color }: { score: number; isCyber: boolean; color: string }) {
  return (
    <div
      className="h-1 rounded-full w-full overflow-hidden"
      style={{ background: isCyber ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)" }}
    >
      <motion.div
        className="h-full rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        style={{ background: color }}
      />
    </div>
  );
}

export function RecommendationWidget() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const router = useRouter();
  const { animeList, dramas, hallOfFame } = useDashboardStore();

  const recommendations = useMemo(
    () => computeRecommendations(animeList, dramas, hallOfFame),
    [animeList, dramas, hallOfFame]
  );

  if (recommendations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 26, delay: 0.5 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: isCyber ? "rgba(5,8,22,0.8)" : "#FFFDEB",
        border: isCyber ? "1px solid rgba(191,95,255,0.25)" : "3px solid #000",
        boxShadow: isCyber ? "0 0 40px rgba(191,95,255,0.08)" : "6px 6px 0 #000",
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{
          borderBottom: isCyber ? "1px solid rgba(191,95,255,0.12)" : "2px solid rgba(0,0,0,0.1)",
          background: isCyber ? "rgba(191,95,255,0.05)" : "rgba(191,95,255,0.04)",
        }}
      >
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: isCyber ? "#BF5FFF" : "#7B2FBE" }}>
            {isCyber ? "// AI.RECOMMENDATION_ENGINE" : "Smart Picks · Based on Your History"}
          </p>
          <h2
            className="text-base font-black mt-0.5"
            style={{
              color: isCyber ? "#E0E8FF" : "#1A1A1A",
              fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
            }}
          >
            {isCyber ? "SUGGESTED_FOR_YOU" : "Recommended For You"}
          </h2>
        </div>
        <span className="text-2xl">🤖</span>
      </div>

      {/* Recommendation Cards */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        <AnimatePresence>
          {recommendations.map((rec, idx) => {
            const color = isCyber ? TYPE_CYBER_COLORS[rec.type] : TYPE_BRUTAL_COLORS[rec.type];
            return (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(rec.url)}
                className="rounded-xl p-3.5 cursor-pointer flex flex-col gap-2 transition-all"
                style={{
                  background: isCyber ? `${color}08` : `${color}0A`,
                  border: isCyber ? `1px solid ${color}25` : `2px solid ${color}`,
                  boxShadow: isCyber ? `0 0 16px ${color}10` : `3px 3px 0 #000`,
                }}
              >
                {/* Type badge + icon */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                    style={{
                      background: `${color}18`,
                      color,
                      border: `1px solid ${color}30`,
                    }}
                  >
                    {TYPE_ICONS[rec.type]} {TYPE_LABELS[rec.type]}
                  </span>
                  <span className="text-[10px] font-black font-mono" style={{ color }}>
                    {rec.score}%
                  </span>
                </div>

                {/* Title */}
                <div>
                  <p className="text-xs font-black leading-tight line-clamp-2" style={{ color: isCyber ? "#E0E8FF" : "#1A1A1A" }}>
                    {rec.title}
                  </p>
                  <p className="text-[9px] opacity-50 mt-0.5 font-mono truncate" style={{ color: isCyber ? "#94A3B8" : "#555" }}>
                    {rec.subtitle}
                  </p>
                </div>

                {/* Match score bar */}
                <ScoreBar score={rec.score} isCyber={isCyber} color={color} />

                {/* Reason */}
                <p className="text-[10px] leading-relaxed line-clamp-2" style={{ color: isCyber ? "#94A3B8" : "#555" }}>
                  {rec.reason}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-auto">
                  {rec.matchTags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[8px] font-semibold px-1.5 py-0.5 rounded-md"
                      style={{
                        background: `${color}12`,
                        color,
                        border: `1px solid ${color}20`,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
