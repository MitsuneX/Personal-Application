"use client";

import React from "react";
import { motion, useAnimation } from "framer-motion";
import { BentoCard } from "./BentoCard";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import {
  listContainerVariants,
  listItemVariants,
  progressBarVariants,
} from "@/lib/theme/motionVariants";
import type { AnimeStatus } from "@/lib/store/dashboardStore";

const STATUS_CONFIG: Record<
  AnimeStatus,
  { label: string; color: string; bg: string }
> = {
  Watching:       { label: "▶ Watching",       color: "#00F5FF", bg: "rgba(0,245,255,0.12)"     },
  Completed:      { label: "✓ Completed",       color: "#39FF14", bg: "rgba(57,255,20,0.12)"     },
  "On Hold":      { label: "⏸ On Hold",         color: "#FFD166", bg: "rgba(255,209,102,0.12)"   },
  "Plan to Watch":{ label: "◷ Plan to Watch",   color: "#BF5FFF", bg: "rgba(191,95,255,0.12)"    },
  Dropped:        { label: "✕ Dropped",         color: "#FF073A", bg: "rgba(255,7,58,0.12)"      },
};

const BRUTAL_STATUS_CONFIG: Record<AnimeStatus, { color: string; bg: string }> = {
  Watching:       { color: "#1A6B3C", bg: "rgba(6,214,160,0.15)"   },
  Completed:      { color: "#155A8A", bg: "rgba(0,119,182,0.12)"   },
  "On Hold":      { color: "#8A6200", bg: "rgba(255,209,102,0.18)" },
  "Plan to Watch":{ color: "#5A1A8A", bg: "rgba(157,78,221,0.12)"  },
  Dropped:        { color: "#8A1A1A", bg: "rgba(239,71,111,0.12)"  },
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function AnimeProgressBar({
  watched,
  total,
  isCyber,
  delay = 0,
}: {
  watched: number;
  total: number;
  isCyber: boolean;
  delay?: number;
}) {
  const pct = total > 0 ? Math.min((watched / total) * 100, 100) : 0;

  return (
    <div className="mt-1.5">
      <div className="progress-track">
        <motion.div
          className="progress-fill"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: pct / 100 }}
          transition={{
            type: "spring",
            stiffness: 70,
            damping: 18,
            delay: 0.5 + delay,
          }}
          style={{ transformOrigin: "left" }}
        />
      </div>
      <div className="flex justify-between mt-0.5">
        <span
          className="text-xs font-mono"
          style={{ color: isCyber ? "rgba(0,245,255,0.5)" : "rgba(0,0,0,0.4)" }}
        >
          {watched} / {total} eps
        </span>
        <span
          className="text-xs font-mono font-bold"
          style={{ color: isCyber ? "rgba(0,245,255,0.7)" : "rgba(0,0,0,0.6)" }}
        >
          {Math.round(pct)}%
        </span>
      </div>
    </div>
  );
}

// ─── Anime Entry Row ──────────────────────────────────────────────────────────

