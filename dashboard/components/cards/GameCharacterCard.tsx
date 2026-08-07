"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { GameCharacterEntry, useDashboardStore } from "@/lib/store/dashboardStore";
import { useContextMenu } from "@/hooks/useContextMenu";

// Element-to-color mapping for element chips
const ELEMENT_COLORS: Record<string, string> = {
  pyro: "#FF4A4A",
  hydro: "#1E90FF",
  anemo: "#4DC9A9",
  geo: "#CFA827",
  electro: "#A855F7",
  cryo: "#8FBCD4",
  dendro: "#5CB85C",
  fire: "#FF4A4A",
  water: "#1E90FF",
  ice: "#8FBCD4",
  wind: "#4DC9A9",
  lightning: "#A855F7",
  rock: "#CFA827",
  quantum: "#A855F7",
  imaginary: "#D4A017",
  physical: "#94A3B8",
  glacio: "#8FBCD4",
  fusion: "#FF6B35",
  havoc: "#DC2626",
  aero: "#4DC9A9",
  spectro: "#F4C430",
  cyber: "#00F5FF",
  digital: "#22D3EE",
  bio: "#5CB85C",
  dark: "#7C3AED",
  light: "#FCD34D",
  red: "#EF4444",
  blue: "#3B82F6",
  green: "#22C55E",
  yellow: "#EAB308",
  purple: "#A855F7",
  white: "#F1F5F9",
  black: "#1E293B",
};

function getElementColor(element?: string): string {
  if (!element) return "#A855F7";
  const key = element.toLowerCase().replace(/[^a-z]/g, "");
  return ELEMENT_COLORS[key] || "#A855F7";
}

// Gender icon
function genderIcon(gender?: string): string {
  if (!gender) return "";
  const g = gender.toLowerCase();
  if (g.includes("female") || g.includes("girl") || g.includes("woman")) return "♀";
  if (g.includes("male") || g.includes("boy") || g.includes("man")) return "♂";
  return "⊕";
}

interface GameCharacterCardProps {
  character: GameCharacterEntry;
  onEdit?: (character: GameCharacterEntry) => void;
  onDelete?: (character: GameCharacterEntry) => void;
}

