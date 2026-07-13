"use client";

import React from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useTheme } from "@/lib/theme";

const data = [
  { genre: "Gacha RPG", value: 90 },
  { genre: "MOBA",      value: 75 },
  { genre: "FPS",       value: 65 },
  { genre: "Action RPG",value: 80 },
  { genre: "Fighting",  value: 55 },
  { genre: "Gacha Act.", value: 70 },
];

export function GameRadarChart() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const accentColor = isCyber ? "#00F5FF" : "#FF6B35";
  const fillColor   = isCyber ? "rgba(0,245,255,0.15)" : "rgba(255,107,53,0.18)";
  const gridColor   = isCyber ? "rgba(0,245,255,0.15)" : "rgba(0,0,0,0.12)";
  const textColor   = isCyber ? "#94A3B8" : "#6B7280";

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
        <PolarGrid stroke={gridColor} />
        <PolarAngleAxis
          dataKey="genre"
          tick={{ fill: textColor, fontSize: 10, fontWeight: 600 }}
        />
        <Radar
          name="Activity"
          dataKey="value"
          stroke={accentColor}
          fill={fillColor}
          strokeWidth={isCyber ? 1.5 : 2}
          dot={{ fill: accentColor, r: 3 }}
        />
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
          formatter={(v: any) => [`${v}%`, "Activity"]}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
