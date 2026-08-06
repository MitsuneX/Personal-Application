"use client";

import React, { useEffect, useState, use } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { motion } from "framer-motion";
import Link from "next/link";
import { useToast } from "@/components/ui/ToastProvider";

interface ArtistPageProps {
  params: Promise<{ name: string }>;
}

export default function ArtistDetailPage({ params }: ArtistPageProps) {
  const resolvedParams = use(params);
  const rawName = resolvedParams?.name || "";
  const artistName = decodeURIComponent(rawName);

  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { songs, playTrack, setPlaylistQueue } = useDashboardStore();
  const toast = useToast();

  const [geniusData, setGeniusData] = useState<any>(null);
  const [isLoadingGenius, setIsLoadingGenius] = useState(true);

  // Filter songs by this artist
  const artistSongs = songs.filter(
    (s) => s.artist && s.artist.toLowerCase().includes(artistName.toLowerCase())
  );

  useEffect(() => {
    if (!artistName) return;
    const controller = new AbortController();
    setIsLoadingGenius(true);

    fetch(`/api/music/genius?artist=${encodeURIComponent(artistName)}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setGeniusData(data);
      })
      .catch(() => {})
      .finally(() => setIsLoadingGenius(false));

    return () => controller.abort();
  }, [artistName]);

  const handlePlayAllArtistSongs = () => {
    if (artistSongs.length === 0) return;
    setPlaylistQueue(artistSongs);
    playTrack(artistSongs[0]);
    toast.success(`Playing all tracks by ${artistName}`);
  };

  const accent = isCyber ? "#00F5FF" : "#FF6B35";
  const cardBg = isCyber ? "rgba(10,15,44,0.5)" : "#FFFFFF";
  const border = isCyber ? "rgba(0,245,255,0.2)" : "#000000";
  const textPrimary = isCyber ? "#E0FFFF" : "#000000";
  const textMuted = isCyber ? "#94A3B8" : "#555555";
  const purple = isCyber ? "#BF5FFF" : "#7C3AED";

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl mx-auto pb-12 select-none">
        {/* Back Link */}
        <Link
          href="/music"
          className="inline-flex items-center gap-1.5 text-xs font-bold hover:underline opacity-80 hover:opacity-100"
          style={{ color: accent }}
        >
          ← Back to Music Vault
        </Link>

        {/* Hero Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 md:p-8 border relative overflow-hidden flex flex-col md:flex-row items-center gap-6"
          style={{
            backgroundColor: isCyber ? "rgba(5,8,22,0.9)" : "#FFF9F0",
            borderColor: border,
            boxShadow: isCyber ? "0 0 35px rgba(0,245,255,0.15)" : "4px 4px 0 #000",
          }}
        >
          {/* Avatar / Image */}
          <div
            className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden shrink-0 border-2 bg-slate-800 flex items-center justify-center font-black text-4xl shadow-2xl"
            style={{ borderColor: accent }}
          >
            {geniusData?.imageUrl ? (
              <img src={geniusData.imageUrl} alt={artistName} className="w-full h-full object-cover" />
            ) : (
              <span>🎤</span>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 text-center md:text-left space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-black/20" style={{ color: purple }}>
              ARTIST PROFILE
            </span>
            <h1 className="text-2xl md:text-4xl font-black truncate" style={{ color: textPrimary }}>
              {artistName}
            </h1>
            <p className="text-xs opacity-70" style={{ color: textMuted }}>
              {artistSongs.length} tracks in Vault · {geniusData?.alternateNames?.length ? `AKA: ${geniusData.alternateNames.join(", ")}` : "Verified Artist"}
            </p>

            {artistSongs.length > 0 && (
              <button
                onClick={handlePlayAllArtistSongs}
                className="px-4 py-2 text-xs font-black rounded-xl transition-transform active:scale-95 flex items-center gap-2 mx-auto md:mx-0"
                style={{ backgroundColor: accent, color: isCyber ? "#050816" : "#FFF" }}
              >
                ▶ Play Discography ({artistSongs.length} Tracks)
              </button>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vault Discography */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest theme-text-muted">
              💿 Vault Discography ({artistSongs.length})
            </h3>

            {artistSongs.length === 0 ? (
              <div className="rounded-xl border p-8 text-center" style={{ borderColor: border, backgroundColor: cardBg }}>
                <p className="text-xs font-bold opacity-60" style={{ color: textMuted }}>
                  No tracks by {artistName} stored in your Music Vault yet.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {artistSongs.map((song, idx) => (
                  <div
                    key={song.id}
                    className="flex items-center gap-3 p-3 rounded-xl border group hover:bg-white/5 transition-all"
                    style={{ borderColor: border, backgroundColor: cardBg }}
                  >
                    <span className="w-5 text-center text-[10px] font-black opacity-50" style={{ color: textMuted }}>
                      {idx + 1}
                    </span>
                    <div
                      className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-700 flex items-center justify-center text-xs"
                      style={{ border: `1px solid ${border}` }}
                    >
                      {song.imageUrl ? (
                        <img src={song.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>🎵</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black truncate" style={{ color: textPrimary }}>
                        {song.title}
                      </p>
                      <p className="text-[10px] opacity-60 truncate" style={{ color: textMuted }}>
                        {song.category || "All-Time Favorites"} {song.duration ? `· ${song.duration}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => playTrack(song, artistSongs)}
                      className="px-3 py-1 text-xs font-black rounded-lg transition-transform active:scale-95"
                      style={{ backgroundColor: accent, color: isCyber ? "#050816" : "#FFF" }}
                    >
                      ▶ Play
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Genius Metadata & Bio */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest theme-text-muted">
              📖 Artist Biography & Info
            </h3>

            <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: border, backgroundColor: cardBg }}>
              {isLoadingGenius ? (
                <p className="text-xs font-bold animate-pulse text-center py-6" style={{ color: textMuted }}>
                  Fetching Genius metadata…
                </p>
              ) : geniusData?.description ? (
                <p className="text-xs opacity-80 leading-relaxed whitespace-pre-line" style={{ color: textPrimary }}>
                  {geniusData.description}
                </p>
              ) : (
                <p className="text-xs opacity-50 italic text-center py-4" style={{ color: textMuted }}>
                  No biography available from Genius for this artist.
                </p>
              )}

              {geniusData?.url && (
                <div className="pt-2 border-t" style={{ borderColor: border }}>
                  <a
                    href={geniusData.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold hover:underline flex items-center gap-1"
                    style={{ color: purple }}
                  >
                    🔗 View on Genius.com →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
