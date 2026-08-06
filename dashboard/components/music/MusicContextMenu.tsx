"use client";

import React, { useEffect, useRef } from "react";
import { useDashboardStore, type SongEntry } from "@/lib/store/dashboardStore";
import { useToast } from "@/components/ui/ToastProvider";
import { useMusicDownload } from "@/lib/hooks/useMusicDownload";
import Link from "next/link";

interface MusicContextMenuProps {
  song: SongEntry;
  x: number;
  y: number;
  onClose: () => void;
  onOpenLyrics?: () => void;
  onOpenMemories?: () => void;
  isCyber: boolean;
}

export function MusicContextMenu({
  song,
  x,
  y,
  onClose,
  onOpenLyrics,
  onOpenMemories,
  isCyber,
}: MusicContextMenuProps) {
  const {
    activeTrack,
    isPlaying,
    togglePlay,
    playTrack,
    playlistQueue,
    setPlaylistQueue,
    toggleFavoriteSong,
    deleteSong,
    collections,
    saveCollection,
  } = useDashboardStore();
  const toast = useToast();
  const { downloadSong, removeSong, cachedSongIds } = useMusicDownload();
  const menuRef = useRef<HTMLDivElement>(null);

  const isCurrentActive = activeTrack?.id === song.id;
  const isDownloaded = cachedSongIds.has(song.id);

  // Close on outside click or ESC key
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("mousedown", handleOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const border = isCyber ? "rgba(0,245,255,0.3)" : "#000000";
  const bg = isCyber ? "rgba(5,8,22,0.96)" : "#FFFFFF";
  const textPrimary = isCyber ? "#E0FFFF" : "#000000";

  const handleQueueNext = () => {
    setPlaylistQueue([song, ...playlistQueue]);
    toast.success(`Queued "${song.title}" next!`);
    onClose();
  };

  const handleAddToQueue = () => {
    setPlaylistQueue([...playlistQueue, song]);
    toast.success(`Added "${song.title}" to queue`);
    onClose();
  };

  const handleAddToCollection = async (collectionId: string) => {
    const col = collections.find((c) => c.id === collectionId);
    if (!col) return;
    if ((col.songIds || []).includes(song.id)) {
      toast.warning("Song already in this collection.");
      onClose();
      return;
    }
    await saveCollection({
      ...col,
      songIds: [...(col.songIds || []), song.id],
      updatedAt: new Date().toISOString(),
    });
    toast.success(`Added to "${col.name}"`);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-56 rounded-xl border p-1.5 shadow-2xl backdrop-blur-xl text-xs space-y-0.5 select-none"
      style={{
        top: Math.min(y, window.innerHeight - 340),
        left: Math.min(x, window.innerWidth - 240),
        backgroundColor: bg,
        borderColor: border,
        color: textPrimary,
      }}
    >
      <div className="px-2 py-1 border-b mb-1 opacity-70 truncate font-black flex items-center justify-between" style={{ borderColor: border }}>
        <span className="truncate">🎵 {song.title}</span>
        {isCurrentActive && <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-400 text-black font-black">NOW PLAYING</span>}
      </div>

      {isCurrentActive ? (
        <button
          onClick={() => {
            togglePlay();
            onClose();
          }}
          className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-2 font-bold text-cyan-400"
        >
          <span>{isPlaying ? "⏸ Pause" : "▶ Resume"}</span> Playback
        </button>
      ) : (
        <button
          onClick={() => {
            playTrack(song);
            onClose();
          }}
          className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-2 font-bold"
        >
          <span>▶</span> Play Now
        </button>
      )}

      <button
        onClick={handleQueueNext}
        className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-2 font-bold"
      >
        <span>⏩</span> Queue Next
      </button>

      <button
        onClick={handleAddToQueue}
        className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-2 font-bold"
      >
        <span>➕</span> Add to Queue
      </button>

      <Link
        href={`/music/artist/${encodeURIComponent(song.artist)}`}
        onClick={onClose}
        className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-2 font-bold block"
      >
        <span>👤</span> View Artist ({song.artist})
      </Link>

      <button
        onClick={async () => {
          await toggleFavoriteSong(song.id);
          onClose();
        }}
        className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-2 font-bold"
      >
        <span>{song.isFavorite ? "💔" : "❤️"}</span> {song.isFavorite ? "Unfavorite" : "Favorite"}
      </button>

      {onOpenMemories && (
        <button
          onClick={() => {
            onOpenMemories();
            onClose();
          }}
          className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-2 font-bold"
        >
          <span>📝</span> Track Memories
        </button>
      )}

      {onOpenLyrics && (
        <button
          onClick={() => {
            onOpenLyrics();
            onClose();
          }}
          className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-2 font-bold"
        >
          <span>🎤</span> Synced Lyrics
        </button>
      )}

      {/* Submenu for Collections */}
      {collections.length > 0 && (
        <div className="border-t my-1 pt-1" style={{ borderColor: border }}>
          <p className="px-2 text-[9px] font-black uppercase opacity-50 mb-0.5">Add to Collection</p>
          {collections.map((col) => (
            <button
              key={col.id}
              onClick={() => handleAddToCollection(col.id)}
              className="w-full text-left px-2 py-1 rounded-lg hover:bg-white/10 flex items-center gap-2 text-[11px]"
            >
              <span>{col.emoji || "📂"}</span> <span className="truncate">{col.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="border-t my-1 pt-1" style={{ borderColor: border }}>
        {isDownloaded ? (
          <button
            onClick={async () => {
              await removeSong(song.id);
              toast.info(`Removed offline cache for "${song.title}"`);
              onClose();
            }}
            className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-2 font-bold text-amber-400"
          >
            <span>🗑️</span> Remove Download
          </button>
        ) : (
          <button
            onClick={() => {
              downloadSong(song);
              onClose();
            }}
            className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-2 font-bold"
          >
            <span>💾</span> Save Offline
          </button>
        )}

        <button
          onClick={async () => {
            await deleteSong(song.id);
            toast.info(`Deleted "${song.title}"`);
            onClose();
          }}
          className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-2 font-bold text-red-400"
        >
          <span>🗑️</span> Delete Track
        </button>
      </div>
    </div>
  );
}
