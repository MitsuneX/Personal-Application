"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { Modal } from "@/components/ui/modal";
import type { AnimeEntry, AnimeStatus } from "@/lib/store/dashboardStore";

interface SearchResult {
  id: string;
  title: string;
  year: string;
  type: "Movie" | "Series";
  poster: string | null;
  overview: string;
  cast: string[];
  genre: string;
  rating: string;
  director?: string;
}

interface AnimeSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ANIME_STATUS_OPTIONS: { value: AnimeStatus; label: string; color: string; bg: string }[] = [
  { value: "Watching",      label: "▶ Watching",      color: "#00F5FF", bg: "rgba(0,245,255,0.12)" },
  { value: "Completed",     label: "✓ Completed",     color: "#39FF14", bg: "rgba(57,255,20,0.12)" },
  { value: "On Hold",       label: "⏸ On Hold",       color: "#FFD166", bg: "rgba(255,209,102,0.12)" },
  { value: "Plan to Watch", label: "◷ Plan to Watch", color: "#BF5FFF", bg: "rgba(191,95,255,0.12)" },
  { value: "Dropped",       label: "✕ Dropped",       color: "#FF073A", bg: "rgba(255,7,58,0.12)" },
];

const resultItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: "spring" as const, stiffness: 400, damping: 28 },
  },
};

const resultsContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const previewVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 20 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 26 },
  },
  exit: { opacity: 0, scale: 0.96, y: -10, transition: { duration: 0.15 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  visible: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { type: "spring" as const, stiffness: 280, damping: 22 },
  },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const posterVariants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1, scale: 1,
    transition: { type: "spring" as const, stiffness: 240, damping: 22, delay: 0.05 },
  },
};

