"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { gridContainerVariants, cardVariants } from "@/lib/theme/motionVariants";
import { GameEditorModal } from "@/components/ui/GameEditorModal";
import type { GameEntry } from "@/lib/store/dashboardStore";

const CATEGORY_ICONS: Record<string, string> = {
  "Gacha RPG":    "🎲",
  "Gacha Action": "⚡",
  "MOBA":         "🗺️",
  "FPS":          "🎯",
  "Action RPG":   "⚔️",
  "Fighting":     "🥊",
};

const RANK_TIER: Record<string, { brutColor: string; cyberColor: string; cyberGlow: string }> = {
  "ER 75":  { brutColor: "#7B3FA8", cyberColor: "#A78BFA", cyberGlow: "rgba(167,139,250,0.4)" },
  "AR 55":  { brutColor: "#C97700", cyberColor: "#FCD34D", cyberGlow: "rgba(252,211,77,0.3)"  },
  "AR 60":  { brutColor: "#C97700", cyberColor: "#FCD34D", cyberGlow: "rgba(252,211,77,0.3)"  },
  "Mythic": { brutColor: "#8A0000", cyberColor: "#F87171", cyberGlow: "rgba(248,113,113,0.4)" },
  "Gold":   { brutColor: "#8A6200", cyberColor: "#FFD700", cyberGlow: "rgba(255,215,0,0.4)"   },
  "Hero":   { brutColor: "#0055AA", cyberColor: "#60A5FA", cyberGlow: "rgba(96,165,250,0.3)"  },
  "Saiyan": { brutColor: "#8A4A00", cyberColor: "#F97316", cyberGlow: "rgba(249,115,22,0.4)"   },
};

