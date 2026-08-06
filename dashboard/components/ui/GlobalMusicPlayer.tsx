"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { useTheme } from "@/lib/theme";
import { usePathname } from "next/navigation";
import { LyricsModal } from "@/components/ui/LyricsModal";

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
    recordPlay,
  } = useDashboardStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(210);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [lyricsOpen, setLyricsOpen] = useState(false);

  // ── Sync HTML5 Audio playback & volume ─────────────────────────────────────
  useEffect(() => {
    if (!audioRef.current) return;
    if (activeTrack?.audioUrl && !activeTrack.youtubeId) {
      audioRef.current.volume = isMuted ? 0 : volume;
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, activeTrack, volume, isMuted]);

  // ── Sync YouTube player state via postMessage (Play/Pause/Volume/Mute) ──────
  useEffect(() => {
    if (!activeTrack?.youtubeId || !iframeRef.current?.contentWindow) return;

    const win = iframeRef.current.contentWindow;

    win.postMessage(
      JSON.stringify({ event: "command", func: isPlaying ? "playVideo" : "pauseVideo", args: [] }),
      "*"
    );
    win.postMessage(
      JSON.stringify({ event: "command", func: isMuted ? "mute" : "unMute", args: [] }),
      "*"
    );
    win.postMessage(
      JSON.stringify({ event: "command", func: "setVolume", args: [isMuted ? 0 : Math.round(volume * 100)] }),
      "*"
    );
  }, [isPlaying, activeTrack, volume, isMuted]);

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
    return () => { if (interval) clearInterval(interval); };
  }, [activeTrack, isPlaying, duration, nextTrack]);

  // ── Reset & update duration when track changes ────────────────────────────
  useEffect(() => {
    setProgress(0);
    if (activeTrack?.duration) {
      const parts = activeTrack.duration.split(":");
      if (parts.length === 2) {
        const secs = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        if (!isNaN(secs) && secs > 0) setDuration(secs);
      } else if (parts.length === 3) {
        const secs = parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
        if (!isNaN(secs) && secs > 0) setDuration(secs);
      }
    } else {
      setDuration(210);
    }
  }, [activeTrack]);

  // ── Session Auto-Saver (Spotify Style) ──────────────────────────────────────
  useEffect(() => {
    if (!activeTrack) return;
    try {
      const queue = useDashboardStore.getState().playlistQueue;
      localStorage.setItem(
        "music_playback_session",
        JSON.stringify({
          track: activeTrack,
          currentTime: progress,
          queue,
          loopMode,
          isShuffle,
          timestamp: Date.now(),
        })
      );
    } catch {}
  }, [activeTrack, progress, loopMode, isShuffle]);

  // ── Media Session API ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeTrack || typeof window === "undefined" || !("mediaSession" in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: activeTrack.title,
      artist: activeTrack.artist,
      album: activeTrack.album || "",
      artwork: activeTrack.imageUrl
        ? [{ src: activeTrack.imageUrl, sizes: "512x512", type: "image/jpeg" }]
        : [],
    });

    navigator.mediaSession.setActionHandler("play", () => { if (!isPlaying) togglePlay(); });
    navigator.mediaSession.setActionHandler("pause", () => { if (isPlaying) togglePlay(); });
    navigator.mediaSession.setActionHandler("previoustrack", prevTrack);
    navigator.mediaSession.setActionHandler("nexttrack", nextTrack);

    return () => {
      if ("mediaSession" in navigator) {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
        navigator.mediaSession.setActionHandler("previoustrack", null);
        navigator.mediaSession.setActionHandler("nexttrack", null);
      }
    };
  }, [activeTrack, isPlaying, togglePlay, prevTrack, nextTrack]);

  // ── Global Keyboard Shortcuts ──────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts when user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
      if (!activeTrack) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          if (e.altKey) { e.preventDefault(); nextTrack(); }
          else if (audioRef.current && activeTrack.audioUrl) {
            audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 5, duration);
          }
          break;
        case "ArrowLeft":
          if (e.altKey) { e.preventDefault(); prevTrack(); }
          else if (audioRef.current && activeTrack.audioUrl) {
            audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 5, 0);
          }
          break;
        case "ArrowUp":
          if (e.altKey) {
            e.preventDefault();
            setVolume((v) => Math.min(1, parseFloat((v + 0.1).toFixed(1))));
          }
          break;
        case "ArrowDown":
          if (e.altKey) {
            e.preventDefault();
            setVolume((v) => Math.max(0, parseFloat((v - 0.1).toFixed(1))));
          }
          break;
        case "KeyM":
          if (e.altKey) { e.preventDefault(); setIsMuted((m) => !m); }
          break;
        case "KeyS":
          if (e.altKey) { e.preventDefault(); toggleShuffle(); }
          break;
        case "KeyL":
          if (e.altKey) { e.preventDefault(); cycleLoopMode(); }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTrack, duration, togglePlay, nextTrack, prevTrack, toggleShuffle, cycleLoopMode]);

  // ── Auto-record plays when 30s threshold reached (direct audio) ───────────
  const hasRecordedRef = useRef(false);
  useEffect(() => {
    hasRecordedRef.current = false;
  }, [activeTrack]);

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

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const t = audioRef.current.currentTime;
      setProgress(t);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
      // Record play after 30s
      if (t >= 30 && !hasRecordedRef.current && activeTrack) {
        hasRecordedRef.current = true;
        recordPlay(activeTrack.id, activeTrack.title, activeTrack.artist, Math.round(t));
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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (val > 0) setIsMuted(false);
  };

  const toggleMute = () => setIsMuted((prev) => !prev);

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl rounded-2xl border p-3 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-4 select-none"
          style={{
            backgroundColor: isCyber ? "rgba(5, 8, 22, 0.95)" : "rgba(255, 255, 255, 0.98)",
            borderColor: isCyber ? "rgba(0, 245, 255, 0.4)" : "#000000",
            borderWidth: isCyber ? "1px" : "3px",
            boxShadow: isCyber ? "0 0 30px rgba(0,245,255,0.25)" : "4px 4px 0px #000000",
          }}
        >
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

          {/* Track Thumbnail & Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
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
          <div className="flex flex-col items-center gap-1.5 flex-1 max-w-md">
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
          </div>

          {/* Right Action Widgets: Volume, Lyrics, Mute */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
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
        currentTime={progress}
      />
    </>
  );
}
