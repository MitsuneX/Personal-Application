"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { BentoCard } from "./BentoCard";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import type { MediaStatus } from "@/lib/store/dashboardStore";

const STATUS_STYLE: Record<
  MediaStatus,
  { bg: string; color: string; borderCyber: string; borderBrutal: string }
> = {
  "GOAT Status": {
    bg: "rgba(255,215,0,0.12)",
    color: "#FFD700",
    borderCyber: "rgba(255,215,0,0.5)",
    borderBrutal: "#CC9900",
  },
  "All-Star": {
    bg: "rgba(0,245,255,0.1)",
    color: "#00BFFF",
    borderCyber: "rgba(0,245,255,0.4)",
    borderBrutal: "#0077AA",
  },
  Rising: {
    bg: "rgba(57,255,20,0.08)",
    color: "#39FF14",
    borderCyber: "rgba(57,255,20,0.4)",
    borderBrutal: "#2E8B10",
  },
  Classic: {
    bg: "rgba(191,95,255,0.1)",
    color: "#BF5FFF",
    borderCyber: "rgba(191,95,255,0.4)",
    borderBrutal: "#7B3FA8",
  },
};

function StarRating({ rating, max = 10 }: { rating: number; max?: number }) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const filled = Math.round(rating / 2);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.span
          key={i}
          className="text-xs"
          animate={{
            color: i < filled
              ? isCyber ? "#00F5FF" : "#FF6B35"
              : isCyber ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.2)",
            filter: i < filled && isCyber
              ? "drop-shadow(0 0 4px rgba(0,245,255,0.9))"
              : "none",
          }}
          transition={{ delay: i * 0.05, duration: 0.4 }}
        >
          ★
        </motion.span>
      ))}
      <span
        className="text-xs ml-1 font-mono font-bold"
        style={{ color: isCyber ? "rgba(0,245,255,0.7)" : "rgba(0,0,0,0.5)" }}
      >
        {rating}/10
      </span>
    </div>
  );
}

// ─── Cinematic Slide Entry Variants ───────────────────────────────────────────

const cinematicContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const cinematicSlideVariants = {
  hidden: { opacity: 0, x: -40, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 22,
    },
  },
};

