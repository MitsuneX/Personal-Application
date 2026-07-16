"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
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
  const media = useDashboardStore((s) => s.media);
  const dramas = useDashboardStore((s) => s.dramas);
  const dramaLog = useDashboardStore((s) => s.dramaLog);
  const [searchOpen, setSearchOpen] = useState(false);

  // Map local + OMDb dramas to a unified structure
  const unifiedDramas = React.useMemo(() => {
    return [
      ...dramas.map((d) => ({
        title: d.title,
        episodes: d.episodes,
        episodesWatched: d.episodesWatched,
        status: d.status,
        rating: d.rating,
        genre: d.genre,
        year: d.year,
        platform: d.platform || "Local",
        type: "Series",
      })),
      ...dramaLog.map((d) => {
        const isCompleted = d.statusBadge === "Classic" || d.statusBadge === "GOAT Status";
        return {
          title: d.title,
          episodes: d.type === "Movie" ? 1 : 16,
          episodesWatched: isCompleted ? (d.type === "Movie" ? 1 : 16) : 0,
          status: isCompleted ? ("Completed" as const) : ("Watching" as const),
          rating: d.rating ? Math.round(parseFloat(d.rating)) : 8,
          genre: d.type || "Series",
          year: d.releaseYear || 2026,
          platform: "OMDb Log",
          type: d.type,
        };
      }),
    ];
  }, [dramas, dramaLog]);

  // Find the current active watching series
  const currentWatching = React.useMemo(() => {
    return unifiedDramas.find((d) => d.status === "Watching" && d.type !== "Movie");
  }, [unifiedDramas]);

  // Find the top-rated completed show/movie
  const topRatedDrama = React.useMemo(() => {
    const completed = unifiedDramas.filter((d) => d.status === "Completed");
    if (completed.length === 0) return null;
    return [...completed].sort((a, b) => b.rating - a.rating)[0];
  }, [unifiedDramas]);

  const activeSeries = currentWatching || {
    title: media.currentSeries.title,
    episodesWatched: media.currentSeries.episode,
    episodes: media.currentSeries.totalEpisodes,
    platform: media.currentSeries.platform,
  };

  const activeTopFilm = topRatedDrama || {
    title: media.topFilm.title,
    year: media.topFilm.year,
    genre: media.topFilm.genre,
    rating: media.topFilm.rating,
  };

  const topFilmLabel = topRatedDrama
    ? topRatedDrama.type === "Movie" ? "Top Film" : "Top Show"
    : "Top Film";

  const seriesProgress = Math.round(
    (activeSeries.episodesWatched / Math.max(1, activeSeries.episodes)) * 100
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
                  {topFilmLabel}
                </p>
                <p className="theme-text-primary font-black text-sm leading-tight truncate">
                  {activeTopFilm.title}
                </p>
                <p className="theme-text-muted text-xs truncate">
                  {activeTopFilm.year} · {activeTopFilm.genre}
                </p>
                <div className="mt-1.5">
                  <StarRating rating={activeTopFilm.rating} />
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
            <p className="theme-text-primary font-black text-sm leading-tight mb-0.5 truncate">
              {activeSeries.title}
            </p>
            <p className="theme-text-muted text-xs mb-2 truncate">
              Ep. {activeSeries.episodesWatched} / {activeSeries.episodes} · {activeSeries.platform}
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

        {/* Drama Search Button */}
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
          <span>{isCyber ? "SEARCH DRAMA.DB" : "Search & Log a Drama"}</span>
        </motion.button>

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
