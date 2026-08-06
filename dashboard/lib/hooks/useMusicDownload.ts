"use client";

import { useState, useEffect, useCallback } from "react";
import type { SongEntry } from "@/lib/store/dashboardStore";
import {
  isSongCached,
  cacheAudioOffline,
  removeCachedAudio,
  listCachedSongs,
  getCacheStorageSize,
} from "@/lib/services/music/offlineStorage";

export type DownloadStatus = "idle" | "downloading" | "cached" | "error" | "unsupported";

interface UseMusicDownloadReturn {
  downloadStatus: DownloadStatus;
  progress: number; // 0–100
  downloadSong: (song: SongEntry) => Promise<void>;
  removeSong: (songId: string) => Promise<void>;
  cachedSongIds: Set<string>;
  cacheSizeFormatted: string;
  refreshCache: () => Promise<void>;
}

/**
 * Formats bytes into a human-readable size string.
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function useMusicDownload(): UseMusicDownloadReturn {
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [cachedSongIds, setCachedSongIds] = useState<Set<string>>(new Set());
  const [cacheSize, setCacheSize] = useState(0);

  const refreshCache = useCallback(async () => {
    try {
      const [songs, size] = await Promise.all([
        listCachedSongs(),
        getCacheStorageSize(),
      ]);
      setCachedSongIds(new Set(songs.map((s) => s.songId)));
      setCacheSize(size);
    } catch (err) {
      console.warn("[useMusicDownload] Failed to refresh cache:", err);
    }
  }, []);

  // Load cache state on mount
  useEffect(() => {
    refreshCache();
  }, [refreshCache]);

  const downloadSong = useCallback(async (song: SongEntry) => {
    // YouTube tracks cannot be downloaded
    if (song.youtubeId && !song.audioUrl) {
      setDownloadStatus("unsupported");
      return;
    }

    if (!song.audioUrl) {
      setDownloadStatus("unsupported");
      return;
    }

    // Check already cached
    const alreadyCached = await isSongCached(song.id);
    if (alreadyCached) {
      setDownloadStatus("cached");
      return;
    }

    setDownloadStatus("downloading");
    setProgress(0);

    try {
      // Use download proxy to avoid CORS issues
      const proxyUrl = `/api/music/download?url=${encodeURIComponent(song.audioUrl)}`;
      const res = await fetch(proxyUrl);

      if (!res.ok) {
        throw new Error(`Download failed: ${res.status}`);
      }

      const contentLength = res.headers.get("content-length");
      const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;

      // Stream the response and track progress
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No readable stream");

      const chunks: Uint8Array[] = [];
      let receivedBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        receivedBytes += value.length;

        if (totalBytes > 0) {
          setProgress(Math.round((receivedBytes / totalBytes) * 100));
        } else {
          // Unknown length — pulse progress
          setProgress((prev) => Math.min(prev + 5, 90));
        }
      }

      const blob = new Blob(chunks as unknown as BlobPart[]);

      await cacheAudioOffline(
        {
          songId: song.id,
          title: song.title,
          artist: song.artist,
          imageUrl: song.imageUrl,
          duration: song.duration,
          audioUrl: song.audioUrl,
          cachedAt: Date.now(),
          sizeBytes: blob.size,
        },
        blob
      );

      setProgress(100);
      setDownloadStatus("cached");
      await refreshCache();
    } catch (err) {
      console.error("[useMusicDownload] Download failed:", err);
      setDownloadStatus("error");
      setProgress(0);
    }
  }, [refreshCache]);

  const removeSong = useCallback(async (songId: string) => {
    try {
      await removeCachedAudio(songId);
      await refreshCache();
      setDownloadStatus("idle");
    } catch (err) {
      console.error("[useMusicDownload] Remove failed:", err);
    }
  }, [refreshCache]);

  return {
    downloadStatus,
    progress,
    downloadSong,
    removeSong,
    cachedSongIds,
    cacheSizeFormatted: formatBytes(cacheSize),
    refreshCache,
  };
}
