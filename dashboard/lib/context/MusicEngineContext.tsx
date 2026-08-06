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
import type { SongEntry } from "@/lib/store/dashboardStore";

interface MusicEngineContextValue {
  // Audio element ref (shared singleton)
  audioRef: React.RefObject<HTMLAudioElement | null>;
  // Current playback time in seconds
  currentTime: number;
  duration: number;
  buffered: number;
  volume: number;
  setVolume: (v: number) => void;
  seekTo: (seconds: number) => void;
  // Derived
  progressPercent: number;
}

const MusicEngineContext = createContext<MusicEngineContextValue | null>(null);

export function MusicEngineProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { activeTrack, isPlaying, setIsPlaying, nextTrack, recordPlay } = useDashboardStore();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolumeState] = useState(0.8);

  // ── Initialize audio element once ──────────────────────────────────────────
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "metadata";
      audioRef.current.volume = volume;
    }

    const el = audioRef.current;

    const onTimeUpdate = () => setCurrentTime(el.currentTime);
    const onDurationChange = () => setDuration(el.duration || 0);
    const onProgress = () => {
      if (el.buffered.length > 0) {
        setBuffered(el.buffered.end(el.buffered.length - 1));
      }
    };
    const onEnded = () => {
      nextTrack();
    };
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

    // Determine audio source
    const src = activeTrack.audioUrl || (activeTrack.youtubeId ? "" : "");

    if (src) {
      if (el.src !== src) {
        el.src = src;
        el.load();
        setCurrentTime(0);
        setDuration(0);
      }
    } else if (activeTrack.youtubeId) {
      // YouTube tracks — handled by the YouTube IFrame player in the UI.
      // Clear any existing direct audio src so HTML5 audio doesn't interfere.
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
    if (!el || !activeTrack?.audioUrl) return; // YouTube tracks use the YT player

    if (isPlaying) {
      el.play().catch((err) => {
        // Auto-play policy may block — silently fail
        console.warn("[MusicEngine] play() blocked:", err);
        setIsPlaying(false);
      });

      // Start tracking session time for play recording
      playSessionStartRef.current = Date.now();
      lastTrackedSongId.current = activeTrack.id;
    } else {
      el.pause();

      // Record play if listened > 10s
      if (
        playSessionStartRef.current !== null &&
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
  }, []);

  // ── Seek ────────────────────────────────────────────────────────────────────
  const seekTo = useCallback((seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
    }
  }, []);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <MusicEngineContext.Provider
      value={{
        audioRef,
        currentTime,
        duration,
        buffered,
        volume,
        setVolume,
        seekTo,
        progressPercent,
      }}
    >
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
