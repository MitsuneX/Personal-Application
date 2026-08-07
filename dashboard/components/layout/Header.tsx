"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { usePathname, useRouter } from "next/navigation";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { ProfileEditorModal } from "@/components/ui/ProfileEditorModal";
import { ThemeSwitcherToggle } from "@/components/ui/ThemeSwitcherToggle";
import { FloatingPopover } from "@/components/ui/FloatingPopover";
import { ProfilePopoutCard } from "@/components/profile/ProfilePopoutCard";
import { AestheticsModal } from "@/components/ui/AestheticsModal";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { TopbarMiniPlayer } from "@/components/ui/TopbarMiniPlayer";
import { SettingsDropdown } from "@/components/ui/SettingsDropdown";
import Link from "next/link";
import Image from "next/image";

interface HeaderProps {
  onMenuToggle: () => void;
  mobileOpen?: boolean;
}

const PAGE_TITLES: Record<string, { title: string; icon: string }> = {
  "/":                  { title: "Dashboard",    icon: "🏠" },
  "/anime":             { title: "Anime Zone",   icon: "⛩️" },
  "/drama":             { title: "Drama Hub",    icon: "🎬" },
  "/drama/japanese":    { title: "Japanese Drama", icon: "🇯🇵" },
  "/drama/korean":      { title: "Korean Drama", icon: "🇰🇷" },
  "/drama/chinese":     { title: "Chinese Drama", icon: "🇨🇳" },
  "/drama/indonesia":   { title: "Indonesian Drama", icon: "🇮🇩" },
  "/hall-of-fame":      { title: "Hall of Fame", icon: "🏆" },
  "/games":             { title: "Games HUD",    icon: "🎮" },
  "/game-characters":   { title: "Game Characters", icon: "⚔️" },
  "/heroes":            { title: "Game Database Hub", icon: "📊" },
  "/profile":           { title: "Profile Panel", icon: "👤" },
  "/notepad":           { title: "Notepad Workspace", icon: "📝" },
  "/links":             { title: "Bookmark Directory", icon: "🔗" },
  "/gallery":           { title: "Media Gallery", icon: "🖼️" },
};

