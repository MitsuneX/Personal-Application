"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { Modal } from "@/components/ui/modal";
import type { DramaLogEntry, DramaLogStatus } from "@/lib/store/dashboardStore";

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface DramaSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCountry?: string;
}

// ─── Status Badge Config ──────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: DramaLogStatus; label: string; color: string; bg: string }[] = [
  { value: "GOAT Status", label: "🏆 GOAT Status", color: "#FFD700", bg: "rgba(255,215,0,0.15)" },
  { value: "All-Star",    label: "⭐ All-Star",    color: "#00BFFF", bg: "rgba(0,191,255,0.12)" },
  { value: "Rising",      label: "🚀 Rising",      color: "#39FF14", bg: "rgba(57,255,20,0.1)"  },
  { value: "Classic",     label: "💎 Classic",     color: "#BF5FFF", bg: "rgba(191,95,255,0.1)" },
];

const COUNTRY_OPTIONS = [
  { value: "korean",    label: "🇰🇷 Korean" },
  { value: "japanese",  label: "🇯🇵 Japanese" },
  { value: "chinese",   label: "🇨🇳 Chinese" },
  { value: "hollywood", label: "🎬 Hollywood" },
  { value: "other",     label: "🌐 Other" },
];

// ─── Framer Motion Variants ───────────────────────────────────────────────────

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 24 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: "spring" as const, stiffness: 340, damping: 28, delay: 0.04 },
  },
  exit: {
    opacity: 0, scale: 0.94, y: 16,
    transition: { duration: 0.18 },
  },
};

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

// ─── Main Component ───────────────────────────────────────────────────────────

