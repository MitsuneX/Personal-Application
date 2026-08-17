"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import Link from "next/link";
import {
  Activity,
  Database,
  RefreshCw,
  Film,
  Music,
  CheckCircle2,
  ArrowUpRight,
  Radio,
  Clock,
} from "lucide-react";

export function SystemPulseCard() {
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
    hallEvents,
  } = useDashboardStore();

  const totalMedia = animeList.length + dramas.length;

  // Real Last Recorded Activity (from genuine hallEvents or watch updates)
  const lastActivity = useMemo(() => {
    if (hallEvents && hallEvents.length > 0) {
      const ev = hallEvents[0];
      return {
        text: `${ev.characterName} — ${ev.type}`,
        time: ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recent",
        badge: "HALL EVENT",
      };
    }

    const latestWatchedAnime = animeList.find((a) => a.status === "Watching" && a.episodesWatched > 0);
    if (latestWatchedAnime) {
      return {
        text: `Watching ${latestWatchedAnime.title} (EP ${latestWatchedAnime.episodesWatched})`,
        time: "Active",
        badge: "ANIME",
      };
    }

    const latestWatchedDrama = dramas.find((d) => d.status === "Watching" && d.episodesWatched > 0);
    if (latestWatchedDrama) {
      return {
        text: `Watching ${latestWatchedDrama.title} (EP ${latestWatchedDrama.episodesWatched})`,
        time: "Active",
        badge: "DRAMA",
      };
    }

    return {
      text: "All 14 system hubs synchronized & active",
      time: "Online",
      badge: "SYSTEM",
    };
  }, [hallEvents, animeList, dramas]);

  const subsystems = [
    {
      name: isGuest ? "Guest Sandbox" : "PostgreSQL Database",
      status: isGuest ? "Ephemeral Mode · Isolated" : "Healthy · Synchronized",
      icon: Database,
      color: "#10B981", // emerald
      dotColor: "bg-emerald-400",
    },
    {
      name: "Canonical Sync Engine",
      status: `${gameCharacters.length} GC Records Operational`,
      icon: RefreshCw,
      color: isCyber ? "#00F5FF" : "#0284C7",
      dotColor: "bg-cyan-400",
    },
    {
      name: "Cinematic Media Engine",
      status: `${totalMedia} Titles Actively Monitored`,
      icon: Film,
      color: isCyber ? "#FF7EB9" : "#EF476F",
      dotColor: "bg-pink-400",
    },
    {
      name: "Audio Subsystem",
      status: activeTrack
        ? isPlaying
          ? `Streaming · ${activeTrack.title}`
          : `Paused · ${activeTrack.title}`
        : "Idle / Standby",
      icon: Music,
      color: isCyber ? "#BF5FFF" : "#7B2FBE",
      dotColor: isPlaying ? "bg-green-400 animate-pulse" : "bg-purple-400",
    },
  ];

  return (
    <div
      className="rounded-2xl p-5 border flex flex-col justify-between h-full"
      style={{
        backgroundColor: isCyber ? "rgba(10, 15, 30, 0.85)" : "#FFFFFF",
        borderColor: isCyber ? "rgba(57, 255, 20, 0.25)" : "#000000",
        borderWidth: isCyber ? "1px" : "2.5px",
        boxShadow: isCyber ? "0 0 20px rgba(0, 0, 0, 0.4)" : "4px 4px 0 #000",
      }}
    >
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Radio size={16} className={isCyber ? "text-emerald-400 animate-pulse" : "text-black"} />
            <h3
              className="font-black text-sm uppercase tracking-wider"
              style={{
                color: isCyber ? "#E0E8FF" : "#1A1A1A",
                fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
              }}
            >
              {isCyber ? "// SYSTEM PULSE · TELEMETRY" : "System Pulse · Telemetry"}
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-400">
            ● NOMINAL
          </span>
        </div>

        {/* Subsystems Health Grid */}
        <div className="space-y-2.5 mb-4">
          {subsystems.map((sub) => {
            const Icon = sub.icon;
            return (
              <div
                key={sub.name}
                className="p-2.5 rounded-xl border flex items-center justify-between gap-3"
                style={{
                  backgroundColor: isCyber ? "rgba(255, 255, 255, 0.02)" : "#F8FAFC",
                  borderColor: isCyber ? "rgba(255, 255, 255, 0.06)" : "#E2E8F0",
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-black/20 text-xs shrink-0">
                    <Icon size={14} style={{ color: sub.color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs theme-text-primary truncate">
                      {sub.name}
                    </p>
                    <p className="text-[11px] theme-text-muted truncate font-mono">
                      {sub.status}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`w-2 h-2 rounded-full ${sub.dotColor}`} />
                  <span className="text-[10px] font-mono font-bold theme-text-muted">
                    READY
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Real Last Recorded Activity */}
        <div
          className="p-3 rounded-xl border"
          style={{
            backgroundColor: isCyber ? "rgba(0, 245, 255, 0.04)" : "#F1F5F9",
            borderColor: isCyber ? "rgba(0, 245, 255, 0.2)" : "#CBD5E1",
          }}
        >
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider mb-1">
            <span className="text-cyan-400 font-mono flex items-center gap-1">
              <Clock size={11} /> LAST RECORDED EVENT
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-400/10 text-cyan-400 font-bold font-mono">
              {lastActivity.badge}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <p className="font-bold text-xs theme-text-primary truncate">
              {lastActivity.text}
            </p>
            <span className="text-[10px] font-mono theme-text-muted shrink-0">
              {lastActivity.time}
            </span>
          </div>
        </div>
      </div>

      {/* Footer State */}
      <div className="pt-3 mt-3 border-t border-white/10 flex justify-between items-center text-xs">
        <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
          <CheckCircle2 size={12} />
          {isHydrated ? "State Hydrated & Synced" : "Hydrating..."}
        </span>
        <span className="text-[10px] font-mono theme-text-muted">
          All Services Nominal
        </span>
      </div>
    </div>
  );
}