export function MediaLogCard() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const media = useDashboardStore((s) => s.media);

  const seriesProgress = Math.round(
    (media.currentSeries.episode / media.currentSeries.totalEpisodes) * 100
  );

  return (
    <motion.div layout className="col-span-1 md:col-span-1 lg:col-span-2 xl:col-span-2">
      <BentoCard id="media-log-card">
        {/* Header */}
        <motion.div
          className="flex items-center gap-2 mb-4"
          variants={cinematicSlideVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.span
            className="text-2xl"
            animate={{ filter: isCyber ? "drop-shadow(0 0 8px rgba(191,95,255,0.8))" : "none" }}
            transition={{ duration: 0.4 }}
          >
            🎬
          </motion.span>
          <div>
            <motion.h2
              className="font-black text-base leading-tight theme-text-primary"
              animate={{ fontFamily: isCyber ? "var(--font-orbitron)" : "inherit" }}
              transition={{ duration: 0.4 }}
            >
              {isCyber ? "MEDIA.LOG" : "Media & Drama Log"}
            </motion.h2>
            <p className="theme-text-muted text-xs tracking-widest uppercase">
              Films · Series · Talent
            </p>
          </div>
        </motion.div>

        {/* Top section: Film + Series — cinematic stagger slide */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4"
          variants={cinematicContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Top Film */}
          <motion.div
            className="rounded-lg p-3 relative overflow-hidden"
            variants={cinematicSlideVariants}
            animate={{
              background: isCyber ? "rgba(0,245,255,0.04)" : "rgba(255,107,53,0.06)",
              borderColor: isCyber ? "rgba(0,245,255,0.2)" : "rgba(0,0,0,0.2)",
            }}
            transition={{ duration: 0.4 }}
            style={{ border: "1px solid" }}
          >
            <div className="flex items-start gap-2">
              <motion.div
                className="text-2xl shrink-0 rounded-md w-10 h-10 flex items-center justify-center"
                animate={{
                  backgroundColor: isCyber ? "rgba(0,245,255,0.1)" : "#FF6B35",
                  boxShadow: isCyber ? "0 0 12px rgba(0,245,255,0.4)" : "2px 2px 0px 0px rgba(0,0,0,1)",
                }}
                transition={{ duration: 0.4 }}
              >
                🏆
              </motion.div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-bold tracking-widest uppercase mb-1"
                  style={{ color: isCyber ? "rgba(0,245,255,0.6)" : "rgba(0,0,0,0.5)" }}
                >
                  Top Film
                </p>
                <p className="theme-text-primary font-black text-sm leading-tight">
                  {media.topFilm.title}
                </p>
                <p className="theme-text-muted text-xs">{media.topFilm.year} · {media.topFilm.genre}</p>
                <div className="mt-1.5">
                  <StarRating rating={media.topFilm.rating} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Current Series */}
          <motion.div
            className="rounded-lg p-3 relative overflow-hidden"
            variants={cinematicSlideVariants}
            animate={{
              background: isCyber ? "rgba(191,95,255,0.04)" : "rgba(6,214,160,0.06)",
              borderColor: isCyber ? "rgba(191,95,255,0.2)" : "rgba(0,0,0,0.2)",
            }}
            transition={{ duration: 0.4 }}
            style={{ border: "1px solid" }}
          >
            <p
              className="text-xs font-bold tracking-widest uppercase mb-2"
              style={{ color: isCyber ? "rgba(191,95,255,0.7)" : "rgba(0,0,0,0.5)" }}
            >
              Now Streaming
            </p>
            <p className="theme-text-primary font-black text-sm leading-tight mb-0.5">
              {media.currentSeries.title}
            </p>
            <p className="theme-text-muted text-xs mb-2">
              Ep. {media.currentSeries.episode} / {media.currentSeries.totalEpisodes} · {media.currentSeries.platform}
            </p>

            {/* Progress bar */}
            <div className="progress-track">
              <motion.div
                className="progress-fill"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: seriesProgress / 100 }}
                transition={{ type: "spring", stiffness: 80, damping: 18, delay: 0.6 }}
                style={{ transformOrigin: "left" }}
              />
            </div>
            <p
              className="text-xs font-mono mt-1"
              style={{ color: isCyber ? "rgba(191,95,255,0.7)" : "rgba(0,0,0,0.45)" }}
            >
              {seriesProgress}% complete
            </p>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <div
          className="h-px mb-4"
          style={{ background: isCyber ? "rgba(0,245,255,0.1)" : "rgba(0,0,0,0.1)" }}
        />

        {/* Talent sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TalentSection title="Actors" entries={media.actors} isCyber={isCyber} />
          <TalentSection title="Actresses" entries={media.actresses} isCyber={isCyber} />
        </div>
      </BentoCard>
    </motion.div>
  );
}

// ─── Talent Section ───────────────────────────────────────────────────────────

interface TalentSectionProps {
  title: string;
  entries: ReturnType<typeof useDashboardStore.getState>["media"]["actors"];
  isCyber: boolean;
}

function TalentSection({ title, entries, isCyber }: TalentSectionProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div>
      <motion.p
        className="text-xs font-bold tracking-widest uppercase mb-2"
        variants={cinematicSlideVariants}
        initial="hidden"
        animate="visible"
        style={{ color: isCyber ? "rgba(0,245,255,0.5)" : "rgba(0,0,0,0.4)" }}
      >
        {title}
      </motion.p>
      <motion.ul
        className="space-y-2"
        variants={cinematicContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {entries.map((entry, i) => {
          const style = STATUS_STYLE[entry.status];
          const isThisHovered = hoveredId === entry.id;
          const isOtherHovered = hoveredId !== null && hoveredId !== entry.id;

          return (
            <motion.li
              key={entry.id}
              variants={cinematicSlideVariants}
              custom={i}
              className="flex items-center justify-between gap-2 cursor-default"
              onHoverStart={() => setHoveredId(entry.id)}
              onHoverEnd={() => setHoveredId(null)}
              animate={{
                scale: isThisHovered ? 1.05 : isOtherHovered ? 0.97 : 1,
                opacity: isOtherHovered ? 0.45 : 1,
                filter: isOtherHovered ? "blur(1.5px)" : "blur(0px)",
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="min-w-0">
                <p className="theme-text-primary text-sm font-bold truncate">
                  {entry.name}
                </p>
                <p className="theme-text-muted text-xs truncate">{entry.knownFor}</p>
              </div>
              <motion.span
                className="theme-badge shrink-0"
                style={{
                  backgroundColor: style.bg,
                  color: style.color,
                  borderColor: isCyber ? style.borderCyber : style.borderBrutal,
                }}
                whileHover={{ scale: 1.06 }}
                animate={
                  isCyber && entry.status === "GOAT Status"
                    ? { boxShadow: ["0 0 6px rgba(255,215,0,0.4)", "0 0 14px rgba(255,215,0,0.6)", "0 0 6px rgba(255,215,0,0.4)"] }
                    : {}
                }
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                {entry.status}
              </motion.span>
            </motion.li>
          );
        })}
      </motion.ul>
    </div>
  );
}
