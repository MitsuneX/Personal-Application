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
            ? `linear-gradient(135deg, rgba(10,15,30,0.85) 0%, ${accent}12 100%)` 
            : "#FFFFFF",
          border: isCyber ? `1px solid ${accent}30` : "2.5px solid #000",
          boxShadow: isCyber 
            ? `0 10px 30px -10px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.08)` 
            : "5px 5px 0 rgba(0,0,0,1)",
        }}
        whileHover={{
          boxShadow: isCyber 
            ? `0 20px 40px -5px ${accent}35, 0 0 50px -10px ${accent}25, inset 0 1px 1px rgba(255,255,255,0.15)` 
            : "8px 8px 0 rgba(0,0,0,1)",
          y: -5,
          borderColor: isCyber ? `${accent}80` : "#000",
        }}
      >
        {/* Luxury Background Glow Core (Cyber Only) */}
        {isCyber && (
          <div 
            className="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[60px] opacity-25 pointer-events-none transition-all duration-500 group-hover:opacity-50" 
            style={{ backgroundColor: accent }}
          />
        )}

        {/* Action Controls */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEditClick(game);
          }}
          className="absolute top-4 right-4 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black/10 dark:hover:bg-white/10 z-20 cursor-pointer text-xs flex items-center justify-center backdrop-blur-md"
          style={{
            color: isCyber ? "#00F5FF" : "#000",
            border: isCyber ? "1px solid rgba(255,255,255,0.15)" : "1.5px solid #000",
            backgroundColor: isCyber ? "rgba(10,15,30,0.75)" : "#fff",
          }}
          title="Edit Configuration"
        >
          ⚙️
        </button>

        {/* Premium Geometric Borders & Sci-Fi Corner Brackets */}
        {!isCyber && <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: accent }} />}
        {isCyber && (
          <>
            <motion.div 
              className="absolute top-0 left-0 right-0 h-px" 
              style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} 
              animate={{ opacity: [0.3, 0.9, 0.3] }} 
              transition={{ duration: 3, repeat: Infinity }} 
            />
            {/* Sci-Fi HUD Corner Brackets */}
            <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2" style={{ borderColor: accent }} />
            <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2" style={{ borderColor: accent }} />
            <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2" style={{ borderColor: accent }} />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2" style={{ borderColor: accent }} />
          </>
        )}

        {/* Card Header Layout */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 select-none shadow-sm"
              style={{
                backgroundColor: isCyber ? `${accent}20` : accent,
                border: isCyber ? `1px solid ${accent}50` : `2.5px solid #000`,
                boxShadow: !isCyber ? "2px 2px 0 rgba(0,0,0,1)" : "none"
              }}
            >
              {game?.icon || CATEGORY_ICONS[gameCategory] || "🎮"}
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-sm tracking-tight leading-tight truncate pr-4" style={{ color: isCyber ? "#F8FAFC" : "#1A1A1A" }}>
                {gameTitle}
              </h3>
              <p className="text-[11px] font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1.5" style={{ color: isCyber ? `${accent}DD` : "#6B7280" }}>
                {isCyber && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accent }} />}
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
                background: isCyber ? `${tier.cyberColor}10` : `${tier.brutColor}10`, 
                border: isCyber ? `1px solid ${tier.cyberColor}30` : `2px solid #000` 
              }}
            >
              <span className="text-[9px] uppercase tracking-widest font-black opacity-70" style={{ color: isCyber ? tier.cyberColor : tier.brutColor }}>Rank</span>
              <span 
                className="font-black text-sm truncate tracking-tight"
                style={{ 
                  color: isCyber ? tier.cyberColor : tier.brutColor, 
                  textShadow: isCyber ? `0 0 10px ${tier.cyberGlow}` : "none" 
                }}
              >
                {rank}
              </span>
            </div>
          )}

          <div 
            className="flex flex-col gap-0.5 px-3.5 py-2.5 rounded-xl" 
            style={{ 
              background: isCyber ? `${accent}08` : `${accent}10`, 
              border: isCyber ? `1px solid ${accent}20` : `2px solid #000` 
            }}
          >
            <span className="text-[9px] uppercase tracking-widest font-black opacity-70" style={{ color: accent }}>Main</span>
            <span className="font-black text-xs md:text-sm truncate tracking-tight" style={{ color: isCyber ? "#F1F5F9" : "#1A1A1A" }}>
              {game?.mainCharacter || "—"}
            </span>
          </div>
        </div>

        {/* Footer Meta Segment */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-dashed border-slate-700/15 dark:border-slate-400/15">
          {game?.mainRole ? (
            <span 
              className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg"
              style={{ 
                background: isCyber ? `${accent}18` : `${accent}20`, 
                color: isCyber ? accent : "#1A1A1A", 
                border: isCyber ? `1px solid ${accent}35` : `1.5px solid #000` 
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
                  className="hover:scale-[1.03] active:scale-95 block transition-all"
                >
                  {isCyber ? (
                    <div
                      className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-md flex items-center gap-1.5 select-none"
                      style={{
                        border: `1px solid ${accent}90`,
                        boxShadow: `0 0 12px ${accent}40`,
                        color: "#00F5FF",
                        background: `${accent}20`,
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
                      border: `1px solid ${accent}50`,
                      color: "#94A3B8",
                      background: "rgba(255,255,255,0.05)",
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
  
  const games = useDashboardStore((s) => s.games) || [];

  // State Management for Interactive Filters & Search
  const [activeTab, setActiveTab] = useState<"all" | "gacha" | "competitive">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [gameToEdit, setGameToEdit] = useState<GameEntry | null>(null);

  // Filter games based on search text
  const filteredGames = useMemo(() => {
    if (!searchQuery.trim()) return games;
    const query = searchQuery.toLowerCase();
    return games.filter((g) => 
      g?.game?.toLowerCase().includes(query) ||
      g?.category?.toLowerCase().includes(query) ||
      g?.mainCharacter?.toLowerCase().includes(query) ||
      g?.mainRole?.toLowerCase().includes(query) ||
      g?.handle?.toLowerCase().includes(query) ||
      g?.rank?.toLowerCase().includes(query)
    );
  }, [games, searchQuery]);

  const gacha = useMemo(() => filteredGames.filter((g) => g?.category?.includes("Gacha")), [filteredGames]);
  const competitive = useMemo(() => filteredGames.filter((g) => g?.category && !g.category.includes("Gacha")), [filteredGames]);

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
          border: isCyber ? "1px solid rgba(99,102,241,0.3)" : "3px solid #000",
          boxShadow: isCyber ? "0 25px 55px rgba(0,0,0,0.5)" : "6px 6px 0 rgba(0,0,0,1)",
        }}
      >
        {isCyber && (
          <>
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, #6366f1 2px, #6366f1 3px)" }} />
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
          </>
        )}

        {/* Ambient Decorative Float Engine */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          {["🎮","⚔️","🎯","🎲"].map((icon, i) => (
            <motion.span key={i} className="absolute text-2xl opacity-10"
              style={{ left: `${12 + i * 24}%`, top: `${15 + (i % 2) * 40}%` }}
              animate={{ y: [0, -12, 0], rotate: [0, i % 2 === 0 ? 12 : -12, 0] }}
              transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
            >
              {icon}
            </motion.span>
          ))}
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <p className="text-[10px] font-black tracking-[0.3em] uppercase mb-2" style={{ color: isCyber ? "#6366F1" : "rgba(0,0,0,0.6)" }}>
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
                <b className="text-sm font-black" style={{ color: isCyber ? "#bf5fff" : "#000" }}>{games.filter(g => g?.category?.includes("Gacha")).length}</b> active gacha
              </span>
              <span className="opacity-30">•</span>
              <span className="flex items-center gap-1.5" style={{ color: isCyber ? "#94A3B8" : "#4b5563" }}>
                <b className="text-sm font-black" style={{ color: isCyber ? "#FF6B35" : "#000" }}>{games.filter(g => g?.category && !g.category.includes("Gacha")).length}</b> competitive
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
              boxShadow: isCyber ? "0 10px 25px rgba(0,245,255,0.35)" : "4px 4px 0 #000",
            }}
          >
            <span>➕</span> Add New Title
          </button>
        </div>

        {/* Mini Quick-Link Sub-Tray */}
        {games.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-slate-700/15 dark:border-slate-400/15 relative z-10">
            {games.filter((g) => g?.rank).map((g) => {
              const accent = g?.accentColor || "#7C3AED";
              return (
                <motion.div key={g.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold select-none cursor-pointer transition-colors"
                  style={{ 
                    background: isCyber ? "rgba(255,255,255,0.04)" : "#FFFFFF", 
                    border: isCyber ? `1px solid ${accent}40` : `2px solid #000`, 
                    color: isCyber ? "#E2E8F0" : "#1A1A1A",
                    boxShadow: !isCyber ? "2px 2px 0 rgba(0,0,0,1)" : "none"
                  }}
                  whileHover={{ y: -2, borderColor: accent }}
                  onClick={() => handleEditClick(g)}
                >
                  <span>{g?.icon || CATEGORY_ICONS[g?.category || ""] || "🎮"}</span>
                  <span style={{ color: accent }}>{g.rank}</span>
                  <span className="opacity-60 text-[11px] font-mono">— {g?.game?.split(":")[0]}</span>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Interactive Control Header Bar (Tabs + Live Search Input) */}
      <div 
        className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 p-3 rounded-2xl border backdrop-blur-md"
        style={{
          backgroundColor: isCyber ? "rgba(10, 15, 30, 0.5)" : "rgba(255, 255, 255, 0.85)",
          borderColor: isCyber ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)",
          boxShadow: isCyber ? "0 8px 32px rgba(0,0,0,0.3)" : "4px 4px 0 rgba(0,0,0,0.05)"
        }}
      >
        <div className="flex gap-1 w-full md:w-auto overflow-x-auto">
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
                className="px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer shrink-0"
                style={{
                  backgroundColor: isActive ? (isCyber ? "rgba(0, 245, 255, 0.15)" : "#000") : "transparent",
                  color: isActive ? (isCyber ? "#00F5FF" : "#FFF") : (isCyber ? "#94A3B8" : "#4B5563"),
                  border: isActive && isCyber ? "1px solid rgba(0,245,255,0.35)" : "1px solid transparent"
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Interactive Live Search Input Bar */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search titles, mains, handles..."
            className="w-full px-3.5 py-2 pl-9 text-xs rounded-xl outline-none transition-all"
            style={{
              backgroundColor: isCyber ? "rgba(255,255,255,0.04)" : "#FFFFFF",
              border: isCyber ? "1px solid rgba(255,255,255,0.12)" : "2px solid #000",
              color: isCyber ? "#F8FAFC" : "#1A1A1A",
              boxShadow: !isCyber ? "2px 2px 0 rgba(0,0,0,1)" : "none"
            }}
          />
          <span className="absolute left-3 top-2.5 text-xs opacity-50 select-none">🔍</span>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-xs opacity-60 hover:opacity-100 cursor-pointer font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Grid Iteration Render Blocks */}
      <AnimatePresence mode="popLayout">
        {filteredGames.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="py-20 text-center border border-dashed rounded-2xl border-slate-700/30 max-w-sm mx-auto"
          >
            <div className="text-3xl mb-2 grayscale opacity-40">🕹️</div>
            <h4 className="font-black text-slate-700 dark:text-slate-300 text-sm">No Active Registries Found</h4>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your active filter or search keywords.</p>
          </motion.div>
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