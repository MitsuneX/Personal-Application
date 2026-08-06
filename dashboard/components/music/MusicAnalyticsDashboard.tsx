"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import type { SongEntry } from "@/lib/store/dashboardStore";
import { computeMusicAchievements } from "@/lib/utils/musicProgression";

interface MusicAnalyticsDashboardProps {
  isCyber: boolean;
}

interface ArtistStat {
  name: string;
  count: number;
  totalPlays: number;
}

interface CategoryStat {
  name: string;
  count: number;
}

export function MusicAnalyticsDashboard({ isCyber }: MusicAnalyticsDashboardProps) {
  const { songs, recentlyPlayed } = useDashboardStore();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch server analytics
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/music/analytics", { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) setAnalyticsData(d);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, []);

  // Client-side derived stats
  const topArtists = useMemo<ArtistStat[]>(() => {
    const map = new Map<string, ArtistStat>();
    for (const s of songs) {
      const artist = s.artist || "Unknown";
      const existing = map.get(artist) || { name: artist, count: 0, totalPlays: 0 };
      map.set(artist, {
        ...existing,
        count: existing.count + 1,
        totalPlays: existing.totalPlays + (s.playCount || 0),
      });
    }
    return Array.from(map.values()).sort((a, b) => b.totalPlays - a.totalPlays || b.count - a.count).slice(0, 5);
  }, [songs]);

  const topCategories = useMemo<CategoryStat[]>(() => {
    const map = new Map<string, number>();
    for (const s of songs) {
      const cat = s.category || "Uncategorized";
      map.set(cat, (map.get(cat) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [songs]);

  const mostPlayed = useMemo<SongEntry[]>(
    () =>
      [...songs]
        .filter((s) => (s.playCount || 0) > 0)
        .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
        .slice(0, 5),
    [songs]
  );

  const favoriteSongs = useMemo<SongEntry[]>(
    () => songs.filter((s) => s.isFavorite).slice(0, 5),
    [songs]
  );

  const totalPlays = songs.reduce((acc, s) => acc + (s.playCount || 0), 0);
  const uniqueArtists = new Set(songs.map((s) => s.artist || "Unknown")).size;
  const cachedCount = songs.filter((s) => s.audioUrl).length;

  const accent = isCyber ? "#00F5FF" : "#FF6B35";
  const cardBg = isCyber ? "rgba(10,15,44,0.5)" : "#FFFFFF";
  const border = isCyber ? "rgba(0,245,255,0.15)" : "#000000";
  const textPrimary = isCyber ? "#E0FFFF" : "#000";
  const textMuted = isCyber ? "#94A3B8" : "#555";
  const purple = isCyber ? "#BF5FFF" : "#6B21A8";
  const green = isCyber ? "#10B981" : "#16A34A";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-xs font-bold animate-pulse" style={{ color: textMuted }}>
          Loading analytics…
        </p>
      </div>
    );
  }

  const StatCard = ({
    label,
    value,
    icon,
    color,
  }: {
    label: string;
    value: string | number;
    icon: string;
    color: string;
  }) => (
    <div
      className="rounded-xl border p-4 flex flex-col gap-1"
      style={{ backgroundColor: cardBg, borderColor: border }}
    >
      <span className="text-lg">{icon}</span>
      <p className="text-xl font-black" style={{ color }}>
        {value}
      </p>
      <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: textMuted }}>
        {label}
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Tracks" value={songs.length} icon="🎵" color={accent} />
        <StatCard label="Total Plays" value={analyticsData?.totalPlays ?? totalPlays} icon="▶️" color={purple} />
        <StatCard label="Unique Artists" value={uniqueArtists} icon="🎤" color={green} />
        <StatCard label="Audio Files" value={cachedCount} icon="💿" color={isCyber ? "#F59E0B" : "#D97706"} />
      </div>

      {/* Streak & Play streak */}
      {(analyticsData?.currentStreak != null || analyticsData?.longestStreak != null) && (
        <div
          className="rounded-xl border p-4 flex items-center gap-6"
          style={{ backgroundColor: cardBg, borderColor: border }}
        >
          <div className="text-center">
            <p className="text-2xl font-black" style={{ color: accent }}>
              🔥 {analyticsData.currentStreak ?? 0}
            </p>
            <p className="text-[10px] uppercase font-semibold opacity-60">Day Streak</p>
          </div>
          <div className="w-px h-10 opacity-20" style={{ backgroundColor: textPrimary }} />
          <div className="text-center">
            <p className="text-2xl font-black" style={{ color: purple }}>
              ⚡ {analyticsData.longestStreak ?? 0}
            </p>
            <p className="text-[10px] uppercase font-semibold opacity-60">Longest Streak</p>
          </div>
          <div className="flex-1" />
          <div className="text-right hidden sm:block">
            <p className="text-[10px] opacity-50" style={{ color: textMuted }}>
              Total listening sessions
            </p>
            <p className="text-sm font-black" style={{ color: textPrimary }}>
              {analyticsData.totalSessions ?? "—"}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Artists */}
        <div
          className="rounded-xl border p-4 space-y-2"
          style={{ backgroundColor: cardBg, borderColor: border }}
        >
          <h4 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: textMuted }}>
            🎤 Top Artists
          </h4>
          {topArtists.length === 0 ? (
            <p className="text-xs opacity-50">No plays recorded yet.</p>
          ) : (
            topArtists.map((a, idx) => (
              <div key={a.name} className="flex items-center gap-2">
                <span className="text-[10px] font-black w-5 text-center opacity-50">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate" style={{ color: textPrimary }}>
                    {a.name}
                  </p>
                  <div
                    className="h-1 rounded-full mt-0.5 transition-all"
                    style={{
                      width: `${Math.min(100, (a.count / songs.length) * 100)}%`,
                      backgroundColor: accent,
                      opacity: 0.7,
                    }}
                  />
                </div>
                <span className="text-[10px] font-semibold shrink-0" style={{ color: textMuted }}>
                  {a.count} tracks · {a.totalPlays} plays
                </span>
              </div>
            ))
          )}
        </div>

        {/* Most Played */}
        <div
          className="rounded-xl border p-4 space-y-2"
          style={{ backgroundColor: cardBg, borderColor: border }}
        >
          <h4 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: textMuted }}>
            🔥 Most Played
          </h4>
          {mostPlayed.length === 0 ? (
            <p className="text-xs opacity-50">No plays recorded yet. Keep listening!</p>
          ) : (
            mostPlayed.map((s, idx) => (
              <div key={s.id} className="flex items-center gap-2">
                <span className="text-[10px] font-black w-5 text-center opacity-50">{idx + 1}</span>
                <div
                  className="w-6 h-6 rounded-md overflow-hidden shrink-0 bg-slate-700"
                  style={{ border: `1px solid ${border}` }}
                >
                  {s.imageUrl ? (
                    <img src={s.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px]">🎵</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate" style={{ color: textPrimary }}>
                    {s.title}
                  </p>
                  <p className="text-[9px] opacity-60 truncate" style={{ color: textMuted }}>
                    {s.artist}
                  </p>
                </div>
                <span
                  className="text-xs font-black shrink-0 px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: isCyber ? "rgba(0,245,255,0.1)" : "#FFF3E0",
                    color: accent,
                  }}
                >
                  {s.playCount}×
                </span>
              </div>
            ))
          )}
        </div>

        {/* Category Breakdown */}
        <div
          className="rounded-xl border p-4 space-y-2"
          style={{ backgroundColor: cardBg, borderColor: border }}
        >
          <h4 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: textMuted }}>
            📊 Category Breakdown
          </h4>
          {topCategories.length === 0 ? (
            <p className="text-xs opacity-50">No categories yet.</p>
          ) : (
            topCategories.map((c) => (
              <div key={c.name} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-[10px] mb-0.5">
                    <span className="font-bold truncate" style={{ color: textPrimary }}>
                      {c.name}
                    </span>
                    <span className="opacity-60 shrink-0 ml-2" style={{ color: textMuted }}>
                      {c.count}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: isCyber ? "rgba(255,255,255,0.07)" : "#E5E7EB" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (c.count / songs.length) * 100)}%` }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: purple }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Favorites */}
        <div
          className="rounded-xl border p-4 space-y-2"
          style={{ backgroundColor: cardBg, borderColor: border }}
        >
          <h4 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: textMuted }}>
            ❤️ Favorites
          </h4>
          {favoriteSongs.length === 0 ? (
            <p className="text-xs opacity-50">No favorites yet. ❤️ a track to add it here.</p>
          ) : (
            favoriteSongs.map((s) => (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-md overflow-hidden shrink-0 bg-slate-700"
                  style={{ border: `1px solid ${border}` }}
                >
                  {s.imageUrl ? (
                    <img src={s.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px]">🎵</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate" style={{ color: textPrimary }}>
                    {s.title}
                  </p>
                  <p className="text-[9px] opacity-60 truncate" style={{ color: textMuted }}>
                    {s.artist}
                  </p>
                </div>
                <span className="text-xs">❤️</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <div
          className="rounded-xl border p-4"
          style={{ backgroundColor: cardBg, borderColor: border }}
        >
          <h4 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: textMuted }}>
            🕐 Recently Played
          </h4>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {recentlyPlayed.slice(0, 10).map((s) => (
              <div key={s.id} className="shrink-0 w-16 text-center">
                <div
                  className="w-16 h-16 rounded-xl overflow-hidden bg-slate-700 flex items-center justify-center mb-1"
                  style={{ border: `1px solid ${border}` }}
                >
                  {s.imageUrl ? (
                    <img src={s.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg">🎵</span>
                  )}
                </div>
                <p className="text-[9px] font-bold truncate" style={{ color: textPrimary }}>
                  {s.title}
                </p>
                <p className="text-[8px] opacity-50 truncate" style={{ color: textMuted }}>
                  {s.artist}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements Grid */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-black uppercase tracking-widest" style={{ color: textMuted }}>
          🏆 Music Vault Achievements
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {computeMusicAchievements(
            songs.length,
            useDashboardStore.getState().playlists.length,
            songs.filter((s) => s.audioUrl).length,
            totalPlays,
            songs.filter((s) => s.lyrics).length
          ).map((ach) => (
            <div
              key={ach.id}
              className={`rounded-xl border p-3 flex flex-col gap-1 transition-all ${
                ach.unlocked ? "opacity-100" : "opacity-40"
              }`}
              style={{
                backgroundColor: cardBg,
                borderColor: ach.unlocked ? accent : border,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">{ach.icon}</span>
                <span
                  className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: ach.unlocked ? (isCyber ? "rgba(0,245,255,0.2)" : "#DCFCE7") : "rgba(255,255,255,0.1)",
                    color: ach.unlocked ? (isCyber ? "#00F5FF" : "#16A34A") : textMuted,
                  }}
                >
                  {ach.unlocked ? "UNLOCKED ✓" : `${ach.progress}/${ach.maxProgress}`}
                </span>
              </div>
              <p className="text-xs font-black truncate" style={{ color: textPrimary }}>
                {ach.title}
              </p>
              <p className="text-[9px] opacity-70 line-clamp-2" style={{ color: textMuted }}>
                {ach.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
