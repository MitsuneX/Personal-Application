"use client";

import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { cardVariants } from "@/lib/theme/motionVariants";
import type { MediaStatus, HallOfFameEntry } from "@/lib/store/dashboardStore";
import { useRouter } from "next/navigation";
import Image from "next/image";

// ─── Constants & Styles ────────────────────────────────────────────────────────

export const NATIONALITY_GROUPS = [
  {
    code: "Korea",
    title: "🇰🇷 Korean",
    description: "Hallyu superstars and K-drama absolute favorites",
    accentColor: "#FF7EB9",
    accentBg: "rgba(255,126,185,0.06)",
    accentBorder: "rgba(255,126,185,0.3)",
    brutalBorder: "#CC3377",
    brutalBg: "#FFF0F6",
  },
  {
    code: "China",
    title: "🇨🇳 Chinese",
    description: "C-drama elites and imperial-era screen icons",
    accentColor: "#FF4444",
    accentBg: "rgba(255,68,68,0.06)",
    accentBorder: "rgba(255,68,68,0.3)",
    brutalBorder: "#CC1111",
    brutalBg: "#FFF5F5",
  },
  {
    code: "Japan",
    title: "🇯🇵 Japanese",
    description: "J-drama royalty and cinematic masters",
    accentColor: "#FF8C69",
    accentBg: "rgba(255,140,105,0.06)",
    accentBorder: "rgba(255,140,105,0.3)",
    brutalBorder: "#CC4400",
    brutalBg: "#FFF8F5",
  },
  {
    code: "Hollywood",
    title: "🎬 Hollywood",
    description: "Western screen icons and marquee talent",
    accentColor: "#FFD700",
    accentBg: "rgba(255,215,0,0.06)",
    accentBorder: "rgba(255,215,0,0.3)",
    brutalBorder: "#B59300",
    brutalBg: "#FFFDF0",
  },
  {
    code: "Indonesia",
    title: "🇮🇩 Indonesian",
    description: "Indonesian film stars and legendary screen talents",
    accentColor: "#E60000",
    accentBg: "rgba(230,0,0,0.06)",
    accentBorder: "rgba(230,0,0,0.3)",
    brutalBorder: "#800000",
    brutalBg: "#FFE6E6",
  },
];

export const OTHER_GROUP = {
  code: "__other__",
  title: "🎤 Singer",
  description: "Vocal powerhouses and musical legends",
  accentColor: "#00F5FF",
  accentBg: "rgba(0,245,255,0.06)",
  accentBorder: "rgba(0,245,255,0.3)",
  brutalBorder: "#007A8A",
  brutalBg: "#F0FFFE",
};

export const ANIME_GROUP = {
  code: "Anime",
  title: "⛩️ Anime Ranked",
  description: "Ranked anime characters and legendary heroes",
  accentColor: "#FF5E97",
  accentBg: "rgba(255,94,151,0.06)",
  accentBorder: "rgba(255,94,151,0.3)",
  brutalBorder: "#CC2D63",
  brutalBg: "#FFF0F4",
};

export const STATUS_STYLE: Record<MediaStatus, { bg: string; color: string; label: string; cyberGlow: string }> = {
  "GOAT Status": { bg: "rgba(255,215,0,0.15)",  color: "#FFD700", label: "👑 GOAT",     cyberGlow: "rgba(255,215,0,0.5)"   },
  "All-Star":    { bg: "rgba(0,245,255,0.1)",   color: "#00BFFF", label: "⭐ All-Star",  cyberGlow: "rgba(0,191,255,0.4)"   },
  "Rising":      { bg: "rgba(57,255,20,0.1)",   color: "#39FF14", label: "🚀 Rising",   cyberGlow: "rgba(57,255,20,0.35)"  },
  "Classic":     { bg: "rgba(191,95,255,0.1)",  color: "#BF5FFF", label: "💎 Classic",  cyberGlow: "rgba(191,95,255,0.35)" },
};

export const BRUTAL_STATUS_STYLE: Record<MediaStatus, { bg: string; border: string; color: string }> = {
  "GOAT Status": { bg: "rgba(255,215,0,0.15)",  border: "#CC9900", color: "#8A6200" },
  "All-Star":    { bg: "rgba(0,150,200,0.1)",   border: "#0077AA", color: "#004A6E" },
  "Rising":      { bg: "rgba(6,214,160,0.1)",   border: "#2E8B10", color: "#1A5A08" },
  "Classic":     { bg: "rgba(157,78,221,0.1)",  border: "#7B3FA8", color: "#4A1A6E" },
};

