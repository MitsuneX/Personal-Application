"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import type { SongEntry, PlaylistEntry } from "@/lib/store/dashboardStore";
import { gridContainerVariants, cardVariants } from "@/lib/theme/motionVariants";
import { Modal } from "@/components/ui/modal";
import { ImageCropModal } from "@/components/ui/ImageCropModal";
import { GeniusArtistModal } from "@/components/ui/GeniusArtistModal";
import { FloatingFAB } from "@/components/ui/FloatingFAB";

const MUSIC_TABS = [
  { id: "all", label: "All Tracks", icon: "◈" },
  { id: "youtube_search", label: "YouTube Search", icon: "🔍" },
  { id: "playlists", label: "Playlists", icon: "📁" },
  { id: "offline_saved", label: "Offline Cache", icon: "💾" },
  { id: "All-Time Favorites", label: "All-Time Favorites", icon: "👑" },
  { id: "Chill Beats", label: "Chill Beats", icon: "☕" },
  { id: "Hype/J-Pop", label: "Hype/J-Pop", icon: "⚡" },
  { id: "K-Osts", label: "K-Osts", icon: "🌸" },
];

export default function MusicPage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const {
    songs,
    playlists,
    saveSong,
    deleteSong,
    savePlaylist,
    deletePlaylist,
    activeTrack,
    isPlaying,
    playTrack,
    togglePlay,
  } = useDashboardStore();

  const [activeTab, setActiveTab] = useState("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<SongEntry | null>(null);

  // Genius Modal State
  const [geniusArtist, setGeniusArtist] = useState<string | null>(null);

  // YouTube Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Online Music Search Modal State
  const [onlineSearchModalOpen, setOnlineSearchModalOpen] = useState(false);

  // Playlists States
  const [selectedPlaylist, setSelectedPlaylist] = useState<PlaylistEntry | null>(null);
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  // Offline Cached Tracks State
  const [offlineTrackIds, setOfflineTrackIds] = useState<string[]>([]);

  // Load cached tracks list on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "caches" in window) {
      caches.open("music-offline-cache-v1").then(async (cache) => {
        const keys = await cache.keys();
        const ids = keys.map((k) => k.url);
        setOfflineTrackIds(ids);
      });
    }
  }, []);

  const handleDownloadSong = async (song: SongEntry) => {
    try {
      if (song.audioUrl) {
        const response = await fetch(song.audioUrl);
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `${song.artist || "Artist"} - ${song.title}.mp3`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
      } else if (song.youtubeId) {
        window.open(`https://www.youtube.com/watch?v=${song.youtubeId}`, "_blank");
      } else {
        alert("Audio source URL not available for download.");
      }
    } catch (err) {
      console.error("Download error:", err);
      alert("Error downloading audio file.");
    }
  };

  const handleSaveOffline = async (song: SongEntry) => {
    // 1. Ensure track is saved in store / database
    await saveSong(song.id, {
      title: song.title,
      artist: song.artist,
      album: song.album,
      category: song.category,
      imageUrl: song.imageUrl,
      audioUrl: song.audioUrl,
      youtubeId: song.youtubeId,
      duration: song.duration,
    });

    // 2. Cache in Web Cache API
    const targetUrl = song.audioUrl || song.imageUrl;
    if (targetUrl && "caches" in window) {
      try {
        const cache = await caches.open("music-offline-cache-v1");
        await cache.add(targetUrl);
        setOfflineTrackIds((prev) => [...prev, targetUrl]);
      } catch (err) {
        console.error("Cache error:", err);
      }
    }
    alert(`Saved "${song.title}" to Vault & Offline Cache!`);
  };

  // YouTube search handler
  const handleYouTubeSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      if (data.results) {
        setSearchResults(data.results);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const newPl: PlaylistEntry = {
      id: "pl-" + Math.random().toString(36).substr(2, 9),
      name: newPlaylistName.trim(),
      songs: [],
    };
    await savePlaylist(newPl);
    setNewPlaylistName("");
    setPlaylistModalOpen(false);
  };

  const handleAddSongToPlaylist = async (playlist: PlaylistEntry, song: SongEntry) => {
    const existingSongs = playlist.songs || [];
    const updatedSongs = [...existingSongs, song];
    await savePlaylist({ ...playlist, songs: updatedSongs });
    alert(`Added "${song.title}" to ${playlist.name}`);
  };

  const filteredSongs = activeTab === "all"
    ? songs
    : activeTab === "offline_saved"
    ? songs.filter((s) => s.audioUrl && offlineTrackIds.includes(s.audioUrl))
    : songs.filter((s) => s.category === activeTab);

  const cardBorderColor = isCyber ? "rgba(0,245,255,0.2)" : "#000000";
  const cardShadow = isCyber ? "0 0 15px rgba(0,245,255,0.05)" : "4px 4px 0px #000";

  return (
    <AppShell>
      {/* ── Header Banner ── */}
      <motion.div
        className="relative rounded-2xl overflow-hidden mb-8 p-6 md:p-8 border"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: isCyber
            ? "linear-gradient(135deg, #050816, rgba(0,245,255,0.08), rgba(191,95,255,0.05))"
            : "linear-gradient(135deg, #FFF9C4, #FFF)",
          borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000",
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
              🎵 MUSIC VAULT & ENGINE
            </h1>
            <p className="theme-text-secondary text-xs font-semibold">
              Stream online YouTube tracks, build custom playlists, upload audio, and save tracks offline.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Main Layout ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start mb-8">
        
        {/* Left Console: Now Playing & Vinyl Animation */}
        <div className="xl:col-span-1 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest theme-text-muted">🎧 Active Audio Console</h3>
          <div
            className="rounded-2xl p-6 relative overflow-hidden border border-adaptive-unique"
            style={{
              backgroundColor: isCyber ? "rgba(10,15,44,0.6)" : "#FFFFFF",
              boxShadow: cardShadow,
            }}
          >
            {activeTrack ? (
              <div className="flex flex-col items-center text-center">
                {/* Vinyl Record */}
                <div className="relative w-36 h-36 mb-6">
                  <motion.div
                    className="w-full h-full rounded-full bg-neutral-900 border-4 border-neutral-800 flex items-center justify-center relative overflow-hidden shadow-2xl"
                    animate={isPlaying ? { rotate: 360 } : {}}
                    transition={isPlaying ? { duration: 8, repeat: Infinity, ease: "linear" } : {}}
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-neutral-900">
                      {activeTrack.imageUrl ? (
                        <img src={activeTrack.imageUrl} alt="cover" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#FF6B35] flex items-center justify-center font-black text-xs text-white">
                          💿
                        </div>
                      )}
                    </div>
                  </motion.div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-black border-2 border-neutral-800 z-10" />
                </div>

                <h2 className="font-black text-base theme-text-primary leading-snug line-clamp-1">
                  {activeTrack.title}
                </h2>
                <button
                  onClick={() => setGeniusArtist(activeTrack.artist)}
                  className="text-xs theme-text-secondary font-semibold mt-0.5 line-clamp-1 hover:underline cursor-pointer"
                >
                  👤 {activeTrack.artist} {activeTrack.album ? `— ${activeTrack.album}` : ""}
                </button>

                {/* Animated Equalizer Bars */}
                <div className="flex items-end justify-center gap-1.5 h-10 my-5 w-full">
                  {Array.from({ length: 12 }).map((_, idx) => (
                    <motion.div
                      key={idx}
                      className="w-1.5 rounded-full"
                      style={{
                        backgroundColor: isCyber ? (idx % 2 === 0 ? "#00F5FF" : "#BF5FFF") : "#FF6B35",
                      }}
                      animate={isPlaying ? { height: [4, 32, 4] } : { height: 4 }}
                      transition={{ duration: 0.6 + (idx % 3) * 0.2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  ))}
                </div>

                {/* Controls */}
                <div className="flex gap-4 items-center">
                  <button
                    onClick={togglePlay}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                    style={{
                      backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#F3F4F6",
                      border: isCyber ? "1px solid #00F5FF" : "2px solid #000",
                      color: isCyber ? "#00F5FF" : "#000",
                    }}
                  >
                    {isPlaying ? "⏸" : "▶"}
                  </button>
                  <button
                    onClick={() => handleSaveOffline(activeTrack)}
                    className="px-3 py-1.5 text-xs font-black rounded-lg border transition-all hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: isCyber ? "rgba(0,245,255,0.1)" : "#E5E7EB",
                      borderColor: isCyber ? "#00F5FF" : "#000",
                      color: isCyber ? "#00F5FF" : "#000",
                    }}
                  >
                    💾 Save Offline
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center theme-text-muted italic text-xs">
                Select a song to load the live player console.
              </div>
            )}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="xl:col-span-2 space-y-4">
          {/* Tabs bar */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <h3 className="text-xs font-black uppercase tracking-widest theme-text-muted">📀 Music Hub Navigation</h3>
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
                  className="px-2.5 py-1 rounded transition-all flex items-center gap-1 cursor-pointer"
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

          {/* YouTube Online Search View */}
          {activeTab === "youtube_search" && (
            <div className="space-y-4">
              <form onSubmit={handleYouTubeSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search online tracks via YouTube API..."
                  className="flex-1 px-4 py-2 text-xs font-semibold rounded-xl outline-none border"
                  style={{
                    backgroundColor: isCyber ? "rgba(255,255,255,0.04)" : "#FFF",
                    borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000",
                    color: isCyber ? "#E0E8FF" : "#000",
                  }}
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-4 py-2 text-xs font-black rounded-xl border bg-cyan-400 text-black border-cyan-400 font-bold"
                >
                  {isSearching ? "Searching..." : "🔍 Search"}
                </button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border flex items-center gap-3 bg-black/20"
                    style={{ borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000" }}
                  >
                    <img src={item.imageUrl} alt="" className="w-14 h-14 object-cover rounded-lg shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-xs truncate" style={{ color: isCyber ? "#E0E8FF" : "#000" }}>{item.title}</p>
                      <p className="text-[10px] opacity-60 truncate">{item.artist}</p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => playTrack({
                            id: item.youtubeId,
                            title: item.title,
                            artist: item.artist,
                            category: "YouTube Stream",
                            imageUrl: item.imageUrl,
                            youtubeId: item.youtubeId,
                          })}
                          className="px-2 py-1 text-[9px] font-black rounded bg-cyan-400 text-black"
                        >
                          ▶ Stream
                        </button>
                        <button
                          onClick={() => saveSong(item.youtubeId, {
                            title: item.title,
                            artist: item.artist,
                            category: "All-Time Favorites",
                            imageUrl: item.imageUrl,
                            youtubeId: item.youtubeId,
                          })}
                          className="px-2 py-1 text-[9px] font-black rounded border border-white/20"
                        >
                          ➕ Add to Vault
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Playlists View */}
          {activeTab === "playlists" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {playlists.map((pl) => (
                  <div
                    key={pl.id}
                    className="p-4 rounded-xl border flex flex-col justify-between gap-3 bg-black/20"
                    style={{ borderColor: isCyber ? "rgba(191,95,255,0.3)" : "#000" }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-sm" style={{ color: isCyber ? "#BF5FFF" : "#000" }}>📁 {pl.name}</h4>
                        <p className="text-[10px] opacity-60 mt-0.5">{pl.songs?.length || 0} Tracks</p>
                      </div>
                      <button
                        onClick={() => deletePlaylist(pl.id)}
                        className="text-red-400 hover:underline text-xs"
                      >
                        🗑️ Delete
                      </button>
                    </div>

                    <div className="space-y-1">
                      {(pl.songs || []).slice(0, 3).map((s: any, idx: number) => (
                        <p key={idx} className="text-[10px] truncate opacity-80">
                          • {typeof s === "string" ? s : s.title}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Standard Songs Grid */}
          {activeTab !== "youtube_search" && activeTab !== "playlists" && (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              variants={gridContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredSongs.map((song, i) => {
                const isActive = activeTrack?.id === song.id;
                return (
                  <motion.div
                    key={song.id}
                    variants={cardVariants}
                    custom={i}
                    className="group relative rounded-xl border p-3 transition-all"
                    style={{
                      backgroundColor: isCyber ? "rgba(10,15,44,0.4)" : "#FFFFFF",
                      boxShadow: cardShadow,
                      borderWidth: isActive ? "2px" : "1px",
                      borderColor: isActive ? (isCyber ? "#00F5FF" : "#FF6B35") : cardBorderColor,
                    }}
                  >
                    <div className="flex gap-3 items-center">
                      <div
                        className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border relative flex items-center justify-center font-black text-xl bg-slate-800"
                        style={{ borderColor: isCyber ? "rgba(255,255,255,0.08)" : "#000" }}
                      >
                        {song.imageUrl ? (
                          <img src={song.imageUrl} alt="cover" className="w-full h-full object-cover" />
                        ) : (
                          <span>💿</span>
                        )}
                        <div
                          onClick={() => playTrack(song, filteredSongs)}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs"
                        >
                          {isActive && isPlaying ? "⏸" : "▶"}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-black text-xs truncate">{song.title}</p>
                        <button
                          onClick={() => setGeniusArtist(song.artist)}
                          className="text-[10px] opacity-70 truncate font-semibold hover:underline block text-left"
                        >
                          👤 {song.artist}
                        </button>
                        <div className="flex gap-2 items-center mt-1">
                          <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10">
                            {song.category}
                          </span>
                          {song.audioUrl && offlineTrackIds.includes(song.audioUrl) && (
                            <span className="text-[9px] font-bold text-green-400">💾 Saved</span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-1 items-center">
                        <button
                          onClick={() => handleDownloadSong(song)}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-black/10 text-xs cursor-pointer"
                          title="Download High-Quality Audio Track"
                        >
                          ⬇️
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSong(song);
                            setEditorOpen(true);
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-black/10 text-xs"
                          title="Edit Song"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteSong(song.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-500/10 text-red-400 text-xs"
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

      {/* ── Genius Artist Detail Drawer/Modal ── */}
      <GeniusArtistModal
        isOpen={!!geniusArtist}
        onClose={() => setGeniusArtist(null)}
        artistName={geniusArtist}
      />

      {/* ── Dedicated Online Music Search Modal (matching Drama Search style) ── */}
      <OnlineMusicSearchModal
        isOpen={onlineSearchModalOpen}
        onClose={() => setOnlineSearchModalOpen(false)}
        isCyber={isCyber}
        playTrack={playTrack}
        saveSong={saveSong}
      />

      {/* ── Create Playlist Modal ── */}
      <Modal isOpen={playlistModalOpen} onClose={() => setPlaylistModalOpen(false)} maxWidth="max-w-sm">
        <form onSubmit={handleCreatePlaylist} className="p-5 space-y-4">
          <h3 className="font-black text-base" style={{ color: isCyber ? "#00F5FF" : "#000" }}>📁 Create New Playlist</h3>
          <input
            type="text"
            required
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            placeholder="Playlist name (e.g. Chill Vibes)..."
            className="w-full px-3 py-2 text-xs rounded-lg border outline-none bg-black/10"
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setPlaylistModalOpen(false)} className="px-3 py-1.5 text-xs font-bold">Cancel</button>
            <button type="submit" className="px-4 py-1.5 text-xs font-black rounded bg-cyan-400 text-black">Create</button>
          </div>
        </form>
      </Modal>

      {/* ── Song Editor & Local Audio Uploader Modal ── */}
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

      {/* ── Music Vault Floating FAB (Bottom-Right Corner) ── */}
      <FloatingFAB
        category="music"
        customActions={[
          { icon: "🔍", label: "Search Online Music", onClick: () => setOnlineSearchModalOpen(true) },
          { icon: "➕", label: "Upload / Add Song", onClick: () => { setSelectedSong(null); setEditorOpen(true); } },
          { icon: "📁", label: "New Playlist", onClick: () => setPlaylistModalOpen(true) },
        ]}
      />
    </AppShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Song Editor & Local Audio File Upload Subcomponent
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
  const [audioUrl, setAudioUrl] = useState("");
  const [imageSource, setImageSource] = useState<"upload" | "url">("upload");

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAudioUploading, setIsAudioUploading] = useState(false);
  const [imgError, setImgError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
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
      setAudioUrl(songToEdit.audioUrl || "");
      setImageSource(songToEdit.imageUrl?.startsWith("/uploads/") ? "upload" : songToEdit.imageUrl ? "url" : "upload");
    } else {
      setTitle("");
      setArtist("");
      setAlbum("");
      setCategory("All-Time Favorites");
      setDuration("");
      setImageUrl("");
      setAudioUrl("");
      setImageSource("upload");
    }
    setImgError(false);
  }, [songToEdit, isOpen]);

  const handleAudioSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAudioUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setAudioUrl(data.url);
        alert("Audio file uploaded successfully!");
      } else {
        alert("Audio upload failed: " + (data.error || "Unknown"));
      }
    } catch {
      alert("Error uploading audio file");
    } finally {
      setIsAudioUploading(false);
    }
  };

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
        audioUrl: audioUrl.trim() || undefined,
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

        <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: isCyber ? "rgba(255,255,255,0.08)" : "#000" }}>
          <h2 className="text-lg font-black tracking-wide" style={{ color: isCyber ? "#00F5FF" : "#000" }}>
            {songToEdit ? "✏️ Edit Song Details" : "✨ Add New Song"}
          </h2>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center opacity-60 hover:opacity-100">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Cover Art Source */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase tracking-wider opacity-60">Cover Art</label>
            <div className="flex gap-4 items-center">
              <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border flex items-center justify-center font-black text-xl bg-slate-800">
                {imageUrl && !imgError ? (
                  <img src={imageUrl} alt="preview" className="w-full h-full object-cover" onError={() => setImgError(true)} />
                ) : (
                  <span>💿</span>
                )}
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="px-3 py-1.5 text-xs font-black rounded border">
                  📁 {isUploading ? "Uploading..." : "Upload Cover Image"}
                </button>
              </div>
            </div>
          </div>

          {/* Local Audio File Upload */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-black uppercase tracking-wider opacity-60">Local Audio File (.mp3, .wav, .m4a, .flac)</label>
            <input type="file" ref={audioInputRef} onChange={handleAudioSelect} accept="audio/*" className="hidden" />
            <div className="flex gap-2 items-center">
              <button
                type="button"
                onClick={() => audioInputRef.current?.click()}
                disabled={isAudioUploading}
                className="px-3 py-1.5 text-xs font-black rounded border bg-cyan-400/20 border-cyan-400 text-cyan-400"
              >
                🎵 {isAudioUploading ? "Uploading Track..." : "Upload Audio File"}
              </button>
              {audioUrl && <span className="text-[10px] font-bold text-green-400 truncate max-w-[150px]">✓ Audio Uploaded</span>}
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
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold rounded-lg border-2">Cancel</button>
            <button type="submit" disabled={isSaving || isUploading || isAudioUploading} className="px-5 py-2 text-xs font-black rounded-lg" style={{ backgroundColor: isCyber ? "#00F5FF" : "#FF6B35", color: isCyber ? "#050816" : "#fff" }}>
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

// ─────────────────────────────────────────────────────────────
// Online Music Search Modal Subcomponent (Drama Search style)
// ─────────────────────────────────────────────────────────────

interface OnlineMusicSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCyber: boolean;
  playTrack: (track: SongEntry, queue?: SongEntry[]) => void;
  saveSong: (id: string, data: Omit<SongEntry, "id">) => Promise<void>;
}

function OnlineMusicSearchModal({
  isOpen,
  onClose,
  isCyber,
  playTrack,
  saveSong,
}: OnlineMusicSearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (data.results) {
        setResults(data.results);
      }
    } catch (err) {
      console.error("Online music search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      <div className="p-6 space-y-4">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-3 border-b border-white/10">
          <h2
            className="text-base font-black tracking-wide flex items-center gap-2"
            style={{
              fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
              color: isCyber ? "#00F5FF" : "#000",
            }}
          >
            <span>🔍</span>
            <span>Search Online Music (YouTube Engine)</span>
          </h2>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center opacity-60 hover:opacity-100 font-bold">
            ✕
          </button>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type song title, artist, J-Pop, K-OST..."
            className="flex-1 px-4 py-2 text-xs font-semibold rounded-xl outline-none border bg-black/10"
            style={{
              borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000",
              color: isCyber ? "#E0E8FF" : "#000",
            }}
            autoFocus
          />
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2 text-xs font-black rounded-xl cursor-pointer shadow transition-transform active:scale-95"
            style={{
              backgroundColor: isCyber ? "#00F5FF" : "#0284C7",
              color: isCyber ? "#050816" : "#FFF",
            }}
          >
            {isSearching ? "Searching..." : "🔍 Search"}
          </button>
        </form>

        {/* Results List */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {results.length > 0 ? (
            results.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl border flex items-center gap-3 bg-black/20 hover:bg-white/5 transition-all"
                style={{ borderColor: isCyber ? "rgba(0,245,255,0.15)" : "rgba(0,0,0,0.1)" }}
              >
                <img src={item.imageUrl} alt="" className="w-14 h-14 object-cover rounded-lg shrink-0 border border-white/10" />
                <div className="min-w-0 flex-1">
                  <p className="font-black text-xs truncate" style={{ color: isCyber ? "#E0E8FF" : "#000" }}>
                    {item.title}
                  </p>
                  <p className="text-[10px] opacity-60 truncate">{item.artist}</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => {
                        playTrack({
                          id: item.youtubeId,
                          title: item.title,
                          artist: item.artist,
                          category: "YouTube Stream",
                          imageUrl: item.imageUrl,
                          youtubeId: item.youtubeId,
                        });
                        onClose();
                      }}
                      className="px-2.5 py-1 text-[10px] font-black rounded bg-cyan-400 text-black cursor-pointer hover:scale-105 transition-transform"
                    >
                      ▶ Stream Now
                    </button>
                    <button
                      onClick={() => {
                        saveSong(item.youtubeId, {
                          title: item.title,
                          artist: item.artist,
                          category: "All-Time Favorites",
                          imageUrl: item.imageUrl,
                          youtubeId: item.youtubeId,
                        });
                        alert(`Saved "${item.title}" to Music Vault!`);
                      }}
                      className="px-2.5 py-1 text-[10px] font-black rounded border border-white/20 hover:bg-white/10 cursor-pointer"
                    >
                      ➕ Add to Vault
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : isSearching ? (
            <p className="text-xs text-center py-8 opacity-60 animate-pulse">Searching YouTube Data API v3...</p>
          ) : (
            <p className="text-xs text-center py-8 opacity-50">Type a query above and hit Search to discover tracks.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}

