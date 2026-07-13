"use client";

import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";

export function AnimeBarChart() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const animeList = useDashboardStore((s) => s.animeList);

  const data = animeList.map((a) => ({
    name: a.title.split(":")[0].split(" ").slice(0, 2).join(" "),
    watched: a.episodesWatched,
    total: a.totalEpisodes,
    pct: Math.round((a.episodesWatched / a.totalEpisodes) * 100),
  }));

  const accentColor  = isCyber ? "#00F5FF" : "#FF6B35";
  const accentColor2 = isCyber ? "#BF5FFF" : "#FFD166";
  const gridColor    = isCyber ? "rgba(0,245,255,0.1)" : "rgba(0,0,0,0.08)";
  const textColor    = isCyber ? "#94A3B8" : "#6B7280";

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: textColor, fontSize: 9, fontWeight: 600 }}
          angle={-35}
          textAnchor="end"
          interval={0}
          tickLine={false}
        />
        <YAxis tick={{ fill: textColor, fontSize: 9 }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: isCyber ? "rgba(5,8,22,0.95)" : "#fff",
            border: isCyber ? "1px solid rgba(0,245,255,0.3)" : "2px solid #000",
            borderRadius: isCyber ? "8px" : "4px",
            color: isCyber ? "#E0E8FF" : "#1A1A1A",
            fontSize: "12px",
            fontWeight: 700,
            boxShadow: isCyber ? "0 0 20px rgba(0,245,255,0.2)" : "4px 4px 0 rgba(0,0,0,1)",
          }}
          formatter={(v: any, name: any) => [v + " eps", name === "watched" ? "Watched" : "Total"]}
        />
        <Bar dataKey="total" fill={isCyber ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} radius={[3, 3, 0, 0]} />
        <Bar dataKey="watched" radius={[3, 3, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={entry.pct === 100 ? (isCyber ? "#39FF14" : "#06D6A0") : index % 2 === 0 ? accentColor : accentColor2}
              style={isCyber ? { filter: `drop-shadow(0 0 4px ${index % 2 === 0 ? accentColor : accentColor2})` } : {}}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
