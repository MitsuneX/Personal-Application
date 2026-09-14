"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import Link from "next/link";
import { Star, Heart, Shield, Trophy, ArrowUpRight } from "lucide-react";

export function FavouritesSnapshot() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const {
    gameCharacters,
    dossierCharacters,
    hallOfFame,
    couples,
    creatures,
  } = useDashboardStore();

  const stats = useMemo(() => {
    // Characters: count favorites across Game Characters & HOF
    const favGameChars = gameCharacters.filter((c) => c.isFavorite).length;
    const favDossier = dossierCharacters.filter((c) => c.isFavorite).length;
    const favHofChars = hallOfFame.filter((h) => h.isFavorite).length;
    const charFavCount = favGameChars > 0 ? favGameChars : favDossier + favHofChars;
    const totalChars = (gameCharacters.length || (dossierCharacters.length + hallOfFame.length));

    // Couples favorites
    const favCouples = couples.filter((c) => c.isFavorite).length;
    const totalCouples = couples.length;

    // Creatures favorites
    const favCreatures = creatures.filter((c) => c.isFavorite).length;
    const totalCreatures = creatures.length;

    // Hall of Fame favorites & champions
    const favHof = hallOfFame.filter((h) => h.isFavorite || h.isChampion).length;
    const totalHof = hallOfFame.length;

    return [
      {
        label: "Characters",
        count: charFavCount,
        total: totalChars,
        href: "/characters",
        icon: Star,
        color: isCyber ? "#00F5FF" : "#0284C7",
      },
      {
        label: "Couples",
        count: favCouples,
        total: totalCouples,
        href: "/couples",
        icon: Heart,
        color: isCyber ? "#FF7EB9" : "#EF476F",
      },
      {
        label: "Creatures",
        count: favCreatures,
        total: totalCreatures,
        href: "/creatures",
        icon: Shield,
        color: isCyber ? "#39FF14" : "#059669",
      },
      {
        label: "Hall of Fame",
        count: favHof,
        total: totalHof,
        href: "/hall-of-fame",
        icon: Trophy,
        color: isCyber ? "#FFD700" : "#D97706",
      },
    ];
  }, [gameCharacters, dossierCharacters, hallOfFame, couples, creatures, isCyber]);

  return (
    <div
      className="rounded-2xl p-5 border flex flex-col justify-between h-full"
      style={{
        backgroundColor: isCyber ? "rgba(10, 15, 30, 0.85)" : "#FFFFFF",
        borderColor: isCyber ? "rgba(0, 245, 255, 0.25)" : "#000000",
        borderWidth: isCyber ? "1px" : "2.5px",
        boxShadow: isCyber ? "0 0 15px rgba(0, 245, 255, 0.08)" : "4px 4px 0 #000000",
      }}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <span className="text-base" role="img" aria-label="star">
              ⭐
            </span>
            <h3
              className="font-black text-xs uppercase tracking-wider"
              style={{
                color: isCyber ? "#E0E8FF" : "#1A1A1A",
                fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
              }}
            >
              {isCyber ? "// FAVOURITES · ECOSYSTEM" : "Favourites Snapshot"}
            </h3>
          </div>
          <span className="text-[10px] theme-text-muted">Live collection counts</span>
        </div>

        {/* 4 Category Rows */}
        <div className="space-y-2">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.label} href={item.href} className="block group">
                <div
                  className="p-2.5 rounded-xl border flex items-center justify-between transition-all group-hover:scale-[1.01]"
                  style={{
                    backgroundColor: isCyber ? "rgba(255, 255, 255, 0.02)" : "#F8FAFC",
                    borderColor: isCyber ? "rgba(255, 255, 255, 0.06)" : "#E2E8F0",
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: `${item.color}15`,
                        borderColor: `${item.color}35`,
                        color: item.color,
                      }}
                    >
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold theme-text-primary group-hover:text-cyan-400 transition-colors truncate">
                        {item.label}
                      </p>
                      <p className="text-[10px] theme-text-muted truncate">
                        {item.total} total in system
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="font-mono font-black text-sm px-2 py-0.5 rounded-md border"
                      style={{
                        backgroundColor: `${item.color}15`,
                        borderColor: `${item.color}40`,
                        color: item.color,
                      }}
                    >
                      {item.count}
                    </span>
                    <ArrowUpRight
                      size={13}
                      className="opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-slate-400"
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] theme-text-muted">
        <span>Click any category to explore</span>
        <span className="font-mono">4 ECOSYSTEMS</span>
      </div>
    </div>
  );
}
