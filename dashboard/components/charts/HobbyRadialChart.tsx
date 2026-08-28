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
  const ringCount = Math.max(1, data.length);
  const innerRadius = ringCount <= 3 ? "28%" : ringCount <= 5 ? "20%" : "14%";
  const barSize = ringCount <= 3 ? (isCyber ? 12 : 14) : ringCount <= 5 ? (isCyber ? 9 : 11) : (isCyber ? 6 : 8);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius="95%"
          barSize={barSize}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          {data.map((entry) => (
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
            ? (() => {
                const avg = data.reduce((s, d) => s + (isFinite(d.value) ? d.value : 0), 0) / data.length;
                return `${Math.round(isFinite(avg) ? avg : 0)}%`;
              })()
            : "0%"}
        </span>
      </div>
    </div>
  );
}
