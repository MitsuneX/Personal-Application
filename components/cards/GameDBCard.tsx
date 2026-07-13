"use client";

import React from "react";
import { motion } from "framer-motion";
import { BentoCard } from "./BentoCard";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { listContainerVariants, listItemVariants } from "@/lib/theme/motionVariants";
import type { GameRank } from "@/lib/store/dashboardStore";

const RANK_CLASS: Record<GameRank, string> = {
  Iron:        "rank-iron",
  Bronze:      "rank-bronze",
  Silver:      "rank-silver",
  Gold:        "rank-gold",
  Platinum:    "rank-platinum",
  Diamond:     "rank-diamond",
  Master:      "rank-master",
  Grandmaster: "rank-grandmaster",
  Challenger:  "rank-challenger",
};

const PLATFORM_ICONS: Record<string, string> = {
  PC:     "🖥",
  PSN:    "🎮",
  Xbox:   "🟩",
  Switch: "🕹",
  Mobile: "📱",
};

const ROLE_ICONS: Record<string, string> = {
  Duelist:    "⚔️",
  Skirmisher: "🏃",
  Jungle:     "🌲",
  ADC:        "🏹",
  Support:    "💛",
  Tank:       "🛡️",
  Mid:        "🎯",
  Top:        "🗡️",
};

function getRoleIcon(role: string): string {
  const key = Object.keys(ROLE_ICONS).find((k) =>
    role.toLowerCase().includes(k.toLowerCase())
  );
  return key ? ROLE_ICONS[key] : "🎮";
}

export function GameDBCard() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const games = useDashboardStore((s) => s.games);

  const activeGames = games.filter((g) => g.isActive);
  const inactiveGames = games.filter((g) => !g.isActive);

  return (
    <BentoCard
      id="game-db-card"
      className="col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-2"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <motion.span
            className="text-2xl"
            animate={{ filter: isCyber ? "drop-shadow(0 0 8px rgba(0,245,255,0.7))" : "none" }}
            transition={{ duration: 0.4 }}
          >
            🎯
          </motion.span>
          <div>
            <motion.h2
              className="font-black text-base leading-tight theme-text-primary"
              animate={{ fontFamily: isCyber ? "var(--font-orbitron)" : "inherit" }}
              transition={{ duration: 0.4 }}
            >
              {isCyber ? "GAME.DB" : "Game DB"}
            </motion.h2>
            <p className="theme-text-muted text-xs tracking-widest uppercase">
              {games.length} handles tracked
            </p>
          </div>
        </div>

        {/* Active count badge */}
        <motion.div
          className="theme-badge"
          animate={{
            backgroundColor: isCyber ? "rgba(57,255,20,0.12)" : "rgba(6,214,160,0.12)",
            color: isCyber ? "#39FF14" : "#06D6A0",
            borderColor: isCyber ? "rgba(57,255,20,0.4)" : "#06D6A0",
          }}
          transition={{ duration: 0.4 }}
        >
          {activeGames.length} Active
        </motion.div>
      </div>

      {/* Active games list */}
      <motion.ul
        className="space-y-2.5"
        variants={listContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {activeGames.map((game, i) => (
          <GameRow key={game.id} game={game} isCyber={isCyber} index={i} />
        ))}
      </motion.ul>

      {/* Divider */}
      {inactiveGames.length > 0 && (
        <>
          <motion.div
            className="my-3 flex items-center gap-2"
            animate={{ opacity: 0.6 }}
          >
            <div
              className="flex-1 h-px"
              style={{
                background: isCyber ? "rgba(0,245,255,0.2)" : "rgba(0,0,0,0.15)",
              }}
            />
            <span className="theme-text-muted text-xs font-mono tracking-widest uppercase">
              archived
            </span>
            <div
              className="flex-1 h-px"
              style={{
                background: isCyber ? "rgba(0,245,255,0.2)" : "rgba(0,0,0,0.15)",
              }}
            />
          </motion.div>

          <motion.ul
            className="space-y-2"
            variants={listContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {inactiveGames.map((game, i) => (
              <GameRow
                key={game.id}
                game={game}
                isCyber={isCyber}
                index={i + activeGames.length}
                dimmed
              />
            ))}
          </motion.ul>
        </>
      )}
    </BentoCard>
  );
}

// ─── Game Row ─────────────────────────────────────────────────────────────────

interface GameRowProps {
  game: ReturnType<typeof useDashboardStore.getState>["games"][0];
  isCyber: boolean;
  index: number;
  dimmed?: boolean;
}

function GameRow({ game, isCyber, index, dimmed }: GameRowProps) {
  return (
    <motion.li
      variants={listItemVariants}
      custom={index}
      className="flex items-center gap-3 rounded-md px-3 py-2.5 group cursor-default"
      style={{
        background: isCyber ? "rgba(0,245,255,0.03)" : "rgba(0,0,0,0.03)",
        border: isCyber
          ? "1px solid rgba(0,245,255,0.08)"
          : "1px solid rgba(0,0,0,0.08)",
        opacity: dimmed ? 0.55 : 1,
      }}
      whileHover={
        !dimmed
          ? {
              backgroundColor: isCyber ? "rgba(0,245,255,0.07)" : "rgba(255,107,53,0.06)",
              scale: 1.01,
              transition: { duration: 0.15 },
            }
          : undefined
      }
    >
      {/* Platform icon */}
      <span className="text-base shrink-0">{PLATFORM_ICONS[game.platform] ?? "🖥"}</span>

      {/* Game info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="theme-text-primary text-sm font-bold truncate">
            {game.game}
          </span>
          {game.mainRole && (
            <span className="text-xs theme-text-muted hidden sm:inline">
              {getRoleIcon(game.mainRole)} {game.mainRole}
            </span>
          )}
        </div>
        <p
          className="text-xs font-mono mt-0.5"
          style={{ color: isCyber ? "rgba(0,245,255,0.7)" : "rgba(0,0,0,0.5)" }}
        >
          {game.handle}
        </p>
      </div>

      {/* Rank badge */}
      {game.rank && (
        <motion.span
          className={`theme-badge ${RANK_CLASS[game.rank]} shrink-0`}
          whileHover={{ scale: 1.08 }}
          animate={
            isCyber && (game.rank === "Diamond" || game.rank === "Challenger")
              ? { boxShadow: ["0 0 6px currentColor", "0 0 14px currentColor", "0 0 6px currentColor"] }
              : {}
          }
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          {game.rank}
        </motion.span>
      )}
    </motion.li>
  );
}
