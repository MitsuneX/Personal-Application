"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { GameCharacterEntry, useDashboardStore } from "@/lib/store/dashboardStore";
import { useContextMenu } from "@/hooks/useContextMenu";
import { useToast } from "@/components/ui/ToastProvider";
import { duplicateGameCharacter } from "@/lib/data/duplicateHelper";
import { getElementTheme } from "@/lib/utils/elementTheme";
import { getCardVideoUrl, getCardImageUrl, getCardVideoPosterUrl, getCardVideoFraming, getCardVideoPosterFraming } from "@/lib/utils/mediaResolver";
import { LazyCardVideo } from "@/components/cards/LazyCardVideo";

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
  const [videoError, setVideoError] = React.useState(false);
  const [imgError, setImgError] = React.useState(false);
  const {
    games,
    dossierCharacters,
    userLikedGameCharacterIds = [],
    likeGameCharacter,
    updateGameCharacter,
    addGameCharacter,
    syncGameCharacterCardImage,
    syncGameCharacterSplashArt,
    syncOrphanedGameCharacters,
  } = useDashboardStore();
  const { openContextMenu } = useContextMenu();
  const { success: toastSuccess, error: toastError } = useToast();

  const parentGame = games.find((g) => g.id === character.gameId);
  const linkedDossierChar = dossierCharacters.find(
    (dc) =>
      (character.characterId && dc.id === character.characterId) ||
      (dc.name.toLowerCase() === character.name.toLowerCase() &&
        (dc.gameId === character.gameId ||
          dc.gameTitle?.toLowerCase() === (character.gameName || "").toLowerCase()))
  );

  const accent = character.accentColor || parentGame?.accentColor || "#A855F7";
  const gameName = character.gameName || parentGame?.game || "";
  const elemTheme = getElementTheme(gameName, character.element, accent);
  const ec = elemTheme.primaryColor;

  const videoUrl = !videoError ? getCardVideoUrl(character) : null;
  const videoPoster = getCardVideoPosterUrl(character);
  const videoFraming = getCardVideoFraming(character);
  const posterFraming = getCardVideoPosterFraming(character);
  const cardImg = !imgError ? (getCardImageUrl(character) || character.cardImage || character.splashArt) : null;
  const avatar = character.avatarUrl || character.cardImage;
  const isLinked = Boolean(character.gameId && parentGame);
  const stars = rarityStars(character.rarity);

  const hasVideo = !!videoUrl;
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
        divider: true,
        onClick: async () => {
          const cloned = duplicateGameCharacter(character);
          await addGameCharacter(cloned);
          toastSuccess(`Duplicated “${character.name}” — independent copy created!`);
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
              label: `Move to History (${character.name})`,
              icon: "📜",
              danger: true,
              divider: true,
              onClick: () => onDelete(character),
            },
          ]
        : []),
    ];

    openContextMenu(e, items, character.name);
  };

  const lastTapRef = React.useRef<number>(0);
  const clickTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const [showHeartBurst, setShowHeartBurst] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }
    clickTimerRef.current = setTimeout(() => {
      onClick(character);
      clickTimerRef.current = null;
    }, 250);
  };

  const triggerInstantLike = (e: React.MouseEvent | React.TouchEvent) => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    likeGameCharacter(character.id).catch(() => {});
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover="hover"
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onTouchEnd={handleTouchEnd}
      onContextMenu={handleContextMenu}
      className="relative cursor-pointer select-none overflow-hidden rounded-2xl"
      style={{
        aspectRatio: "3/4",
        border: character.isFeatured
          ? (isCyber ? `2px solid #FFD700` : `3.5px solid #000000`)
          : (isCyber ? `1.5px solid rgba(255,255,255,0.08)` : `3px solid #000000`),
        boxShadow: character.isFeatured
          ? (isCyber ? `0 0 25px rgba(255,215,0,0.35), inset 0 0 15px rgba(255,215,0,0.1)` : "7px 7px 0 #000000")
          : (isCyber ? `0 4px 24px rgba(0,0,0,0.6), 0 0 0 0 ${accent}` : "6px 6px 0 #000000"),
        backgroundColor: isCyber ? "#090d1c" : "#FFFFFF",
      }}
    >
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

      {/* ── Artwork layer ────────────────────────────────────────────── */}
      <motion.div
        className="absolute inset-0 z-0"
        variants={{ hover: { scale: 1.07 } }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {hasVideo ? (
          <LazyCardVideo
            videoUrl={videoUrl!}
            posterUrl={videoPoster}
            framing={videoFraming}
            posterFraming={posterFraming}
            alt={character.name}
            onError={() => setVideoError(true)}
          />
        ) : hasCardImg ? (
          <img
            src={cardImg!}
            alt={character.name}
            onError={() => setImgError(true)}
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

      {/* ── Top-left: Featured & Favorite badges ───────────────────────────── */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
        {character.isFeatured && (
          <motion.span
            initial={{ scale: 0.9 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1 border"
            style={{
              backgroundColor: isCyber ? "rgba(255,215,0,0.2)" : "#FEF08A",
              color: isCyber ? "#FFD700" : "#854D0E",
              borderColor: isCyber ? "#FFD700" : "#000000",
              borderWidth: isCyber ? "1px" : "2px",
              backdropFilter: "blur(8px)",
              boxShadow: isCyber ? "0 0 10px rgba(255,215,0,0.4)" : "2px 2px 0 #000",
            }}
          >
            ⭐ FEATURED
          </motion.span>
        )}

        {character.isFavorite && !character.isFeatured && (
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
          >
            <span
              className="text-lg drop-shadow-lg"
              style={{ filter: isCyber ? `drop-shadow(0 0 6px #FBB724)` : undefined }}
            >⭐</span>
          </motion.div>
        )}
      </div>

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

        {/* Bottom row: Linked badge + Like Button */}
        <div className="flex items-center justify-between mt-2.5">
          <div className="flex items-center gap-2">
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

          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={async (e) => {
              e.stopPropagation();
              const isLiked = userLikedGameCharacterIds.includes(character.id);
              try {
                const res = await likeGameCharacter(character.id);
                if (res.liked) {
                  toastSuccess(`Liked ${character.name}! ❤️`);
                }
              } catch (err: any) {
                toastError(err.message || "Sign in to like this character.");
              }
            }}
            className="px-2 py-1 rounded-xl text-[10px] font-mono font-black flex items-center gap-1.5 cursor-pointer transition-all border"
            style={{
              backgroundColor: userLikedGameCharacterIds.includes(character.id)
                ? isCyber
                  ? "rgba(255,20,147,0.25)"
                  : "#FFE4E6"
                : isCyber
                ? "rgba(255,255,255,0.06)"
                : "#F3F4F6",
              color: userLikedGameCharacterIds.includes(character.id)
                ? isCyber
                  ? "#FF1493"
                  : "#E11D48"
                : isCyber
                ? "#94A3B8"
                : "#4B5563",
              borderColor: userLikedGameCharacterIds.includes(character.id)
                ? isCyber
                  ? "#FF1493"
                  : "#E11D48"
                : isCyber
                ? "rgba(255,255,255,0.15)"
                : "#000000",
              borderWidth: isCyber ? "1px" : "2px",
              boxShadow: userLikedGameCharacterIds.includes(character.id)
                ? isCyber
                  ? "0 0 12px rgba(255,20,147,0.4)"
                  : "2px 2px 0 #000000"
                : "none",
            }}
          >
            <span className={userLikedGameCharacterIds.includes(character.id) ? "animate-pulse text-xs" : "text-xs opacity-70"}>❤️</span>
            <span>{character.likes || 0}</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
