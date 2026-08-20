"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { ThemeAccentConfig } from "./DossierThemeAccent";
import { ExternalLinks, DossierOstTrack, useDashboardStore } from "@/lib/store/dashboardStore";
import { ExternalLink, Music, Award, PlayCircle, PauseCircle } from "lucide-react";

export interface DossierExternalLinksProps {
  externalLinks?: ExternalLinks;
  ostTracks?: DossierOstTrack[];
  awards?: string[];
  studio?: string;
  country?: string;
  themeConfig: ThemeAccentConfig;
}

export function DossierExternalLinks({
  externalLinks = {},
  ostTracks = [],
  awards = [],
  themeConfig,
}: DossierExternalLinksProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { activeTrack, isPlaying, playTrack, togglePlay } = useDashboardStore();

  const allLinks = [
    { name: "IMDb", url: externalLinks.imdb, color: "#F5C518" },
    { name: "TMDb", url: externalLinks.tmdb, color: "#01B4E4" },
    { name: "TVMaze", url: externalLinks.tvmaze, color: "#31A05F" },
    { name: "MyDramaList", url: externalLinks.mydramalist, color: "#3B82F6" },
    { name: "Wikipedia", url: externalLinks.wikipedia, color: "#9CA3AF" },
    { name: "Official Site", url: externalLinks.officialSite, color: "#10B981" },
    { name: "Official Trailer", url: externalLinks.trailerUrl, color: "#FF0000" },
    { name: "Rotten Tomatoes", url: externalLinks.rottenTomatoes, color: "#FA320A" },
    { name: "Netflix", url: externalLinks.netflix, color: "#EF4444" },
    { name: "Disney+", url: externalLinks.disney, color: "#06B6D4" },
    { name: "Viki", url: externalLinks.viki, color: "#8B5CF6" },
    { name: "Prime Video", url: externalLinks.primeVideo, color: "#00A8E1" },
  ];

  const activeLinks = allLinks.filter((l) => Boolean(l.url));

  const hasOst = ostTracks.length > 0;
  const hasAwards = awards.length > 0;
  const hasLinks = activeLinks.length > 0;

  if (!hasOst && !hasAwards && !hasLinks) {
    return null;
  }

  const handlePlayOstTrack = (track: DossierOstTrack, idx: number) => {
    const trackId = track.id || `ost-${track.title.toLowerCase().replace(/\s+/g, "-")}-${idx}`;
    const isCurrent = activeTrack?.id === trackId || (activeTrack?.title === track.title && activeTrack?.artist === track.artist);

    if (isCurrent) {
      togglePlay();
      return;
    }

    const song = {
      id: trackId,
      title: track.title,
      artist: track.artist,
      album: track.type || "Original Soundtrack",
      duration: track.duration || "3:30",
      imageUrl: track.albumArt || undefined,
      audioUrl: track.url || track.previewUrl || undefined,
      youtubeId: (track as any).youtubeId || (track.youtubeUrl ? track.youtubeUrl.split("v=")[1]?.split("&")[0] : undefined),
      category: "Drama OST",
      playCount: 1,
      isFavorite: false,
    };

    playTrack(song);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Soundtracks (OST) */}
      {hasOst && (
        <div
          className="p-6 rounded-2xl border overflow-hidden flex flex-col justify-between"
          style={{
            backgroundColor: isCyber ? "rgba(10,15,44,0.75)" : "#FFFFFF",
            borderColor: isCyber ? `${themeConfig.primaryAccent}30` : "#000000",
            boxShadow: isCyber ? `0 0 20px ${themeConfig.glowColor}` : "4px 4px 0px #000000",
          }}
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Music size={18} style={{ color: themeConfig.primaryAccent }} />
              <h3 className="font-black text-sm uppercase tracking-wider">Original Soundtracks (OST)</h3>
            </div>

            <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
              {ostTracks.map((track, idx) => {
                const trackId = track.id || `ost-${track.title.toLowerCase().replace(/\s+/g, "-")}-${idx}`;
                const isCurrent = activeTrack?.id === trackId || (activeTrack?.title === track.title && activeTrack?.artist === track.artist);
                const isThisPlaying = isCurrent && isPlaying;

                return (
                  <div
                    key={trackId}
                    onClick={() => handlePlayOstTrack(track, idx)}
                    className="p-2.5 rounded-xl border flex items-center justify-between group transition-all hover:scale-[1.02] cursor-pointer select-none"
                    style={{
                      backgroundColor: isThisPlaying
                        ? isCyber ? "rgba(0, 245, 255, 0.15)" : "#E0F2FE"
                        : isCyber ? "rgba(5,8,22,0.6)" : "#FFF5E4",
                      borderColor: isThisPlaying
                        ? themeConfig.primaryAccent
                        : isCyber ? "rgba(255,255,255,0.08)" : "#000",
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      {track.albumArt ? (
                        <img src={track.albumArt} alt={track.title} className="w-9 h-9 rounded-lg object-cover shrink-0 border border-white/10" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
                          <Music size={14} style={{ color: themeConfig.primaryAccent }} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          {track.type && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border" style={{ color: themeConfig.primaryAccent, borderColor: themeConfig.primaryAccent }}>
                              {track.type}
                            </span>
                          )}
                          <p className="font-bold text-xs truncate theme-text-primary">{track.title}</p>
                        </div>
                        <p className="text-[10px] font-mono opacity-60 truncate mt-0.5">
                          {track.artist} {track.duration ? `• ${track.duration}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isThisPlaying ? (
                        <PauseCircle size={18} className="text-cyan-400 animate-pulse" />
                      ) : (
                        <PlayCircle size={18} className="opacity-70 group-hover:opacity-100" style={{ color: themeConfig.primaryAccent }} />
                      )}

                      {/* Optional external streaming link */}
                      {(track.spotifyUrl || track.youtubeUrl) && (
                        <a
                          href={track.spotifyUrl || track.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="opacity-40 hover:opacity-100 transition-opacity p-1 text-xs"
                          title="Open on External Service"
                        >
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Awards & Recognition */}
      {hasAwards && (
        <div
          className="p-6 rounded-2xl border overflow-hidden flex flex-col justify-between"
          style={{
            backgroundColor: isCyber ? "rgba(10,15,44,0.75)" : "#FFFFFF",
            borderColor: isCyber ? `${themeConfig.primaryAccent}30` : "#000000",
            boxShadow: isCyber ? `0 0 20px ${themeConfig.glowColor}` : "4px 4px 0px #000000",
          }}
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Award size={18} style={{ color: "#F59E0B" }} />
              <h3 className="font-black text-sm uppercase tracking-wider">Awards & Honors</h3>
            </div>

            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
              {awards.map((award, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl border text-xs font-semibold leading-relaxed"
                  style={{
                    backgroundColor: isCyber ? "rgba(5,8,22,0.6)" : "#FFF5E4",
                    borderColor: isCyber ? "rgba(255,255,255,0.08)" : "#000",
                  }}
                >
                  {award}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* External Resources & Quick Links */}
      {hasLinks && (
        <div
          className="p-6 rounded-2xl border overflow-hidden flex flex-col justify-between"
          style={{
            backgroundColor: isCyber ? "rgba(10,15,44,0.75)" : "#FFFFFF",
            borderColor: isCyber ? `${themeConfig.primaryAccent}30` : "#000000",
            boxShadow: isCyber ? `0 0 20px ${themeConfig.glowColor}` : "4px 4px 0px #000000",
          }}
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ExternalLink size={18} style={{ color: themeConfig.primaryAccent }} />
              <h3 className="font-black text-sm uppercase tracking-wider">External Resources</h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {activeLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold transition-transform hover:scale-[1.02]"
                  style={{
                    backgroundColor: isCyber ? "rgba(5,8,22,0.6)" : "#FFF5E4",
                    borderColor: isCyber ? "rgba(255,255,255,0.08)" : "#000",
                  }}
                >
                  <span className="truncate">{link.name}</span>
                  <ExternalLink size={12} className="opacity-60 shrink-0 ml-1" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
