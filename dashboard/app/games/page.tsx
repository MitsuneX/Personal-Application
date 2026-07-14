"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
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
  "ER 75":  { brutColor: "#7B3FA8", cyberColor: "#A78BFA", cyberGlow: "rgba(167,139,250,0.6)" },
  "AR 55":  { brutColor: "#C97700", cyberColor: "#FCD34D", cyberGlow: "rgba(252,211,77,0.5)"  },
  "AR 60":  { brutColor: "#C97700", cyberColor: "#FCD34D", cyberGlow: "rgba(252,211,77,0.5)"  },
  "Mythic": { brutColor: "#8A0000", cyberColor: "#F87171", cyberGlow: "rgba(248,113,113,0.6)" },
  "Gold":   { brutColor: "#8A6200", cyberColor: "#FFD700", cyberGlow: "rgba(255,215,0,0.6)"   },
  "Hero":   { brutColor: "#0055AA", cyberColor: "#60A5FA", cyberGlow: "rgba(96,165,250,0.5)"  },
  "Saiyan": { brutColor: "#8A4A00", cyberColor: "#F97316", cyberGlow: "rgba(249,115,22,0.6)"  },
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
  const rank   = game.rank ?? "";
  const tier   = RANK_TIER[rank] ?? { brutColor: "#555", cyberColor: "#94A3B8", cyberGlow: "rgba(148,163,184,0.4)" };
  const accent = game.accentColor || "#7C3AED";

  return (
    <motion.div variants={cardVariants} custom={index}>
      <motion.div
        className="rounded-xl p-5 h-full flex flex-col gap-4 relative overflow-hidden group"
        style={{
          background: isCyber ? `${accent}08` : "#FFFFFF",
          border: isCyber ? `1px solid ${accent}35` : "2px solid #000",
          boxShadow: isCyber ? `0 0 25px ${accent}18, inset 0 0 20px ${accent}05` : "4px 4px 0 rgba(0,0,0,1)",
        }}
        whileHover={{
          boxShadow: isCyber ? `0 0 50px ${accent}40, 0 0 100px ${accent}15` : "7px 7px 0 rgba(0,0,0,1)",
          y: isCyber ? 0 : -4,
          scale: isCyber ? 1.01 : 1,
          transition: { duration: 0.2 },
        }}
      >
        {/* Settings gear icon on hover */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEditClick(game);
          }}
          className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-black/10 dark:hover:bg-white/10 z-20 cursor-pointer"
          style={{
            color: isCyber ? "#00F5FF" : "#000",
          }}
          title="Edit Title Config"
        >
          ⚙️
        </button>

        {/* Top accent strip */}
        {!isCyber && <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-xl" style={{ backgroundColor: accent }} />}
        {isCyber && (
          <>
            <motion.div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
            <motion.div className="absolute top-0 left-0 w-4 h-4" style={{ borderTop: `2px solid ${accent}`, borderLeft: `2px solid ${accent}` }} />
            <motion.div className="absolute bottom-0 right-0 w-4 h-4" style={{ borderBottom: `2px solid ${accent}`, borderRight: `2px solid ${accent}` }} />
          </>
        )}

        {/* Game header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <motion.div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0 select-none"
              animate={{
                backgroundColor: isCyber ? `${accent}18` : accent,
                boxShadow: isCyber ? `0 0 12px ${accent}60` : `3px 3px 0 rgba(0,0,0,1)`,
              }}
              transition={{ duration: 0.4 }}
            >
              {game.icon || CATEGORY_ICONS[game.category] || "🎮"}
            </motion.div>
            <div>
              <h3 className="font-black text-sm leading-tight pr-6" style={{ color: isCyber ? "#E0E8FF" : "#1A1A1A" }}>{game.game}</h3>
              <p className="text-xs" style={{ color: isCyber ? `${accent}AA` : "#6B7280" }}>{game.category}</p>
            </div>
          </div>

          {/* Platform & Optional Link Badges */}
          <div className="flex items-center gap-1.5 shrink-0 select-none">
            {game.profileLink && (
              <a
                href={game.profileLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition-all hover:scale-105 active:scale-95"
                style={{
                  background: isCyber ? `${accent}18` : `${accent}15`,
                  color: isCyber ? (isCyber ? "#00F5FF" : accent) : "#1A1A1A",
                  border: isCyber ? `1px solid ${accent}40` : `1.5px solid ${accent}`,
                }}
              >
                🔗 Link
              </a>
            )}
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
              style={{ background: isCyber ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)", color: isCyber ? "#94A3B8" : "#6B7280", border: isCyber ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.15)" }}>
              {game.platform}
            </span>
          </div>
        </div>

        {/* ── HUD Stats ── */}
        <div className="grid grid-cols-2 gap-2">
          {/* Rank */}
          {game.rank && (
            <div className="flex flex-col gap-0.5 px-3 py-2 rounded-lg" style={{ background: isCyber ? `${tier.cyberColor}10` : `${tier.brutColor}10`, border: isCyber ? `1px solid ${tier.cyberColor}30` : `1.5px solid ${tier.brutColor}` }}>
              <span className="text-[9px] uppercase tracking-widest font-bold opacity-80" style={{ color: isCyber ? `${tier.cyberColor}` : `${tier.brutColor}` }}>Rank</span>
              <motion.span className="font-black text-sm md:text-base truncate"
                style={{ color: isCyber ? tier.cyberColor : tier.brutColor, textShadow: isCyber ? `0 0 10px ${tier.cyberGlow}` : "none" }}
                animate={isCyber ? { textShadow: [`0 0 8px ${tier.cyberGlow}`, `0 0 16px ${tier.cyberGlow}`, `0 0 8px ${tier.cyberGlow}`] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {game.rank}
              </motion.span>
            </div>
          )}

          {/* Main character */}
          <div className="flex flex-col gap-0.5 px-3 py-2 rounded-lg" style={{ background: isCyber ? `${accent}08` : `${accent}12`, border: isCyber ? `1px solid ${accent}25` : `1.5px solid ${accent}` }}>
            <span className="text-[9px] uppercase tracking-widest font-bold opacity-80" style={{ color: isCyber ? `${accent}` : `${accent}` }}>Main</span>
            <span className="font-black text-xs md:text-sm truncate" style={{ color: isCyber ? "#E0E8FF" : "#1A1A1A" }}>{game.mainCharacter}</span>
          </div>
        </div>

        {/* Role + handle */}
        <div className="flex items-center justify-between mt-auto">
          {game.mainRole ? (
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg"
              style={{ background: isCyber ? `${accent}10` : `${accent}15`, color: isCyber ? accent : "#1A1A1A", border: isCyber ? `1px solid ${accent}30` : `1.5px solid ${accent}` }}>
              ⚡ {game.mainRole}
            </span>
          ) : (
            <span />
          )}

          {/* Micro-border highlight credential block */}
          {game.handle && (
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
                      className="px-2.5 py-1 text-[10px] md:text-xs font-mono font-bold rounded flex items-center gap-1 select-none"
                      style={{
                        border: `1px solid ${accent}`,
                        boxShadow: `0 0 8px ${accent}, inset 0 0 4px ${accent}40`,
                        color: "#00F5FF",
                        background: `${accent}15`,
                      }}
                    >
                      {game.handle} ↗
                    </div>
                  ) : (
                    <div className="relative inline-block">
                      <div
                        className="absolute inset-0 translate-x-[2px] translate-y-[2px] rounded"
                        style={{ backgroundColor: accent, border: "1.5px solid #000" }}
                      />
                      <div
                        className="relative px-2.5 py-1 text-[10px] md:text-xs font-mono font-bold bg-white rounded flex items-center gap-1"
                        style={{
                          border: "1.5px solid #000",
                          color: "#000",
                        }}
                      >
                        {game.handle} ↗
                      </div>
                    </div>
                  )}
                </a>
              ) : (
                isCyber ? (
                  <div
                    className="px-2.5 py-1 text-[10px] md:text-xs font-mono font-bold rounded select-none"
                    style={{
                      border: `1px solid ${accent}`,
                      boxShadow: `0 0 8px ${accent}, inset 0 0 4px ${accent}40`,
                      color: "#fff",
                      background: `${accent}10`,
                    }}
                  >
                    {game.handle}
                  </div>
                ) : (
                  <div className="relative inline-block">
                    <div
                      className="absolute inset-0 translate-x-[2px] translate-y-[2px] rounded"
                      style={{ backgroundColor: accent, border: "1.5px solid #000" }}
                    />
                    <div
                      className="relative px-2.5 py-1 text-[10px] md:text-xs font-mono font-bold bg-white rounded select-none"
                      style={{
                        border: "1.5px solid #000",
                        color: "#000",
                      }}
                    >
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
  const games = useDashboardStore((s) => s.games);

  // Modal States
  const [editorOpen, setEditorOpen] = useState(false);
  const [gameToEdit, setGameToEdit] = useState<GameEntry | null>(null);

  const gacha = games.filter((g) => g.category.includes("Gacha"));
  const other = games.filter((g) => !g.category.includes("Gacha"));

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
      {/* HUD Hero Banner */}
      <motion.div
        className="relative rounded-2xl overflow-hidden mb-8 p-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        style={{
          background: isCyber
            ? "linear-gradient(135deg, #050816, rgba(99,102,241,0.12), rgba(239,68,68,0.08))"
            : "linear-gradient(135deg, #FFF5E4, #FFE4B5)",
          border: isCyber ? "1px solid rgba(99,102,241,0.3)" : "3px solid #000",
          boxShadow: isCyber ? "0 0 60px rgba(99,102,241,0.2)" : "6px 6px 0 rgba(0,0,0,1)",
        }}
      >
        {/* Scanline (cyber) */}
        {isCyber && (
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(99,102,241,1) 2px, rgba(99,102,241,1) 3px)" }} />
        )}

        {/* Floating game icons */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          {["🎮","🕹️","⚔️","🎯","🏆","🎲"].map((icon, i) => (
            <motion.span key={i} className="absolute text-3xl opacity-10"
              style={{ left: `${10 + i * 15}%`, top: `${10 + (i % 3) * 30}%` }}
              animate={{ y: [0, -12, 0], rotate: [0, i % 2 === 0 ? 15 : -15, 0] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
            >
              {icon}
            </motion.span>
          ))}
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <motion.p className="text-xs font-bold tracking-[0.25em] uppercase mb-2"
              animate={{ color: isCyber ? "rgba(99,102,241,0.8)" : "rgba(0,0,0,0.5)" }} transition={{ duration: 0.4 }}>
              {isCyber ? "// PLAYER.PROFILE" : "Game Library"}
            </motion.p>
            <motion.h1 className="font-black text-3xl md:text-5xl mb-2"
              animate={{ color: isCyber ? "#E0E8FF" : "#1A1A1A", fontFamily: isCyber ? "var(--font-orbitron)" : "inherit", textShadow: isCyber ? "0 0 20px rgba(99,102,241,0.8)" : "none" }}
              transition={{ duration: 0.4 }}>
              {isCyber ? "GAME REGISTRY" : "🎮 My Games"}
            </motion.h1>
            <p className="text-sm opacity-60 font-medium" style={{ color: isCyber ? "#E0E8FF" : "#1A1A1A" }}>
              {games.length} active titles • {gacha.length} gacha • {other.length} competitive
            </p>
          </div>

          <button
            onClick={handleAddClick}
            className="px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 select-none shrink-0"
            style={{
              background: isCyber ? "linear-gradient(135deg, #00F5FF, #bf5fff)" : "#FF6B35",
              color: "#fff",
              border: isCyber ? "none" : "2.5px solid #000",
              boxShadow: isCyber ? "0 0 15px rgba(0,245,255,0.4)" : "4px 4px 0 #000",
            }}
          >
            <span>➕</span> Add New Title
          </button>
        </div>

        {/* Quick rank display */}
        <div className="flex flex-wrap gap-2 mt-5 relative z-10">
          {games.filter((g) => g.rank).map((g) => (
            <motion.div key={g.id}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold select-none cursor-pointer"
              style={{ background: isCyber ? `${g.accentColor}15` : `${g.accentColor}20`, border: isCyber ? `1px solid ${g.accentColor}40` : `1.5px solid ${g.accentColor}`, color: isCyber ? "#E0E8FF" : "#1A1A1A" }}
              whileHover={{ scale: 1.05 }}
              onClick={() => handleEditClick(g)}
            >
              <span>{g.icon || CATEGORY_ICONS[g.category] || "🎮"}</span>
              <span style={{ color: g.accentColor }}>{g.rank}</span>
              <span className="opacity-60">— {g.game.split(":")[0]}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Gacha section */}
      <div className="mb-8">
        <motion.h2 className="font-black text-lg mb-4 flex items-center gap-2"
          animate={{ color: isCyber ? "#E0E8FF" : "#1A1A1A", fontFamily: isCyber ? "var(--font-orbitron)" : "inherit" }} transition={{ duration: 0.4 }}>
          <span>🎲</span>
          {isCyber ? "GACHA.GAMES" : "Gacha Games"}
        </motion.h2>
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" variants={gridContainerVariants} initial="hidden" animate="visible">
          {gacha.map((g, i) => (
            <GameCard 
              key={g.id} 
              game={g} 
              isCyber={isCyber} 
              index={i} 
              onEditClick={handleEditClick} 
            />
          ))}
        </motion.div>
      </div>

      {/* Competitive section */}
      <div>
        <motion.h2 className="font-black text-lg mb-4 flex items-center gap-2"
          animate={{ color: isCyber ? "#E0E8FF" : "#1A1A1A", fontFamily: isCyber ? "var(--font-orbitron)" : "inherit" }} transition={{ duration: 0.4 }}>
          <span>🏆</span>
          {isCyber ? "COMPETITIVE.ROSTER" : "Competitive Games"}
        </motion.h2>
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" variants={gridContainerVariants} initial="hidden" animate="visible">
          {other.map((g, i) => (
            <GameCard 
              key={g.id} 
              game={g} 
              isCyber={isCyber} 
              index={i} 
              onEditClick={handleEditClick} 
            />
          ))}
        </motion.div>
      </div>

      {/* Game Customizer Modal */}
      <GameEditorModal 
        isOpen={editorOpen} 
        onClose={() => setEditorOpen(false)} 
        gameToEdit={gameToEdit} 
      />
    </AppShell>
  );
}

