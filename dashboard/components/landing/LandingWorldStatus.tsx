"use client";

import React from "react";
import { motion } from "framer-motion";
import { Globe, Shield, Gamepad2, Music, Film, Trophy, Users } from "lucide-react";

interface LandingWorldStatusProps {
  isCyber: boolean;
  showPublicStats?: boolean;
  stats?: {
    gamesCount?: number;
    charactersCount?: number;
    musicCount?: number;
    mediaCount?: number;
    hallCount?: number;
  };
  accentColor?: string;
}

export function LandingWorldStatus({
  isCyber,
  showPublicStats = false,
  stats = {},
  accentColor = "#00F5FF",
}: LandingWorldStatusProps) {
  return (
    <div
      className="w-full p-4 sm:p-5 rounded-2xl border mb-10 backdrop-blur-xl font-mono select-none"
      style={{
        backgroundColor: isCyber ? "rgba(10,15,36,0.6)" : "#FFFFFF",
        borderColor: isCyber ? "rgba(255,255,255,0.12)" : "#000000",
        borderWidth: isCyber ? "1px" : "2.5px",
        boxShadow: isCyber ? `0 0 20px rgba(0,245,255,0.05)` : "4px 4px 0 #000000",
      }}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* World Summary Pill */}
        <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider">
          <Globe size={16} className="shrink-0 animate-spin-slow text-emerald-400" />
          <span className="opacity-70">This world contains:</span>
          <span className="font-black" style={{ color: isCyber ? accentColor : "#000000" }}>
            Games · Music · Memories · Media · Characters · Life
          </span>
        </div>

        {/* Public Stats Counters (Opt-in only!) */}
        {showPublicStats ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center flex-wrap gap-4 text-xs font-black"
          >
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/10 dark:bg-white/5 border border-white/10">
              <Gamepad2 size={13} className="text-cyan-400" />
              <span>{stats.gamesCount ?? 0} Games</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/10 dark:bg-white/5 border border-white/10">
              <Users size={13} className="text-purple-400" />
              <span>{stats.charactersCount ?? 0} Roster</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/10 dark:bg-white/5 border border-white/10">
              <Music size={13} className="text-amber-400" />
              <span>{stats.musicCount ?? 0} Tracks</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/10 dark:bg-white/5 border border-white/10">
              <Film size={13} className="text-pink-400" />
              <span>{stats.mediaCount ?? 0} Media</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/10 dark:bg-white/5 border border-white/10">
              <Trophy size={13} className="text-emerald-400" />
              <span>{stats.hallCount ?? 0} Hall Records</span>
            </div>
          </motion.div>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
            <Shield size={13} />
            <span>Private Archive · Protected Realm</span>
          </div>
        )}
      </div>
    </div>
  );
}