export const getGroupForEntry = (entry: HallOfFameEntry) => {
  if (entry.type === "anime") return "Anime";
  const nat = entry.nationality;
  if (nat === "Korea" || nat === "Korean") return "Korea";
  if (nat === "China" || nat === "Chinese") return "China";
  if (nat === "Japan" || nat === "Japanese") return "Japan";
  if (nat === "Indonesia" || nat === "Indonesian") return "Indonesia";
  if (nat === "Hollywood" || nat === "American" || nat === "Canadian") return "Hollywood";
  return "__other__";
};

export const getGroupDetails = (code: string) => {
  if (code === "Korea") return NATIONALITY_GROUPS[0];
  if (code === "China") return NATIONALITY_GROUPS[1];
  if (code === "Japan") return NATIONALITY_GROUPS[2];
  if (code === "Hollywood") return NATIONALITY_GROUPS[3];
  if (code === "Indonesia") return NATIONALITY_GROUPS[4];
  if (code === "Anime") return ANIME_GROUP;
  return OTHER_GROUP;
};

export const getTypeLabel = (entry: HallOfFameEntry) => {
  if (entry.tokusatsuFranchise) {
    return `🦸 ${entry.tokusatsuFranchise}`;
  }
  if (entry.type === "actor") return "🎭 Actor";
  if (entry.type === "actress") return "💫 Actress";
  if (entry.type === "anime") return "⛩️ Anime";
  return "👤 Entity";
};

export const getTrend = (id: string) => {
  const sum = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const mod = sum % 5;
  if (mod === 0) return { icon: "▲", label: "+1", color: "#39FF14", text: "text-green-400" };
  if (mod === 1) return { icon: "▼", label: "-1", color: "#FF4444", text: "text-red-400" };
  if (mod === 2) return { icon: "▲", label: "+2", color: "#39FF14", text: "text-green-400" };
  return { icon: "•", label: "stable", color: "#94A3B8", text: "text-slate-400" };
};

// ─── Entry Card Component ────────────────────────────────────────────────────────

interface CardProps {
  entry: HallOfFameEntry;
  idx: number;
  isCyber: boolean;
  group: typeof NATIONALITY_GROUPS[0] | typeof OTHER_GROUP;
  onEdit: (entry: HallOfFameEntry) => void;
  onDelete: (id: string, name: string) => void;
  showType?: boolean;
  podiumRank?: number | null;
  onDoubleTap?: (e: React.MouseEvent | React.TouchEvent, id: string) => void;
}

