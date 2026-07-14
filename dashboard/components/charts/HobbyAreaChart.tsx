"use client";

import React from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";

interface ChartPoint {
  day: string;
  progress: number;
}

interface HobbyAreaChartProps {
  data: ChartPoint[];
  isCyber: boolean;
  color: string;
  height?: number;
}

const CustomTooltip = ({ active, payload, isCyber }: any) => {
  if (active && payload?.length) {
    return (
      <div
        className="px-2 py-1 rounded text-[10px] font-black pointer-events-none"
        style={{
          background: isCyber ? "rgba(5,8,22,0.95)" : "#FFF",
          border: isCyber ? "1px solid rgba(0,245,255,0.4)" : "2px solid #000",
          color: isCyber ? "#00F5FF" : "#000",
          boxShadow: isCyber ? "0 0 10px rgba(0,245,255,0.3)" : "2px 2px 0 #000",
        }}
      >
        {payload[0].value.toFixed(3)}%
      </div>
    );
  }
  return null;
};

export function HobbyAreaChart({ data, isCyber, color, height = 60 }: HobbyAreaChartProps) {
  const gradientId = `area-grad-${color.replace("#", "").slice(0, 6)}`;

  // If no data, render an empty flat line
  const chartData = data.length > 0 ? data : [{ day: "start", progress: 0 }, { day: "now", progress: 0 }];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={isCyber ? 0.5 : 0.7} />
            <stop offset="95%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <YAxis domain={[0, "auto"]} hide />
        <Tooltip
          content={<CustomTooltip isCyber={isCyber} />}
          cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "3 3" }}
        />
        <Area
          type="monotone"
          dataKey="progress"
          stroke={color}
          strokeWidth={isCyber ? 2 : 2.5}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{
            r: 3,
            fill: color,
            stroke: isCyber ? "rgba(0,0,0,0.5)" : "#fff",
            strokeWidth: 1.5,
          }}
          style={{
            filter: isCyber ? `drop-shadow(0 0 4px ${color})` : "none",
            stroke: isCyber ? color : color,
            ...(isCyber ? {} : { paintOrder: "stroke fill" }),
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
