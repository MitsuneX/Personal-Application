"use client";

import React from "react";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { ShieldCheck, Database, RefreshCw, Music, Film, CheckCircle2 } from "lucide-react";

export function SystemStatusBar() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const {
    isGuest,
    gameCharacters,
    animeList,
    dramas,
    activeTrack,
    isPlaying,
    isHydrated,
  } = useDashboardStore();

  const totalMedia = animeList.length + dramas.length;

  return (
    <div
      className="rounded-xl p-3 border flex flex-wrap items-center justify-between gap-3 text-xs"
      style={{
        backgroundColor: isCyber ? "rgba(10, 15, 30, 0.6)" : "#F8FAFC",
        borderColor: isCyber ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
        boxShadow: isCyber ? "0 0 15px rgba(0, 0, 0, 0.3)" : "none",
      }}
    >
      <div className="flex flex-wrap items-center gap-4">
        {/* DB / Sandbox Status */}
        <div className="flex items-center gap-1.5">
          <Database size={13} className="text-emerald-400" />
          <span className="font-bold theme-text-secondary">
            {isGuest ? "Guest Sandbox:" : "Database:"}
          </span>
          <span className="text-emerald-400 font-mono text-[11px]">
            {isGuest ? "Ephemeral Mode" : "PostgreSQL Connected"}
          </span>
        </div>

        {/* Canonical Sync Engine */}
        <div className="flex items-center gap-1.5">
          <RefreshCw size={13} className="text-cyan-400" />
          <span className="font-bold theme-text-secondary">Sync Engine:</span>
          <span className="text-cyan-400 font-mono text-[11px]">
            {gameCharacters.length} GC Canonical
          </span>
        </div>

        {/* Music Subsystem */}
        <div className="flex items-center gap-1.5">
          <Music size={13} className="text-purple-400" />
          <span className="font-bold theme-text-secondary">Audio:</span>
          <span className="text-purple-400 font-mono text-[11px]">
            {activeTrack ? (isPlaying ? "Streaming" : "Paused") : "Idle"}
          </span>
        </div>

        {/* Media Engine */}
        <div className="flex items-center gap-1.5">
          <Film size={13} className="text-pink-400" />
          <span className="font-bold theme-text-secondary">Media:</span>
          <span className="text-pink-400 font-mono text-[11px]">
            {totalMedia} Tracked
          </span>
        </div>
      </div>

      {/* Hydration / Nominal Indicator */}
      <div className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-400">
        <CheckCircle2 size={13} />
        <span>{isHydrated ? "ALL SYSTEMS NOMINAL" : "SYNCING STATE..."}</span>
      </div>
    </div>
  );
}
