"use client";

import React, { useState } from "react";
import { HallAnalyticsSummary } from "@/lib/utils/hofEngine";
import { useContextMenu } from "@/hooks/useContextMenu";

interface HofAnalyticsDashboardProps {
  analytics: HallAnalyticsSummary;
  isCyber: boolean;
}

export function HofAnalyticsDashboard({ analytics, isCyber }: HofAnalyticsDashboardProps) {
  const { openContextMenu } = useContextMenu();
  const [showValidationReport, setShowValidationReport] = useState(false);

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
          id: "widget-export",
          label: "Export Chart Data",
          icon: "💾",
          onClick: () => {},
        },
      ],
      widgetName
    );
  };

  const getMediaColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "drama":
        return "#EC4899"; // Pink
      case "anime":
        return "#FFD700"; // Gold
      case "movie":
        return "#3B82F6"; // Blue
      case "game character":
        return "#00F5FF"; // Cyan
      case "tokusatsu":
        return "#10B981"; // Emerald
      default:
        return "#8B5CF6"; // Purple
    }
  };

  const getProfessionColor = (prof: string) => {
    switch (prof.toLowerCase()) {
      case "actress":
        return "#F43F5E"; // Rose
      case "actor":
        return "#2563EB"; // Royal Blue
      case "singer":
        return "#A855F7"; // Purple
      case "voice actor":
        return "#F59E0B"; // Amber
      case "character":
        return "#14B8A6"; // Teal
      default:
        return "#6366F1"; // Indigo
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-3" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0" }}>
        <div className="flex items-center gap-2">
          <span className="text-xl">📊</span>
          <h3 className="text-base font-black theme-text-primary tracking-tight font-mono">
            Hall Museum Visual Analytics Dashboard
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono theme-text-muted font-bold">Realtime Museum Metrics</span>
          {analytics.validationReport.invalidRecordCount > 0 && (
            <button
              onClick={() => setShowValidationReport(!showValidationReport)}
              className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg border transition-all hover:scale-105 cursor-pointer"
              style={{
                backgroundColor: isCyber ? "rgba(245,158,11,0.12)" : "#FEF3C7",
                borderColor: isCyber ? "#F59E0B" : "#D97706",
                color: isCyber ? "#F59E0B" : "#B45309",
              }}
            >
              🛡️ Dev Audit ({analytics.validationReport.invalidRecordCount} Invalid Excluded)
            </button>
          )}
        </div>
      </div>

      {/* Internal Developer Validation Report Drawer */}
      {showValidationReport && (
        <div
          className="p-4 rounded-2xl border space-y-3 font-mono text-xs shadow-xl animate-in fade-in slide-in-from-top-2"
          style={{
            backgroundColor: isCyber ? "rgba(20,10,30,0.95)" : "#FFFBEB",
            borderColor: isCyber ? "rgba(245,158,11,0.4)" : "#F59E0B",
            borderWidth: "2px",
          }}
        >
          <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#FDE68A" }}>
            <span className="font-black uppercase text-amber-500 flex items-center gap-2">
              🛠️ Internal Developer Validation Report (Data Hygiene)
            </span>
            <button onClick={() => setShowValidationReport(false)} className="text-xs font-bold opacity-60 hover:opacity-100">
              ✕ Close
            </button>
          </div>
          <p className="text-[11px] opacity-80 leading-relaxed">
            Public analytics are generated strictly from <strong>{analytics.validationReport.validRecordCount}</strong> valid/normalized records (out of {analytics.validationReport.totalAnalyzed} total entries).
            The following <strong>{analytics.validationReport.invalidRecordCount}</strong> invalid/uncategorized records were automatically excluded from public charts:
          </p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
            {analytics.validationReport.invalidRecords.map((rec) => (
              <div
                key={rec.id}
                className="p-2 rounded-lg flex items-center justify-between text-[11px]"
                style={{
                  backgroundColor: isCyber ? "rgba(255,255,255,0.04)" : "#FFFFFF",
                  border: isCyber ? "1px solid rgba(255,255,255,0.1)" : "1px solid #FCD34D",
                }}
              >
                <div>
                  <span className="font-bold text-amber-400">{rec.name}</span>
                  <span className="opacity-50 ml-2">(ID: {rec.id.slice(0, 8)})</span>
                </div>
                <span className="text-[10px] text-red-400 font-semibold">{rec.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid of Analytics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 font-mono">
        {/* 1. Media Category Distribution */}
        <div
          onContextMenu={(e) => handleWidgetContextMenu(e, "Media Category Distribution")}
          className="p-6 rounded-3xl border space-y-4 cursor-pointer"
          style={{
            backgroundColor: isCyber ? "rgba(10,15,36,0.6)" : "#FFFFFF",
            borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000000",
            borderWidth: isCyber ? "1px" : "2px",
            boxShadow: isCyber ? "0 0 20px rgba(0,245,255,0.05)" : "4px 4px 0 #000000",
          }}
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider theme-text-primary flex items-center gap-2">
              🎬 Media Category Distribution
            </h4>
            <span className="text-xs font-bold text-cyan-400">Media Roster Mix</span>
          </div>

          <div className="space-y-3">
            {analytics.mediaDistribution.length === 0 ? (
              <p className="text-xs opacity-50 text-center py-4">No valid media records found.</p>
            ) : (
              analytics.mediaDistribution.map((item) => (
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
                        backgroundColor: getMediaColor(item.category),
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 2. Profession Category Distribution */}
        <div
          onContextMenu={(e) => handleWidgetContextMenu(e, "Profession Category Distribution")}
          className="p-6 rounded-3xl border space-y-4 cursor-pointer"
          style={{
            backgroundColor: isCyber ? "rgba(10,15,36,0.6)" : "#FFFFFF",
            borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000000",
            borderWidth: isCyber ? "1px" : "2px",
            boxShadow: isCyber ? "0 0 20px rgba(0,245,255,0.05)" : "4px 4px 0 #000000",
          }}
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider theme-text-primary flex items-center gap-2">
              🎭 Profession Distribution
            </h4>
            <span className="text-xs font-bold text-purple-400">Talent Roles</span>
          </div>

          <div className="space-y-3">
            {analytics.professionDistribution.length === 0 ? (
              <p className="text-xs opacity-50 text-center py-4">No valid profession records found.</p>
            ) : (
              analytics.professionDistribution.map((item) => (
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
                        backgroundColor: getProfessionColor(item.category),
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. Country Distribution (Bar Chart) */}
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
            <h4 className="text-xs font-black uppercase tracking-wider theme-text-primary flex items-center gap-2">
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

        {/* 4. Votes Growth by Season */}
        <div
          onContextMenu={(e) => handleWidgetContextMenu(e, "Votes by Season")}
          className="p-6 rounded-3xl border space-y-4 cursor-pointer"
          style={{
            backgroundColor: isCyber ? "rgba(10,15,36,0.6)" : "#FFFFFF",
            borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000000",
            borderWidth: isCyber ? "1px" : "2px",
            boxShadow: isCyber ? "0 0 20px rgba(0,245,255,0.05)" : "4px 4px 0 #000000",
          }}
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider theme-text-primary flex items-center gap-2">
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
