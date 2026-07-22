"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { usePathname, useRouter } from "next/navigation";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { ProfileEditorModal } from "@/components/ui/ProfileEditorModal";
import { ThemeSwitcherToggle } from "@/components/ui/ThemeSwitcherToggle";
import { ProfileHoverPopover } from "@/components/ui/ProfileHoverPopover";
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
  "/heroes":            { title: "Heroes Registry", icon: "🛡️" },
  "/profile":           { title: "Profile Panel", icon: "👤" },
  "/notepad":           { title: "Notepad Workspace", icon: "📝" },
  "/links":             { title: "Bookmark Directory", icon: "🔗" },
  "/gallery":           { title: "Media Gallery", icon: "🖼️" },
};

export function Header({ onMenuToggle, mobileOpen = false }: HeaderProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const pathname = usePathname();
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // States
  const [editorOpen, setEditorOpen] = useState(false);
  const [aestheticsOpen, setAestheticsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  // Data Selectors
  const { profile, games, animeList, dramas, hallOfFame } = useDashboardStore();
  const avatar = profile.avatar || "/avatar.png";

  const pageInfo = PAGE_TITLES[pathname] ?? { title: "Dashboard", icon: "🏠" };

  // Handle Search Filtering
  const searchResults: Array<{ id: string; name: string; type: string; url: string; detail?: string }> = [];

  if (searchQuery.trim().length > 1) {
    const query = searchQuery.toLowerCase();

    // Search Games
    games.forEach((g) => {
      if (g.game.toLowerCase().includes(query) || g.mainCharacter.toLowerCase().includes(query) || g.category.toLowerCase().includes(query)) {
        searchResults.push({ id: g.id, name: g.game, type: "Game", url: "/games", detail: `${g.rank || ""} · ${g.mainCharacter}` });
      }
    });

    // Search Anime
    animeList.forEach((a) => {
      if (a.title.toLowerCase().includes(query) || (a.genre && a.genre.toLowerCase().includes(query)) || (a.studio && a.studio.toLowerCase().includes(query))) {
        searchResults.push({ id: a.id, name: a.title, type: "Anime", url: "/anime", detail: `${a.status} · ${a.episodesWatched}/${a.totalEpisodes} eps` });
      }
    });

    // Search Drama
    dramas.forEach((d) => {
      if (d.title.toLowerCase().includes(query) || d.genre.toLowerCase().includes(query) || d.country.toLowerCase().includes(query)) {
        searchResults.push({ id: d.id, name: d.title, type: "Drama", url: `/drama/${d.country}`, detail: `${d.country.toUpperCase()} · ${d.status} (${d.episodesWatched}/${d.episodes})` });
      }
    });

    // Search Hall of Fame
    hallOfFame.forEach((h) => {
      if (h.name.toLowerCase().includes(query) || h.knownFor.some((w) => w.toLowerCase().includes(query))) {
        searchResults.push({ id: h.id, name: h.name, type: "Hall of Fame", url: "/hall-of-fame", detail: `${h.type.toUpperCase()} · ${h.status}` });
      }
    });
  }

  // Click outside search listener
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const handleResultClick = (url: string) => {
    router.push(url);
    setSearchQuery("");
    setShowResults(false);
  };

  return (
    <>
      <motion.header
        className="flex items-center justify-between px-4 md:px-6 h-16 shrink-0 relative z-30"
        animate={{
          backgroundColor: isCyber ? "rgba(5,8,22,0.85)" : "rgba(255,245,228,0.92)",
          borderBottomColor: isCyber ? "rgba(0,245,255,0.15)" : "#000000",
          backdropFilter: isCyber ? "blur(20px)" : "blur(0px)",
        }}
        transition={{ duration: 0.4 }}
        style={{ borderBottomWidth: "2px", borderBottomStyle: "solid" }}
      >
        {/* Left Section: Hamburger & Icon */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Animated Hamburger / Close button */}
          <motion.button
            className="md:hidden p-2 rounded-lg flex flex-col items-center justify-center gap-[4px] w-9 h-9"
            onClick={onMenuToggle}
            whileTap={{ scale: 0.88 }}
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

          {/* Mobile search icon (sm and below only) */}
          <motion.button
            className="sm:hidden p-2 rounded-lg"
            onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
            whileTap={{ scale: 0.88 }}
            animate={{ color: isCyber ? "#00F5FF" : "#4A4A4A" }}
            aria-label="Search"
          >
            <span className="text-base">🔍</span>
          </motion.button>

          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="flex items-center gap-2"
          >
            <span className="text-lg">{pageInfo.icon}</span>
            <motion.h1
              className="font-black text-sm md:text-base lg:text-lg"
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
        <div className="flex-1 max-w-md mx-6 hidden sm:block relative">
          <div 
            onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
            className="w-full pl-9 pr-3 py-1.5 text-xs font-mono font-bold tracking-wide rounded-lg border outline-none transition-all flex items-center justify-between cursor-pointer"
            style={{
              backgroundColor: isCyber ? "rgba(0,245,255,0.03)" : "#FFF9F0",
              borderColor: isCyber ? "rgba(0,245,255,0.25)" : "#000000",
              color: isCyber ? "#00F5FF" : "#1A1A1A",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="opacity-70">🔍</span>
              <span className="opacity-50">{isCyber ? "SEARCH_REGISTRY..." : "Search dashboard..."}</span>
            </div>
            <span 
              className="text-[9px] px-1.5 py-0.5 rounded font-black border uppercase tracking-wider shrink-0"
              style={{
                backgroundColor: isCyber ? "rgba(0,245,255,0.1)" : "#E5E7EB",
                borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#D1D5DB",
                color: isCyber ? "#00F5FF" : "#4B5563"
              }}
            >
              Ctrl + K
            </span>
          </div>
        </div>

        {/* Right Section: customizable profile, topbar player, and clock */}
        <div className="flex items-center gap-3 shrink-0">
          <TopbarMiniPlayer />
          {isCyber && <CyberClock />}

          {/* Theme switcher toggle added in the Header */}
          <ThemeSwitcherToggle />

          {/* Settings gear dropdown menu */}
          <SettingsDropdown onOpenAesthetics={() => setAestheticsOpen(true)} />

          {/* Customizable Profile Header Item */}
          <ProfileHoverPopover
            onOpenAesthetics={() => setAestheticsOpen(true)}
            placement="down-left"
          >
            <Link href="/profile">
              <motion.div
                className="flex items-center gap-2 cursor-pointer p-1 rounded-lg border border-transparent transition-all"
                whileHover={{
                  borderColor: isCyber ? "rgba(0,245,255,0.25)" : "#000000",
                  backgroundColor: isCyber ? "rgba(0,245,255,0.05)" : "rgba(0,0,0,0.05)",
                }}
              >
                {/* Customizable Profile Picture */}
                <div className="relative w-8 h-8 rounded-full overflow-hidden border-2"
                  style={{
                    borderColor: isCyber ? "#00F5FF" : "#FF6B35",
                    boxShadow: isCyber ? "0 0 10px rgba(0,245,255,0.5)" : "none",
                  }}
                >
                  <Image
                    src={avatar}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                    priority
                    sizes="32px"
                  />
                </div>

                {/* Custom Name */}
                <span className="text-xs font-black hidden lg:inline-block" style={{ color: isCyber ? "#E0E8FF" : "#1A1A1A" }}>
                  {profile.name}
                </span>
              </motion.div>
            </Link>
          </ProfileHoverPopover>

          {/* Status dot */}
          <Link href="/profile">
            {(() => {
              const s = (profile.status || "online").toLowerCase();
              const isBusy = s.includes("busy");
              const isAfk = s.includes("afk") || s.includes("away") || s.includes("idle");
              const color = isBusy ? "#EF4444" : isAfk ? "#F59E0B" : "#22C55E";
              const label = isBusy ? "BUSY" : isAfk ? "AFK" : "ONLINE";
              const bg = isBusy
                ? (isCyber ? "rgba(239,68,68,0.12)" : "#FEE2E2")
                : isAfk
                ? (isCyber ? "rgba(245,158,11,0.12)" : "#FEF3C7")
                : (isCyber ? "rgba(34,197,94,0.12)" : "#DCFCE7");

              return (
                <motion.div
                  className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full cursor-pointer border"
                  style={{
                    backgroundColor: bg,
                    borderColor: color,
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: color, boxShadow: isCyber ? `0 0 8px ${color}` : "none" }}
                  />
                  <span className="text-[10px] font-black uppercase tracking-wider" style={{ color }}>
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

function CyberClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded font-mono text-[10px] font-black tracking-widest border border-cyber-neon"
      style={{ color: "#00F5FF", border: "1px solid rgba(0,245,255,0.25)", background: "rgba(0,245,255,0.05)", letterSpacing: "0.12em" }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#00F5FF] animate-pulse" />
      {time}
    </motion.div>
  );
}
