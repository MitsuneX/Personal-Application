"use client";

import React, { useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { BentoCard } from "./BentoCard";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { listContainerVariants, listItemVariants } from "@/lib/theme/motionVariants";
import type { AnimeStatus } from "@/lib/store/dashboardStore";
import { AnimeSearchModal } from "@/components/ui/AnimeSearchModal";

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

// ─── Card Pop Spring Variants ─────────────────────────────────────────────────

const cardPopVariants = {
  hidden: { opacity: 0, scale: 0.88, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 22,
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemPopVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 280,
      damping: 20,
    },
  },
};

// ─── Animated Progress Bar with Hover Glow Sweep ─────────────────────────────

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
  const [isHovered, setIsHovered] = useState(false);
  const pct = total > 0 ? Math.min((watched / total) * 100, 100) : 0;

  return (
    <div
      className="mt-1.5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="progress-track relative overflow-hidden"
        style={{ height: "6px", borderRadius: "3px" }}
      >
        {/* Base fill — animates from 0% on load */}
        <motion.div
          className="progress-fill absolute inset-y-0 left-0"
          initial={{ width: "0%" }}
          animate={{ width: `${pct}%` }}
          transition={{
            type: "spring",
            stiffness: 60,
            damping: 16,
            delay: 0.4 + delay,
          }}
          style={{
            background: isCyber
              ? "linear-gradient(90deg, #00F5FF, #BF5FFF)"
              : "linear-gradient(90deg, #FF6B35, #FFD166)",
          }}
        />

        {/* Hover glow sweep — continuous sliding gradient */}
        {isHovered && (
          <motion.div
            className="absolute inset-y-0"
            initial={{ left: "-30%", width: "30%" }}
            animate={{ left: "130%", width: "30%" }}
            transition={{
              duration: 1.0,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 0.2,
            }}
            style={{
              background: isCyber
                ? "linear-gradient(90deg, transparent, rgba(0,245,255,0.7), rgba(255,255,255,0.9), rgba(191,95,255,0.7), transparent)"
                : "linear-gradient(90deg, transparent, rgba(255,215,0,0.6), rgba(255,255,255,0.8), rgba(255,107,53,0.6), transparent)",
              filter: "blur(2px)",
              borderRadius: "3px",
            }}
          />
        )}
      </div>
      <div className="flex justify-between mt-0.5">
        <span
          className="text-xs font-mono"
          style={{ color: isCyber ? "rgba(0,245,255,0.5)" : "rgba(0,0,0,0.4)" }}
        >
          {watched} / {total} eps
        </span>
        <motion.span
          className="text-xs font-mono font-bold"
          animate={{
            color: isHovered
              ? isCyber ? "#00F5FF" : "#FF6B35"
              : isCyber ? "rgba(0,245,255,0.7)" : "rgba(0,0,0,0.6)",
            textShadow: isHovered && isCyber
              ? "0 0 8px rgba(0,245,255,0.8)"
              : "none",
          }}
          transition={{ duration: 0.2 }}
        >
          {Math.round(pct)}%
        </motion.span>
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
      variants={itemPopVariants}
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
        delay={index * 0.06}
      />
    </motion.li>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AnimeZoneCard() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { animeList, favoriteCharacters: characters } = useDashboardStore();
  const [searchOpen, setSearchOpen] = useState(false);

  const watching = animeList.filter((a) => a.status === "Watching");
  const completed = animeList.filter((a) => a.status === "Completed");

  // Stats
  const totalEpsWatched = animeList.reduce((sum, a) => sum + a.episodesWatched, 0);

  return (
    <motion.div
      layout
      className="col-span-1 md:col-span-2 lg:col-span-1 xl:col-span-2"
    >
      <BentoCard id="anime-zone-card">
        {/* ── Header ── */}
        <motion.div
          className="flex items-start justify-between mb-4"
          variants={cardPopVariants}
          initial="hidden"
          animate="visible"
        >
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
        </motion.div>

        {/* ── Anime List — organic scale spring pop ── */}
        <motion.ul
          className="space-y-2.5 mb-4"
          variants={cardPopVariants}
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

        {/* ── Anime Search Shortcut Button ── */}
        <motion.button
          className="w-full mt-4 py-2.5 rounded-xl text-sm font-bold tracking-wide flex items-center justify-center gap-2 transition-all"
          style={{
            background: isCyber
              ? "linear-gradient(135deg, rgba(0,245,255,0.08), rgba(191,95,255,0.08))"
              : "rgba(255,107,53,0.08)",
            border: isCyber ? "1px solid rgba(0,245,255,0.25)" : "2px dashed rgba(255,107,53,0.4)",
            color: isCyber ? "rgba(0,245,255,0.8)" : "#FF6B35",
            fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
          }}
          whileHover={{
            scale: 1.01,
            backgroundColor: isCyber ? "rgba(0,245,255,0.06)" : "rgba(255,107,53,0.12)",
            boxShadow: isCyber ? "0 0 16px rgba(0,245,255,0.15)" : "none",
          }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setSearchOpen(true)}
        >
          <span>🔍</span>
          <span>{isCyber ? "SEARCH ANIME.DB" : "Search & Log Anime"}</span>
        </motion.button>

      </BentoCard>

      {/* Anime Search Modal */}
      <AnimeSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </motion.div>
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
