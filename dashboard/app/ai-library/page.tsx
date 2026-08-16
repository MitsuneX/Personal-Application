"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { BentoCard } from "@/components/cards/BentoCard";
import { useTheme } from "@/lib/theme";
import { gridContainerVariants, cardVariants } from "@/lib/theme/motionVariants";
import { useDashboardStore, AiToolItemEntry } from "@/lib/store/dashboardStore";
import { AiToolEditorModal } from "@/components/ui/AiToolEditorModal";
import { AiToolDetailModal } from "@/components/ui/AiToolDetailModal";
import { FilterDropdown, FilterOption } from "@/components/ui/FilterDropdown";
import { useConfirm } from "@/lib/context/ConfirmContext";

const PRICING_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  Free: { label: "🆓 Free", color: "#10B981", bg: "rgba(16,185,129,0.15)" },
  Freemium: { label: "⚡ Freemium", color: "#00F5FF", bg: "rgba(0,245,255,0.15)" },
  Paid: { label: "💎 Paid", color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
  "Open Source": { label: "📦 Open Source", color: "#8B5CF6", bg: "rgba(139,92,246,0.15)" },
  Enterprise: { label: "🏢 Enterprise", color: "#EC4899", bg: "rgba(236,72,153,0.15)" },
};

const STATUS_PILLS: Record<string, { label: string; color: string; bg: string }> = {
  Daily: { label: "🔥 Daily", color: "#10B981", bg: "rgba(16,185,129,0.15)" },
  Weekly: { label: "⚡ Weekly", color: "#00F5FF", bg: "rgba(0,245,255,0.15)" },
  Occasionally: { label: "🎯 Occasional", color: "#3B82F6", bg: "rgba(59,130,246,0.15)" },
  Rarely: { label: "🐢 Rarely", color: "#F97316", bg: "rgba(249,115,22,0.15)" },
  Experimental: { label: "🧪 Experimental", color: "#8B5CF6", bg: "rgba(139,92,246,0.15)" },
  Inactive: { label: "💤 Inactive", color: "#64748B", bg: "rgba(100,116,139,0.15)" },
  Archived: { label: "📦 Archived", color: "#64748B", bg: "rgba(100,116,139,0.15)" },
};

const SORT_OPTIONS: FilterOption[] = [
  { id: "DEFAULT", label: "📌 Pinned & Display Order", icon: "📌" },
  { id: "LAST_USED", label: "⏱️ Recently Used (Last Used)", icon: "⏱️" },
  { id: "HIGHEST_RATED", label: "⭐ Highest Rated (5★ First)", icon: "⭐" },
  { id: "ALPHABETICAL", label: "🔤 Alphabetical (A-Z)", icon: "🔤" },
  { id: "MOST_LAUNCHED", label: "🔥 Most Launched Count", icon: "🔥" },
  { id: "COMPANY", label: "🏢 Company / Developer", icon: "🏢" },
];

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

function renderStars(rating: number = 5) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} className={i <= rating ? "text-amber-400" : "opacity-20"}>
        ★
      </span>
    );
  }
  return stars;
}

