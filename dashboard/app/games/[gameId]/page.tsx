"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { BentoCard } from "@/components/cards/BentoCard";
import { useTheme } from "@/lib/theme";
import { gridContainerVariants, cardVariants } from "@/lib/theme/motionVariants";
import { useDashboardStore, DossierCharacterEntry } from "@/lib/store/dashboardStore";
import { resolveGameIcon } from "@/lib/data/gameIcons";
import { getGameDossierConfig } from "@/lib/data/gameDossierConfig";
import { DossierCharacterEditorModal } from "@/components/ui/DossierCharacterEditorModal";
import { GameEditorModal } from "@/components/ui/GameEditorModal";
import { ImageLightboxModal } from "@/components/ui/ImageLightboxModal";
import { GameScannerModal } from "@/components/ui/GameScannerModal";

export default function GameDossierPage({ params }: { params: Promise<{ gameId: string }> }) {
  const resolvedParams = use(params);
  const gameId = resolvedParams.gameId;

  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const games = useDashboardStore((s) => s.games) || [];
  const dossierCharacters = useDashboardStore((s) => s.dossierCharacters) || [];
  const currentGame = games.find((g) => g.id === gameId);

  // Modal States
  const [isCharModalOpen, setIsCharModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<DossierCharacterEntry | null>(null);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Active Category Filter
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("ALL");

  if (!currentGame) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
          <div className="text-5xl">🎮</div>
          <h2 className="text-2xl font-black theme-text-primary">Game Dossier Not Found</h2>
          <p className="text-sm theme-text-muted max-w-md">
            The requested game may have been removed or does not exist in your Games Library.
          </p>
          <Link
            href="/games"
            className="px-5 py-2.5 rounded-xl font-bold text-sm bg-amber-500 text-black border-2 border-black shadow-[3px_3px_0_#000] hover:translate-y-[-2px] transition-all"
          >
            ← Back to Games Library
          </Link>
        </div>
      </AppShell>
    );
  }

  const gameTitle = currentGame.game;
  const accent = currentGame.accentColor || "#FF6B35";
  const iconRes = resolveGameIcon(gameTitle, currentGame.icon);
  const dossierConfig = getGameDossierConfig(gameTitle, currentGame.category);

  // Filter dossier characters for this specific game
  const rawGameCharacters = dossierCharacters.filter((c) => c.gameId === currentGame.id);

  // Filter by category selection if active
  const filteredCharacters = activeCategoryFilter === "ALL"
    ? rawGameCharacters
    : rawGameCharacters.filter((c) => c.category === activeCategoryFilter);

  // Metrics
  const totalMatches = rawGameCharacters.reduce((sum, c) => sum + (c.matches || 0), 0);
  const avgWinrate = rawGameCharacters.length > 0
    ? Math.round(rawGameCharacters.reduce((sum, c) => sum + (c.winRate || 0), 0) / rawGameCharacters.length)
    : 0;

  const topFavorite = rawGameCharacters.find((c) => c.isFavorite) || rawGameCharacters[0];

  return (
    <AppShell>
      <motion.div
        variants={gridContainerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 max-w-7xl mx-auto"
      >
        {/* ── Top Navigation Bar ── */}
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/games"
            className="px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer backdrop-blur-md"
            style={{
              backgroundColor: isCyber ? "rgba(0,245,255,0.08)" : "#FFFFFF",
              color: isCyber ? "#00F5FF" : "#1A1A1A",
              border: isCyber ? "1px solid rgba(0,245,255,0.3)" : "2px solid #000",
              boxShadow: isCyber ? "none" : "2px 2px 0 #000",
            }}
          >
            <span>←</span> Back to Games Library
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="px-3.5 py-2 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
              style={{
                backgroundColor: isCyber ? "rgba(0,245,255,0.12)" : "#FEF08A",
                color: isCyber ? "#00F5FF" : "#854D0E",
                border: isCyber ? "1px solid rgba(0,245,255,0.3)" : "2px solid #000",
                boxShadow: isCyber ? "none" : "2px 2px 0 #000",
              }}
            >
              <span>📷</span> Scan Screenshot
            </button>
            <button
              onClick={() => setIsGameModalOpen(true)}
              className="px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              style={{
                backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#F1F5F9",
                color: isCyber ? "#94A3B8" : "#475569",
                border: isCyber ? "1px solid rgba(255,255,255,0.15)" : "2px solid #000",
                boxShadow: isCyber ? "none" : "2px 2px 0 #000",
              }}
            >
              <span>⚙️</span> Edit Game
            </button>
            <button
              onClick={() => {
                setEditingCharacter(null);
                setIsCharModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md"
              style={{
                background: isCyber ? `linear-gradient(135deg, ${accent}, #00F5FF)` : accent,
                color: "#FFFFFF",
                border: isCyber ? "none" : "2px solid #000",
                boxShadow: isCyber ? `0 0 15px ${accent}60` : "3px 3px 0 #000",
              }}
            >
              <span>✨</span> Add {dossierConfig.characterLabel}
            </button>
          </div>
        </div>

        {/* ── Executive Game Dossier Header Banner ── */}
        <motion.div variants={cardVariants} className="relative">
          <BentoCard id="game-dossier-header" className="relative overflow-hidden p-6 md:p-8">
            {/* Background Accent Glow (Cyber Mode) */}
            {isCyber && (
              <div
                className="absolute -right-16 -top-16 w-64 h-64 rounded-full blur-[90px] opacity-20 pointer-events-none"
                style={{ backgroundColor: accent }}
              />
            )}

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              {/* Game Icon & Identity */}
              <div className="flex items-center gap-5 min-w-0">
                <div
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-3xl shrink-0 select-none shadow-md overflow-hidden relative"
                  style={{
                    backgroundColor: isCyber ? `${accent}25` : (iconRes.isImage ? "#0B0F19" : accent),
                    border: isCyber ? `1.5px solid ${accent}70` : "3px solid #000",
                    boxShadow: isCyber ? `0 0 20px ${accent}40` : "4px 4px 0 #000",
                  }}
                >
                  {iconRes.isImage ? (
                    <img src={iconRes.iconUrl} alt={gameTitle} className="w-full h-full object-cover p-1.5" />
                  ) : (
                    <span>{iconRes.fallbackEmoji || "🎮"}</span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-black uppercase tracking-wider"
                      style={{
                        backgroundColor: `${accent}20`,
                        color: isCyber ? accent : "#1A1A1A",
                        border: `1px solid ${accent}`,
                      }}
                    >
                      {dossierConfig.gameType}
                    </span>
                    {currentGame.rank && (
                      <span
                        className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/40 border border-amber-500/40"
                      >
                        🏆 {currentGame.rank}
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl md:text-4xl font-black theme-text-primary tracking-tight leading-none mt-2 truncate">
                    {gameTitle}
                  </h1>

                  <div className="flex items-center gap-4 mt-2 text-xs font-mono theme-text-muted flex-wrap">
                    <span>Platform: <strong className="theme-text-primary">{currentGame.platform}</strong></span>
                    {currentGame.handle && <span>IGN/UID: <strong className="text-amber-500">{currentGame.handle}</strong></span>}
                    {currentGame.mainCharacter && (
                      <span>Primary Main: <strong style={{ color: accent }}>{currentGame.mainCharacter}</strong></span>
                    )}
                  </div>
                </div>
              </div>

              {/* Header Quick Stats Pill Grid */}
              <div className="grid grid-cols-3 gap-3 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
                <div
                  className="p-3 rounded-xl text-center border"
                  style={{
                    backgroundColor: isCyber ? "rgba(0,245,255,0.05)" : "#F8FAFC",
                    borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000",
                    boxShadow: isCyber ? "none" : "2px 2px 0 #000",
                  }}
                >
                  <p className="text-[10px] font-mono font-bold theme-text-muted uppercase">Roster</p>
                  <p className="text-xl font-black theme-text-primary mt-0.5">{rawGameCharacters.length}</p>
                </div>

                <div
                  className="p-3 rounded-xl text-center border"
                  style={{
                    backgroundColor: isCyber ? "rgba(0,245,255,0.05)" : "#F8FAFC",
                    borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000",
                    boxShadow: isCyber ? "none" : "2px 2px 0 #000",
                  }}
                >
                  <p className="text-[10px] font-mono font-bold theme-text-muted uppercase">Avg Winrate</p>
                  <p className="text-xl font-black mt-0.5" style={{ color: avgWinrate >= 60 ? "#10B981" : accent }}>
                    {avgWinrate}%
                  </p>
                </div>

                <div
                  className="p-3 rounded-xl text-center border"
                  style={{
                    backgroundColor: isCyber ? "rgba(0,245,255,0.05)" : "#F8FAFC",
                    borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000",
                    boxShadow: isCyber ? "none" : "2px 2px 0 #000",
                  }}
                >
                  <p className="text-[10px] font-mono font-bold theme-text-muted uppercase">Matches</p>
                  <p className="text-xl font-black theme-text-primary mt-0.5">{totalMatches}</p>
                </div>
              </div>
            </div>

            {/* Optional Landscape Profile Screenshot Preview Frame */}
            {currentGame.screenshot && (
              <div className="mt-6 pt-5 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold theme-text-secondary flex items-center gap-1.5">
                    <span>🖼️</span> LANDSCAPE PROFILE SCREENSHOT
                  </span>
                  <button
                    onClick={() => setLightboxImage(currentGame.screenshot || null)}
                    className="text-[11px] font-bold text-amber-500 hover:underline cursor-pointer"
                  >
                    View Fullscreen 🔍
                  </button>
                </div>

                <div
                  onClick={() => setLightboxImage(currentGame.screenshot || null)}
                  className="relative rounded-2xl overflow-hidden aspect-video w-full max-h-72 border cursor-pointer group transition-all"
                  style={{
                    borderColor: isCyber ? `${accent}50` : "#000",
                    borderWidth: isCyber ? "1px" : "2.5px",
                    boxShadow: isCyber ? `0 0 15px ${accent}25` : "4px 4px 0 #000",
                  }}
                >
                  <img
                    src={currentGame.screenshot}
                    alt={`${gameTitle} Profile Screenshot`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold text-white text-xs gap-2">
                    <span>🔍 Click to View Fullscreen Lightbox</span>
                  </div>
                </div>
              </div>
            )}
          </BentoCard>
        </motion.div>

        {/* ── Game-Aware Category Panels & Breakdown ── */}
        <motion.div variants={cardVariants} className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-black theme-text-primary flex items-center gap-2">
                <span>📁 {dossierConfig.categoryLabel} Dossier Breakdown</span>
              </h2>
              <p className="text-xs theme-text-muted font-mono mt-0.5">
                Game-specific category structure for {gameTitle}
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              <button
                onClick={() => setActiveCategoryFilter("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeCategoryFilter === "ALL"
                    ? "bg-amber-500 text-black border-2 border-black font-extrabold"
                    : "theme-text-muted hover:theme-text-primary bg-black/10 dark:bg-white/5"
                }`}
              >
                All Categories ({rawGameCharacters.length})
              </button>

              {dossierConfig.categories.map((cat) => {
                const count = rawGameCharacters.filter((c) => c.category === cat.name).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryFilter(cat.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      activeCategoryFilter === cat.name
                        ? "bg-amber-500 text-black border-2 border-black font-extrabold"
                        : "theme-text-muted hover:theme-text-primary bg-black/10 dark:bg-white/5"
                    }`}
                  >
                    <span>{cat.icon}</span> {cat.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Cards Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
            {dossierConfig.categories.map((cat) => {
              const catChars = rawGameCharacters.filter((c) => c.category === cat.name);
              const isActive = activeCategoryFilter === cat.name;

              return (
                <div
                  key={cat.id}
                  onClick={() => setActiveCategoryFilter(isActive ? "ALL" : cat.name)}
                  className="rounded-2xl p-4 border transition-all cursor-pointer relative overflow-hidden group"
                  style={{
                    backgroundColor: isCyber
                      ? (isActive ? `${accent}20` : "rgba(10,15,30,0.6)")
                      : (isActive ? "#FEF08A" : "#FFFFFF"),
                    borderColor: isCyber
                      ? (isActive ? accent : "rgba(0,245,255,0.2)")
                      : "#000",
                    borderWidth: isCyber ? "1px" : "2.5px",
                    boxShadow: !isCyber
                      ? (isActive ? "4px 4px 0 #000" : "3px 3px 0 #000")
                      : (isActive ? `0 0 15px ${accent}40` : "none"),
                  }}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xl">{cat.icon}</span>
                    <span
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold"
                      style={{
                        backgroundColor: isCyber ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
                      }}
                    >
                      {catChars.length} {catChars.length === 1 ? dossierConfig.characterLabel : `${dossierConfig.characterLabel}s`}
                    </span>
                  </div>

                  <h3 className="font-black text-sm theme-text-primary leading-tight truncate">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] theme-text-muted mt-1 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>

                  {/* Micro list of top characters in this category */}
                  {catChars.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-white/10 space-y-1">
                      {catChars.slice(0, 3).map((char) => (
                        <div key={char.id} className="flex items-center justify-between text-[11px] font-mono">
                          <span className="font-bold theme-text-primary truncate">{char.name}</span>
                          <span className="text-amber-500 font-bold">{char.winRate}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Character / Hero Roster Dossier Grid ── */}
        <motion.div variants={cardVariants} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black theme-text-primary flex items-center gap-2">
              <span>🗂️ {dossierConfig.characterLabel} Intelligence Roster</span>
            </h2>
            <span className="text-xs font-mono theme-text-muted">
              Showing {filteredCharacters.length} of {rawGameCharacters.length} entries
            </span>
          </div>

          {filteredCharacters.length === 0 ? (
            <div
              className="p-8 rounded-2xl border text-center space-y-3"
              style={{
                backgroundColor: isCyber ? "rgba(10,15,30,0.6)" : "#FFFFFF",
                borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000",
                borderWidth: isCyber ? "1px" : "2.5px",
                boxShadow: isCyber ? "none" : "4px 4px 0 #000",
              }}
            >
              <div className="text-4xl">📸</div>
              <h3 className="font-black text-base theme-text-primary">Your Game Database is Empty</h3>
              <p className="text-xs theme-text-muted max-w-sm mx-auto">
                Upload a game statistics screenshot and let the AI scanner automatically extract and build your profile profile.
              </p>
              <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                <button
                  onClick={() => setIsScannerOpen(true)}
                  className="px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md"
                  style={{
                    backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#FEF08A",
                    color: isCyber ? "#00F5FF" : "#854D0E",
                    border: isCyber ? "1px solid rgba(0,245,255,0.4)" : "2px solid #000",
                    boxShadow: isCyber ? "none" : "2px 2px 0 #000",
                  }}
                >
                  <span>📷</span> Scan Screenshot & Auto-Import
                </button>
                <button
                  onClick={() => {
                    setEditingCharacter(null);
                    setIsCharModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl font-bold text-xs bg-amber-500 text-black border-2 border-black shadow-[2px_2px_0_#000] cursor-pointer"
                >
                  + Add Manually
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCharacters.map((char, index) => {
                const charAccent = char.accentColor || accent;

                return (
                  <motion.div
                    key={char.id}
                    variants={cardVariants}
                    custom={index}
                    layout
                    className="rounded-2xl p-5 border relative overflow-hidden group transition-all"
                    style={{
                      backgroundColor: isCyber ? "rgba(10,15,30,0.8)" : "#FFFFFF",
                      borderColor: isCyber ? `${charAccent}40` : "#000",
                      borderWidth: isCyber ? "1px" : "2.5px",
                      boxShadow: isCyber ? `0 0 15px ${charAccent}20` : "4px 4px 0 #000",
                    }}
                  >
                    {/* Top Action Buttons */}
                    <button
                      onClick={() => {
                        setEditingCharacter(char);
                        setIsCharModalOpen(true);
                      }}
                      className="absolute top-3.5 right-3.5 p-1.5 rounded-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer text-xs"
                      title="Edit Entry"
                    >
                      ✏️
                    </button>

                    <div className="flex items-start gap-4">
                      {/* Character Avatar Box */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 font-bold overflow-hidden border shadow-sm"
                        style={{
                          backgroundColor: `${charAccent}20`,
                          color: charAccent,
                          borderColor: isCyber ? charAccent : "#000",
                          borderWidth: isCyber ? "1px" : "2px",
                        }}
                      >
                        {char.avatarUrl ? (
                          char.avatarUrl.startsWith("http") || char.avatarUrl.startsWith("data:") || char.avatarUrl.startsWith("/") ? (
                            <img src={char.avatarUrl} alt={char.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{char.avatarUrl}</span>
                          )
                        ) : (
                          <span>{char.name.charAt(0)}</span>
                        )}
                      </div>

                      {/* Character Information */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-black text-base theme-text-primary truncate leading-tight">
                            {char.name}
                          </h3>
                          {char.isFavorite && <span className="text-amber-400 text-xs">⭐</span>}
                        </div>

                        <div className="flex items-center gap-2 mt-1 flex-wrap text-xs font-mono">
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold"
                            style={{
                              backgroundColor: `${charAccent}20`,
                              color: isCyber ? charAccent : "#1A1A1A",
                              border: `1px solid ${charAccent}`,
                            }}
                          >
                            {char.category}
                          </span>
                          {char.role && <span className="theme-text-muted">{char.role}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Stats & Metrics Bar */}
                    <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="theme-text-muted">Winrate Performance:</span>
                        <span className="font-extrabold text-emerald-400">{char.winRate ?? 0}%</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 rounded-full overflow-hidden bg-black/20 dark:bg-white/10 border border-white/10">
                        <motion.div
                          className="h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, char.winRate || 0)}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          style={{ backgroundColor: charAccent }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono theme-text-muted pt-1">
                        {char.levelRank && <span>Level/Rank: <strong className="theme-text-primary">{char.levelRank}</strong></span>}
                        {char.matches !== undefined && <span>Matches: <strong className="theme-text-primary">{char.matches}</strong></span>}
                      </div>

                      {/* Strategy Notes */}
                      {char.notes && (
                        <div
                          className="mt-2.5 p-2.5 rounded-xl text-xs theme-text-secondary font-sans leading-relaxed border"
                          style={{
                            backgroundColor: isCyber ? "rgba(0,245,255,0.04)" : "#F8FAFC",
                            borderColor: isCyber ? "rgba(0,245,255,0.15)" : "#E2E8F0",
                          }}
                        >
                          💬 {char.notes}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* ── Modals & Lightbox ── */}
        <DossierCharacterEditorModal
          isOpen={isCharModalOpen}
          onClose={() => setIsCharModalOpen(false)}
          gameId={currentGame.id}
          gameTitle={gameTitle}
          gameCategory={currentGame.category}
          characterToEdit={editingCharacter}
        />

        <GameEditorModal
          isOpen={isGameModalOpen}
          onClose={() => setIsGameModalOpen(false)}
          gameToEdit={currentGame}
        />

        <GameScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          gameId={currentGame.id}
          gameTitle={gameTitle}
          gameCategory={currentGame.category}
        />

        <ImageLightboxModal
          isOpen={!!lightboxImage}
          onClose={() => setLightboxImage(null)}
          imageUrl={lightboxImage || ""}
          title={`${gameTitle} Screenshot`}
        />
      </motion.div>
    </AppShell>
  );
}
