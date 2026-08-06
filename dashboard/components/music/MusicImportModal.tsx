"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { useDashboardStore, type SongEntry } from "@/lib/store/dashboardStore";
import { useToast } from "@/components/ui/ToastProvider";

interface MusicImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCyber: boolean;
}

export function MusicImportModal({ isOpen, onClose, isCyber }: MusicImportModalProps) {
  const { songs, saveSong } = useDashboardStore();
  const toast = useToast();

  const [url, setUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importedSong, setImportedSong] = useState<SongEntry | null>(null);
  const [duplicateSong, setDuplicateSong] = useState<SongEntry | null>(null);

  const [customTitle, setCustomTitle] = useState("");
  const [customArtist, setCustomArtist] = useState("");
  const [customCategory, setCustomCategory] = useState("All-Time Favorites");

  const border = isCyber ? "rgba(0,245,255,0.3)" : "#000000";
  const textPrimary = isCyber ? "#00F5FF" : "#000000";
  const inputBg = isCyber ? "rgba(0,0,0,0.5)" : "#F9FAFB";
  const accent = isCyber ? "#00F5FF" : "#FF6B35";

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsImporting(true);
    setImportedSong(null);
    setDuplicateSong(null);

    try {
      const res = await fetch("/api/music/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || "Failed to parse URL.");
        return;
      }

      if (data.song) {
        // Check for duplicates in store
        const existing = songs.find(
          (s) =>
            (s.youtubeId && s.youtubeId === data.song.youtubeId) ||
            (s.audioUrl && s.audioUrl === data.song.audioUrl)
        );

        if (existing) {
          setDuplicateSong(existing);
        }

        setImportedSong(data.song);
        setCustomTitle(data.song.title);
        setCustomArtist(data.song.artist);
        setCustomCategory(data.song.category || "All-Time Favorites");
        toast.success(`Parsed track metadata!`);
      }
    } catch {
      toast.error("Network error parsing URL.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleSaveImported = async (mode: "create" | "replace" | "updateMetadata" = "create") => {
    if (!importedSong) return;

    const targetId = mode === "create" ? (importedSong.youtubeId || "song-" + Date.now()) : (duplicateSong?.id || importedSong.id);

    const payload: Partial<SongEntry> = {
      title: customTitle || importedSong.title,
      artist: customArtist || importedSong.artist,
      category: customCategory,
      imageUrl: importedSong.imageUrl || duplicateSong?.imageUrl,
      youtubeId: importedSong.youtubeId || duplicateSong?.youtubeId,
      audioUrl: importedSong.audioUrl || duplicateSong?.audioUrl,
      duration: importedSong.duration || duplicateSong?.duration || "3:30",
    };

    await saveSong(targetId, payload as any);

    // Log timeline event
    try {
      fetch("/api/music/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "IMPORTED_SONG",
          entityId: targetId,
          details: { title: payload.title, artist: payload.artist },
        }),
      }).catch(() => {});
    } catch {}

    toast.success(
      mode === "replace"
        ? `Replaced existing track "${payload.title}"!`
        : mode === "updateMetadata"
        ? `Updated metadata for "${payload.title}"!`
        : `Imported "${payload.title}" into Music Vault!`
    );
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setUrl("");
    setImportedSong(null);
    setCustomTitle("");
    setCustomArtist("");
    setCustomCategory("All-Time Favorites");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="p-5 space-y-4 text-xs select-none">
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: border }}>
          <h3 className="font-black text-sm uppercase tracking-wide" style={{ color: textPrimary }}>
            🔗 Import Track URL
          </h3>
          <button onClick={onClose} className="text-sm opacity-60 hover:opacity-100">
            ✕
          </button>
        </div>

        {!importedSong ? (
          <form onSubmit={handleAnalyze} className="space-y-3">
            <p className="opacity-70 leading-relaxed">
              Paste a <strong>YouTube URL</strong> (e.g. <code>youtube.com/watch?v=...</code>) or direct <strong>audio file link</strong> (<code>.mp3</code>, <code>.m4a</code>) to fetch metadata.
            </p>

            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3 py-2.5 rounded-lg border font-mono text-xs outline-none"
              style={{ backgroundColor: inputBg, borderColor: border, color: isCyber ? "#E0FFFF" : "#000" }}
            />

            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={onClose} className="px-3 py-1.5 font-bold opacity-60 hover:opacity-100">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isImporting}
                className="px-4 py-2 font-black rounded-lg transition-transform active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: accent, color: isCyber ? "#050816" : "#FFF" }}
              >
                {isImporting ? "Analyzing…" : "Fetch Metadata →"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-3 items-center p-3 rounded-lg border bg-black/20" style={{ borderColor: border }}>
              <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-800 flex items-center justify-center font-bold text-xs">
                {importedSong.imageUrl ? (
                  <img src={importedSong.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>🎵</span>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <input
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Track title"
                  className="w-full px-2 py-1 rounded border text-xs font-bold outline-none"
                  style={{ backgroundColor: inputBg, borderColor: border, color: isCyber ? "#E0FFFF" : "#000" }}
                />
                <input
                  value={customArtist}
                  onChange={(e) => setCustomArtist(e.target.value)}
                  placeholder="Artist"
                  className="w-full px-2 py-1 rounded border text-xs outline-none opacity-80"
                  style={{ backgroundColor: inputBg, borderColor: border, color: isCyber ? "#E0FFFF" : "#000" }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold opacity-60 uppercase">Category</label>
              <select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-xs font-bold outline-none"
                style={{ backgroundColor: inputBg, borderColor: border, color: isCyber ? "#E0FFFF" : "#000" }}
              >
                <option value="All-Time Favorites">👑 All-Time Favorites</option>
                <option value="Chill Beats">☕ Chill Beats</option>
                <option value="Hype/J-Pop">⚡ Hype/J-Pop</option>
                <option value="K-Osts">🌸 K-Osts</option>
              </select>
            </div>

            {duplicateSong && (
              <div className="p-3 rounded-lg border bg-amber-500/10 border-amber-500/30 text-amber-300 space-y-2">
                <p className="font-bold text-[11px]">
                  ⚠️ Duplicate Detected: "{duplicateSong.title}" is already in your Music Vault.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleSaveImported("replace")}
                    className="px-2.5 py-1 rounded bg-red-500 text-white font-black text-[10px]"
                  >
                    🔄 Replace
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveImported("updateMetadata")}
                    className="px-2.5 py-1 rounded bg-amber-400 text-black font-black text-[10px]"
                  >
                    📝 Update Metadata
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-2.5 py-1 rounded border border-white/20 font-bold text-[10px]"
                  >
                    ⏭ Skip
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="text-[10px] opacity-60 hover:opacity-100 underline"
              >
                ← Import another URL
              </button>

              <div className="flex gap-2">
                <button type="button" onClick={onClose} className="px-3 py-1.5 font-bold opacity-60 hover:opacity-100">
                  Cancel
                </button>
                {!duplicateSong && (
                  <button
                    type="button"
                    onClick={() => handleSaveImported("create")}
                    className="px-4 py-2 font-black rounded-lg transition-transform active:scale-95"
                    style={{ backgroundColor: accent, color: isCyber ? "#050816" : "#FFF" }}
                  >
                    Save to Vault ✓
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
