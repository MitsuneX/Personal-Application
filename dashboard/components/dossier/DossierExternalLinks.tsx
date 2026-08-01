"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { ThemeAccentConfig } from "./DossierThemeAccent";
import { ExternalLinks, DossierOstTrack } from "@/lib/store/dashboardStore";
import { ExternalLink, Music, Award, Film, Tv, Globe, PlayCircle } from "lucide-react";

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
  studio = "Studio Dragon / Disney+",
  country = "korean",
  themeConfig,
}: DossierExternalLinksProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const defaultOst: DossierOstTrack[] = ostTracks.length > 0 ? ostTracks : [
    { title: "Moving (Main Theme)", artist: "Dalpalan", type: "OST", url: "https://youtube.com" },
    { title: "Together", artist: "Jannabi", type: "OP", url: "https://youtube.com" },
    { title: "Just Like That", artist: "Car, the Garden", type: "ED", url: "https://youtube.com" },
  ];

  const defaultAwards = awards.length > 0 ? awards : [
    "🏆 Baeksang Arts Awards 2024 — Grand Prize (Daesang)",
    "🏆 Baeksang Arts Awards 2024 — Best Screenplay",
    "🏆 Blue Dragon Series Awards 2024 — Best Drama",
    "🏆 Asia Contents Awards 2023 — Best Creative",
  ];

  const links = [
    { name: "IMDb", url: externalLinks.imdb || "https://imdb.com", color: "#F5C518" },
    { name: "MyDramaList", url: externalLinks.mydramalist || "https://mydramalist.com", color: "#3B82F6" },
    { name: "Wikipedia", url: externalLinks.wikipedia || "https://wikipedia.org", color: "#9CA3AF" },
    { name: "Disney+", url: externalLinks.disney || "https://disneyplus.com", color: "#06B6D4" },
    { name: "Netflix", url: externalLinks.netflix || "https://netflix.com", color: "#EF4444" },
    { name: "YouTube Trailer", url: externalLinks.trailerUrl || "https://youtube.com", color: "#FF0000" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Soundtracks (OST) */}
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

          <div className="flex flex-col gap-2.5">
            {defaultOst.map((track, idx) => (
              <a
                key={idx}
                href={track.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl border flex items-center justify-between group transition-transform hover:scale-[1.02]"
                style={{
                  backgroundColor: isCyber ? "rgba(5,8,22,0.6)" : "#FFF5E4",
                  borderColor: isCyber ? "rgba(255,255,255,0.08)" : "#000",
                }}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border" style={{ color: themeConfig.primaryAccent, borderColor: themeConfig.primaryAccent }}>
                      {track.type}
                    </span>
                    <p className="font-bold text-xs truncate">{track.title}</p>
                  </div>
                  <p className="text-[10px] font-mono opacity-60 truncate mt-0.5">{track.artist}</p>
                </div>
                <PlayCircle size={16} className="opacity-70 group-hover:opacity-100 shrink-0" style={{ color: themeConfig.primaryAccent }} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Awards & Recognition */}
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

          <div className="flex flex-col gap-2">
            {defaultAwards.map((award, idx) => (
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

      {/* External Resources & Quick Links */}
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
            {links.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl border flex items-center justify-between font-mono font-bold text-xs transition-transform hover:scale-105"
                style={{
                  backgroundColor: isCyber ? `${link.color}15` : "#FFF",
                  borderColor: isCyber ? `${link.color}40` : "#000",
                  color: isCyber ? link.color : "#000",
                  boxShadow: isCyber ? "none" : "2px 2px 0 #000",
                }}
              >
                <span>{link.name}</span>
                <ExternalLink size={12} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
