"use client";

import React from "react";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { useLiveCreatureHighlight } from "@/lib/hooks/useLiveCreatureHighlight";
import Link from "next/link";
import Image from "next/image";
import { RefreshCw, ArrowRight, Star } from "lucide-react";
import { getClassificationMeta, CREATURE_TIER_META } from "@/lib/data/creatureSchema";

export function CreatureSpotlightCard() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const { creatures = [] } = useDashboardStore();
  const { activeCreature, pickNextRandom } = useLiveCreatureHighlight();

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
      <div className="flex flex-col flex-1 min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 shrink-0">
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
                className="p-1 rounded-lg border border-transparent hover:border-white/20 text-slate-400 hover:text-white transition-all active:scale-95 cursor-pointer"
                title="Rotate to next creature"
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

        {/* ── Near Full-Art Media Region ── */}
        <div className="relative flex-1 min-h-[185px] w-full rounded-xl overflow-hidden border border-white/10 group mb-3.5 bg-slate-950/80 flex items-center justify-center">
          {/* Ambient blurred backdrop layer to fill letterbox seamlessly */}
          {artwork && (
            <div
              className="absolute inset-0 bg-cover bg-center scale-110 blur-xl opacity-35 transition-transform duration-700 group-hover:scale-125 pointer-events-none"
              style={{ backgroundImage: `url(${artwork})` }}
            />
          )}

          {/* Crisp uncropped foreground artwork */}
          {artwork ? (
            <div className="relative w-full h-full z-10 flex items-center justify-center p-1.5">
              <Image
                src={artwork}
                alt={activeCreature.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-contain object-center drop-shadow-[0_8px_16px_rgba(0,0,0,0.65)] group-hover:scale-[1.03] transition-transform duration-500"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex items-center justify-center text-5xl z-10">
              {classMeta.icon || "🐉"}
            </div>
          )}

          {/* Gradient Overlay for bottom text legibility */}
          <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />

          {/* Floating Top Badges inside artwork */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-30 pointer-events-none">
            {activeCreature.isFavorite ? (
              <span className="px-2 py-0.5 rounded-md border border-amber-500/40 bg-slate-950/75 backdrop-blur-md text-amber-400 font-bold text-[10px] flex items-center gap-1 shadow-md">
                <Star size={10} className="fill-current" />
                <span>FAVORITE</span>
              </span>
            ) : <span />}

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

          {/* Bottom Title & Context Overlay */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 min-w-0 z-30">
            <div className="flex items-center justify-between gap-1.5">
              <p className="text-white font-black text-sm md:text-base truncate drop-shadow-md">
                {activeCreature.name}
              </p>
              {activeCreature.species && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/15 text-emerald-300 font-mono shrink-0 truncate max-w-[120px]">
                  {activeCreature.species}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-emerald-200/90 text-[10px] font-medium truncate">
              <span className="truncate">{activeCreature.sourceTitle}</span>
              {activeCreature.tags && activeCreature.tags[0] && (
                <>
                  <span className="opacity-40">·</span>
                  <span className="opacity-80 truncate">#{activeCreature.tags[0]}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="pt-2.5 border-t border-white/5 flex items-center justify-between shrink-0">
        <span className="text-[10px] theme-text-muted">
          {creatures.length} creature{creatures.length === 1 ? "" : "s"} archived
        </span>
        <Link
          href="/creatures"
          className="inline-flex items-center gap-1 text-xs font-bold transition-all hover:gap-1.5"
          style={{ color: isCyber ? "#39FF14" : "#059669" }}
        >
          <span>Bestiary</span>
          <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
