"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { DossierCharacterEntry, useDashboardStore } from "@/lib/store/dashboardStore";
import { getGameDossierConfig } from "@/lib/data/gameDossierConfig";
import { useContextMenu } from "@/hooks/useContextMenu";

interface DossierCharacterCardProps {
  character: DossierCharacterEntry;
  gameTitle?: string;
  gameCategory?: string;
  onEdit?: (character: DossierCharacterEntry) => void;
  onDelete?: (character: DossierCharacterEntry) => void;
}

export function DossierCharacterCard({
  character,
  gameTitle,
  gameCategory,
  onEdit,
  onDelete,
}: DossierCharacterCardProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { updateDossierCharacter, games } = useDashboardStore();
  const { openContextMenu } = useContextMenu();

  const parentGame = games.find((g) => g.id === character.gameId);
  const resolvedGameTitle = gameTitle || parentGame?.game || "Game";
  const config = getGameDossierConfig(resolvedGameTitle, gameCategory || parentGame?.category);

  // Find element system info if available
  const elementSystem = config.elementSystem;
  const elementItem = elementSystem?.elements.find(
    (el) =>
      el.name.toLowerCase() === character.role?.toLowerCase() ||
      el.id.toLowerCase() === character.role?.toLowerCase()
  );

  // Find category info
  const categoryItem = config.categories.find(
    (c) => c.name.toLowerCase() === character.category?.toLowerCase() || c.id.toLowerCase() === character.category?.toLowerCase()
  );

  const accent = character.accentColor || elementItem?.color || parentGame?.accentColor || "#3B82F6";

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await updateDossierCharacter(character.id, {
      isFavorite: !character.isFavorite,
    });
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    openContextMenu(
      e,
      [
        {
          id: "fav",
          label: character.isFavorite ? "Unstar Character" : "Star Favorite",
          icon: "⭐",
          onClick: () => updateDossierCharacter(character.id, { isFavorite: !character.isFavorite }),
        },
        ...(onEdit
          ? [
              {
                id: "edit",
                label: `Edit ${character.name}`,
                icon: "✏️",
                onClick: () => onEdit(character),
              },
            ]
          : []),
        {
          id: "view-dossier",
          label: `View ${resolvedGameTitle} Database`,
          icon: "📊",
          onClick: () => {
            if (typeof window !== "undefined") window.location.href = `/games/${character.gameId}`;
          },
        },
        ...(onDelete
          ? [
              {
                id: "delete",
                label: `Delete ${character.name}`,
                icon: "🗑️",
                danger: true,
                divider: true,
                onClick: () => onDelete(character),
              },
            ]
          : []),
      ],
      character.name
    );
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.22 }}
      onContextMenu={handleContextMenu}
      className="p-4 rounded-2xl border relative overflow-hidden group transition-all cursor-context-menu"
      style={{
        backgroundColor: isCyber ? "rgba(10,15,30,0.85)" : "#FFFFFF",
        borderColor: isCyber ? `${accent}40` : "#000000",
        borderWidth: isCyber ? "1px" : "2.5px",
        boxShadow: isCyber ? `0 4px 20px ${accent}15` : "4px 4px 0 #000000",
      }}
    >
      {/* Cyber Ambient Glow */}
      {isCyber && (
        <div
          className="absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none"
          style={{ backgroundColor: accent }}
        />
      )}

      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar / Portrait */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 border overflow-hidden relative shadow-sm font-black select-none"
            style={{
              backgroundColor: `${accent}20`,
              color: accent,
              borderColor: isCyber ? `${accent}60` : "#000000",
              borderWidth: isCyber ? "1px" : "2px",
            }}
          >
            {character.avatarUrl ? (
              character.avatarUrl.startsWith("http") ||
              character.avatarUrl.startsWith("data:") ||
              character.avatarUrl.startsWith("/") ? (
                <img src={character.avatarUrl} alt={character.name} className="w-full h-full object-cover" />
              ) : (
                <span>{character.avatarUrl}</span>
              )
            ) : (
              <span>{character.name.charAt(0)}</span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-black text-base theme-text-primary truncate leading-tight">
                {character.name}
              </h4>
              {character.levelRank && (
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold"
                  style={{
                    backgroundColor: isCyber ? "rgba(250,204,21,0.15)" : "#FEF08A",
                    color: isCyber ? "#FACC15" : "#854D0E",
                    border: isCyber ? "1px solid rgba(250,204,21,0.3)" : "1px solid #000",
                  }}
                >
                  {character.levelRank}
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono theme-text-muted truncate mt-0.5">
              {parentGame?.game || resolvedGameTitle}
            </p>
          </div>
        </div>

        {/* Favorite & Quick Actions */}
        <div className="flex items-center gap-1 shrink-0 z-20">
          <button
            onClick={handleToggleFavorite}
            className={`p-1.5 rounded-lg text-xs transition-transform active:scale-90 cursor-pointer ${
              character.isFavorite ? "opacity-100" : "opacity-40 hover:opacity-100"
            }`}
            title={character.isFavorite ? "Remove Star" : "Star Favorite"}
          >
            {character.isFavorite ? "⭐" : "☆"}
          </button>
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(character);
              }}
              className="p-1 rounded-lg text-xs opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
              title="Edit Character"
            >
              ✏️
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(character);
              }}
              className="p-1 rounded-lg text-xs opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-red-500/20 cursor-pointer"
              title="Delete Character"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      {/* Element & Category Badges Row */}
      <div className="mt-3.5 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2 flex-wrap text-xs font-mono">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Element Badge */}
          {character.role && (
            <span
              className="px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1"
              style={{
                backgroundColor: isCyber ? `${elementItem?.color || accent}20` : `${elementItem?.color || accent}1F`,
                color: isCyber ? (elementItem?.color || accent) : "#1A1A1A",
                border: `1px solid ${elementItem?.color || accent}`,
              }}
            >
              <span>{elementItem?.icon || "✦"}</span>
              <span>{character.role}</span>
            </span>
          )}

          {/* Category / Path Badge */}
          {character.category && (
            <span
              className="px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1"
              style={{
                backgroundColor: isCyber ? "rgba(255,255,255,0.06)" : "#F1F5F9",
                color: isCyber ? "#94A3B8" : "#475569",
                border: isCyber ? "1px solid rgba(255,255,255,0.15)" : "1px solid #CBD5E1",
              }}
            >
              <span>{categoryItem?.icon || "📁"}</span>
              <span>{character.category}</span>
            </span>
          )}
        </div>

        {/* Winrate / Stats */}
        {character.winRate !== undefined && (
          <span className="font-bold text-emerald-400 text-[11px]">
            {character.winRate}% WR
          </span>
        )}
      </div>
    </motion.div>
  );
}
