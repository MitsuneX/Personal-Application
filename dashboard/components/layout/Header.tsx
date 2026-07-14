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
import Link from "next/link";

interface HeaderProps {
  onMenuToggle: () => void;
}

const PAGE_TITLES: Record<string, { title: string; icon: string }> = {
  "/":                  { title: "Dashboard",    icon: "🏠" },
  "/anime":             { title: "Anime Zone",   icon: "⛩️" },
  "/drama":             { title: "Drama Hub",    icon: "🎬" },
  "/drama/japanese":    { title: "Japanese Drama", icon: "🇯🇵" },
  "/drama/korean":      { title: "Korean Drama", icon: "🇰🇷" },
  "/drama/chinese":     { title: "Chinese Drama", icon: "🇨🇳" },
  "/hall-of-fame":      { title: "Hall of Fame", icon: "🏆" },
  "/games":             { title: "Games HUD",    icon: "🎮" },
  "/heroes":            { title: "Heroes Registry", icon: "🛡️" },
  "/profile":           { title: "Profile Panel", icon: "👤" },
  "/notepad":           { title: "Notepad Workspace", icon: "📝" },
  "/links":             { title: "Bookmark Directory", icon: "🔗" },
  "/gallery":           { title: "Media Gallery", icon: "🖼️" },
};

export function Header({ onMenuToggle }: HeaderProps) {
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
          <motion.button
            className="md:hidden p-2 rounded-lg"
            onClick={onMenuToggle}
            whileTap={{ scale: 0.9 }}
            animate={{ color: isCyber ? "#94A3B8" : "#4A4A4A" }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
              <rect y="2" width="18" height="2" rx="1" />
              <rect y="8" width="18" height="2" rx="1" />
              <rect y="14" width="18" height="2" rx="1" />
            </svg>
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

        {/* Middle Section: Search Bar */}
        <div className="flex-1 max-w-md mx-6 hidden sm:block relative" ref={searchRef}>
          <div className="relative">
            <input
              type="text"
              placeholder={isCyber ? "SEARCH_REGISTRY..." : "Search dashboard..."}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              className="w-full pl-9 pr-3 py-1.5 text-xs font-mono font-bold tracking-wide rounded-lg border outline-none transition-all"
              style={{
                backgroundColor: isCyber ? "rgba(0,245,255,0.03)" : "#FFF9F0",
                borderColor: isCyber ? "rgba(0,245,255,0.25)" : "#000000",
                color: isCyber ? "#00F5FF" : "#1A1A1A",
                boxShadow: isCyber && showResults && searchQuery ? "0 0 15px rgba(0,245,255,0.15)" : "none",
              }}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: isCyber ? "#00F5FF" : "#888" }}>
              🔍
            </span>
          </div>

          {/* Search Dropdown Panel */}
          <AnimatePresence>
            {showResults && searchQuery.trim().length > 1 && (
              <motion.div
                className="absolute left-0 right-0 mt-2 rounded-xl p-2 z-50 border max-h-80 overflow-y-auto"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                style={{
                  backgroundColor: isCyber ? "#0A0F2C" : "#FFFFFF",
                  border: isCyber ? "1px solid rgba(0,245,255,0.3)" : "2.5px solid #000000",
                  boxShadow: isCyber ? "0 0 30px rgba(0,245,255,0.2)" : "4px 4px 0px 0px rgba(0,0,0,1)",
                }}
              >
                {searchResults.length === 0 ? (
                  <p className="text-xs p-3 text-center theme-text-muted font-bold font-mono">
                    {isCyber ? "NO_MATCHES_FOUND" : "No results found"}
                  </p>
                ) : (
                  <div className="space-y-0.5">
                    {searchResults.map((res) => (
                      <div
                        key={res.id}
                        onClick={() => handleResultClick(res.url)}
                        className="p-2 rounded-lg cursor-pointer flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        <div>
                          <p className="text-xs font-black theme-text-primary">{res.name}</p>
                          {res.detail && <p className="text-[10px] theme-text-muted mt-0.5">{res.detail}</p>}
                        </div>
                        <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: isCyber ? "rgba(0,245,255,0.1)" : "rgba(0,0,0,0.06)",
                            color: isCyber ? "#00F5FF" : "#FF6B35",
                          }}
                        >
                          {res.type}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Section: customizable profile and clock */}
        <div className="flex items-center gap-3 shrink-0">
          {isCyber && <CyberClock />}

          {/* Theme switcher toggle added in the Header */}
          <ThemeSwitcherToggle />

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
                  <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
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
            <motion.div
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full cursor-pointer"
              animate={{
                backgroundColor: isCyber ? "rgba(34,197,94,0.08)" : "rgba(6,214,160,0.08)",
                borderColor: isCyber ? "rgba(34,197,94,0.25)" : "#06D6A0",
              }}
              style={{ border: "1px solid" }}
              transition={{ duration: 0.4 }}
            >
              <span className="status-dot status-online !w-1.5 !h-1.5" />
              <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: "#22C55E" }}>{profile.status}</span>
            </motion.div>
          </Link>
        </div>
      </motion.header>

      {/* Editor Modal */}
      <ProfileEditorModal isOpen={editorOpen} onClose={() => setEditorOpen(false)} />

      {/* Aesthetics Dialog */}
      <AestheticsModal isOpen={aestheticsOpen} onClose={() => setAestheticsOpen(false)} />
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
