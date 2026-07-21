"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import type { SongEntry } from "@/lib/store/dashboardStore";
import { gridContainerVariants, cardVariants } from "@/lib/theme/motionVariants";
import { Modal } from "@/components/ui/modal";
import { ImageCropModal } from "@/components/ui/ImageCropModal";

const MUSIC_TABS = [
  { id: "all", label: "All Tracks", icon: "◈" },
  { id: "All-Time Favorites", label: "All-Time Favorites", icon: "👑" },
  { id: "Chill Beats", label: "Chill Beats", icon: "☕" },
  { id: "Hype/J-Pop", label: "Hype/J-Pop", icon: "⚡" },
  { id: "K-Osts", label: "K-Osts", icon: "🌸" },
];

export default function MusicPage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { songs, saveSong, deleteSong } = useDashboardStore();

  const [activeTab, setActiveTab] = useState("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<SongEntry | null>(null);

  // Mock Audio Player States
  const [currentTrack, setCurrentTrack] = useState<SongEntry | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35); // Initial mockup progress percent
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Set default track on seed load
  useEffect(() => {
    if (songs.length > 0 && !currentTrack) {
      setCurrentTrack(songs[0]);
    }
  }, [songs, currentTrack]);

  // Mock progress animation when playing
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return p + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const handlePlayToggle = (track: SongEntry) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      setProgress(0);
    }
  };

  // Filter songs
  const filteredSongs = activeTab === "all"
    ? songs
    : songs.filter((s) => s.category === activeTab);

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Delete "${title}" from your favorites?`)) {
      if (currentTrack?.id === id) {
        setIsPlaying(false);
        setCurrentTrack(null);
      }
      await deleteSong(id);
    }
  };

  const cardBorderColor = isCyber ? "rgba(0,245,255,0.2)" : "#000000";
  const cardShadow = isCyber ? "0 0 15px rgba(0,245,255,0.05)" : "4px 4px 0px #000";

  return (
    <AppShell>
      {/* ── Header Banner ── */}
      <motion.div
        className="relative rounded-2xl overflow-hidden mb-8 p-6 md:p-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: isCyber
            ? "linear-gradient(135deg, #050816, rgba(0,245,255,0.08), rgba(191,95,255,0.05))"
            : "linear-gradient(135deg, #FFF9C4, #FFF)",
          border: isCyber ? "1px solid rgba(0,245,255,0.3)" : "3px solid #000",
          boxShadow: isCyber ? "0 0 45px rgba(0,245,255,0.15)" : "5px 5px 0 rgba(0,0,0,1)",
        }}
      >
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative z-10">
          <div>
            <h1
              className="font-black text-3xl md:text-5xl mb-1 flex items-center gap-2"
              style={{
                color: isCyber ? "#00F5FF" : "#1A1A1A",
                fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
              }}
            >
              🎵 MUSIC VAULT
            </h1>
            <p className="theme-text-secondary text-xs font-semibold">
              Track your all-time favorite songs, J-Pop anthems, and emotional K-Drama soundtrack elements.
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedSong(null);
              setEditorOpen(true);
            }}
            className="px-4 py-2 text-xs font-black rounded-lg transition-transform active:scale-95 border-adaptive-unique shrink-0"
            style={{
              backgroundColor: isCyber ? "#00F5FF" : "#FF6B35",
              color: isCyber ? "#050816" : "#fff",
            }}
          >
            ➕ Add Song
          </button>
        </div>
      </motion.div>

      {/* ── Main Dashboard Layout ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start mb-8">
        
        {/* Left Widget: CD Player & Now Playing */}
        <div className="xl:col-span-1 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest theme-text-muted">🎧 Now Playing Console</h3>
          <div
            className="rounded-2xl p-6 relative overflow-hidden border-adaptive-unique"
            style={{
              backgroundColor: isCyber ? "rgba(10,15,44,0.6)" : "#FFFFFF",
              boxShadow: cardShadow,
            }}
          >
            {/* Visualizer animation when playing */}
            {isPlaying && isCyber && (
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyber-neon to-purple-500 animate-pulse" />
            )}

            {currentTrack ? (
              <div className="flex flex-col items-center text-center">
                {/* Vinyl Record Rotation Mockup */}
                <div className="relative w-36 h-36 mb-6">
                  <motion.div
                    className="w-full h-full rounded-full bg-neutral-900 border-4 border-neutral-800 flex items-center justify-center relative overflow-hidden shadow-2xl"
                    animate={isPlaying ? { rotate: 360 } : {}}
                    transition={isPlaying ? { duration: 8, repeat: Infinity, ease: "linear" } : {}}
                  >
                    {/* Inner Grooves */}
                    <div className="absolute inset-2 rounded-full border border-neutral-700/50" />
                    <div className="absolute inset-6 rounded-full border border-neutral-700/30" />
                    <div className="absolute inset-10 rounded-full border border-neutral-700/10" />
                    
                    {/* Cover Art in Center */}
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-neutral-900">
                      {currentTrack.imageUrl ? (
                        <img src={currentTrack.imageUrl} alt="cover" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#FF6B35] flex items-center justify-center font-black text-xs text-white">
                          💿
                        </div>
                      )}
                    </div>
                  </motion.div>
                  {/* Spindle hole */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-black border-2 border-neutral-800 z-10" />
                </div>

                <h2 className="font-black text-base theme-text-primary leading-snug line-clamp-1">
                  {currentTrack.title}
                </h2>
                <p className="text-xs theme-text-secondary font-semibold mt-0.5 line-clamp-1">
                  {currentTrack.artist} {currentTrack.album ? `— ${currentTrack.album}` : ""}
                </p>

                {/* Animated Audio Visualizer Bars */}
                <div className="flex items-end justify-center gap-1.5 h-10 my-5 w-full">
                  {Array.from({ length: 12 }).map((_, idx) => {
                    const duration = 0.5 + Math.random() * 0.8;
                    const delay = Math.random() * 0.4;
                    return (
                      <motion.div
                        key={idx}
                        className="w-1.5 rounded-full"
                        style={{
                          backgroundColor: isCyber 
                            ? (idx % 2 === 0 ? "#00F5FF" : "#BF5FFF") 
                            : "#FF6B35",
                        }}
                        animate={isPlaying ? { height: [4, 32, 4] } : { height: 4 }}
                        transition={{
                          duration,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay,
                        }}
                      />
                    );
                  })}
                </div>

                {/* Progress bar */}
                <div className="w-full mb-5">
                  <div className="h-1.5 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: isCyber ? "#00F5FF" : "#FF6B35",
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-bold theme-text-muted mt-1">
                    <span>{isPlaying ? `Playing` : "Paused"}</span>
                    <span>{currentTrack.duration || "--:--"}</span>
                  </div>
                </div>

                {/* Player actions */}
                <div className="flex gap-4 items-center">
                  <button
                    onClick={() => handlePlayToggle(currentTrack)}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow transition-transform hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#F3F4F6",
                      border: isCyber ? "1px solid #00F5FF" : "2px solid #000",
                      color: isCyber ? "#00F5FF" : "#000",
                    }}
                  >
                    {isPlaying ? "⏸" : "▶"}
                  </button>
                </div>

              </div>
            ) : (
              <div className="py-12 text-center theme-text-muted italic text-xs">
                Select a song from the library to load the console.
              </div>
            )}
          </div>
        </div>

        {/* Right Area: Songs Library & Category Tabs */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <h3 className="text-xs font-black uppercase tracking-widest theme-text-muted">📀 Library Collection</h3>
            
            {/* Category tabs */}
            <div className="flex flex-wrap gap-1.5 p-0.5 rounded-lg border text-[11px] font-black self-start sm:self-auto"
              style={{
                backgroundColor: isCyber ? "rgba(0,0,0,0.3)" : "#E5E7EB",
                borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#D1D5DB"
              }}
            >
              {MUSIC_TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className="px-2.5 py-1 rounded transition-all flex items-center gap-1"
                  style={{
                    backgroundColor: activeTab === t.id ? (isCyber ? "#00F5FF" : "#FFF") : "transparent",
                    color: activeTab === t.id ? (isCyber ? "#050816" : "#000") : (isCyber ? "#94A3B8" : "#4B5563"),
                  }}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Songs Grid list */}
          {filteredSongs.length === 0 ? (
            <div className="text-center py-20 rounded-2xl border border-dashed border-adaptive-unique">
              <p className="theme-text-muted text-xs font-semibold">No songs found in this category.</p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              variants={gridContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredSongs.map((song, i) => {
                const isActive = currentTrack?.id === song.id;
                return (
                  <motion.div
                    key={song.id}
                    variants={cardVariants}
                    custom={i}
                    className="group relative rounded-xl border-adaptive-unique p-3 transition-all"
                    style={{
                      backgroundColor: isCyber ? "rgba(10,15,44,0.4)" : "#FFFFFF",
                      boxShadow: cardShadow,
                      borderWidth: isActive ? "2px" : "1px",
                      borderColor: isActive ? (isCyber ? "#00F5FF" : "#FF6B35") : cardBorderColor,
                    }}
                  >
                    <div className="flex gap-3 items-center">
                      {/* Album Cover preview */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border relative flex items-center justify-center font-black text-xl"
                        style={{
                          borderColor: isCyber ? "rgba(255,255,255,0.08)" : "#000",
                          backgroundColor: "#F3F4F6",
                        }}
                      >
                        {song.imageUrl ? (
                          <img src={song.imageUrl} alt="cover" className="w-full h-full object-cover" />
                        ) : (
                          <span>💿</span>
                        )}
                        {/* Play hover cover overlay */}
                        <div
                          onClick={() => handlePlayToggle(song)}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs"
                        >
                          {isActive && isPlaying ? "⏸" : "▶"}
                        </div>
                      </div>

                      {/* Detail metadata */}
                      <div className="min-w-0 flex-1">
                        <p className="font-black text-xs theme-text-primary truncate">{song.title}</p>
                        <p className="text-[10px] theme-text-secondary truncate mt-0.5 font-semibold">
                          {song.artist} {song.album ? `· ${song.album}` : ""}
                        </p>
                        <span className="text-[9px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded mt-1.5 inline-block"
                          style={{
                            backgroundColor: isCyber ? "rgba(0,245,255,0.05)" : "rgba(0,0,0,0.05)",
                            color: isCyber ? "#00F5FF" : "#555",
                          }}
                        >
                          {song.category}
                        </span>
                      </div>

                      {/* Duration */}
                      {song.duration && (
                        <span className="text-[10px] theme-text-muted font-bold font-mono shrink-0">
                          {song.duration}
                        </span>
                      )}

                      {/* Action Triggers */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setSelectedSong(song);
                            setEditorOpen(true);
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[11px]"
                          title="Edit Details"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(song.id, song.title)}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-500/10 text-red-500 text-[11px]"
                          title="Delete Song"
                        >
                          🗑️
                        </button>
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

      </div>

      {/* ── Song Editor Modal ── */}
      <AnimatePresence>
        {editorOpen && (
          <SongEditorModal
            isOpen={editorOpen}
            onClose={() => {
              setEditorOpen(false);
              setSelectedSong(null);
            }}
            songToEdit={selectedSong}
            isCyber={isCyber}
            saveSong={saveSong}
          />
        )}
      </AnimatePresence>

    </AppShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Song Editor Modal Subcomponent
// ─────────────────────────────────────────────────────────────

interface SongEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  songToEdit: SongEntry | null;
  isCyber: boolean;
  saveSong: (id: string, data: Omit<SongEntry, "id">) => Promise<void>;
}

function SongEditorModal({ isOpen, onClose, songToEdit, isCyber, saveSong }: SongEditorModalProps) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [category, setCategory] = useState("All-Time Favorites");
  const [duration, setDuration] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageSource, setImageSource] = useState<"upload" | "url">("upload");

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imgError, setImgError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);

  useEffect(() => {
    if (songToEdit) {
      setTitle(songToEdit.title);
      setArtist(songToEdit.artist);
      setAlbum(songToEdit.album || "");
      setCategory(songToEdit.category);
      setDuration(songToEdit.duration || "");
      setImageUrl(songToEdit.imageUrl || "");
      setImageSource(songToEdit.imageUrl?.startsWith("/uploads/") ? "upload" : songToEdit.imageUrl ? "url" : "upload");
    } else {
      setTitle("");
      setArtist("");
      setAlbum("");
      setCategory("All-Time Favorites");
      setDuration("");
      setImageUrl("");
      setImageSource("upload");
    }
    setImgError(false);
  }, [songToEdit, isOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result as string);
      setIsCropOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsCropOpen(false);
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", croppedBlob, "music-cropped.jpg");

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setImageUrl(data.url);
        setImgError(false);
      } else {
        alert("Upload failed: " + (data.error || "Unknown"));
      }
    } catch {
      alert("Error uploading cover image");
    } finally {
      setIsUploading(false);
      setCropImageSrc(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) return;

    setIsSaving(true);
    try {
      const id = songToEdit?.id || "song-" + Math.random().toString(36).substr(2, 9);
      await saveSong(id, {
        title: title.trim(),
        artist: artist.trim(),
        album: album.trim() || undefined,
        category,
        duration: duration.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save track settings");
    } finally {
      setIsSaving(false);
    }
  };

  const inp = "w-full px-3 py-2 text-sm font-semibold rounded-lg outline-none border focus:ring-2 transition-all";
  const inpStyle = {
    backgroundColor: isCyber ? "rgba(255,255,255,0.04)" : "#F9F9F9",
    borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#D1D5DB",
    color: isCyber ? "#E0E8FF" : "#1A1A1A",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="p-6 flex flex-col gap-4 relative">
        {isCyber && <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[#00F5FF]" />}

        <div className="flex justify-between items-center pb-3"
          style={{ borderBottom: isCyber ? "1px solid rgba(255,255,255,0.08)" : "2px dashed #000" }}>
          <h2 className="text-lg font-black tracking-wide"
            style={{ fontFamily: isCyber ? "var(--font-orbitron)" : "inherit", color: isCyber ? "#00F5FF" : "#000" }}>
            {songToEdit ? "✏️ Edit Song Details" : "✨ Add New Song"}
          </h2>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center opacity-60 hover:opacity-100">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Photo Source Input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase tracking-wider opacity-60">Cover Art Source</label>
            <div className="flex gap-4 items-center">
              {/* Preview */}
              <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border flex items-center justify-center font-black text-xl"
                style={{ borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000", backgroundColor: "#F0F0F0" }}>
                {imageUrl && !imgError ? (
                  <img src={imageUrl} alt="preview" className="w-full h-full object-cover" onError={() => setImgError(true)} />
                ) : (
                  <span style={{ color: isCyber ? "#00F5FF" : "#999" }}>💿</span>
                )}
              </div>
              <div className="flex-1 flex flex-col gap-2.5">
                {/* Tab switch */}
                <div className="flex gap-1 p-0.5 rounded-lg border text-[10px] font-black w-fit"
                  style={{ backgroundColor: isCyber ? "rgba(0,0,0,0.3)" : "#E5E7EB", borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#D1D5DB" }}>
                  {(["upload", "url"] as const).map(src => (
                    <button key={src} type="button" onClick={() => setImageSource(src)}
                      className="px-2.5 py-0.5 rounded transition-colors"
                      style={{
                        backgroundColor: imageSource === src ? (isCyber ? "#00F5FF" : "#FFF") : "transparent",
                        color: imageSource === src ? (isCyber ? "#050816" : "#000") : (isCyber ? "#94A3B8" : "#4B5563"),
                      }}>
                      {src === "upload" ? "📁 Upload" : "🔗 Link"}
                    </button>
                  ))}
                </div>

                {imageSource === "url" ? (
                  <input type="url" value={imageUrl} onChange={e => { setImageUrl(e.target.value); setImgError(false); }}
                    placeholder="https://..." className={inp} style={inpStyle} />
                ) : (
                  <div className="flex gap-2 items-center">
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading}
                      className="px-3 py-1.5 text-xs font-black rounded border"
                      style={{ backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#E5E7EB", borderColor: isCyber ? "#00F5FF" : "#9CA3AF", color: isCyber ? "#00F5FF" : "#374151" }}>
                      📁 {isUploading ? "Uploading..." : "Upload Cover"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-black uppercase tracking-wider opacity-60">Title <span className="text-red-400">*</span></label>
            <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Sparkle" className={inp} style={inpStyle} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-black uppercase tracking-wider opacity-60">Artist <span className="text-red-400">*</span></label>
            <input type="text" required value={artist} onChange={e => setArtist(e.target.value)} placeholder="e.g. Tatsuro Yamashita" className={inp} style={inpStyle} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-black uppercase tracking-wider opacity-60">Album</label>
              <input type="text" value={album} onChange={e => setAlbum(e.target.value)} placeholder="e.g. For You" className={inp} style={inpStyle} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-black uppercase tracking-wider opacity-60">Duration</label>
              <input type="text" value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 4:15" className={inp} style={inpStyle} />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-black uppercase tracking-wider opacity-60">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className={inp + " cursor-pointer"} style={inpStyle}>
              <option value="All-Time Favorites">👑 All-Time Favorites</option>
              <option value="Chill Beats">☕ Chill Beats</option>
              <option value="Hype/J-Pop">⚡ Hype/J-Pop</option>
              <option value="K-Osts">🌸 K-Osts</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold rounded-lg border-2"
              style={{ borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#D1D5DB" }}>Cancel</button>
            <button type="submit" disabled={isSaving || isUploading} className="px-5 py-2 text-xs font-black rounded-lg"
              style={{ backgroundColor: isCyber ? "#00F5FF" : "#FF6B35", color: isCyber ? "#050816" : "#fff" }}>
              {isSaving ? "Saving..." : "Save Song"}
            </button>
          </div>
        </form>
      </div>

      <ImageCropModal
        isOpen={isCropOpen}
        imageSrc={cropImageSrc}
        aspect={1}
        title="Crop Song Cover Art"
        onClose={() => {
          setIsCropOpen(false);
          setCropImageSrc(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
        onCropComplete={handleCropComplete}
      />
    </Modal>
  );
}
