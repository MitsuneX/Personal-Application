"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { CreatureEntry, getClassificationMeta } from "@/lib/data/creatureSchema";

interface CreatureSpotlightProps {
  creatures: CreatureEntry[];
  onSelect: (creature: CreatureEntry) => void;
  onAddCreature?: () => void;
}

export function CreatureSpotlight({
  creatures,
  onSelect,
  onAddCreature,
}: CreatureSpotlightProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const shouldReduceMotion = useReducedMotion();

  // Pick candidates: prioritize pinned favorites, then sort by highest likes
  const spotlightCandidates = React.useMemo(() => {
    const favs = creatures.filter((c) => c.isFavorite);
    if (favs.length > 0) return favs;
    return [...creatures].sort((a, b) => (b.likes || 0) - (a.likes || 0));
  }, [creatures]);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Bounds guard
  const activeCreature =
    spotlightCandidates.length > 0
      ? spotlightCandidates[Math.min(currentIndex, spotlightCandidates.length - 1)]
      : null;

  // Clean empty state
  if (!activeCreature) {
    return (
      <div
        className={`relative w-full rounded-2xl p-8 sm:p-12 text-center overflow-hidden border transition-all ${
          isCyber
            ? "bg-[#080c1a]/80 border-cyan-500/20 text-slate-300"
            : "bg-[#FFFDF9] border-2 border-black shadow-[4px_4px_0px_0px_#000000] text-black"
        }`}
      >
        <div className="max-w-md mx-auto space-y-4">
          <span className="text-5xl block animate-bounce">🐾</span>
          <h3 className="text-xl sm:text-2xl font-black font-mono tracking-tight">
            Your Bestiary Awaits
          </h3>
          <p className="text-xs sm:text-sm font-mono opacity-70 leading-relaxed">
            No creatures archived yet. Add your beloved pets, dragons, familiars, companions, and mythical beasts to begin your personal archive.
          </p>
          {onAddCreature && (
            <button
              onClick={onAddCreature}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
                isCyber
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-500/30 shadow-[0_0_15px_rgba(0,245,255,0.3)]"
                  : "bg-black text-white border-2 border-black hover:bg-slate-900 shadow-[3px_3px_0px_0px_#000000]"
              }`}
            >
              <span>+</span>
              <span>Add Your First Creature</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const classificationMeta = getClassificationMeta(activeCreature.classification);
  const artwork =
    activeCreature.media.primary ||
    activeCreature.media.card ||
    activeCreature.media.gallery?.[0] ||
    null;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % spotlightCandidates.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + spotlightCandidates.length) % spotlightCandidates.length);
  };

  return (
    <div
      onClick={() => onSelect(activeCreature)}
      className="group relative w-full rounded-3xl overflow-hidden cursor-pointer select-none border transition-all duration-500"
      style={{
        backgroundColor: isCyber ? "#050816" : "#FFFBF5",
        borderColor: isCyber ? "rgba(0, 245, 255, 0.4)" : "#000000",
        borderWidth: isCyber ? "1px" : "3px",
        boxShadow: isCyber
          ? "0 0 35px rgba(0, 245, 255, 0.15), 0 10px 30px rgba(0,0,0,0.7)"
          : "6px 6px 0px 0px #000000",
      }}
    >
      {/* ── AMBIENT ARTWORK BACKDROP ── */}
      {artwork && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div
            className="absolute inset-0 bg-cover bg-center scale-110 blur-2xl opacity-25 dark:opacity-35 transition-all duration-1000"
            style={{ backgroundImage: `url(${artwork})` }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: isCyber
                ? "linear-gradient(90deg, #050816 0%, rgba(5,8,22,0.85) 45%, rgba(5,8,22,0.4) 100%)"
                : "linear-gradient(90deg, #FFFBF5 0%, rgba(255,251,245,0.85) 45%, rgba(255,251,245,0.4) 100%)",
            }}
          />
        </div>
      )}

      {/* ── SPOTLIGHT CONTENT GRID ── */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 lg:p-10 items-center">
        {/* Left / Info Section (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Header Row: Badge & Pagination */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black tracking-widest uppercase text-cyan-400 flex items-center gap-1.5">
                <span>⭐</span> CREATURE SPOTLIGHT
              </span>
              <div
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-black uppercase border"
                style={{
                  backgroundColor: isCyber ? classificationMeta.bgCyber : classificationMeta.bgNeo,
                  borderColor: isCyber ? classificationMeta.borderCyber : classificationMeta.borderNeo,
                  color: isCyber ? classificationMeta.color : "#000000",
                }}
              >
                <span>{classificationMeta.icon}</span>
                <span>{classificationMeta.label}</span>
              </div>
            </div>

            {/* Candidate navigation arrows if multiple */}
            {spotlightCandidates.length > 1 && (
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={handlePrev}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold transition-all border ${
                    isCyber
                      ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                      : "bg-white border border-black hover:bg-slate-100 shadow-[1px_1px_0px_#000000]"
                  }`}
                  aria-label="Previous creature"
                >
                  ←
                </button>
                <span className="text-[10px] font-mono px-2 opacity-60">
                  {currentIndex + 1} / {spotlightCandidates.length}
                </span>
                <button
                  onClick={handleNext}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold transition-all border ${
                    isCyber
                      ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                      : "bg-white border border-black hover:bg-slate-100 shadow-[1px_1px_0px_#000000]"
                  }`}
                  aria-label="Next creature"
                >
                  →
                </button>
              </div>
            )}
          </div>

          {/* Creature Title & Species */}
          <div className="space-y-1">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight leading-none">
              {activeCreature.name}
            </h2>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {activeCreature.species && (
                <span
                  className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${
                    isCyber
                      ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
                      : "bg-amber-100 text-amber-900 border border-amber-300"
                  }`}
                >
                  {activeCreature.species}
                </span>
              )}
              <span className="text-xs font-mono opacity-70">
                from <strong>{activeCreature.sourceTitle}</strong> ({activeCreature.mediaType}
                {activeCreature.sourceYear ? ` · ${activeCreature.sourceYear}` : ""})
              </span>
            </div>
          </div>

          {/* Description Lore */}
          {activeCreature.description && (
            <p className="text-xs sm:text-sm font-mono opacity-80 line-clamp-3 leading-relaxed">
              {activeCreature.description}
            </p>
          )}

          {/* Personal Note ("Why I Love This Creature") */}
          {activeCreature.personalNote && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-mono leading-relaxed relative ${
                isCyber
                  ? "bg-pink-500/10 border-pink-500/30 text-pink-200"
                  : "bg-pink-50 border-2 border-black shadow-[2px_2px_0px_#000000] text-pink-950"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-pink-400 mb-1">
                <span>💖</span>
                <span>Why I Love This Creature</span>
              </div>
              <p className="italic">&ldquo;{activeCreature.personalNote}&rdquo;</p>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-pink-500">❤️</span>
              <span className="font-bold">{activeCreature.likes || 0}</span>
              <span className="opacity-60">Affection Bond</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 group-hover:text-cyan-300">
              <span>Inspect Full Dossier</span>
              <span>→</span>
            </div>
          </div>
        </div>

        {/* Right / Hero Artwork Section (5 cols) */}
        <div className="lg:col-span-5 flex justify-center">
          <div
            className={`relative w-full max-w-sm sm:max-w-md h-[280px] sm:h-[340px] rounded-2xl overflow-hidden border ${
              isCyber
                ? "border-cyan-500/40 shadow-[0_0_25px_rgba(0,245,255,0.25)]"
                : "border-3 border-black shadow-[4px_4px_0px_0px_#000000]"
            }`}
          >
            {artwork ? (
              <img
                src={artwork}
                alt={activeCreature.name}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-white">
                <span className="text-6xl">{classificationMeta.icon}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
