"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import type { SongEntry } from "@/lib/store/dashboardStore";
import { useToast } from "@/components/ui/ToastProvider";

interface CollectionManagerProps {
  isCyber: boolean;
}

export function CollectionManager({ isCyber }: CollectionManagerProps) {
  const { songs, collections, saveCollection, deleteCollection, playTrack, setPlaylistQueue } =
    useDashboardStore();
  const toast = useToast();

  const [creatingNew, setCreatingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newEmoji, setNewEmoji] = useState("🎵");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addingSongId, setAddingSongId] = useState<string | null>(null);

  const accent = isCyber ? "#00F5FF" : "#FF6B35";
  const border = isCyber ? "rgba(0,245,255,0.2)" : "#000";
  const cardBg = isCyber ? "rgba(10,15,44,0.5)" : "#FFFFFF";
  const textPrimary = isCyber ? "#E0FFFF" : "#000";
  const textMuted = isCyber ? "#94A3B8" : "#555";
  const inputBg = isCyber ? "rgba(0,0,0,0.5)" : "#F9FAFB";
  const purple = isCyber ? "#BF5FFF" : "#7C3AED";

  const handleCreateCollection = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newName.trim()) return;
      const col = {
        id: "collection-" + Date.now(),
        name: newName.trim(),
        description: newDescription.trim() || undefined,
        emoji: newEmoji,
        songIds: [] as string[],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await saveCollection(col);
      toast.success(`Collection "${col.name}" created!`);
      setNewName("");
      setNewDescription("");
      setNewEmoji("🎵");
      setCreatingNew(false);
    },
    [newName, newDescription, newEmoji, saveCollection, toast]
  );

  const handleDeleteCollection = useCallback(
    async (id: string, name: string) => {
      await deleteCollection(id);
      toast.info(`Removed collection "${name}"`);
      if (expandedId === id) setExpandedId(null);
    },
    [deleteCollection, toast, expandedId]
  );

  const handleAddSongToCollection = useCallback(
    async (collectionId: string, songId: string) => {
      const col = collections.find((c) => c.id === collectionId);
      if (!col) return;
      if ((col.songIds || []).includes(songId)) {
        toast.warning("Song already in this collection.");
        return;
      }
      const updated = {
        ...col,
        songIds: [...(col.songIds || []), songId],
        updatedAt: new Date().toISOString(),
      };
      await saveCollection(updated);
      setAddingSongId(null);
      toast.success("Song added to collection!");
    },
    [collections, saveCollection, toast]
  );

  const handleRemoveSongFromCollection = useCallback(
    async (collectionId: string, songId: string) => {
      const col = collections.find((c) => c.id === collectionId);
      if (!col) return;
      const updated = {
        ...col,
        songIds: (col.songIds || []).filter((id) => id !== songId),
        updatedAt: new Date().toISOString(),
      };
      await saveCollection(updated);
    },
    [collections, saveCollection]
  );

  const handlePlayCollection = useCallback(
    (collectionId: string) => {
      const col = collections.find((c) => c.id === collectionId);
      if (!col || !col.songIds?.length) return;
      const colSongs = col.songIds
        .map((id) => songs.find((s) => s.id === id))
        .filter(Boolean) as SongEntry[];
      if (colSongs.length === 0) return;
      setPlaylistQueue(colSongs);
      playTrack(colSongs[0]);
      toast.success(`Playing "${col.name}" collection`);
    },
    [collections, songs, setPlaylistQueue, playTrack, toast]
  );

  const EMOJI_OPTIONS = ["🎵", "🎸", "🎹", "🎷", "🎺", "🥁", "🎻", "🎤", "🎧", "👑", "⚡", "🌸", "☕", "🔥", "💜"];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-widest theme-text-muted">
          📂 Collections ({collections.length})
        </h3>
        <button
          onClick={() => setCreatingNew(!creatingNew)}
          className="px-3 py-1.5 text-xs font-black rounded-lg border transition-all hover:scale-105 active:scale-95"
          style={{
            backgroundColor: creatingNew
              ? isCyber ? "rgba(0,245,255,0.2)" : "#FFF3E0"
              : isCyber ? "rgba(0,245,255,0.08)" : "#F9FAFB",
            borderColor: border,
            color: accent,
          }}
        >
          {creatingNew ? "✕ Cancel" : "+ New Collection"}
        </button>
      </div>

      {/* New collection form */}
      <AnimatePresence>
        {creatingNew && (
          <motion.form
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            onSubmit={handleCreateCollection}
            className="rounded-xl border p-4 space-y-3 overflow-hidden"
            style={{ borderColor: accent, backgroundColor: cardBg }}
          >
            {/* Emoji selector */}
            <div className="flex flex-wrap gap-1">
              {EMOJI_OPTIONS.map((em) => (
                <button
                  type="button"
                  key={em}
                  onClick={() => setNewEmoji(em)}
                  className="w-7 h-7 rounded-lg transition-all text-sm"
                  style={{
                    border: `2px solid ${em === newEmoji ? accent : "transparent"}`,
                    backgroundColor: em === newEmoji
                      ? isCyber ? "rgba(0,245,255,0.15)" : "#FFF3E0"
                      : "transparent",
                  }}
                >
                  {em}
                </button>
              ))}
            </div>

            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Collection name…"
              required
              className="w-full px-3 py-2 rounded-lg border text-xs font-bold outline-none"
              style={{ backgroundColor: inputBg, borderColor: border, color: textPrimary }}
            />
            <input
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Optional description…"
              className="w-full px-3 py-2 rounded-lg border text-xs font-semibold outline-none"
              style={{ backgroundColor: inputBg, borderColor: border, color: textPrimary }}
            />

            <button
              type="submit"
              className="w-full py-2 text-xs font-black rounded-lg transition-all active:scale-95"
              style={{
                backgroundColor: accent,
                color: isCyber ? "#050816" : "#FFF",
              }}
            >
              ✓ Create Collection
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Collections list */}
      {collections.length === 0 ? (
        <div
          className="rounded-xl border p-8 text-center"
          style={{ borderColor: border, backgroundColor: cardBg }}
        >
          <p className="text-2xl mb-2">📂</p>
          <p className="text-xs font-bold opacity-60" style={{ color: textMuted }}>
            No collections yet. Create one to group your favourite tracks together.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {collections.map((col) => {
            const colSongs = (col.songIds || [])
              .map((id: string) => songs.find((s) => s.id === id))
              .filter(Boolean) as SongEntry[];
            const isExpanded = expandedId === col.id;

            return (
              <div
                key={col.id}
                className="rounded-xl border overflow-hidden"
                style={{ borderColor: border, backgroundColor: cardBg }}
              >
                {/* Collection header */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : col.id)}
                >
                  <span className="text-xl">{col.emoji || "🎵"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black" style={{ color: textPrimary }}>
                      {col.name}
                    </p>
                    {col.description && (
                      <p className="text-[10px] opacity-60 truncate" style={{ color: textMuted }}>
                        {col.description}
                      </p>
                    )}
                    <p className="text-[9px] opacity-50 mt-0.5" style={{ color: textMuted }}>
                      {colSongs.length} tracks
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {colSongs.length > 0 && (
                      <button
                        onClick={() => handlePlayCollection(col.id)}
                        className="px-2 py-1 text-[9px] font-black rounded-lg transition-all active:scale-90"
                        style={{ backgroundColor: accent, color: isCyber ? "#050816" : "#FFF" }}
                      >
                        ▶ Play
                      </button>
                    )}
                    <button
                      onClick={() => setAddingSongId(addingSongId === col.id ? null : col.id)}
                      className="px-2 py-1 text-[9px] font-black rounded-lg border transition-all active:scale-90"
                      style={{ borderColor: border, color: purple }}
                    >
                      + Add
                    </button>
                    <button
                      onClick={() => handleDeleteCollection(col.id, col.name)}
                      className="text-red-400 text-[10px] hover:text-red-300 transition-colors px-1"
                    >
                      🗑️
                    </button>
                  </div>

                  <span className="text-[10px] opacity-40" style={{ color: textMuted }}>
                    {isExpanded ? "▲" : "▼"}
                  </span>
                </div>

                {/* Song picker when adding */}
                <AnimatePresence>
                  {addingSongId === col.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t"
                      style={{ borderColor: border }}
                    >
                      <div className="p-3">
                        <p className="text-[10px] font-bold uppercase mb-2" style={{ color: textMuted }}>
                          Add a song to this collection:
                        </p>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {songs
                            .filter((s) => !(col.songIds || []).includes(s.id))
                            .map((s) => (
                              <button
                                key={s.id}
                                onClick={() => handleAddSongToCollection(col.id, s.id)}
                                className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                              >
                                <div
                                  className="w-6 h-6 rounded overflow-hidden shrink-0 bg-slate-700"
                                  style={{ border: `1px solid ${border}` }}
                                >
                                  {s.imageUrl ? (
                                    <img src={s.imageUrl} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[8px]">🎵</div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-[10px] font-bold truncate" style={{ color: textPrimary }}>
                                    {s.title}
                                  </p>
                                  <p className="text-[8px] opacity-50 truncate">{s.artist}</p>
                                </div>
                              </button>
                            ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Expanded song list */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t divide-y"
                      style={{ borderColor: border }}
                    >
                      {colSongs.length === 0 ? (
                        <div className="px-4 py-4 text-[10px] opacity-50 text-center" style={{ color: textMuted }}>
                          No songs yet. Use "+ Add" to populate this collection.
                        </div>
                      ) : (
                        colSongs.map((s) => (
                          <div
                            key={s.id}
                            className="flex items-center gap-2 px-4 py-2 group hover:bg-white/5 transition-colors"
                            style={{ borderColor: border }}
                          >
                            <div
                              className="w-7 h-7 rounded-lg overflow-hidden shrink-0 bg-slate-700"
                              style={{ border: `1px solid ${border}` }}
                            >
                              {s.imageUrl ? (
                                <img src={s.imageUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[8px]">🎵</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-bold truncate" style={{ color: textPrimary }}>
                                {s.title}
                              </p>
                              <p className="text-[9px] opacity-60 truncate" style={{ color: textMuted }}>
                                {s.artist}
                              </p>
                            </div>
                            <button
                              onClick={() => playTrack(s)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold"
                              style={{ backgroundColor: accent, color: isCyber ? "#050816" : "#fff" }}
                            >
                              ▶
                            </button>
                            <button
                              onClick={() => handleRemoveSongFromCollection(col.id, s.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 text-[10px]"
                            >
                              ✕
                            </button>
                          </div>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