export function HofEntryCard({ entry, idx, isCyber, group, onEdit, onDelete, showType = false, podiumRank = null, onDoubleTap }: CardProps) {
  const [imgError, setImgError] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const { likeHof, dramas, dramaLog, animeList } = useDashboardStore();
  const router = useRouter();

  // Clean Double tap and Click handlers
  const lastTapRef = useRef<number>(0);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onDoubleTap) onDoubleTap(e, entry.id);
    likeHof(entry.id);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      e.preventDefault();
      if (onDoubleTap) onDoubleTap(e, entry.id);
      likeHof(entry.id);
      lastTapRef.current = 0; // Reset
    } else {
      lastTapRef.current = now;
    }
  };

  const cyberStyle  = STATUS_STYLE[entry.status]  || STATUS_STYLE["GOAT Status"];
  const brutalStyle = BRUTAL_STATUS_STYLE[entry.status] || BRUTAL_STATUS_STYLE["GOAT Status"];

  const initials = entry.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const hasImage = !!entry.imageUrl && !imgError;

  // Normal stylings
  let borderStyle = isCyber ? `1px solid ${group.accentBorder}` : `2.5px solid ${group.brutalBorder}`;
  let shadowStyle = isCyber ? `0 0 20px ${group.accentBg}, 0 4px 20px rgba(0,0,0,0.4)` : `4px 4px 0px 0px #000`;
  let bgStyle = isCyber ? "linear-gradient(160deg, rgba(10,15,44,0.98), rgba(10,15,44,0.9))" : "#FFFFFF";

  // Dynamic badge highlights for name (border outline)
  let nameBorderStyle = "transparent";
  if (podiumRank === 1) nameBorderStyle = "#EAB308";
  else if (podiumRank === 2) nameBorderStyle = "#94A3B8";
  else if (podiumRank === 3) nameBorderStyle = "#B45309";
  else nameBorderStyle = isCyber ? group.accentBorder : group.brutalBorder;

  return (
    <motion.div
      variants={cardVariants}
      custom={idx}
      id={`entry-${entry.id}`}
      className="group relative cursor-pointer select-none w-full max-w-[280px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDoubleClick={handleDoubleClick}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="rounded-2xl overflow-hidden h-full flex flex-col relative transition-all"
        style={{
          background: bgStyle,
          border: borderStyle,
          boxShadow: shadowStyle,
        }}
      >
        {/* ── Photo / Avatar Section ── */}
        <div
          className="relative w-full overflow-hidden flex items-center justify-center"
          style={{
            height: "230px",
            background: hasImage
              ? "transparent"
              : isCyber
                ? `linear-gradient(135deg, rgba(10,15,44,0.9), ${group.accentBg})`
                : group.brutalBg ?? "#F5F5F5",
          }}
        >
          {hasImage ? (
            <Image
              src={entry.imageUrl!}
              alt={entry.name}
              fill
              priority={idx < 4}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 250px"
              className="object-cover object-[center_30%]"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <span
                className="text-5xl font-black"
                style={{ color: isCyber ? group.accentColor : group.brutalBorder }}
              >
                {initials}
              </span>
              <span className="text-xs font-semibold opacity-40">No Photo</span>
            </div>
          )}

          {/* Gradient overlay at bottom of photo */}
          <div
            className="absolute inset-x-0 bottom-0 h-10"
            style={{
              background: isCyber
                ? "linear-gradient(to top, rgba(10,15,44,0.98), transparent)"
                : "linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0))",
            }}
          />

          {/* Status pill overlay (bottom left of photo) */}
          <div className="absolute bottom-2 left-3">
            <span
              className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: isCyber ? `${cyberStyle.bg}` : "rgba(255,255,255,0.9)",
                color: isCyber ? cyberStyle.color : brutalStyle.color,
                border: isCyber ? `1px solid ${cyberStyle.color}40` : `1px solid ${brutalStyle.border}`,
                backdropFilter: "blur(4px)",
              }}
            >
              {entry.status}
            </span>
          </div>
        </div>

        {/* ── Info Section ── */}
        <div className="p-4 flex flex-col gap-2 flex-1">
          {/* Type badge */}
          {showType && (
            <span
              className="self-start text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)",
                color: isCyber ? "#94A3B8" : "#555",
              }}
            >
              {getTypeLabel(entry)}
            </span>
          )}

          {/* Name with Dynamic Micro-border Highlight */}
          <div className="flex items-center">
            <h3 
              className="font-black text-sm leading-tight theme-text-primary px-1.5 py-0.5 rounded"
              style={{ border: `1px solid ${nameBorderStyle}` }}
            >
              {entry.name}
            </h3>
          </div>

          {/* Likes score inline */}
          <div className="text-[10px] theme-text-secondary flex items-center gap-1 font-mono">
            <span>❤️</span>
            <span className="font-bold">{entry.likes || 0} Likes</span>
          </div>

          {/* Note */}
          {entry.note && (
            <p className="text-[10px] theme-text-muted italic leading-relaxed line-clamp-2">
              &quot;{entry.note}&quot;
            </p>
          )}

          {/* Tokusatsu Show Tag */}
          {entry.tokusatsuShow && (
            <p className="text-[10px] font-bold text-[#00F5FF] flex items-center gap-1">
              <span>🎭 Show:</span>
              <span className="opacity-90">{entry.tokusatsuShow}</span>
            </p>
          )}

          {/* Associated J-Dramas */}
          {entry.associatedDramas && entry.associatedDramas.length > 0 && (
            <div className="flex flex-col gap-1 mt-1">
              <span className="text-[9px] font-black uppercase tracking-wider theme-text-muted">Associated J-Dramas</span>
              <div className="flex flex-wrap gap-1">
                {entry.associatedDramas.map((drama) => {
                  const matchedDrama = dramas.find(d => d.title.toLowerCase() === drama.toLowerCase()) ||
                                       dramaLog.find(d => d.title.toLowerCase() === drama.toLowerCase());
                  const matchedAnime = animeList.find(a => a.title.toLowerCase() === drama.toLowerCase());
                  
                  if (matchedDrama) {
                    return (
                      <button
                        key={drama}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/drama/${matchedDrama.country}?id=${matchedDrama.id}`);
                        }}
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded border cursor-pointer hover:underline flex items-center gap-0.5"
                        style={{
                          backgroundColor: isCyber ? "rgba(0,245,255,0.08)" : "#E8F7F7",
                          borderColor: isCyber ? "rgba(0,245,255,0.25)" : "#2EC4B6",
                          color: isCyber ? "#00F5FF" : "#0d6e65",
                        }}
                      >
                        🎬 {drama}
                      </button>
                    );
                  }
                  
                  if (matchedAnime) {
                    return (
                      <button
                        key={drama}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/anime?id=${matchedAnime.id}`);
                        }}
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded border cursor-pointer hover:underline flex items-center gap-0.5"
                        style={{
                          backgroundColor: isCyber ? "rgba(191,95,255,0.08)" : "#FFF5EE",
                          borderColor: isCyber ? "rgba(191,95,255,0.25)" : "#FF6B35",
                          color: isCyber ? "#BF5FFF" : "#b24013",
                        }}
                      >
                        ⛩️ {drama}
                      </button>
                    );
                  }

                  return (
                    <span
                      key={drama}
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded border opacity-75"
                      style={{
                        backgroundColor: isCyber ? "rgba(255,255,255,0.02)" : "#F5F5F5",
                        borderColor: isCyber ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
                        color: isCyber ? "#94A3B8" : "#666",
                      }}
                    >
                      📺 {drama}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Known For tags */}
          <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
            {entry.knownFor.slice(0, 3).map((work) => (
              <span
                key={work}
                className="text-[9px] font-semibold px-2 py-0.5 rounded-md border"
                style={{
                  backgroundColor: isCyber ? "rgba(255,255,255,0.03)" : "#F8F8F8",
                  borderColor: isCyber ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)",
                  color: isCyber ? "#94A3B8" : "#555",
                }}
              >
                {work}
              </span>
            ))}
          </div>
        </div>

        {/* ── Hover Action Buttons ── */}
        <div
          className="absolute top-2 left-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 z-40"
        >
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(entry); }}
            className="px-2 py-1 text-[10px] font-black rounded-lg backdrop-blur-sm transition-colors"
            style={{
              backgroundColor: isCyber ? "rgba(0,245,255,0.2)" : "rgba(255,255,255,0.9)",
              color: isCyber ? "#00F5FF" : "#333",
              border: isCyber ? "1px solid rgba(0,245,255,0.4)" : "1.5px solid #000",
            }}
          >
            ✏️ Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(entry.id, entry.name); }}
            className="px-2 py-1 text-[10px] font-black rounded-lg backdrop-blur-sm transition-colors"
            style={{
              backgroundColor: "rgba(239,68,68,0.2)",
              color: "#EF4444",
              border: "1px solid rgba(239,68,68,0.4)",
            }}
          >
            🗑️
          </button>
        </div>
      </div>

      {/* ── Framer Motion Hover details micro-card ── */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="absolute inset-0 z-30 p-4 flex flex-col justify-between backdrop-blur-md rounded-2xl border cursor-pointer"
            onClick={() => router.push(`/hall-of-fame?id=${entry.id}`)}
            style={{
              backgroundColor: isCyber ? "rgba(10, 15, 30, 0.96)" : "rgba(255, 255, 255, 0.98)",
              borderColor: isCyber ? "#00F5FF" : "#000",
              borderWidth: isCyber ? "1.5px" : "2.5px",
              boxShadow: isCyber ? "0 0 25px rgba(0, 245, 255, 0.3)" : "none",
            }}
          >
            {/* Hover details content */}
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: isCyber ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                    color: isCyber ? "#94A3B8" : "#555",
                  }}
                >
                  {entry.nationality || "Unknown"}
                </span>
                <span className="text-[10px] font-black text-amber-500 font-mono">
                  {podiumRank ? `👑 Podium Rank #${podiumRank}` : "Legend"}
                </span>
              </div>

              <div>
                <h4 className="font-black text-sm theme-text-primary leading-tight px-1 py-0.5 rounded border border-transparent hover:border-adaptive-unique inline-block">{entry.name}</h4>
                <p className="text-[8px] theme-text-muted mt-0.5 uppercase tracking-widest font-mono">
                  {getTypeLabel(entry)}
                </p>
              </div>

              {entry.note && (
                <p className="text-[10px] theme-text-secondary leading-relaxed italic max-h-[50px] overflow-y-auto pr-1">
                  &quot;{entry.note}&quot;
                </p>
              )}

              {entry.knownFor && entry.knownFor.length > 0 && (
                <div>
                  <p className="text-[8px] font-black uppercase tracking-wider theme-text-muted mb-1">Famous Works</p>
                  <div className="flex flex-wrap gap-1">
                    {entry.knownFor.map((w) => (
                      <span key={w} className="text-[8px] px-1.5 py-0.5 rounded border border-adaptive-unique bg-black/5 dark:bg-white/5 theme-text-primary">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Like Counter & Endless Spammer Button */}
            <div className="pt-2 border-t border-adaptive-unique flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-wider theme-text-muted">Total Score</span>
                <span className="text-xs font-black theme-text-primary font-mono">{entry.likes || 0} Likes</span>
              </div>
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (onDoubleTap) onDoubleTap(e, entry.id);
                  likeHof(entry.id);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 1.35 }}
                transition={{ type: "spring", stiffness: 500, damping: 8 }}
                className="px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all select-none border-adaptive-unique"
                style={{
                  backgroundColor: isCyber ? "rgba(255,20,147,0.2)" : "#FF4444",
                  color: isCyber ? "#FF1493" : "#FFF",
                  boxShadow: isCyber ? "0 0 10px rgba(255,20,147,0.3)" : "2px 2px 0 #000",
                }}
              >
                <span>❤️</span>
                <span>LIKE</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
