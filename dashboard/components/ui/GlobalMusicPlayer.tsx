"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { useTheme } from "@/lib/theme";
import { usePathname } from "next/navigation";
import { LyricsModal } from "@/components/ui/LyricsModal";
import { useMusicEngine } from "@/lib/context/MusicEngineContext";

export function GlobalMusicPlayer() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const pathname = usePathname();

  const {
    activeTrack,
    isPlaying,
    nextTrack,
    prevTrack,
    togglePlay,
    isShuffle,
    toggleShuffle,
    loopMode,
    cycleLoopMode,
  } = useDashboardStore();

  const {
    currentTime,
    duration,
    volume,
    isMuted,
    setVolume,
    toggleMute,
    seekTo,
  } = useMusicEngine();

  const [lyricsOpen, setLyricsOpen] = useState(false);

  // ── Show player on /music/* or when a track is playing anywhere ───────────
  const isOnMusicPage = pathname.startsWith("/music");
  if (!activeTrack) return null;
  if (!isOnMusicPage && !isPlaying) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "0:00";
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder < 10 ? "0" : ""}${remainder}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seconds = Number(e.target.value);
    seekTo(seconds);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[60] w-[95%] max-w-4xl rounded-2xl border p-3 shadow-2xl backdrop-blur-xl flex flex-wrap md:flex-nowrap items-center justify-between gap-3 md:gap-4 select-none"
          style={{
            backgroundColor: isCyber ? "rgba(5, 8, 22, 0.95)" : "rgba(255, 255, 255, 0.98)",
            borderColor: isCyber ? "rgba(0, 245, 255, 0.4)" : "#000000",
            borderWidth: isCyber ? "1px" : "3px",
            boxShadow: isCyber ? "0 0 30px rgba(0,245,255,0.25)" : "4px 4px 0px #000000",
          }}
        >
          {/* Track Thumbnail & Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1 w-full md:w-auto">
            <div
              className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border relative bg-slate-800 flex items-center justify-center font-bold text-xs"
              style={{ borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000" }}
            >
              {activeTrack.imageUrl ? (
                <img src={activeTrack.imageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>🎵</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4
                className="font-black text-xs md:text-sm truncate"
                style={{ color: isCyber ? "#E0FFFF" : "#000" }}
              >
                {activeTrack.title}
              </h4>
              <p className="text-[11px] font-semibold opacity-70 truncate" style={{ color: isCyber ? "#94A3B8" : "#444" }}>
                {activeTrack.artist} {activeTrack.album ? `• ${activeTrack.album}` : ""}
              </p>
              {/* Keyboard hint */}
              <p className="text-[9px] opacity-30 hidden lg:block">
                Space=Play/Pause · Alt+←/→=Prev/Next · Alt+↑/↓=Vol · Alt+M=Mute
              </p>
            </div>
          </div>

          {/* Timeline & Controls */}
          <div className="flex flex-col items-center gap-1.5 w-full md:flex-1 max-w-md order-3 md:order-none">
            {/* Control Suite Buttons */}
            <div className="flex items-center gap-3">
              {/* Shuffle Toggle */}
              <button
                onClick={toggleShuffle}
                className="text-xs font-black p-1.5 rounded-lg transition-all active:scale-90 cursor-pointer"
                style={{
                  color: isShuffle ? (isCyber ? "#00F5FF" : "#FF6B35") : (isCyber ? "#94A3B8" : "#888"),
                  backgroundColor: isShuffle ? (isCyber ? "rgba(0,245,255,0.15)" : "#FFF3E0") : "transparent",
                }}
                title="Toggle Shuffle (Alt+S)"
              >
                🔀
              </button>

              {/* Prev */}
              <button
                onClick={prevTrack}
                className="text-xs font-black p-1.5 rounded-full transition-transform active:scale-90 hover:opacity-80 cursor-pointer"
                style={{ color: isCyber ? "#00F5FF" : "#000" }}
                title="Previous Track (Alt+←)"
              >
                ⏮
              </button>

              {/* Play / Pause */}
              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black transition-transform active:scale-90 shadow-md cursor-pointer"
                style={{
                  backgroundColor: isCyber ? "#00F5FF" : "#FF6B35",
                  color: isCyber ? "#050816" : "#FFF",
                  boxShadow: isCyber ? "0 0 10px rgba(0,245,255,0.4)" : "2px 2px 0 #000",
                }}
                title={isPlaying ? "Pause (Space)" : "Play (Space)"}
              >
                {isPlaying ? "⏸" : "▶"}
              </button>

              {/* Next */}
              <button
                onClick={nextTrack}
                className="text-xs font-black p-1.5 rounded-full transition-transform active:scale-90 hover:opacity-80 cursor-pointer"
                style={{ color: isCyber ? "#00F5FF" : "#000" }}
                title="Next Track (Alt+→)"
              >
                ⏭
              </button>

              {/* 3-State Loop Toggle */}
              <button
                onClick={cycleLoopMode}
                className="text-xs font-black px-1.5 py-1 rounded-lg transition-all active:scale-90 cursor-pointer flex items-center gap-0.5"
                style={{
                  color: loopMode !== "off" ? (isCyber ? "#00F5FF" : "#FF6B35") : (isCyber ? "#94A3B8" : "#888"),
                  backgroundColor: loopMode !== "off" ? (isCyber ? "rgba(0,245,255,0.15)" : "#FFF3E0") : "transparent",
                }}
                title={`Loop: ${loopMode.toUpperCase()} (Alt+L)`}
              >
                {loopMode === "one" ? "🔂 1" : loopMode === "all" ? "🔁 All" : "🔁"}
              </button>
            </div>

            {/* Scrubbable Progress Timeline */}
            <div className="w-full flex items-center gap-2 text-[10px] font-mono opacity-90">
              <span className="shrink-0">{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 accent-cyan-400 cursor-pointer rounded"
              />
              <span className="shrink-0">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Action Widgets: Volume, Lyrics, Mute */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 order-2 md:order-none">
            {/* Lyrics Button */}
            <button
              onClick={() => setLyricsOpen(true)}
              className="px-2 py-1 text-[10px] sm:text-[11px] font-black rounded-lg border transition-all hover:scale-105 cursor-pointer flex items-center gap-1 shrink-0"
              style={{
                backgroundColor: isCyber ? "rgba(0,245,255,0.1)" : "#F3F4F6",
                borderColor: isCyber ? "#00F5FF" : "#000000",
                color: isCyber ? "#00F5FF" : "#000000",
              }}
              title="View Synced Lyrics"
            >
              🎤 Lyrics
            </button>

            {/* Mute button */}
            <button
              onClick={toggleMute}
              className="text-xs font-bold opacity-80 hover:opacity-100 cursor-pointer hidden xs:inline-block"
              title={isMuted ? "Unmute (Alt+M)" : "Mute (Alt+M)"}
            >
              {isMuted ? "🔇" : "🔊"}
            </button>

            {/* Volume slider */}
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="hidden sm:inline-block w-14 sm:w-16 h-1 accent-cyan-400 cursor-pointer"
              title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Synchronized Lyrics Modal */}
      <LyricsModal
        isOpen={lyricsOpen}
        onClose={() => setLyricsOpen(false)}
        trackTitle={activeTrack.title}
        artistName={activeTrack.artist}
        currentTime={currentTime}
      />
    </>
  );
}
