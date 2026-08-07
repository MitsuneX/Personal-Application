"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { GameCharacterEntry, useDashboardStore } from "@/lib/store/dashboardStore";
import { useContextMenu } from "@/hooks/useContextMenu";
import { useToast } from "@/components/ui/ToastProvider";

const ELEMENT_COLORS: Record<string, string> = {
  pyro:"#FF4A4A", hydro:"#1E90FF", anemo:"#4DC9A9", geo:"#CFA827",
  electro:"#A855F7", cryo:"#8FBCD4", dendro:"#5CB85C", fire:"#FF4A4A",
  water:"#1E90FF", ice:"#8FBCD4", wind:"#4DC9A9", lightning:"#A855F7",
  rock:"#CFA827", quantum:"#A855F7", imaginary:"#D4A017", physical:"#94A3B8",
  glacio:"#8FBCD4", fusion:"#FF6B35", havoc:"#DC2626", aero:"#4DC9A9",
  spectro:"#F4C430", cyber:"#00F5FF",
};
function elColor(el?: string) {
  if (!el) return "#A855F7";
  return ELEMENT_COLORS[el.toLowerCase().replace(/[^a-z]/g, "")] || "#A855F7";
}
function rarityStars(r?: string) {
  if (!r) return null;
  const m = r.match(/(\d)/);
  if (!m) return null;
  const n = Math.min(parseInt(m[1]), 6);
  return "★".repeat(n);
}

interface GameCharacterCardProps {
  character: GameCharacterEntry;
  onClick: (character: GameCharacterEntry) => void;
  onEdit?: (character: GameCharacterEntry) => void;
  onDelete?: (character: GameCharacterEntry) => void;
}

