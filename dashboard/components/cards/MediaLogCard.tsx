"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BentoCard } from "./BentoCard";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { DramaSearchModal } from "@/components/ui/DramaSearchModal";
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
  const dramas = useDashboardStore((s) => s.dramas);
  const dramaLog = useDashboardStore((s) => s.dramaLog);
  const hallOfFame = useDashboardStore((s) => s.hallOfFame);
  const [searchOpen, setSearchOpen] = useState(false);

  // Map local + OMDb dramas to a unified dynamic structure
  const unifiedDramas = React.useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      episodes: number;
      episodesWatched: number;
      status: "Watching" | "Completed" | "Plan to Watch" | "On Hold";
      rating: number;
      genre: string;
      year: number;
      platform: string;
      type: "Movie" | "Series";
    }> = [];

    if (Array.isArray(dramas)) {
      dramas.forEach((d) => {
        list.push({
          id: d.id,
          title: d.title,
          episodes: d.episodes || 16,
          episodesWatched: d.episodesWatched || 0,
          status: d.status || "Watching",
          rating: typeof d.rating === "number" ? d.rating : parseFloat(d.rating || "0") || 0,
          genre: d.genre || "Drama",
          year: d.year || 2026,
          platform: d.platform || "Drama Hub",
          type: "Series",
        });
      });
    }

    if (Array.isArray(dramaLog)) {
      dramaLog.forEach((d) => {
        const isCompleted = d.statusBadge === "Classic" || d.statusBadge === "GOAT Status";
        const episodes = d.totalEpisodes || (d.type === "Movie" ? 1 : 16);
        const watched = d.episodesWatched ?? (isCompleted ? episodes : 0);
        const parsedRating = d.rating ? parseFloat(d.rating) : 0;
        list.push({
          id: d.id,
          title: d.title,
          episodes: episodes,
          episodesWatched: watched,
          status: isCompleted ? "Completed" : "Watching",
          rating: isNaN(parsedRating) ? 0 : parsedRating,
          genre: d.type || "Series",
          year: d.releaseYear || 2026,
          platform: "OMDb Log",
          type: d.type || "Series",
        });
      });
    }

    return list;
  }, [dramas, dramaLog]);

  // Find active watching series (or null if none)
  const activeSeries = React.useMemo(() => {
    if (unifiedDramas.length === 0) return null;
    const watching = unifiedDramas.find((d) => d.status === "Watching" && d.type !== "Movie");
    if (watching) return watching;
    const watchingAny = unifiedDramas.find((d) => d.status === "Watching");
    if (watchingAny) return watchingAny;
    return null;
  }, [unifiedDramas]);

  // Find top-rated show/film (or null if empty)
  const activeTopFilm = React.useMemo(() => {
    if (unifiedDramas.length === 0) return null;
    const sorted = [...unifiedDramas].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return sorted[0] || null;
  }, [unifiedDramas]);

  const seriesProgress = activeSeries
    ? activeSeries.status === "Completed"
      ? 100
      : Math.round(
          (activeSeries.episodesWatched / Math.max(1, activeSeries.episodes)) * 100
        )
    : 0;

  // Dynamic Hall of Fame Actors Sync (Strictly capped at top 4 max)
  const actorsList = React.useMemo(() => {
    if (!Array.isArray(hallOfFame)) return [];
    return hallOfFame
      .filter((h) => h.type === "actor")
      .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
      .slice(0, 4)
      .map((h) => ({
        id: h.id,
        name: h.name,
        status: (h.status || "GOAT Status") as MediaStatus,
        knownFor: Array.isArray(h.knownFor) ? h.knownFor.join(", ") : h.knownFor || "Drama Series",
        rank: h.rank,
      }));
  }, [hallOfFame]);

  // Dynamic Hall of Fame Actresses Sync (Strictly capped at top 4 max)
  const actressesList = React.useMemo(() => {
    if (!Array.isArray(hallOfFame)) return [];
    return hallOfFame
      .filter((h) => h.type === "actress")
      .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
      .slice(0, 4)
      .map((h) => ({
        id: h.id,
        name: h.name,
        status: (h.status || "GOAT Status") as MediaStatus,
        knownFor: Array.isArray(h.knownFor) ? h.knownFor.join(", ") : h.knownFor || "Drama Series",
        rank: h.rank,
      }));
  }, [hallOfFame]);

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
          {/* Top Film / Show */}
          <motion.div
            className="rounded-lg p-3 relative overflow-hidden flex flex-col justify-between"
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
                  {activeTopFilm ? (activeTopFilm.type === "Movie" ? "Top Film" : "Top Show") : "Top Show / Film"}
                </p>
                <p className="theme-text-primary font-black text-sm leading-tight truncate">
                  {activeTopFilm ? activeTopFilm.title : "No Media Logged"}
                </p>
                <p className="theme-text-muted text-xs truncate mt-0.5">
                  {activeTopFilm ? `${activeTopFilm.year} · ${activeTopFilm.genre}` : "Track dramas in Drama Hub"}
                </p>
                <div className="mt-1.5">
                  <StarRating rating={activeTopFilm ? activeTopFilm.rating : 0} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Current Series */}
          <motion.div
            className="rounded-lg p-3 relative overflow-hidden flex flex-col justify-between"
            variants={cinematicSlideVariants}
            animate={{
              background: isCyber ? "rgba(191,95,255,0.04)" : "rgba(6,214,160,0.06)",
              borderColor: isCyber ? "rgba(191,95,255,0.2)" : "rgba(0,0,0,0.2)",
            }}
            transition={{ duration: 0.4 }}
            style={{ border: "1px solid" }}
          >
            <div>
              <p
                className="text-xs font-bold tracking-widest uppercase mb-2"
                style={{ color: isCyber ? "rgba(191,95,255,0.7)" : "rgba(0,0,0,0.5)" }}
              >
                Now Streaming
              </p>
              <p className="theme-text-primary font-black text-sm leading-tight mb-0.5 truncate">
                {activeSeries ? activeSeries.title : "Nothing Active"}
              </p>
              <p className="theme-text-muted text-xs mb-2 truncate">
                {activeSeries
                  ? `Ep. ${activeSeries.episodesWatched} / ${activeSeries.episodes} · ${activeSeries.platform}`
                  : "0 active shows currently watching"}
              </p>
            </div>

            {/* Progress bar */}
            <div>
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
                {activeSeries ? `${seriesProgress}% complete` : "Idle"}
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <div
          className="h-px mb-4"
          style={{ background: isCyber ? "rgba(0,245,255,0.1)" : "rgba(0,0,0,0.1)" }}
        />

        {/* Dynamic Talent sections synced to Hall of Fame */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TalentSection title="Actors" entries={actorsList} isCyber={isCyber} />
          <TalentSection title="Actresses" entries={actressesList} isCyber={isCyber} />
        </div>

        {/* View Full Hall of Fame & Search Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
          <Link href="/hall-of-fame" className="block">
            <motion.button
              className="w-full py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase font-mono flex items-center justify-center gap-1.5 border cursor-pointer"
              style={{
                background: isCyber ? "rgba(0,245,255,0.06)" : "#FFFFFF",
                borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000000",
                boxShadow: isCyber ? "0 0 12px rgba(0,245,255,0.1)" : "2.5px 2.5px 0px #000000",
                color: isCyber ? "#00F5FF" : "#1A1A1A",
              }}
              whileHover={{ scale: 1.015, y: -1 }}
              whileTap={{ scale: 0.98, y: 1 }}
            >
              <span>🏆</span>
              <span>VIEW HALL OF FAME →</span>
            </motion.button>
          </Link>

          <motion.button
            className="w-full py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase font-mono flex items-center justify-center gap-1.5 border cursor-pointer"
            style={{
              background: isCyber
                ? "linear-gradient(135deg, rgba(0,245,255,0.08), rgba(191,95,255,0.08))"
                : "rgba(255,107,53,0.08)",
              borderColor: isCyber ? "rgba(0,245,255,0.25)" : "2px dashed rgba(255,107,53,0.4)",
              boxShadow: isCyber ? "none" : "2.5px 2.5px 0px #000000",
              color: isCyber ? "rgba(0,245,255,0.9)" : "#FF6B35",
            }}
            whileHover={{
              scale: 1.015,
              y: -1,
              backgroundColor: isCyber ? "rgba(0,245,255,0.12)" : "rgba(255,107,53,0.14)",
            }}
            whileTap={{ scale: 0.98, y: 1 }}
            onClick={() => setSearchOpen(true)}
          >
            <span>🔍</span>
            <span>{isCyber ? "SEARCH DRAMA.DB" : "Search & Log Drama"}</span>
          </motion.button>
        </div>

      </BentoCard>

      {/* Drama Search Modal */}
      <DramaSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </motion.div>
  );
}

