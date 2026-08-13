"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { HallOfFameEntry, GameCharacterEntry, useDashboardStore } from "@/lib/store/dashboardStore";
import { ImageLightboxModal } from "@/components/ui/ImageLightboxModal";
import { CharacterProfileModal } from "@/components/game/CharacterProfileModal";
import { TokusatsuProfileModal } from "@/components/ui/TokusatsuProfileModal";
import { isTokusatsuEntry } from "@/lib/data/tokusatsuDataHelper";
import { useContextMenu } from "@/hooks/useContextMenu";
import { useToast } from "@/components/ui/ToastProvider";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Props {
  isOpen: boolean;
  entry: HallOfFameEntry | null;
  onClose: () => void;
  onEdit?: (entry: HallOfFameEntry) => void;
  onLike?: (id: string) => void;
}

const TABS = [
  { id: "overview", label: "OVERVIEW", icon: "🏛️" },
  { id: "gallery", label: "GALLERY", icon: "🖼️" },
  { id: "profile", label: "PERSONAL / LORE", icon: "📖" },
  { id: "appearances", label: "APPEARANCES", icon: "🎬" },
] as const;
type TabId = (typeof TABS)[number]["id"];

// ─── Sub-Components & Theme Helpers ─────────────────────────────────────────

// Render key-value info rows only if value exists
function InfoRow({
  label,
  value,
  isCyber,
}: {
  label: string;
  value?: string | number | null | string[];
  isCyber: boolean;
}) {
  if (value === undefined || value === null || value === "") return null;
  if (Array.isArray(value) && value.length === 0) return null;

  const displayVal = Array.isArray(value) ? value.join(", ") : String(value);

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-2 border-b last:border-0 ${
        isCyber ? "border-white/[0.06]" : "border-black/10"
      }`}
    >
      <span
        className={`text-[10px] font-mono font-bold uppercase tracking-wider sm:w-36 shrink-0 pt-0.5 ${
          isCyber ? "text-cyan-400/80" : "text-gray-600"
        }`}
      >
        {label}
      </span>
      <span
        className={`text-xs break-words flex-1 font-semibold ${
          isCyber ? "text-white/90" : "text-gray-900"
        }`}
      >
        {displayVal}
      </span>
    </div>
  );
}

// Section Block for right-hand information column
function InformationSection({
  title,
  children,
  isCyber,
  hasData,
}: {
  title: string;
  children: React.ReactNode;
  isCyber: boolean;
  hasData: boolean;
}) {
  if (!hasData) return null;

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
        isCyber
          ? "bg-white/[0.02] border-white/10"
          : "bg-gray-50 border-black shadow-[4px_4px_0_#000]"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2 h-2 rounded-full ${isCyber ? "bg-cyan-400" : "bg-black"}`} />
        <h3
          className={`text-xs font-mono font-black uppercase tracking-[0.18em] ${
            isCyber ? "text-cyan-400" : "text-gray-900"
          }`}
        >
          {title}
        </h3>
      </div>
      <div>{children}</div>
    </div>
  );
}

