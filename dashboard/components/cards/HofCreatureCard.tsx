"use client";

import React, { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CreatureEntry, CREATURE_TIER_META, getClassificationMeta } from "@/lib/data/creatureSchema";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { useContextMenu } from "@/hooks/useContextMenu";
import { useToast } from "@/components/ui/ToastProvider";
import { RomanticLoveBurst, RomanticLoveBurstHandle } from "@/components/ui/RomanticLoveBurst";
import { triggerHeartEffect } from "@/components/ui/FloatingHeartEngine";

interface HofCreatureCardProps {
  creature: CreatureEntry;
  rank?: number;
  podiumRank?: number | null;
  isCyber: boolean;
  onOpenProfile: (creature: CreatureEntry) => void;
  onCompare?: (creature: CreatureEntry) => void;
}

export function HofCreatureCard({
  creature,
  rank,
  podiumRank = null,
  isCyber,
  onOpenProfile,
  onCompare,
}: HofCreatureCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const { bondCreature } = useDashboardStore();
  const { openContextMenu } = useContextMenu();
  const { success: toastSuccess } = useToast();

  const loveBurstRef = useRef<RomanticLoveBurstHandle>(null);

  const classificationMeta = getClassificationMeta(creature.classification);
  const tierMeta = CREATURE_TIER_META[creature.tier || "S"] || CREATURE_TIER_META.S;

  const artworkUrl =
    creature.media.card ||
    creature.media.primary ||
    creature.media.gallery?.[0] ||
    creature.avatarUrl ||
    "";

  // ── Affection Bond interaction ──────────────────────────────────────────────
  const handleBondClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    loveBurstRef.current?.trigger();
    triggerHeartEffect(e.clientX, e.clientY);
    bondCreature(creature.id);
  };

  // ── Context Menu (Strictly Read-Only in Hall of Fame) ────────────────────────
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    openContextMenu(
      e,
      [
        {
          id: "view-dossier",
          label: "View Creature Dossier",
          icon: "🐾",
          onClick: () => onOpenProfile(creature),
        },
        {
          id: "bond-creature",
          label: `Bond (+1) — ${creature.likes || 0} Affection`,
          icon: "❤️",
          onClick: () => bondCreature(creature.id),
        },
        {
          id: "copy-name",
          label: "Copy Creature Name",
          icon: "📋",
          onClick: () => {
            navigator.clipboard.writeText(creature.name);
            toastSuccess("Copied creature name to clipboard!");
          },
        },
      ],
      creature.name
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

  const connectedCount = (creature.connectedCharacters || []).length;

  return (
    <motion.div
      onClick={() => onOpenProfile(creature)}
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
            : creature.isFavorite
            ? "rgba(0, 245, 255, 0.6)"
            : "rgba(0, 245, 255, 0.25)"
          : "#000000",
        borderWidth: isCyber ? "1.5px" : "3px",
        boxShadow: isCyber
          ? podiumRank === 1
            ? "0 0 25px rgba(255, 215, 0, 0.3)"
            : creature.isFavorite
            ? "0 0 20px rgba(0, 245, 255, 0.25)"
            : "0 0 15px rgba(0, 245, 255, 0.1)"
          : podiumRank === 1
          ? "6px 6px 0 #FFD700, 6px 6px 0 #000"
          : "4px 4px 0 #000000",
      }}
    >
      {/* ── 1. Full-Card Hero Artwork Background & Overlays ── */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        {artworkUrl ? (
          <>
            <img
              src={artworkUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover blur-xl scale-125 opacity-40 dark:opacity-30"
            />
            <img
              src={artworkUrl}
              alt={creature.name}
              className="relative w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </>
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center p-6 text-center"
            style={{
              background: isCyber
                ? "linear-gradient(135deg, #0d1527 0%, #050814 100%)"
                : "linear-gradient(135deg, #FFF7ED 0%, #FED7AA 100%)",
            }}
          >
            <span className="text-6xl mb-2 opacity-30 select-none">
              {classificationMeta.icon}
            </span>
            <span className={`text-xs font-mono font-bold ${isCyber ? "text-cyan-300/40" : "text-amber-900/40"}`}>
              {creature.name}
            </span>
          </div>
        )}
        {/* Top gradient scrim */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none" />
        {/* Bottom gradient scrim */}
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/95 via-black/75 to-transparent pointer-events-none" />
      </div>

      {/* ── 2. Top Header Strip: Rank + Classification + Canonical Tier ── */}
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
              backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#E0F2FE",
              borderColor: isCyber ? "rgba(0,245,255,0.4)" : "#000000",
              color: isCyber ? "#00F5FF" : "#0369A1",
            }}
          >
            {classificationMeta.icon} {classificationMeta.label}
          </span>
        </div>

        {/* Canonical Tier Badge */}
        <div
          className="px-2 py-0.5 rounded-md text-[10px] font-black border uppercase tracking-wider shrink-0"
          style={{
            backgroundColor: isCyber ? tierMeta.bgCyber : tierMeta.bgNeo,
            borderColor: tierMeta.color,
            color: isCyber ? tierMeta.color : "#000000",
            boxShadow: isCyber ? `0 0 10px ${tierMeta.color}40` : "none",
          }}
        >
          {creature.tier || "S"} TIER
        </div>
      </div>

      {/* ── 3. Connected Characters Dock (if any exist) ── */}
      {connectedCount > 0 && (
        <div className="relative z-10 mt-auto px-3.5 mb-2">
          <div
            className="px-3 py-1.5 rounded-xl backdrop-blur-md flex items-center justify-between gap-2 border transition-all"
            style={{
              backgroundColor: isCyber ? "rgba(10, 15, 36, 0.7)" : "rgba(255, 255, 255, 0.9)",
              borderColor: isCyber ? "rgba(255, 255, 255, 0.15)" : "#000000",
              boxShadow: isCyber ? "0 4px 15px rgba(0, 0, 0, 0.4)" : "2px 2px 0px #000000",
            }}
          >
            <div className="flex items-center -space-x-2 shrink-0">
              {creature.connectedCharacters!.slice(0, 3).map((ref, idx) => (
                <div
                  key={idx}
                  className="w-6 h-6 rounded-full border overflow-hidden relative z-10 bg-slate-800 flex items-center justify-center text-[10px]"
                  style={{ borderColor: isCyber ? "#00F5FF" : "#000000" }}
                  title={`${ref.name} (${ref.relationshipType || "Companion"})`}
                >
                  {ref.avatarUrl ? (
                    <img src={ref.avatarUrl} alt={ref.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>👤</span>
                  )}
                </div>
              ))}
              {connectedCount > 3 && (
                <div
                  className="w-6 h-6 rounded-full border bg-black text-white text-[9px] font-black flex items-center justify-center z-20"
                  style={{ borderColor: isCyber ? "#00F5FF" : "#000000" }}
                >
                  +{connectedCount - 3}
                </div>
              )}
            </div>
            <span
              className="text-[10px] font-mono font-bold truncate"
              style={{ color: isCyber ? "rgba(255,255,255,0.7)" : "#374151" }}
            >
              🔗 {connectedCount} Connected {connectedCount === 1 ? "Character" : "Characters"}
            </span>
          </div>
        </div>
      )}

      {/* ── 4. Bottom Info Panel & Affection Heart ── */}
      <div className={`relative z-10 px-3.5 pb-3.5 ${connectedCount === 0 ? "mt-auto" : ""}`}>
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3
              className="text-base sm:text-lg font-black truncate leading-tight tracking-tight drop-shadow-md"
              style={{ color: isCyber ? "#FFFFFF" : "#FFFFFF" }}
            >
              {creature.name}
            </h3>
            <p className="text-[10px] sm:text-[11px] truncate font-mono text-white/80 drop-shadow-sm mt-0.5">
              {creature.species || creature.originWork || "Legendary Bestiary Record"}
            </p>
          </div>

          {/* Affection Button with romantic particle burst */}
          <div className="relative shrink-0">
            <RomanticLoveBurst ref={loveBurstRef} />
            <motion.button
              type="button"
              whileHover={shouldReduceMotion ? {} : { scale: 1.08 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.92 }}
              onClick={handleBondClick}
              className="px-3 py-1.5 rounded-xl text-xs font-mono font-black flex items-center gap-1.5 transition-all cursor-pointer border shadow-md select-none"
              style={{
                backgroundColor: isCyber ? "rgba(236, 72, 153, 0.25)" : "#FFE4E6",
                color: isCyber ? "#F472B6" : "#E11D48",
                borderColor: isCyber ? "rgba(236, 72, 153, 0.5)" : "#000000",
                boxShadow: isCyber
                  ? "0 0 12px rgba(236, 72, 153, 0.3)"
                  : "2px 2px 0 #000000",
              }}
              title="Form affection bond (+1)"
            >
              <span className="text-sm">❤️</span>
              <span>{creature.likes || 0}</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
