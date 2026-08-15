"use client";

import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { cardVariants } from "@/lib/theme/motionVariants";
import type { MediaStatus, HallOfFameEntry } from "@/lib/store/dashboardStore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useContextMenu } from "@/hooks/useContextMenu";
import { duplicateHofEntry } from "@/lib/data/duplicateHelper";
import { getCardVideoUrl, getCardImageUrl, getCardVideoPosterUrl, getCardVideoFraming, getCardVideoPosterFraming } from "@/lib/utils/mediaResolver";
import { LazyCardVideo } from "@/components/cards/LazyCardVideo";

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
    brutalBorder: "#CC8800",
    brutalBg: "#FFFDF0",
  },
  {
    code: "Indonesia",
    title: "🇮🇩 Indonesian",
    description: "Local legends and cinematic powerhouses",
    accentColor: "#FF4444",
    accentBg: "rgba(255,68,68,0.06)",
    accentBorder: "rgba(255,68,68,0.3)",
    brutalBorder: "#CC0000",
    brutalBg: "#FFF5F5",
  },
];

export const OTHER_GROUP = {
  code: "Other",
  title: "⭐ Global Legends",
  description: "Worldwide hall of fame favorites",
  accentColor: "#A855F7",
  accentBg: "rgba(168,85,247,0.06)",
  accentBorder: "rgba(168,85,247,0.3)",
  brutalBorder: "#7E22CE",
  brutalBg: "#FAF5FF",
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

import { isTokusatsuEntry, resolveFranchiseType } from "@/lib/data/tokusatsuDataHelper";

export const getTypeLabel = (entry: HallOfFameEntry) => {
  if (isTokusatsuEntry(entry)) {
    const rawFranchise = entry.tokusatsuFranchise || entry.franchise || entry.series;
    const resolved = resolveFranchiseType(rawFranchise, entry.type, entry.name);
    if (resolved === "KAMEN_RIDER") return "🏍️ Kamen Rider";
    if (resolved === "ULTRAMAN") return "⚡ Ultraman";
    if (resolved === "POWER_RANGERS") return "🔴 Power Rangers";
    if (resolved === "SUPER_SENTAI") return "🛡️ Super Sentai";
    return `🦸 ${entry.tokusatsuFranchise || entry.series || "Tokusatsu"}`;
  }
  if (entry.type === "actor") return "🎭 Actor";
  if (entry.type === "actress") return "💫 Actress";
  if (entry.type === "singer") return "🎤 Singer";
  if (entry.type === "anime") return "⛩️ Anime";
  if (entry.type === "vtuber") return "👾 VTuber";
  if (entry.type === "tokusatsu") return "🦸 Tokusatsu";
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

import { getBadgesForEntry } from "@/lib/utils/hofEngine";

interface CardProps {
  entry: HallOfFameEntry;
  idx: number;
  isCyber: boolean;
  group: typeof NATIONALITY_GROUPS[0] | typeof OTHER_GROUP;
  showType?: boolean;
  podiumRank?: number | null;
  onDoubleTap?: (e: React.MouseEvent | React.TouchEvent, id: string) => void;
  onOpenProfile?: (entry: HallOfFameEntry) => void;
  onCompare?: (entry: HallOfFameEntry) => void;
  // Legacy optional props for backward compatibility
  onEdit?: (entry: HallOfFameEntry) => void;
  onDelete?: (id: string, name: string) => void;
  onDuplicate?: (entry: HallOfFameEntry) => void;
}

export function HofEntryCard({
  entry,
  idx,
  isCyber,
  group,
  showType = false,
  podiumRank = null,
  onDoubleTap,
  onOpenProfile,
  onCompare,
}: CardProps) {
  const [imgError, setImgError] = React.useState(false);
  const [videoError, setVideoError] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [showHeartBurst, setShowHeartBurst] = React.useState(false);
  const { likeHof } = useDashboardStore();
  const { openContextMenu } = useContextMenu();
  const router = useRouter();

  const lastTapRef = useRef<number>(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const executeOpenProfile = () => {
    if (onOpenProfile) {
      onOpenProfile(entry);
    } else {
      const type = (entry.type || "").toLowerCase();
      if ((entry as any).isGameCharacterEntry) {
        router.push(`/game-characters?id=${entry.id}`);
      } else if (isTokusatsuEntry(entry)) {
        router.push(`/characters?category=tokusatsu&id=${entry.id}`);
      } else if (type === "anime") {
        router.push(`/characters?id=${entry.id}`);
      } else {
        router.push(`/hall-of-fame?id=${entry.id}`);
      }
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Delay single-click execution slightly (250ms) to distinguish from double-click
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }
    clickTimerRef.current = setTimeout(() => {
      executeOpenProfile();
      clickTimerRef.current = null;
    }, 250);
  };

  const triggerInstantLike = (e: React.MouseEvent | React.TouchEvent) => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    if (onDoubleTap) onDoubleTap(e, entry.id);
    likeHof(entry.id);
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 700);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    triggerInstantLike(e);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 280;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      e.preventDefault();
      e.stopPropagation();
      triggerInstantLike(e);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    openContextMenu(
      e,
      [
        {
          id: "profile",
          label: `Open ${entry.name} Dossier`,
          icon: "📖",
          onClick: () => executeOpenProfile(),
        },
        {
          id: "compare",
          label: "Compare Entry",
          icon: "⚔️",
          onClick: () => {
            if (onCompare) onCompare(entry);
          },
        },
        {
          id: "like",
          label: `Heart ${entry.name}`,
          icon: "❤️",
          onClick: () => {
            likeHof(entry.id);
            setShowHeartBurst(true);
            setTimeout(() => setShowHeartBurst(false), 700);
          },
        },
        {
          id: "share",
          label: `Copy Profile Link`,
          icon: "🔗",
          onClick: () => {
            navigator.clipboard.writeText(`${window.location.origin}/hall-of-fame?id=${entry.id}`);
          },
        },
      ],
      entry.name
    );
  };

  const initials = entry.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const videoUrl = !videoError ? getCardVideoUrl(entry) : null;
  const cardImg = !imgError ? (getCardImageUrl(entry) || entry.imageUrl || entry.portraitUrl) : null;
  const hasVideo = !!videoUrl;
  const hasImage = !!cardImg;

  const cyberStyle = STATUS_STYLE[entry.status] || STATUS_STYLE["GOAT Status"];
  const brutalStyle = BRUTAL_STATUS_STYLE[entry.status] || BRUTAL_STATUS_STYLE["GOAT Status"];

  const isGold = podiumRank === 1;
  const isSilver = podiumRank === 2;
  const isBronze = podiumRank === 3;

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      custom={idx}
      id={`entry-${entry.id}`}
      className="group relative cursor-pointer select-none overflow-hidden rounded-2xl w-full max-w-[280px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onTouchEnd={handleTouchEnd}
      onContextMenu={handleContextMenu}
      style={{
        aspectRatio: "3/4",
        border: isGold
          ? (isCyber ? `2.5px solid #FFD700` : `3.5px solid #000000`)
          : isSilver
          ? (isCyber ? `2px solid rgba(226,232,240,0.8)` : `3px solid #64748B`)
          : isBronze
          ? (isCyber ? `2px solid rgba(217,119,6,0.8)` : `3px solid #B45309`)
          : podiumRank
          ? (isCyber ? `1.5px solid rgba(0,245,255,0.4)` : `2.5px solid #000000`)
          : (isCyber ? `1.5px solid ${group.accentBorder || "rgba(0,245,255,0.2)"}` : `3px solid #000000`),
        boxShadow: isGold
          ? (isCyber ? `0 0 25px rgba(255,215,0,0.35)` : "6px 6px 0 #000000")
          : isSilver
          ? (isCyber ? `0 0 15px rgba(226,232,240,0.25)` : "5px 5px 0 #000000")
          : isBronze
          ? (isCyber ? `0 0 15px rgba(217,119,6,0.25)` : "5px 5px 0 #000000")
          : (isCyber ? `0 4px 24px rgba(0,0,0,0.6), 0 0 15px ${group.accentBg}` : "5px 5px 0 #000000"),
        backgroundColor: isCyber ? "#090d1c" : "#1A1A1A",
      }}
    >
      {/* ── Layer 0: Full Card Background Artwork ── */}
      <motion.div
        className="absolute inset-0 z-0"
        variants={{ hover: { scale: 1.07 } }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {hasVideo ? (
          <LazyCardVideo
            videoUrl={videoUrl!}
            posterUrl={getCardVideoPosterUrl(entry)}
            framing={getCardVideoFraming(entry)}
            posterFraming={getCardVideoPosterFraming(entry)}
            alt={entry.name}
            onError={() => setVideoError(true)}
          />
        ) : hasImage ? (
          <Image
            src={cardImg!}
            alt={entry.name}
            fill
            priority={idx < 4}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
            className="object-cover object-[center_25%]"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center"
            style={{
              background: isCyber
                ? `radial-gradient(ellipse at 50% 40%, ${group.accentColor}30 0%, transparent 70%), linear-gradient(to bottom, #090d1c 0%, #0d132a 100%)`
                : `radial-gradient(ellipse at 50% 40%, ${group.accentColor}40 0%, transparent 70%), linear-gradient(to bottom, #1f2937 0%, #111827 100%)`,
            }}
          >
            <span className="text-6xl font-black opacity-30 select-none" style={{ color: group.accentColor }}>
              {initials}
            </span>
          </div>
        )}
      </motion.div>

      {/* ── Layer 1: Layered Transparent-to-Dark Gradient ── */}
      <motion.div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: isCyber
            ? "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.1) 25%, rgba(0,0,0,0.65) 60%, rgba(0,0,0,0.95) 100%)"
            : "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.15) 25%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.96) 100%)",
        }}
      />

      {/* ── Layer 2: Top Bar Controls (Status / Rank + Interactive Heart Button) ── */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-1.5 flex-wrap">
          {podiumRank ? (
            <span
              className="px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono shadow-md border flex items-center gap-1"
              style={{
                backgroundColor: isGold
                  ? (isCyber ? "rgba(255,215,0,0.25)" : "#FEF08A")
                  : isSilver
                  ? (isCyber ? "rgba(226,232,240,0.25)" : "#F1F5F9")
                  : isBronze
                  ? (isCyber ? "rgba(217,119,6,0.25)" : "#FFEDD5")
                  : (isCyber ? "rgba(0,245,255,0.15)" : "#E0F2FE"),
                color: isGold
                  ? (isCyber ? "#FFD700" : "#854D0E")
                  : isSilver
                  ? (isCyber ? "#E2E8F0" : "#334155")
                  : isBronze
                  ? (isCyber ? "#F59E0B" : "#9A3412")
                  : (isCyber ? "#00F5FF" : "#0369A1"),
                borderColor: isGold
                  ? (isCyber ? "#FFD700" : "#000")
                  : isSilver
                  ? (isCyber ? "#E2E8F0" : "#000")
                  : isBronze
                  ? (isCyber ? "#F59E0B" : "#000")
                  : (isCyber ? "#00F5FF" : "#000"),
                borderWidth: isCyber ? "1px" : "2px",
                backdropFilter: "blur(8px)",
              }}
            >
              <span>{isGold ? "👑" : isSilver ? "🥈" : isBronze ? "🥉" : "🎖️"}</span>
              <span>#{podiumRank}</span>
            </span>
          ) : (
            <span
              className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-md border shadow-sm"
              style={{
                backgroundColor: isCyber ? `${cyberStyle.bg}` : "rgba(255,255,255,0.95)",
                color: isCyber ? cyberStyle.color : brutalStyle.color,
                border: isCyber ? `1px solid ${cyberStyle.color}50` : `1.5px solid ${brutalStyle.border}`,
              }}
            >
              {entry.status}
            </span>
          )}
        </div>

        {/* Interactive Heart Button (Supports Continuous Likes) */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            likeHof(entry.id);
            setShowHeartBurst(true);
            setTimeout(() => setShowHeartBurst(false), 700);
          }}
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black flex items-center gap-1 transition-all cursor-pointer shadow-md ${
            isCyber
              ? "bg-black/60 text-pink-400 border border-pink-500/40 backdrop-blur-md hover:bg-pink-500/30"
              : "bg-amber-200 text-black border-2 border-black shadow-[2px_2px_0_#000] hover:bg-amber-300"
          }`}
        >
          <span>❤️</span>
          <span>{entry.likes || 0}</span>
        </motion.button>
      </div>

      {/* Instant Heart Burst Animation Feedback on Like */}
      <AnimatePresence>
        {showHeartBurst && (
          <motion.div
            initial={{ scale: 0.5, opacity: 1, y: 0 }}
            animate={{ scale: 1.8, opacity: 0, y: -40 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 text-5xl"
          >
            💖
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Layer 3: Bottom Content Overlay ── */}
      <div className="absolute bottom-0 left-0 right-0 z-30 p-3.5 flex flex-col gap-1.5 pointer-events-none">
        {/* Type / Profession Badge */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`text-[9px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full border backdrop-blur-md ${
              isCyber
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                : "bg-white/95 text-black border-1.5 border-black shadow-[1.5px_1.5px_0_#000]"
            }`}
          >
            {getTypeLabel(entry)}
          </span>

          {entry.nationality && (
            <span
              className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border opacity-90 backdrop-blur-sm ${
                isCyber
                  ? "bg-white/10 text-white/90 border-white/20"
                  : "bg-black/50 text-white border-white/30"
              }`}
            >
              {entry.nationality}
            </span>
          )}
        </div>

        {/* Character / Artist Name */}
        <h3
          className="font-black text-sm sm:text-base leading-tight tracking-wide text-white drop-shadow-md truncate"
          style={{
            fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
          }}
        >
          {entry.name}
        </h3>

        {/* Quote or Enshrinement Note */}
        {entry.note && (
          <p className="text-[10px] text-white/85 italic leading-snug line-clamp-1 drop-shadow">
            &ldquo;{entry.note}&rdquo;
          </p>
        )}

        {/* Famous Works / KnownFor Tags */}
        {entry.knownFor && entry.knownFor.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {entry.knownFor.slice(0, 2).map((work) => (
              <span
                key={work}
                className={`text-[8px] font-mono font-semibold px-1.5 py-0.5 rounded border truncate max-w-[120px] backdrop-blur-sm ${
                  isCyber
                    ? "bg-white/10 text-cyan-200 border-white/15"
                    : "bg-white/20 text-white border-white/30"
                }`}
              >
                {work}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