// Structured Chip list helper for appearances
function ChipList({ items, isCyber }: { items?: string[]; isCyber: boolean }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {items.map((item, idx) => (
        <span
          key={idx}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border ${
            isCyber
              ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
              : "bg-amber-100 text-black border-black shadow-[1.5px_1.5px_0_#000]"
          }`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function CharacterDictProfileModal({
  isOpen,
  entry,
  onClose,
  onEdit,
  onLike,
}: Props) {
  if (entry && isTokusatsuEntry(entry)) {
    return (
      <TokusatsuProfileModal
        isOpen={isOpen}
        entry={entry}
        onClose={onClose}
        onEdit={onEdit}
        onLike={onLike}
      />
    );
  }
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { gameCharacters = [], dossierCharacters = [], likeHof } = useDashboardStore();

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Cross-Navigation Game Character Modal State
  const [gameCharModalOpen, setGameCharModalOpen] = useState(false);
  const [targetGameChar, setTargetGameChar] = useState<GameCharacterEntry | null>(null);

  // Gallery deletion state — MUST be above early return to satisfy Rules of Hooks
  const updateHof = useDashboardStore((s) => s.updateHof);
  const { openContextMenu } = useContextMenu();
  const { success: toastSuccess, error: toastError } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<{ src: string; label: string } | null>(null);
  const [isDeletingMedia, setIsDeletingMedia] = useState(false);

  // ESC key listener
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Body scroll locking
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) setActiveTab("overview");
  }, [isOpen]);

  // Cross-navigation lookup for Game Roster character profile
  const relatedGameCharacter = useMemo(() => {
    if (!entry) return null;
    const qName = entry.name.toLowerCase().trim();

    const gcMatch = gameCharacters.find(
      (c) =>
        (entry.gameCharacterId && c.id === entry.gameCharacterId) ||
        c.name.toLowerCase().trim() === qName
    );
    if (gcMatch) return gcMatch;

    const dcMatch = dossierCharacters.find(
      (c) => c.name.toLowerCase().trim() === qName
    );
    if (dcMatch) {
      return {
        id: dcMatch.id,
        name: dcMatch.name,
        gameId: dcMatch.gameId,
        gameName: dcMatch.gameTitle,
        title: dcMatch.role || dcMatch.category,
        role: dcMatch.role,
        category: dcMatch.category,
        element: dcMatch.element,
        path: dcMatch.path,
        weapon: dcMatch.weapon,
        rarity: dcMatch.rarity,
        nation: dcMatch.nation,
        birthday: dcMatch.birthday,
        avatarUrl: dcMatch.avatarUrl,
        splashArt: dcMatch.splashArt,
        accentColor: dcMatch.accentColor,
        isFavorite: dcMatch.isFavorite,
        biography: dcMatch.description || dcMatch.notes,
        stats: dcMatch.stats,
        tags: dcMatch.tags,
      } as GameCharacterEntry;
    }

    return null;
  }, [entry, gameCharacters, dossierCharacters]);

  if (!isOpen || !entry) return null;

  const accent = entry.accentColor || (isCyber ? "#00F5FF" : "#FF6B35");

  // Primary 3:4 Portrait image logic: portraitUrl takes priority, falls back to card image (imageUrl)
  const portraitImage = entry.portraitUrl || entry.imageUrl;

  // Gallery Collection (manually managed gallery images, no splash art concepts)
  const galleryImages = (entry.gallery || []).map((img, i) => ({
    src: img,
    label: `Gallery Image ${i + 1}`,
  }));



  const handleImageContextMenu = (e: React.MouseEvent, img: { src: string; label: string }, index: number) => {
    e.preventDefault();
    e.stopPropagation();

    openContextMenu(e, [
      {
        id: "view-image",
        label: "👁️ View Image in Lightbox",
        onClick: () => {
          setLightboxSrc(img.src);
          setLightboxTitle(img.label);
          setLightboxIndex(index);
        },
      },
      {
        id: "delete-image",
        label: "🗑️ Delete Image Permanently",
        danger: true,
        onClick: () => {
          setDeleteTarget(img);
        },
      },
    ]);
  };

  const confirmDeleteHofImage = async () => {
    if (!deleteTarget || !entry) return;
    setIsDeletingMedia(true);
    try {
      const src = deleteTarget.src;
      const currentGallery = entry.gallery || [];
      const updatedGallery = currentGallery.filter((url) => url !== src);

      await updateHof(entry.id, { gallery: updatedGallery });

      try {
        await fetch(`/api/upload?url=${encodeURIComponent(src)}`, { method: "DELETE" });
      } catch (storageErr) {
        console.warn("Storage deletion cleanup warning:", storageErr);
      }

      toastSuccess(`✓ Deleted ${deleteTarget.label} permanently.`);
      setDeleteTarget(null);
    } catch (err: any) {
      console.error("Failed to delete HOF gallery image:", err);
      toastError(err?.message || "Failed to delete image.");
    } finally {
      setIsDeletingMedia(false);
    }
  };

  const details = entry.details || {};

  // Data availability checks for sections
  const hasIdentity = Boolean(
    entry.name ||
      entry.fullName ||
      entry.officialName ||
      entry.alias ||
      entry.nickname ||
      (entry.aliases && entry.aliases.length > 0) ||
      entry.originalLanguage ||
      entry.nativeName ||
      entry.pronunciation ||
      entry.gender ||
      entry.age ||
      entry.species ||
      details.fullName ||
      details.alias ||
      details.originalLanguage ||
      details.pronunciation ||
      details.gender ||
      details.age ||
      details.species
  );

  const hasOrigin = Boolean(
    entry.universe ||
      entry.work ||
      entry.series ||
      entry.franchise ||
      entry.tokusatsuFranchise ||
      entry.nationality ||
      entry.country ||
      entry.region ||
      entry.creator ||
      entry.firstAppearance ||
      entry.debutYear ||
      (entry.knownFor && entry.knownFor.length > 0) ||
      details.universe ||
      details.series ||
      details.country ||
      details.creator ||
      details.firstAppearance ||
      details.debutYear
  );

  const hasProfileLore = Boolean(
    entry.personality ||
      entry.archetype ||
      entry.type ||
      entry.singerType ||
      entry.occupation ||
      entry.role ||
      entry.alignment ||
      (entry.traits && entry.traits.length > 0) ||
      entry.motivation ||
      entry.background ||
      entry.note ||
      entry.characterDevelopment ||
      details.personality ||
      details.archetype ||
      details.occupation ||
      details.alignment ||
      details.motivation ||
      details.background ||
      details.characterDevelopment
  );

  const hasAppearances = Boolean(
    (entry.mainSeries && entry.mainSeries.length > 0) ||
      (entry.movies && entry.movies.length > 0) ||
      (entry.associatedDramas && entry.associatedDramas.length > 0) ||
      (entry.episodes && entry.episodes.length > 0) ||
      (entry.spinOffs && entry.spinOffs.length > 0) ||
      (entry.cameos && entry.cameos.length > 0) ||
      (entry.works && entry.works.length > 0) ||
      (entry.relatedWorks && entry.relatedWorks.length > 0) ||
      details.mainSeries ||
      details.movies ||
      details.episodes ||
      details.spinOffs ||
      details.cameos ||
      details.relatedWorks
  );

  // Common Details fields prioritization (quick reference summary rail)
  const commonDetailsList = [
    { label: "Universe / Work", value: entry.universe || entry.work || details.universe },
    { label: "Series / Franchise", value: entry.series || entry.franchise || entry.tokusatsuFranchise || details.series },
    { label: "Country / Region", value: entry.country || entry.nationality || entry.region || details.country },
    { label: "Occupation / Role", value: entry.occupation || entry.role || entry.profession || details.occupation },
    { label: "Type / Species", value: entry.species || entry.type || details.species },
    { label: "Gender", value: entry.gender || details.gender },
    { label: "Age / Age Range", value: entry.age || details.age },
  ].filter((item) => item.value !== undefined && item.value !== null && item.value !== "");

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-[1500] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="relative w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]"
            style={{
              backgroundColor: isCyber ? "#050816" : "#FFFFFF",
              borderColor: isCyber ? "rgba(0, 245, 255, 0.4)" : "#000000",
              borderWidth: isCyber ? "1.5px" : "3px",
              boxShadow: isCyber
                ? "0 0 50px rgba(0, 245, 255, 0.2)"
                : "8px 8px 0 #000000",
            }}
          >
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                COMPACT CHARACTER DICTIONARY HEADER (~200–230px Desktop Target)
               ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div
              className="relative px-4 py-3.5 sm:px-6 sm:py-4 border-b shrink-0 transition-colors"
              style={{
                borderColor: isCyber ? "rgba(0, 245, 255, 0.2)" : "#000000",
                borderWidth: isCyber ? "1px" : "2px",
                backgroundColor: isCyber ? "rgba(10, 15, 44, 0.9)" : "#F8FAFC",
              }}
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 min-w-0">
                {/* ── 1:1 AVATAR CONTAINER (Capped at 150-160px) ── */}
                <div
                  className="w-28 h-28 sm:w-36 sm:h-36 md:w-38 md:h-38 max-w-[155px] max-h-[155px] aspect-square rounded-2xl overflow-hidden border shrink-0 flex items-center justify-center font-black text-3xl sm:text-4xl shadow-md relative group"
                  style={{
                    borderColor: accent,
                    borderWidth: isCyber ? "2px" : "3px",
                    boxShadow: isCyber ? `0 0 20px ${accent}35` : "4px 4px 0 #000000",
                    backgroundColor: isCyber ? "#0A0F2C" : "#E2E8F0",
                  }}
                >
                  {(() => {
                    const displayAv =
                      entry.avatarUrl ||
                      details.avatarUrl ||
                      entry.portraitUrl ||
                      details.portraitUrl ||
                      entry.imageUrl ||
                      details.imageUrl;

                    if (displayAv) {
                      return (
                        <img
                          src={displayAv}
                          alt={entry.name}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                      );
                    }
                    return (
                      <span className="opacity-40 font-mono select-none text-4xl" style={{ color: accent }}>
                        {entry.name.charAt(0)}
                      </span>
                    );
                  })()}
                </div>

                {/* ── IDENTITY CONTENT BLOCK ── */}
                <div className="flex-1 min-w-0 space-y-1.5 text-center sm:text-left w-full">
                  {/* Row 1: Badges & Controls Header Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
                      {/* Status Badge (Gold) */}
                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider border shadow-sm ${
                          isCyber
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : "bg-amber-300 text-black border border-black shadow-[1px_1px_0_#000]"
                        }`}
                      >
                        👑 {entry.status || "GOAT Status"}
                      </span>

                      {/* Profession / Type Badge (Cyan) */}
                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider border shadow-sm ${
                          isCyber
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                            : "bg-cyan-200 text-black border border-black shadow-[1px_1px_0_#000]"
                        }`}
                      >
                        {entry.type === "actor" ? "🎭 Actor" : entry.type === "actress" ? "💫 Actress" : entry.type === "singer" ? "🎤 Singer" : entry.type === "anime" ? "⛩️ Anime" : entry.type === "tokusatsu" ? "🦸 Tokusatsu" : "👤 Entity"}
                      </span>

                      {/* Nationality / Country Badge (Purple) */}
                      {(entry.nationality || entry.country || details.country) && (
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider border shadow-sm ${
                            isCyber
                              ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                              : "bg-purple-200 text-black border border-black shadow-[1px_1px_0_#000]"
                          }`}
                        >
                          🌐 {entry.nationality || entry.country || details.country}
                        </span>
                      )}

                      {/* Favorite Badge (Rose) */}
                      {entry.isFavorite && (
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider border shadow-sm ${
                            isCyber
                              ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                              : "bg-rose-300 text-black border border-black shadow-[1px_1px_0_#000]"
                          }`}
                        >
                          💖 Favorite
                        </span>
                      )}

                      {/* Series / Universe (Emerald) */}
                      {(entry.series || entry.universe || entry.franchise || details.series) && (
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold border shadow-sm ${
                            isCyber
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : "bg-emerald-200 text-black border border-black shadow-[1px_1px_0_#000]"
                          }`}
                        >
                          📺 {entry.series || entry.universe || entry.franchise || details.series}
                        </span>
                      )}
                    </div>

                    {/* Action Controls Rail (Top Right) */}
                    <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                      {relatedGameCharacter && (
                        <button
                          onClick={() => {
                            setTargetGameChar(relatedGameCharacter);
                            setGameCharModalOpen(true);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono transition-all cursor-pointer flex items-center gap-1 border ${
                            isCyber
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                              : "bg-emerald-300 text-black border-black shadow-[1.5px_1.5px_0_#000] hover:scale-105"
                          }`}
                          title="View corresponding Game Roster Profile"
                        >
                          <span>🎮</span>
                          <span className="hidden sm:inline">Game Profile →</span>
                        </button>
                      )}

                      {onLike && (
                        <button
                          onClick={() => {
                            if (onLike) onLike(entry.id);
                            else likeHof(entry.id);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono transition-all cursor-pointer flex items-center gap-1 border ${
                            isCyber
                              ? "bg-pink-500/20 text-pink-300 border-pink-500/40 hover:bg-pink-500/30"
                              : "bg-pink-300 text-black border-black shadow-[1.5px_1.5px_0_#000] hover:scale-105"
                          }`}
                        >
                          <span>❤️</span>
                          <span>{entry.likes || 0}</span>
                        </button>
                      )}

                      {onEdit && (
                        <button
                          onClick={() => {
                            onClose();
                            onEdit(entry);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono transition-all cursor-pointer border ${
                            isCyber
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                              : "bg-amber-400 text-black border-black shadow-[1.5px_1.5px_0_#000] hover:scale-105"
                          }`}
                        >
                          ✏️ Edit
                        </button>
                      )}

                      <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs bg-black/10 dark:bg-white/10 theme-text-primary hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Row 2: Character Name */}
                  <h1
                    className="text-xl sm:text-2xl md:text-3xl font-black theme-text-primary tracking-tight leading-tight truncate"
                    style={{ fontFamily: isCyber ? "var(--font-orbitron)" : "inherit" }}
                  >
                    {entry.name}
                  </h1>

                  {/* Row 3: Sub-line (Full/Official Name & Alias/Nickname) */}
                  {(entry.fullName || entry.officialName || details.fullName || entry.alias || details.alias) && (
                    <p className="text-xs font-mono theme-text-muted truncate leading-snug">
                      {entry.fullName || entry.officialName || details.fullName}
                      {(entry.alias || details.alias) && <span className="opacity-80"> • &ldquo;{entry.alias || details.alias}&rdquo;</span>}
                      {(entry.nativeName || details.nativeName) && <span className="opacity-80"> ({entry.nativeName || details.nativeName})</span>}
                    </p>
                  )}

                  {/* Row 4: Compact Identity Metadata Row */}
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap pt-0.5 text-[11px] font-mono theme-text-muted">
                    {(entry.occupation || entry.role || details.occupation) && (
                      <span className="px-2 py-0.5 rounded bg-black/10 dark:bg-white/10 truncate max-w-[180px]">
                        💼 {entry.occupation || entry.role || details.occupation}
                      </span>
                    )}
                    {(entry.nationality || entry.country || details.country) && (
                      <span className="px-2 py-0.5 rounded bg-black/10 dark:bg-white/10 truncate">
                        📍 {entry.nationality || entry.country || details.country}
                      </span>
                    )}
                    {(entry.age || details.age) && (
                      <span className="px-2 py-0.5 rounded bg-black/10 dark:bg-white/10 truncate">
                        🎂 {entry.age || details.age} yrs
                      </span>
                    )}
                    {(entry.species || entry.type || details.species) && (
                      <span className="px-2 py-0.5 rounded bg-black/10 dark:bg-white/10 truncate">
                        🏷️ {entry.species || entry.type || details.species}
                      </span>
                    )}
                  </div>

                  {/* Row 5: Compact Quote/Tagline */}
                  {entry.note && (
                    <p className="text-[11px] italic theme-text-muted truncate max-w-2xl leading-snug pt-0.5" style={{ color: isCyber ? "rgba(0,245,255,0.75)" : "inherit" }}>
                      &ldquo;{entry.note}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              {/* Navigation Tabs Bar */}
              <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-white/10 overflow-x-auto scrollbar-none text-xs font-mono font-bold">
                {TABS.map((t) => {
                  const isActive = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-all ${
                        isActive
                          ? isCyber
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                            : "bg-amber-300 text-black border-2 border-black shadow-[2px_2px_0_#000]"
                          : isCyber
                          ? "text-white/40 hover:text-white/80 hover:bg-white/5"
                          : "text-gray-600 hover:text-black hover:bg-gray-200"
                      }`}
                    >
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                TAB CONTENT BODY
               ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
              {/* ── OVERVIEW TAB (ADAPTIVE INFORMATION GRID) ── */}
              {activeTab === "overview" && (
                <div className="flex flex-col md:flex-row items-start gap-6">
                  {/* ── LEFT COLUMN (VISUAL / SUMMARY RAIL) ── */}
                  <div className="w-full md:w-72 shrink-0 space-y-4">
                    {/* Primary Vertical 3:4 Aspect Ratio Portrait Box */}
                    <div
                      className={`relative aspect-[3/4] w-full rounded-2xl md:rounded-3xl overflow-hidden border shadow-xl group ${
                        isCyber ? "border-cyan-500/40 bg-black/60" : "border-black bg-gray-100 shadow-[6px_6px_0_#000]"
                      }`}
                      style={{
                        borderColor: isCyber ? accent : "#000000",
                        boxShadow: isCyber ? `0 0 25px ${accent}30` : "6px 6px 0 #000",
                      }}
                    >
                      {portraitImage ? (
                        <img
                          src={portraitImage}
                          alt={entry.name}
                          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-black text-4xl theme-text-muted">
                          {entry.name.charAt(0)}
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                        <span className="text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-wider block">
                          3:4 Profile Portrait
                        </span>
                      </div>
                    </div>

                    {/* Common Details Quick-Reference Panel */}
                    {commonDetailsList.length > 0 && (
                      <div
                        className={`p-4 rounded-2xl border ${
                          isCyber
                            ? "bg-white/[0.02] border-white/10"
                            : "bg-gray-50 border-black shadow-[4px_4px_0_#000]"
                        }`}
                      >
                        <h4
                          className={`text-[10px] font-mono font-black uppercase tracking-[0.2em] mb-3 pb-2 border-b ${
                            isCyber ? "text-cyan-400 border-cyan-500/20" : "text-gray-900 border-black/20"
                          }`}
                        >
                          Common Details
                        </h4>
                        <div className="space-y-1.5 text-xs">
                          {commonDetailsList.map((item, idx) => (
                            <div key={idx} className="flex flex-col py-1 border-b last:border-0 border-white/[0.05]">
                              <span className={`text-[9px] font-mono uppercase tracking-wider font-bold ${isCyber ? "text-cyan-400/70" : "text-gray-500"}`}>
                                {item.label}
                              </span>
                              <span className={`font-semibold ${isCyber ? "text-white/90" : "text-gray-900"}`}>
                                {Array.isArray(item.value) ? item.value.join(", ") : String(item.value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── RIGHT COLUMN (PRIMARY INFORMATION AREA) ── */}
                  <div className="flex-1 min-w-0 space-y-6 w-full">
                    {/* Quote / Enshrining Note if present */}
                    {entry.note && (
                      <blockquote
                        className={`p-4 rounded-2xl border text-xs sm:text-sm italic font-medium leading-relaxed ${
                          isCyber
                            ? "border-cyan-500/30 bg-cyan-500/[0.04] text-cyan-200"
                            : "border-black bg-amber-50 text-gray-900 shadow-[3px_3px_0_#000]"
                        }`}
                        style={{ borderLeft: `4px solid ${accent}` }}
                      >
                        &ldquo;{entry.note}&rdquo;
                      </blockquote>
                    )}

                    {/* IDENTITY Section */}
                    <InformationSection title="IDENTITY" isCyber={isCyber} hasData={hasIdentity}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                        <InfoRow label="Character Name" value={entry.name} isCyber={isCyber} />
                        <InfoRow label="Full / Official Name" value={entry.fullName || entry.officialName || details.fullName} isCyber={isCyber} />
                        <InfoRow label="Alias / Nickname" value={entry.alias || entry.nickname || entry.aliases || details.alias} isCyber={isCyber} />
                        <InfoRow label="Original Language" value={entry.originalLanguage || entry.nativeName || details.originalLanguage} isCyber={isCyber} />
                        <InfoRow label="Pronunciation" value={entry.pronunciation || details.pronunciation} isCyber={isCyber} />
                        <InfoRow label="Gender" value={entry.gender || details.gender} isCyber={isCyber} />
                        <InfoRow label="Age / Age Range" value={entry.age || details.age} isCyber={isCyber} />
                        <InfoRow label="Species / Type" value={entry.species || details.species} isCyber={isCyber} />
                      </div>
                    </InformationSection>

                    {/* ORIGIN Section */}
                    <InformationSection title="ORIGIN" isCyber={isCyber} hasData={hasOrigin}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                        <InfoRow label="Universe / Work" value={entry.universe || entry.work || entry.knownFor || details.universe} isCyber={isCyber} />
                        <InfoRow label="Series / Franchise" value={entry.series || entry.franchise || entry.tokusatsuFranchise || details.series} isCyber={isCyber} />
                        <InfoRow label="Country / Region" value={entry.country || entry.nationality || entry.region || details.country} isCyber={isCyber} />
                        <InfoRow label="Creator" value={entry.creator || details.creator} isCyber={isCyber} />
                        <InfoRow label="First Appearance" value={entry.firstAppearance || details.firstAppearance} isCyber={isCyber} />
                        <InfoRow label="Debut Year" value={entry.debutYear || details.debutYear} isCyber={isCyber} />
                      </div>
                    </InformationSection>

                    {/* CHARACTER PROFILE Section */}
                    <InformationSection title="CHARACTER PROFILE" isCyber={isCyber} hasData={hasProfileLore}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 mb-4">
                        <InfoRow label="Personality" value={entry.personality || details.personality} isCyber={isCyber} />
                        <InfoRow label="Archetype" value={entry.archetype || entry.singerType || entry.type || details.archetype} isCyber={isCyber} />
                        <InfoRow label="Occupation / Role" value={entry.occupation || entry.role || entry.profession || details.occupation} isCyber={isCyber} />
                        <InfoRow label="Alignment" value={entry.alignment || details.alignment} isCyber={isCyber} />
                        <InfoRow label="Character Traits" value={entry.traits || details.traits} isCyber={isCyber} />
                        <InfoRow label="Motivation" value={entry.motivation || details.motivation} isCyber={isCyber} />
                      </div>

                      {/* Long-form Background Narrative */}
                      {(entry.background || entry.bio || details.background) && (
                        <div className="pt-3 border-t border-white/10 space-y-1">
                          <span className={`text-[10px] font-mono uppercase tracking-wider font-bold ${isCyber ? "text-cyan-400" : "text-gray-700"}`}>
                            Background & Narrative
                          </span>
                          <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${isCyber ? "text-white/80" : "text-gray-800"}`}>
                            {entry.background || entry.bio || details.background}
                          </p>
                        </div>
                      )}

                      {/* Long-form Character Development Arc */}
                      {(entry.characterDevelopment || details.characterDevelopment) && (
                        <div className="pt-3 border-t border-white/10 space-y-1 mt-3">
                          <span className={`text-[10px] font-mono uppercase tracking-wider font-bold ${isCyber ? "text-cyan-400" : "text-gray-700"}`}>
                            Character Development Arc
                          </span>
                          <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${isCyber ? "text-white/80" : "text-gray-800"}`}>
                            {entry.characterDevelopment || details.characterDevelopment}
                          </p>
                        </div>
                      )}
                    </InformationSection>

                    {/* APPEARANCES Section */}
                    <InformationSection title="APPEARANCES" isCyber={isCyber} hasData={hasAppearances}>
                      <div className="space-y-3 text-xs">
                        {(entry.mainSeries || details.mainSeries) && (
                          <div>
                            <span className={`text-[10px] font-mono uppercase tracking-wider font-bold block ${isCyber ? "text-cyan-400" : "text-gray-600"}`}>
                              Main Series
                            </span>
                            <ChipList items={entry.mainSeries || details.mainSeries} isCyber={isCyber} />
                          </div>
                        )}
                        {(entry.movies || entry.associatedDramas || details.movies) && (
                          <div>
                            <span className={`text-[10px] font-mono uppercase tracking-wider font-bold block ${isCyber ? "text-cyan-400" : "text-gray-600"}`}>
                              Movies & Films
                            </span>
                            <ChipList items={entry.movies || entry.associatedDramas || details.movies} isCyber={isCyber} />
                          </div>
                        )}
                        {(entry.episodes || details.episodes) && (
                          <div>
                            <span className={`text-[10px] font-mono uppercase tracking-wider font-bold block ${isCyber ? "text-cyan-400" : "text-gray-600"}`}>
                              Featured Episodes
                            </span>
                            <ChipList items={entry.episodes || details.episodes} isCyber={isCyber} />
                          </div>
                        )}
                        {(entry.spinOffs || details.spinOffs) && (
                          <div>
                            <span className={`text-[10px] font-mono uppercase tracking-wider font-bold block ${isCyber ? "text-cyan-400" : "text-gray-600"}`}>
                              Spin-offs
                            </span>
                            <ChipList items={entry.spinOffs || details.spinOffs} isCyber={isCyber} />
                          </div>
                        )}
                        {(entry.cameos || details.cameos) && (
                          <div>
                            <span className={`text-[10px] font-mono uppercase tracking-wider font-bold block ${isCyber ? "text-cyan-400" : "text-gray-600"}`}>
                              Cameos & Guest Roles
                            </span>
                            <ChipList items={entry.cameos || details.cameos} isCyber={isCyber} />
                          </div>
                        )}
                        {(entry.works || entry.relatedWorks || details.relatedWorks) && (
                          <div>
                            <span className={`text-[10px] font-mono uppercase tracking-wider font-bold block ${isCyber ? "text-cyan-400" : "text-gray-600"}`}>
                              Related Works & Credits
                            </span>
                            <ChipList items={entry.works || entry.relatedWorks || details.relatedWorks} isCyber={isCyber} />
                          </div>
                        )}
                      </div>
                    </InformationSection>

                    {/* LINKS & SOCIAL PROFILES Section */}
                    {((entry.socialLinks && entry.socialLinks.length > 0) || (details.socialLinks && details.socialLinks.length > 0)) && (
                      <InformationSection title="LINKS & SOCIAL PROFILES" isCyber={isCyber} hasData={true}>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {(entry.socialLinks || details.socialLinks || []).map((link: { platform: string; url: string }, idx: number) => (
                            <a
                              key={idx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 transition-all hover:scale-105 ${
                                isCyber
                                  ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 shadow-[0_0_10px_rgba(0,245,255,0.15)]"
                                  : "bg-amber-100 border-black text-gray-900 shadow-[2px_2px_0_#000]"
                              }`}
                            >
                              <span>🔗</span>
                              <span>{link.platform || "Link"}</span>
                              <span className="text-[10px] opacity-60">↗</span>
                            </a>
                          ))}
                        </div>
                      </InformationSection>
                    )}
                  </div>
                </div>
              )}

              {/* ── GALLERY TAB ── */}
              {activeTab === "gallery" && (
                <div className="space-y-4">
                  <div
                    className={`flex items-center justify-between gap-2 p-3 rounded-2xl border ${
                      isCyber ? "border-white/10 bg-white/[0.03]" : "border-black/15 bg-gray-50 shadow-[2px_2px_0_#000]"
                    }`}
                  >
                    <span className={`text-xs font-mono font-bold ${isCyber ? "text-white/80" : "text-gray-800"}`}>
                      🖼️ Personal Character Image Collection ({galleryImages.length} images)
                    </span>
                    {onEdit && (
                      <button
                        onClick={() => {
                          onClose();
                          onEdit(entry);
                        }}
                        className="text-xs font-mono font-bold text-cyan-400 hover:underline cursor-pointer"
                      >
                        + Manage / Add Images in Editor
                      </button>
                    )}
                  </div>

                  {galleryImages.length === 0 ? (
                    <div className={`text-center py-16 font-mono text-sm space-y-3 ${isCyber ? "text-white/30" : "text-gray-400"}`}>
                      <div className="text-4xl opacity-50">🖼️</div>
                      <p>No gallery images uploaded for this character dossier.</p>
                      {onEdit && (
                        <button
                          onClick={() => {
                            onClose();
                            onEdit(entry);
                          }}
                          className="text-xs underline opacity-70 hover:opacity-100 cursor-pointer"
                        >
                          Manage images in Editor →
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                      {galleryImages.map(({ src, label }, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ scale: 1.04 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => {
                            setLightboxSrc(src);
                            setLightboxTitle(label);
                            setLightboxIndex(i);
                          }}
                          onContextMenu={(e) => handleImageContextMenu(e, { src, label }, i)}
                          className={`relative aspect-[3/4] rounded-2xl overflow-hidden cursor-zoom-in border group ${
                            isCyber ? "border-white/10 bg-black/40" : "border-black bg-gray-100 shadow-[3px_3px_0_#000]"
                          }`}
                        >
                          {src.endsWith(".mp4") || src.endsWith(".webm") || src.startsWith("data:video/") ? (
                            <video
                              src={src}
                              muted
                              loop
                              autoPlay
                              playsInline
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <img
                              src={src}
                              alt={label}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                            <span className="text-[10px] font-mono text-white font-bold">{label}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── PROFILE / LORE TAB ── */}
              {activeTab === "profile" && (
                <div className="space-y-4">
                  <InformationSection title="CHARACTER PROFILE & LORE" isCyber={isCyber} hasData={hasProfileLore}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 mb-4">
                      <InfoRow label="Personality" value={entry.personality || details.personality} isCyber={isCyber} />
                      <InfoRow label="Archetype" value={entry.archetype || entry.singerType || entry.type || details.archetype} isCyber={isCyber} />
                      <InfoRow label="Occupation / Role" value={entry.occupation || entry.role || entry.profession || details.occupation} isCyber={isCyber} />
                      <InfoRow label="Alignment" value={entry.alignment || details.alignment} isCyber={isCyber} />
                      <InfoRow label="Character Traits" value={entry.traits || details.traits} isCyber={isCyber} />
                      <InfoRow label="Motivation" value={entry.motivation || details.motivation} isCyber={isCyber} />
                    </div>

                    {(entry.background || entry.bio || details.background) && (
                      <div className="pt-3 border-t border-white/10 space-y-1">
                        <span className={`text-[10px] font-mono uppercase tracking-wider font-bold block ${isCyber ? "text-cyan-400" : "text-gray-700"}`}>
                          Background & Biography
                        </span>
                        <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${isCyber ? "text-white/80" : "text-gray-800"}`}>
                          {entry.background || entry.bio || details.background}
                        </p>
                      </div>
                    )}

                    {(entry.characterDevelopment || details.characterDevelopment) && (
                      <div className="pt-3 border-t border-white/10 space-y-1 mt-3">
                        <span className={`text-[10px] font-mono uppercase tracking-wider font-bold block ${isCyber ? "text-cyan-400" : "text-gray-700"}`}>
                          Character Development Arc
                        </span>
                        <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${isCyber ? "text-white/80" : "text-gray-800"}`}>
                          {entry.characterDevelopment || details.characterDevelopment}
                        </p>
                      </div>
                    )}
                  </InformationSection>
                </div>
              )}

              {/* ── APPEARANCES TAB ── */}
              {activeTab === "appearances" && (
                <div className="space-y-4">
                  <InformationSection title="MEDIA CATALOG & APPEARANCES" isCyber={isCyber} hasData={hasAppearances}>
                    <div className="space-y-4">
                      {(entry.mainSeries || details.mainSeries) && (
                        <div>
                          <span className={`text-[10px] font-mono uppercase tracking-wider font-bold block mb-1 ${isCyber ? "text-cyan-400" : "text-gray-600"}`}>
                            Main Series
                          </span>
                          <ChipList items={entry.mainSeries || details.mainSeries} isCyber={isCyber} />
                        </div>
                      )}
                      {(entry.movies || entry.associatedDramas || details.movies) && (
                        <div>
                          <span className={`text-[10px] font-mono uppercase tracking-wider font-bold block mb-1 ${isCyber ? "text-cyan-400" : "text-gray-600"}`}>
                            Movies & Filmography
                          </span>
                          <ChipList items={entry.movies || entry.associatedDramas || details.movies} isCyber={isCyber} />
                        </div>
                      )}
                      {(entry.episodes || details.episodes) && (
                        <div>
                          <span className={`text-[10px] font-mono uppercase tracking-wider font-bold block mb-1 ${isCyber ? "text-cyan-400" : "text-gray-600"}`}>
                            Featured Episodes
                          </span>
                          <ChipList items={entry.episodes || details.episodes} isCyber={isCyber} />
                        </div>
                      )}
                      {(entry.spinOffs || details.spinOffs) && (
                        <div>
                          <span className={`text-[10px] font-mono uppercase tracking-wider font-bold block mb-1 ${isCyber ? "text-cyan-400" : "text-gray-600"}`}>
                            Spin-offs
                          </span>
                          <ChipList items={entry.spinOffs || details.spinOffs} isCyber={isCyber} />
                        </div>
                      )}
                      {(entry.cameos || details.cameos) && (
                        <div>
                          <span className={`text-[10px] font-mono uppercase tracking-wider font-bold block mb-1 ${isCyber ? "text-cyan-400" : "text-gray-600"}`}>
                            Cameos & Guest Roles
                          </span>
                          <ChipList items={entry.cameos || details.cameos} isCyber={isCyber} />
                        </div>
                      )}
                      {(entry.works || entry.relatedWorks || details.relatedWorks) && (
                        <div>
                          <span className={`text-[10px] font-mono uppercase tracking-wider font-bold block mb-1 ${isCyber ? "text-cyan-400" : "text-gray-600"}`}>
                            Related Works & Credits
                          </span>
                          <ChipList items={entry.works || entry.relatedWorks || details.relatedWorks} isCyber={isCyber} />
                        </div>
                      )}
                    </div>
                  </InformationSection>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <div
            className="fixed inset-0 z-[1800] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl space-y-4 ${
                isCyber
                  ? "border-red-500/40 bg-[#0c0814] text-white"
                  : "border-black bg-white text-black shadow-[4px_4px_0_#000]"
              }`}
            >
              <div className="flex items-center gap-3 text-red-400">
                <span className="text-2xl">⚠️</span>
                <h4 className="text-base font-bold font-mono">Delete Gallery Image</h4>
              </div>
              <p className={`text-xs sm:text-sm leading-relaxed ${isCyber ? "text-slate-300" : "text-gray-700"}`}>
                Are you sure you want to permanently delete <strong className="text-cyan-400">{deleteTarget.label}</strong>? This action cannot be undone and will remove the media asset from storage.
              </p>

              <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-red-500/20 bg-black/40">
                {deleteTarget.src.endsWith(".mp4") || deleteTarget.src.endsWith(".webm") || /\.(mp4|webm|mov)(?:[?#]|$)/i.test(deleteTarget.src) ? (
                  <video src={deleteTarget.src} muted autoPlay loop className="w-full h-full object-cover" />
                ) : (
                  <img src={deleteTarget.src} alt={deleteTarget.label} className="w-full h-full object-cover" />
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isDeletingMedia}
                  onClick={() => setDeleteTarget(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                    isCyber
                      ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                      : "border-black bg-gray-100 text-black hover:bg-gray-200"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeletingMedia}
                  onClick={confirmDeleteHofImage}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-2 ${
                    isCyber
                      ? "border-red-500 bg-red-600/20 text-red-300 hover:bg-red-600/40"
                      : "border-black bg-red-500 text-white hover:bg-red-600 shadow-[2px_2px_0_#000]"
                  }`}
                >
                  {isDeletingMedia ? "Deleting..." : "🗑️ Confirm Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal for Gallery */}
      <ImageLightboxModal
        isOpen={Boolean(lightboxSrc)}
        onClose={() => setLightboxSrc(null)}
        imageUrl={lightboxSrc || ""}
        title={lightboxTitle}
        images={galleryImages}
        initialIndex={lightboxIndex}
      />

      {/* Cross-Navigation Game Character Profile Modal */}
      {targetGameChar && (
        <CharacterProfileModal
          isOpen={gameCharModalOpen}
          character={targetGameChar}
          onClose={() => setGameCharModalOpen(false)}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      )}
    </>
  );
}
