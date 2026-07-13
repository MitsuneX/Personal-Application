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
  const gridColor    = isCyber ? "rgba(0,245,255,0.06)" : "rgba(0,0,0,0.05)";
  const textColor    = isCyber ? "#94A3B8" : "#4B5563";

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 25 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis
          dataKey="name"
          tick={{
            fill: textColor,
            fontSize: 8,
            fontWeight: 800,
            fontFamily: isCyber ? "var(--font-jetbrains-mono)" : "inherit"
          }}
          angle={-20}
          textAnchor="end"
          interval={0}
          tickLine={false}
        />
        <YAxis
          tick={{
            fill: textColor,
            fontSize: 9,
            fontFamily: isCyber ? "var(--font-jetbrains-mono)" : "inherit"
          }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isCyber ? "#0A0F2C" : "#FFFFFF",
            border: isCyber ? "1px solid rgba(0,245,255,0.3)" : "2.5px solid #000000",
            borderRadius: isCyber ? "10px" : "6px",
            color: isCyber ? "#E0E8FF" : "#1A1A1A",
            fontSize: "10px",
            fontWeight: 800,
            fontFamily: "var(--font-jetbrains-mono)",
            boxShadow: isCyber ? "0 0 20px rgba(0,245,255,0.15)" : "4px 4px 0 rgba(0,0,0,1)",
          }}
          formatter={(v: any, name: any) => [v + " eps", name === "watched" ? "Watched" : "Total"]}
        />
        <Bar dataKey="total" fill={isCyber ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)"} radius={[4, 4, 0, 0]} />
        <Bar dataKey="watched" radius={[4, 4, 0, 0]}>
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
