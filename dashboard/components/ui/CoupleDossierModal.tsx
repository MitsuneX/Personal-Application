"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import {
  CoupleEntry,
  TIER_COLORS,
  RELATIONSHIP_STATUS_OPTIONS,
  RELATIONSHIP_ENDING_OPTIONS,
  CHEMISTRY_DIMENSIONS,
} from "@/lib/data/coupleSchema";
import { useDashboardStore, HallOfFameEntry } from "@/lib/store/dashboardStore";
import { ImageLightboxModal } from "@/components/ui/ImageLightboxModal";
import { useContextMenu } from "@/hooks/useContextMenu";
import { useToast } from "@/components/ui/ToastProvider";
import { RomanticLoveBurst, type RomanticLoveBurstHandle } from "@/components/ui/RomanticLoveBurst";
import { triggerHeartEffect } from "@/components/ui/FloatingHeartEngine";
import type { ContextMenuItem } from "@/components/ui/ContextMenu";

interface CoupleDossierModalProps {
  isOpen: boolean;
  couple: CoupleEntry | null;
  onClose: () => void;
  onEdit?: (couple: CoupleEntry) => void;
  onOpenJson?: (couple: CoupleEntry) => void;
  onOpenCharacterDictionary?: (entry: HallOfFameEntry) => void;
}

