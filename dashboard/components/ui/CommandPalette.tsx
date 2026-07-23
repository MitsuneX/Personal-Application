"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/theme";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  url: string;
}

interface SearchResponse {
  links?: SearchResult[];
  notes?: SearchResult[];
  games?: SearchResult[];
  anime?: SearchResult[];
  dramas?: SearchResult[];
  characters?: SearchResult[];
  talent?: SearchResult[];
  gallery?: SearchResult[];
  songs?: SearchResult[];
  prompts?: SearchResult[];
  hobbies?: SearchResult[];
  profile?: SearchResult[];
}

export function CommandPalette() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse>({});

  const [activeIndex, setActiveIndex] = useState(0);

  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle Command Palette with Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    const handleCustomOpen = () => {
      setIsOpen(true);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", handleCustomOpen);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", handleCustomOpen);
    };
  }, []);

  // Autofocus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      setQuery("");
      setResults({});
      setActiveIndex(0);
    }
  }, [isOpen]);

  // Debounced search fetching
  useEffect(() => {
    if (!query.trim()) {
      setResults({});
      setLoading(false);
      return;
    }

    setLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
        setActiveIndex(0);
      } catch (err) {
        console.error("Failed to query search:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Flattened items list across all categories for keyboard navigation
  const categories = [
    { label: "Bookmarks & Links", data: results.links || [], icon: "🔗" },
    { label: "Notepad Workspaces", data: results.notes || [], icon: "📝" },
    { label: "Games HUD", data: results.games || [], icon: "🎮" },
    { label: "Anime Series", data: results.anime || [], icon: "⛩️" },
    { label: "Dramas & Series", data: results.dramas || [], icon: "🎬" },
    { label: "Music Vault", data: results.songs || [], icon: "🎵" },
    { label: "Media Gallery", data: results.gallery || [], icon: "🖼️" },
    { label: "Favorite Characters", data: results.characters || [], icon: "📖" },
    { label: "Hall of Fame", data: results.talent || [], icon: "🏆" },
    { label: "Saved AI Prompts", data: results.prompts || [], icon: "🤖" },
    { label: "Hobby Skills", data: results.hobbies || [], icon: "🎯" },
    { label: "User Profiles", data: results.profile || [], icon: "👤" },
  ];

  const flattenedList: { item: SearchResult; categoryLabel: string }[] = [];
  categories.forEach((cat) => {
    cat.data.forEach((item) => {
      flattenedList.push({ item, categoryLabel: cat.label });
    });
  });

  // Handle keyboard events (ArrowUp, ArrowDown, Enter)
  useEffect(() => {
    const handleNavigation = (e: KeyboardEvent) => {
      if (!isOpen || flattenedList.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % flattenedList.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + flattenedList.length) % flattenedList.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = flattenedList[activeIndex];
        if (selected) {
          router.push(selected.item.url);
          setIsOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleNavigation);
    return () => window.removeEventListener("keydown", handleNavigation);
  }, [isOpen, activeIndex, flattenedList, router]);

  // Styles
  const overlayBg = isCyber ? "rgba(2, 5, 15, 0.75)" : "rgba(0, 0, 0, 0.6)";
  const modalStyle: React.CSSProperties = isCyber
    ? {
        background: "rgba(5, 8, 22, 0.95)",
        borderColor: "rgba(0, 245, 255, 0.3)",
        borderWidth: "1px",
        boxShadow: "0 0 40px rgba(0, 245, 255, 0.15)",
        color: "#E0E8FF",
        fontFamily: "var(--font-jetbrains-mono)",
      }
    : {
        background: "#FFFCDE",
        borderColor: "#000000",
        borderWidth: "4px",
        boxShadow: "8px 8px 0px #000000",
        color: "#1A1A1A",
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[12vh] px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-auto"
            style={{ backgroundColor: overlayBg, backdropFilter: isCyber ? "blur(8px)" : "none" }}
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-2xl rounded-xl overflow-hidden pointer-events-auto flex flex-col max-h-[65vh]"
            style={modalStyle}
          >
            {/* Input Bar */}
            <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: isCyber ? "rgba(0,245,255,0.15)" : "#000" }}>
              <span className="text-lg">🔍</span>
              <input
                ref={inputRef}
                type="text"
                placeholder={isCyber ? "RUN COMMAND / SEARCH ALL REGISTRIES..." : "Search bookmarks, games, notes, anime..."}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm font-semibold p-1"
                style={{ color: isCyber ? "#00F5FF" : "#000" }}
              />
              <div 
                className="text-[9px] px-2 py-1 rounded font-bold font-mono tracking-wider select-none shrink-0 cursor-pointer"
                onClick={() => setIsOpen(false)}
                style={{
                  background: isCyber ? "rgba(0,245,255,0.1)" : "#E5E7EB",
                  color: isCyber ? "#00F5FF" : "#4B5563",
                  border: isCyber ? "1px solid rgba(0,245,255,0.25)" : "1.5px solid #000"
                }}
              >
                ESC
              </div>
            </div>

            {/* Results Panel */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
              {loading && (
                <div className="flex items-center justify-center py-10 gap-2.5">
                  <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin text-cyan-400" />
                  <span className="text-xs font-bold font-mono tracking-wider opacity-60">
                    {isCyber ? "SCANNING_CHANNELS..." : "Searching databases..."}
                  </span>
                </div>
              )}

              {!loading && query.trim() !== "" && flattenedList.length === 0 && (
                <div className="text-center py-10 space-y-1">
                  <p className="text-2xl mb-1">📡</p>
                  <p className="text-xs font-black uppercase tracking-widest opacity-60" style={{ color: isCyber ? "#00F5FF" : "#000" }}>
                    {isCyber ? "NO_COORDINATES_FOUND" : "No matching records found"}
                  </p>
                  <p className="text-[11px] opacity-40">Try searching for keywords like "Database", "Anime", "RPG", "Link", etc.</p>
                </div>
              )}

              {!loading && query.trim() === "" && (
                <div className="space-y-4 py-2 select-none">
                  <div className="text-center py-3">
                    <p className="text-xl mb-1">⌨️</p>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-60">
                      {isCyber ? "GLOBAL_COMMAND_CENTER_INDEX" : "Search files, bookmarks, entries, and logs"}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[9px] font-black tracking-widest uppercase pb-1 border-b"
                      style={{
                        color: isCyber ? "rgba(0,245,255,0.4)" : "#6B7280",
                        borderColor: isCyber ? "rgba(0,245,255,0.1)" : "rgba(0,0,0,0.06)",
                      }}
                    >
                      ⚡ Quick System Navigation
                    </div>

                    {[
                      { title: "🔗 Bookmarks Directory & Links", subtitle: "Browse saved websites, databases, productivity & tools", url: "/links" },
                      { title: "📜 Log Updates (Changelog)", subtitle: "View system release notes, v2.5.0 features & bug fixes", url: "/changelog" },
                      { title: "🎵 Music Vault & Synced Lyrics", subtitle: "Open music workspace, search & synced lyrics", url: "/music" },
                      { title: "🏆 Hall of Fame", subtitle: "Browse GOAT status rankings & champion entries", url: "/hall-of-fame" },
                      { title: "👤 Profile Settings", subtitle: "Customize your avatar, banner, bio & tags", url: "/profile" },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          router.push(item.url);
                          setIsOpen(false);
                        }}
                        className="p-2.5 rounded-lg cursor-pointer flex justify-between items-center transition-all duration-100 hover:bg-cyan-500/10"
                        style={{
                          border: isCyber ? "1px solid rgba(0,245,255,0.15)" : "2px solid #000",
                        }}
                      >
                        <div className="min-w-0 flex-1 pr-4">
                          <p className="text-xs font-black truncate" style={{ color: isCyber ? "#00F5FF" : "#000" }}>
                            {item.title}
                          </p>
                          <p className="text-[10px] opacity-70 truncate font-medium">{item.subtitle}</p>
                        </div>
                        <span className="text-[9px] font-mono tracking-wider opacity-60 uppercase shrink-0">
                          GO ↵
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!loading && flattenedList.length > 0 && (
                <div className="space-y-4">
                  {categories.map((cat) => {
                    if (cat.data.length === 0) return null;
                    return (
                      <div key={cat.label} className="space-y-1.5">
                        <div 
                          className="text-[9px] font-black tracking-widest uppercase pb-1 border-b flex items-center justify-between"
                          style={{
                            color: isCyber ? "rgba(0,245,255,0.5)" : "#6B7280",
                            borderColor: isCyber ? "rgba(0,245,255,0.1)" : "rgba(0,0,0,0.06)"
                          }}
                        >
                          <span>{cat.icon} {cat.label}</span>
                          <span className="text-[9px] opacity-60">{cat.data.length} match(es)</span>
                        </div>

                        <div className="space-y-1">
                          {cat.data.map((item) => {
                            const indexInFlattened = flattenedList.findIndex(
                              (f) => f.item.id === item.id && f.categoryLabel === cat.label
                            );
                            const isActive = indexInFlattened === activeIndex;

                            return (
                              <div
                                key={item.id}
                                onClick={() => {
                                  router.push(item.url);
                                  setIsOpen(false);
                                }}
                                onMouseEnter={() => setActiveIndex(indexInFlattened)}
                                className="p-2.5 rounded-lg cursor-pointer flex justify-between items-center transition-all duration-100 select-none"
                                style={{
                                  background: isActive
                                    ? isCyber
                                      ? "rgba(0,245,255,0.15)"
                                      : "#FFD700"
                                    : "transparent",
                                  border: isCyber
                                    ? `1px solid ${isActive ? "rgba(0,245,255,0.4)" : "transparent"}`
                                    : `2px solid ${isActive ? "#000" : "transparent"}`,
                                  boxShadow: isActive && !isCyber ? "2px 2px 0px #000" : "none"
                                }}
                              >
                                <div className="min-w-0 flex-1 pr-4">
                                  <p 
                                    className="text-xs font-black truncate"
                                    style={{
                                      color: isActive
                                        ? isCyber ? "#00F5FF" : "#000"
                                        : isCyber ? "#E0E8FF" : "#1A1A1A"
                                    }}
                                  >
                                    {item.title}
                                  </p>
                                  <p className="text-[10px] truncate mt-0.5 font-semibold opacity-70">
                                    {item.subtitle}
                                  </p>
                                </div>
                                <span 
                                  className="text-[9px] font-mono tracking-wider opacity-70 uppercase shrink-0"
                                  style={{
                                    color: isActive && isCyber ? "#00F5FF" : undefined
                                  }}
                                >
                                  {isActive ? "↵ NAVIGATE" : "VIEW"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-black/10 dark:bg-white/5 border-t text-[9px] font-mono flex justify-between items-center px-4 select-none" style={{ borderColor: isCyber ? "rgba(0,245,255,0.12)" : "#000" }}>
              <div className="flex gap-3">
                <span>↑↓ navigate</span>
                <span>↵ select</span>
              </div>
              <div>
                <span>CTRL + K to close</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
