"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { CreatureEntry, getClassificationMeta, CREATURE_TIER_META } from "@/lib/data/creatureSchema";

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

  // ── Automatic Randomized Rotation Engine with Anti-Repeat History ────────────
  const [activeId, setActiveId] = useState<string | null>(() => {
    if (!creatures || creatures.length === 0) return null;
    // Prefer favorite if available on first mount, else random
    const fav = creatures.find((c) => c.isFavorite);
    return fav ? fav.id : creatures[0].id;
  });

  const [isPaused, setIsPaused] = useState(false);
  const [rotationKey, setRotationKey] = useState(0);

  // Anti-repeat history buffer: holds last few creature IDs to prevent immediate repeats
  const recentHistoryRef = useRef<string[]>([]);

  // Sync activeId if current active creature was deleted or creatures changed
  useEffect(() => {
    if (creatures.length === 0) {
      setActiveId(null);
      recentHistoryRef.current = [];
      return;
    }
    if (!activeId || !creatures.some((c) => c.id === activeId)) {
      const initial = creatures.find((c) => c.isFavorite) || creatures[0];
      setActiveId(initial.id);
      recentHistoryRef.current = [initial.id];
    }
  }, [creatures, activeId]);

  // Current active creature record
  const activeCreature = useMemo(() => {
    if (!creatures || creatures.length === 0) return null;
    return creatures.find((c) => c.id === activeId) || creatures[0];
  }, [creatures, activeId]);

  // Pick next creature with anti-repeat safeguards
  const pickNextRandom = useCallback(() => {
    if (creatures.length <= 1) return;

    // Buffer length: avoid repeats across up to 3 creatures (or count - 1 if smaller)
    const historyCap = Math.max(1, Math.min(3, creatures.length - 1));

    // Exclude recently seen IDs
    let eligible = creatures.filter(
      (c) => c.id !== activeId && !recentHistoryRef.current.includes(c.id)
    );

    // If all creatures were in history cap, relax to any creature except currently active
    if (eligible.length === 0) {
      eligible = creatures.filter((c) => c.id !== activeId);
    }

    if (eligible.length === 0) return;

    // Truly random selection from eligible candidates
    const chosen = eligible[Math.floor(Math.random() * eligible.length)];

    // Update history cap
    recentHistoryRef.current = [...recentHistoryRef.current.slice(-historyCap + 1), chosen.id];
    setActiveId(chosen.id);
    setRotationKey((k) => k + 1);
  }, [creatures, activeId]);

  // Pick previous creature from history or random
  const pickPrev = useCallback(() => {
    if (creatures.length <= 1) return;
    const history = recentHistoryRef.current;
    if (history.length > 1) {
      // Step back in history
      const prevId = history[history.length - 2];
      const prevCreature = creatures.find((c) => c.id === prevId);
      if (prevCreature) {
        recentHistoryRef.current = history.slice(0, history.length - 1);
        setActiveId(prevCreature.id);
        setRotationKey((k) => k + 1);
        return;
      }
    }
    // Fallback: regular random pick
    pickNextRandom();
  }, [creatures, pickNextRandom]);

  // Automatic interval timer: 9 seconds
  useEffect(() => {
    if (isPaused || creatures.length <= 1) return;

    const timer = setInterval(() => {
      pickNextRandom();
    }, 9000);

    return () => clearInterval(timer);
  }, [isPaused, creatures.length, pickNextRandom]);

  // Clean empty state when no creatures exist
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
  const tierMeta = CREATURE_TIER_META[activeCreature.tier] || CREATURE_TIER_META.S;
  const artwork =
    activeCreature.media.primary ||
    activeCreature.media.card ||
    activeCreature.media.gallery?.[0] ||
    null;

  return (
    <div
      onClick={() => onSelect(activeCreature)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      className="group relative w-full rounded-3xl overflow-hidden cursor-pointer select-none border transition-all duration-500 min-h-[380px] sm:min-h-[420px]"
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
                ? "linear-gradient(90deg, #050816 0%, rgba(5,8,22,0.88) 45%, rgba(5,8,22,0.4) 100%)"
                : "linear-gradient(90deg, #FFFBF5 0%, rgba(255,251,245,0.88) 45%, rgba(255,251,245,0.4) 100%)",
            }}
          />
        </div>
      )}

      {/* ── SPOTLIGHT CONTENT (Cross-fade between creatures without layout shifts) ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeCreature.id}-${rotationKey}`}
          initial={{ opacity: shouldReduceMotion ? 1 : 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: shouldReduceMotion ? 1 : 0 }}
          transition={{ duration: shouldReduceMotion ? 0.05 : 0.45 }}
          className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 lg:p-10 items-center"
        >
          {/* Left / Info Section (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Header Row: Badge, Status, and Controls */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-black tracking-widest uppercase text-cyan-400 flex items-center gap-1.5">
                  <span>⭐</span> CREATURE SPOTLIGHT
                </span>

                {/* Classification badge */}
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

                {/* Canonical Tier badge */}
                <div
                  className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase border tracking-wider"
                  style={{
                    backgroundColor: isCyber ? tierMeta.bgCyber : tierMeta.bgNeo,
                    borderColor: isCyber ? tierMeta.borderCyber : "#000000",
                    color: isCyber ? tierMeta.color : "#000000",
                  }}
                >
                  {tierMeta.badgeLabel}
                </div>

                {/* Automatic Rotation Indicator Pill */}
                {creatures.length > 1 && (
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      isPaused
                        ? isCyber
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                          : "bg-amber-100 text-amber-900 border-amber-400"
                        : isCyber
                        ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
                        : "bg-cyan-100 text-cyan-900 border-cyan-300"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? "bg-amber-400" : "bg-cyan-400 animate-ping"}`} />
                    <span>{isPaused ? "PAUSED (HOVER)" : "RANDOM ROTATION"}</span>
                  </span>
                )}
              </div>

              {/* Candidate navigation arrows (Subtle manual control) */}
              {creatures.length > 1 && (
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={pickPrev}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold transition-all border cursor-pointer ${
                      isCyber
                        ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                        : "bg-white border border-black hover:bg-slate-100 shadow-[1px_1px_0px_#000000]"
                    }`}
                    title="Previous random creature"
                    aria-label="Previous creature"
                  >
                    ←
                  </button>
                  <span className="text-[10px] font-mono px-1.5 opacity-60">
                    🎲 Random
                  </span>
                  <button
                    onClick={pickNextRandom}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold transition-all border cursor-pointer ${
                      isCyber
                        ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                        : "bg-white border border-black hover:bg-slate-100 shadow-[1px_1px_0px_#000000]"
                    }`}
                    title="Next random creature"
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

            {/* Connected Characters Chips (If Any) */}
            {activeCreature.connectedCharacters && activeCreature.connectedCharacters.length > 0 && (
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-60 block">
                  Connected Characters
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeCreature.connectedCharacters.map((c, i) => (
                    <div
                      key={i}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border ${
                        isCyber
                          ? "bg-white/5 border-white/10 text-slate-200"
                          : "bg-white border border-black shadow-[1.5px_1.5px_0px_#000]"
                      }`}
                    >
                      {c.avatar ? (
                        <img
                          src={c.avatar}
                          alt={c.name}
                          className="w-4 h-4 rounded-full object-cover"
                        />
                      ) : (
                        <span>👤</span>
                      )}
                      <span className="font-bold">{c.name}</span>
                      {c.relationshipType && (
                        <span className="text-[10px] opacity-60">({c.relationshipType})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