function NotificationBell() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { notifications = [], dismissNotification, clearNotifications } = useDashboardStore();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <FloatingPopover
      placement="bottom-end"
      triggerMode="hover-or-click"
      offsetDistance={12}
      content={() => (
        <div
          className="w-80 p-4 rounded-2xl flex flex-col gap-3 shadow-2xl backdrop-blur-xl font-mono"
          style={{
            background: isCyber ? "rgba(5,8,22,0.96)" : "#FFFFFF",
            border: isCyber ? "1px solid rgba(0,245,255,0.3)" : "3px solid #000000",
            boxShadow: isCyber ? "0 0 30px rgba(0,245,255,0.2)" : "5px 5px 0 #000000",
            color: isCyber ? "#E0E8FF" : "#000000",
          }}
        >
          <div className="flex items-center justify-between pb-2" style={{ borderBottom: isCyber ? "1px solid rgba(0,245,255,0.15)" : "2px dashed #000000" }}>
            <div className="flex items-center gap-2">
              <span className="text-base">🔔</span>
              <h3 className="font-black text-xs uppercase tracking-wider" style={{ color: isCyber ? "#00F5FF" : "#000000" }}>
                Notifications
              </h3>
            </div>
            {notifications.length > 0 && (
              <button
                onClick={() => clearNotifications()}
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded hover:opacity-80 transition-opacity"
                style={{
                  color: isCyber ? "#FF0055" : "#EF4444",
                  background: isCyber ? "rgba(255,0,85,0.1)" : "#FEE2E2",
                }}
              >
                Clear All
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1 font-mono custom-scrollbar">
            {notifications.length === 0 ? (
              <p className="text-[11px] font-bold text-center py-6" style={{ color: isCyber ? "rgba(255,255,255,0.4)" : "#8A8A8A" }}>
                No notifications right now.
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-2.5 rounded-xl flex items-start gap-2.5"
                  style={{
                    background: isCyber ? "rgba(255,255,255,0.03)" : "#FFF9F0",
                    border: isCyber ? "1px solid rgba(255,255,255,0.08)" : "1.5px solid #000000",
                  }}
                >
                  <span className="text-sm mt-0.5">
                    {n.type === "streak" ? "🔥" : n.type === "milestone" ? "⚡" : n.type === "reminder" ? "⏰" : "ℹ️"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[11px] font-black leading-tight" style={{ color: isCyber ? "#FFF" : "#000" }}>
                      {n.title}
                    </h4>
                    <p className="text-[10px] font-bold mt-0.5 leading-snug" style={{ color: isCyber ? "rgba(255,255,255,0.6)" : "#555" }}>
                      {n.message}
                    </p>
                  </div>
                  <button
                    onClick={() => dismissNotification(n.id)}
                    className="text-xs opacity-40 hover:opacity-100 p-0.5 shrink-0"
                    title="Dismiss"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    >
      <motion.button
        whileHover={{ scale: 1.05, y: -1 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="w-10 h-10 rounded-xl flex items-center justify-center relative cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 shrink-0"
        style={{
          backgroundColor: isCyber ? "rgba(0,245,255,0.05)" : "#FFF9F0",
          borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000000",
          borderWidth: isCyber ? "1px" : "2px",
          color: isCyber ? "#00F5FF" : "#000000",
          boxShadow: isCyber ? "0 0 12px rgba(0,245,255,0.15)" : "2.5px 2.5px 0 #000000",
        }}
        aria-label="Notifications"
      >
        <span className="text-base">🔔</span>
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-mono font-black flex items-center justify-center"
            style={{
              background: isCyber ? "#FF0055" : "#FF6B35",
              color: "#FFFFFF",
              border: isCyber ? "1px solid rgba(255,255,255,0.6)" : "1.5px solid #000000",
              boxShadow: isCyber ? "0 0 8px rgba(255,0,85,0.6)" : "none",
            }}
          >
            {unreadCount}
          </span>
        )}
      </motion.button>
    </FloatingPopover>
  );
}

function HeaderClock() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ scale: 1.04, y: -1 }}
      className="hidden sm:flex items-center gap-2 h-10 px-3 rounded-xl font-mono text-[11px] font-black tracking-widest border shrink-0 cursor-default select-none"
      style={{
        backgroundColor: isCyber ? "rgba(0,245,255,0.05)" : "#FFF9F0",
        borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000000",
        borderWidth: isCyber ? "1px" : "2px",
        color: isCyber ? "#00F5FF" : "#000000",
        boxShadow: isCyber ? "0 0 12px rgba(0,245,255,0.15)" : "2.5px 2.5px 0 #000000",
        letterSpacing: "0.1em",
      }}
    >
      <span
        className="w-2 h-2 rounded-full animate-pulse shrink-0"
        style={{
          backgroundColor: isCyber ? "#00F5FF" : "#10B981",
          boxShadow: isCyber ? "0 0 8px #00F5FF" : "none",
        }}
      />
      <span>{time || "00:00:00"}</span>
    </motion.div>
  );
}

export function Header({ onMenuToggle, mobileOpen = false }: HeaderProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const pathname = usePathname();

  // States
  const [editorOpen, setEditorOpen] = useState(false);
  const [aestheticsOpen, setAestheticsOpen] = useState(false);

  // Data Selectors
  const { profile } = useDashboardStore();
  const avatar = profile.avatar || "/avatar.png";

  const pageInfo = PAGE_TITLES[pathname] ?? { title: "Dashboard", icon: "🏠" };

  return (
    <>
      <motion.header
        className="flex items-center justify-between px-4 md:px-6 h-16 shrink-0 relative z-30 border-b-2 border-solid"
        animate={{
          backgroundColor: isCyber ? "rgba(5,8,22,0.85)" : "rgba(255,245,228,0.92)",
          borderBottomColor: isCyber ? "rgba(0,245,255,0.15)" : "#000000",
          backdropFilter: isCyber ? "blur(20px)" : "blur(0px)",
        }}
        transition={{ duration: 0.4 }}
      >
        {/* Left Section: Hamburger & Page Title */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Mobile Menu Hamburger button */}
          <motion.button
            className="md:hidden p-2 rounded-xl flex flex-col items-center justify-center gap-[4px] w-10 h-10 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            onClick={onMenuToggle}
            whileTap={{ scale: 0.92 }}
            animate={{ color: isCyber ? "#94A3B8" : "#4A4A4A" }}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <motion.span
              className="block h-0.5 w-5 rounded-full origin-center"
              animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              style={{ backgroundColor: "currentColor" }}
            />
            <motion.span
              className="block h-0.5 w-5 rounded-full"
              animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.15 }}
              style={{ backgroundColor: "currentColor" }}
            />
            <motion.span
              className="block h-0.5 w-5 rounded-full origin-center"
              animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              style={{ backgroundColor: "currentColor" }}
            />
          </motion.button>

          {/* Mobile search icon button */}
          <motion.button
            className="sm:hidden w-10 h-10 rounded-xl flex items-center justify-center border cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.94 }}
            style={{
              backgroundColor: isCyber ? "rgba(0,245,255,0.05)" : "#FFF9F0",
              borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000000",
              borderWidth: isCyber ? "1px" : "2px",
              color: isCyber ? "#00F5FF" : "#000000",
              boxShadow: isCyber ? "0 0 12px rgba(0,245,255,0.15)" : "2.5px 2.5px 0 #000000",
            }}
            aria-label="Search dashboard"
          >
            <span className="text-base">🔍</span>
          </motion.button>

          {/* Title Banner */}
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="flex items-center gap-2.5"
          >
            <span className="text-lg md:text-xl">{pageInfo.icon}</span>
            <motion.h1
              className="font-black text-sm md:text-base lg:text-lg tracking-tight"
              animate={{
                color: isCyber ? "#E0E8FF" : "#1A1A1A",
                fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
                letterSpacing: isCyber ? "0.06em" : "0em",
              }}
              transition={{ duration: 0.4 }}
            >
              {isCyber ? pageInfo.title.toUpperCase() : pageInfo.title}
            </motion.h1>
          </motion.div>
        </div>

        {/* Middle Section: Search Bar Triggering Command Palette */}
        <div className="flex-1 max-w-md mx-4 md:mx-6 hidden sm:block relative">
          <motion.div
            onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
            whileHover={{ scale: 1.015, y: -1 }}
            whileTap={{ scale: 0.985 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            tabIndex={0}
            role="button"
            aria-label="Open search command palette"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                window.dispatchEvent(new Event("open-command-palette"));
              }
            }}
            className="w-full h-10 pl-3.5 pr-3 py-2 text-xs font-mono font-bold tracking-wide rounded-xl border outline-none transition-all flex items-center justify-between cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400"
            style={{
              backgroundColor: isCyber ? "rgba(0,245,255,0.04)" : "#FFF9F0",
              borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000000",
              borderWidth: isCyber ? "1px" : "2px",
              boxShadow: isCyber ? "0 0 15px rgba(0,245,255,0.12)" : "2.5px 2.5px 0 #000000",
              color: isCyber ? "#00F5FF" : "#000000",
            }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm shrink-0 opacity-80">🔍</span>
              <span className="opacity-60 truncate">
                {isCyber ? "SEARCH_REGISTRY..." : "Search dashboard..."}
              </span>
            </div>
            <span
              className="text-[9px] px-2 py-0.5 rounded-md font-black border uppercase tracking-wider shrink-0 ml-2"
              style={{
                backgroundColor: isCyber ? "rgba(0,245,255,0.12)" : "#E5E7EB",
                borderColor: isCyber ? "rgba(0,245,255,0.4)" : "#000000",
                borderWidth: isCyber ? "1px" : "1.5px",
                color: isCyber ? "#00F5FF" : "#000000",
                boxShadow: isCyber ? "none" : "1px 1px 0 #000000",
              }}
            >
              Ctrl + K
            </span>
          </motion.div>
        </div>

        {/* Right Section: Mini Player, Clock, Notifications, Theme, Settings, Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          <TopbarMiniPlayer />
          <HeaderClock />

          {/* Notification Bell */}
          <NotificationBell />

          {/* Theme Switcher Toggle */}
          <ThemeSwitcherToggle />

          {/* Settings Gear Dropdown */}
          <SettingsDropdown onOpenAesthetics={() => setAestheticsOpen(true)} />

          {/* Customizable Profile Card Popover */}
          <FloatingPopover
            placement="bottom-end"
            triggerMode="hover-or-click"
            offsetDistance={12}
            content={({ close }) => (
              <ProfilePopoutCard
                onOpenAesthetics={() => setAestheticsOpen(true)}
                onClose={close}
              />
            )}
          >
            <motion.div
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              tabIndex={0}
              role="button"
              aria-label="Open profile popover"
              className="flex items-center gap-2.5 h-10 px-2.5 rounded-xl border transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 select-none font-mono"
              style={{
                backgroundColor: isCyber ? "rgba(0,245,255,0.05)" : "#FFF9F0",
                borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000000",
                borderWidth: isCyber ? "1px" : "2px",
                boxShadow: isCyber ? "0 0 12px rgba(0,245,255,0.15)" : "2.5px 2.5px 0 #000000",
              }}
            >
              {/* Customizable Avatar */}
              <div
                className="relative w-7 h-7 rounded-full overflow-hidden border shrink-0"
                style={{
                  borderColor: isCyber ? "#00F5FF" : "#000000",
                  boxShadow: isCyber ? "0 0 8px rgba(0,245,255,0.6)" : "none",
                }}
              >
                <Image
                  src={avatar}
                  alt="Profile Avatar"
                  width={28}
                  height={28}
                  className="w-full h-full object-cover"
                  priority
                  sizes="28px"
                />
              </div>

              {/* Custom Username */}
              <span
                className="text-xs font-black hidden lg:inline-block truncate"
                style={{ color: isCyber ? "#E0E8FF" : "#000000" }}
              >
                {profile.name}
              </span>
            </motion.div>
          </FloatingPopover>

          {/* Status Badge */}
          <Link href="/profile" className="shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-full">
            {(() => {
              const s = (profile.status || "online").toLowerCase();
              const isBusy = s.includes("busy") || s.includes("dnd");
              const isAfk = s.includes("afk") || s.includes("away") || s.includes("idle");
              const isOffline = s.includes("offline");
              const isFocus = s.includes("focus");
              const isStreaming = s.includes("stream");

              let color = "#22C55E";
              let label = "ONLINE";
              let bgCyber = "rgba(34,197,94,0.12)";
              let bgNeo = "#DCFCE7";

              if (isBusy) {
                color = "#EF4444";
                label = "BUSY";
                bgCyber = "rgba(239,68,68,0.12)";
                bgNeo = "#FEE2E2";
              } else if (isAfk) {
                color = "#F59E0B";
                label = "AWAY";
                bgCyber = "rgba(245,158,11,0.12)";
                bgNeo = "#FEF3C7";
              } else if (isFocus) {
                color = "#A855F7";
                label = "FOCUS";
                bgCyber = "rgba(168,85,247,0.12)";
                bgNeo = "#F3E8FF";
              } else if (isStreaming) {
                color = "#EC4899";
                label = "LIVE";
                bgCyber = "rgba(236,72,153,0.12)";
                bgNeo = "#FCE7F3";
              } else if (isOffline) {
                color = "#94A3B8";
                label = "OFFLINE";
                bgCyber = "rgba(148,163,184,0.12)";
                bgNeo = "#F1F5F9";
              }

              return (
                <motion.div
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="hidden lg:flex items-center gap-2 h-10 px-3 rounded-full cursor-pointer border select-none font-mono"
                  style={{
                    backgroundColor: isCyber ? bgCyber : bgNeo,
                    borderColor: isCyber ? color : "#000000",
                    borderWidth: isCyber ? "1px" : "2px",
                    boxShadow: isCyber ? `0 0 12px ${color}30` : "2.5px 2.5px 0 #000000",
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full animate-pulse shrink-0"
                    style={{
                      backgroundColor: color,
                      boxShadow: isCyber ? `0 0 8px ${color}` : "none",
                    }}
                  />
                  <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: isCyber ? color : "#000000" }}>
                    {label}
                  </span>
                </motion.div>
              );
            })()}
          </Link>
        </div>
      </motion.header>

      {/* Editor Modal */}
      <ProfileEditorModal isOpen={editorOpen} onClose={() => setEditorOpen(false)} />

      {/* Aesthetics Dialog */}
      <AestheticsModal isOpen={aestheticsOpen} onClose={() => setAestheticsOpen(false)} />

      {/* Global Command Palette */}
      <CommandPalette />
    </>
  );
}
