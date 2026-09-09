"use client";

import React, { useRef, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CoupleEntry, TIER_COLORS, RELATIONSHIP_STATUS_OPTIONS } from "@/lib/data/coupleSchema";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { useContextMenu } from "@/hooks/useContextMenu";
import { useToast } from "@/components/ui/ToastProvider";
import { RomanticLoveBurst, RomanticLoveBurstHandle } from "@/components/ui/RomanticLoveBurst";
import { triggerHeartEffect } from "@/components/ui/FloatingHeartEngine";

interface HofCoupleCardProps {
  couple: CoupleEntry;
  rank?: number;
  podiumRank?: number | null;
  isCyber: boolean;
  onOpenProfile: (couple: CoupleEntry) => void;
  onCompare?: (couple: CoupleEntry) => void;
}

export function HofCoupleCard({
  couple,
  rank,
  podiumRank = null,
  isCyber,
  onOpenProfile,
  onCompare,
}: HofCoupleCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const { hallOfFame = [], dossierCharacters = [], loveCouple, toggleFavoriteCouple } = useDashboardStore();
  const { openContextMenu } = useContextMenu();
  const { success: toastSuccess } = useToast();

  const loveBurstRef = useRef<RomanticLoveBurstHandle>(null);

  // ── Resolve canonical partner images if not set on couple ───────────────────
  const canonicalA = useMemo(() => {
    if (!couple.partnerA.characterId) return null;
    return (
      hallOfFame.find((h) => h.id === couple.partnerA.characterId) ||
      dossierCharacters.find((d) => d.id === couple.partnerA.characterId) ||
      null
    );
  }, [couple.partnerA.characterId, hallOfFame, dossierCharacters]);

  const canonicalB = useMemo(() => {
    if (!couple.partnerB.characterId) return null;
    return (
      hallOfFame.find((h) => h.id === couple.partnerB.characterId) ||
      dossierCharacters.find((d) => d.id === couple.partnerB.characterId) ||
      null
    );
  }, [couple.partnerB.characterId, hallOfFame, dossierCharacters]);

  const partnerAAvatar =
    couple.partnerA.avatar?.trim() ||
    (canonicalA as any)?.avatar ||
    (canonicalA as any)?.avatarUrl ||
    (canonicalA as any)?.imageUrl ||
    "/avatar.png";

  const partnerBAvatar =
    couple.partnerB.avatar?.trim() ||
    (canonicalB as any)?.avatar ||
    (canonicalB as any)?.avatarUrl ||
    (canonicalB as any)?.imageUrl ||
    "/avatar.png";

  const partnerAName = couple.partnerA.name || canonicalA?.name || "Partner A";
  const partnerBName = couple.partnerB.name || canonicalB?.name || "Partner B";

  const artworkUrl =
    couple.media.card ||
    couple.media.cover ||
    couple.media.gallery?.[0] ||
    partnerAAvatar;

  const tierConfig = TIER_COLORS[couple.tier] || TIER_COLORS.S;
  const statusConfig = RELATIONSHIP_STATUS_OPTIONS.find((s) => s.id === couple.relationship.status) || {
    label: couple.relationship.status || "Canon",
    color: "#10B981",
    badgeBg: "rgba(16,185,129,0.15)",
    icon: "💍",
  };

  // ── Love Match cumulative +1 interaction ─────────────────────────────────────
  const handleLoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    loveBurstRef.current?.trigger();
    triggerHeartEffect(e.clientX, e.clientY);
    loveCouple(couple.id);
  };

  // ── Context Menu ─────────────────────────────────────────────────────────────
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    openContextMenu(
      e,
      [
        {
          id: "view-dossier",
          label: "View Relationship Dossier",
          icon: "📖",
          onClick: () => onOpenProfile(couple),
        },
        {
          id: "love-couple",
          label: `Love Match (+1) — ${couple.likes || 0}`,
          icon: "❤️",
          onClick: () => loveCouple(couple.id),
        },
        {
          id: "toggle-fav",
          label: couple.isFavorite ? "Unpin Favorite" : "Pin as Favorite",
          icon: couple.isFavorite ? "★" : "☆",
          onClick: () => toggleFavoriteCouple(couple.id),
        },
        {
          id: "copy-couple-name",
          label: "Copy Couple Name",
          icon: "📋",
          onClick: () => {
            navigator.clipboard.writeText(couple.coupleName);
            toastSuccess("Copied couple name to clipboard!");
          },
        },
      ],
      couple.coupleName
    );
  };

  // ── Podium Rank Badges ───────────────────────────────────────────────────────
  const rankLabel = podiumRank
    ? podiumRank === 1
      ? "#1 GOAT"
      : podiumRank === 2
      ? "#2 SILVER"
      : "#3 BRONZE"
    : rank
    ? `#${rank}`
    : null;

  return (
    <motion.div
      onClick={() => onOpenProfile(couple)}
      onContextMenu={handleContextMenu}
      whileHover={shouldReduceMotion ? {} : { y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="relative flex flex-col justify-between w-full aspect-[3/4] min-h-[430px] sm:min-h-[460px] rounded-2xl overflow-hidden cursor-pointer select-none transition-all group font-mono"
      style={{
        backgroundColor: isCyber ? "rgba(10, 15, 36, 0.85)" : "#FFFFFF",
        borderColor: isCyber
          ? podiumRank === 1
            ? "#FFD700"
            : podiumRank === 2
            ? "#E2E8F0"
            : podiumRank === 3
            ? "#D97706"
            : couple.isFavorite
            ? "rgba(236, 72, 153, 0.6)"
            : "rgba(0, 245, 255, 0.25)"
          : "#000000",
        borderWidth: isCyber ? "1.5px" : "3px",
        boxShadow: isCyber
          ? podiumRank === 1
            ? "0 0 25px rgba(255, 215, 0, 0.3)"
            : couple.isFavorite
            ? "0 0 20px rgba(236, 72, 153, 0.25)"
            : "0 0 15px rgba(0, 245, 255, 0.1)"
          : podiumRank === 1
          ? "6px 6px 0 #FFD700, 6px 6px 0 #000"
          : "4px 4px 0 #000000",
      }}
    >
      {/* ── 1. Full-Card Hero Artwork Background & Overlays ── */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        {/* Ambient blurred backdrop for letterbox prevention */}
        <img
          src={artworkUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover blur-xl scale-125 opacity-40 dark:opacity-30"
        />
        {/* Main crisp hero image */}
        <img
          src={artworkUrl}
          alt={couple.coupleName}
          className="relative w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {/* Top gradient scrim for header readability */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none" />
        {/* Bottom gradient scrim for footer and floating avatars readability */}
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/95 via-black/75 to-transparent pointer-events-none" />
      </div>

      {/* ── 2. Top Header Strip: Rank + Tier + Status ── */}
      <div className="relative z-10 flex items-center justify-between px-3.5 py-2.5 text-[11px] font-black shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          {rankLabel && (
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                podiumRank === 1
                  ? "bg-amber-400 text-black shadow-sm"
                  : podiumRank === 2
                  ? "bg-slate-300 text-black shadow-sm"
                  : podiumRank === 3
                  ? "bg-amber-700 text-white shadow-sm"
                  : isCyber
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "bg-black text-white"
              }`}
            >
              {rankLabel}
            </span>
          )}
          <span
            className="px-2 py-0.5 rounded-md text-[9px] font-bold border truncate"
            style={{
              backgroundColor: statusConfig.badgeBg,
              borderColor: statusConfig.color,
              color: statusConfig.color,
            }}
          >
            {statusConfig.icon} {statusConfig.label}
          </span>
        </div>

        {/* Canonical Tier Badge */}
        <div
          className="px-2 py-0.5 rounded-md text-[10px] font-black border uppercase tracking-wider shrink-0"
          style={{
            backgroundColor: isCyber ? tierConfig.bgCyber : tierConfig.bgNeo,
            borderColor: tierConfig.color,
            color: isCyber ? tierConfig.color : "#000000",
            boxShadow: isCyber ? `0 0 10px ${tierConfig.color}40` : "none",
          }}
        >
          {couple.tier} TIER
        </div>
      </div>

      {/* ── 3. Floating 1:1 Partner Avatars Dock & Romantic Motifs ── */}
      <div className="relative z-10 mt-auto px-3.5">
        <div
          className="px-3 py-2 rounded-2xl backdrop-blur-md shadow-xl flex items-center justify-between gap-2 border transition-all"
          style={{
            backgroundColor: isCyber ? "rgba(10, 15, 36, 0.65)" : "rgba(255, 255, 255, 0.88)",
            borderColor: isCyber ? "rgba(255, 255, 255, 0.18)" : "#000000",
            boxShadow: isCyber ? "0 4px 20px rgba(0, 0, 0, 0.5)" : "3px 3px 0px #000000",
          }}
        >
          {/* Partner A (Floating gently) */}
          <motion.div
            animate={shouldReduceMotion ? {} : { y: [-3, 3, -3] }}
            transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
            className="flex items-center gap-2 min-w-0 flex-1"
          >
            <div
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden shrink-0 border-2 shadow-md relative"
              style={{
                borderColor: isCyber ? "#00F5FF" : "#000000",
                boxShadow: isCyber ? "0 0 10px rgba(0, 245, 255, 0.4)" : "1.5px 1.5px 0 #000",
              }}
            >
              <img
                src={partnerAAvatar}
                alt={partnerAName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p
                className="text-xs font-black truncate leading-tight"
                style={{ color: isCyber ? "#FFFFFF" : "#000000" }}
              >
                {partnerAName}
              </p>
              {couple.partnerA.role && (
                <p
                  className="text-[9px] truncate font-mono"
                  style={{ color: isCyber ? "#00F5FF" : "#475569" }}
                >
                  {couple.partnerA.role}
                </p>
              )}
            </div>
          </motion.div>

          {/* Center Heart Match Node (Floating gently with pulsing heart) */}
          <div className="flex flex-col items-center shrink-0 px-1">
            <motion.div
              animate={shouldReduceMotion ? {} : { scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-md"
              style={{
                backgroundColor: isCyber ? "rgba(236, 72, 153, 0.25)" : "#FCE7F3",
                border: isCyber ? "1.5px solid #EC4899" : "2px solid #000000",
                boxShadow: isCyber ? "0 0 12px rgba(236, 72, 153, 0.5)" : "1px 1px 0 #000",
              }}
            >
              ❤️
            </motion.div>
            <span
              className="text-[8px] font-black uppercase tracking-widest mt-0.5"
              style={{ color: isCyber ? "#FF69B4" : "#BE185D" }}
            >
              MATCH
            </span>
          </div>

          {/* Partner B (Floating with inverse phase / natural delay) */}
          <motion.div
            animate={shouldReduceMotion ? {} : { y: [3, -3, 3] }}
            transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut", delay: 0.8 }}
            className="flex items-center gap-2 min-w-0 flex-1 justify-end text-right"
          >
            <div className="min-w-0">
              <p
                className="text-xs font-black truncate leading-tight"
                style={{ color: isCyber ? "#FFFFFF" : "#000000" }}
              >
                {partnerBName}
              </p>
              {couple.partnerB.role && (
                <p
                  className="text-[9px] truncate font-mono"
                  style={{ color: isCyber ? "#EC4899" : "#475569" }}
                >
                  {couple.partnerB.role}
                </p>
              )}
            </div>
            <div
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden shrink-0 border-2 shadow-md relative"
              style={{
                borderColor: isCyber ? "#EC4899" : "#000000",
                boxShadow: isCyber ? "0 0 10px rgba(236, 72, 153, 0.4)" : "1.5px 1.5px 0 #000",
              }}
            >
              <img
                src={partnerBAvatar}
                alt={partnerBName}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── 4. Card Footer: Title + Source Work + Love Match Counter ── */}
      <div className="relative z-10 px-3.5 pb-3 pt-2 flex items-end justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          <h3
            className="text-sm sm:text-base font-black truncate tracking-tight drop-shadow-md"
            style={{
              color: "#FFFFFF",
              fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
              textShadow: isCyber ? "0 0 10px rgba(0, 245, 255, 0.5)" : "1px 1px 2px #000000",
            }}
          >
            {couple.coupleName}
          </h3>
          <p className="text-[10px] text-white/90 truncate font-mono drop-shadow-sm font-bold">
            {couple.source.title} {couple.source.year ? `(${couple.source.year})` : ""} · {couple.source.mediaType}
          </p>
          <p className="text-[9px] text-pink-300 truncate font-mono">
            {couple.relationship.dynamics?.[0] || couple.relationship.description || "Romantic Pairing"}
          </p>
        </div>

        {/* Love Match Counter */}
        <div className="relative shrink-0">
          <RomanticLoveBurst ref={loveBurstRef} />
          <button
            type="button"
            onClick={handleLoveClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
            style={{
              backgroundColor: isCyber ? "rgba(236, 72, 153, 0.3)" : "#FCE7F3",
              borderColor: isCyber ? "#EC4899" : "#000000",
              color: isCyber ? "#FF69B4" : "#000000",
              boxShadow: isCyber ? "0 0 12px rgba(236, 72, 153, 0.4)" : "2px 2px 0 #000",
            }}
            title="Love Match — click to celebrate (+1)"
            aria-label={`Love count: ${couple.likes || 0}. Click to celebrate.`}
          >
            <motion.span
              animate={shouldReduceMotion ? {} : { scale: [1, 1.25, 1] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            >
              ❤️
            </motion.span>
            <span>{couple.likes || 0}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