export function GameCharacterCard({ character, onClick, onEdit, onDelete }: GameCharacterCardProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const {
    games,
    dossierCharacters,
    updateGameCharacter,
    addGameCharacter,
    syncGameCharacterCardImage,
    syncGameCharacterSplashArt,
    syncOrphanedGameCharacters,
  } = useDashboardStore();
  const { openContextMenu } = useContextMenu();
  const { success: toastSuccess } = useToast();

  const parentGame = games.find((g) => g.id === character.gameId);
  const linkedDossierChar = dossierCharacters.find(
    (dc) =>
      (character.characterId && dc.id === character.characterId) ||
      (dc.name.toLowerCase() === character.name.toLowerCase() &&
        (dc.gameId === character.gameId ||
          dc.gameTitle?.toLowerCase() === (character.gameName || "").toLowerCase()))
  );

  const accent = character.accentColor || parentGame?.accentColor || "#A855F7";
  const cardImg = character.cardImage || character.splashArt || character.avatarUrl;
  const avatar = character.avatarUrl || character.cardImage;
  const gameName = character.gameName || parentGame?.game || "";
  const isLinked = Boolean(character.gameId && parentGame);
  const stars = rarityStars(character.rarity);
  const ec = elColor(character.element);

  const hasCardImg = cardImg && (cardImg.startsWith("http") || cardImg.startsWith("data:") || cardImg.startsWith("/"));
  const hasAvatar = avatar && (avatar.startsWith("http") || avatar.startsWith("data:") || avatar.startsWith("/"));

  // ── Context Menu Actions ──────────────────────────────────────────────────
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();

    const items = [
      {
        id: "open-profile",
        label: `Open ${character.name}'s Profile`,
        icon: "👁️",
        onClick: () => onClick(character),
      },
      {
        id: "edit",
        label: "Edit Character",
        icon: "✏️",
        onClick: () => onEdit?.(character),
      },
      ...(isLinked
        ? [
            {
              id: "open-game-db",
              label: `Open Database (${gameName})`,
              icon: "🎮",
              onClick: () => {
                window.location.href = `/game-database?gameId=${character.gameId}`;
              },
            },
          ]
        : []),
      ...(linkedDossierChar
        ? [
            {
              id: "open-dossier-char",
              label: "View in Character Collection",
              icon: "📂",
              onClick: () => {
                window.location.href = `/game-database?characterId=${linkedDossierChar.id}`;
              },
            },
            {
              id: "sync-card-img",
              label: "Sync Card Image with Database",
              icon: "🖼️",
              onClick: async () => {
                if (confirm(`Sync Card Image with Game Database entry for ${character.name}?`)) {
                  await syncGameCharacterCardImage(character.id, linkedDossierChar.id, "to_game_character");
                  toastSuccess("Card Image synchronized!");
                }
              },
            },
            {
              id: "sync-splash-art",
              label: "Sync Splash Art with Database",
              icon: "🌌",
              onClick: async () => {
                if (confirm(`Sync Splash Art with Game Database entry for ${character.name}?`)) {
                  await syncGameCharacterSplashArt(character.id, linkedDossierChar.id, "to_game_character");
                  toastSuccess("Splash Art synchronized!");
                }
              },
            },
          ]
        : []),
      {
        id: "sync-db",
        label: "Sync Metadata with Database",
        icon: "🔄",
        onClick: async () => {
          await syncOrphanedGameCharacters(character.gameId || undefined, character.gameName || undefined);
          toastSuccess("Database synced!");
        },
      },
      {
        id: "favorite",
        label: character.isFavorite ? "Unstar Favorite" : "Star as Favorite",
        icon: "⭐",
        onClick: async () => {
          await updateGameCharacter(character.id, { isFavorite: !character.isFavorite });
        },
      },
      {
        id: "change-rank",
        label: "Set Roster Rank #",
        icon: "🔢",
        onClick: async () => {
          const res = prompt(`Set roster rank number for ${character.name}:`, character.rank?.toString() || "1");
          if (res !== null) {
            const num = parseInt(res);
            if (!isNaN(num)) {
              await updateGameCharacter(character.id, { rank: num });
              toastSuccess(`Rank updated to #${num}!`);
            }
          }
        },
      },
      {
        id: "duplicate",
        label: "Duplicate Character",
        icon: "📋",
        onClick: async () => {
          await addGameCharacter({
            ...character,
            id: undefined,
            name: `${character.name} (Copy)`,
          });
          toastSuccess(`Duplicated ${character.name}!`);
        },
      },
      {
        id: "copy-summary",
        label: "Copy Character Summary",
        icon: "📄",
        onClick: () => {
          const summary = `${character.name} (${gameName || "Game"}) | Element: ${character.element || "N/A"} | Role: ${character.role || "N/A"} | Rarity: ${character.rarity || "N/A"}`;
          navigator.clipboard.writeText(summary);
          toastSuccess("Summary copied to clipboard!");
        },
      },
      {
        id: "export-json",
        label: "Export Character Data (JSON)",
        icon: "📤",
        onClick: () => {
          const json = JSON.stringify(character, null, 2);
          navigator.clipboard.writeText(json);
          toastSuccess("JSON data copied to clipboard!");
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
    ];

    openContextMenu(e, items, character.name);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover="hover"
      onClick={() => onClick(character)}
      onContextMenu={handleContextMenu}
      className="relative cursor-pointer select-none overflow-hidden rounded-2xl"
      style={{
        aspectRatio: "3/4",
        border: isCyber ? `1.5px solid rgba(255,255,255,0.08)` : `3px solid #000000`,
        boxShadow: isCyber
          ? `0 4px 24px rgba(0,0,0,0.6), 0 0 0 0 ${accent}`
          : "6px 6px 0 #000000",
        backgroundColor: isCyber ? "#090d1c" : "#FFFFFF",
      }}
    >
      {/* ── Artwork layer ────────────────────────────────────────────── */}
      <motion.div
        className="absolute inset-0 z-0"
        variants={{ hover: { scale: 1.07 } }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {hasCardImg ? (
          <img
            src={cardImg!}
            alt={character.name}
            className="w-full h-full object-cover object-top"
            draggable={false}
          />
        ) : hasAvatar ? (
          <img
            src={avatar!}
            alt={character.name}
            className="w-full h-full object-cover object-top"
            style={{ filter: "blur(2px) saturate(1.3)", transform: "scale(1.08)" }}
            draggable={false}
          />
        ) : (
          <div
            className="w-full h-full flex items-end justify-center pb-24"
            style={{
              background: isCyber
                ? `radial-gradient(ellipse at 50% 30%, ${accent}40 0%, transparent 65%), linear-gradient(to bottom, #0a0c18 0%, #0f1225 100%)`
                : `radial-gradient(ellipse at 50% 30%, ${accent}30 0%, transparent 65%), #FFFBEB`,
            }}
          >
            <span
              className="font-black text-[8rem] leading-none opacity-15 select-none"
              style={{ color: accent }}
            >
              {character.name.charAt(0)}
            </span>
          </div>
        )}
      </motion.div>

      {/* ── Gradient overlay ────────────────────────────────────────────── */}
      <motion.div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: isCyber
            ? "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.93) 100%)"
            : "linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.7) 65%, rgba(255,255,255,0.98) 100%)",
        }}
      />

      {/* ── Top-left: Favorite glow ───────────────────────────────────── */}
      {character.isFavorite && (
        <motion.div
          className="absolute top-3 left-3 z-20"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
        >
          <span
            className="text-lg drop-shadow-lg"
            style={{ filter: isCyber ? `drop-shadow(0 0 6px #FBB724)` : undefined }}
          >⭐</span>
        </motion.div>
      )}

      {/* ── Top-right: Rarity stars ───────────────────────────────────── */}
      {stars && (
        <div className="absolute top-3 right-3 z-20">
          <span
            className="text-xs tracking-tight font-bold"
            style={{
              color: isCyber ? "#FFD700" : "#D97706",
              textShadow: isCyber ? "0 1px 6px rgba(0,0,0,0.8)" : undefined,
            }}
          >
            {stars}
          </span>
        </div>
      )}

      {/* ── Accent border glow / neo shadow on hover ──────────────────── */}
      {isCyber && (
        <motion.div
          className="absolute inset-0 z-20 rounded-2xl pointer-events-none"
          style={{ border: `1.5px solid transparent` }}
          variants={{
            hover: {
              border: `1.5px solid ${accent}80`,
              boxShadow: `inset 0 0 24px ${accent}15, 0 0 30px ${accent}25`,
            },
          }}
          transition={{ duration: 0.25 }}
        />
      )}

      {/* ── Bottom content ────────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 z-30 px-4 pb-4 pt-8">
        {/* Element + Role chips */}
        <div className="flex items-center gap-1.5 flex-wrap mb-2">
          {character.element && (
            <span
              className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono border leading-tight"
              style={{
                backgroundColor: `${ec}25`,
                borderColor: isCyber ? `${ec}50` : "#000000",
                borderWidth: isCyber ? "1px" : "1.5px",
                color: isCyber ? ec : "#000000",
              }}
            >
              {character.element}
            </span>
          )}
          {character.role && (
            <span
              className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono border leading-tight"
              style={{
                backgroundColor: isCyber ? "rgba(255,255,255,0.1)" : "#F3F4F6",
                borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#000000",
                borderWidth: isCyber ? "1px" : "1.5px",
                color: isCyber ? "#FFFFFF" : "#000000",
              }}
            >
              {character.role}
            </span>
          )}
          {character.tier && (
            <span
              className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono border leading-tight"
              style={{
                backgroundColor: `${accent}20`,
                borderColor: isCyber ? `${accent}50` : "#000000",
                borderWidth: isCyber ? "1px" : "1.5px",
                color: isCyber ? accent : "#000000",
              }}
            >
              {character.tier}
            </span>
          )}
        </div>

        {/* Character name */}
        <motion.h3
          className="font-black leading-tight text-xl tracking-tight"
          style={{
            color: isCyber ? "#FFFFFF" : "#000000",
            textShadow: isCyber ? "0 2px 12px rgba(0,0,0,0.8)" : undefined,
          }}
          variants={{ hover: { y: -3 } }}
          transition={{ duration: 0.25 }}
        >
          {character.name}
        </motion.h3>

        {/* Game name */}
        {gameName && (
          <p className="text-[10px] font-mono opacity-50 mt-0.5 truncate" style={{ color: isCyber ? "#FFFFFF" : "#4B5563" }}>
            {gameName}
          </p>
        )}

        {/* Bottom row: Linked badge */}
        <div className="flex items-center justify-between mt-2">
          <div>
            {isLinked ? (
              <span className="text-[9px] font-mono font-bold flex items-center gap-1" style={{ color: isCyber ? "#4ADE80" : "#15803D" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                Linked
              </span>
            ) : (
              <span className="text-[9px] font-mono font-bold flex items-center gap-1" style={{ color: isCyber ? "#FBBF24" : "#B45309" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                Unlinked
              </span>
            )}
          </div>
          {character.rank && character.rank > 0 ? (
            <span className="text-[9px] font-mono opacity-40" style={{ color: isCyber ? "#FFFFFF" : "#000000" }}>
              #{character.rank}
            </span>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
