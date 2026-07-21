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
    title?: string;
    artist?: string;
    headerImage?: string;
    lines?: LyricLine[];
  } | null>(null);

  const lineRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (!isOpen || !trackTitle) return;
    setLoading(true);

    fetch(`/api/music/lyrics?track=${encodeURIComponent(trackTitle)}&artist=${encodeURIComponent(artistName || "")}`)
      .then((res) => res.json())
      .then((data) => {
        setLyricsData(data);
      })
      .catch(() => {
        setLyricsData({
          title: trackTitle,
          artist: artistName || "Unknown Artist",
          lines: [{ id: 0, time: 0, original: "Failed to load lyrics." }],
        });
      })
      .finally(() => setLoading(false));
  }, [isOpen, trackTitle, artistName]);

  // Determine active line index based on current player playback time
  const lines = lyricsData?.lines || [];
  let activeIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    if (currentTime >= lines[i].time) {
      activeIndex = i;
    }
  }

  // Smooth auto-scroll active line into center of container
  useEffect(() => {
    if (isOpen && lineRefs.current[activeIndex]) {
      lineRefs.current[activeIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeIndex, isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div
          className="flex justify-between items-center pb-3 border-b"
          style={{ borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000000" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl animate-pulse">🎤</span>
            <div>
              <h2
                className="text-base font-black tracking-wide truncate max-w-xs flex items-center gap-1.5"
                style={{
                  fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
                  color: isCyber ? "#00F5FF" : "#000000",
                }}
              >
                <span>{trackTitle || "Lyrics"}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-cyan-400/20 text-cyan-300 uppercase">Synced</span>
              </h2>
              <p className="text-[10px] font-semibold opacity-70" style={{ color: isCyber ? "#94A3B8" : "#444444" }}>
                {artistName || "Artist"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold opacity-60 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="py-16 text-center text-xs font-bold animate-pulse opacity-60">
            Fetching & synchronizing lyrics...
          </div>
        ) : lines.length > 0 ? (
          <div className="space-y-4">
            {lyricsData?.headerImage && (
              <div className="w-full h-28 rounded-xl overflow-hidden border relative bg-black/20 shrink-0">
                <img src={lyricsData.headerImage} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-3">
                  <p className="text-xs font-black text-white">{lyricsData.title} • {lyricsData.artist}</p>
                </div>
              </div>
            )}

            {/* Karaoke-Style Synced Lyric Lines Container */}
            <div
              className="p-4 rounded-xl border max-h-80 overflow-y-auto space-y-3 scroll-smooth"
              style={{
                backgroundColor: isCyber ? "rgba(5, 8, 22, 0.85)" : "#F9F9F9",
                borderColor: isCyber ? "rgba(0, 245, 255, 0.2)" : "#000000",
              }}
            >
              {lines.map((line, idx) => {
                const isActive = idx === activeIndex;
                const isSectionHeader = line.original.startsWith("[") && line.original.endsWith("]");

                if (isSectionHeader) {
                  return (
                    <div key={line.id} className="pt-2 pb-1 font-mono text-[10px] font-black uppercase tracking-widest opacity-50 text-cyan-400">
                      {line.original}
                    </div>
                  );
                }

                return (
                  <div
                    key={line.id}
                    ref={(el) => { lineRefs.current[idx] = el; }}
                    className={`p-3 rounded-xl transition-all duration-300 border ${
                      isActive ? "scale-[1.02] shadow-lg" : "opacity-50"
                    }`}
                    style={{
                      backgroundColor: isActive
                        ? (isCyber ? "rgba(0, 245, 255, 0.15)" : "#FFF3E0")
                        : "transparent",
                      borderColor: isActive
                        ? (isCyber ? "#00F5FF" : "#000000")
                        : "transparent",
                      borderWidth: isActive ? (isCyber ? "1px" : "2.5px") : "1px",
                      boxShadow: isActive
                        ? (isCyber ? "0 0 15px rgba(0,245,255,0.3)" : "3px 3px 0 #000000")
                        : "none",
                      color: isActive
                        ? (isCyber ? "#00F5FF" : "#FF6B35")
                        : (isCyber ? "#E0E8FF" : "#1A1A1A"),
                    }}
                  >
                    {/* Original Line */}
                    <p className={`font-black text-xs md:text-sm ${isActive ? "tracking-wide" : ""}`} style={{ textShadow: isActive && isCyber ? "0 0 10px #00F5FF" : "none" }}>
                      {line.original}
                    </p>

                    {/* Romanized / Romaji Transcription Line */}
                    {line.romanized && (
                      <p className="text-[10px] font-semibold italic opacity-80 mt-1" style={{ color: isCyber ? "#A5F3FC" : "#7C2D12" }}>
                        {line.romanized}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