export function GameCharacterCard({
  character,
  onEdit,
  onDelete,
}: GameCharacterCardProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const {
    games,
    dossierCharacters,
    updateGameCharacter,
    syncGameCharacterArtwork,
    syncOrphanedGameCharacters,
  } = useDashboardStore();
  const { openContextMenu } = useContextMenu();

  const parentGame = games.find((g) => g.id === character.gameId);
  const linkedDossierChar = dossierCharacters.find(
    (dc) =>
      (character.characterId && dc.id === character.characterId) ||
      (dc.name.toLowerCase() === character.name.toLowerCase() &&
        (dc.gameId === character.gameId ||
          dc.gameTitle?.toLowerCase() === (character.gameName || "").toLowerCase()))
  );

  const resolvedGameTitle = character.gameName || parentGame?.game || "Unknown Game";
  const resolvedGameCategory = character.category || parentGame?.category || "";

  const accent = character.accentColor || parentGame?.accentColor || "#A855F7";
  const splash = character.splashArt || linkedDossierChar?.splashArt;
  const avatar = character.avatarUrl || linkedDossierChar?.avatarUrl;
  const isOrphan = !character.gameId || !parentGame;

  const elementColor = getElementColor(character.element);
  const biography = character.biography || character.stats?.biography || "";
  const shortBio = biography ? biography.slice(0, 120) + (biography.length > 120 ? "…" : "") : null;

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await updateGameCharacter(character.id, { isFavorite: !character.isFavorite });
  };

  const handleSyncDatabase = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await syncOrphanedGameCharacters(character.gameId || undefined, character.gameName || undefined);
  };

  const handleSyncArtwork = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (linkedDossierChar) {
      await syncGameCharacterArtwork(character.id, linkedDossierChar.id, "to_game_character");
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    openContextMenu(
      e,
      [
        {
          id: "fav",
          label: character.isFavorite ? "Unstar Favorite" : "Star Favorite",
          icon: "⭐",
          onClick: () => updateGameCharacter(character.id, { isFavorite: !character.isFavorite }),
        },
        ...(linkedDossierChar
          ? [
              {
                id: "sync-art",
                label: "Sync Artwork with Character Collection",
                icon: "🖼️",
                onClick: () =>
                  syncGameCharacterArtwork(character.id, linkedDossierChar.id, "to_game_character"),
              },
            ]
          : []),
        ...(isOrphan
          ? [
              {
                id: "sync-db",
                label: "Sync with Game Database",
                icon: "🔄",
                onClick: () =>
                  syncOrphanedGameCharacters(
                    character.gameId || undefined,
                    character.gameName || undefined
                  ),
              },
            ]
          : []),
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
        ...(onDelete
          ? [
              {
                id: "delete",
                label: `Remove ${character.name}`,
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

  const hasAvatar =
    avatar &&
    (avatar.startsWith("http") || avatar.startsWith("data:") || avatar.startsWith("/"));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -6 }}
      transition={{ duration: 0.22 }}
      onContextMenu={handleContextMenu}
      className={`relative rounded-2xl border overflow-hidden group cursor-pointer transition-all hover:scale-[1.015] hover:z-10 ${
        character.isFavorite
          ? "ring-2 shadow-[0_0_24px_rgba(168,85,247,0.3)]"
          : ""
      }`}
      style={{
        backgroundColor: isCyber ? "rgba(9,13,28,0.92)" : "#FFFFFF",
        borderColor: isCyber ? `${accent}55` : "#000000",
        borderWidth: isCyber ? "1.5px" : "2.5px",
        boxShadow: isCyber
          ? `0 6px 30px ${accent}18`
          : "4px 4px 0 #000000",
        ...(character.isFavorite ? { ringColor: "#A855F7" } : {}),
      }}
    >
      {/* ── Splash Art Background ── */}
      {splash && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src={splash}
            alt=""
            className="w-full h-full object-cover object-top opacity-20 group-hover:opacity-28 transition-opacity duration-500 scale-105"
            style={{ filter: "blur(1px) saturate(1.3)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: isCyber
                ? `linear-gradient(to bottom, transparent 0%, rgba(9,13,28,0.75) 45%, rgba(9,13,28,0.97) 100%)`
                : `linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.5) 40%, rgba(255,255,255,0.97) 100%)`,
            }}
          />
        </div>
      )}

      {/* ── Cyber Glow Orb ── */}
      {isCyber && (
        <div
          className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-3xl opacity-20 pointer-events-none z-0 group-hover:opacity-35 transition-opacity"
          style={{ backgroundColor: accent }}
        />
      )}

      {/* ── Main Content ── */}
      <div className="relative z-10 p-4 space-y-3">
        {/* Top row: Avatar + Info + Actions */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div
            className="shrink-0 rounded-xl overflow-hidden border-2 shadow-md"
            style={{
              width: 56,
              height: 56,
              borderColor: isCyber ? `${accent}90` : "#000000",
              boxShadow: isCyber ? `0 0 12px ${accent}50` : "3px 3px 0 #000",
              backgroundColor: `${accent}18`,
            }}
          >
            {hasAvatar ? (
              <img src={avatar} alt={character.name} className="w-full h-full object-cover object-top" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-xl font-black select-none"
                style={{ color: accent }}
              >
                {character.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Name + Game */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4
                className="font-black text-base leading-tight theme-text-primary truncate"
                title={character.name}
              >
                {character.name}
              </h4>
              {character.isFavorite && (
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 1 }}
                  className="text-amber-400 text-xs"
                  title="Starred Favorite"
                >
                  ⭐
                </motion.span>
              )}
              {character.rank !== undefined && character.rank > 0 && (
                <span
                  className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold"
                  style={{
                    backgroundColor: isCyber ? "rgba(255,215,0,0.15)" : "#FEF3C7",
                    color: isCyber ? "#FFD700" : "#92400E",
                    border: isCyber ? "1px solid rgba(255,215,0,0.3)" : "1.5px solid #000",
                  }}
                >
                  #{character.rank}
                </span>
              )}
              {character.tier && (
                <span
                  className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold"
                  style={{
                    backgroundColor: isCyber ? `${accent}18` : "#EFF6FF",
                    color: isCyber ? accent : "#2563EB",
                    border: isCyber ? `1px solid ${accent}40` : "1.5px solid #000",
                  }}
                >
                  {character.tier}
                </span>
              )}
            </div>

            {/* Game row */}
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className="text-[10px] font-mono theme-text-muted truncate max-w-[140px]">
                {resolvedGameTitle}
              </span>
              {isOrphan ? (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                  ⚠️ Unlinked
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                  ✓ Linked
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {isOrphan && (
              <button
                onClick={handleSyncDatabase}
                className="px-2 py-1 rounded-lg text-[9px] font-bold font-mono bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/25 transition-all cursor-pointer"
                title="Sync with Game Database"
              >
                🔄
              </button>
            )}
            {linkedDossierChar && linkedDossierChar.splashArt && !character.splashArt && (
              <button
                onClick={handleSyncArtwork}
                className="p-1 rounded-lg text-xs opacity-70 hover:opacity-100 bg-purple-500/15 text-purple-400 border border-purple-500/30 transition-all cursor-pointer"
                title="Sync Artwork from Character Collection"
              >
                🖼️
              </button>
            )}
            <button
              onClick={handleToggleFavorite}
              className={`p-1.5 rounded-lg text-xs transition-all active:scale-90 cursor-pointer ${
                character.isFavorite ? "opacity-100" : "opacity-30 hover:opacity-100"
              }`}
              title={character.isFavorite ? "Remove Favorite" : "Star Favorite"}
            >
              {character.isFavorite ? "⭐" : "☆"}
            </button>
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(character); }}
                className="p-1 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10 cursor-pointer"
                title="Edit"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(character); }}
                className="p-1 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 cursor-pointer"
                title="Delete"
              >
                🗑️
              </button>
            )}
          </div>
        </div>

        {/* ── Element + Role + Gender + Birthday row ── */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {character.element && (
            <span
              className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border"
              style={{
                backgroundColor: `${elementColor}20`,
                color: elementColor,
                borderColor: `${elementColor}50`,
              }}
            >
              {character.element}
            </span>
          )}
          {(character.role || character.combatRole || character.stats?.combatRole) && (
            <span
              className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border"
              style={{
                backgroundColor: isCyber ? "rgba(255,255,255,0.07)" : "#F3F4F6",
                color: isCyber ? "rgba(255,255,255,0.6)" : "#4B5563",
                borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#E5E7EB",
              }}
            >
              {character.role || character.combatRole || character.stats?.combatRole}
            </span>
          )}
          {character.rarity && (
            <span
              className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border"
              style={{
                backgroundColor: isCyber ? "rgba(255,215,0,0.1)" : "#FFFBEB",
                color: isCyber ? "#FFD700" : "#92400E",
                borderColor: isCyber ? "rgba(255,215,0,0.3)" : "#FCD34D",
              }}
            >
              ✦ {character.rarity}
            </span>
          )}
          {/* Gender + Birthday mini meta */}
          <div className="ml-auto flex items-center gap-2">
            {character.gender && (
              <span
                className="text-[10px] font-mono opacity-50"
                style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}
              >
                {genderIcon(character.gender)}
              </span>
            )}
            {character.birthday && (
              <span
                className="text-[10px] font-mono opacity-50"
                style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}
              >
                🎂 {character.birthday}
              </span>
            )}
          </div>
        </div>

        {/* ── Short Bio ── */}
        {shortBio && (
          <p
            className="text-[10px] font-mono leading-relaxed line-clamp-2 border-t pt-2"
            style={{
              color: isCyber ? "rgba(148,163,184,0.7)" : "#6B7280",
              borderColor: isCyber ? "rgba(255,255,255,0.07)" : "#F3F4F6",
            }}
          >
            {shortBio}
          </p>
        )}

        {/* ── Notes ── */}
        {character.notes && !shortBio && (
          <p
            className="text-[10px] font-mono leading-relaxed line-clamp-2 border-t pt-2"
            style={{
              color: isCyber ? "rgba(148,163,184,0.7)" : "#6B7280",
              borderColor: isCyber ? "rgba(255,255,255,0.07)" : "#F3F4F6",
            }}
          >
            📝 {character.notes}
          </p>
        )}
      </div>

      {/* ── Accent bottom bar ── */}
      <div
        className="h-0.5 w-full opacity-60 group-hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(90deg, ${accent}00, ${accent}, ${accent}00)`,
        }}
      />
    </motion.div>
  );
}
