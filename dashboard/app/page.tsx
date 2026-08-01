"use client";

import React from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { ProfileCard } from "@/components/cards/ProfileCard";
import { GameDBCard } from "@/components/cards/GameDBCard";
import { MediaLogCard } from "@/components/cards/MediaLogCard";
import { AnimeZoneCard } from "@/components/cards/AnimeZoneCard";
import { GameRadarChart } from "@/components/charts/GameRadarChart";
import { AnimeBarChart } from "@/components/charts/AnimeBarChart";
import { BentoCard } from "@/components/cards/BentoCard";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { gridContainerVariants, cardVariants } from "@/lib/theme/motionVariants";
import { RecommendationWidget } from "@/components/ui/RecommendationWidget";
import { FocusWidget } from "@/components/dashboard/FocusWidget";
import Link from "next/link";

export default function DashboardPage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { games, animeList, dramas, dramaLog, hallOfFame } = useDashboardStore();

  const totalEps = animeList.reduce((s, a) => s + a.episodesWatched, 0);
  const completedAnime = animeList.filter((a) => a.status === "Completed").length;
  const activeGames = games.filter((g) => g.isActive).length;
  const totalDramas = dramas.length + dramaLog.length;

  const stats = [
    { label: "Active Games",    value: activeGames,     icon: "🎮", href: "/games",        color: isCyber ? "#00F5FF" : "#FF6B35", badge: "HUD" },
    { label: "Anime Watched",   value: completedAnime,  icon: "⛩️",  href: "/anime",        color: isCyber ? "#39FF14" : "#06D6A0", badge: "SERIES" },
    { label: "Total Episodes",  value: totalEps,        icon: "📺",  href: "/anime",        color: isCyber ? "#BF5FFF" : "#FFD166", badge: "WATCHED" },
    { label: "Dramas Tracked",  value: totalDramas,     icon: "🎬",  href: "/drama",        color: isCyber ? "#F472B6" : "#EF476F", badge: "LIBRARY" },
    { label: "Hall of Fame",    value: hallOfFame.length, icon: "🏆", href: "/hall-of-fame", color: isCyber ? "#FFD700" : "#FF6B35", badge: "LEGENDS" },
  ];

  return (
    <AppShell>
      {/* ── Page header ── */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
      >
        <motion.p
          className="text-xs font-bold tracking-widest uppercase mb-1"
          animate={{ color: isCyber ? "rgba(0,245,255,0.5)" : "rgba(0,0,0,0.4)" }}
        >
          {isCyber
            ? `SYS::${new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase()}`
            : new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </motion.p>
        <motion.h1
          className="font-black text-2xl md:text-3xl"
          animate={{ color: isCyber ? "#E0E8FF" : "#1A1A1A", fontFamily: isCyber ? "var(--font-orbitron)" : "inherit", letterSpacing: isCyber ? "0.05em" : "0em" }}
          transition={{ duration: 0.4 }}
        >
          {isCyber ? "// COMMAND CENTER" : "My Dashboard"}
        </motion.h1>
      </motion.div>

      {/* ── Quick Stats Bar (Responsive 5-Col Grid) ── */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 mb-6"
        variants={gridContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={cardVariants} className="min-w-0">
            <Link href={stat.href}>
              <motion.div
                className="rounded-xl p-3.5 sm:p-4 flex flex-col justify-between gap-2 cursor-pointer h-full select-none"
                animate={{
                  background: isCyber ? `${stat.color}0D` : `${stat.color}12`,
                  border: isCyber ? `1px solid ${stat.color}30` : `2px solid ${stat.color}`,
                  boxShadow: isCyber ? `0 0 20px ${stat.color}15` : `3px 3px 0 rgba(0,0,0,1)`,
                }}
                transition={{ duration: 0.4 }}
                whileHover={{ scale: 1.03, boxShadow: isCyber ? `0 0 30px ${stat.color}30` : `5px 5px 0 rgba(0,0,0,1)` }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl sm:text-2xl">{stat.icon}</span>
                  <span
                    className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider opacity-70"
                    style={{
                      borderColor: isCyber ? `${stat.color}40` : "rgba(0,0,0,0.2)",
                      color: isCyber ? stat.color : "#000000",
                      backgroundColor: isCyber ? "rgba(0,0,0,0.3)" : "#FFFFFF",
                    }}
                  >
                    {stat.badge}
                  </span>
                </div>

                <div>
                  <motion.span
                    className="font-black text-2xl sm:text-3xl leading-none block"
                    animate={{ color: stat.color, textShadow: isCyber ? `0 0 12px ${stat.color}` : "none" }}
                    transition={{ duration: 0.4 }}
                  >
                    {stat.value}
                  </motion.span>
                  <span className="text-xs font-semibold theme-text-muted truncate block mt-0.5">
                    {stat.label}
                  </span>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Main Dashboard Top Grid (Seamless 3-Column Bento Layout — Zero Gaps) ── */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-5"
        variants={gridContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Column 1: Profile Card */}
        <div className="md:col-span-2 xl:col-span-1">
          <ProfileCard />
        </div>

        {/* Column 2: Genre Activity Radar + Game Database Card */}
        <div className="flex flex-col gap-5">
          <motion.div variants={cardVariants} className="flex-1">
            <BentoCard id="radar-card" noHover className="h-full">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">📡</span>
                <div>
                  <motion.h2 className="font-black text-sm theme-text-primary" animate={{ fontFamily: isCyber ? "var(--font-orbitron)" : "inherit" }} transition={{ duration: 0.4 }}>
                    {isCyber ? "GENRE.RADAR" : "Genre Activity"}
                  </motion.h2>
                  <p className="theme-text-muted text-xs">Gaming spread</p>
                </div>
              </div>
              <GameRadarChart />
            </BentoCard>
          </motion.div>

          <motion.div variants={cardVariants} className="flex-1">
            <GameDBCard />
          </motion.div>
        </div>

        {/* Column 3: Anime Episode Progress + Media Log Card */}
        <div className="flex flex-col gap-5">
          <motion.div variants={cardVariants} className="flex-1">
            <BentoCard id="anime-chart-card" noHover className="h-full">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">📊</span>
                <div>
                  <motion.h2 className="font-black text-sm theme-text-primary" animate={{ fontFamily: isCyber ? "var(--font-orbitron)" : "inherit" }} transition={{ duration: 0.4 }}>
                    {isCyber ? "ANIME.PROGRESS" : "Episode Progress"}
                  </motion.h2>
                  <p className="theme-text-muted text-xs">{totalEps} total eps watched</p>
                </div>
              </div>
              <AnimeBarChart />
            </BentoCard>
          </motion.div>

          <motion.div variants={cardVariants} className="flex-1">
            <MediaLogCard />
          </motion.div>
        </div>
      </motion.div>

      {/* ── Today's Mission & Focus Control ── */}
      <div className="mb-5">
        <FocusWidget />
      </div>

      {/* ── AI Recommendations ── */}
      <div className="mb-5">
        <RecommendationWidget />
      </div>

      {/* ── Anime Zone Featured Showcase ── */}
      <div className="mb-5">
        <motion.div variants={cardVariants}>
          <AnimeZoneCard />
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer className="mt-8 pb-2 text-center text-xs" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1.5 }}>
        <span style={{ color: isCyber ? "rgba(0,245,255,0.4)" : "rgba(0,0,0,0.3)" }}>
          {isCyber ? "NEXUS v3.9.1 // NEXT.JS + FRAMER MOTION + RECHARTS" : "Dashboard v3.9.1 · Next.js + Framer Motion + Recharts"}
        </span>
      </motion.footer>
    </AppShell>
  );
}
