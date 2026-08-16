"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTheme } from "@/lib/theme";
import { ThemeAccentConfig, DossierAmbientParticles } from "./DossierThemeAccent";
import { Star, Heart, ArrowLeft, Clock, Film, Globe, Tv, Calendar } from "lucide-react";

export interface DossierHeroProps {
  title: string;
  originalTitle?: string;
  posterUrl?: string;
  backdropUrl?: string;
  year?: number;
  country?: string;
  studio?: string;
  genres?: string[];
  runtime?: string;
  episodes?: number;
  episodesWatched?: number;
  status?: string;
  rating?: number;
  isFavorite?: boolean;
  themeConfig: ThemeAccentConfig;
  onToggleFavorite?: () => void;
  onBack?: () => void;
}

export function DossierHero({
  title,
  originalTitle,
  posterUrl,
  backdropUrl,
  year,
  country,
  studio,
  genres = [],
  runtime,
  episodes,
  episodesWatched,
  status = "Watching",
  rating = 8,
  isFavorite = false,
  themeConfig,
  onToggleFavorite,
  onBack,
}: DossierHeroProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const hasPoster = Boolean(posterUrl);
  const hasBackdrop = Boolean(backdropUrl || posterUrl);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl mb-8">
      {/* Parallax / Ambient Backdrop Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {hasBackdrop ? (
          <img
            src={backdropUrl || posterUrl}
            alt={title}
            className="w-full h-full object-cover object-center filter blur-md scale-105 opacity-35 transition-all duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 opacity-60" />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: isCyber
              ? `linear-gradient(180deg, rgba(5,8,22,0.4) 0%, rgba(5,8,22,0.85) 60%, rgba(5,8,22,1) 100%)`
              : `linear-gradient(180deg, rgba(255,245,228,0.3) 0%, rgba(255,245,228,0.85) 60%, rgba(255,245,228,1) 100%)`,
          }}
        />
        <DossierAmbientParticles config={themeConfig} />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 p-6 md:p-10 flex flex-col gap-6">
        {/* Top Navigation & Breadcrumbs */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase opacity-80">
            <Link href="/dashboard" className="hover:underline opacity-60">
              Dashboard
            </Link>
            <span>&gt;</span>
            <Link href={`/drama/${country || ""}`} className="hover:underline opacity-60">
              {(country || "Media").toUpperCase()}
            </Link>
            <span>&gt;</span>
            <span style={{ color: themeConfig.primaryAccent }}>{title}</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono border cursor-pointer backdrop-blur-md"
            style={{
              backgroundColor: isCyber ? "rgba(0,245,255,0.08)" : "#FFF",
              borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000",
              boxShadow: isCyber ? `0 0 15px ${themeConfig.glowColor}` : "2.5px 2.5px 0 #000",
              color: isCyber ? "#E0E8FF" : "#000",
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to Library</span>
          </motion.button>
        </div>

        {/* Main Hero Header Info */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-end mt-4">
          {/* Shared Poster Element */}
          <motion.div
            layoutId={`poster-${title}`}
            className="relative shrink-0 w-44 md:w-56 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border-2 group"
            style={{
              borderColor: isCyber ? themeConfig.primaryAccent : "#000000",
              boxShadow: isCyber
                ? `0 0 35px ${themeConfig.glowColor}, 0 20px 40px rgba(0,0,0,0.8)`
                : "6px 6px 0px #000000",
            }}
          >
            {hasPoster ? (
              <img
                src={posterUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-800 text-slate-400">
                <Film size={48} className="mb-2 opacity-50" />
                <span className="text-xs font-mono font-bold text-center line-clamp-2">{title}</span>
              </div>
            )}
            {/* Status Badge */}
            <div
              className="absolute top-2 left-2 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider backdrop-blur-md border shadow-lg"
              style={{
                backgroundColor: isCyber ? "rgba(5,8,22,0.85)" : "#000",
                borderColor: themeConfig.primaryAccent,
                color: themeConfig.primaryAccent,
              }}
            >
              {status}
            </div>

            {/* Favorite Toggle Button */}
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={onToggleFavorite}
              className="absolute top-2 right-2 p-2 rounded-full backdrop-blur-md border cursor-pointer shadow-lg"
              style={{
                backgroundColor: isFavorite ? "rgba(239,68,68,0.9)" : "rgba(0,0,0,0.6)",
                borderColor: isFavorite ? "#EF4444" : "rgba(255,255,255,0.3)",
                color: "#FFF",
              }}
            >
              <Heart size={16} fill={isFavorite ? "#FFF" : "none"} />
            </motion.button>
          </motion.div>

          {/* Title & Metadata Details */}
          <div className="flex-1 min-w-0 flex flex-col gap-3">
            {/* Original Title Tag */}
            {originalTitle && (
              <p
                className="text-xs font-mono font-bold tracking-widest uppercase opacity-75"
                style={{ color: themeConfig.primaryAccent }}
              >
                {originalTitle}
              </p>
            )}

            {/* Main Title */}
            <h1
              className="text-3xl md:text-5xl font-black leading-tight tracking-tight"
              style={{
                color: isCyber ? "#E0E8FF" : "#1A1A1A",
                fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
              }}
            >
              {title}
            </h1>

            {/* Sub Meta Info Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-semibold opacity-90 my-1">
              {year && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/10 dark:bg-white/10 border border-white/10">
                  <Calendar size={12} />
                  <span>{year}</span>
                </span>
              )}
              {country && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/10 dark:bg-white/10 border border-white/10 uppercase">
                  <Globe size={12} />
                  <span>{country}</span>
                </span>
              )}
              {studio && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/10 dark:bg-white/10 border border-white/10">
                  <Film size={12} />
                  <span>{studio}</span>
                </span>
              )}
              {runtime && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/10 dark:bg-white/10 border border-white/10">
                  <Clock size={12} />
                  <span>{runtime}</span>
                </span>
              )}
              {episodes && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/10 dark:bg-white/10 border border-white/10">
                  <Tv size={12} />
                  <span>{episodesWatched ?? 0} / {episodes} Episodes</span>
                </span>
              )}
              <span
                className="flex items-center gap-1 px-2.5 py-1 rounded-md font-black border"
                style={{
                  backgroundColor: `${themeConfig.primaryAccent}20`,
                  borderColor: themeConfig.primaryAccent,
                  color: themeConfig.primaryAccent,
                }}
              >
                <Star size={12} fill="currentColor" />
                <span>{rating} / 10</span>
              </span>
            </div>

            {/* Genre Badges */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {genres.map((g) => (
                  <span
                    key={g}
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border"
                    style={{
                      backgroundColor: isCyber ? "rgba(0,245,255,0.06)" : "#FFF",
                      borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000",
                      color: isCyber ? "#00F5FF" : "#000",
                    }}
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
