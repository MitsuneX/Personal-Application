"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { CreatureEntry, getClassificationMeta } from "@/lib/data/creatureSchema";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { RomanticLoveBurst, RomanticLoveBurstHandle } from "@/components/ui/RomanticLoveBurst";
import { triggerHeartEffect } from "@/components/ui/FloatingHeartEngine";

interface CreatureDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  creature: CreatureEntry | null;
  onEdit?: (creature: CreatureEntry) => void;
}

export function CreatureDossierModal({
  isOpen,
  onClose,
  creature,
  onEdit,
}: CreatureDossierModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { toggleFavoriteCreature, bondCreature } = useDashboardStore();

  const loveBurstRef = useRef<RomanticLoveBurstHandle>(null);
  const favBurstRef = useRef<RomanticLoveBurstHandle>(null);

  // Gallery viewer index
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | null>(null);

  // Reset selected image on open
  useEffect(() => {
    if (creature) {
      setSelectedMediaUrl(
        creature.media.primary || creature.media.card || creature.media.gallery?.[0] || null
      );
    }
  }, [creature]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !creature) return null;

  const classificationMeta = getClassificationMeta(creature.classification);

  // Gather all available media URLs for gallery strip
  const allMedia: { label: string; url: string }[] = [];
  if (creature.media.primary) {
    allMedia.push({ label: "Primary Art", url: creature.media.primary });
  }
  if (creature.media.card && creature.media.card !== creature.media.primary) {
    allMedia.push({ label: "Card Poster", url: creature.media.card });
  }
  if (creature.media.favouriteMoment) {
    allMedia.push({ label: "Favourite Moment", url: creature.media.favouriteMoment });
  }
  (creature.media.gallery || []).forEach((g, idx) => {
    if (g && !allMedia.some((m) => m.url === g)) {
      allMedia.push({ label: `Gallery ${idx + 1}`, url: g });
    }
  });

  const activeDisplayUrl =
    selectedMediaUrl ||
    creature.media.primary ||
    creature.media.card ||
    creature.media.gallery?.[0] ||
    null;

  const handleBond = (e: React.MouseEvent) => {
    loveBurstRef.current?.trigger();
    triggerHeartEffect(e.clientX, e.clientY);
    bondCreature(creature.id);
  };

  const handleToggleFav = () => {
    favBurstRef.current?.trigger();
    toggleFavoriteCreature(creature.id);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={`relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl overflow-hidden border z-10 ${
            isCyber
              ? "bg-[#050816] border-cyan-500/40 text-slate-100 shadow-[0_0_50px_rgba(0,245,255,0.2)]"
              : "bg-[#FFFBF5] border-3 border-black text-black shadow-[8px_8px_0px_0px_#000000]"
          }`}
        >
          {/* ── TOP APP BAR ── */}
          <div
            className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${
              isCyber
                ? "bg-[#080c1a]/90 border-cyan-500/20"
                : "bg-white border-black"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🐾</span>
              <div>
                <h3 className="text-base font-black font-mono uppercase tracking-wider">
                  Creature Dossier
                </h3>
                <span className="text-[11px] font-mono opacity-60">
                  {creature.sourceTitle}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Favorite Toggle */}
              <div className="relative">
                <RomanticLoveBurst ref={favBurstRef} />
                <button
                  onClick={handleToggleFav}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-all border cursor-pointer ${
                    creature.isFavorite
                      ? isCyber
                        ? "bg-amber-400/20 text-amber-300 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                        : "bg-amber-300 text-black border-2 border-black shadow-[2px_2px_0px_#000000]"
                      : isCyber
                      ? "bg-white/5 text-slate-400 border-white/10 hover:text-amber-300"
                      : "bg-white text-slate-700 border-2 border-black hover:bg-amber-50"
                  }`}
                  aria-label="Toggle favorite"
                >
                  {creature.isFavorite ? "★" : "☆"}
                </button>
              </div>

              {/* Edit Button */}
              {onEdit && (
                <button
                  onClick={() => {
                    onClose();
                    onEdit(creature);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
                    isCyber
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30"
                      : "bg-white text-black border-2 border-black hover:bg-slate-100 shadow-[2px_2px_0px_#000000]"
                  }`}
                >
                  ✎ Edit
                </button>
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-mono font-bold transition-all border cursor-pointer ${
                  isCyber
                    ? "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white"
                    : "bg-white text-black border-2 border-black hover:bg-slate-100 shadow-[2px_2px_0px_#000000]"
                }`}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
          </div>

          {/* ── SCROLLABLE DOSSIER BODY ── */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            {/* HERO MEDIA VIEWER */}
            <div className="space-y-3">
              <div
                className={`relative w-full h-[320px] sm:h-[420px] rounded-2xl overflow-hidden border ${
                  isCyber
                    ? "bg-black/50 border-cyan-500/30 shadow-inner"
                    : "bg-amber-50 border-2 border-black shadow-[4px_4px_0px_#000000]"
                }`}
              >
                {activeDisplayUrl ? (
                  <>
                    {/* Ambient backdrop */}
                    <div
                      className="absolute inset-0 bg-cover bg-center scale-110 blur-xl opacity-30"
                      style={{ backgroundImage: `url(${activeDisplayUrl})` }}
                    />
                    <img
                      src={activeDisplayUrl}
                      alt={creature.name}
                      className="relative w-full h-full object-contain p-2"
                    />
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-6xl">
                    {classificationMeta.icon}
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery Strip (if multiple media) */}
              {allMedia.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {allMedia.map((m, idx) => {
                    const isSelected = activeDisplayUrl === m.url;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedMediaUrl(m.url)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-bold shrink-0 transition-all border cursor-pointer ${
                          isSelected
                            ? isCyber
                              ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(0,245,255,0.4)]"
                              : "bg-black text-white border-2 border-black"
                            : isCyber
                            ? "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
                            : "bg-white text-black border border-black hover:bg-amber-100"
                        }`}
                      >
                        <span>🖼️</span>
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* CREATURE IDENTITY HEADER */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-5 border-white/10">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Classification badge */}
                  <div
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-black tracking-wider uppercase border shadow-sm"
                    style={{
                      backgroundColor: isCyber ? classificationMeta.bgCyber : classificationMeta.bgNeo,
                      borderColor: isCyber ? classificationMeta.borderCyber : classificationMeta.borderNeo,
                      color: isCyber ? classificationMeta.color : "#000000",
                    }}
                  >
                    <span>{classificationMeta.icon}</span>
                    <span>{classificationMeta.label}</span>
                  </div>

                  {creature.species && (
                    <span
                      className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                        isCyber
                          ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
                          : "bg-amber-100 text-amber-900 border border-amber-300"
                      }`}
                    >
                      {creature.species}
                    </span>
                  )}

                  <span className="text-xs font-mono opacity-60">
                    {creature.mediaType}
                    {creature.sourceYear ? ` · ${creature.sourceYear}` : ""}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-black font-mono tracking-tight">
                  {creature.name}
                </h1>

                <p className="text-sm font-mono opacity-80">
                  Featured in <strong>{creature.sourceTitle}</strong>
                </p>
              </div>

              {/* Affection / Bond Action */}
              <div className="relative">
                <RomanticLoveBurst ref={loveBurstRef} />
                <button
                  onClick={handleBond}
                  className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-mono font-black text-sm transition-all border cursor-pointer ${
                    isCyber
                      ? "bg-pink-500/20 text-pink-300 border-pink-500/50 hover:bg-pink-500/30 shadow-[0_0_18px_rgba(236,72,153,0.35)]"
                      : "bg-pink-100 text-pink-900 border-2 border-black hover:bg-pink-200 shadow-[3px_3px_0px_#000000]"
                  }`}
                >
                  <span className="text-base">❤️</span>
                  <span>{creature.likes || 0} Affection</span>
                  <span className="text-xs opacity-70">(+1 Bond)</span>
                </button>
              </div>
            </div>

            {/* LORE / ABOUT */}
            {creature.description && (
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-black tracking-wider uppercase text-cyan-400">
                  About the Creature
                </h4>
                <div
                  className={`p-4 rounded-2xl border text-xs sm:text-sm font-mono leading-relaxed ${
                    isCyber
                      ? "bg-white/[0.03] border-white/10 text-slate-200"
                      : "bg-white border border-black/20 text-slate-800"
                  }`}
                >
                  {creature.description}
                </div>
              </div>
            )}

            {/* DEDICATED SCRAPBOOK HIGHLIGHT: WHY I LOVE THIS CREATURE */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-base">💖</span>
                <h4 className="text-xs font-mono font-black tracking-wider uppercase text-pink-400">
                  Why I Love This Creature
                </h4>
                <span className="text-[10px] font-mono opacity-60">
                  (Personal Favourite Note)
                </span>
              </div>
              <div
                className={`p-5 rounded-2xl border leading-relaxed text-xs sm:text-sm font-mono relative ${
                  isCyber
                    ? "bg-gradient-to-br from-pink-950/30 via-purple-950/20 to-black border-pink-500/30 text-pink-100"
                    : "bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50 border-2 border-black shadow-[4px_4px_0px_#000000] text-pink-950"
                }`}
              >
                {creature.personalNote ? (
                  <p className="italic leading-relaxed whitespace-pre-wrap">
                    &ldquo;{creature.personalNote}&rdquo;
                  </p>
                ) : (
                  <p className="opacity-50 italic">
                    No personal note added yet. Click &ldquo;Edit&rdquo; above to write why you love this creature.
                  </p>
                )}
              </div>
            </div>

            {/* TAGS */}
            {creature.tags && creature.tags.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-[11px] font-mono font-bold tracking-wider uppercase opacity-60">
                  Personal Tags
                </h4>
                <div className="flex flex-wrap items-center gap-1.5">
                  {creature.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`text-xs font-mono px-2.5 py-1 rounded-lg border ${
                        isCyber
                          ? "bg-white/5 border-white/10 text-slate-300"
                          : "bg-white border border-black text-black shadow-[1px_1px_0px_#000000]"
                      }`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