function AnimeRow({
  anime,
  isCyber,
  index,
}: {
  anime: ReturnType<typeof useDashboardStore.getState>["animeList"][0];
  isCyber: boolean;
  index: number;
}) {
  const cyberStyle = STATUS_CONFIG[anime.status];
  const brutalStyle = BRUTAL_STATUS_CONFIG[anime.status];

  return (
    <motion.li
      variants={listItemVariants}
      custom={index}
      className="rounded-lg px-3 pt-2.5 pb-2 group"
      style={{
        background: isCyber ? cyberStyle.bg : brutalStyle.bg,
        border: isCyber
          ? `1px solid ${cyberStyle.color}30`
          : "1.5px solid rgba(0,0,0,0.15)",
      }}
      whileHover={{
        scale: 1.015,
        transition: { duration: 0.15 },
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <p
          className="font-bold text-sm leading-tight theme-text-primary flex-1 min-w-0 truncate"
          title={anime.title}
        >
          {anime.title}
        </p>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Rating */}
          {anime.rating && (
            <motion.span
              className="text-xs font-mono font-black"
              animate={{
                color: isCyber ? "#FFD700" : "#FF6B35",
                textShadow: isCyber ? "0 0 8px rgba(255,215,0,0.7)" : "none",
              }}
              transition={{ duration: 0.4 }}
            >
              ★{anime.rating}
            </motion.span>
          )}

          {/* Status badge */}
          <motion.span
            className="theme-badge"
            style={{
              backgroundColor: isCyber ? cyberStyle.bg : brutalStyle.bg,
              color: isCyber ? cyberStyle.color : brutalStyle.color,
              borderColor: isCyber ? `${cyberStyle.color}60` : "rgba(0,0,0,0.25)",
              fontSize: "0.6rem",
            }}
          >
            {cyberStyle.label}
          </motion.span>
        </div>
      </div>

      <AnimeProgressBar
        watched={anime.episodesWatched}
        total={anime.totalEpisodes}
        isCyber={isCyber}
        delay={index * 0.05}
      />
    </motion.li>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AnimeZoneCard() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const animeList = useDashboardStore((s) => s.animeList);
  const characters = useDashboardStore((s) => s.favoriteCharacters);

  const watching = animeList.filter((a) => a.status === "Watching");
  const completed = animeList.filter((a) => a.status === "Completed");

  // Stats
  const totalEpsWatched = animeList.reduce((sum, a) => sum + a.episodesWatched, 0);

  return (
    <BentoCard
      id="anime-zone-card"
      className="col-span-1 md:col-span-2 lg:col-span-1 xl:col-span-2"
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <motion.span
            className="text-2xl"
            animate={{
              filter: isCyber
                ? "drop-shadow(0 0 10px rgba(191,95,255,0.9))"
                : "none",
            }}
            transition={{ duration: 0.4 }}
          >
            ⛩️
          </motion.span>
          <div>
            <motion.h2
              className="font-black text-base leading-tight theme-text-primary"
              animate={{ fontFamily: isCyber ? "var(--font-orbitron)" : "inherit" }}
              transition={{ duration: 0.4 }}
            >
              {isCyber ? "ANIME.ZONE" : "Anime Zone"}
            </motion.h2>
            <p className="theme-text-muted text-xs tracking-widest uppercase">
              {animeList.length} in log
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-2">
          <StatPill
            label="Watching"
            value={watching.length}
            color={isCyber ? "#00F5FF" : "#06D6A0"}
            isCyber={isCyber}
          />
          <StatPill
            label="Done"
            value={completed.length}
            color={isCyber ? "#BF5FFF" : "#FF6B35"}
            isCyber={isCyber}
          />
        </div>
      </div>

      {/* ── Anime List ── */}
      <motion.ul
        className="space-y-2.5 mb-4"
        variants={listContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {animeList.slice(0, 5).map((anime, i) => (
          <AnimeRow key={anime.id} anime={anime} isCyber={isCyber} index={i} />
        ))}
      </motion.ul>

      {/* ── Divider ── */}
      <div
        className="h-px mb-4"
        style={{
          background: isCyber
            ? "linear-gradient(90deg, rgba(0,245,255,0.4), rgba(191,95,255,0.4), transparent)"
            : "rgba(0,0,0,0.1)",
        }}
      />

      {/* ── Favorite Characters ── */}
      <div>
        <p
          className="text-xs font-bold tracking-widest uppercase mb-2.5"
          style={{ color: isCyber ? "rgba(191,95,255,0.7)" : "rgba(0,0,0,0.45)" }}
        >
          ♥ Favorite Characters
        </p>

        <motion.div
          className="flex flex-wrap gap-2"
          variants={listContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {characters
            .filter((c) => c.isFavorite)
            .map((char, i) => (
              <motion.div
                key={char.id}
                variants={listItemVariants}
                custom={i}
                className="rounded-lg px-2.5 py-1.5 flex flex-col"
                style={{
                  background: isCyber
                    ? "rgba(191,95,255,0.08)"
                    : "rgba(255,107,53,0.08)",
                  border: isCyber
                    ? "1px solid rgba(191,95,255,0.3)"
                    : "1.5px solid rgba(0,0,0,0.2)",
                }}
                whileHover={{
                  scale: 1.04,
                  boxShadow: isCyber
                    ? "0 0 12px rgba(191,95,255,0.5)"
                    : "3px 3px 0px 0px rgba(0,0,0,1)",
                  transition: { duration: 0.15 },
                }}
              >
                <span
                  className="font-bold text-xs"
                  style={{ color: isCyber ? "#E0E8FF" : "#1A1A1A" }}
                >
                  {char.name}
                </span>
                <span
                  className="text-xs"
                  style={{ color: isCyber ? "rgba(191,95,255,0.7)" : "rgba(0,0,0,0.45)" }}
                >
                  {char.anime}
                </span>
              </motion.div>
            ))}
        </motion.div>
      </div>

      {/* ── Total eps counter ── */}
      <motion.div
        className="mt-4 pt-3 flex items-center gap-2"
        style={{ borderTop: isCyber ? "1px solid rgba(0,245,255,0.1)" : "1px solid rgba(0,0,0,0.08)" }}
      >
        <span className="theme-text-muted text-xs">Total episodes watched:</span>
        <motion.span
          className="font-black text-sm font-mono"
          animate={{
            color: isCyber ? "#00F5FF" : "#FF6B35",
            textShadow: isCyber ? "0 0 10px rgba(0,245,255,0.8)" : "none",
          }}
          transition={{ duration: 0.4 }}
        >
          {totalEpsWatched.toLocaleString()}
        </motion.span>
      </motion.div>
    </BentoCard>
  );
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────

function StatPill({
  label,
  value,
  color,
  isCyber,
}: {
  label: string;
  value: number;
  color: string;
  isCyber: boolean;
}) {
  return (
    <motion.div
      className="flex flex-col items-center px-2.5 py-1.5 rounded-lg"
      animate={{
        background: isCyber ? `${color}12` : `${color}18`,
        border: isCyber ? `1px solid ${color}40` : `2px solid ${color}`,
        boxShadow: isCyber ? `0 0 10px ${color}30` : "none",
      }}
      transition={{ duration: 0.4 }}
    >
      <motion.span
        className="font-black text-lg leading-none"
        animate={{ color, textShadow: isCyber ? `0 0 10px ${color}` : "none" }}
        transition={{ duration: 0.4 }}
      >
        {value}
      </motion.span>
      <span className="text-xs theme-text-muted">{label}</span>
    </motion.div>
  );
}
