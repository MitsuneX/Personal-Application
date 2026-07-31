"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { BentoCard } from "@/components/cards/BentoCard";
import { useTheme } from "@/lib/theme";
import { gridContainerVariants, cardVariants } from "@/lib/theme/motionVariants";
import { useDashboardStore, AiToolItemEntry } from "@/lib/store/dashboardStore";
import { AiToolEditorModal } from "@/components/ui/AiToolEditorModal";

const PRICING_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  Free: { label: "🆓 Free", color: "#10B981", bg: "rgba(16,185,129,0.15)" },
  Freemium: { label: "⚡ Freemium", color: "#00F5FF", bg: "rgba(0,245,255,0.15)" },
  Paid: { label: "💎 Paid", color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
  "Open Source": { label: "📦 Open Source", color: "#8B5CF6", bg: "rgba(139,92,246,0.15)" },
  Enterprise: { label: "🏢 Enterprise", color: "#EC4899", bg: "rgba(236,72,153,0.15)" },
};

function isValidUrl(url?: string) {
  if (!url) return false;
  if (url.startsWith("/")) return true;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:" || u.protocol.includes(":");
  } catch {
    return false;
  }
}

export default function AiLibraryPage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const aiTools = useDashboardStore((s) => s.aiTools) || [];

  // Modal States
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<AiToolItemEntry | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [pricingFilter, setPricingFilter] = useState("ALL");
  const [showArchived, setShowArchived] = useState(false);

  // Extract unique categories
  const categoriesList = Array.from(new Set(aiTools.map((t) => t.category))).filter(Boolean);

  const filteredTools = aiTools.filter((t) => {
    if (!showArchived && t.isArchived) return false;

    if (categoryFilter === "FAVORITES" && !t.isFavorite) return false;
    if (categoryFilter !== "ALL" && categoryFilter !== "FAVORITES" && t.category !== categoryFilter) return false;

    if (pricingFilter !== "ALL" && t.pricingModel !== pricingFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.name.toLowerCase().includes(q);
      const matchCompany = (t.company || "").toLowerCase().includes(q);
      const matchDesc = t.description.toLowerCase().includes(q);
      const matchCategory = t.category.toLowerCase().includes(q);
      const matchPricing = (t.pricingModel || "").toLowerCase().includes(q);
      const matchTag = (t.tags || []).some((tag) => tag.toLowerCase().includes(q));
      return matchName || matchCompany || matchDesc || matchCategory || matchPricing || matchTag;
    }
    return true;
  });

  // Sort tools: Pinned first, then Favorite, then sortOrder
  const sortedTools = [...filteredTools].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
    return (a.sortOrder || 0) - (b.sortOrder || 0);
  });

  // Stats Metrics
  const totalTools = aiTools.length;
  const favoriteTools = aiTools.filter((t) => t.isFavorite).length;
  const codingTools = aiTools.filter((t) => t.category.includes("Coding") || (t.tags || []).includes("Coding")).length;
  const researchTools = aiTools.filter((t) => t.category.includes("Research") || t.category.includes("Search")).length;

  return (
    <AppShell>
      <motion.div
        variants={gridContainerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 max-w-7xl mx-auto"
      >
        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">🤖</span>
            <div>
              <h1 className="text-2xl md:text-3xl font-black theme-text-primary tracking-tight leading-none">
                AI Library & Launcher
              </h1>
              <p className="text-xs theme-text-muted font-mono mt-1">
                Personal Collection of External AI Platforms, Tools & Fast Launch Targets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setEditingTool(null);
                setIsEditorOpen(true);
              }}
              className="px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md"
              style={{
                background: isCyber ? "linear-gradient(135deg, #10A37F, #00F5FF)" : "#10A37F",
                color: "#FFFFFF",
                border: isCyber ? "none" : "2px solid #000",
                boxShadow: isCyber ? "0 0 15px rgba(16,163,127,0.4)" : "3px 3px 0 #000",
              }}
            >
              <span>✨</span> + Add AI Platform
            </button>
          </div>
        </div>

        {/* ── Stats Header Banner ── */}
        <motion.div variants={cardVariants}>
          <BentoCard id="ai-header-banner" className="relative overflow-hidden p-6 md:p-8">
            {isCyber && (
              <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full blur-[100px] opacity-25 pointer-events-none bg-emerald-500" />
            )}

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    AI LAUNCHER SUITE
                  </span>
                  <span className="text-xs font-mono theme-text-muted">v3.2.0 Index</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black theme-text-primary leading-tight">
                  Organized Portal for AI Assistants, Coding Agents & Models
                </h2>
                <p className="text-xs theme-text-secondary leading-relaxed">
                  Quickly launch web platforms, desktop environments, API documentation, pricing tiers, and developer resources from a single central command interface.
                </p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto shrink-0">
                {[
                  { label: "Total AI Platforms", value: totalTools, color: "#10A37F" },
                  { label: "⭐ Favorites", value: favoriteTools, color: "#FACC15" },
                  { label: "💻 Coding Tools", value: codingTools, color: "#00F5FF" },
                  { label: "🧠 Research AI", value: researchTools, color: "#00B4D8" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-3.5 rounded-xl text-center border"
                    style={{
                      backgroundColor: isCyber ? "rgba(16,163,127,0.05)" : "#F8FAFC",
                      borderColor: isCyber ? "rgba(16,163,127,0.2)" : "#000",
                      boxShadow: isCyber ? "none" : "2px 2px 0 #000",
                    }}
                  >
                    <p className="text-[10px] font-mono font-bold theme-text-muted uppercase">{stat.label}</p>
                    <p className="text-2xl font-black mt-0.5" style={{ color: stat.color }}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </BentoCard>
        </motion.div>

        {/* ── Search & Filter Bar ── */}
        <motion.div variants={cardVariants} className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[260px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search AI platforms by name, company (OpenAI, Anthropic), category, tags (LLM, Coding)..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none"
                style={{
                  backgroundColor: isCyber ? "rgba(10,15,30,0.75)" : "#FFFFFF",
                  color: isCyber ? "#F8FAFC" : "#0F172A",
                  borderColor: isCyber ? "rgba(16,163,127,0.25)" : "#000000",
                  borderWidth: isCyber ? "1px" : "2px",
                  boxShadow: isCyber ? "none" : "2px 2px 0 #000000",
                }}
              />
              <span className="absolute left-3 top-3 text-xs opacity-60">🔍</span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-xs theme-text-muted hover:opacity-100"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Show archived toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showArchivedAiTools"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer accent-emerald-500"
              />
              <label htmlFor="showArchivedAiTools" className="text-xs font-mono font-bold cursor-pointer theme-text-secondary">
                Include Archived
              </label>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs font-mono">
            <span className="theme-text-muted font-bold self-center mr-1">Category:</span>
            <button
              onClick={() => setCategoryFilter("ALL")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                categoryFilter === "ALL"
                  ? "bg-emerald-500 text-white border-2 border-black font-extrabold"
                  : "theme-text-muted hover:theme-text-primary bg-black/10 dark:bg-white/5"
              }`}
            >
              All Platforms ({aiTools.length})
            </button>

            <button
              onClick={() => setCategoryFilter("FAVORITES")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                categoryFilter === "FAVORITES"
                  ? "bg-amber-400 text-black border-2 border-black font-extrabold"
                  : "theme-text-muted hover:theme-text-primary bg-black/10 dark:bg-white/5"
              }`}
            >
              ⭐ Favorites ({aiTools.filter((t) => t.isFavorite).length})
            </button>

            {categoriesList.map((cat) => {
              const count = aiTools.filter((t) => t.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                    categoryFilter === cat
                      ? "bg-emerald-500 text-white border-2 border-black font-extrabold"
                      : "theme-text-muted hover:theme-text-primary bg-black/10 dark:bg-white/5"
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {/* Pricing Model Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs font-mono">
            <span className="theme-text-muted font-bold self-center mr-1">Pricing:</span>
            <button
              onClick={() => setPricingFilter("ALL")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                pricingFilter === "ALL"
                  ? "bg-cyan-500 text-black border-2 border-black font-extrabold"
                  : "theme-text-muted hover:theme-text-primary bg-black/10 dark:bg-white/5"
              }`}
            >
              All Pricing
            </button>

            {["Free", "Freemium", "Paid", "Open Source", "Enterprise"].map((pr) => {
              const count = aiTools.filter((t) => t.pricingModel === pr).length;
              if (count === 0) return null;
              const cfg = PRICING_CONFIG[pr] || { label: pr, color: "#94A3B8", bg: "transparent" };
              return (
                <button
                  key={pr}
                  onClick={() => setPricingFilter(pr)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                    pricingFilter === pr
                      ? "border-2 border-black font-extrabold"
                      : "theme-text-muted hover:theme-text-primary bg-black/10 dark:bg-white/5"
                  }`}
                  style={pricingFilter === pr ? { backgroundColor: cfg.bg, color: cfg.color, borderColor: cfg.color } : {}}
                >
                  {cfg.label} ({count})
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ── AI Cards Grid Showcase ── */}
        {sortedTools.length === 0 ? (
          <motion.div
            variants={cardVariants}
            className="p-10 rounded-2xl border text-center space-y-3"
            style={{
              backgroundColor: isCyber ? "rgba(10,15,30,0.6)" : "#FFFFFF",
              borderColor: isCyber ? "rgba(16,163,127,0.2)" : "#000000",
              borderWidth: isCyber ? "1px" : "2.5px",
              boxShadow: isCyber ? "none" : "4px 4px 0 #000000",
            }}
          >
            <div className="text-5xl">🤖</div>
            <h3 className="font-black text-lg theme-text-primary">No AI Platforms Match Selected Filters</h3>
            <p className="text-xs theme-text-muted max-w-md mx-auto">
              Try adjusting your search query or filters, or add a new AI entry to your personal directory.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("ALL");
                  setPricingFilter("ALL");
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold border theme-text-primary cursor-pointer"
              >
                Reset Filters
              </button>
              <button
                onClick={() => {
                  setEditingTool(null);
                  setIsEditorOpen(true);
                }}
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-emerald-500 text-white border-2 border-black shadow-[2px_2px_0_#000] cursor-pointer"
              >
                + Add AI Platform
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={cardVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {sortedTools.map((tool, index) => {
              const pricingCfg = PRICING_CONFIG[tool.pricingModel || "Freemium"] || {
                label: tool.pricingModel || "Freemium",
                color: "#94A3B8",
                bg: "rgba(255,255,255,0.1)",
              };
              const accent = tool.accentColor || "#10A37F";
              const primaryLaunch = tool.launchUrl || tool.websiteUrl;

              return (
                <motion.div
                  key={tool.id}
                  variants={cardVariants}
                  custom={index}
                  layout
                  className="rounded-2xl border overflow-hidden flex flex-col relative group transition-all"
                  style={{
                    backgroundColor: isCyber ? "rgba(10,15,30,0.85)" : "#FFFFFF",
                    borderColor: isCyber ? `${accent}50` : "#000000",
                    borderWidth: isCyber ? "1px" : "2.5px",
                    boxShadow: isCyber
                      ? `0 0 18px ${accent}30, 0 0 45px ${accent}10`
                      : "4px 4px 0 #000000",
                  }}
                >
                  {/* Top Edit Button */}
                  <button
                    onClick={() => {
                      setEditingTool(tool);
                      setIsEditorOpen(true);
                    }}
                    className="absolute top-3.5 right-3.5 z-20 p-1.5 rounded-lg bg-black/60 text-white backdrop-blur-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer text-xs"
                    title="Edit AI Platform"
                  >
                    ✏️
                  </button>

                  {/* Card Main Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      {/* Logo, Name, Company & Badges */}
                      <div className="flex items-start gap-3">
                        {/* Logo */}
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 font-bold overflow-hidden border shadow-sm"
                          style={{
                            backgroundColor: `${accent}18`,
                            color: accent,
                            borderColor: isCyber ? accent : "#000",
                            borderWidth: isCyber ? "1px" : "2px",
                          }}
                        >
                          {tool.logo ? (
                            tool.logo.startsWith("http") || tool.logo.startsWith("/") || tool.logo.startsWith("data:") ? (
                              <img src={tool.logo} alt={tool.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{tool.logo}</span>
                            )
                          ) : (
                            <span>🤖</span>
                          )}
                        </div>

                        {/* Title & Metadata */}
                        <div className="min-w-0 flex-1 pr-6">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-black text-base theme-text-primary leading-tight truncate">
                              {tool.name}
                            </h3>
                            {tool.isFavorite && (
                              <span className="text-amber-400 text-xs shrink-0" title="Favorite AI">⭐</span>
                            )}
                            {tool.isPinned && (
                              <span className="text-cyan-400 text-xs shrink-0" title="Pinned Platform">📌</span>
                            )}
                          </div>

                          <p className="text-xs font-semibold theme-text-muted mt-0.5 truncate">
                            {tool.company || "Independent"}
                          </p>

                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap text-[10px] font-mono">
                            <span
                              className="px-2 py-0.5 rounded font-bold"
                              style={{
                                backgroundColor: pricingCfg.bg,
                                color: pricingCfg.color,
                                border: `1px solid ${pricingCfg.color}40`,
                              }}
                            >
                              {pricingCfg.label}
                            </span>

                            {tool.version && (
                              <span className="px-1.5 py-0.5 rounded theme-text-muted bg-black/10 dark:bg-white/10 font-bold">
                                {tool.version}
                              </span>
                            )}

                            <span className="theme-text-muted font-semibold">{tool.category}</span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs theme-text-secondary leading-relaxed line-clamp-3">
                        {tool.description}
                      </p>

                      {/* Tags */}
                      {tool.tags && tool.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {tool.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded text-[10px] font-mono font-bold border"
                              style={{
                                backgroundColor: isCyber ? `${accent}10` : "#F1F5F9",
                                color: isCyber ? accent : "#334155",
                                borderColor: isCyber ? `${accent}30` : "#CBD5E1",
                              }}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Fast Launch & Resource Action Buttons */}
                    <div className="pt-3 border-t border-white/10 space-y-2">
                      {/* Primary Fast Launch Button */}
                      {isValidUrl(primaryLaunch) && (
                        <a
                          href={primaryLaunch}
                          target={primaryLaunch?.startsWith("/") ? "_self" : "_blank"}
                          rel="noopener noreferrer"
                          className="w-full py-2 px-3 rounded-xl font-black text-xs text-center transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                          style={{
                            backgroundColor: accent,
                            color: "#FFFFFF",
                            border: isCyber ? "none" : "2px solid #000",
                            boxShadow: isCyber ? `0 0 14px ${accent}60` : "3px 3px 0 #000",
                          }}
                        >
                          <span>🚀</span> Launch Platform ↗
                        </a>
                      )}

                      {/* Secondary Resource Buttons */}
                      <div className="flex flex-wrap gap-1.5">
                        {isValidUrl(tool.websiteUrl) && tool.websiteUrl !== primaryLaunch && (
                          <a
                            href={tool.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1 py-1.5 px-2.5 rounded-lg font-bold text-[11px] transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                            style={{
                              backgroundColor: isCyber ? "rgba(255,255,255,0.08)" : "#E2E8F0",
                              color: isCyber ? "#E2E8F0" : "#1E293B",
                              border: isCyber ? "1px solid rgba(255,255,255,0.2)" : "1.5px solid #000",
                            }}
                          >
                            <span>🌐</span> Website
                          </a>
                        )}

                        {isValidUrl(tool.docsUrl) && (
                          <a
                            href={tool.docsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1.5 px-2.5 rounded-lg font-bold text-[11px] transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                            style={{
                              backgroundColor: isCyber ? "rgba(0,245,255,0.1)" : "#E0F2FE",
                              color: isCyber ? "#00F5FF" : "#0369A1",
                              border: isCyber ? "1px solid rgba(0,245,255,0.25)" : "1.5px solid #000",
                            }}
                          >
                            <span>📖</span> Docs
                          </a>
                        )}

                        {isValidUrl(tool.apiUrl) && (
                          <a
                            href={tool.apiUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1.5 px-2.5 rounded-lg font-bold text-[11px] transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                            style={{
                              backgroundColor: isCyber ? "rgba(139,92,246,0.1)" : "#EDE9FE",
                              color: isCyber ? "#8B5CF6" : "#6D28D9",
                              border: isCyber ? "1px solid rgba(139,92,246,0.25)" : "1.5px solid #000",
                            }}
                          >
                            <span>🔌</span> API Keys
                          </a>
                        )}

                        {isValidUrl(tool.pricingUrl) && (
                          <a
                            href={tool.pricingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1.5 px-2.5 rounded-lg font-bold text-[11px] transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                            style={{
                              backgroundColor: isCyber ? "rgba(245,158,11,0.1)" : "#FEF3C7",
                              color: isCyber ? "#F59E0B" : "#B45309",
                              border: isCyber ? "1px solid rgba(245,158,11,0.25)" : "1.5px solid #000",
                            }}
                          >
                            <span>💰</span> Pricing
                          </a>
                        )}

                        {isValidUrl(tool.githubUrl) && (
                          <a
                            href={tool.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1.5 px-2.5 rounded-lg font-bold text-[11px] transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                            style={{
                              backgroundColor: isCyber ? "rgba(255,255,255,0.08)" : "#181717",
                              color: "#FFFFFF",
                              border: isCyber ? "1px solid rgba(255,255,255,0.2)" : "1.5px solid #000",
                            }}
                          >
                            <span>🐙</span> GitHub
                          </a>
                        )}

                        {isValidUrl(tool.discordUrl) && (
                          <a
                            href={tool.discordUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1.5 px-2.5 rounded-lg font-bold text-[11px] transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                            style={{
                              backgroundColor: isCyber ? "rgba(88,101,242,0.15)" : "#5865F2",
                              color: "#FFFFFF",
                              border: isCyber ? "1px solid rgba(88,101,242,0.3)" : "1.5px solid #000",
                            }}
                          >
                            <span>💬</span> Discord
                          </a>
                        )}

                        {isValidUrl(tool.communityUrl) && (
                          <a
                            href={tool.communityUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1.5 px-2.5 rounded-lg font-bold text-[11px] transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                            style={{
                              backgroundColor: isCyber ? "rgba(16,185,129,0.1)" : "#D1FAE5",
                              color: isCyber ? "#10B981" : "#047857",
                              border: isCyber ? "1px solid rgba(16,185,129,0.25)" : "1.5px solid #000",
                            }}
                          >
                            <span>👥</span> Forum
                          </a>
                        )}

                        {isValidUrl(tool.releaseNotesUrl) && (
                          <a
                            href={tool.releaseNotesUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1.5 px-2.5 rounded-lg font-bold text-[11px] transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                            style={{
                              backgroundColor: isCyber ? "rgba(236,72,153,0.1)" : "#FCE7F3",
                              color: isCyber ? "#EC4899" : "#BE185D",
                              border: isCyber ? "1px solid rgba(236,72,153,0.25)" : "1.5px solid #000",
                            }}
                          >
                            <span>📜</span> Notes
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* ── Modals ── */}
        <AiToolEditorModal
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingTool(null);
          }}
          toolToEdit={editingTool}
        />
      </motion.div>
    </AppShell>
  );
}
