"use client";

import React from "react";
import { motion } from "framer-motion";
import { HallOfFameEntry } from "@/lib/store/dashboardStore";
import { HofEntryCard, getGroupForEntry, getGroupDetails } from "@/components/cards/HofEntryCard";
import { getPrestigeTier } from "@/lib/utils/hofEngine";

interface HofPodiumSectionProps {
  top1?: HallOfFameEntry;
  top2?: HallOfFameEntry;
  top3?: HallOfFameEntry;
  isCyber: boolean;
  onOpenProfile: (entry: HallOfFameEntry) => void;
  onCompare: (entry: HallOfFameEntry) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export function HofPodiumSection({
  top1,
  top2,
  top3,
  isCyber,
  onOpenProfile,
  onCompare,
  onContextMenu,
}: HofPodiumSectionProps) {
  return (
    <div onContextMenu={onContextMenu} className="space-y-6 relative py-4">
      {/* ── CSS Keyframe animations for luxury border & shine sweep ── */}
      <style jsx global>{`
        @keyframes goldShine {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes borderLoopGold {
          0%, 100% { border-color: #FFD700; box-shadow: 0 0 25px rgba(255, 215, 0, 0.4); }
          33% { border-color: #FF8C00; box-shadow: 0 0 35px rgba(255, 140, 0, 0.5); }
          66% { border-color: #FFE57F; box-shadow: 0 0 25px rgba(255, 229, 127, 0.4); }
        }
        @keyframes borderLoopSilver {
          0%, 100% { border-color: #E2E8F0; box-shadow: 0 0 20px rgba(226, 232, 240, 0.3); }
          50% { border-color: #94A3B8; box-shadow: 0 0 25px rgba(148, 163, 184, 0.4); }
        }
        @keyframes borderLoopBronze {
          0%, 100% { border-color: #D97706; box-shadow: 0 0 18px rgba(217, 119, 6, 0.3); }
          50% { border-color: #B45309; box-shadow: 0 0 22px rgba(180, 83, 9, 0.4); }
        }
        @keyframes floatCrown {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(-2deg); }
        }
      `}</style>

      {/* Main Podium Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end justify-items-center max-w-5xl mx-auto pt-6">
        {/* 🥈 RANK #2 SILVER PODIUM */}
        {top2 ? (
          <motion.div
            key={top2.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full flex flex-col items-center order-2 md:order-1 max-w-[280px] group"
          >
            <div className="relative w-full flex flex-col items-center">
              {/* Silver Crown Header */}
              <div
                className="mb-2 px-3.5 py-1 rounded-full text-xs font-black font-mono bg-slate-200 text-slate-900 border-2 border-slate-400 z-10 shadow-lg flex items-center gap-1.5"
                style={{ animation: "floatCrown 4s ease-in-out infinite" }}
              >
                <span>🥈</span>
                <span>SILVER CHAMPION</span>
              </div>

              {/* Card Container with Silver Glow */}
              <div
                className="rounded-3xl p-1 w-full relative transition-all duration-300"
                style={{
                  animation: "borderLoopSilver 6s infinite ease-in-out",
                  borderWidth: "2px",
                }}
              >
                {/* Floating Diamond Sparkles */}
                <span className="absolute -top-2 -right-2 text-base animate-bounce z-20">💎</span>

                <HofEntryCard
                  entry={top2}
                  idx={1}
                  isCyber={isCyber}
                  group={getGroupDetails(getGroupForEntry(top2))}
                  podiumRank={2}
                  onOpenProfile={onOpenProfile}
                  onCompare={onCompare}
                />
              </div>

              {/* 3D Engraved Silver Podium Base */}
              <div
                className="w-full h-14 mt-3 rounded-b-2xl border-2 border-slate-400 flex flex-col items-center justify-center font-mono relative overflow-hidden shadow-xl"
                style={{
                  background: isCyber
                    ? "linear-gradient(180deg, rgba(148,163,184,0.3) 0%, rgba(30,41,59,0.8) 100%)"
                    : "linear-gradient(180deg, #E2E8F0 0%, #94A3B8 100%)",
                }}
              >
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px]" />
                <span className="text-xl font-black text-slate-300 drop-shadow-[1px_1px_0_#000]">#2</span>
                <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">SILVER PODIUM</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="hidden md:block w-full max-w-[280px] order-2 md:order-1" />
        )}

        {/* 👑 RANK #1 GOLD REIGNING CHAMPION PODIUM */}
        {top1 ? (
          <motion.div
            key={top1.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full flex flex-col items-center order-1 md:order-2 max-w-[290px] z-30 group"
          >
            <div className="relative w-full flex flex-col items-center">
              {/* Gold Ambient Spotlight Backlight */}
              <div
                className="absolute -inset-4 rounded-full blur-2xl opacity-40 pointer-events-none"
                style={{
                  background: "radial-gradient(circle, rgba(255,215,0,0.6) 0%, rgba(245,158,11,0.2) 60%, transparent 100%)",
                }}
              />

              {/* Floating Crown Ribbon Header */}
              <div
                className="mb-2 px-4 py-1.5 rounded-full text-xs font-black font-mono bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-black border-2 border-black shadow-[0_0_30px_rgba(245,158,11,0.8)] flex items-center gap-1.5 z-20"
                style={{ animation: "floatCrown 3.5s ease-in-out infinite" }}
              >
                <span className="text-sm">👑</span>
                <span className="tracking-wider">REIGNING GRAND CHAMPION</span>
                <span className="text-sm">👑</span>
              </div>

              {/* Card Container with Gold Infinite Animated Border */}
              <div
                className="rounded-3xl p-1.5 w-full relative transition-all duration-300"
                style={{
                  animation: "borderLoopGold 5s infinite ease-in-out",
                  borderWidth: "3px",
                }}
              >
                {/* Floating Gold Sparkles */}
                <span className="absolute -top-3 -left-3 text-lg animate-spin z-20">✨</span>
                <span className="absolute -bottom-3 -right-3 text-lg animate-pulse z-20">🌟</span>

                <HofEntryCard
                  entry={top1}
                  idx={0}
                  isCyber={isCyber}
                  group={getGroupDetails(getGroupForEntry(top1))}
                  podiumRank={1}
                  onOpenProfile={onOpenProfile}
                  onCompare={onCompare}
                />
              </div>

              {/* 3D Engraved Gold Podium Base */}
              <div
                className="w-full h-18 mt-3 rounded-b-2xl border-2 border-amber-500 flex flex-col items-center justify-center font-mono relative overflow-hidden shadow-2xl"
                style={{
                  background: isCyber
                    ? "linear-gradient(180deg, rgba(255,215,0,0.4) 0%, rgba(120,53,15,0.9) 100%)"
                    : "linear-gradient(180deg, #FEF08A 0%, #D97706 100%)",
                }}
              >
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px]" />
                <span className="text-2xl font-black text-amber-200 drop-shadow-[2px_2px_0_#000]">#1</span>
                <span className="text-[10px] font-bold tracking-widest text-black uppercase">GRAND CHAMPION PLATFORM</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="hidden md:block w-full max-w-[280px] order-1 md:order-2" />
        )}

        {/* 🥉 RANK #3 BRONZE PODIUM */}
        {top3 ? (
          <motion.div
            key={top3.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full flex flex-col items-center order-3 max-w-[280px] group"
          >
            <div className="relative w-full flex flex-col items-center">
              {/* Bronze Crown Header */}
              <div
                className="mb-2 px-3.5 py-1 rounded-full text-xs font-black font-mono bg-amber-800 text-amber-100 border-2 border-amber-900 z-10 shadow-lg flex items-center gap-1.5"
                style={{ animation: "floatCrown 4.5s ease-in-out infinite" }}
              >
                <span>🥉</span>
                <span>BRONZE CHAMPION</span>
              </div>

              {/* Card Container with Bronze Glow */}
              <div
                className="rounded-3xl p-1 w-full relative transition-all duration-300"
                style={{
                  animation: "borderLoopBronze 6s infinite ease-in-out",
                  borderWidth: "2px",
                }}
              >
                <HofEntryCard
                  entry={top3}
                  idx={2}
                  isCyber={isCyber}
                  group={getGroupDetails(getGroupForEntry(top3))}
                  podiumRank={3}
                  onOpenProfile={onOpenProfile}
                  onCompare={onCompare}
                />
              </div>

              {/* 3D Engraved Bronze Podium Base */}
              <div
                className="w-full h-14 mt-3 rounded-b-2xl border-2 border-amber-800 flex flex-col items-center justify-center font-mono relative overflow-hidden shadow-xl"
                style={{
                  background: isCyber
                    ? "linear-gradient(180deg, rgba(217,119,6,0.3) 0%, rgba(69,26,3,0.8) 100%)"
                    : "linear-gradient(180deg, #FDE68A 0%, #B45309 100%)",
                }}
              >
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px]" />
                <span className="text-xl font-black text-amber-300 drop-shadow-[1px_1px_0_#000]">#3</span>
                <span className="text-[9px] font-bold tracking-widest text-amber-200 uppercase">BRONZE PODIUM</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="hidden md:block w-full max-w-[280px] order-3" />
        )}
      </div>
    </div>
  );
}
