"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HallAnalyticsSummary } from "@/lib/utils/hofEngine";
import { useContextMenu } from "@/hooks/useContextMenu";

interface HofAnalyticsDashboardProps {
  analytics: HallAnalyticsSummary;
  isCyber: boolean;
}

type ModalType = "game" | "profession" | "country" | null;

export function HofAnalyticsDashboard({ analytics, isCyber }: HofAnalyticsDashboardProps) {
  const { openContextMenu } = useContextMenu();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [modalSearch, setModalSearch] = useState("");
  const [showValidationReport, setShowValidationReport] = useState(false);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveModal(null);
        setShowValidationReport(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  const getProfessionColor = (prof: string) => {
    switch (prof.toLowerCase()) {
      case "actress":
        return "#F43F5E"; // Rose
      case "actor":
        return "#2563EB"; // Royal Blue
      case "vtuber":
        return "#A855F7"; // Purple
      case "anime":
        return "#FFD700"; // Gold
      case "tokusatsu":
        return "#10B981"; // Emerald
      case "singer":
        return "#EC4899"; // Pink
      case "game character":
        return "#00F5FF"; // Cyan
      default:
        return "#6366F1"; // Indigo
    }
  };

  // Top 5 slices for main cards
  const topGames = (analytics.gameDistribution || []).slice(0, 5);
  const topProfessions = (analytics.professionDistribution || []).slice(0, 5);
  const topCountries = (analytics.countryDistribution || []).slice(0, 5);

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
              🛡️ Dev Audit ({analytics.validationReport.invalidRecordCount} Excluded)
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
            <button onClick={() => setShowValidationReport(false)} className="text-xs font-bold opacity-60 hover:opacity-100 cursor-pointer">
              ✕ Close
            </button>
          </div>
          <p className="text-[11px] opacity-80 leading-relaxed">
            Public analytics are generated strictly from <strong>{analytics.validationReport.validRecordCount}</strong> valid/normalized records (out of {analytics.validationReport.totalAnalyzed} total entries).
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
        {/* 1. Game Character Distribution (Top 5 + View More) */}
        <div
          onContextMenu={(e) => handleWidgetContextMenu(e, "Game Character Distribution")}
          className="p-6 rounded-3xl border space-y-4 flex flex-col justify-between"
          style={{
            backgroundColor: isCyber ? "rgba(10,15,36,0.6)" : "#FFFFFF",
            borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000000",
            borderWidth: isCyber ? "1px" : "2px",
            boxShadow: isCyber ? "0 0 20px rgba(0,245,255,0.05)" : "4px 4px 0 #000000",
          }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider theme-text-primary flex items-center gap-2">
                🎮 Game Character Distribution
              </h4>
              <span className="text-xs font-bold text-cyan-400">Game Roster Mix</span>
            </div>

            <div className="space-y-3">
              {topGames.length === 0 ? (
                <p className="text-xs opacity-50 text-center py-4">No game characters recorded.</p>
              ) : (
                topGames.map((item) => (
                  <div key={item.game} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="truncate pr-2">{item.game}</span>
                      <span className="shrink-0 text-cyan-400">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(4, item.percentage)}%`,
                          backgroundColor: item.color || "#00F5FF",
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {(analytics.gameDistribution || []).length > 5 && (
            <button
              onClick={() => {
                setModalSearch("");
                setActiveModal("game");
              }}
              className="w-full py-2 rounded-xl text-xs font-bold border transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer mt-2"
              style={{
                backgroundColor: isCyber ? "rgba(0,245,255,0.1)" : "#F1F5F9",
                borderColor: isCyber ? "#00F5FF" : "#000000",
                color: isCyber ? "#00F5FF" : "#000000",
              }}
            >
              View More ({analytics.gameDistribution.length} Games) →
            </button>
          )}
        </div>

        {/* 2. Profession Category Distribution (Top 5 + View More) */}
        <div
          onContextMenu={(e) => handleWidgetContextMenu(e, "Profession Distribution")}
          className="p-6 rounded-3xl border space-y-4 flex flex-col justify-between"
          style={{
            backgroundColor: isCyber ? "rgba(10,15,36,0.6)" : "#FFFFFF",
            borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000000",
            borderWidth: isCyber ? "1px" : "2px",
            boxShadow: isCyber ? "0 0 20px rgba(0,245,255,0.05)" : "4px 4px 0 #000000",
          }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider theme-text-primary flex items-center gap-2">
                🎭 Profession Distribution
              </h4>
              <span className="text-xs font-bold text-purple-400">Talent Roles</span>
            </div>

            <div className="space-y-3">
              {topProfessions.length === 0 ? (
                <p className="text-xs opacity-50 text-center py-4">No profession records found.</p>
              ) : (
                topProfessions.map((item) => (
                  <div key={item.category} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="uppercase">{item.category}</span>
                      <span className="text-purple-400">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(4, item.percentage)}%`,
                          backgroundColor: getProfessionColor(item.category),
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {(analytics.professionDistribution || []).length > 5 && (
            <button
              onClick={() => {
                setModalSearch("");
                setActiveModal("profession");
              }}
              className="w-full py-2 rounded-xl text-xs font-bold border transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer mt-2"
              style={{
                backgroundColor: isCyber ? "rgba(168,85,247,0.1)" : "#F1F5F9",
                borderColor: isCyber ? "#A855F7" : "#000000",
                color: isCyber ? "#A855F7" : "#000000",
              }}
            >
              View More ({analytics.professionDistribution.length} Categories) →
            </button>
          )}
        </div>

        {/* 3. Country Heritage (Top 5 + View More, No "Others") */}
        <div
          onContextMenu={(e) => handleWidgetContextMenu(e, "Country Heritage")}
          className="p-6 rounded-3xl border space-y-4 flex flex-col justify-between"
          style={{
            backgroundColor: isCyber ? "rgba(10,15,36,0.6)" : "#FFFFFF",
            borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000000",
            borderWidth: isCyber ? "1px" : "2px",
            boxShadow: isCyber ? "0 0 20px rgba(0,245,255,0.05)" : "4px 4px 0 #000000",
          }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider theme-text-primary flex items-center gap-2">
                🌍 Country Heritage
              </h4>
              <span className="text-xs font-bold text-amber-400">Global Roster</span>
            </div>

            <div className="space-y-3">
              {topCountries.length === 0 ? (
                <p className="text-xs opacity-50 text-center py-4">No country records found.</p>
              ) : (
                topCountries.map((item) => (
                  <div key={item.country} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>{item.country}</span>
                      <span className="text-amber-400">
                        {item.count} Legends ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-full bg-amber-400 transition-all duration-500"
                        style={{ width: `${Math.max(4, item.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {(analytics.countryDistribution || []).length > 5 && (
            <button
              onClick={() => {
                setModalSearch("");
                setActiveModal("country");
              }}
              className="w-full py-2 rounded-xl text-xs font-bold border transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer mt-2"
              style={{
                backgroundColor: isCyber ? "rgba(245,158,11,0.1)" : "#F1F5F9",
                borderColor: isCyber ? "#F59E0B" : "#000000",
                color: isCyber ? "#F59E0B" : "#000000",
              }}
            >
              View More ({analytics.countryDistribution.length} Countries) →
            </button>
          )}
        </div>

        {/* 4. Votes Growth by Season */}
        <div
          onContextMenu={(e) => handleWidgetContextMenu(e, "Votes by Season")}
          className="p-6 rounded-3xl border space-y-4 flex flex-col justify-between"
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

          <div className="h-44 flex items-end justify-between gap-2 pt-4 px-2 border-b pb-2" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0" }}>
            {analytics.votesBySeason.map((season) => {
              const maxVotes = Math.max(100, ...analytics.votesBySeason.map((s) => s.votes));
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

      {/* ── View More Modals ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg rounded-3xl p-6 shadow-2xl font-mono z-10 max-h-[85vh] flex flex-col space-y-4"
              style={{
                backgroundColor: isCyber ? "#090D1C" : "#FFFFFF",
                borderColor: isCyber ? "#00F5FF" : "#000000",
                borderWidth: isCyber ? "1.5px" : "3px",
                boxShadow: isCyber ? "0 0 40px rgba(0,245,255,0.25)" : "8px 8px 0 #000000",
              }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0" }}>
                <h3 className="text-sm font-black uppercase tracking-wider theme-text-primary flex items-center gap-2">
                  {activeModal === "game" && "🎮 Complete Game Roster Distribution"}
                  {activeModal === "profession" && "🎭 Complete Profession Distribution"}
                  {activeModal === "country" && "🌍 Complete Country Heritage Distribution"}
                </h3>
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold opacity-70 hover:opacity-100 cursor-pointer"
                  style={{
                    backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#F1F5F9",
                    borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#000000",
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Search Filter in Modal */}
              <div className="relative">
                <input
                  type="text"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  placeholder="Filter distribution..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl text-xs border focus:outline-none"
                  style={{
                    backgroundColor: isCyber ? "rgba(255,255,255,0.04)" : "#FFFFFF",
                    borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#000000",
                    borderWidth: isCyber ? "1px" : "2px",
                    color: isCyber ? "#FFF" : "#000",
                  }}
                />
                <span className="absolute left-2.5 top-2.5 text-xs opacity-50">🔍</span>
                {modalSearch && (
                  <button
                    onClick={() => setModalSearch("")}
                    className="absolute right-3 top-2.5 text-xs opacity-60 hover:opacity-100"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Scrollable Distribution Items */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar max-h-[55vh]">
                {activeModal === "game" &&
                  analytics.gameDistribution
                    .filter((item) => item.game.toLowerCase().includes(modalSearch.toLowerCase()))
                    .map((item) => (
                      <div key={item.game} className="space-y-1 p-2 rounded-xl" style={{ backgroundColor: isCyber ? "rgba(255,255,255,0.02)" : "#F8FAFC" }}>
                        <div className="flex justify-between text-xs font-bold">
                          <span className="truncate pr-2">{item.game}</span>
                          <span className="shrink-0 text-cyan-400">
                            {item.count} Characters ({item.percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden p-0.5">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.max(4, item.percentage)}%`,
                              backgroundColor: item.color || "#00F5FF",
                            }}
                          />
                        </div>
                      </div>
                    ))}

                {activeModal === "profession" &&
                  analytics.professionDistribution
                    .filter((item) => item.category.toLowerCase().includes(modalSearch.toLowerCase()))
                    .map((item) => (
                      <div key={item.category} className="space-y-1 p-2 rounded-xl" style={{ backgroundColor: isCyber ? "rgba(255,255,255,0.02)" : "#F8FAFC" }}>
                        <div className="flex justify-between text-xs font-bold">
                          <span className="uppercase">{item.category}</span>
                          <span className="text-purple-400">
                            {item.count} Entries ({item.percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden p-0.5">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.max(4, item.percentage)}%`,
                              backgroundColor: getProfessionColor(item.category),
                            }}
                          />
                        </div>
                      </div>
                    ))}

                {activeModal === "country" &&
                  analytics.countryDistribution
                    .filter((item) => item.country.toLowerCase().includes(modalSearch.toLowerCase()))
                    .map((item) => (
                      <div key={item.country} className="space-y-1 p-2 rounded-xl" style={{ backgroundColor: isCyber ? "rgba(255,255,255,0.02)" : "#F8FAFC" }}>
                        <div className="flex justify-between text-xs font-bold">
                          <span>{item.country}</span>
                          <span className="text-amber-400">
                            {item.count} Legends ({item.percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden p-0.5">
                          <div
                            className="h-full rounded-full bg-amber-400 transition-all duration-500"
                            style={{ width: `${Math.max(4, item.percentage)}%` }}
                          />
                        </div>
                      </div>
                    ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