function formatRelativeTime(dateStr?: string) {
  if (!dateStr) return "Never";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function AiLibraryPage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { confirm } = useConfirm();

  const aiTools = useDashboardStore((s) => s.aiTools) || [];
  const { recordAiToolLaunch, removeAiTool } = useDashboardStore();

  const handleDeleteAiTool = (tool: AiToolItemEntry) => {
    confirm({
      title: `Delete ${tool.name}?`,
      message: `Are you sure you want to permanently delete ${tool.name}? This action cannot be undone.`,
      variant: "danger",
      itemPreview: {
        title: tool.name,
        subtitle: tool.company || tool.category,
        description: tool.description,
        icon: typeof tool.logo === "string" && !tool.logo.includes("/") ? tool.logo : "🤖",
        badge: tool.pricingModel,
      },
      onConfirm: async () => {
        await removeAiTool(tool.id);
      },
      successToast: `Deleted ${tool.name}`,
    });
  };

  // Modal States
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<AiToolItemEntry | null>(null);
  const [detailTool, setDetailTool] = useState<AiToolItemEntry | null>(null);

  // Filters & Search & Sort
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [usageFilter, setUsageFilter] = useState("ALL");
  const [ratingFilter, setRatingFilter] = useState("ALL");
  const [strengthFilter, setStrengthFilter] = useState("ALL");
  const [pricingFilter, setPricingFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("DEFAULT");
  const [showArchived, setShowArchived] = useState(false);

  // Extract unique categories & strengths
  const categoriesList = Array.from(new Set(aiTools.map((t) => t.category))).filter(Boolean);
  const allStrengths = Array.from(
    new Set(aiTools.flatMap((t) => (Array.isArray(t.strengths) ? t.strengths : [])))
  ).filter(Boolean);

  // Filter tools
  const filteredTools = aiTools.filter((t) => {
    if (!showArchived && t.isArchived) return false;

    if (categoryFilter === "FAVORITES" && !t.isFavorite) return false;
    if (categoryFilter !== "ALL" && categoryFilter !== "FAVORITES" && t.category !== categoryFilter) return false;

    if (usageFilter !== "ALL" && t.usageStatus !== usageFilter) return false;

    if (ratingFilter !== "ALL") {
      const minStars = parseInt(ratingFilter, 10);
      if ((t.rating || 5) < minStars) return false;
    }

    if (strengthFilter !== "ALL") {
      if (!Array.isArray(t.strengths) || !t.strengths.includes(strengthFilter)) return false;
    }

    if (pricingFilter !== "ALL" && t.pricingModel !== pricingFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.name.toLowerCase().includes(q);
      const matchCompany = (t.company || "").toLowerCase().includes(q);
      const matchDesc = t.description.toLowerCase().includes(q);
      const matchNotes = (t.notes || "").toLowerCase().includes(q);
      const matchCategory = t.category.toLowerCase().includes(q);
      const matchUsage = (t.usageStatus || "").toLowerCase().includes(q);
      const matchPricing = (t.pricingModel || "").toLowerCase().includes(q);
      const matchStrength = (t.strengths || []).some((str) => str.toLowerCase().includes(q));
      const matchTag = (t.tags || []).some((tag) => tag.toLowerCase().includes(q));
      return (
        matchName ||
        matchCompany ||
        matchDesc ||
        matchNotes ||
        matchCategory ||
        matchUsage ||
        matchPricing ||
        matchStrength ||
        matchTag
      );
    }
    return true;
  });

  // Sort tools
  const sortedTools = [...filteredTools].sort((a, b) => {
    if (sortBy === "LAST_USED") {
      const timeA = a.lastUsed ? new Date(a.lastUsed).getTime() : 0;
      const timeB = b.lastUsed ? new Date(b.lastUsed).getTime() : 0;
      return timeB - timeA;
    }
    if (sortBy === "HIGHEST_RATED") {
      return (b.rating || 5) - (a.rating || 5);
    }
    if (sortBy === "ALPHABETICAL") {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "MOST_LAUNCHED") {
      return (b.launchCount || 0) - (a.launchCount || 0);
    }
    if (sortBy === "COMPANY") {
      return (a.company || "").localeCompare(b.company || "");
    }
    // DEFAULT: Pinned first, then Favorite, then sortOrder
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
    return (a.sortOrder || 0) - (b.sortOrder || 0);
  });

  // Pinned & Favorites showcase tools
  const pinnedTools = aiTools.filter((t) => (t.isPinned || t.isFavorite) && !t.isArchived);

  // Stats Metrics
  const totalTools = aiTools.length;
  const favoriteTools = aiTools.filter((t) => t.isFavorite).length;
  const dailyTools = aiTools.filter((t) => t.usageStatus === "Daily").length;
  const topRatedTools = aiTools.filter((t) => (t.rating || 5) === 5).length;

  const handleLaunch = (tool: AiToolItemEntry) => {
    recordAiToolLaunch(tool.id);
    const target = tool.launchUrl || tool.websiteUrl;
    if (target) {
      window.open(target, target.startsWith("/") ? "_self" : "_blank");
    }
  };

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
                AI Library & Knowledge Hub
              </h1>
              <p className="text-xs theme-text-muted font-mono mt-1">
                Personal AI Collection, Evaluations, Workflow Strengths & Fast Launcher
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

        {/* ── Header Metrics Banner ── */}
        <motion.div variants={cardVariants}>
          <BentoCard id="ai-header-banner" className="relative overflow-hidden p-6 md:p-8">
            {isCyber && (
              <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full blur-[100px] opacity-25 pointer-events-none bg-emerald-500" />
            )}

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    PERSONAL KNOWLEDGE HUB
                  </span>
                  <span className="text-xs font-mono theme-text-muted">v3.4.0 Engine</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black theme-text-primary leading-tight">
                  Curated Directory of Evaluated AI Assistants & Models
                </h2>
                <p className="text-xs theme-text-secondary leading-relaxed">
                  Track personal star ratings, workflow strengths, daily/weekly usage habits, evaluation notes, and fast launch targets for every AI platform in your tech stack.
                </p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto shrink-0">
                {[
                  { label: "AI Collection", value: totalTools, color: "#10A37F" },
                  { label: "⭐ Favorites", value: favoriteTools, color: "#FACC15" },
                  { label: "🔥 Daily Usage", value: dailyTools, color: "#10B981" },
                  { label: "5★ Top Rated", value: topRatedTools, color: "#00F5FF" },
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

        {/* ── Search & Filter & Sort Bar ── */}
        <motion.div variants={cardVariants} className="space-y-3">
          {/* Top Search & Sort Row */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[260px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search AI by name, company, strengths (Coding, Reasoning), notes, category..."
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

            {/* Sorting Dropdown */}
            <div className="w-full sm:w-auto">
              <FilterDropdown
                label="Sort Order"
                icon="📌"
                value={sortBy}
                onChange={(val) => setSortBy(val)}
                options={SORT_OPTIONS}
              />
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

          {/* Usage Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs font-mono">
            <span className="theme-text-muted font-bold self-center mr-1">Usage:</span>
            <button
              onClick={() => setUsageFilter("ALL")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                usageFilter === "ALL"
                  ? "bg-cyan-500 text-black border-2 border-black font-extrabold"
                  : "theme-text-muted hover:theme-text-primary bg-black/10 dark:bg-white/5"
              }`}
            >
              All Usage
            </button>

            {["Daily", "Weekly", "Occasionally", "Rarely", "Experimental", "Inactive"].map((st) => {
              const count = aiTools.filter((t) => t.usageStatus === st).length;
              if (count === 0) return null;
              const cfg = STATUS_PILLS[st] || { label: st, color: "#94A3B8", bg: "transparent" };
              return (
                <button
                  key={st}
                  onClick={() => setUsageFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                    usageFilter === st
                      ? "border-2 border-black font-extrabold"
                      : "theme-text-muted hover:theme-text-primary bg-black/10 dark:bg-white/5"
                  }`}
                  style={usageFilter === st ? { backgroundColor: cfg.bg, color: cfg.color, borderColor: cfg.color } : {}}
                >
                  {cfg.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Strengths Filter Pills */}
          {allStrengths.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs font-mono">
              <span className="theme-text-muted font-bold self-center mr-1">Strength:</span>
              <button
                onClick={() => setStrengthFilter("ALL")}
                className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                  strengthFilter === "ALL"
                    ? "bg-purple-500 text-white border-2 border-black font-extrabold"
                    : "theme-text-muted hover:theme-text-primary bg-black/10 dark:bg-white/5"
                }`}
              >
                All Strengths
              </button>

              {allStrengths.map((str) => {
                const count = aiTools.filter((t) => Array.isArray(t.strengths) && t.strengths.includes(str)).length;
                return (
                  <button
                    key={str}
                    onClick={() => setStrengthFilter(str)}
                    className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                      strengthFilter === str
                        ? "bg-purple-500 text-white border-2 border-black font-extrabold"
                        : "theme-text-muted hover:theme-text-primary bg-black/10 dark:bg-white/5"
                    }`}
                  >
                    ⚡ {str} ({count})
                  </button>
                );
              })}
            </div>
          )}
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
              Try adjusting your search query, strengths, rating, or filters, or add a new AI entry to your personal collection.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("ALL");
                  setUsageFilter("ALL");
                  setRatingFilter("ALL");
                  setStrengthFilter("ALL");
                  setPricingFilter("ALL");
                  setSortBy("DEFAULT");
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
              const statusCfg = STATUS_PILLS[tool.usageStatus || "Daily"] || {
                label: tool.usageStatus || "Daily",
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
                  {/* Top Action Buttons (Edit + Delete) */}
                  <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTool(tool);
                        setIsEditorOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-black/70 text-white backdrop-blur-md hover:bg-black transition-colors cursor-pointer text-xs"
                      title="Edit AI Platform"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAiTool(tool);
                      }}
                      className="p-1.5 rounded-lg bg-red-600/80 text-white backdrop-blur-md hover:bg-red-600 transition-colors cursor-pointer text-xs"
                      title="Delete AI Platform"
                    >
                      🗑️
                    </button>
                  </div>

                  {/* Card Main Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      {/* Logo, Name, Company & Badges */}
                      <div className="flex items-start gap-3">
                        {/* Logo */}
                        <div
                          onClick={() => setDetailTool(tool)}
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 font-bold overflow-hidden border shadow-sm cursor-pointer hover:scale-105 transition-transform"
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
                              <span>{tool.logo.length <= 8 && !tool.logo.includes(";") ? tool.logo : "🤖"}</span>
                            )
                          ) : (
                            <span>🤖</span>
                          )}
                        </div>

                        {/* Title & Metadata */}
                        <div className="min-w-0 flex-1 pr-6">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3
                              onClick={() => setDetailTool(tool)}
                              className="font-black text-base theme-text-primary leading-tight truncate cursor-pointer hover:underline"
                            >
                              {tool.name}
                            </h3>
                            {tool.isFavorite && (
                              <span className="text-amber-400 text-xs shrink-0" title="Favorite AI">⭐</span>
                            )}
                            {tool.isPinned && (
                              <span className="text-cyan-400 text-xs shrink-0" title="Pinned Platform">📌</span>
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-2 mt-0.5">
                            <p className="text-xs font-semibold theme-text-muted truncate">
                              {tool.company || "Independent"}
                            </p>
                            <div className="flex items-center text-xs shrink-0">
                              {renderStars(tool.rating || 5)}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap text-[10px] font-mono">
                            <span
                              className="px-2 py-0.5 rounded font-bold"
                              style={{
                                backgroundColor: statusCfg.bg,
                                color: statusCfg.color,
                                border: `1px solid ${statusCfg.color}40`,
                              }}
                            >
                              {statusCfg.label}
                            </span>

                            <span
                              className="px-1.5 py-0.5 rounded font-bold"
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
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs theme-text-secondary leading-relaxed line-clamp-2">
                        {tool.description}
                      </p>

                      {/* Personal Strengths Pills */}
                      {tool.strengths && tool.strengths.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {tool.strengths.slice(0, 4).map((str) => (
                            <span
                              key={str}
                              className="px-2 py-0.5 rounded text-[10px] font-mono font-bold border"
                              style={{
                                backgroundColor: isCyber ? `${accent}12` : "#F1F5F9",
                                color: isCyber ? accent : "#1E293B",
                                borderColor: isCyber ? `${accent}30` : "#CBD5E1",
                              }}
                            >
                              ⚡ {str}
                            </span>
                          ))}
                          {tool.strengths.length > 4 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono theme-text-muted font-bold">
                              +{tool.strengths.length - 4} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Personal Notes Snippet */}
                      {tool.notes && (
                        <div
                          onClick={() => setDetailTool(tool)}
                          className="p-2.5 rounded-xl border text-[11px] font-medium leading-normal cursor-pointer line-clamp-2 transition-all hover:bg-black/5 dark:hover:bg-white/5"
                          style={{
                            backgroundColor: isCyber ? `${accent}08` : "#F8FAFC",
                            borderColor: isCyber ? `${accent}25` : "#E2E8F0",
                            borderLeftWidth: "3px",
                            borderLeftColor: accent,
                          }}
                        >
                          <span className="font-bold mr-1" style={{ color: accent }}>Note:</span>
                          <span className="theme-text-secondary">{tool.notes}</span>
                        </div>
                      )}

                      {/* Quick Insights Row */}
                      <div className="flex items-center justify-between text-[10px] font-mono theme-text-muted pt-1 border-t border-white/5">
                        <span>Last used: {formatRelativeTime(tool.lastUsed)}</span>
                        <span>Launches: {tool.launchCount || 0}</span>
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="pt-3 border-t border-white/10 space-y-2">
                      <div className="flex items-center gap-2">
                        {/* Primary Fast Launch Button */}
                        {isValidUrl(primaryLaunch) && (
                          <button
                            onClick={() => handleLaunch(tool)}
                            className="flex-1 py-2 px-3 rounded-xl font-black text-xs text-center transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                            style={{
                              backgroundColor: accent,
                              color: "#FFFFFF",
                              border: isCyber ? "none" : "2px solid #000",
                              boxShadow: isCyber ? `0 0 14px ${accent}60` : "2.5px 2.5px 0 #000",
                            }}
                          >
                            <span>🚀</span> Launch ↗
                          </button>
                        )}

                        {/* Detail Modal Trigger Button */}
                        <button
                          onClick={() => setDetailTool(tool)}
                          className="py-2 px-3 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
                          style={{
                            backgroundColor: isCyber ? "rgba(255,255,255,0.08)" : "#F1F5F9",
                            color: isCyber ? "#E2E8F0" : "#1E293B",
                            border: isCyber ? "1px solid rgba(255,255,255,0.2)" : "2px solid #000",
                          }}
                          title="View Knowledge Details"
                        >
                          <span>👁️</span> Details
                        </button>
                      </div>

                      {/* Secondary Resource Buttons */}
                      <div className="flex flex-wrap gap-1">
                        {isValidUrl(tool.docsUrl) && (
                          <a
                            href={tool.docsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1 px-2 rounded-md font-bold text-[10px] transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                            style={{
                              backgroundColor: isCyber ? "rgba(0,245,255,0.1)" : "#E0F2FE",
                              color: isCyber ? "#00F5FF" : "#0369A1",
                              border: isCyber ? "1px solid rgba(0,245,255,0.25)" : "1px solid #000",
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
                            className="py-1 px-2 rounded-md font-bold text-[10px] transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                            style={{
                              backgroundColor: isCyber ? "rgba(139,92,246,0.1)" : "#EDE9FE",
                              color: isCyber ? "#8B5CF6" : "#6D28D9",
                              border: isCyber ? "1px solid rgba(139,92,246,0.25)" : "1px solid #000",
                            }}
                          >
                            <span>🔌</span> API
                          </a>
                        )}

                        {isValidUrl(tool.pricingUrl) && (
                          <a
                            href={tool.pricingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1 px-2 rounded-md font-bold text-[10px] transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                            style={{
                              backgroundColor: isCyber ? "rgba(245,158,11,0.1)" : "#FEF3C7",
                              color: isCyber ? "#F59E0B" : "#B45309",
                              border: isCyber ? "1px solid rgba(245,158,11,0.25)" : "1px solid #000",
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
                            className="py-1 px-2 rounded-md font-bold text-[10px] transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                            style={{
                              backgroundColor: isCyber ? "rgba(255,255,255,0.08)" : "#181717",
                              color: "#FFFFFF",
                              border: isCyber ? "1px solid rgba(255,255,255,0.2)" : "1px solid #000",
                            }}
                          >
                            <span>🐙</span> GitHub
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

        <AiToolDetailModal
          isOpen={!!detailTool}
          onClose={() => setDetailTool(null)}
          tool={detailTool}
          onEdit={(t) => {
            setDetailTool(null);
            setEditingTool(t);
            setIsEditorOpen(true);
          }}
        />
      </motion.div>
    </AppShell>
  );
}
