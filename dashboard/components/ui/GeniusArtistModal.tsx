"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "@/components/ui/modal";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";

interface GeniusArtistModalProps {
  isOpen: boolean;
  onClose: () => void;
  artistName: string | null;
}

export function GeniusArtistModal({ isOpen, onClose, artistName }: GeniusArtistModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { playTrack } = useDashboardStore();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    artistName: string;
    artistImageUrl?: string | null;
    artistUrl?: string | null;
    topSongs?: any[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !artistName) return;
    setLoading(true);
    setError(null);

    fetch(`/api/music/genius?artist=${encodeURIComponent(artistName)}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.error) {
          setError(resData.error);
        } else {
          setData(resData);
        }
      })
      .catch((err) => setError("Failed to fetch artist details."))
      .finally(() => setLoading(false));
  }, [isOpen, artistName]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      <div className="p-6 text-slate-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
          <h2
            className="text-lg font-black tracking-wide flex items-center gap-2"
            style={{
              fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
              color: isCyber ? "#00F5FF" : "#1A1A1A",
            }}
          >
            <span>🎤</span>
            <span>{artistName || "Artist Details"}</span>
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs font-bold opacity-60 animate-pulse">
            Loading Genius Artist Info...
          </div>
        ) : error ? (
          <div className="py-8 text-center text-xs font-bold text-red-400">
            {error}
          </div>
        ) : data ? (
          <div className="space-y-4">
            {/* Artist Header Banner */}
            <div className="flex items-center gap-4 p-4 rounded-xl border bg-black/20" style={{ borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000" }}>
              <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-cyan-400 bg-slate-800 flex items-center justify-center">
                {data.artistImageUrl ? (
                  <img src={data.artistImageUrl} alt={data.artistName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl">🎤</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-black text-base truncate" style={{ color: isCyber ? "#E0FFFF" : "#000" }}>
                  {data.artistName}
                </h3>
                <p className="text-[10px] font-semibold opacity-60 mt-0.5">Genius Verified Artist Metadata</p>
                {data.artistUrl && (
                  <a
                    href={data.artistUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-bold text-cyan-400 hover:underline mt-1 block"
                  >
                    View on Genius.com ↗
                  </a>
                )}
              </div>
            </div>

            {/* Top Songs Listing */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider mb-2 opacity-70">
                Top Songs & Recommendations
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {data.topSongs && data.topSongs.length > 0 ? (
                  data.topSongs.map((song: any) => (
                    <div
                      key={song.id || song.title}
                      className="p-2.5 rounded-lg border flex items-center justify-between gap-3 bg-black/10 hover:bg-white/5 transition-all"
                      style={{ borderColor: isCyber ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)" }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {song.songImageUrl && (
                          <img src={song.songImageUrl} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-xs truncate">{song.title}</p>
                          <p className="text-[10px] opacity-60 truncate">{song.artist}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          playTrack({
                            id: `genius-${song.id}`,
                            title: song.title,
                            artist: song.artist,
                            category: "All-Time Favorites",
                            imageUrl: song.songImageUrl,
                          });
                          onClose();
                        }}
                        className="px-2.5 py-1 text-[10px] font-black rounded uppercase tracking-wider border bg-cyan-400/10 text-cyan-400 border-cyan-400/30 hover:bg-cyan-400 hover:text-black transition-all cursor-pointer"
                      >
                        ▶ Play
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs opacity-50 text-center py-4">No top tracks found for this artist.</p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