export function AnimeSearchModal({ isOpen, onClose }: AnimeSearchModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { addAnime } = useDashboardStore();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [noApiKey, setNoApiKey] = useState(false);

  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [animeStatus, setAnimeStatus] = useState<AnimeStatus>("Watching");
  const [episodesWatched, setEpisodesWatched] = useState(0);
  const [totalEpisodes, setTotalEpisodes] = useState(12);
  const [userRating, setUserRating] = useState<number>(8);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      setQuery("");
      setResults([]);
      setSelected(null);
      setSavedSuccess(false);
      setSearchError(null);
      setNoApiKey(false);
      setAnimeStatus("Watching");
      setEpisodesWatched(0);
      setTotalEpisodes(12);
      setUserRating(8);
    }
  }, [isOpen]);

  useEffect(() => {
    if (animeStatus === "Completed" && totalEpisodes > 0) {
      setEpisodesWatched(totalEpisodes);
    }
  }, [animeStatus, totalEpisodes]);

  const handleQueryChange = useCallback((val: string) => {
    setQuery(val);
    setSelected(null);
    setSavedSuccess(false);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (val.trim().length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const res = await fetch(`/api/media/search?query=${encodeURIComponent(val.trim())}`);
        const data = await res.json();

        if (data.error) {
          if (data.error.includes("OMDB_API_KEY")) {
            setNoApiKey(true);
          } else {
            setSearchError(data.error);
          }
          setResults([]);
        } else {
          setResults(data.results ?? []);
          setNoApiKey(false);
        }
      } catch {
        setSearchError("Network error — please try again.");
      } finally {
        setIsSearching(false);
      }
    }, 350);
  }, []);

  const handleSelect = (result: SearchResult) => {
    setSelected(result);
    setResults([]);
    setQuery(result.title);
  };

  const handleSave = async () => {
    if (!selected) return;
    setIsSaving(true);

    const entry: AnimeEntry = {
      id: `anime-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: selected.title,
      episodesWatched: Number(episodesWatched),
      totalEpisodes: Number(totalEpisodes),
      status: animeStatus,
      rating: Number(userRating),
      genre: selected.genre ? selected.genre.split(",")[0].trim() : "Action",
      studio: selected.director || "Unknown Studio",
      year: selected.year ? parseInt(selected.year.slice(0, 4)) : undefined,
    };

    await addAnime(entry);
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setSelected(null);
      setQuery("");
      setResults([]);
      onClose();
    }, 1800);
  };

  const C = isCyber
    ? {
        bg: "rgba(5,8,22,0.97)",
        surface: "rgba(0,245,255,0.03)",
        border: "rgba(0,245,255,0.2)",
        accent: "#00F5FF",
        inputBg: "rgba(0,245,255,0.05)",
        inputBorder: "rgba(0,245,255,0.3)",
        text: "#E0FFFF",
        muted: "rgba(0,245,255,0.5)",
        resultHover: "rgba(0,245,255,0.07)",
        selectedBorder: "rgba(0,245,255,0.5)",
      }
    : {
        bg: "#FFFBF5",
        surface: "rgba(0,0,0,0.03)",
        border: "rgba(0,0,0,0.12)",
        accent: "#FF6B35",
        inputBg: "#FFF",
        inputBorder: "rgba(0,0,0,0.25)",
        text: "#111",
        muted: "rgba(0,0,0,0.45)",
        resultHover: "rgba(255,107,53,0.07)",
        selectedBorder: "#FF6B35",
      };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
      <div className="flex flex-col rounded-2xl overflow-hidden">
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <div className="flex items-center gap-2">
            <motion.span
              className="text-2xl"
              animate={isCyber ? { filter: "drop-shadow(0 0 8px rgba(0,245,255,0.7))" } : {}}
            >
              🌸
            </motion.span>
            <div>
              <h2
                className="font-black text-base leading-tight"
                style={{
                  color: C.text,
                  fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
                }}
              >
                {isCyber ? "ANIME.SEARCH" : "Anime Database Search"}
              </h2>
              <p className="text-xs" style={{ color: C.muted }}>
                Enshrine series or movies via OMDb
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
            style={{
              background: isCyber ? "rgba(255,0,60,0.1)" : "rgba(0,0,0,0.08)",
              color: isCyber ? "#FF073A" : "#666",
              border: isCyber ? "1px solid rgba(255,0,60,0.3)" : "1.5px solid rgba(0,0,0,0.2)",
            }}
          >
            ✕
          </button>
        </div>

        <div className="px-6 pt-4 pb-2 shrink-0">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder={isCyber ? "SEARCH TITLE (e.g. Naruto, Hunter x Hunter)..." : "Search anime title..."}
              className="w-full rounded-xl px-4 py-3 pr-10 text-sm font-mono outline-none transition-all"
              style={{
                background: C.inputBg,
                border: `1.5px solid ${query ? C.selectedBorder : C.inputBorder}`,
                color: C.text,
                fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
              }}
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <motion.div
                  className="w-4 h-4 rounded-full border-2"
                  style={{ borderColor: `${C.accent} transparent ${C.accent} transparent` }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
              </div>
            )}
          </div>

          {noApiKey && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              className="mt-2 px-3 py-2 rounded-lg text-xs"
              style={{ background: "rgba(255,200,0,0.1)", color: "#FFD700", border: "1px solid rgba(255,200,0,0.3)" }}
            >
              ⚠️ OMDB_API_KEY not active. Add it to <code>.env.local</code>.
            </motion.div>
          )}

          {searchError && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-1 text-xs" style={{ color: "#FF073A" }}>
              ⚠ {searchError}
            </motion.p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 max-h-[60vh]">
          <AnimatePresence>
            {results.length > 0 && !selected && (
              <motion.div
                className="mt-2 rounded-xl overflow-hidden"
                style={{ border: `1px solid ${C.border}` }}
                variants={resultsContainerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
              >
                {results.map((result, i) => (
                  <motion.button
                    key={result.id}
                    variants={resultItemVariants}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                    style={{
                      borderBottom: i < results.length - 1 ? `1px solid ${C.border}` : "none",
                    }}
                    whileHover={{ backgroundColor: C.resultHover }}
                    onClick={() => handleSelect(result)}
                  >
                    <div
                      className="w-10 h-14 rounded-md shrink-0 overflow-hidden flex items-center justify-center text-2xl"
                      style={{ background: isCyber ? "rgba(0,245,255,0.05)" : "rgba(0,0,0,0.06)", border: `1px solid ${C.border}` }}
                    >
                      {result.poster ? (
                        <img src={result.poster} alt={result.title} className="w-full h-full object-cover" />
                      ) : (
                        <span>🌸</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold truncate" style={{ color: C.text }}>
                        {result.title}
                      </p>
                      <p className="text-xs" style={{ color: C.muted }}>
                        {result.year} · {result.type} · {result.genre || "—"}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {selected && !savedSuccess && (
              <motion.div
                key="preview"
                variants={previewVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mt-3 rounded-2xl overflow-hidden"
                style={{
                  background: C.surface,
                  border: `1.5px solid ${C.selectedBorder}`,
                }}
              >
                <div className="flex flex-col sm:flex-row gap-0">
                  {selected.poster && (
                    <motion.div className="shrink-0 w-full sm:w-32" variants={posterVariants} initial="hidden" animate="visible">
                      <img src={selected.poster} alt={selected.title} className="w-full h-full object-cover" style={{ minHeight: "140px" }} />
                    </motion.div>
                  )}
                  <motion.div className="flex-1 p-4" variants={staggerContainer} initial="hidden" animate="visible">
                    <motion.div variants={staggerItem} className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-black text-lg leading-tight" style={{ color: C.text }}>{selected.title}</h3>
                        <p className="text-xs mt-0.5 font-mono" style={{ color: C.muted }}>
                          {selected.year} · {selected.type} · {selected.genre || "—"}
                        </p>
                      </div>
                    </motion.div>
                    {selected.overview && (
                      <motion.p variants={staggerItem} className="text-xs mt-2 leading-relaxed line-clamp-3" style={{ color: C.muted }}>
                        {selected.overview}
                      </motion.p>
                    )}
                  </motion.div>
                </div>

                <div className="px-4 pb-4 pt-4 space-y-4" style={{ borderTop: `1px solid ${C.border}` }}>
                  <div>
                    <p className="text-xs font-bold uppercase mb-2" style={{ color: C.muted }}>Watching Status</p>
                    <div className="flex flex-wrap gap-2">
                      {ANIME_STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setAnimeStatus(opt.value)}
                          className="text-xs px-3 py-1.5 rounded-full font-bold transition-all"
                          style={{
                            background: animeStatus === opt.value ? opt.bg : "transparent",
                            color: animeStatus === opt.value ? opt.color : C.muted,
                            border: `1.5px solid ${animeStatus === opt.value ? opt.color : C.border}`,
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.muted }}>Watched Episodes</label>
                      <input
                        type="number"
                        min={0}
                        max={totalEpisodes}
                        value={episodesWatched}
                        onChange={(e) => setEpisodesWatched(Math.max(0, parseInt(e.target.value) || 0))}
                        className="px-3 py-2 text-xs font-semibold rounded-lg border outline-none bg-black/5 dark:bg-white/5 border-adaptive-unique"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.muted }}>Total Episodes</label>
                      <input
                        type="number"
                        min={1}
                        value={totalEpisodes}
                        onChange={(e) => setTotalEpisodes(Math.max(1, parseInt(e.target.value) || 1))}
                        className="px-3 py-2 text-xs font-semibold rounded-lg border outline-none bg-black/5 dark:bg-white/5 border-adaptive-unique"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.muted }}>Rating (1 - 10)</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={userRating}
                        onChange={(e) => setUserRating(Math.max(1, Math.min(10, parseInt(e.target.value) || 8)))}
                        className="px-3 py-2 text-xs font-semibold rounded-lg border outline-none bg-black/5 dark:bg-white/5 border-adaptive-unique"
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full py-3 rounded-xl font-black text-sm tracking-wide transition-all"
                    style={{
                      background: isCyber ? "linear-gradient(135deg, rgba(0,245,255,0.2), rgba(191,95,255,0.2))" : "#FF6B35",
                      color: isCyber ? "#00F5FF" : "#FFF",
                      border: isCyber ? "1.5px solid rgba(0,245,255,0.4)" : "2px solid #000",
                      boxShadow: isCyber ? "0 0 20px rgba(0,245,255,0.15)" : "3px 3px 0 #000",
                    }}
                  >
                    {isSaving ? "SAVING..." : "＋ Add to Anime Log"}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {savedSuccess && (
              <motion.div
                key="success"
                variants={previewVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mt-3 rounded-2xl p-8 text-center"
                style={{
                  background: isCyber ? "rgba(57,255,20,0.05)" : "rgba(57,255,20,0.08)",
                  border: `1.5px solid ${isCyber ? "rgba(57,255,20,0.4)" : "#2E8B10"}`,
                }}
              >
                <motion.div className="text-5xl mb-3" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}>
                  ✅
                </motion.div>
                <p className="font-black text-lg" style={{ color: isCyber ? "#39FF14" : "#2E8B10" }}>
                  {isCyber ? "ANIME REGISTERED" : "Added to watchlist!"}
                </p>
                <p className="text-sm mt-1" style={{ color: isCyber ? "rgba(57,255,20,0.6)" : "#555" }}>
                  {selected?.title} · Rating ★{userRating}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Modal>
  );
}