export function DramaSearchModal({ isOpen, onClose, defaultCountry = "other" }: DramaSearchModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { saveDramaLog } = useDashboardStore();

  // Search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [noApiKey, setNoApiKey] = useState(false);

  // Preview state
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [statusBadge, setStatusBadge] = useState<DramaLogStatus>("All-Star");
  const [country, setCountry] = useState(defaultCountry);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      setQuery("");
      setResults([]);
      setSelected(null);
      setSavedSuccess(false);
      setSearchError(null);
      setNoApiKey(false);
    }
  }, [isOpen]);

  // Debounced search
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

    const entry: DramaLogEntry = {
      id: `drama-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: selected.title,
      type: selected.type,
      releaseYear: selected.year ? parseInt(selected.year.slice(0, 4)) : null,
      plotSummary: selected.overview || null,
      posterUrl: selected.poster || null,
      mainActors: selected.cast.slice(0, 4),
      statusBadge,
      omdbId: selected.id,
      country,
      rating: selected.rating || null,
      createdAt: new Date().toISOString(),
    };

    await saveDramaLog(entry);
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setSelected(null);
      setQuery("");
      setResults([]);
    }, 2200);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // ── Theme helpers ───────────────────────────────────────────────────────────

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
            {/* ── Header ── */}
            <div
              className="flex items-center justify-between px-6 py-4 shrink-0"
              style={{ borderBottom: `1px solid ${C.border}` }}
            >
              <div className="flex items-center gap-2">
                <motion.span
                  className="text-2xl"
                  animate={isCyber ? { filter: "drop-shadow(0 0 8px rgba(191,95,255,0.7))" } : {}}
                >
                  🎬
                </motion.span>
                <div>
                  <h2
                    className="font-black text-base leading-tight"
                    style={{
                      color: C.text,
                      fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
                    }}
                  >
                    {isCyber ? "DRAMA.SEARCH" : "Drama Search"}
                  </h2>
                  <p className="text-xs" style={{ color: C.muted }}>
                    Search any film or series via OMDb
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

            {/* ── Search Input ── */}
            <div className="px-6 pt-4 pb-2 shrink-0">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  placeholder={isCyber ? "SEARCH TITLE..." : "Search drama or movie title..."}
                  className="w-full rounded-xl px-4 py-3 pr-10 text-sm font-mono outline-none transition-all"
                  style={{
                    background: C.inputBg,
                    border: `1.5px solid ${query ? C.selectedBorder : C.inputBorder}`,
                    color: C.text,
                    fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
                    boxShadow: isCyber && query ? `0 0 12px rgba(0,245,255,0.15)` : "none",
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

              {/* No API Key Warning */}
              {noApiKey && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-2 px-3 py-2 rounded-lg text-xs"
                  style={{ background: "rgba(255,200,0,0.1)", color: "#FFD700", border: "1px solid rgba(255,200,0,0.3)" }}
                >
                  ⚠️ <strong>OMDB_API_KEY</strong> not set. Add it to <code>.env.local</code> and restart the server.{" "}
                  <a href="https://www.omdbapi.com/apikey.aspx" target="_blank" rel="noopener noreferrer"
                    className="underline">Get free key →</a>
                </motion.div>
              )}

              {searchError && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mt-1 text-xs" style={{ color: "#FF073A" }}>
                  ⚠ {searchError}
                </motion.p>
              )}
            </div>

            {/* ── Scrollable Content ── */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">

              {/* ── Search Results Dropdown ── */}
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
                        {/* Poster thumbnail */}
                        <div
                          className="w-10 h-14 rounded-md shrink-0 overflow-hidden flex items-center justify-center text-2xl"
                          style={{ background: isCyber ? "rgba(0,245,255,0.05)" : "rgba(0,0,0,0.06)", border: `1px solid ${C.border}` }}
                        >
                          {result.poster ? (
                            <img src={result.poster} alt={result.title}
                              className="w-full h-full object-cover" />
                          ) : (
                            <span>🎬</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold truncate" style={{ color: C.text }}>
                            {result.title}
                          </p>
                          <p className="text-xs" style={{ color: C.muted }}>
                            {result.year} · {result.type} · {result.genre || "—"}
                          </p>
                          {result.rating && (
                            <p className="text-xs font-mono mt-0.5" style={{ color: C.accent }}>
                              ⭐ {result.rating} IMDb
                            </p>
                          )}
                        </div>
                        <span className="text-xs shrink-0 px-2 py-0.5 rounded-full font-mono"
                          style={{ background: C.surface, color: C.muted, border: `1px solid ${C.border}` }}>
                          {result.type === "Series" ? "📺" : "🎥"}
                        </span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* No results message */}
              {query.length >= 2 && !isSearching && results.length === 0 && !selected && !noApiKey && !searchError && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center text-sm py-6" style={{ color: C.muted }}>
                  No results found for &ldquo;{query}&rdquo;
                </motion.p>
              )}

              {/* ── Cinematic Preview Card ── */}
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
                      boxShadow: isCyber ? `0 0 30px rgba(0,245,255,0.1)` : "4px 4px 0 rgba(0,0,0,0.8)",
                    }}
                  >
                    {/* Poster + Info row */}
                    <div className="flex gap-0">
                      {/* Poster */}
                      {selected.poster && (
                        <motion.div
                          className="shrink-0 w-28 sm:w-36"
                          variants={posterVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <img
                            src={selected.poster}
                            alt={selected.title}
                            className="w-full h-full object-cover"
                            style={{ minHeight: "160px" }}
                          />
                        </motion.div>
                      )}

                      {/* Text info */}
                      <motion.div
                        className="flex-1 p-4"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                      >
                        <motion.div variants={staggerItem} className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-black text-lg leading-tight" style={{ color: C.text }}>
                              {selected.title}
                            </h3>
                            <p className="text-xs mt-0.5 font-mono" style={{ color: C.muted }}>
                              {selected.year} · {selected.type} · {selected.genre || "—"}
                            </p>
                          </div>
                          {selected.rating && (
                            <span className="shrink-0 text-xs font-black px-2 py-1 rounded-lg"
                              style={{ background: "rgba(255,215,0,0.15)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.4)" }}>
                              ⭐ {selected.rating}
                            </span>
                          )}
                        </motion.div>

                        {selected.overview && (
                          <motion.p variants={staggerItem}
                            className="text-xs mt-2 leading-relaxed line-clamp-3"
                            style={{ color: C.muted }}>
                            {selected.overview}
                          </motion.p>
                        )}

                        {/* Cast badges */}
                        {selected.cast.length > 0 && (
                          <motion.div variants={staggerItem} className="mt-3 flex flex-wrap gap-1.5">
                            {selected.cast.slice(0, 4).map((actor, i) => (
                              <span key={i}
                                className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{
                                  background: isCyber ? "rgba(191,95,255,0.1)" : "rgba(0,0,0,0.06)",
                                  color: isCyber ? "#BF5FFF" : "#444",
                                  border: `1px solid ${isCyber ? "rgba(191,95,255,0.3)" : "rgba(0,0,0,0.12)"}`,
                                }}>
                                {actor}
                              </span>
                            ))}
                          </motion.div>
                        )}
                      </motion.div>
                    </div>

                    {/* ── Controls ── */}
                    <div className="px-4 pb-4 pt-2 space-y-3" style={{ borderTop: `1px solid ${C.border}` }}>
                      {/* Status badge row */}
                      <div>
                        <p className="text-xs font-bold uppercase mb-2" style={{ color: C.muted }}>
                          Status Badge
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {STATUS_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => setStatusBadge(opt.value)}
                              className="text-xs px-3 py-1.5 rounded-full font-bold transition-all"
                              style={{
                                background: statusBadge === opt.value ? opt.bg : "transparent",
                                color: statusBadge === opt.value ? opt.color : C.muted,
                                border: `1.5px solid ${statusBadge === opt.value ? opt.color : C.border}`,
                                transform: statusBadge === opt.value ? "scale(1.04)" : "scale(1)",
                              }}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Country row */}
                      <div>
                        <p className="text-xs font-bold uppercase mb-2" style={{ color: C.muted }}>
                          Country / Category
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {COUNTRY_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => setCountry(opt.value)}
                              className="text-xs px-3 py-1.5 rounded-full font-bold transition-all"
                              style={{
                                background: country === opt.value
                                  ? (isCyber ? "rgba(0,245,255,0.1)" : "rgba(255,107,53,0.12)")
                                  : "transparent",
                                color: country === opt.value ? C.accent : C.muted,
                                border: `1.5px solid ${country === opt.value ? C.accent : C.border}`,
                              }}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Save button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full py-3 rounded-xl font-black text-sm tracking-wide transition-all"
                        style={{
                          background: isCyber
                            ? "linear-gradient(135deg, rgba(0,245,255,0.2), rgba(191,95,255,0.2))"
                            : "#FF6B35",
                          color: isCyber ? "#00F5FF" : "#FFF",
                          border: isCyber ? "1.5px solid rgba(0,245,255,0.4)" : "2px solid #000",
                          boxShadow: isCyber ? "0 0 20px rgba(0,245,255,0.15)" : "3px 3px 0 #000",
                          opacity: isSaving ? 0.7 : 1,
                          fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
                        }}
                      >
                        {isSaving ? "SAVING..." : isCyber ? "⬆ UPLOAD TO LOG" : "＋ Save to Drama Log"}
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* ── Success State ── */}
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
                    <motion.div
                      className="text-5xl mb-3"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                      ✅
                    </motion.div>
                    <p className="font-black text-lg" style={{ color: isCyber ? "#39FF14" : "#2E8B10" }}>
                      {isCyber ? "LOGGED SUCCESSFULLY" : "Saved to Drama Log!"}
                    </p>
                    <p className="text-sm mt-1" style={{ color: isCyber ? "rgba(57,255,20,0.6)" : "#555" }}>
                      {selected?.title} · {statusBadge}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
    </Modal>
  );
}
