"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import Link from "next/link";
import Image from "next/image";
import { Shield, Sparkles, RefreshCw, ArrowRight } from "lucide-react";
import { getClassificationMeta, CREATURE_TIER_META } from "@/lib/data/creatureSchema";

export function CreatureSpotlightCard() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const { creatures = [] } = useDashboardStore();

  // ── Anti-repeat randomizer / featured creature rotation ───────────────────────
  const [activeId, setActiveId] = useState<string | null>(() => {
    if (!creatures || creatures.length === 0) return null;
    const fav = creatures.find((c) => c.isFavorite);
    return fav ? fav.id : creatures[0].id;
  });

  const recentHistoryRef = useRef<string[]>([]);

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

  const activeCreature = useMemo(() => {
    if (!creatures || creatures.length === 0) return null;
    return creatures.find((c) => c.id === activeId) || creatures[0];
  }, [creatures, activeId]);

  const pickNextRandom = useCallback(() => {
    if (creatures.length <= 1) return;
    const historyCap = Math.max(1, Math.min(3, creatures.length - 1));

    let eligible = creatures.filter(
      (c) => c.id !== activeId && !recentHistoryRef.current.includes(c.id)
    );

    if (eligible.length === 0) {
      eligible = creatures.filter((c) => c.id !== activeId);
    }

    if (eligible.length === 0) return;
    const chosen = eligible[Math.floor(Math.random() * eligible.length)];
    recentHistoryRef.current = [...recentHistoryRef.current.slice(-historyCap + 1), chosen.id];
    setActiveId(chosen.id);
  }, [creatures, activeId]);

  if (!activeCreature) {
    return (
      <div
        className="rounded-2xl p-5 border flex flex-col justify-between h-full"
        style={{
          backgroundColor: isCyber ? "rgba(10, 15, 30, 0.85)" : "#FFFFFF",
          borderColor: isCyber ? "rgba(57, 255, 20, 0.25)" : "#000000",
          borderWidth: isCyber ? "1px" : "2.5px",
          boxShadow: isCyber ? "0 0 15px rgba(57, 255, 20, 0.08)" : "4px 4px 0 #000000",
        }}
      >
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base" role="img" aria-label="dragon">
              🐉
            </span>
            <h3
              className="font-black text-xs uppercase tracking-wider"
              style={{
                color: isCyber ? "#39FF14" : "#1A1A1A",
                fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
              }}
            >
              {isCyber ? "// CREATURE · SPOTLIGHT" : "Creature Spotlight"}
            </h3>
          </div>
          <div className="p-6 text-center border border-dashed rounded-xl border-white/15 my-4">
            <p className="text-xs theme-text-muted italic">No creatures cataloged yet.</p>
            <Link
              href="/creatures"
              className="mt-2 inline-block text-xs font-bold text-emerald-400 hover:underline"
            >
              + Catalog a creature
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const artwork =
    activeCreature.media?.primary ||
    activeCreature.media?.card ||
    (activeCreature.media?.gallery && activeCreature.media.gallery[0]) ||
    null;

  const classMeta = getClassificationMeta(activeCreature.classification);
  const tierMeta = CREATURE_TIER_META[activeCreature.tier] || CREATURE_TIER_META["S"];

  return (
    <div
      className="rounded-2xl p-5 border flex flex-col justify-between h-full relative overflow-hidden"
      style={{
        backgroundColor: isCyber ? "rgba(10, 15, 30, 0.85)" : "#FFFFFF",
        borderColor: isCyber ? "rgba(57, 255, 20, 0.3)" : "#000000",
        borderWidth: isCyber ? "1px" : "2.5px",
        boxShadow: isCyber ? "0 0 20px rgba(57, 255, 20, 0.12)" : "4px 4px 0 #000000",
      }}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <span className="text-base" role="img" aria-label="dragon">
              🐉
            </span>
            <h3
              className="font-black text-xs uppercase tracking-wider"
              style={{
                color: isCyber ? "#39FF14" : "#1A1A1A",
                fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
              }}
            >
              {isCyber ? "// CREATURE · SPOTLIGHT" : "Creature Spotlight"}
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            {creatures.length > 1 && (
              <button
                type="button"
                onClick={pickNextRandom}
                className="p-1 rounded-lg border border-transparent hover:border-white/20 text-slate-400 hover:text-white transition-all active:scale-95"
                title="Cycle to another creature"
              >
                <RefreshCw size={12} />
              </button>
            )}
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase"
              style={{
                backgroundColor: isCyber ? "rgba(57, 255, 20, 0.12)" : "#ECFDF5",
                borderColor: isCyber ? "rgba(57, 255, 20, 0.4)" : "#A7F3D0",
                color: isCyber ? "#39FF14" : "#059669",
              }}
            >
              {activeCreature.classification}
            </span>
          </div>
        </div>

        {/* Creature Card Body */}
        <div className="relative rounded-xl overflow-hidden border border-white/10 group mb-3.5">
          <div className="relative h-32 w-full bg-slate-900 flex items-center justify-center overflow-hidden">
            {artwork ? (
              <Image
                src={artwork}
                alt={activeCreature.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                unoptimized
              />
            ) : (
              <div className="flex items-center justify-center text-4xl">
                {classMeta.icon || "🐉"}
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            {/* Tier Badge on artwork */}
            <div className="absolute top-2.5 right-2.5">
              <span
                className="px-2 py-0.5 rounded-md border font-black text-[10px] shadow-lg backdrop-blur-md"
                style={{
                  backgroundColor: isCyber ? "rgba(10, 15, 30, 0.85)" : "#FFFFFF",
                  borderColor: tierMeta.color,
                  color: tierMeta.color,
                }}
              >
                {activeCreature.tier} TIER
              </span>
            </div>

            {/* Bottom Title Overlay */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 min-w-0">
              <p className="text-white font-black text-sm truncate drop-shadow-md">
                {activeCreature.name}
              </p>
              <p className="text-emerald-200/80 text-[10px] truncate font-medium">
                {activeCreature.species ? `${activeCreature.species} · ` : ""}
                {activeCreature.sourceTitle}
              </p>
            </div>
          </div>
        </div>

        {/* Tags / Short Description */}
        <div className="flex flex-wrap gap-1 mb-2">
          {(activeCreature.tags || []).slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-md border font-medium truncate"
              style={{
                backgroundColor: isCyber ? "rgba(255,255,255,0.03)" : "#F1F5F9",
                borderColor: isCyber ? "rgba(255,255,255,0.08)" : "#E2E8F0",
                color: isCyber ? "#E2E8F0" : "#475569",
              }}
            >
              #{tag}
            </span>
          ))}
          {activeCreature.isFavorite && (
            <span className="text-[10px] px-2 py-0.5 rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-400 font-bold">
              ★ Favorite
            </span>
          )}
        </div>
      </div>

      {/* Footer Link */}
      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
        <span className="text-[10px] theme-text-muted">
          {creatures.length} creatures in collection
        </span>
        <Link
          href="/creatures"
          className="inline-flex items-center gap-1 text-xs font-bold transition-all hover:gap-1.5"
          style={{ color: isCyber ? "#39FF14" : "#059669" }}
        >
          <span>View Creature</span>
          <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
