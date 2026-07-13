"use client";

import React from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { ProfileCard } from "@/components/cards/ProfileCard";
import { GameDBCard } from "@/components/cards/GameDBCard";
import { MediaLogCard } from "@/components/cards/MediaLogCard";
import { AnimeZoneCard } from "@/components/cards/AnimeZoneCard";
import { useTheme } from "@/lib/theme";
import { gridContainerVariants } from "@/lib/theme/motionVariants";

export default function DashboardPage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  return (
    <AppShell>
      {/* ── Page Title Row ── */}
      <motion.div
        className="flex items-center justify-between mb-5 md:mb-6"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.1 }}
      >
        <div>
          <motion.h1
            className="font-black text-xl md:text-2xl lg:text-3xl leading-tight"
            animate={{
              fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
              color: isCyber ? "#E0E8FF" : "#1A1A1A",
              letterSpacing: isCyber ? "0.06em" : "0em",
            }}
            transition={{ duration: 0.45 }}
          >
            {isCyber ? "// COMMAND CENTER" : "My Dashboard"}
          </motion.h1>
          <motion.p
            className="text-sm mt-0.5"
            animate={{ color: isCyber ? "rgba(0,245,255,0.55)" : "rgba(0,0,0,0.45)" }}
            transition={{ duration: 0.4 }}
          >
            {isCyber
              ? `SYS::${new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase()}`
              : new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
          </motion.p>
        </div>

        {/* Quick stats row */}
        <QuickStats isCyber={isCyber} />
      </motion.div>

      {/* ── Bento Grid ── */}
      <motion.div
        id="bento-grid"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 lg:gap-6"
        variants={gridContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Profile Card — spans 2 cols on md+ */}
        <div className="col-span-1 md:col-span-2">
          <ProfileCard />
        </div>

        {/* Game DB Card */}
        <div className="col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-2">
          <GameDBCard />
        </div>

        {/* Media Log Card — spans 2 cols on lg+ */}
        <div className="col-span-1 md:col-span-1 lg:col-span-2 xl:col-span-2">
          <MediaLogCard />
        </div>

        {/* Anime Zone Card — spans 2 cols on md, 1 on lg */}
        <div className="col-span-1 md:col-span-2 lg:col-span-1 xl:col-span-2">
          <AnimeZoneCard />
        </div>
      </motion.div>

      {/* ── Footer ── */}
      <motion.footer
        className="mt-8 pb-4 flex items-center justify-center gap-2 text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        <span style={{ color: isCyber ? "rgba(0,245,255,0.4)" : "rgba(0,0,0,0.3)" }}>
          {isCyber
            ? "NEXUS v1.0.0 // BUILT WITH NEXT.JS + FRAMER MOTION"
            : "Dashboard v1.0.0 · Built with Next.js + Framer Motion"}
        </span>
      </motion.footer>
    </AppShell>
  );
}

// ─── Quick Stats Widget ────────────────────────────────────────────────────────

function QuickStats({ isCyber }: { isCyber: boolean }) {
  const stats = [
    { label: "Cards", value: "4", icon: "⊞" },
    { label: "Games", value: "4", icon: "🎮" },
    { label: "Anime", value: "5", icon: "⛩" },
  ];

  return (
    <motion.div
      className="hidden md:flex items-center gap-2"
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          className="flex flex-col items-center px-3 py-1.5 rounded-lg"
          animate={{
            background: isCyber ? "rgba(0,245,255,0.05)" : "rgba(0,0,0,0.04)",
            border: isCyber ? "1px solid rgba(0,245,255,0.2)" : "2px solid rgba(0,0,0,0.12)",
          }}
          transition={{ duration: 0.4 }}
          whileHover={{ scale: 1.05 }}
        >
          <span className="text-base leading-none mb-0.5">{stat.icon}</span>
          <span
            className="font-black text-sm leading-none"
            style={{ color: isCyber ? "#00F5FF" : "#FF6B35" }}
          >
            {stat.value}
          </span>
          <span className="text-xs theme-text-muted">{stat.label}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}