// ─── Talent Section ───────────────────────────────────────────────────────────

interface TalentSectionProps {
  title: string;
  entries: Array<{
    id: string;
    name: string;
    status: MediaStatus;
    knownFor: string;
    rank?: number | null;
  }>;
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
      {entries.length === 0 ? (
        <p className="theme-text-muted text-xs italic py-2">
          No {title.toLowerCase()} ranked in Hall of Fame
        </p>
      ) : (
        <motion.ul
          className="space-y-2"
          variants={cinematicContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {entries.map((entry, i) => {
            const style = STATUS_STYLE[entry.status] || STATUS_STYLE["GOAT Status"];
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
                <div className="min-w-0 flex items-center gap-1.5">
                  {entry.rank !== undefined && entry.rank !== null && (
                    <span
                      className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded shrink-0"
                      style={{
                        backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#FFD700",
                        color: isCyber ? "#00F5FF" : "#000000",
                        border: isCyber ? "1px solid rgba(0,245,255,0.3)" : "1.5px solid #000000",
                      }}
                    >
                      #{entry.rank}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="theme-text-primary text-sm font-bold truncate">
                      {entry.name}
                    </p>
                    <p className="theme-text-muted text-xs truncate">{entry.knownFor}</p>
                  </div>
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
      )}
    </div>
  );
}
