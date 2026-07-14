"use client";

import React from "react";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

interface CategoryRing {
  name: string;
  value: number; // 0–100
  fill: string;
  glowColor: string;
}

interface HobbyRadialChartProps {
  data: CategoryRing[];
  isCyber: boolean;
  size?: number;
}

export function HobbyRadialChart({ data, isCyber, size = 220 }: HobbyRadialChartProps) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="28%"
          outerRadius="95%"
          barSize={isCyber ? 12 : 14}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          {data.map((entry, index) => (
            <RadialBar
              key={entry.name}
              dataKey="value"
              cornerRadius={isCyber ? 6 : 0}
              background={{ fill: isCyber ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.08)" }}
              style={{
                filter: isCyber ? `drop-shadow(0 0 6px ${entry.glowColor})` : "none",
                stroke: isCyber ? "none" : "#000",
                strokeWidth: isCyber ? 0 : 1.5,
              }}
            />
          ))}
        </RadialBarChart>
      </ResponsiveContainer>

      {/* Center label */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        style={{ fontFamily: isCyber ? "var(--font-orbitron, monospace)" : "inherit" }}
      >
        <span
          className="text-[10px] font-black uppercase tracking-widest"
          style={{ color: isCyber ? "#00F5FF" : "#000" }}
        >
          {isCyber ? "SKILLS" : "Progress"}
        </span>
        <span
          className="text-lg font-black"
          style={{ color: isCyber ? "#fff" : "#1A1A1A" }}
        >
          {data.length > 0
            ? `${Math.round(data.reduce((s, d) => s + d.value, 0) / data.length)}%`
            : "0%"}
        </span>
      </div>
    </div>
  );
}
