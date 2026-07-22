"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { useTheme } from "@/lib/theme";
import { useRouter } from "next/navigation";
import { LyricsModal } from "@/components/ui/LyricsModal";

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

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [lyricsOpen, setLyricsOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(180);

  // ── Sync HTML5 Audio element ───────────────────────────────────────────────
  useEffect(() => {
    if (!audioRef.current) return;
    if (activeTrack?.audioUrl && !activeTrack.youtubeId) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, activeTrack]);

  // ── Sync YouTube player state via postMessage ──────────────────────────────
  useEffect(() => {
    if (!activeTrack?.youtubeId || !iframeRef.current?.contentWindow) return;

    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({
        event: "command",
        func: isPlaying ? "playVideo" : "pauseVideo",
        args: [],
      }),
      "*"
    );
  }, [isPlaying, activeTrack]);

  // ── YouTube Progress Timer ─────────────────────────────────────────────────
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTrack?.youtubeId && isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= duration) {
            nextTrack();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTrack, isPlaying, duration, nextTrack]);

  // ── Reset progress when track changes ─────────────────────────────────────
  useEffect(() => {
    setProgress(0);
    if (activeTrack?.duration) {
      const parts = activeTrack.duration.split(":");
      if (parts.length === 2) {
        const secs = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        if (!isNaN(secs) && secs > 0) setDuration(secs);
      }
    } else {
      setDuration(210);
    }
  }, [activeTrack]);

  // ── Close popover when clicking outside ────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setPopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!activeTrack) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "0:00";
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder < 10 ? "0" : ""}${remainder}`;
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seconds = Number(e.target.value);
    setProgress(seconds);

    if (audioRef.current && activeTrack.audioUrl && !activeTrack.youtubeId) {
      audioRef.current.currentTime = seconds;
    }

    if (iframeRef.current?.contentWindow && activeTrack.youtubeId) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: "seekTo", args: [seconds, true] }),
        "*"
      );
    }
  };

  return (
    <div ref={containerRef} className="relative z-40">
      {/* Audio Element for direct stream/uploads */}
      {activeTrack.audioUrl && !activeTrack.youtubeId && (
        <audio
          ref={audioRef}
          src={activeTrack.audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={nextTrack}
        />
      )}

      {/* YouTube Background Player Iframe — KEEP MOUNTED to preserve timestamp */}
      {activeTrack.youtubeId && (
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${activeTrack.youtubeId}?enablejsapi=1&autoplay=1`}
          allow="autoplay"
          className="hidden"
          title="Background YouTube Player"
        />
      )}

      {/* Topbar Mini Widget */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setPopoverOpen(!popoverOpen)}
        className="flex items-center gap-2 px-2.5 py-1 rounded-xl border cursor-pointer select-none"
        style={{
          backgroundColor: isCyber ? "rgba(0, 245, 255, 0.08)" : "#FFF9F0",
          borderColor: isCyber ? "rgba(0, 245, 255, 0.3)" : "#000000",
          borderWidth: isCyber ? "1px" : "2px",
          boxShadow: isCyber ? "0 0 10px rgba(0, 245, 255, 0.2)" : "2px 2px 0 #000000",
        }}
      >
        {/* Artwork */}
        <div className="w-6 h-6 rounded-md overflow-hidden bg-slate-800 shrink-0 relative flex items-center justify-center font-bold text-[10px]">
          {activeTrack.imageUrl ? (
            <img src={activeTrack.imageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span>🎵</span>
          )}
        </div>

        {/* Track Title */}
        <div className="hidden sm:flex flex-col min-w-0 max-w-[110px]">
          <span className="text-[10px] font-black truncate" style={{ color: isCyber ? "#E0FFFF" : "#000000" }}>
            {activeTrack.title}
          </span>
          <span className="text-[9px] font-semibold opacity-60 truncate" style={{ color: isCyber ? "#94A3B8" : "#444444" }}>
            {activeTrack.artist}
          </span>
        </div>

        {/* Quick Play/Pause */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 cursor-pointer"
          style={{
            backgroundColor: isCyber ? "#00F5FF" : "#FF6B35",
            color: isCyber ? "#050816" : "#FFFFFF",
          }}
        >
          {isPlaying ? "⏸" : "▶"}
        </button>

        {/* Quick Lyrics Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLyricsOpen(true);
          }}
          className="hidden md:flex text-[10px] p-0.5 opacity-80 hover:opacity-100 cursor-pointer"
          title="Open Synced Lyrics"
        >
          🎤
        </button>
      </motion.div>

      {/* Interactive Popover Dropdown */}
      <AnimatePresence>
        {popoverOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-12 right-0 w-80 p-4 rounded-2xl border shadow-2xl backdrop-blur-xl space-y-3"
            style={{
              backgroundColor: isCyber ? "rgba(5, 8, 22, 0.95)" : "#FFFFFF",
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
              <span className="shrink-0">{formatTime(progress)}</span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={progress}
                onChange={handleSeek}
                className="w-full h-1.5 accent-cyan-400 cursor-pointer rounded"
              />
              <span className="shrink-0">{formatTime(duration)}</span>
            </div>

            {/* Control Suite Row */}
            <div
              className="flex items-center justify-between pt-1 border-t"
              style={{ borderColor: isCyber ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)" }}
            >
              <button
                onClick={toggleShuffle}
                className="p-1 rounded text-xs"
                style={{ color: isShuffle ? (isCyber ? "#00F5FF" : "#FF6B35") : "inherit" }}
                title="Shuffle"
              >
                🔀
              </button>
              <button onClick={prevTrack} className="p-1 text-xs cursor-pointer">⏮</button>
              <button
                onClick={togglePlay}
                className="px-3 py-1 text-xs font-black rounded-lg cursor-pointer"
                style={{ backgroundColor: isCyber ? "#00F5FF" : "#FF6B35", color: isCyber ? "#050816" : "#FFF" }}
              >
                {isPlaying ? "⏸ Pause" : "▶ Play"}
              </button>
              <button onClick={nextTrack} className="p-1 text-xs cursor-pointer">⏭</button>
              <button
                onClick={cycleLoopMode}
                className="p-1 rounded text-xs font-bold cursor-pointer"
                style={{ color: loopMode !== "off" ? (isCyber ? "#00F5FF" : "#FF6B35") : "inherit" }}
              >
                {loopMode === "one" ? "🔂 1" : loopMode === "all" ? "🔁 All" : "🔁"}
              </button>
              <button
                onClick={() => setLyricsOpen(true)}
                className="px-2 py-1 text-[10px] font-black rounded border cursor-pointer"
                style={{ borderColor: isCyber ? "#00F5FF" : "#000", color: isCyber ? "#00F5FF" : "#000" }}
              >
                🎤 Lyrics
              </button>
            </div>

            {/* Queue Preview */}
            <div className="space-y-1 pt-1">
              <span className="text-[9px] font-black uppercase tracking-wider opacity-60">Upcoming Queue</span>
              <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                {playlistQueue.slice(0, 3).map((track, i) => (
                  <p key={track.id || i} className="text-[10px] font-semibold truncate opacity-80">
                    {i + 1}. {track.title} — {track.artist}
                  </p>
                ))}
              </div>
            </div>

            {/* Workspace Shortcut Button */}
            <button
              onClick={() => {
                setPopoverOpen(false);
                router.push("/music");
              }}
              className="w-full py-1.5 text-xs font-black rounded-xl text-center border transition-all hover:scale-[1.02] cursor-pointer"
              style={{
                backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#E5E7EB",
                borderColor: isCyber ? "#00F5FF" : "#000000",
                color: isCyber ? "#00F5FF" : "#000000",
              }}
            >
              ⚙️ Open Music Workspace
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Synchronized Lyrics Drawer Modal */}
      <LyricsModal
        isOpen={lyricsOpen}
        onClose={() => setLyricsOpen(false)}
        trackTitle={activeTrack.title}
        artistName={activeTrack.artist}
        currentTime={progress}
      />
    </div>
  );
}
