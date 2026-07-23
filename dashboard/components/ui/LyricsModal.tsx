"use client";

import React, { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import { useTheme } from "@/lib/theme";
import type { LyricLine } from "@/app/api/music/lyrics/route";

interface LyricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackTitle: string | null;
  artistName: string | null;
  currentTime?: number;
}

// Module-level in-memory cache for fetched lyrics to prevent API quota waste
const lyricsCache = new Map<string, any>();

export function LyricsModal({
  isOpen,
  onClose,
  trackTitle,
  artistName,
  currentTime = 0,
}: LyricsModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const [loading, setLoading] = useState(false);
  const [lyricsData, setLyricsData] = useState<{
    isFallback?: boolean;
    isSynced?: boolean;
    provider?: string;
    title?: string;
    artist?: string;
    headerImage?: string;
    message?: string;
    lines?: LyricLine[];
  } | null>(null);

  const lineRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const fetchLyrics = (forceRefresh = false) => {
    if (!trackTitle) return;
    const cacheKey = `${artistName || ""}_${trackTitle}`.toLowerCase().trim();

    // Instant return if cached in memory and not forcing refresh
    if (!forceRefresh && lyricsCache.has(cacheKey)) {
      console.log(`[LyricsModal] ⚡ Using cached lyrics for "${trackTitle}"`);
      setLyricsData(lyricsCache.get(cacheKey));
      setLoading(false);
      return;
    }

    setLoading(true);

    fetch(`/api/music/lyrics?track=${encodeURIComponent(trackTitle)}&artist=${encodeURIComponent(artistName || "")}`)
      .then((res) => res.json())
      .then((data) => {
        setLyricsData(data);
        lyricsCache.set(cacheKey, data);
      })
      .catch(() => {
        const fallbackData = {
          isFallback: true,
          isSynced: false,
          title: trackTitle,
          artist: artistName || "Unknown Artist",
          message: "No lyrics found for this track. Try searching manually or check back later.",
          lines: [],
        };
        setLyricsData(fallbackData);
        lyricsCache.set(cacheKey, fallbackData);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen && trackTitle) {
      fetchLyrics();
    }
  }, [isOpen, trackTitle, artistName]);

  // ── Determine active line index based on playback currentTime ─────────────
  const lines = lyricsData?.lines || [];
  let activeIndex = 0;
  if (lines.length > 0) {
    for (let i = 0; i < lines.length; i++) {
      if (currentTime >= lines[i].time) {
        activeIndex = i;
      }
    }
  }

  // ── Smooth auto-scroll active line into center of container ───────────────
  useEffect(() => {
    if (isOpen && lines.length > 0 && lineRefs.current[activeIndex]) {
      lineRefs.current[activeIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeIndex, isOpen, lines.length]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      <div className="p-5 md:p-6 space-y-4 select-none">
        {/* Header */}
        <div
          className="flex justify-between items-center pb-3 border-b"
          style={{ borderColor: isCyber ? "rgba(0,245,255,0.25)" : "#000000" }}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-xl animate-pulse">🎤</span>
            <div>
              <h2
                className="text-base font-black tracking-wide truncate max-w-xs flex items-center gap-2"
                style={{
                  fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
                  color: isCyber ? "#00F5FF" : "#000000",
                }}
              >
                <span className="truncate">{trackTitle || "Lyrics"}</span>
                {lyricsData?.isSynced && (
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider shrink-0 border"
                    style={{
                      backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#FFD700",
                      borderColor: isCyber ? "#00F5FF" : "#000000",
                      color: isCyber ? "#00F5FF" : "#000000",
                    }}
                  >
                    Synced
                  </span>
                )}
              </h2>
              <p className="text-[11px] font-semibold opacity-70 truncate" style={{ color: isCyber ? "#94A3B8" : "#444444" }}>
                {artistName || "Artist"} {lyricsData?.provider ? `• ${lyricsData.provider}` : ""}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-xl border flex items-center justify-center text-xs font-black transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            style={{
              backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#E5E7EB",
              borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#000000",
              color: isCyber ? "#E0E8FF" : "#000000",
            }}
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 mx-auto border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono font-bold tracking-wider opacity-70 animate-pulse" style={{ color: isCyber ? "#00F5FF" : "#000000" }}>
              Multi-Pass Search & Synchronizing Lyrics...
            </p>
          </div>
        ) : lyricsData?.isFallback || lines.length === 0 ? (
          /* Graceful Fallback State View */
          <div
            className="p-6 rounded-2xl border text-center space-y-4"
            style={{
              backgroundColor: isCyber ? "rgba(5, 8, 22, 0.85)" : "#FFF9F0",
              borderColor: isCyber ? "rgba(0, 245, 255, 0.25)" : "#000000",
              borderWidth: isCyber ? "1px" : "2.5px",
              boxShadow: isCyber ? "0 0 15px rgba(0,245,255,0.1)" : "4px 4px 0px #000000",
            }}
          >
            <div className="text-3xl">🎶</div>
            <div className="space-y-1">
              <h3 className="font-black text-sm" style={{ color: isCyber ? "#E0E8FF" : "#000000" }}>
                No Synced Lyrics Found
              </h3>
              <p className="text-xs font-medium opacity-75 max-w-xs mx-auto leading-relaxed" style={{ color: isCyber ? "#94A3B8" : "#444444" }}>
                {lyricsData?.message || "No lyrics found for this track. Try searching manually or check back later."}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => fetchLyrics(true)}
                className="px-3.5 py-1.5 text-xs font-black rounded-xl border transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
                style={{
                  backgroundColor: isCyber ? "rgba(0, 245, 255, 0.15)" : "#FF6B35",
                  borderColor: isCyber ? "#00F5FF" : "#000000",
                  color: isCyber ? "#00F5FF" : "#FFFFFF",
                  boxShadow: isCyber ? "0 0 10px rgba(0,245,255,0.2)" : "2px 2px 0 #000000",
                }}
              >
                🔄 Retry Search
              </button>
              <a
                href={`https://genius.com/search?q=${encodeURIComponent(`${artistName || ""} ${trackTitle || ""}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 text-xs font-black rounded-xl border transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
                style={{
                  backgroundColor: isCyber ? "rgba(255, 255, 255, 0.05)" : "#E5E7EB",
                  borderColor: isCyber ? "rgba(255, 255, 255, 0.2)" : "#000000",
                  color: isCyber ? "#E0E8FF" : "#000000",
                }}
              >
                🌐 Genius Direct
              </a>
            </div>
          </div>
        ) : (
          /* Active Time-Synced Karaoke Lyrics List */
          <div className="space-y-4">
            {lyricsData?.headerImage && (
              <div className="w-full h-24 md:h-28 rounded-xl overflow-hidden border relative bg-black/30 shrink-0">
                <img src={lyricsData.headerImage} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-3">
                  <p className="text-xs font-black text-white truncate">{lyricsData.title} • {lyricsData.artist}</p>
                </div>
              </div>
            )}

            {/* Karaoke-Style Synced Lyric Lines Container */}
            <div
              className="p-4 rounded-2xl border max-h-80 overflow-y-auto space-y-3 scroll-smooth"
              style={{
                backgroundColor: isCyber ? "rgba(5, 8, 22, 0.85)" : "#F9F9F9",
                borderColor: isCyber ? "rgba(0, 245, 255, 0.25)" : "#000000",
                borderWidth: isCyber ? "1px" : "2.5px",
                boxShadow: isCyber ? "0 0 20px rgba(0,245,255,0.1)" : "4px 4px 0px #000000",
              }}
            >
              {lines.map((line, idx) => {
                const isActive = idx === activeIndex;
                const isSectionHeader = line.original.startsWith("[") && line.original.endsWith("]");

                if (isSectionHeader) {
                  return (
                    <div
                      key={line.id}
                      className="pt-3 pb-1 font-mono text-[10px] font-black uppercase tracking-widest opacity-60 text-cyan-400"
                    >
                      {line.original}
                    </div>
                  );
                }

                return (
                  <div
                    key={line.id}
                    ref={(el) => {
                      lineRefs.current[idx] = el;
                    }}
                    className={`p-3 rounded-xl transition-all duration-300 border ${
                      isActive ? "scale-[1.02] shadow-lg" : "opacity-45 hover:opacity-75"
                    }`}
                    style={{
                      backgroundColor: isActive
                        ? (isCyber ? "rgba(0, 245, 255, 0.15)" : "#FFF3E0")
                        : "transparent",
                      borderColor: isActive
                        ? (isCyber ? "#00F5FF" : "#000000")
                        : "transparent",
                      borderWidth: isActive ? (isCyber ? "1.5px" : "2.5px") : "1px",
                      boxShadow: isActive
                        ? (isCyber ? "0 0 18px rgba(0,245,255,0.35)" : "3px 3px 0 #000000")
                        : "none",
                      color: isActive
                        ? (isCyber ? "#00F5FF" : "#FF6B35")
                        : (isCyber ? "#E0E8FF" : "#1A1A1A"),
                    }}
                  >
                    {/* Original Line */}
                    <p
                      className={`font-black text-xs md:text-sm ${isActive ? "tracking-wide" : ""}`}
                      style={{ textShadow: isActive && isCyber ? "0 0 10px #00F5FF" : "none" }}
                    >
                      {line.original}
                    </p>

                    {/* Romanized / Romaji / Pinyin Transcription Line */}
                    {line.romanized && (
                      <p
                        className="text-[10px] font-semibold italic opacity-85 mt-1"
                        style={{ color: isCyber ? "#A5F3FC" : "#7C2D12" }}
                      >
                        {line.romanized}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
