"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import type { SongEntry } from "@/lib/store/dashboardStore";
import { useToast } from "@/components/ui/ToastProvider";

interface MemoryItem {
  id: string;
  note: string;
  createdAt: string;
}

interface MusicJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: SongEntry | null;
  isCyber: boolean;
}

export function MusicJournalModal({
  isOpen,
  onClose,
  song,
  isCyber,
}: MusicJournalModalProps) {
  const toast = useToast();
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const border = isCyber ? "rgba(0,245,255,0.3)" : "#000000";
  const bg = isCyber ? "rgba(5,8,22,0.96)" : "#FFFFFF";
  const textPrimary = isCyber ? "#00F5FF" : "#000000";
  const inputBg = isCyber ? "rgba(0,0,0,0.5)" : "#F9FAFB";
  const accent = isCyber ? "#00F5FF" : "#FF6B35";

  useEffect(() => {
    if (!isOpen || !song?.id) return;

    const controller = new AbortController();
    setIsLoading(true);

    fetch(`/api/music/memories?songId=${encodeURIComponent(song.id)}`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.memories) setMemories(data.memories);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [isOpen, song?.id]);

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!song || !newNote.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/music/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songId: song.id, note: newNote.trim() }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || "Failed to save memory.");
        return;
      }

      if (data.memory) {
        setMemories([data.memory, ...memories]);
        setNewNote("");
        toast.success("Added track memory!");
      }
    } catch {
      toast.error("Error saving track memory.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    try {
      const res = await fetch(`/api/music/memories?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMemories(memories.filter((m) => m.id !== id));
        toast.info("Deleted memory.");
      }
    } catch {
      toast.error("Failed to delete memory.");
    }
  };

  if (!song) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="p-5 space-y-4 text-xs select-none" style={{ color: isCyber ? "#E0FFFF" : "#000" }}>
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: border }}>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base">📝</span>
            <div className="min-w-0">
              <h3 className="font-black text-sm uppercase tracking-wide truncate" style={{ color: textPrimary }}>
                Track Memories
              </h3>
              <p className="text-[10px] opacity-70 truncate font-semibold">
                {song.title} — {song.artist}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-sm opacity-60 hover:opacity-100">
            ✕
          </button>
        </div>

        {/* Add Memory Form */}
        <form onSubmit={handleAddMemory} className="space-y-2">
          <textarea
            rows={2}
            required
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a memory (e.g. 'Listened while studying Japanese', 'Reminds me of summer 2024')…"
            className="w-full p-2.5 rounded-lg border text-xs outline-none resize-none"
            style={{ backgroundColor: inputBg, borderColor: border, color: isCyber ? "#E0FFFF" : "#000" }}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !newNote.trim()}
              className="px-3.5 py-1.5 font-black text-xs rounded-lg transition-transform active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: accent, color: isCyber ? "#050816" : "#FFF" }}
            >
              {isSubmitting ? "Saving…" : "Save Memory +"}
            </button>
          </div>
        </form>

        {/* Memory List */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1 border-t pt-3" style={{ borderColor: border }}>
          <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">
            🎵 Memories ({memories.length})
          </h4>

          {isLoading ? (
            <p className="text-center text-xs opacity-50 py-4 animate-pulse">Loading memories…</p>
          ) : memories.length === 0 ? (
            <p className="text-center text-xs opacity-40 italic py-4">
              No memories attached to this song yet.
            </p>
          ) : (
            memories.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-lg border flex items-start justify-between gap-3 bg-black/10"
                style={{ borderColor: border }}
              >
                <div className="space-y-1 min-w-0">
                  <p className="text-xs font-semibold leading-snug whitespace-pre-wrap">{m.note}</p>
                  <p className="text-[9px] opacity-50">
                    {new Date(m.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteMemory(m.id)}
                  className="text-xs opacity-40 hover:opacity-100 hover:text-red-400 shrink-0"
                  title="Delete Memory"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
