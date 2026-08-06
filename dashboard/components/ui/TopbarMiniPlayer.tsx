"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { useTheme } from "@/lib/theme";
import { useAmbientColor } from "@/lib/hooks/useAmbientColor";
import { useRouter } from "next/navigation";
import { LyricsModal } from "@/components/ui/LyricsModal";
import { FloatingLayer } from "./FloatingLayer";
import { Z_INDEX } from "./ViewportBoundary";
import { useMusicEngine } from "@/lib/context/MusicEngineContext";

export function TopbarMiniPlayer() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const router = useRouter();

  const {
    activeTrack,
    isPlaying,
    togglePlay,
    nextTrack,
    prevTrack,
    playlistQueue,
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

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [lyricsOpen, setLyricsOpen] = useState(false);
  const ambientColor = useAmbientColor(activeTrack?.imageUrl);

  const triggerRef = useRef<HTMLDivElement>(null);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (!activeTrack) return null;

  return (
    <div ref={triggerRef} className="relative select-none">
      {/* Topbar Compact Badge Pill */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-all"
        style={{
          backgroundColor: isCyber ? "rgba(0, 245, 255, 0.08)" : "#FFF9F0",
          borderColor: isCyber ? "rgba(0, 245, 255, 0.3)" : "#000000",
          borderWidth: isCyber ? "1px" : "2px",
          boxShadow: isCyber ? `0 0 12px ${ambientColor}` : "2px 2px 0 #000000",
        }}
        onClick={() => setPopoverOpen(!popoverOpen)}
      >
        <span className={`text-xs ${isPlaying ? "animate-spin" : ""}`} style={{ animationDuration: "3s" }}>
          🎵
        </span>

        <div className="flex flex-col text-left max-w-[100px] sm:max-w-[150px]">
          <span className="text-[11px] font-black truncate leading-tight" style={{ color: isCyber ? "#00F5FF" : "#000" }}>
            {activeTrack.title}
          </span>
          <span className="text-[9px] font-semibold opacity-70 truncate" style={{ color: isCyber ? "#94A3B8" : "#444" }}>
            {activeTrack.artist}
          </span>
        </div>

        {/* Mini Play / Pause Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-transform active:scale-90"
          style={{
            backgroundColor: isCyber ? "#00F5FF" : "#000000",
            color: isCyber ? "#000000" : "#FFFFFF",
          }}
        >
          {isPlaying ? "⏸" : "▶"}
        </button>

        {/* Lyrics Trigger */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLyricsOpen(true);
          }}
          className="text-xs hover:scale-125 transition-transform"
          title="Open Synced Lyrics"
        >
          🎤
        </button>
      </motion.div>

      {/* Floating Interactive Popover Portal */}
      <FloatingLayer
        isOpen={popoverOpen}
        onClose={() => setPopoverOpen(false)}
        triggerRef={triggerRef}
        placement="bottom-end"
        zIndex={Z_INDEX.POPOVER}
      >
        <div
          className="w-80 p-4 rounded-2xl border shadow-2xl backdrop-blur-xl space-y-3 select-none"
          style={{
            backgroundColor: isCyber ? "rgba(5, 8, 22, 0.96)" : "#FFFFFF",
            borderColor: isCyber ? "rgba(0, 245, 255, 0.4)" : "#000000",
            borderWidth: isCyber ? "1px" : "3px",
            boxShadow: isCyber ? "0 0 25px rgba(0, 245, 255, 0.25)" : "4px 4px 0 #000000",
            color: isCyber ? "#E0FFFF" : "#000000",
          }}
        >
          {/* Header Track Info */}
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border bg-slate-800 flex items-center justify-center font-bold text-xs"
              style={{ borderColor: isCyber ? "rgba(0, 245, 255, 0.3)" : "#000" }}
            >
              {activeTrack.imageUrl ? (
                <img src={activeTrack.imageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>🎵</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-black text-xs truncate" style={{ color: isCyber ? "#E0FFFF" : "#000" }}>
                {activeTrack.title}
              </h4>
              <p className="text-[10px] font-semibold opacity-70 truncate" style={{ color: isCyber ? "#94A3B8" : "#444" }}>
                {activeTrack.artist}
              </p>
            </div>
          </div>

          {/* Timeline Scrubbing Bar */}
          <div className="w-full flex items-center gap-2 text-[10px] font-mono opacity-90 pt-1">
            <span className="shrink-0">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seekTo(parseFloat(e.target.value))}
              className="flex-1 h-1.5 accent-cyan-400 bg-slate-700 rounded-lg cursor-pointer"
            />
            <span className="shrink-0">{formatTime(duration)}</span>
          </div>

          {/* Volume Control Bar */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={toggleMute}
              className="text-xs opacity-70 hover:opacity-100 transition-opacity"
              title="Mute / Unmute"
            >
              {isMuted ? "🔇" : "🔊"}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1 h-1 accent-cyan-400 bg-slate-700 rounded-lg cursor-pointer"
              title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
            />
          </div>

          {/* Media Player Control Buttons */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={toggleShuffle}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                isShuffle ? (isCyber ? "text-cyan-400 font-bold" : "text-black font-black underline") : "opacity-40"
              }`}
              title="Shuffle Playlist"
            >
              🔀
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={prevTrack}
                className="w-8 h-8 rounded-xl flex items-center justify-center border font-bold text-xs hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: isCyber ? "rgba(0, 245, 255, 0.1)" : "#F1F5F9",
                  borderColor: isCyber ? "rgba(0, 245, 255, 0.3)" : "#000",
                }}
              >
                ⏮
              </button>

              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black border hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: isCyber ? "#00F5FF" : "#FFD700",
                  color: "#000000",
                  borderColor: isCyber ? "#00F5FF" : "#000000",
                  boxShadow: isCyber ? "0 0 15px rgba(0, 245, 255, 0.4)" : "2px 2px 0 #000",
                }}
              >
                {isPlaying ? "⏸" : "▶"}
              </button>

              <button
                onClick={nextTrack}
                className="w-8 h-8 rounded-xl flex items-center justify-center border font-bold text-xs hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: isCyber ? "rgba(0, 245, 255, 0.1)" : "#F1F5F9",
                  borderColor: isCyber ? "rgba(0, 245, 255, 0.3)" : "#000",
                }}
              >
                ⏭
              </button>
            </div>

            <button
              onClick={cycleLoopMode}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                loopMode !== "off" ? (isCyber ? "text-cyan-400 font-bold" : "text-black font-black underline") : "opacity-40"
              }`}
              title={`Loop Mode: ${loopMode}`}
            >
              {loopMode === "one" ? "🔂" : "🔁"}
            </button>
          </div>

          {/* Next Up Preview Badge */}
          {playlistQueue.length > 0 && (
            <div className="pt-2 border-t text-[10px] opacity-80 flex items-center justify-between" style={{ borderColor: isCyber ? "rgba(0,245,255,0.15)" : "#EEE" }}>
              <span className="font-bold opacity-60">NEXT UP:</span>
              <span className="truncate max-w-[190px] font-semibold">{playlistQueue[0]?.title} — {playlistQueue[0]?.artist}</span>
            </div>
          )}

          {/* Quick Actions Bar */}
          <div className="pt-2 border-t flex items-center justify-between text-xs" style={{ borderColor: isCyber ? "rgba(0,245,255,0.15)" : "#000" }}>
            <button
              onClick={() => {
                setPopoverOpen(false);
                setLyricsOpen(true);
              }}
              className="flex items-center gap-1.5 font-bold hover:underline cursor-pointer"
              style={{ color: isCyber ? "#00F5FF" : "#000" }}
            >
              <span>🎤</span> Synced Lyrics
            </button>

            <button
              onClick={() => {
                setPopoverOpen(false);
                router.push("/music");
              }}
              className="flex items-center gap-1.5 font-bold hover:underline cursor-pointer"
              style={{ color: isCyber ? "#BF5FFF" : "#000" }}
            >
              <span>🎵</span> Music Vault →
            </button>
          </div>
        </div>
      </FloatingLayer>

      {/* Lyrics Modal */}
      <LyricsModal
        isOpen={lyricsOpen}
        onClose={() => setLyricsOpen(false)}
        trackTitle={activeTrack?.title || null}
        artistName={activeTrack?.artist || null}
        currentTime={currentTime}
      />
    </div>
  );
}
