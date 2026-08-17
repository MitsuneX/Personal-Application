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
import { FocusWidget } from "@/components/dashboard/FocusWidget";
import { QuickActionsToolbar } from "@/components/dashboard/QuickActionsToolbar";
import { ContinueWatchingSection } from "@/components/dashboard/ContinueWatchingSection";
import { HofLiveTrendsSection } from "@/components/dashboard/HofLiveTrendsSection";
import { LiveActivityFeed } from "@/components/dashboard/LiveActivityFeed";
import { SystemPulseCard } from "@/components/dashboard/SystemPulseCard";
import { SystemStatusBar } from "@/components/dashboard/SystemStatusBar";
import Link from "next/link";

function DashboardContent() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const {
    profile,
    games,
    animeList,
    dramas,
    dramaLog,
    hallOfFame,
  } = useDashboardStore();

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Time-of-day greeting & formatted date
  const { greeting, formattedDate } = React.useMemo(() => {
    if (!mounted) {
      return {
        greeting: isCyber ? "SYS::ONLINE" : "Welcome Back",
        formattedDate: "ONLINE",
      };
    }
    const hour = new Date().getHours();
    const timeGreeting =
      hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
    const name = profile?.name || "Commander";

    const dateStr = isCyber
      ? `SYS::${new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase()}`
      : new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

    return {
      greeting: isCyber ? `// ${timeGreeting.toUpperCase()}, ${name.toUpperCase()}` : `${timeGreeting}, ${name}`,
      formattedDate: dateStr,
    };
  }, [mounted, isCyber, profile]);

  // Derived contextual metrics
  const totalEps = animeList.reduce((s, a) => s + a.episodesWatched, 0);
  const completedAnime = animeList.filter((a) => a.status === "Completed").length;
  const watchingAnimeCount = animeList.filter((a) => a.status === "Watching").length;
  const activeGames = games.filter((g) => g.isActive).length;
  const totalDramas = dramas.length + dramaLog.length;
  const watchingDramaCount = dramas.filter((d) => d.status === "Watching").length;
  const topHof = hallOfFame[0];

  const stats = [
    {
      label: "Active Games",
      value: activeGames,
      subtext: `${games.length} total in library`,
      icon: "🎮",
      href: "/games",
      color: isCyber ? "#00F5FF" : "#FF6B35",
    },
    {
      label: "Anime Watched",
      value: completedAnime,
      subtext: `${watchingAnimeCount} currently watching`,
      icon: "⛩️",
      href: "/anime",
      color: isCyber ? "#39FF14" : "#06D6A0",
    },
    {
      label: "Total Episodes",
      value: totalEps,
      subtext: `${animeList.length} series tracked`,
      icon: "📺",
      href: "/anime",
      color: isCyber ? "#BF5FFF" : "#FFD166",
    },
    {
      label: "Media Tracked",
      value: totalDramas,
      subtext: `${watchingDramaCount} currently watching`,
      icon: "🎬",
      href: "/drama",
      color: isCyber ? "#EF476F" : "#EF476F",
    },
    {
      label: "Hall of Fame",
      value: hallOfFame.length,
      subtext: topHof ? `#1: ${topHof.name}` : "Legends inductee",
      icon: "🏆",
      href: "/hall-of-fame",
      color: isCyber ? "#FFD700" : "#D97706",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-6">
      {/* ── 1. Command Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-2"
      >
        <div>
          <motion.p
            className="text-xs font-bold tracking-widest uppercase mb-1"
            animate={{ color: isCyber ? "rgba(0,245,255,0.6)" : "rgba(0,0,0,0.5)" }}
          >
            {formattedDate}
          </motion.p>
          <motion.h1
            className="font-black text-2xl md:text-3xl"
            animate={{
              color: isCyber ? "#E0E8FF" : "#1A1A1A",
              fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
              letterSpacing: isCyber ? "0.04em" : "0em",
            }}
            transition={{ duration: 0.4 }}
          >
            {greeting}
          </motion.h1>
        </div>

        <div className="text-right hidden sm:block">
          <span
            className="text-xs font-mono px-3 py-1 rounded-full border"
            style={{
              backgroundColor: isCyber ? "rgba(0,245,255,0.08)" : "#F1F5F9",
              borderColor: isCyber ? "rgba(0,245,255,0.25)" : "#CBD5E1",
              color: isCyber ? "#00F5FF" : "#334155",
            }}
          >
            COMMAND CENTER · 14 MODULES ACTIVE
          </span>
        </div>
      </motion.div>

      {/* ── 2. Top Metrics Bar (5 Enriched Tiles) ── */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
        variants={gridContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={cardVariants}>
            <Link href={stat.href}>
              <motion.div
                className="rounded-xl p-4 flex flex-col justify-between h-full cursor-pointer transition-all"
                animate={{
                  background: isCyber ? `${stat.color}0D` : `${stat.color}12`,
                  border: isCyber ? `1px solid ${stat.color}35` : `2.5px solid ${stat.color}`,
                  boxShadow: isCyber ? `0 0 20px ${stat.color}15` : `3.5px 3.5px 0 rgba(0,0,0,1)`,
                }}
                transition={{ duration: 0.3 }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: isCyber ? `0 0 30px ${stat.color}30` : `5px 5px 0 rgba(0,0,0,1)`,
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                  <motion.span
                    className="font-black text-2xl md:text-3xl leading-none"
                    animate={{
                      color: stat.color,
                      textShadow: isCyber ? `0 0 12px ${stat.color}` : "none",
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    {stat.value}
                  </motion.span>
                </div>
                <div className="mt-2">
                  <p className="text-xs font-bold theme-text-primary truncate">{stat.label}</p>
                  <p className="text-[10px] theme-text-muted truncate mt-0.5">{stat.subtext}</p>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* ── 3. Quick Actions Toolbar ── */}
      <QuickActionsToolbar />

      {/* ── 4. Core Identity & Progression Grid (Profile | Radar | Anime Progress) ── */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
        variants={gridContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Profile Card */}
        <div className="md:col-span-2 xl:col-span-1">
          <ProfileCard />
        </div>

        {/* Game Radar Chart */}
        <motion.div variants={cardVariants}>
          <BentoCard id="radar-card" noHover>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">📡</span>
              <div>
                <h4
                  className="font-black text-sm theme-text-primary"
                  style={{ fontFamily: isCyber ? "var(--font-orbitron)" : "inherit" }}
                >
                  {isCyber ? "GENRE.RADAR" : "Genre Activity"}
                </h4>
                <p className="theme-text-muted text-xs">Gaming ecosystem spread</p>
              </div>
            </div>
            <GameRadarChart />
          </BentoCard>
        </motion.div>

        {/* Anime Episodes Progress Chart */}
        <motion.div variants={cardVariants}>
          <BentoCard id="anime-chart-card" noHover>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">📺</span>
              <div>
                <h4
                  className="font-black text-sm theme-text-primary"
                  style={{ fontFamily: isCyber ? "var(--font-orbitron)" : "inherit" }}
                >
                  {isCyber ? "ANIME.PROGRESS" : "Episode Progress"}
                </h4>
                <p className="theme-text-muted text-xs">{totalEps} total eps watched</p>
              </div>
            </div>
            <AnimeBarChart />
          </BentoCard>
        </motion.div>
      </motion.div>

      {/* ── 5. Today's Mission / Focus Control ── */}
      <FocusWidget />

      {/* ── 6. ▶ Continue Watching & Next Up ── */}
      <ContinueWatchingSection />

      {/* ── 7. // Hall of Fame · Live Trends (5 Cards) ── */}
      <HofLiveTrendsSection />

      {/* ── 8. Domain Overview Cards ── */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
        variants={gridContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={cardVariants}><GameDBCard /></motion.div>
        <motion.div variants={cardVariants}><MediaLogCard /></motion.div>
        <motion.div variants={cardVariants} className="md:col-span-2"><AnimeZoneCard /></motion.div>
      </motion.div>

      {/* ── 9. Live System Activity & System Pulse Telemetry ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <LiveActivityFeed />
        <SystemPulseCard />
      </div>

      {/* ── 10. System Status Bar & Footer ── */}
      <SystemStatusBar />

      <motion.footer
        className="mt-6 pb-2 text-center text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 0.8 }}
      >
        <span style={{ color: isCyber ? "rgba(0,245,255,0.4)" : "rgba(0,0,0,0.35)" }}>
          {isCyber
            ? "NEXUS XENON COMMAND CENTER v12.8.0 // ALL SYSTEMS OPERATIONAL"
            : "Nexus Xenon Command Center v12.8.0 · All Systems Operational"}
        </span>
      </motion.footer>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardContent />
    </AppShell>
  );
}