export function CoupleDossierModal({
  isOpen,
  couple,
  onClose,
  onEdit,
  onOpenJson,
  onOpenCharacterDictionary,
}: CoupleDossierModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const {
    hallOfFame = [],
    dossierCharacters = [],
    toggleFavoriteCouple,
    loveCouple,
  } = useDashboardStore();

  const [activeTab, setActiveTab] = useState<"overview" | "dynamics" | "timeline" | "moments" | "notes" | "gallery">("overview");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Always reset to "overview" tab when the modal opens on card click
  useEffect(() => {
    if (isOpen) {
      setActiveTab("overview");
      setHoveredPartner(null);
      setIsCelebrating(false);
    }
  }, [isOpen, couple?.id]);

  // Romantic interaction states & refs
  const loveBurstRef = useRef<RomanticLoveBurstHandle>(null);
  const headerLikeBurstRef = useRef<RomanticLoveBurstHandle>(null);
  const [hoveredPartner, setHoveredPartner] = useState<"partnerA" | "partnerB" | "center" | null>(null);
  const [isCelebrating, setIsCelebrating] = useState(false);

  const handleCenterHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!couple) return;
    loveBurstRef.current?.trigger();
    triggerHeartEffect(e.clientX, e.clientY);
    loveCouple(couple.id);
    setIsCelebrating(true);
    setTimeout(() => setIsCelebrating(false), 850);
  };

  const handleHeaderLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!couple) return;
    headerLikeBurstRef.current?.trigger();
    triggerHeartEffect(e.clientX, e.clientY);
    loveCouple(couple.id);
  };

  // Resolve Partner A
  const canonicalA = useMemo(() => {
    if (!couple?.partnerA.characterId) return null;
    return (
      hallOfFame.find((h) => h.id === couple.partnerA.characterId) ||
      dossierCharacters.find((d) => d.id === couple.partnerA.characterId) ||
      null
    );
  }, [couple?.partnerA.characterId, hallOfFame, dossierCharacters]);

  // Resolve Partner B
  const canonicalB = useMemo(() => {
    if (!couple?.partnerB.characterId) return null;
    return (
      hallOfFame.find((h) => h.id === couple.partnerB.characterId) ||
      dossierCharacters.find((d) => d.id === couple.partnerB.characterId) ||
      null
    );
  }, [couple?.partnerB.characterId, hallOfFame, dossierCharacters]);

  if (!isOpen || !couple) return null;

  const tierConfig = TIER_COLORS[couple.tier] || TIER_COLORS.S;
  const statusConfig = RELATIONSHIP_STATUS_OPTIONS.find((s) => s.id === couple.relationship.status) || {
    label: couple.relationship.status || "Canon",
    color: "#10B981",
    badgeBg: "rgba(16,185,129,0.15)",
    icon: "💍",
  };
  const endingConfig = RELATIONSHIP_ENDING_OPTIONS.find((e) => e.id === couple.relationship.ending);

  const partnerAName = canonicalA?.name || couple.partnerA.name || "Partner A";
  const partnerBName = canonicalB?.name || couple.partnerB.name || "Partner B";

  const partnerAAvatar =
    couple.partnerA.avatar?.trim() ||
    (canonicalA as any)?.avatar ||
    (canonicalA as any)?.avatarUrl ||
    (canonicalA as any)?.imageUrl ||
    (canonicalA as any)?.portraitUrl ||
    "/avatar.png";

  const partnerBAvatar =
    couple.partnerB.avatar?.trim() ||
    (canonicalB as any)?.avatar ||
    (canonicalB as any)?.avatarUrl ||
    (canonicalB as any)?.imageUrl ||
    (canonicalB as any)?.portraitUrl ||
    "/avatar.png";

  const partnerARole = (canonicalA as any)?.role || couple.partnerA.role || "Main Character";
  const partnerBRole = (canonicalB as any)?.role || couple.partnerB.role || "Main Character";

  // Compute average chemistry score
  const chemistryAvg = (
    (couple.chemistry.communication +
      couple.chemistry.trust +
      couple.chemistry.loyalty +
      couple.chemistry.support +
      couple.chemistry.compatibility +
      couple.chemistry.growth +
      couple.chemistry.affection +
      couple.chemistry.humor) /
    8
  ).toFixed(1);

  const coverImage = couple.media.cover || couple.media.card || couple.media.gallery?.[0] || null;

  // Both avatar 1:1 images are saved/displayed in Gallery unless they are from Character Dictionary
  const isDictAvatarA = Boolean(
    canonicalA && (
      (canonicalA as any)?.avatar === couple.partnerA.avatar ||
      (canonicalA as any)?.avatarUrl === couple.partnerA.avatar ||
      (canonicalA as any)?.imageUrl === couple.partnerA.avatar ||
      (canonicalA as any)?.portraitUrl === couple.partnerA.avatar
    )
  );
  const isDictAvatarB = Boolean(
    canonicalB && (
      (canonicalB as any)?.avatar === couple.partnerB.avatar ||
      (canonicalB as any)?.avatarUrl === couple.partnerB.avatar ||
      (canonicalB as any)?.imageUrl === couple.partnerB.avatar ||
      (canonicalB as any)?.portraitUrl === couple.partnerB.avatar
    )
  );

  const customPartnerAAvatar = couple.partnerA.avatar?.trim() && !isDictAvatarA ? couple.partnerA.avatar.trim() : null;
  const customPartnerBAvatar = couple.partnerB.avatar?.trim() && !isDictAvatarB ? couple.partnerB.avatar.trim() : null;

  const allGalleryImages = Array.from(
    new Set([
      ...(couple.media.cover ? [couple.media.cover] : []),
      ...(couple.media.card ? [couple.media.card] : []),
      ...(customPartnerAAvatar ? [customPartnerAAvatar] : []),
      ...(customPartnerBAvatar ? [customPartnerBAvatar] : []),
      ...(couple.media.gallery || []),
    ])
  );

  const { openContextMenu } = useContextMenu();
  const { success: toastSuccess } = useToast();

  const handleDossierContextMenu = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button, a, input, textarea")) return;
    e.preventDefault();
    e.stopPropagation();

    if (!couple) return;

    const items: ContextMenuItem[] = [
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
              onClick: () => onOpenCharacterDictionary(canonicalA as HallOfFameEntry),
            },
          ]
        : []),
      ...(canonicalB?.id && onOpenCharacterDictionary
        ? [
            {
              id: "view-partner-b",
              label: `View ${partnerBName} in Dictionary`,
              icon: "👤",
              onClick: () => onOpenCharacterDictionary(canonicalB as HallOfFameEntry),
            },
          ]
        : []),
      {
        id: "close-dossier",
        label: "Close Dossier",
        icon: "✕",
        onClick: onClose,
      },
    ];

    openContextMenu(e, items, couple.coupleName);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          onContextMenu={handleDossierContextMenu}
          className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden border shadow-2xl z-10 font-sans"
          style={{
            backgroundColor: isCyber ? "#050816" : "#FFF5E4",
            borderColor: isCyber ? "rgba(0, 245, 255, 0.4)" : "#000000",
            borderWidth: isCyber ? "1.5px" : "3px",
            boxShadow: isCyber ? "0 0 35px rgba(0, 245, 255, 0.25)" : "6px 6px 0 #000000",
          }}
        >
          {/* ── Top Header Bar ── */}
          <div
            className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b shrink-0"
            style={{
              backgroundColor: isCyber ? "rgba(5, 8, 22, 0.9)" : "#FFE8D6",
              borderColor: isCyber ? "rgba(0,245,255,0.2)" : "rgba(0,0,0,0.15)",
            }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xl">💑</span>
              <div className="min-w-0">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-pink-500 block">
                  {isCyber ? "// ROMANCE_DOSSIER" : "Relationship Dossier"}
                </span>
                <h2
                  className="font-black text-sm sm:text-base truncate tracking-tight"
                  style={{
                    color: isCyber ? "#E0E8FF" : "#1A1A1A",
                    fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
                  }}
                >
                  {couple.coupleName}
                </h2>
              </div>
            </div>

            {/* Header Action Tools */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Love Match counter — always pink, cumulative +1 */}
              <div className="relative">
                <RomanticLoveBurst ref={headerLikeBurstRef} />
                <button
                  type="button"
                  onClick={handleHeaderLike}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer select-none"
                  style={{
                    backgroundColor: isCyber ? "rgba(236,72,153,0.18)" : "#FCE7F3",
                    borderColor: "#EC4899",
                    color: "#EC4899",
                    boxShadow: isCyber ? "0 0 10px rgba(236,72,153,0.3)" : "1px 1px 0 #000",
                  }}
                  title="Love Match — click to add +1"
                  aria-label={`Love count: ${couple.likes || 0}. Click to add love.`}
                >
                  <motion.span
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                  >
                    ❤️
                  </motion.span>
                  <span>{couple.likes || 0}</span>
                </button>
              </div>

              {/* Favorite */}
              <button
                type="button"
                onClick={() => toggleFavoriteCouple(couple.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center border text-sm transition-all hover:scale-110 active:scale-95 cursor-pointer"
                style={{
                  backgroundColor: couple.isFavorite ? (isCyber ? "rgba(255,0,127,0.25)" : "#FFE4E6") : "transparent",
                  borderColor: couple.isFavorite ? "#EC4899" : isCyber ? "rgba(255,255,255,0.2)" : "#000",
                  color: couple.isFavorite ? "#EC4899" : isCyber ? "#94A3B8" : "#4A4A4A",
                  boxShadow: couple.isFavorite && !isCyber ? "1px 1px 0 #000" : undefined,
                }}
                title={couple.isFavorite ? "Unfavorite" : "Favorite"}
              >
                {couple.isFavorite ? "★" : "☆"}
              </button>

              {/* Edit Form */}
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(couple)}
                  className="px-2.5 py-1 rounded-lg border text-xs font-mono font-bold transition-all hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: isCyber ? "rgba(255,255,255,0.08)" : "#F3F4F6",
                    borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#000",
                    color: isCyber ? "#E0E8FF" : "#000",
                  }}
                >
                  ✎ Edit
                </button>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm transition-transform hover:scale-110 active:scale-95 border cursor-pointer"
                style={{
                  backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#FFF",
                  borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#000",
                  color: isCyber ? "#94A3B8" : "#000",
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* ── Hero Banner: Partner A ❤️ Partner B with Romantic Connection Bridge ── */}
          <div
            className="p-4 sm:p-6 border-b relative overflow-hidden shrink-0 select-none"
            style={{
              backgroundColor: isCyber ? "rgba(10, 18, 38, 0.65)" : "#FFFFFF",
              borderColor: isCyber ? "rgba(0,245,255,0.15)" : "rgba(0,0,0,0.1)",
            }}
          >
            {/* Ambient background glow that intensifies during celebration */}
            <div
              className="absolute top-0 right-1/4 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-700"
              style={{
                backgroundColor: isCelebrating
                  ? "rgba(236,72,153,0.3)"
                  : isCyber
                  ? "rgba(236,72,153,0.12)"
                  : "rgba(244,114,182,0.16)",
              }}
            />

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              {/* Partners Presentation with Romantic Connection Bridge */}
              <div className="flex items-center justify-center w-full md:w-auto relative py-1">
                {/* Partner A */}
                <div
                  className="flex flex-col items-center text-center max-w-[130px] sm:max-w-[155px] z-10 cursor-pointer"
                  onMouseEnter={() => setHoveredPartner("partnerA")}
                  onMouseLeave={() => setHoveredPartner(null)}
                >
                  <motion.div
                    animate={
                      isCelebrating
                        ? { scale: [1, 1.1, 1], y: [0, -8, 0] }
                        : hoveredPartner === "partnerA" || hoveredPartner === "center"
                        ? { scale: 1.06, y: -2 }
                        : { scale: 1, y: 0 }
                    }
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 shadow-lg mb-2 relative group transition-colors duration-300"
                    style={{
                      borderColor:
                        isCelebrating || hoveredPartner === "center"
                          ? "#EC4899"
                          : hoveredPartner === "partnerA"
                          ? isCyber
                            ? "#00F5FF"
                            : "#000000"
                          : isCyber
                          ? "#00F5FF"
                          : "#000000",
                      boxShadow:
                        isCelebrating || hoveredPartner === "center"
                          ? isCyber
                            ? "0 0 24px rgba(236,72,153,0.65)"
                            : "0 0 0 3px #F472B6, 3px 3px 0 #000"
                          : isCyber
                          ? "0 0 15px rgba(0,245,255,0.4)"
                          : "3px 3px 0 #000",
                    }}
                  >
                    <img
                      src={partnerAAvatar}
                      alt={partnerAName}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </motion.div>
                  <h4 className="font-black text-sm sm:text-base leading-tight truncate w-full mb-0.5">
                    {partnerAName}
                  </h4>
                  <span className="text-[11px] font-mono opacity-70 truncate w-full block">
                    {partnerARole}
                  </span>
                  {canonicalA && onOpenCharacterDictionary && (
                    <button
                      type="button"
                      onClick={() => onOpenCharacterDictionary(canonicalA as HallOfFameEntry)}
                      className="mt-1.5 text-[10px] font-mono font-bold underline transition-opacity hover:opacity-100 opacity-60 text-cyan-400"
                    >
                      View in Dictionary ↗
                    </button>
                  )}
                </div>

                {/* Connection Beam Left */}
                <div className="flex-1 min-w-[24px] sm:min-w-[44px] max-w-[65px] h-[3px] mx-1 sm:mx-2 relative overflow-hidden rounded-full">
                  <div
                    className="w-full h-full transition-all duration-300"
                    style={{
                      background: isCyber
                        ? hoveredPartner === "partnerA" || hoveredPartner === "center" || isCelebrating
                          ? "linear-gradient(90deg, #00F5FF 0%, #EC4899 100%)"
                          : "linear-gradient(90deg, rgba(0,245,255,0.4) 0%, rgba(236,72,153,0.3) 100%)"
                        : hoveredPartner === "partnerA" || hoveredPartner === "center" || isCelebrating
                        ? "linear-gradient(90deg, #000 0%, #EC4899 100%)"
                        : "linear-gradient(90deg, rgba(0,0,0,0.3) 0%, rgba(236,72,153,0.4) 100%)",
                      boxShadow:
                        isCyber && (hoveredPartner === "partnerA" || hoveredPartner === "center" || isCelebrating)
                          ? "0 0 10px rgba(0,245,255,0.8)"
                          : "none",
                    }}
                  />
                </div>

                {/* Central Heart Interactive Node */}
                <div
                  className="relative flex flex-col items-center justify-center shrink-0 z-20 group"
                  onMouseEnter={() => setHoveredPartner("center")}
                  onMouseLeave={() => setHoveredPartner(null)}
                >
                  <RomanticLoveBurst ref={loveBurstRef} />

                  {/* Pulse Ring Behind Heart */}
                  <motion.div
                    animate={{
                      scale: hoveredPartner === "center" || isCelebrating ? [1, 1.35, 1] : [1, 1.2, 1],
                      opacity: hoveredPartner === "center" || isCelebrating ? [0.6, 0, 0.6] : [0.35, 0, 0.35],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: hoveredPartner === "center" || isCelebrating ? 1.1 : 2,
                      ease: "easeInOut",
                    }}
                    className="absolute -inset-1.5 rounded-full pointer-events-none"
                    style={{
                      border: isCyber ? "1.5px solid #EC4899" : "2px solid #F472B6",
                      boxShadow: isCyber ? "0 0 16px rgba(236,72,153,0.5)" : "none",
                    }}
                  />

                  <motion.button
                    type="button"
                    onClick={handleCenterHeartClick}
                    whileHover={{ scale: 1.14 }}
                    whileTap={{ scale: 0.9 }}
                    animate={isCelebrating ? { rotate: [0, -12, 12, -8, 8, 0], scale: [1, 1.25, 1] } : {}}
                    className="w-11 h-11 sm:w-13 sm:h-13 rounded-full flex items-center justify-center text-lg sm:text-xl border shadow-lg cursor-pointer transition-colors relative z-10"
                    style={{
                      backgroundColor: isCyber
                        ? isCelebrating
                          ? "rgba(236,72,153,0.4)"
                          : "rgba(236,72,153,0.2)"
                        : isCelebrating
                        ? "#FBCFE8"
                        : "#FCE7F3",
                      borderColor: "#EC4899",
                      borderWidth: isCyber ? "1.5px" : "2.5px",
                      boxShadow: isCyber
                        ? "0 0 20px rgba(236,72,153,0.6)"
                        : "2px 2px 0 #000",
                    }}
                    title="Celebrate love (click for romantic burst)"
                  >
                    <motion.span
                      animate={{ scale: hoveredPartner ? [1, 1.18, 1] : [1, 1.08, 1] }}
                      transition={{ repeat: Infinity, duration: hoveredPartner ? 1 : 1.8, ease: "easeInOut" }}
                    >
                      ❤️
                    </motion.span>
                  </motion.button>

                  <span
                    className="text-[9px] font-mono font-bold tracking-widest uppercase mt-1 transition-colors duration-200"
                    style={{
                      color: hoveredPartner === "center" || isCelebrating ? "#EC4899" : isCyber ? "#94A3B8" : "#6B7280",
                    }}
                  >
                    {isCelebrating ? "LOVE!" : "MATCH"}
                  </span>
                </div>

                {/* Connection Beam Right */}
                <div className="flex-1 min-w-[24px] sm:min-w-[44px] max-w-[65px] h-[3px] mx-1 sm:mx-2 relative overflow-hidden rounded-full">
                  <div
                    className="w-full h-full transition-all duration-300"
                    style={{
                      background: isCyber
                        ? hoveredPartner === "partnerB" || hoveredPartner === "center" || isCelebrating
                          ? "linear-gradient(90deg, #EC4899 0%, #FF007F 100%)"
                          : "linear-gradient(90deg, rgba(236,72,153,0.3) 0%, rgba(255,0,127,0.4) 100%)"
                        : hoveredPartner === "partnerB" || hoveredPartner === "center" || isCelebrating
                        ? "linear-gradient(90deg, #EC4899 0%, #000 100%)"
                        : "linear-gradient(90deg, rgba(236,72,153,0.4) 0%, rgba(0,0,0,0.3) 100%)",
                      boxShadow:
                        isCyber && (hoveredPartner === "partnerB" || hoveredPartner === "center" || isCelebrating)
                          ? "0 0 10px rgba(255,0,127,0.8)"
                          : "none",
                    }}
                  />
                </div>

                {/* Partner B */}
                <div
                  className="flex flex-col items-center text-center max-w-[130px] sm:max-w-[155px] z-10 cursor-pointer"
                  onMouseEnter={() => setHoveredPartner("partnerB")}
                  onMouseLeave={() => setHoveredPartner(null)}
                >
                  <motion.div
                    animate={
                      isCelebrating
                        ? { scale: [1, 1.1, 1], y: [0, -8, 0] }
                        : hoveredPartner === "partnerB" || hoveredPartner === "center"
                        ? { scale: 1.06, y: -2 }
                        : { scale: 1, y: 0 }
                    }
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 shadow-lg mb-2 relative group transition-colors duration-300"
                    style={{
                      borderColor:
                        isCelebrating || hoveredPartner === "center"
                          ? "#EC4899"
                          : hoveredPartner === "partnerB"
                          ? isCyber
                            ? "#FF007F"
                            : "#000000"
                          : isCyber
                          ? "#FF007F"
                          : "#000000",
                      boxShadow:
                        isCelebrating || hoveredPartner === "center"
                          ? isCyber
                            ? "0 0 24px rgba(236,72,153,0.65)"
                            : "0 0 0 3px #F472B6, 3px 3px 0 #000"
                          : isCyber
                          ? "0 0 15px rgba(255,0,127,0.4)"
                          : "3px 3px 0 #000",
                    }}
                  >
                    <img
                      src={partnerBAvatar}
                      alt={partnerBName}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </motion.div>
                  <h4 className="font-black text-sm sm:text-base leading-tight truncate w-full mb-0.5">
                    {partnerBName}
                  </h4>
                  <span className="text-[11px] font-mono opacity-70 truncate w-full block">
                    {partnerBRole}
                  </span>
                  {canonicalB && onOpenCharacterDictionary && (
                    <button
                      type="button"
                      onClick={() => onOpenCharacterDictionary(canonicalB as HallOfFameEntry)}
                      className="mt-1.5 text-[10px] font-mono font-bold underline transition-opacity hover:opacity-100 opacity-60 text-pink-400"
                    >
                      View in Dictionary ↗
                    </button>
                  )}
                </div>
              </div>

              {/* Source & Status Overview Meta */}
              <div className="flex flex-col gap-2.5 md:items-end text-center md:text-right w-full md:w-auto">
                <div className="flex flex-wrap items-center justify-center md:justify-end gap-1.5">
                  {/* Tier */}
                  <span
                    className="px-2.5 py-0.5 rounded text-xs font-black uppercase font-mono border"
                    style={{
                      backgroundColor: isCyber ? tierConfig.bgCyber : tierConfig.bgNeo,
                      color: tierConfig.color,
                      borderColor: tierConfig.color,
                    }}
                  >
                    {tierConfig.label}
                  </span>

                  {/* Status */}
                  <span
                    className="px-2.5 py-0.5 rounded text-xs font-bold uppercase font-mono border flex items-center gap-1"
                    style={{
                      backgroundColor: isCyber ? statusConfig.badgeBg : "#FFF",
                      color: statusConfig.color,
                      borderColor: statusConfig.color,
                    }}
                  >
                    <span>{statusConfig.icon}</span>
                    <span>{statusConfig.label}</span>
                  </span>

                  {/* Ending */}
                  {endingConfig && (
                    <span
                      className="px-2.5 py-0.5 rounded text-xs font-bold uppercase font-mono border flex items-center gap-1"
                      style={{
                        backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#F3F4F6",
                        color: isCyber ? "#E0E8FF" : "#1A1A1A",
                        borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#000",
                      }}
                    >
                      <span>{endingConfig.icon}</span>
                      <span>{endingConfig.label}</span>
                    </span>
                  )}
                </div>

                {/* Source details */}
                <div className="text-xs font-mono opacity-80 leading-relaxed">
                  <p className="font-bold text-sm">{couple.source.title}</p>
                  <p>
                    {couple.source.mediaType}
                    {couple.source.country && ` • ${couple.source.country}`}
                    {couple.source.year && ` • ${couple.source.year}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Dossier Section Navigation Tabs ── */}
          <div
            className="flex items-center gap-1 sm:gap-2 px-4 sm:px-6 pt-2 border-b overflow-x-auto shrink-0 select-none no-scrollbar"
            style={{
              backgroundColor: isCyber ? "rgba(5, 8, 22, 0.95)" : "#FFFDF5",
              borderColor: isCyber ? "rgba(0,245,255,0.15)" : "rgba(0,0,0,0.1)",
            }}
          >
            {[
              { id: "overview", label: "Overview", icon: "🏛️" },
              { id: "dynamics", label: "Green Flags & Dynamics", icon: "🚩" },
              { id: "timeline", label: "Timeline", icon: "⏳" },
              { id: "moments", label: "Moments", icon: "✨" },
              { id: "notes", label: "Notes & Analysis", icon: "📝" },
              { id: "gallery", label: "Gallery", icon: "🖼️" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold tracking-wide uppercase transition-all border-b-2 relative shrink-0"
                style={{
                  borderColor: activeTab === tab.id ? (isCyber ? "#00F5FF" : "#FF6B35") : "transparent",
                  color: activeTab === tab.id ? (isCyber ? "#00F5FF" : "#FF6B35") : isCyber ? "#94A3B8" : "#4A4A4A",
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ── Scrollable Tab Content ── */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* 1. OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* ── Large Couple Artwork (visual centerpiece) ── */}
                {coverImage && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="relative w-full overflow-hidden rounded-xl border group"
                    style={{
                      borderColor: isCyber ? "rgba(236,72,153,0.3)" : "#000",
                      boxShadow: isCyber
                        ? "0 0 30px rgba(236,72,153,0.18), 0 8px 32px rgba(0,0,0,0.5)"
                        : "4px 4px 0 #000",
                    }}
                  >
                    {/* Aspect ratio wrapper — 16:9 for wide art, max 380px tall */}
                    <div className="relative w-full" style={{ paddingTop: "min(55%, 380px)" }}>
                      <motion.img
                        src={coverImage}
                        alt={couple.coupleName}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                      {/* Bottom gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                      {/* Couple name & tier badge over image */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between pointer-events-none">
                        <div>
                          <p
                            className="text-[10px] font-mono font-bold uppercase tracking-wider text-pink-400 mb-0.5"
                            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
                          >
                            {couple.source.title}
                          </p>
                          <h3
                            className="font-black text-lg sm:text-xl text-white leading-tight drop-shadow-lg"
                            style={{
                              fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
                              textShadow: "0 2px 8px rgba(0,0,0,0.9)",
                            }}
                          >
                            {couple.coupleName}
                          </h3>
                        </div>
                        {/* Pulsing love count chip */}
                        <motion.div
                          animate={{ scale: [1, 1.08, 1] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md border font-mono font-black text-xs text-pink-300"
                          style={{
                            backgroundColor: "rgba(0,0,0,0.6)",
                            borderColor: "rgba(236,72,153,0.5)",
                            boxShadow: isCyber ? "0 0 12px rgba(236,72,153,0.4)" : "none",
                          }}
                        >
                          <span>❤️</span>
                          <span>{couple.likes || 0}</span>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Relationship Description */}
                {couple.relationship.description && (
                  <div
                    className="p-4 rounded-xl border"
                    style={{
                      backgroundColor: isCyber ? "rgba(255,255,255,0.02)" : "#FFFFFF",
                      borderColor: isCyber ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)",
                    }}
                  >
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-pink-500 block mb-1">
                      Relationship Synopsis
                    </span>
                    <p className="text-sm leading-relaxed opacity-90">{couple.relationship.description}</p>
                  </div>
                )}

                {/* Dynamics / Tropes list */}
                {couple.relationship.dynamics?.length > 0 && (
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 block mb-2">
                      Core Dynamics & Tropes
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {couple.relationship.dynamics.map((dyn, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-lg text-xs font-bold font-mono border"
                          style={{
                            backgroundColor: isCyber ? "rgba(139,92,246,0.15)" : "#F3E8FF",
                            color: isCyber ? "#C084FC" : "#7E22CE",
                            borderColor: isCyber ? "rgba(139,92,246,0.3)" : "#D8B4FE",
                          }}
                        >
                          {dyn}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chemistry 8-Dimension Overview */}
                <div
                  className="p-4 sm:p-5 rounded-xl border"
                  style={{
                    backgroundColor: isCyber ? "rgba(255,255,255,0.02)" : "#FFFFFF",
                    borderColor: isCyber ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)",
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 text-pink-500">
                      <span>🧪</span>
                      <span>Chemistry Matrix ({chemistryAvg} / 10 Avg)</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {CHEMISTRY_DIMENSIONS.map((dim) => {
                      const score = (couple.chemistry as any)[dim.key] ?? 8;
                      const percentage = Math.min(100, Math.max(10, score * 10));
                      return (
                        <div key={dim.key} className="space-y-1">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="flex items-center gap-1 opacity-80">
                              <span>{dim.icon}</span>
                              <span>{dim.label}</span>
                            </span>
                            <span className="font-bold text-pink-400">{score}/10</span>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full h-2 rounded-full overflow-hidden bg-black/20 border border-white/5">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className="h-full rounded-full bg-gradient-to-r from-pink-500 to-cyan-400"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {couple.chemistry.description && (
                    <p className="text-xs font-mono leading-relaxed mt-4 pt-3 border-t border-white/5 opacity-80">
                      {couple.chemistry.description}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* 2. DYNAMICS & GREEN FLAGS TAB */}
            {activeTab === "dynamics" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Partner A Green Flags */}
                  <div
                    className="p-4 sm:p-5 rounded-xl border flex flex-col"
                    style={{
                      backgroundColor: isCyber ? "rgba(0, 245, 255, 0.03)" : "#F0FDFA",
                      borderColor: isCyber ? "rgba(0, 245, 255, 0.2)" : "#99F6E4",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
                      <img src={partnerAAvatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                      <h4 className="font-black text-sm tracking-tight">{partnerAName}’s Green Flags</h4>
                    </div>
                    {couple.greenFlags.partnerA?.length > 0 ? (
                      <ul className="space-y-2.5">
                        {couple.greenFlags.partnerA.map((flag, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs leading-relaxed">
                            <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✔</span>
                            <span>{flag}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs font-mono opacity-50 italic">No green flags logged for {partnerAName}.</p>
                    )}
                  </div>

                  {/* Partner B Green Flags */}
                  <div
                    className="p-4 sm:p-5 rounded-xl border flex flex-col"
                    style={{
                      backgroundColor: isCyber ? "rgba(255, 0, 127, 0.03)" : "#FFF1F2",
                      borderColor: isCyber ? "rgba(255, 0, 127, 0.2)" : "#FECDD3",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
                      <img src={partnerBAvatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                      <h4 className="font-black text-sm tracking-tight">{partnerBName}’s Green Flags</h4>
                    </div>
                    {couple.greenFlags.partnerB?.length > 0 ? (
                      <ul className="space-y-2.5">
                        {couple.greenFlags.partnerB.map((flag, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs leading-relaxed">
                            <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✔</span>
                            <span>{flag}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs font-mono opacity-50 italic">No green flags logged for {partnerBName}.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 3. TIMELINE TAB */}
            {activeTab === "timeline" && (
              <div className="space-y-4">
                {couple.timeline?.length > 0 ? (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-pink-500/30">
                    {couple.timeline
                      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                      .map((evt, idx) => (
                        <div key={evt.id || idx} className="relative group">
                          {/* Romantic Heart Dot marker */}
                          <div
                            className="absolute -left-[27px] top-1.5 w-4 h-4 rounded-full bg-pink-500 border-2 shadow-md flex items-center justify-center text-[8px] transition-transform group-hover:scale-125"
                            style={{
                              borderColor: isCyber ? "#00F5FF" : "#000",
                              boxShadow: isCyber ? "0 0 8px rgba(236,72,153,0.6)" : "1px 1px 0 #000",
                            }}
                          >
                            ❤️
                          </div>
                          <div
                            className="p-3.5 rounded-xl border"
                            style={{
                              backgroundColor: isCyber ? "rgba(255,255,255,0.02)" : "#FFFFFF",
                              borderColor: isCyber ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)",
                            }}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h5 className="font-black text-sm">{evt.title}</h5>
                              {evt.episode && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-pink-500/15 text-pink-400 border border-pink-500/30">
                                  {evt.episode}
                                </span>
                              )}
                            </div>
                            <p className="text-xs leading-relaxed opacity-85">{evt.description}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-10 opacity-50 font-mono text-xs">
                    No timeline milestones logged yet.
                  </div>
                )}
              </div>
            )}

            {/* 4. MOMENTS TAB */}
            {activeTab === "moments" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {couple.favouriteMoments?.length > 0 ? (
                  couple.favouriteMoments.map((m, idx) => (
                    <div
                      key={m.id || idx}
                      className="p-4 rounded-xl border flex flex-col justify-between transition-all duration-200 hover:border-pink-500/50 hover:shadow-lg group"
                      style={{
                        backgroundColor: isCyber ? "rgba(255,255,255,0.02)" : "#FFFFFF",
                        borderColor: isCyber ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)",
                        boxShadow: isCyber ? undefined : "2px 2px 0 rgba(0,0,0,0.08)",
                      }}
                    >
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-pink-400 block mb-1 group-hover:text-pink-300 transition-colors">
                          {m.category || "Moment"}
                        </span>
                        <h5 className="font-black text-sm mb-1">{m.title}</h5>
                        <p className="text-xs leading-relaxed opacity-80">{m.description}</p>
                      </div>
                      {m.episode && (
                        <span className="mt-3 text-[10px] font-mono opacity-50 block">{m.episode}</span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-10 opacity-50 font-mono text-xs">
                    No favorite moments recorded.
                  </div>
                )}
              </div>
            )}

            {/* 5. NOTES & ANALYSIS TAB */}
            {activeTab === "notes" && (
              <div className="space-y-5">
                {/* Why I love them - Romantic Quote Styling */}
                <div
                  className="p-4 sm:p-5 rounded-xl border border-l-4 transition-colors"
                  style={{
                    backgroundColor: isCyber ? "rgba(236,72,153,0.04)" : "#FFF7F7",
                    borderColor: isCyber ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)",
                    borderLeftColor: "#EC4899",
                    boxShadow: isCyber ? "0 0 15px rgba(236,72,153,0.08)" : "2px 2px 0 rgba(0,0,0,0.06)",
                  }}
                >
                  <span className="text-xs font-mono font-black uppercase tracking-wider text-pink-500 flex items-center gap-1.5 mb-2">
                    <span>❤️</span>
                    <span>Why I Love This Couple</span>
                  </span>
                  <p className="text-xs sm:text-sm leading-relaxed opacity-95 whitespace-pre-wrap italic">
                    "{couple.personalNotes.whyILoveThem || "No personal commentary added yet."}"
                  </p>
                </div>

                {/* Relationship Analysis */}
                <div
                  className="p-4 sm:p-5 rounded-xl border"
                  style={{
                    backgroundColor: isCyber ? "rgba(255,255,255,0.02)" : "#FFFFFF",
                    borderColor: isCyber ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)",
                  }}
                >
                  <span className="text-xs font-mono font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5 mb-2">
                    <span>🔬</span>
                    <span>Relationship Analysis</span>
                  </span>
                  <p className="text-xs sm:text-sm leading-relaxed opacity-90 whitespace-pre-wrap">
                    {couple.personalNotes.relationshipAnalysis || "No analysis recorded yet."}
                  </p>
                </div>
              </div>
            )}

            {/* 6. GALLERY TAB */}
            {activeTab === "gallery" && (
              <div>
                {allGalleryImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {allGalleryImages.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => setLightboxImage(img)}
                        className="aspect-video rounded-lg overflow-hidden border cursor-pointer group relative bg-black/40"
                        style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.15)" }}
                      >
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 opacity-50 font-mono text-xs">
                    No images saved in this couple gallery.
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Lightbox Preview */}
        {lightboxImage && (
          <ImageLightboxModal
            isOpen={Boolean(lightboxImage)}
            onClose={() => setLightboxImage(null)}
            images={allGalleryImages}
            initialIndex={allGalleryImages.indexOf(lightboxImage)}
          />
        )}
      </div>
    </AnimatePresence>
  );
}
