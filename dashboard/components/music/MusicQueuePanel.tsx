"use client";

import React, { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { useTheme } from "@/lib/theme";
import type { SongEntry } from "@/lib/store/dashboardStore";

interface MusicQueuePanelProps {
  isCyber: boolean;
}

export function MusicQueuePanel({ isCyber }: MusicQueuePanelProps) {
  const { activeTrack, playlistQueue, songs, setPlaylistQueue, playTrack, isPlaying, togglePlay } =
    useDashboardStore();

  // Show active queue or fallback to the full song list
  const queue = playlistQueue.length > 0 ? playlistQueue : songs;
  const activeIdx = queue.findIndex(
    (s) => s.id === activeTrack?.id || (s.youtubeId && s.youtubeId === activeTrack?.youtubeId)
  );

  const handlePlayFromQueue = useCallback(
    (song: SongEntry, idx: number) => {
      if (activeTrack?.id === song.id) {
        togglePlay();
      } else {
        // Set queue starting from this song
        const reordered = [...queue.slice(idx), ...queue.slice(0, idx)];
        setPlaylistQueue(reordered);
        playTrack(song);
      }
    },
    [activeTrack, queue, togglePlay, playTrack, setPlaylistQueue]
  );

  const handleRemoveFromQueue = useCallback(
    (idx: number) => {
      const updated = [...playlistQueue];
      updated.splice(idx, 1);
      setPlaylistQueue(updated);
    },
    [playlistQueue, setPlaylistQueue]
  );

  const handleClearQueue = useCallback(() => {
    setPlaylistQueue([]);
  }, [setPlaylistQueue]);

  const borderColor = isCyber ? "rgba(0,245,255,0.2)" : "#000000";
  const bgCard = isCyber ? "rgba(10,15,44,0.4)" : "#FFFFFF";
  const textPrimary = isCyber ? "#E0FFFF" : "#000000";
  const textSecondary = isCyber ? "#94A3B8" : "#555555";
  const accentColor = isCyber ? "#00F5FF" : "#FF6B35";

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-widest theme-text-muted">
          🎼 Queue ({queue.length})
        </h3>
        {playlistQueue.length > 0 && (
          <button
            onClick={handleClearQueue}
            className="text-[10px] font-bold opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: textSecondary }}
          >
            Clear queue
          </button>
        )}
      </div>

      {/* Queue list */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor, backgroundColor: bgCard }}
      >
        {queue.length === 0 ? (
          <div className="py-8 text-center text-xs font-semibold opacity-50" style={{ color: textSecondary }}>
            No tracks in queue. Play a song to populate.
          </div>
        ) : (
          <div className="divide-y max-h-[400px] overflow-y-auto" style={{ borderColor }}>
            <AnimatePresence initial={false}>
              {queue.map((song, idx) => {
                const isActive = idx === activeIdx;
                return (
                  <motion.div
                    key={song.id + idx}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-2.5 px-3 py-2 transition-all group"
                    style={{
                      backgroundColor: isActive
                        ? isCyber
                          ? "rgba(0,245,255,0.08)"
                          : "#FFF3E0"
                        : "transparent",
                    }}
                  >
                    {/* Index / playing indicator */}
                    <div
                      className="w-5 shrink-0 text-center text-[10px] font-black"
                      style={{ color: isActive ? accentColor : textSecondary }}
                    >
                      {isActive && isPlaying ? (
                        <span className="animate-pulse">▶</span>
                      ) : (
                        <span className="opacity-60">{idx + 1}</span>
                      )}
                    </div>

                    {/* Thumb */}
                    <div
                      className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-slate-700 flex items-center justify-center text-[10px]"
                      style={{ border: `1px solid ${borderColor}` }}
                    >
                      {song.imageUrl ? (
                        <img src={song.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>🎵</span>
                      )}
                    </div>

                    {/* Info */}
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => handlePlayFromQueue(song, idx)}
                    >
                      <p
                        className="text-[11px] font-black truncate leading-tight"
                        style={{ color: isActive ? accentColor : textPrimary }}
                      >
                        {song.title}
                      </p>
                      <p className="text-[9px] opacity-60 truncate" style={{ color: textSecondary }}>
                        {song.artist}
                        {song.duration ? ` · ${song.duration}` : ""}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      {/* Play/Pause this track */}
                      <button
                        onClick={() => handlePlayFromQueue(song, idx)}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-transform active:scale-90"
                        style={{ backgroundColor: accentColor, color: isCyber ? "#050816" : "#fff" }}
                        title="Play"
                      >
                        {isActive && isPlaying ? "⏸" : "▶"}
                      </button>

                      {/* Remove from queue (only when queue is explicitly set) */}
                      {playlistQueue.length > 0 && (
                        <button
                          onClick={() => handleRemoveFromQueue(idx)}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] text-red-400 hover:text-red-300 transition-colors"
                          title="Remove from queue"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
