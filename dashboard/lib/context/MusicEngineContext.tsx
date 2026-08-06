"use client";

import React, {
  createContext,
  useContext,
  useRef,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useDashboardStore } from "@/lib/store/dashboardStore";

interface MusicEngineContextValue {
  // Audio references
  audioRef: React.RefObject<HTMLAudioElement | null>;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  
  // State
  currentTime: number;
  duration: number;
  buffered: number;
  volume: number;
  isMuted: boolean;
  
  // Derived
  progressPercent: number;

  // Actions
  setVolume: (v: number) => void;
  toggleMute: () => void;
  seekTo: (seconds: number) => void;
}

const MusicEngineContext = createContext<MusicEngineContextValue | null>(null);

export function MusicEngineProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  
  const { 
    activeTrack, 
    isPlaying, 
    setIsPlaying, 
    nextTrack, 
    prevTrack, 
    togglePlay, 
    recordPlay,
    loopMode,
    isShuffle,
    toggleShuffle,
    cycleLoopMode,
  } = useDashboardStore();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  // ── Initialize audio element once ──────────────────────────────────────────
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "metadata";
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }

    const el = audioRef.current;

    const onTimeUpdate = () => setCurrentTime(el.currentTime);
    const onDurationChange = () => setDuration(el.duration || 0);
    const onProgress = () => {
      if (el.buffered.length > 0) {
        setBuffered(el.buffered.end(el.buffered.length - 1));
      }
    };
    const onEnded = () => nextTrack();
    const onError = () => {
      console.warn("[MusicEngine] Audio playback error");
      setIsPlaying(false);
    };

    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("durationchange", onDurationChange);
    el.addEventListener("progress", onProgress);
    el.addEventListener("ended", onEnded);
    el.addEventListener("error", onError);

    return () => {
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("durationchange", onDurationChange);
      el.removeEventListener("progress", onProgress);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("error", onError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sync YouTube player state via postMessage ──────────────────────────────
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
        setCurrentTime((prev) => {
          if (duration > 0 && prev >= duration) {
            nextTrack();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [activeTrack, isPlaying, duration, nextTrack]);

  // ── React to activeTrack changes ────────────────────────────────────────────
  const playSessionStartRef = useRef<number | null>(null);
  const lastTrackedSongId = useRef<string | null>(null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    if (!activeTrack) {
      el.pause();
      return;
    }

    setCurrentTime(0);
    
    // Parse duration string to seconds
    if (activeTrack.duration) {
      const parts = activeTrack.duration.split(":");
      if (parts.length === 2) {
        const secs = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        if (!isNaN(secs) && secs > 0) setDuration(secs);
      } else if (parts.length === 3) {
        const secs = parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
        if (!isNaN(secs) && secs > 0) setDuration(secs);
      }
    } else {
      setDuration(210); // Default fallback
    }

    // Determine audio source
    const src = activeTrack.audioUrl || "";

    if (src && !activeTrack.youtubeId) {
      if (el.src !== src) {
        el.src = src;
        el.load();
      }
    } else if (activeTrack.youtubeId) {
      // YouTube tracks — clear any existing direct audio src
      if (el.src) {
        el.pause();
        el.src = "";
        el.load();
      }
    }
  }, [activeTrack]);

  // ── React to isPlaying changes ──────────────────────────────────────────────
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    if (activeTrack?.audioUrl && !activeTrack.youtubeId) {
      if (isPlaying) {
        el.play().catch((err) => {
          console.warn("[MusicEngine] play() blocked:", err);
          setIsPlaying(false);
        });
      } else {
        el.pause();
      }
    }

    if (isPlaying) {
      playSessionStartRef.current = Date.now();
      lastTrackedSongId.current = activeTrack?.id || null;
    } else {
      if (
        playSessionStartRef.current !== null &&
        activeTrack &&
        lastTrackedSongId.current === activeTrack.id
      ) {
        const elapsed = (Date.now() - playSessionStartRef.current) / 1000;
        if (elapsed >= 10) {
          recordPlay(activeTrack.id, activeTrack.title, activeTrack.artist, Math.round(elapsed));
        }
        playSessionStartRef.current = null;
      }
    }
  }, [isPlaying, activeTrack, setIsPlaying, recordPlay]);

  // ── Volume control ──────────────────────────────────────────────────────────
  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    if (clamped > 0) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.muted = false;
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (audioRef.current) audioRef.current.muted = next;
      return next;
    });
  }, []);

  // ── Seek ────────────────────────────────────────────────────────────────────
  const seekTo = useCallback((seconds: number) => {
    setCurrentTime(seconds);
    const state = useDashboardStore.getState();
    const track = state.activeTrack;
    
    if (audioRef.current && track?.audioUrl && !track?.youtubeId) {
      audioRef.current.currentTime = seconds;
    }
    
    if (iframeRef.current?.contentWindow && track?.youtubeId) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: "seekTo", args: [seconds, true] }),
        "*"
      );
    }
  }, []);

  // ── Session Auto-Saver (Spotify Style) ──────────────────────────────────────
  useEffect(() => {
    if (!activeTrack) return;
    try {
      const queue = useDashboardStore.getState().playlistQueue;
      localStorage.setItem(
        "music_playback_session",
        JSON.stringify({
          track: activeTrack,
          currentTime,
          queue,
          loopMode,
          isShuffle,
          timestamp: Date.now(),
        })
      );
    } catch {}
  }, [activeTrack, currentTime, loopMode, isShuffle]);

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
          else { seekTo(Math.min(currentTime + 5, duration)); }
          break;
        case "ArrowLeft":
          if (e.altKey) { e.preventDefault(); prevTrack(); }
          else { seekTo(Math.max(currentTime - 5, 0)); }
          break;
        case "ArrowUp":
          if (e.altKey) {
            e.preventDefault();
            setVolume(Math.min(1, parseFloat((volume + 0.1).toFixed(1))));
          }
          break;
        case "ArrowDown":
          if (e.altKey) {
            e.preventDefault();
            setVolume(Math.max(0, parseFloat((volume - 0.1).toFixed(1))));
          }
          break;
        case "KeyM":
          if (e.altKey) { e.preventDefault(); toggleMute(); }
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
  }, [activeTrack, currentTime, duration, volume, togglePlay, nextTrack, prevTrack, toggleShuffle, cycleLoopMode, setVolume, toggleMute, seekTo]);


  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <MusicEngineContext.Provider
      value={{
        audioRef,
        iframeRef,
        currentTime,
        duration,
        buffered,
        volume,
        isMuted,
        setVolume,
        toggleMute,
        seekTo,
        progressPercent,
      }}
    >
      {/* Hidden YouTube Iframe singleton */}
      {activeTrack?.youtubeId && (
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${activeTrack.youtubeId}?enablejsapi=1&autoplay=1&controls=0`}
          className="hidden"
          allow="autoplay"
          title="Global YouTube Player"
        />
      )}
      {children}
    </MusicEngineContext.Provider>
  );
}

export function useMusicEngine(): MusicEngineContextValue {
  const ctx = useContext(MusicEngineContext);
  if (!ctx) {
    throw new Error("useMusicEngine must be used within a MusicEngineProvider");
  }
  return ctx;
}
