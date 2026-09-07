"use client";

import React, { useMemo, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { CoupleEntry, TIER_COLORS, RELATIONSHIP_STATUS_OPTIONS } from "@/lib/data/coupleSchema";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { useContextMenu } from "@/hooks/useContextMenu";
import { useToast } from "@/components/ui/ToastProvider";
import type { ContextMenuItem } from "@/components/ui/ContextMenu";
import { RomanticLoveBurst, RomanticLoveBurstHandle } from "@/components/ui/RomanticLoveBurst";
import { triggerHeartEffect } from "@/components/ui/FloatingHeartEngine";

interface CoupleCardProps {
  couple: CoupleEntry;
  onSelect: (couple: CoupleEntry) => void;
  onEdit?: (couple: CoupleEntry) => void;
  onDelete?: (couple: CoupleEntry) => void;
  onOpenCharacterDictionary?: (characterId: string) => void;
}

export function CoupleCard({
  couple,
  onSelect,
  onEdit,
  onDelete,
  onOpenCharacterDictionary,
}: CoupleCardProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const shouldReduceMotion = useReducedMotion();
  const {
    hallOfFame = [],
    dossierCharacters = [],
    toggleFavoriteCouple,
    loveCouple,
  } = useDashboardStore();
  const { openContextMenu } = useContextMenu();
  const { success: toastSuccess } = useToast();

  const loveBurstRef = useRef<RomanticLoveBurstHandle>(null);
  const favBurstRef = useRef<RomanticLoveBurstHandle>(null);

  // ── Cumulative Love Match click — always +1 ──────────────────────────────────
  const handleLoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    loveBurstRef.current?.trigger();
    triggerHeartEffect(e.clientX, e.clientY);
    loveCouple(couple.id);
  };

  const handleFavClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    favBurstRef.current?.trigger();
    toggleFavoriteCouple(couple.id);
  };

  // ── Resolve canonical character data ─────────────────────────────────────────
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

  const partnerAName = canonicalA?.name || couple.partnerA.name || "Partner A";
  const partnerBName = canonicalB?.name || couple.partnerB.name || "Partner B";

  const partnerAAvatar =
    (canonicalA as any)?.avatarUrl ||
    (canonicalA as any)?.imageUrl ||
    (canonicalA as any)?.portraitUrl ||
    couple.partnerA.avatar ||
    "/avatar.png";

  const partnerBAvatar =
    (canonicalB as any)?.avatarUrl ||
    (canonicalB as any)?.imageUrl ||
    (canonicalB as any)?.portraitUrl ||
    couple.partnerB.avatar ||
    "/avatar.png";

  const tierConfig = TIER_COLORS[couple.tier] || TIER_COLORS.S;
  const statusConfig = RELATIONSHIP_STATUS_OPTIONS.find((s) => s.id === couple.relationship.status) || {
    label: couple.relationship.status || "Canon",
    color: "#10B981",
    badgeBg: "rgba(16,185,129,0.15)",
    icon: "💍",
  };

  // Card Poster prioritized as full-art background
  const cardPoster = couple.media.card || couple.media.cover || couple.media.gallery?.[0] || null;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const items: ContextMenuItem[] = [
      {
        id: "view-dossier",
        label: "View Relationship Dossier",
        icon: "📖",
        onClick: () => onSelect(couple),
      },
      ...(onEdit
        ? [
            {
              id: "edit-couple",
              label: "Edit Couple Profile",
              icon: "✎",
              onClick: () => onEdit(couple),
            },
          ]
        : []),
      {
        id: "toggle-fav",
        label: couple.isFavorite ? "Unpin Favorite" : "Pin as Favorite",
        icon: couple.isFavorite ? "★" : "☆",
        onClick: () => toggleFavoriteCouple(couple.id),
      },
      {
        id: "love-couple",
        label: `Love Match (+1) — ${couple.likes || 0} total`,
        icon: "❤️",
        onClick: () => loveCouple(couple.id),
      },
      {
        id: "copy-name",
        label: "Copy Couple Name",
        icon: "📋",
        onClick: () => {
          navigator.clipboard.writeText(couple.coupleName);
          toastSuccess("Copied couple name to clipboard!");
        },
      },
      ...(canonicalA?.id && onOpenCharacterDictionary
        ? [
            {
              id: "view-partner-a",
              label: `View ${partnerAName} in Dictionary`,
              icon: "👤",
              onClick: () => onOpenCharacterDictionary(canonicalA.id),
            },
          ]
        : []),
      ...(canonicalB?.id && onOpenCharacterDictionary
        ? [
            {
              id: "view-partner-b",
              label: `View ${partnerBName} in Dictionary`,
              icon: "👤",
              onClick: () => onOpenCharacterDictionary(canonicalB.id),
            },
          ]
        : []),
      ...(onDelete
        ? [
            {
              id: "sep-danger",
              label: "",
              onClick: () => {},
              divider: true,
            },
            {
              id: "delete-couple",
              label: "Delete Couple",
              icon: "🗑",
              danger: true,
              onClick: () => onDelete(couple),
            },
          ]
        : []),
    ];

    openContextMenu(e, items, couple.coupleName);
  };

  return (
    <motion.div
      onClick={() => onSelect(couple)}
      onContextMenu={handleContextMenu}
      whileHover={shouldReduceMotion ? {} : { y: -5, scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      className="group relative flex flex-col justify-between h-[420px] sm:h-[440px] rounded-2xl overflow-hidden cursor-pointer select-none transition-all duration-300 border"
      style={{
        backgroundColor: isCyber ? "#080c1a" : "#FFF5F7",
        borderColor: isCyber
          ? couple.isFavorite
            ? "rgba(255, 0, 127, 0.6)"
            : "rgba(0, 245, 255, 0.25)"
          : "#000000",
        borderWidth: isCyber ? "1px" : "2.5px",
        boxShadow: isCyber
          ? couple.isFavorite
            ? "0 0 25px rgba(255, 0, 127, 0.35)"
            : "0 8px 24px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 245, 255, 0.15)"
          : "5px 5px 0 #000000",
      }}
    >
      {/* ── 1. FULL ARTWORK BACKGROUND ── */}
      {cardPoster ? (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <img
            src={cardPoster}
            alt={couple.coupleName}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        </div>
      ) : (
        /* Safe Romantic Fallback Background */
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            background: isCyber
              ? "linear-gradient(145deg, rgba(8,12,28,0.98) 0%, rgba(30,10,45,0.95) 50%, rgba(10,18,40,0.98) 100%)"
              : "linear-gradient(145deg, #FFF0F5 0%, #FDF2F8 50%, #F5F3FF 100%)",
          }}
        >
          {/* Ambient glowing circles */}
          <div
            className="absolute -left-10 -top-10 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-40"
            style={{ backgroundColor: isCyber ? "rgba(0,245,255,0.3)" : "rgba(244,114,182,0.3)" }}
          />
          <div
            className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-40"
            style={{ backgroundColor: isCyber ? "rgba(255,0,127,0.3)" : "rgba(236,72,153,0.3)" }}
          />
        </div>
      )}

      {/* Carefully controlled gradient overlay for high contrast text & avatar readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/30 group-hover:from-black/90 group-hover:via-black/35 transition-all duration-300 pointer-events-none z-10" />

      {/* ── 2. TOP BAR: TIER BADGE + STATUS + FAVORITE BUTTON ── */}
      <div className="relative z-20 p-3.5 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Tier Badge */}
          <span
            className="px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider font-mono border backdrop-blur-md"
            style={{
              backgroundColor: isCyber ? tierConfig.bgCyber : tierConfig.bgNeo,
              color: tierConfig.color,
              borderColor: tierConfig.color,
              boxShadow: isCyber ? `0 0 10px ${tierConfig.color}50` : "2px 2px 0 #000",
            }}
          >
            {tierConfig.label}
          </span>

          {/* Relationship Status Badge */}
          <span
            className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono flex items-center gap-1 border backdrop-blur-md"
            style={{
              backgroundColor: isCyber ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.9)",
              color: statusConfig.color,
              borderColor: statusConfig.color,
              boxShadow: isCyber ? `0 0 8px ${statusConfig.color}40` : "1px 1px 0 #000",
            }}
          >
            <span>{statusConfig.icon}</span>
            <span>{statusConfig.label}</span>
          </span>
        </div>

        {/* Favorite Star Button with Micro-burst */}
        <div className="relative inline-flex pointer-events-auto">
          <RomanticLoveBurst ref={favBurstRef} />
          <button
            type="button"
            onClick={handleFavClick}
            title={couple.isFavorite ? "Favorited" : "Favorite"}
            aria-label={couple.isFavorite ? "Unpin favorite couple" : "Pin couple as favorite"}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-transform active:scale-90 hover:scale-110 border backdrop-blur-md cursor-pointer"
            style={{
              backgroundColor: couple.isFavorite
                ? isCyber ? "rgba(255, 0, 127, 0.4)" : "#FFE4E6"
                : isCyber ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.9)",
              borderColor: couple.isFavorite ? "#EC4899" : isCyber ? "rgba(255,255,255,0.25)" : "#000000",
              color: couple.isFavorite ? "#EC4899" : isCyber ? "#E2E8F0" : "#4A4A4A",
              boxShadow: isCyber && couple.isFavorite ? "0 0 12px rgba(236,72,153,0.6)" : "none",
            }}
          >
            <motion.span
              animate={couple.isFavorite && !shouldReduceMotion ? { scale: [1, 1.25, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {couple.isFavorite ? "★" : "☆"}
            </motion.span>
          </button>
        </div>
      </div>

      {/* ── 3. FLOATING LOVER AVATARS ABOVE NAMES ── */}
      <div className="relative z-20 px-4 py-2 flex items-end justify-center gap-3 sm:gap-4 w-full">
        {/* Partner A — Floating Avatar above Name */}
        <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
          <motion.div
            animate={shouldReduceMotion ? {} : { y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 3.6, ease: "easeInOut", delay: 0 }}
            className="relative"
          >
            <div
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden border-2 shadow-xl transition-all duration-300 group-hover:scale-105"
              style={{
                borderColor: isCyber ? "#00F5FF" : "#000000",
                boxShadow: isCyber
                  ? "0 0 18px rgba(0,245,255,0.5), 0 4px 12px rgba(0,0,0,0.8)"
                  : "3px 3px 0 #000, 0 4px 12px rgba(0,0,0,0.25)",
              }}
            >
              <img
                src={partnerAAvatar}
                alt={partnerAName}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            {/* Glow shadow beneath float */}
            <div
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-10 h-1.5 rounded-full blur-md opacity-40"
              style={{ backgroundColor: isCyber ? "#00F5FF" : "#000" }}
            />
          </motion.div>
          <span
            className="text-xs font-black tracking-tight text-center truncate w-full text-white leading-tight"
            style={{
              textShadow: "0 2px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.6)",
            }}
            title={partnerAName}
          >
            {partnerAName}
          </span>
        </div>

        {/* Central ❤️ connection — pulsing heartbeat node */}
        <div className="flex flex-col items-center shrink-0 pb-1">
          <motion.div
            animate={shouldReduceMotion ? {} : { scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-base border shadow-xl backdrop-blur-md transition-transform group-hover:scale-115"
            style={{
              backgroundColor: isCyber ? "rgba(236,72,153,0.3)" : "rgba(255,255,255,0.9)",
              borderColor: "#EC4899",
              borderWidth: isCyber ? "1.5px" : "2px",
              boxShadow: isCyber
                ? "0 0 20px rgba(236,72,153,0.6)"
                : "2px 2px 0 #000",
            }}
            title="Romantic Bond"
          >
            ❤️
          </motion.div>
          <span
            className="text-[8px] font-mono font-bold tracking-widest uppercase mt-1 text-pink-300 drop-shadow-md opacity-90"
          >
            MATCH
          </span>
        </div>

        {/* Partner B — Floating Avatar above Name (offset phase) */}
        <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
          <motion.div
            animate={shouldReduceMotion ? {} : { y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut", delay: 1.1 }}
            className="relative"
          >
            <div
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden border-2 shadow-xl transition-all duration-300 group-hover:scale-105"
              style={{
                borderColor: isCyber ? "#FF007F" : "#000000",
                boxShadow: isCyber
                  ? "0 0 18px rgba(255,0,127,0.5), 0 4px 12px rgba(0,0,0,0.8)"
                  : "3px 3px 0 #000, 0 4px 12px rgba(0,0,0,0.25)",
              }}
            >
              <img
                src={partnerBAvatar}
                alt={partnerBName}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            {/* Glow shadow beneath float */}
            <div
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-10 h-1.5 rounded-full blur-md opacity-40"
              style={{ backgroundColor: isCyber ? "#FF007F" : "#000" }}
            />
          </motion.div>
          <span
            className="text-xs font-black tracking-tight text-center truncate w-full text-white leading-tight"
            style={{
              textShadow: "0 2px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.6)",
            }}
            title={partnerBName}
          >
            {partnerBName}
          </span>
        </div>
      </div>

      {/* ── 4. BOTTOM OVERLAY: COUPLE TITLE & CUMULATIVE LOVE MATCH BUTTON ── */}
      <div className="relative z-20 p-3.5 sm:p-4 flex flex-col items-center text-center gap-2.5">
        {/* Couple Name & Source Subtitle */}
        <div className="w-full">
          <h3
            className="font-black text-sm sm:text-base leading-tight tracking-tight text-white line-clamp-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
            style={{
              fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
            }}
          >
            {couple.coupleName}
          </h3>
          <p
            className="text-[11px] font-mono font-medium text-slate-300 opacity-90 truncate drop-shadow mt-0.5"
          >
            {couple.source.title}
            {couple.source.year ? ` (${couple.source.year})` : ""}
          </p>
        </div>

        {/* Cumulative Love Match Button */}
        <div className="relative inline-flex">
          <RomanticLoveBurst ref={loveBurstRef} />
          <motion.button
            type="button"
            onClick={handleLoveClick}
            whileTap={{ scale: 0.92, rotate: [0, -6, 6, -4, 4, 0] } as any}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full transition-all hover:scale-105 active:scale-95 border select-none cursor-pointer backdrop-blur-md shadow-lg"
            style={{
              backgroundColor: isCyber ? "rgba(236,72,153,0.3)" : "rgba(255, 228, 230, 0.95)",
              borderColor: "#EC4899",
              color: isCyber ? "#FF69B4" : "#BE123C",
              borderWidth: isCyber ? "1.5px" : "2px",
              boxShadow: isCyber
                ? "0 0 16px rgba(236,72,153,0.5)"
                : "2px 2px 0 #000",
            }}
            title="Love Match — click to add +1"
            aria-label={`Love Match count: ${couple.likes || 0}. Click to add love.`}
          >
            <motion.span
              animate={shouldReduceMotion ? {} : { scale: [1, 1.25, 1] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
              className="text-sm"
            >
              ❤️
            </motion.span>
            <span className="font-black text-xs font-mono tracking-wider">
              {couple.likes || 0} MATCH
            </span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

