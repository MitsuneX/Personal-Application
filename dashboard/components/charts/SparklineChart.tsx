"use client";

import React from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

interface SparklineChartProps {
  data: { progress: number }[];
  color: string;
  isCyber: boolean;
}

export function SparklineChart({ data, color, isCyber }: SparklineChartProps) {
  const gradientId = `spark-${color.replace(/[^a-z0-9]/gi, "")}`;
  const chartData = data.length > 1 ? data : [{ progress: 0 }, { progress: 0 }];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={isCyber ? 0.6 : 0.5} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="progress"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#${gradientId})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