function GameCard({ 
  game, 
  isCyber, 
  index,
  onEditClick 
}: { 
  game: GameEntry; 
  isCyber: boolean; 
  index: number;
  onEditClick: (game: GameEntry) => void;
}) {
  // Defensive fallbacks to prevent runtime crashes if fields are missing
  const rank = game?.rank || "";
  const tier = RANK_TIER[rank] || { brutColor: "#555", cyberColor: "#94A3B8", cyberGlow: "rgba(148,163,184,0.2)" };
  const accent = game?.accentColor || "#7C3AED";
  const gameTitle = game?.game || "Unknown Title";
  const gameCategory = game?.category || "General";

  return (
    <motion.div variants={cardVariants} custom={index} layout>
      <motion.div
        className="rounded-2xl p-6 h-full flex flex-col gap-5 relative overflow-hidden group transition-all duration-300"
        style={{
          background: isCyber 
            ? `linear-gradient(135deg, rgba(10,15,30,0.7) 0%, ${accent}08 100%)` 
            : "#FFFFFF",
          border: isCyber ? `1px solid ${accent}25` : "2.5px solid #000",
          boxShadow: isCyber 
            ? `0 10px 30px -10px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.05)` 
            : "5px 5px 0 rgba(0,0,0,1)",
        }}
        whileHover={{
          boxShadow: isCyber 
            ? `0 20px 40px -5px ${accent}25, 0 0 50px -10px ${accent}15, inset 0 1px 1px rgba(255,255,255,0.1)` 
            : "8px 8px 0 rgba(0,0,0,1)",
          y: -4,
          borderColor: isCyber ? `${accent}60` : "#000",
        }}
      >
        {/* Luxury Background Glow Core (Cyber Only) */}
        {isCyber && (
          <div 
            className="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[60px] opacity-20 pointer-events-none transition-all duration-500 group-hover:opacity-40" 
            style={{ backgroundColor: accent }}
          />
        )}

        {/* Action Controls - Fades in naturally on hover */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEditClick(game);
          }}
          className="absolute top-4 right-4 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black/10 dark:hover:bg-white/10 z-20 cursor-pointer text-xs flex items-center justify-center backdrop-blur-md"
          style={{
            color: isCyber ? "#00F5FF" : "#000",
            border: isCyber ? "1px solid rgba(255,255,255,0.1)" : "1.5px solid #000",
            backgroundColor: isCyber ? "rgba(10,15,30,0.6)" : "#fff",
          }}
          title="Edit Configuration"
        >
          ⚙️
        </button>

        {/* Premium Geometric Borders */}
        {!isCyber && <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: accent }} />}
        {isCyber && (
          <>
            <motion.div 
              className="absolute top-0 left-0 right-0 h-px" 
              style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} 
              animate={{ opacity: [0.3, 0.8, 0.3] }} 
              transition={{ duration: 3, repeat: Infinity }} 
            />
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l" style={{ borderColor: `${accent}AA` }} />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r" style={{ borderColor: `${accent}AA` }} />
          </>
        )}

        {/* Card Header Layout */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 select-none shadow-sm"
              style={{
                backgroundColor: isCyber ? `${accent}18` : accent,
                border: isCyber ? `1px solid ${accent}40` : `2.5px solid #000`,
                boxShadow: !isCyber ? "2px 2px 0 rgba(0,0,0,1)" : "none"
              }}
            >
              {game?.icon || CATEGORY_ICONS[gameCategory] || "🎮"}
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-sm tracking-tight leading-tight truncate pr-4" style={{ color: isCyber ? "#E2E8F0" : "#1A1A1A" }}>
                {gameTitle}
              </h3>
              <p className="text-[11px] font-bold uppercase tracking-wider mt-0.5" style={{ color: isCyber ? `${accent}CC` : "#6B7280" }}>
                {gameCategory}
              </p>
            </div>
          </div>
        </div>

        {/* HUD Data Matrix Blocks */}
        <div className="grid grid-cols-2 gap-2.5 my-1">
          {rank && (
            <div 
              className="flex flex-col gap-0.5 px-3.5 py-2.5 rounded-xl transition-colors" 
              style={{ 
                background: isCyber ? `${tier.cyberColor}08` : `${tier.brutColor}08`, 
                border: isCyber ? `1px solid ${tier.cyberColor}20` : `2px solid #000` 
              }}
            >
              <span className="text-[9px] uppercase tracking-widest font-black opacity-60" style={{ color: isCyber ? tier.cyberColor : tier.brutColor }}>Rank</span>
              <span 
                className="font-black text-sm truncate tracking-tight"
                style={{ 
                  color: isCyber ? tier.cyberColor : tier.brutColor, 
                  textShadow: isCyber ? `0 0 8px ${tier.cyberGlow}` : "none" 
                }}
              >
                {rank}
              </span>
            </div>
          )}

          <div 
            className="flex flex-col gap-0.5 px-3.5 py-2.5 rounded-xl" 
            style={{ 
              background: isCyber ? `${accent}05` : `${accent}08`, 
              border: isCyber ? `1px solid ${accent}15` : `2px solid #000` 
            }}
          >
            <span className="text-[9px] uppercase tracking-widest font-black opacity-60" style={{ color: accent }}>Main</span>
            <span className="font-black text-xs md:text-sm truncate tracking-tight" style={{ color: isCyber ? "#F1F5F9" : "#1A1A1A" }}>
              {game?.mainCharacter || "—"}
            </span>
          </div>
        </div>

        {/* Footer Meta Segment */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-dashed border-slate-700/10 dark:border-slate-400/10">
          {game?.mainRole ? (
            <span 
              className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg"
              style={{ 
                background: isCyber ? `${accent}12` : `${accent}15`, 
                color: isCyber ? accent : "#1A1A1A", 
                border: isCyber ? `1px solid ${accent}25` : `1.5px solid #000` 
              }}
            >
              🥋 {game.mainRole}
            </span>
          ) : (
            <span />
          )}

          {game?.handle && (
            <div className="relative z-10 shrink-0">
              {game.profileLink ? (
                <a
                  href={game.profileLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-[1.02] active:scale-98 block transition-all"
                >
                  {isCyber ? (
                    <div
                      className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-md flex items-center gap-1.5 select-none"
                      style={{
                        border: `1px solid ${accent}80`,
                        boxShadow: `0 0 10px ${accent}30`,
                        color: "#00F5FF",
                        background: `${accent}15`,
                      }}
                    >
                      {game.handle} ↗
                    </div>
                  ) : (
                    <div className="relative inline-block">
                      <div className="absolute inset-0 translate-x-[2px] translate-y-[2px] rounded" style={{ backgroundColor: accent, border: "1.5px solid #000" }} />
                      <div className="relative px-2.5 py-1 text-[10px] font-mono font-bold bg-white rounded flex items-center gap-1" style={{ border: "1.5px solid #000", color: "#000" }}>
                        {game.handle} ↗
                      </div>
                    </div>
                  )}
                </a>
              ) : (
                isCyber ? (
                  <div
                    className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-md select-none"
                    style={{
                      border: `1px solid ${accent}40`,
                      color: "#94A3B8",
                      background: "rgba(255,255,255,0.03)",
                    }}
                  >
                    {game.handle}
                  </div>
                ) : (
                  <div className="relative inline-block">
                    <div className="absolute inset-0 translate-x-[2px] translate-y-[2px] rounded" style={{ backgroundColor: accent, border: "1.5px solid #000" }} />
                    <div className="relative px-2.5 py-1 text-[10px] font-mono font-bold bg-white rounded select-none" style={{ border: "1.5px solid #000", color: "#000" }}>
                      {game.handle}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function GamesPage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  
  // Safe extraction with fallback empty arrays to guarantee no map execution failures
  const games = useDashboardStore((s) => s.games) || [];

  // Active Category Quick Filter State
  const [activeTab, setActiveTab] = useState<"all" | "gacha" | "competitive">("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [gameToEdit, setGameToEdit] = useState<GameEntry | null>(null);

  // Safe memoized parsing of structural categories
  const gacha = useMemo(() => games.filter((g) => g?.category?.includes("Gacha")), [games]);
  const competitive = useMemo(() => games.filter((g) => g?.category && !g.category.includes("Gacha")), [games]);

  const handleEditClick = (game: GameEntry) => {
    setGameToEdit(game);
    setEditorOpen(true);
  };

  const handleAddClick = () => {
    setGameToEdit(null);
    setEditorOpen(true);
  };

  return (
    <AppShell>
      {/* HUD Hero Banner Grid */}
      <motion.div
        className="relative rounded-2xl overflow-hidden mb-8 p-8 md:p-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
        style={{
          background: isCyber
            ? "linear-gradient(135deg, #060919 0%, #0d1536 50%, #040612 100%)"
            : "linear-gradient(135deg, #FFF6E9 0%, #FFE4B5 100%)",
          border: isCyber ? "1px solid rgba(99,102,241,0.25)" : "3px solid #000",
          boxShadow: isCyber ? "0 25px 55px rgba(0,0,0,0.4)" : "6px 6px 0 rgba(0,0,0,1)",
        }}
      >
        {isCyber && (
          <>
            <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, #6366f1 2px, #6366f1 3px)" }} />
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
          </>
        )}

        {/* Ambient Decorative Float Engine */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          {["🎮","⚔️","🎯","🎲"].map((icon, i) => (
            <motion.span key={i} className="absolute text-2xl opacity-10"
              style={{ left: `${15 + i * 22}%`, top: `${20 + (i % 2) * 35}%` }}
              animate={{ y: [0, -10, 0], rotate: [0, i % 2 === 0 ? 10 : -10, 0] }}
              transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
            >
              {icon}
            </motion.span>
          ))}
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <p className="text-[10px] font-black tracking-[0.3em] uppercase mb-2" style={{ color: isCyber ? "#6366F1" : "rgba(0,0,0,0.5)" }}>
              {isCyber ? "SYSTEM // DATABASE_ENG" : "Game Registry Container"}
            </p>
            <h1 className="font-black text-3xl md:text-5xl tracking-tight mb-3"
              style={{ 
                color: isCyber ? "#F8FAFC" : "#1A1A1A", 
                fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
                letterSpacing: "-0.02em"
              }}
            >
              {isCyber ? "MODULE.TITLES" : "My Games Library"}
            </h1>
            
            {/* Multi-Matrix Data Stats Counter Block */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 items-center text-xs font-mono">
              <span className="flex items-center gap-1.5" style={{ color: isCyber ? "#94A3B8" : "#4b5563" }}>
                <b className="text-sm font-black" style={{ color: isCyber ? "#00F5FF" : "#000" }}>{games.length}</b> titles indexed
              </span>
              <span className="opacity-30">•</span>
              <span className="flex items-center gap-1.5" style={{ color: isCyber ? "#94A3B8" : "#4b5563" }}>
                <b className="text-sm font-black" style={{ color: isCyber ? "#bf5fff" : "#000" }}>{gacha.length}</b> active gacha
              </span>
              <span className="opacity-30">•</span>
              <span className="flex items-center gap-1.5" style={{ color: isCyber ? "#94A3B8" : "#4b5563" }}>
                <b className="text-sm font-black" style={{ color: isCyber ? "#FF6B35" : "#000" }}>{competitive.length}</b> competitive
              </span>
            </div>
          </div>

          <button
            onClick={handleAddClick}
            className="px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 select-none shrink-0 shadow-lg cursor-pointer"
            style={{
              background: isCyber ? "linear-gradient(135deg, #00F5FF, #bf5fff)" : "#FF6B35",
              color: "#fff",
              border: isCyber ? "none" : "2.5px solid #000",
              boxShadow: isCyber ? "0 10px 25px rgba(0,245,255,0.3)" : "4px 4px 0 #000",
            }}
          >
            <span>➕</span> Add New Title
          </button>
        </div>

        {/* Mini Quick-Link Sub-Tray */}
        {games.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-slate-700/10 dark:border-slate-400/10 relative z-10">
            {games.filter((g) => g?.rank).map((g) => {
              const accent = g?.accentColor || "#7C3AED";
              return (
                <motion.div key={g.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold select-none cursor-pointer transition-colors"
                  style={{ 
                    background: isCyber ? "rgba(255,255,255,0.03)" : "#FFFFFF", 
                    border: isCyber ? `1px solid ${accent}40` : `2px solid #000`, 
                    color: isCyber ? "#E2E8F0" : "#1A1A1A",
                    boxShadow: !isCyber ? "2px 2px 0 rgba(0,0,0,1)" : "none"
                  }}
                  whileHover={{ y: -2, borderColor: accent }}
                  onClick={() => handleEditClick(g)}
                >
                  <span>{g?.icon || CATEGORY_ICONS[g?.category || ""] || "🎮"}</span>
                  <span style={{ color: accent }}>{g.rank}</span>
                  <span className="opacity-50 text-[11px] font-mono">— {g?.game?.split(":")[0]}</span>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Luxury Filter Control Header Bar */}
      <div 
        className="flex justify-between items-center mb-6 p-2 rounded-xl border backdrop-blur-md"
        style={{
          backgroundColor: isCyber ? "rgba(10, 15, 30, 0.4)" : "rgba(255, 255, 255, 0.8)",
          borderColor: isCyber ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)",
        }}
      >
        <div className="flex gap-1">
          {([
            { id: "all", label: "All Index" },
            { id: "gacha", label: "Gacha Matrices" },
            { id: "competitive", label: "Pro Rosters" }
          ] as const).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer"
                style={{
                  backgroundColor: isActive ? (isCyber ? "rgba(0, 245, 255, 0.12)" : "#000") : "transparent",
                  color: isActive ? (isCyber ? "#00F5FF" : "#FFF") : (isCyber ? "#94A3B8" : "#4B5563"),
                  border: isActive && isCyber ? "1px solid rgba(0,245,255,0.3)" : "1px solid transparent"
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Iteration Render Blocks */}
      <AnimatePresence mode="popLayout">
        {games.length === 0 ? (
          <div className="py-20 text-center border border-dashed rounded-2xl border-slate-700/20 max-w-sm mx-auto">
            <div className="text-3xl mb-2 grayscale opacity-40">🕹️</div>
            <h4 className="font-black text-slate-700 dark:text-slate-300 text-sm">No Active Registries Found</h4>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {/* Gacha Section Wrapper */}
            {(activeTab === "all" || activeTab === "gacha") && gacha.length > 0 && (
              <motion.div layout>
                <motion.h2 className="font-black text-md tracking-wider uppercase mb-4 flex items-center gap-2"
                  style={{ color: isCyber ? "#94A3B8" : "#1A1A1A", fontFamily: isCyber ? "var(--font-orbitron)" : "inherit" }}>
                  <span className="text-base">🎲</span> {isCyber ? "ROSTER.GACHA_UNITS" : "Gacha Games"}
                </motion.h2>
                <motion.div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5" variants={gridContainerVariants} initial="hidden" animate="visible">
                  {gacha.map((g, i) => (
                    <GameCard key={g.id} game={g} isCyber={isCyber} index={i} onEditClick={handleEditClick} />
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* Competitive Section Wrapper */}
            {(activeTab === "all" || activeTab === "competitive") && competitive.length > 0 && (
              <motion.div layout>
                <motion.h2 className="font-black text-md tracking-wider uppercase mb-4 flex items-center gap-2"
                  style={{ color: isCyber ? "#94A3B8" : "#1A1A1A", fontFamily: isCyber ? "var(--font-orbitron)" : "inherit" }}>
                  <span className="text-base">🏆</span> {isCyber ? "ROSTER.COMPETITIVE_UNITS" : "Competitive Games"}
                </motion.h2>
                <motion.div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5" variants={gridContainerVariants} initial="hidden" animate="visible">
                  {competitive.map((g, i) => (
                    <GameCard key={g.id} game={g} isCyber={isCyber} index={i} onEditClick={handleEditClick} />
                  ))}
                </motion.div>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* Editor Modal Anchor */}
      <GameEditorModal 
        isOpen={editorOpen} 
        onClose={() => setEditorOpen(false)} 
        gameToEdit={gameToEdit} 
      />
    </AppShell>
  );
}