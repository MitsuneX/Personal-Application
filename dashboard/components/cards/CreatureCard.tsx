"use client";

import React, { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { CreatureEntry, getClassificationMeta } from "@/lib/data/creatureSchema";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { useContextMenu } from "@/hooks/useContextMenu";
import { useToast } from "@/components/ui/ToastProvider";
import type { ContextMenuItem } from "@/components/ui/ContextMenu";
import { RomanticLoveBurst, RomanticLoveBurstHandle } from "@/components/ui/RomanticLoveBurst";
import { triggerHeartEffect } from "@/components/ui/FloatingHeartEngine";

interface CreatureCardProps {
  creature: CreatureEntry;
  onSelect: (creature: CreatureEntry) => void;
  onEdit?: (creature: CreatureEntry) => void;
  onDelete?: (creature: CreatureEntry) => void;
}

export function CreatureCard({
  creature,
  onSelect,
  onEdit,
  onDelete,
}: CreatureCardProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const shouldReduceMotion = useReducedMotion();
  const { toggleFavoriteCreature, bondCreature } = useDashboardStore();
  const { openContextMenu } = useContextMenu();
  const { success: toastSuccess } = useToast();

  const loveBurstRef = useRef<RomanticLoveBurstHandle>(null);
  const favBurstRef = useRef<RomanticLoveBurstHandle>(null);

  const classificationMeta = getClassificationMeta(creature.classification);

  // Artwork resolution: card poster > primary artwork > gallery[0] > fallback
  const artwork =
    creature.media.card ||
    creature.media.primary ||
    creature.media.gallery?.[0] ||
    null;

  const handleBondClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    loveBurstRef.current?.trigger();
    triggerHeartEffect(e.clientX, e.clientY);
    bondCreature(creature.id);
  };

  const handleFavClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    favBurstRef.current?.trigger();
    toggleFavoriteCreature(creature.id);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const items: ContextMenuItem[] = [
      {
        id: "view-dossier",
        label: "View Creature Dossier",
        icon: "🐾",
        onClick: () => onSelect(creature),
      },
      ...(onEdit
        ? [
            {
              id: "edit-creature",
              label: "Edit Creature Profile",
              icon: "✎",
              onClick: () => onEdit(creature),
            },
          ]
        : []),
      {
        id: "toggle-fav",
        label: creature.isFavorite ? "Unpin Favorite" : "Pin as Favorite",
        icon: creature.isFavorite ? "★" : "☆",
        onClick: () => toggleFavoriteCreature(creature.id),
      },
      {
        id: "bond-creature",
        label: `Bond (+1) — ${creature.likes || 0} affection`,
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
      ...(onDelete
        ? [
            {
              id: "sep-danger",
              label: "",
              onClick: () => {},
              divider: true,
            },
            {
              id: "delete-creature",
              label: "Delete Creature",
              icon: "🗑",
              danger: true,
              onClick: () => onDelete(creature),
            },
          ]
        : []),
    ];

    openContextMenu(e, items, creature.name);
  };

  return (
    <motion.div
      onClick={() => onSelect(creature)}
      onContextMenu={handleContextMenu}
      whileHover={shouldReduceMotion ? {} : { y: -5, scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      className="group relative flex flex-col justify-between h-[420px] sm:h-[440px] rounded-2xl overflow-hidden cursor-pointer select-none transition-all duration-300 border"
      style={{
        backgroundColor: isCyber ? "#080c1a" : "#FFFBF5",
        borderColor: isCyber
          ? creature.isFavorite
            ? "rgba(0, 245, 255, 0.6)"
            : "rgba(0, 245, 255, 0.2)"
          : "#000000",
        borderWidth: isCyber ? "1px" : "3px",
        boxShadow: isCyber
          ? creature.isFavorite
            ? "0 0 20px rgba(0, 245, 255, 0.35), inset 0 0 15px rgba(0, 245, 255, 0.1)"
            : "0 4px 20px rgba(0, 0, 0, 0.5)"
          : creature.isFavorite
          ? "5px 5px 0px 0px #000000"
          : "4px 4px 0px 0px #000000",
      }}
    >
      {/* ── FULL-ART HERO PRESENTATION ── */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {artwork ? (
          <>
            {/* Ambient blurred backdrop for seamless fit with any aspect ratio */}
            <div
              className="absolute inset-0 bg-cover bg-center scale-110 blur-xl opacity-40 transition-transform duration-700 group-hover:scale-125"
              style={{ backgroundImage: `url(${artwork})` }}
            />
            {/* Intelligent crisp creature foreground */}
            <img
              src={artwork}
              alt={creature.name}
              className="relative w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
            />
          </>
        ) : (
          <div
            className={`w-full h-full flex flex-col items-center justify-center p-6 ${
              isCyber
                ? "bg-gradient-to-br from-cyan-950/40 via-purple-950/20 to-black"
                : "bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200"
            }`}
          >
            <span className="text-6xl mb-2 filter drop-shadow-md animate-pulse">
              {classificationMeta.icon}
            </span>
            <span className="text-xs font-mono font-bold tracking-widest uppercase opacity-60">
              No Artwork
            </span>
          </div>
        )}

        {/* Cinematic Gradient overlays */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: isCyber
              ? "linear-gradient(180deg, rgba(5,8,22,0.65) 0%, rgba(5,8,22,0.15) 35%, rgba(5,8,22,0.7) 65%, rgba(5,8,22,0.98) 100%)"
              : "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0.92) 100%)",
          }}
        />
      </div>

      {/* ── TOP ACTION BAR: CLASSIFICATION & FAVOURITE ── */}
      <div className="relative z-10 flex items-center justify-between p-3.5">
        {/* Classification Badge */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black font-mono tracking-wider uppercase border backdrop-blur-md shadow-md"
          style={{
            backgroundColor: isCyber ? classificationMeta.bgCyber : classificationMeta.bgNeo,
            borderColor: isCyber ? classificationMeta.borderCyber : classificationMeta.borderNeo,
            color: isCyber ? classificationMeta.color : "#000000",
            boxShadow: isCyber ? `0 0 10px ${classificationMeta.color}33` : "2px 2px 0px #000000",
          }}
        >
          <span>{classificationMeta.icon}</span>
          <span>{classificationMeta.label}</span>
        </div>

        {/* Favorite Star Button */}
        <div className="relative">
          <RomanticLoveBurst ref={favBurstRef} />
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={handleFavClick}
            aria-label={creature.isFavorite ? "Unpin Favorite" : "Pin Favorite"}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all backdrop-blur-md border ${
              creature.isFavorite
                ? isCyber
                  ? "bg-amber-400/20 text-amber-300 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                  : "bg-amber-400 text-black border-2 border-black shadow-[2px_2px_0px_#000000]"
                : isCyber
                ? "bg-black/40 text-slate-400 border-white/10 hover:text-amber-300 hover:border-amber-400/40"
                : "bg-white/80 text-slate-700 border-2 border-black hover:bg-amber-100"
            }`}
          >
            {creature.isFavorite ? "★" : "☆"}
          </motion.button>
        </div>
      </div>

      {/* ── BOTTOM CARD FOOTER: CREATURE IDENTITY & AFFECTION ── */}
      <div className="relative z-10 p-4 pt-6 space-y-2">
        {/* Species & Media Type */}
        <div className="flex flex-wrap items-center gap-2">
          {creature.species && (
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded backdrop-blur-sm border ${
                isCyber
                  ? "bg-white/10 text-cyan-200 border-cyan-400/30"
                  : "bg-white text-black border border-black shadow-[1px_1px_0px_#000000]"
              }`}
            >
              {creature.species}
            </span>
          )}
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-sm ${
              isCyber ? "bg-white/5 text-slate-300" : "bg-black/60 text-white"
            }`}
          >
            {creature.mediaType}
            {creature.sourceYear ? ` · ${creature.sourceYear}` : ""}
          </span>
        </div>

        {/* Creature Name */}
        <h3
          className="text-xl sm:text-2xl font-black font-mono tracking-tight leading-tight line-clamp-1 drop-shadow-md text-white group-hover:text-cyan-300 transition-colors"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
        >
          {creature.name}
        </h3>

        {/* Source / Work Title */}
        <p
          className="text-xs font-mono line-clamp-1 text-slate-200/90 font-medium"
          style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}
        >
          {creature.sourceTitle}
        </p>

        {/* Personal Note Snippet (Why I Love This Creature) */}
        {creature.personalNote && (
          <p
            className="text-[11px] font-mono italic line-clamp-1 text-pink-200/90 pt-0.5"
            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}
          >
            &ldquo;{creature.personalNote}&rdquo;
          </p>
        )}

        {/* Action Row: Bond Button & Inspection Cue */}
        <div className="flex items-center justify-between pt-2 border-t border-white/15">
          {/* Interactive Bond (+1) Button */}
          <div className="relative">
            <RomanticLoveBurst ref={loveBurstRef} />
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleBondClick}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold transition-all backdrop-blur-md border ${
                isCyber
                  ? "bg-pink-500/20 text-pink-300 border-pink-500/40 hover:bg-pink-500/30 hover:border-pink-400"
                  : "bg-pink-100 text-pink-900 border border-pink-400 hover:bg-pink-200"
              }`}
            >
              <span className="text-pink-400">❤️</span>
              <span>{creature.likes || 0}</span>
              <span className="text-[10px] opacity-70">Bond</span>
            </motion.button>
          </div>

          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-cyan-300/80 group-hover:text-cyan-200 flex items-center gap-1">
            Dossier <span>→</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}
