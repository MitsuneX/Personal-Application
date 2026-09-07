"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { CoupleEntry, TIER_COLORS, RELATIONSHIP_STATUS_OPTIONS } from "@/lib/data/coupleSchema";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { useContextMenu } from "@/hooks/useContextMenu";
import { useToast } from "@/components/ui/ToastProvider";
import type { ContextMenuItem } from "@/components/ui/ContextMenu";

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
  const {
    hallOfFame = [],
    dossierCharacters = [],
    toggleFavoriteCouple,
    likeCouple,
    userLikedCoupleIds,
  } = useDashboardStore();
  const { openContextMenu } = useContextMenu();
  const { success: toastSuccess } = useToast();

  const isLiked = userLikedCoupleIds.includes(couple.id);

  // Resolve Partner A canonical data
  const canonicalA = useMemo(() => {
    if (!couple.partnerA.characterId) return null;
    return (
      hallOfFame.find((h) => h.id === couple.partnerA.characterId) ||
      dossierCharacters.find((d) => d.id === couple.partnerA.characterId) ||
      null
    );
  }, [couple.partnerA.characterId, hallOfFame, dossierCharacters]);

  // Resolve Partner B canonical data
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

  const coverImage = couple.media.cover || couple.media.card || couple.media.gallery?.[0] || null;

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
        id: "like-couple",
        label: isLiked ? `Unlike (${couple.likes || 0})` : `Like (${couple.likes || 0})`,
        icon: isLiked ? "❤️" : "🤍",
        onClick: () => likeCouple(couple.id),
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
      whileHover={{ y: -4, scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      className="group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer select-none transition-all duration-300 border"
      style={{
        backgroundColor: isCyber ? "rgba(10, 15, 30, 0.85)" : "#FFFFFF",
        borderColor: isCyber
          ? couple.isFavorite
            ? "rgba(255, 0, 127, 0.4)"
            : "rgba(0, 245, 255, 0.2)"
          : "#000000",
        borderWidth: isCyber ? "1px" : "2.5px",
        boxShadow: isCyber
          ? couple.isFavorite
            ? "0 0 20px rgba(255, 0, 127, 0.2)"
            : "0 4px 20px rgba(0, 0, 0, 0.4)"
          : "4px 4px 0 #000000",
      }}
    >
      {/* ── Top Cover Media / Dual-Avatar Poster ── */}
      <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-black/40">
        {coverImage ? (
          <img
            src={coverImage}
            alt={couple.coupleName}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-pink-950/40 via-purple-950/30 to-cyan-950/40">
            {/* Ambient blurred backdrop circles */}
            <div className="absolute -left-6 -top-6 w-32 h-32 rounded-full bg-cyan-500/20 blur-xl pointer-events-none" />
            <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-pink-500/20 blur-xl pointer-events-none" />

            {/* Dual overlapping partner avatars */}
            <div className="relative flex items-center justify-center z-10">
              <div
                className="w-20 h-20 rounded-full overflow-hidden border-2 z-10 -mr-4 shadow-lg"
                style={{
                  borderColor: isCyber ? "#00F5FF" : "#000000",
                  boxShadow: isCyber ? "0 0 12px rgba(0,245,255,0.5)" : "2px 2px 0 #000",
                }}
              >
                <img src={partnerAAvatar} alt={partnerAName} className="w-full h-full object-cover" />
              </div>
              <div
                className="w-9 h-9 rounded-full bg-pink-500 text-white flex items-center justify-center text-sm font-black z-20 shadow-md border"
                style={{ borderColor: isCyber ? "#00F5FF" : "#000000" }}
              >
                ❤️
              </div>
              <div
                className="w-20 h-20 rounded-full overflow-hidden border-2 z-10 -ml-4 shadow-lg"
                style={{
                  borderColor: isCyber ? "#FF007F" : "#000000",
                  boxShadow: isCyber ? "0 0 12px rgba(255,0,127,0.5)" : "2px 2px 0 #000",
                }}
              >
                <img src={partnerBAvatar} alt={partnerBName} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        )}

        {/* Gradient shadow overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Top Badges (Tier & Favorite) */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-20 pointer-events-none">
          <span
            className="px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider font-mono border"
            style={{
              backgroundColor: isCyber ? tierConfig.bgCyber : tierConfig.bgNeo,
              color: tierConfig.color,
              borderColor: tierConfig.color,
              boxShadow: isCyber ? `0 0 8px ${tierConfig.color}40` : "1.5px 1.5px 0 #000",
            }}
          >
            {tierConfig.label}
          </span>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Favorite Star Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavoriteCouple(couple.id);
              }}
              title={couple.isFavorite ? "Favorited" : "Favorite"}
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-transform active:scale-90 border backdrop-blur-md"
              style={{
                backgroundColor: couple.isFavorite
                  ? isCyber
                    ? "rgba(255, 0, 127, 0.3)"
                    : "#FFE4E6"
                  : isCyber
                  ? "rgba(0, 0, 0, 0.5)"
                  : "#FFFFFF",
                borderColor: couple.isFavorite ? "#EC4899" : isCyber ? "rgba(255,255,255,0.2)" : "#000000",
                color: couple.isFavorite ? "#EC4899" : isCyber ? "#94A3B8" : "#4A4A4A",
                boxShadow: isCyber && couple.isFavorite ? "0 0 10px rgba(236,72,153,0.5)" : "none",
              }}
            >
              {couple.isFavorite ? "★" : "☆"}
            </button>
          </div>
        </div>

        {/* Bottom Partner Mini Chips (when cover image exists) */}
        {coverImage && (
          <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center gap-1.5 z-20">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md backdrop-blur-md bg-black/60 border border-white/10 text-[11px] font-bold text-white max-w-[48%] truncate">
              <img src={partnerAAvatar} alt="" className="w-4 h-4 rounded-full object-cover shrink-0" />
              <span className="truncate">{partnerAName}</span>
            </div>
            <span className="text-xs text-pink-400 font-bold shrink-0">×</span>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md backdrop-blur-md bg-black/60 border border-white/10 text-[11px] font-bold text-white max-w-[48%] truncate">
              <img src={partnerBAvatar} alt="" className="w-4 h-4 rounded-full object-cover shrink-0" />
              <span className="truncate">{partnerBName}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Card Content Body ── */}
      <div className="flex-1 p-3.5 sm:p-4 flex flex-col justify-between gap-3">
        <div>
          {/* Couple Title */}
          <h3
            className="font-black text-sm sm:text-base leading-tight tracking-tight line-clamp-1 mb-1"
            style={{
              color: isCyber ? "#E0E8FF" : "#1A1A1A",
              fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
            }}
          >
            {couple.coupleName}
          </h3>

          {/* Source & Metadata */}
          <div className="flex items-center gap-1.5 text-xs font-mono font-medium opacity-75 line-clamp-1 mb-2.5">
            <span className="truncate">{couple.source.title}</span>
            {couple.source.year && (
              <>
                <span>•</span>
                <span>{couple.source.year}</span>
              </>
            )}
            {couple.source.country && (
              <>
                <span>•</span>
                <span className="truncate">{couple.source.country}</span>
              </>
            )}
          </div>

          {/* Dynamics & Status Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Status */}
            <span
              className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono flex items-center gap-1 border"
              style={{
                backgroundColor: isCyber ? statusConfig.badgeBg : "#FFF",
                color: statusConfig.color,
                borderColor: statusConfig.color,
                boxShadow: isCyber ? `0 0 6px ${statusConfig.color}30` : "1px 1px 0 #000",
              }}
            >
              <span>{statusConfig.icon}</span>
              <span>{statusConfig.label}</span>
            </span>

            {/* Media Type */}
            <span
              className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono border"
              style={{
                backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#F3F4F6",
                color: isCyber ? "#94A3B8" : "#4B5563",
                borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E5E7EB",
              }}
            >
              {couple.source.mediaType}
            </span>

            {/* Dynamics preview (first dynamic) */}
            {couple.relationship.dynamics?.[0] && (
              <span
                className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider truncate max-w-[120px] border"
                style={{
                  backgroundColor: isCyber ? "rgba(139,92,246,0.15)" : "#F3E8FF",
                  color: isCyber ? "#C084FC" : "#7E22CE",
                  borderColor: isCyber ? "rgba(139,92,246,0.3)" : "#D8B4FE",
                }}
              >
                {couple.relationship.dynamics[0]}
              </span>
            )}
          </div>
        </div>

        {/* ── Footer Info (Green Flags count, Chemistry score, Likes) ── */}
        <div
          className="pt-2.5 mt-auto flex items-center justify-between border-t text-xs font-mono"
          style={{ borderColor: isCyber ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}
        >
          {/* Green flags & chemistry badges */}
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5"
              title="Total Green Flags"
            >
              <span>🚩</span>
              <span>
                {(couple.greenFlags.partnerA?.length || 0) + (couple.greenFlags.partnerB?.length || 0)}
              </span>
            </span>

            <span
              className="text-[10px] font-bold text-pink-400 flex items-center gap-0.5"
              title="Chemistry Average"
            >
              <span>🧪</span>
              <span>
                {(
                  (couple.chemistry.communication +
                    couple.chemistry.trust +
                    couple.chemistry.loyalty +
                    couple.chemistry.support +
                    couple.chemistry.compatibility +
                    couple.chemistry.growth +
                    couple.chemistry.affection +
                    couple.chemistry.humor) /
                  8
                ).toFixed(1)}
              </span>
            </span>
          </div>

          {/* Like Interaction Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              likeCouple(couple.id);
            }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg transition-transform active:scale-90 border select-none"
            style={{
              backgroundColor: isLiked
                ? isCyber
                  ? "rgba(236,72,153,0.15)"
                  : "#FCE7F3"
                : isCyber
                ? "rgba(255,255,255,0.03)"
                : "#F9FAFB",
              borderColor: isLiked ? "#EC4899" : isCyber ? "rgba(255,255,255,0.1)" : "#E5E7EB",
              color: isLiked ? "#EC4899" : isCyber ? "#94A3B8" : "#6B7280",
            }}
          >
            <span>{isLiked ? "❤️" : "🤍"}</span>
            <span className="font-bold text-[11px]">{couple.likes || 0}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
