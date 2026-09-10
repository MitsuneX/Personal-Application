"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CreatureEntry,
  CREATURE_TIERS,
  CREATURE_TIER_META,
  getClassificationMeta,
} from "@/lib/data/creatureSchema";

interface HofCreatureTierListProps {
  creatures: CreatureEntry[];
  isCyber: boolean;
  onOpenCreatureProfile: (creature: CreatureEntry) => void;
}

export function HofCreatureTierList({
  creatures,
  isCyber,
  onOpenCreatureProfile,
}: HofCreatureTierListProps) {
  const shouldReduceMotion = useReducedMotion();

  // Group creatures by tier
  const tierGroups = React.useMemo(() => {
    const groups: Record<string, CreatureEntry[]> = {
      SS: [],
      S: [],
      A: [],
      B: [],
      C: [],
    };
    creatures.forEach((c) => {
      const tier = c.tier && groups[c.tier] ? c.tier : "S";
      groups[tier].push(c);
    });

    // Sort within tier by affection likes descending
    Object.keys(groups).forEach((tier) => {
      groups[tier].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    });

    return groups;
  }, [creatures]);

  return (
    <div className="space-y-6 font-mono">
      {/* Section Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3"
        style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0" }}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🐾</span>
          <div>
            <h2 className="text-lg font-black theme-text-primary tracking-tight">
              Bestiary Canonical Tier List
            </h2>
            <span className="text-xs theme-text-muted">
              Live Hall of Fame Creature Tiers (SS → C) · Read-Only Showcase
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="px-3 py-1 rounded-full text-[10px] font-bold border"
            style={{
              backgroundColor: isCyber ? "rgba(0,245,255,0.1)" : "#E0F2FE",
              borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000000",
              color: isCyber ? "#00F5FF" : "#0369A1",
            }}
          >
            🔒 Museum Archive Protected
          </span>
        </div>
      </div>

      {/* Tier Rows */}
      <div className="space-y-4">
        {CREATURE_TIERS.map((tier) => {
          const meta = CREATURE_TIER_META[tier];
          const list = tierGroups[tier] || [];

          return (
            <motion.div
              key={tier}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border overflow-hidden transition-all shadow-md"
              style={{
                backgroundColor: isCyber ? "rgba(8,12,26,0.85)" : "#FFFFFF",
                borderColor: isCyber ? `${meta.color}40` : "#000000",
                borderWidth: isCyber ? "1.5px" : "2.5px",
                boxShadow: isCyber
                  ? `0 0 20px ${meta.color}15`
                  : "3.5px 3.5px 0px #000000",
              }}
            >
              {/* Tier Row Header & Items Container */}
              <div className="flex flex-col md:flex-row min-h-[120px]">
                {/* Left Tier Header Pillar */}
                <div
                  className="w-full md:w-36 shrink-0 p-4 flex flex-col justify-center items-center text-center select-none border-b md:border-b-0 md:border-r"
                  style={{
                    backgroundColor: isCyber ? meta.bgCyber : meta.bgNeo,
                    borderColor: isCyber ? `${meta.color}40` : "#000000",
                    borderRightWidth: isCyber ? "1px" : "2.5px",
                    borderBottomWidth: isCyber ? "1px" : "2.5px",
                  }}
                >
                  <span
                    className="text-2xl sm:text-3xl font-black font-mono tracking-wider drop-shadow-sm"
                    style={{
                      color: isCyber ? meta.color : "#000000",
                      textShadow: isCyber ? `0 0 16px ${meta.color}80` : undefined,
                    }}
                  >
                    {tier} TIER
                  </span>
                  <span
                    className="text-[10px] uppercase font-bold mt-1 tracking-wider opacity-80"
                    style={{ color: isCyber ? meta.color : "#374151" }}
                  >
                    {meta.label}
                  </span>
                  <span className="text-[10px] font-mono mt-1 opacity-70">
                    {list.length} {list.length === 1 ? "Creature" : "Creatures"}
                  </span>
                </div>

                {/* Right Creatures Row / Grid */}
                <div className="flex-1 p-3.5 flex items-center">
                  {list.length === 0 ? (
                    <div className="w-full py-6 text-center text-xs opacity-40 font-mono italic">
                      No creatures currently placed in {tier} Tier
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 w-full">
                      {list.map((creature) => {
                        const classMeta = getClassificationMeta(creature.classification);
                        const artwork =
                          creature.media?.card ||
                          creature.media?.primary ||
                          creature.media?.gallery?.[0] ||
                          creature.avatarUrl;
                        const connectedCount = (creature.connectedCharacters || []).length;

                        return (
                          <motion.div
                            key={creature.id}
                            whileHover={shouldReduceMotion ? {} : { scale: 1.04, y: -2 }}
                            transition={{ duration: 0.18 }}
                            onClick={() => onOpenCreatureProfile(creature)}
                            className="group relative rounded-xl overflow-hidden cursor-pointer border transition-all flex flex-col justify-between"
                            style={{
                              backgroundColor: isCyber ? "rgba(5,8,20,0.9)" : "#F8FAFC",
                              borderColor: isCyber ? "rgba(255,255,255,0.12)" : "#000000",
                              borderWidth: isCyber ? "1px" : "2px",
                              boxShadow: isCyber
                                ? "0 4px 15px rgba(0,0,0,0.5)"
                                : "2px 2px 0 #000000",
                            }}
                          >
                            {/* Artwork Image */}
                            <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/40">
                              {artwork ? (
                                <img
                                  src={artwork}
                                  alt={creature.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl opacity-30">
                                  {classMeta.icon}
                                </div>
                              )}

                              {/* Classification Badge Overlay */}
                              <div className="absolute top-1.5 left-1.5 z-10">
                                <span
                                  className="px-1.5 py-0.5 rounded text-[9px] font-mono font-black border uppercase tracking-wider"
                                  style={{
                                    backgroundColor: isCyber ? "rgba(5,8,20,0.85)" : "#FFFFFF",
                                    borderColor: isCyber ? "rgba(0,245,255,0.4)" : "#000000",
                                    color: isCyber ? "#00F5FF" : "#000000",
                                  }}
                                >
                                  {classMeta.icon}
                                </span>
                              </div>

                              {/* Connected Indicator Chip */}
                              {connectedCount > 0 && (
                                <div className="absolute top-1.5 right-1.5 z-10">
                                  <span
                                    className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-black border"
                                    style={{
                                      backgroundColor: isCyber ? "rgba(168,85,247,0.85)" : "#F3E8FF",
                                      borderColor: isCyber ? "rgba(168,85,247,0.5)" : "#000000",
                                      color: isCyber ? "#FFFFFF" : "#6B21A8",
                                    }}
                                    title={`${connectedCount} connected characters`}
                                  >
                                    🔗 {connectedCount}
                                  </span>
                                </div>
                              )}

                              {/* Bottom Scrim */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />

                              {/* Likes indicator on image */}
                              <div className="absolute bottom-1.5 right-1.5 z-10">
                                <span className="px-1.5 py-0.5 rounded-md text-[9.5px] font-bold bg-pink-500/30 text-pink-300 border border-pink-500/40 backdrop-blur-sm flex items-center gap-1">
                                  <span>❤️</span>
                                  <span>{creature.likes || 0}</span>
                                </span>
                              </div>
                            </div>

                            {/* Info */}
                            <div className="p-2 min-w-0">
                              <h4
                                className="text-xs font-bold truncate font-mono"
                                style={{ color: isCyber ? "#FFFFFF" : "#000000" }}
                              >
                                {creature.name}
                              </h4>
                              <p
                                className="text-[9.5px] truncate font-mono mt-0.5 opacity-60"
                                style={{ color: isCyber ? "#94A3B8" : "#475569" }}
                              >
                                {creature.species || creature.originWork || "Bestiary"}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
