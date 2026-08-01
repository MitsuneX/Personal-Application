"use client";

import React from "react";
import { HallAnalyticsSummary } from "@/lib/utils/hofEngine";
import { useContextMenu } from "@/hooks/useContextMenu";

interface HofAnalyticsDashboardProps {
  analytics: HallAnalyticsSummary;
  isCyber: boolean;
}

export function HofAnalyticsDashboard({ analytics, isCyber }: HofAnalyticsDashboardProps) {
  const { openContextMenu } = useContextMenu();

  const handleWidgetContextMenu = (e: React.MouseEvent, widgetName: string) => {
    e.preventDefault();
    openContextMenu(
      e,
      [
        {
          id: "widget-refresh",
          label: `Refresh Analytics Widget: ${widgetName}`,
          icon: "📊",
          onClick: () => {},
        },
        {
          id: "widget-[#1]",
          label: "Export Chart Data",
          icon: "💾",
          onClick: () => {},
        },
      ],
      widgetName
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0" }}>
        <div className="flex items-center gap-2">
          <span className="text-xl">📊</span>
          <h3 className="text-base font-black theme-text-primary tracking-tight font-mono">
            Hall Museum Visual Analytics Dashboard
          </h3>
        </div>
        <span className="text-xs font-mono theme-text-muted font-bold">Realtime Museum Metrics</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono">
        {/* 1. Legend Distribution (Category Breakdown) */}
        <div
          onContextMenu={(e) => handleWidgetContextMenu(e, "Category Distribution")}
          className="p-6 rounded-3xl border space-y-4 cursor-pointer"
          style={{
            backgroundColor: isCyber ? "rgba(10,15,36,0.6)" : "#FFFFFF",
            borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000000",
            borderWidth: isCyber ? "1px" : "2px",
            boxShadow: isCyber ? "0 0 20px rgba(0,245,255,0.05)" : "4px 4px 0 #000000",
          }}
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider theme-text-primary">
              🎬 Category Distribution
            </h4>
            <span className="text-xs font-bold text-cyan-400">Roster Mix</span>
          </div>

          <div className="space-y-3">
            {analytics.categoryDistribution.map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="uppercase">{item.category}</span>
                  <span>
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-black/10 overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor:
                        item.category === "actress"
                          ? "#EC4899"
                          : item.category === "actor"
                          ? "#3B82F6"
                          : item.category === "anime"
                          ? "#FFD700"
                          : item.category === "singer"
                          ? "#A855F7"
                          : "#10B981",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Country Distribution (Bar Chart) */}
        <div
          onContextMenu={(e) => handleWidgetContextMenu(e, "Country Distribution")}
          className="p-6 rounded-3xl border space-y-4 cursor-pointer"
          style={{
            backgroundColor: isCyber ? "rgba(10,15,36,0.6)" : "#FFFFFF",
            borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000000",
            borderWidth: isCyber ? "1px" : "2px",
            boxShadow: isCyber ? "0 0 20px rgba(0,245,255,0.05)" : "4px 4px 0 #000000",
          }}
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider theme-text-primary">
              🌍 Country Heritage
            </h4>
            <span className="text-xs font-bold text-amber-400">Global Roster</span>
          </div>

          <div className="space-y-3">
            {analytics.countryDistribution.map((item) => (
              <div key={item.country} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span>{item.country}</span>
                  <span>
                    {item.count} Legends
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-black/10 overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-cyan-400 transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Votes by Season (Line Chart Representation) */}
        <div
          onContextMenu={(e) => handleWidgetContextMenu(e, "Votes by Season")}
          className="p-6 rounded-3xl border space-y-4 cursor-pointer md:col-span-2 lg:col-span-1"
          style={{
            backgroundColor: isCyber ? "rgba(10,15,36,0.6)" : "#FFFFFF",
            borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000000",
            borderWidth: isCyber ? "1px" : "2px",
            boxShadow: isCyber ? "0 0 20px rgba(0,245,255,0.05)" : "4px 4px 0 #000000",
          }}
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider theme-text-primary">
              📈 Votes Growth by Season
            </h4>
            <span className="text-xs font-bold text-emerald-400">Season Trend</span>
          </div>

          <div className="h-40 flex items-end justify-between gap-2 pt-4 px-2 border-b pb-2" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0" }}>
            {analytics.votesBySeason.map((season) => {
              const maxVotes = 1500;
              const heightPct = Math.min(100, Math.max(15, Math.round((season.votes / maxVotes) * 100)));
              return (
                <div key={season.season} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold theme-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                    {season.votes}
                  </span>
                  <div
                    className="w-full rounded-t-xl bg-gradient-to-t from-amber-500 to-yellow-300 transition-all duration-500 group-hover:brightness-125"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[10px] font-bold theme-text-muted">{season.season}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
