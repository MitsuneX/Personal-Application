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
  const fillColor   = isCyber ? "rgba(0,245,255,0.08)" : "rgba(255,107,53,0.1)";
  const gridColor   = isCyber ? "rgba(0,245,255,0.12)" : "rgba(0,0,0,0.08)";
  const textColor   = isCyber ? "#94A3B8" : "#4B5563";

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data} margin={{ top: 15, right: 15, bottom: 15, left: 15 }}>
        <PolarGrid stroke={gridColor} gridType="circle" />
        <PolarAngleAxis
          dataKey="genre"
          tick={{
            fill: textColor,
            fontSize: 9,
            fontWeight: 800,
            fontFamily: isCyber ? "var(--font-jetbrains-mono)" : "inherit",
            letterSpacing: "0.02em"
          }}
        />
        <Radar
          name="Activity"
          dataKey="value"
          stroke={accentColor}
          fill={fillColor}
          strokeWidth={isCyber ? 1.5 : 2}
          dot={{ fill: accentColor, r: 2.5, strokeWidth: 1 }}
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
          formatter={(v: any) => [`${v}%`, "Activity"]}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
