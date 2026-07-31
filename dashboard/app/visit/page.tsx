"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { BentoCard } from "@/components/cards/BentoCard";
import { useTheme } from "@/lib/theme";
import { gridContainerVariants, cardVariants } from "@/lib/theme/motionVariants";
import { useDashboardStore, ProjectItemEntry, ProjectStatus } from "@/lib/store/dashboardStore";
import { ProjectEditorModal } from "@/components/ui/ProjectEditorModal";
import { ImageLightboxModal } from "@/components/ui/ImageLightboxModal";
import { useConfirm } from "@/lib/context/ConfirmContext";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  Live: { label: "🟢 Live", color: "#10B981", bg: "rgba(16,185,129,0.15)" },
  Development: { label: "🟡 In Dev", color: "#EAB308", bg: "rgba(234,179,8,0.15)" },
  Beta: { label: "🔵 Public Beta", color: "#3B82F6", bg: "rgba(59,130,246,0.15)" },
  Maintenance: { label: "🟠 Maintenance", color: "#F97316", bg: "rgba(249,115,22,0.15)" },
  Experimental: { label: "🟣 Lab / Exp", color: "#8B5CF6", bg: "rgba(139,92,246,0.15)" },
  Upcoming: { label: "🔮 Roadmap", color: "#EC4899", bg: "rgba(236,72,153,0.15)" },
  Archived: { label: "📦 Archived", color: "#64748B", bg: "rgba(100,116,139,0.15)" },
};

function isValidUrl(url?: string) {
  if (!url) return false;
  if (url.startsWith("/")) return true;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function VisitProjectHubPage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { confirm } = useConfirm();

  const projects = useDashboardStore((s) => s.projects) || [];
  const { removeProject } = useDashboardStore();

  const handleDeleteProject = (proj: ProjectItemEntry) => {
    confirm({
      title: `Delete ${proj.name}?`,
      message: `Are you sure you want to permanently delete ${proj.name}? This action cannot be undone.`,
      variant: "danger",
      itemPreview: {
        title: proj.name,
        subtitle: proj.category,
        description: proj.description,
        icon: typeof proj.logo === "string" && !proj.logo.includes("/") ? proj.logo : "🌐",
        badge: proj.status,
      },
      onConfirm: async () => {
        await removeProject(proj.id);
      },
      successToast: `Deleted ${proj.name}`,
    });
  };

  // Modal States
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItemEntry | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showArchived, setShowArchived] = useState(false);

  // Extract unique categories & tags
  const categoriesList = Array.from(new Set(projects.map((p) => p.category))).filter(Boolean);

  const filteredProjects = projects.filter((p) => {
    if (!showArchived && p.isArchived) return false;
    if (categoryFilter !== "ALL" && p.category !== categoryFilter) return false;
    if (statusFilter !== "ALL" && p.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchCategory = p.category.toLowerCase().includes(q);
      const matchTech = (p.techStack || []).some((t) => t.toLowerCase().includes(q));
      const matchTag = (p.tags || []).some((t) => t.toLowerCase().includes(q));
      return matchName || matchDesc || matchCategory || matchTech || matchTag;
    }
    return true;
  });

  // Project Stats Metrics
  const totalProjects = projects.length;
  const liveProjects = projects.filter((p) => p.status === "Live").length;
  const devProjects = projects.filter((p) => p.status === "Development" || p.status === "Beta").length;
  const featuredProjects = projects.filter((p) => p.isFeatured).length;

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
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌐</span>
            <div>
              <h1 className="text-2xl md:text-3xl font-black theme-text-primary tracking-tight leading-none">
                Visit Project Hub
              </h1>
              <p className="text-xs theme-text-muted font-mono mt-1">
                Personal Applications, Web Services, AI Engine & Portfolio Showcase
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setEditingProject(null);
                setIsEditorOpen(true);
              }}
              className="px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md"
              style={{
                background: isCyber ? "linear-gradient(135deg, #00F5FF, #bf5fff)" : "#00F5FF",
                color: isCyber ? "#050816" : "#000",
                border: isCyber ? "none" : "2px solid #000",
                boxShadow: isCyber ? "0 0 15px rgba(0,245,255,0.4)" : "3px 3px 0 #000",
              }}
            >
              <span>✨</span> + Add Project
            </button>
          </div>
        </div>

        {/* ── Executive Overview Stats Header Banner ── */}
        <motion.div variants={cardVariants}>
          <BentoCard id="visit-header-banner" className="relative overflow-hidden p-6 md:p-8">
            {isCyber && (
              <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full blur-[100px] opacity-25 pointer-events-none bg-cyan-500" />
            )}

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                    PORTFOLIO SHOWCASE
                  </span>
                  <span className="text-xs font-mono theme-text-muted">v3.1.0 Hub Engine</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black theme-text-primary leading-tight">
                  Central Directory of Personal Codebases & Deployed Services
                </h2>
                <p className="text-xs theme-text-secondary leading-relaxed">
                  Explore full-stack web applications, AI screenshot scanning tools, mobile builds, streaming indexes, and open-source personal repositories.
                </p>
              </div>

              {/* Quick Hub Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto shrink-0">
                {[
                  { label: "Total Projects", value: totalProjects, color: "#00F5FF" },
                  { label: "Live Services", value: liveProjects, color: "#10B981" },
                  { label: "In Development", value: devProjects, color: "#EAB308" },
                  { label: "Featured", value: featuredProjects, color: "#FACC15" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-3.5 rounded-xl text-center border"
                    style={{
                      backgroundColor: isCyber ? "rgba(0,245,255,0.05)" : "#F8FAFC",
                      borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000",
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

        {/* ── Search & Filter Controls Bar ── */}
        <motion.div variants={cardVariants} className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Search input */}
            <div className="relative flex-1 min-w-[260px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by name, description, tech stack (Next.js, Prisma...)..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none"
                style={{
                  backgroundColor: isCyber ? "rgba(10,15,30,0.75)" : "#FFFFFF",
                  color: isCyber ? "#F8FAFC" : "#0F172A",
                  borderColor: isCyber ? "rgba(0,245,255,0.25)" : "#000000",
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
                id="showArchivedProjects"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer accent-cyan-500"
              />
              <label htmlFor="showArchivedProjects" className="text-xs font-mono font-bold cursor-pointer theme-text-secondary">
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
                  ? "bg-cyan-500 text-black border-2 border-black font-extrabold"
                  : "theme-text-muted hover:theme-text-primary bg-black/10 dark:bg-white/5"
              }`}
            >
              All Categories ({projects.length})
            </button>

            {categoriesList.map((cat) => {
              const count = projects.filter((p) => p.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                    categoryFilter === cat
                      ? "bg-cyan-500 text-black border-2 border-black font-extrabold"
                      : "theme-text-muted hover:theme-text-primary bg-black/10 dark:bg-white/5"
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs font-mono">
            <span className="theme-text-muted font-bold self-center mr-1">Status:</span>
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === "ALL"
                  ? "bg-amber-500 text-black border-2 border-black font-extrabold"
                  : "theme-text-muted hover:theme-text-primary bg-black/10 dark:bg-white/5"
              }`}
            >
              All Statuses
            </button>

            {["Live", "Development", "Beta", "Maintenance", "Experimental", "Upcoming"].map((st) => {
              const count = projects.filter((p) => p.status === st).length;
              if (count === 0) return null;
              const cfg = STATUS_CONFIG[st] || { label: st, color: "#94A3B8", bg: "transparent" };
              return (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === st
                      ? "border-2 border-black font-extrabold"
                      : "theme-text-muted hover:theme-text-primary bg-black/10 dark:bg-white/5"
                  }`}
                  style={statusFilter === st ? { backgroundColor: cfg.bg, color: cfg.color, borderColor: cfg.color } : {}}
                >
                  {cfg.label} ({count})
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Project Cards Grid Showcase ── */}
        {filteredProjects.length === 0 ? (
          <motion.div
            variants={cardVariants}
            className="p-10 rounded-2xl border text-center space-y-3"
            style={{
              backgroundColor: isCyber ? "rgba(10,15,30,0.6)" : "#FFFFFF",
              borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000000",
              borderWidth: isCyber ? "1px" : "2.5px",
              boxShadow: isCyber ? "none" : "4px 4px 0 #000000",
            }}
          >
            <div className="text-5xl">🌐</div>
            <h3 className="font-black text-lg theme-text-primary">No Projects Match Selected Filters</h3>
            <p className="text-xs theme-text-muted max-w-md mx-auto">
              Try adjusting search query or status/category filters, or add a new project to your portfolio hub.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("ALL");
                  setStatusFilter("ALL");
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold border theme-text-primary cursor-pointer"
              >
                Reset Filters
              </button>
              <button
                onClick={() => {
                  setEditingProject(null);
                  setIsEditorOpen(true);
                }}
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-cyan-500 text-black border-2 border-black shadow-[2px_2px_0_#000] cursor-pointer"
              >
                + Add Project Showcase
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={cardVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filteredProjects.map((proj, index) => {
              const statusCfg = STATUS_CONFIG[proj.status] || { label: proj.status, color: "#94A3B8", bg: "rgba(255,255,255,0.1)" };
              const accent = proj.accentColor || "#00F5FF";

              return (
                <motion.div
                  key={proj.id}
                  variants={cardVariants}
                  custom={index}
                  layout
                  className="rounded-2xl border overflow-hidden flex flex-col relative group transition-all"
                  style={{
                    backgroundColor: isCyber ? "rgba(10,15,30,0.85)" : "#FFFFFF",
                    borderColor: isCyber ? `${accent}40` : "#000000",
                    borderWidth: isCyber ? "1px" : "2.5px",
                    boxShadow: isCyber
                      ? `0 0 18px ${accent}25, 0 0 40px ${accent}08`
                      : "4px 4px 0 #000000",
                  }}
                >
                  {/* Top Action Buttons (Edit + Delete) */}
                  <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProject(proj);
                        setIsEditorOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-black/70 text-white backdrop-blur-md hover:bg-black transition-colors cursor-pointer text-xs"
                      title="Edit Project"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(proj);
                      }}
                      className="p-1.5 rounded-lg bg-red-600/80 text-white backdrop-blur-md hover:bg-red-600 transition-colors cursor-pointer text-xs"
                      title="Delete Project"
                    >
                      🗑️
                    </button>
                  </div>

                  {/* Hero Banner Preview (if configured) */}
                  {proj.heroBanner && (
                    <div
                      onClick={() => setLightboxImage(proj.heroBanner || null)}
                      className="relative aspect-video w-full overflow-hidden bg-black/40 cursor-pointer group/img border-b border-white/10 max-h-48"
                    >
                      <img
                        src={proj.heroBanner}
                        alt={proj.name}
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center font-bold text-white text-xs gap-1.5">
                        <span>🔍 Preview Screenshot</span>
                      </div>
                    </div>
                  )}

                  {/* Card Content Header */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      {/* Logo, Name & Version Header */}
                      <div className="flex items-start gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 font-bold overflow-hidden border shadow-sm"
                          style={{
                            backgroundColor: `${accent}20`,
                            color: accent,
                            borderColor: isCyber ? accent : "#000",
                            borderWidth: isCyber ? "1px" : "2px",
                          }}
                        >
                          {proj.logo ? (
                            proj.logo.startsWith("http") || proj.logo.startsWith("/") || proj.logo.startsWith("data:") ? (
                              <img src={proj.logo} alt={proj.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{proj.logo}</span>
                            )
                          ) : (
                            <span>🌐</span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1 pr-6">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-black text-base theme-text-primary leading-tight truncate">
                              {proj.name}
                            </h3>
                            {proj.isFeatured && (
                              <span className="text-amber-400 text-xs shrink-0" title="Featured Showcase">⭐</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px] font-mono">
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
                            {proj.version && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] theme-text-muted bg-black/10 dark:bg-white/10 font-bold">
                                {proj.version}
                              </span>
                            )}
                            <span className="theme-text-muted">{proj.category}</span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs theme-text-secondary leading-relaxed line-clamp-3">
                        {proj.description}
                      </p>

                      {/* Tech Stack Pills */}
                      {proj.techStack && proj.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {proj.techStack.map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-0.5 rounded text-[10px] font-mono font-bold border"
                              style={{
                                backgroundColor: isCyber ? "rgba(0,245,255,0.06)" : "#F1F5F9",
                                color: isCyber ? "#00F5FF" : "#334155",
                                borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#CBD5E1",
                              }}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Tags */}
                      {proj.tags && proj.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 text-[10px] font-mono theme-text-muted pt-0.5">
                          {proj.tags.map((tag) => (
                            <span key={tag}>#{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick Action Link Buttons */}
                    <div className="pt-3 border-t border-white/10 space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        {isValidUrl(proj.websiteUrl) && (
                          <a
                            href={proj.websiteUrl}
                            target={proj.websiteUrl?.startsWith("/") ? "_self" : "_blank"}
                            rel="noopener noreferrer"
                            className="flex-1 py-1.5 px-3 rounded-xl font-extrabold text-xs text-center transition-all active:scale-95 cursor-pointer block"
                            style={{
                              backgroundColor: isCyber ? `${accent}20` : accent,
                              color: isCyber ? accent : "#FFFFFF",
                              border: isCyber ? `1px solid ${accent}` : "2px solid #000",
                              boxShadow: isCyber ? `0 0 10px ${accent}30` : "2px 2px 0 #000",
                            }}
                          >
                            Visit Website ↗
                          </a>
                        )}

                        {isValidUrl(proj.githubUrl) && (
                          <a
                            href={proj.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1.5 px-3 rounded-xl font-bold text-xs text-center transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                            style={{
                              backgroundColor: isCyber ? "rgba(255,255,255,0.08)" : "#181717",
                              color: "#FFFFFF",
                              border: isCyber ? "1px solid rgba(255,255,255,0.2)" : "2px solid #000",
                              boxShadow: isCyber ? "none" : "2px 2px 0 #000",
                            }}
                          >
                            <span>🐙</span> GitHub
                          </a>
                        )}

                        {isValidUrl(proj.docsUrl) && (
                          <a
                            href={proj.docsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1.5 px-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                            style={{
                              backgroundColor: isCyber ? "rgba(0,245,255,0.1)" : "#E0F2FE",
                              color: isCyber ? "#00F5FF" : "#0369A1",
                              border: isCyber ? "1px solid rgba(0,245,255,0.25)" : "2px solid #000",
                            }}
                          >
                            <span>📖</span> Docs
                          </a>
                        )}

                        {isValidUrl(proj.figmaUrl) && (
                          <a
                            href={proj.figmaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1.5 px-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                            style={{
                              backgroundColor: isCyber ? "rgba(236,72,153,0.1)" : "#FCE7F3",
                              color: isCyber ? "#EC4899" : "#BE185D",
                              border: isCyber ? "1px solid rgba(236,72,153,0.25)" : "2px solid #000",
                            }}
                          >
                            <span>🎨</span> Figma
                          </a>
                        )}

                        {isValidUrl(proj.adminUrl) && (
                          <a
                            href={proj.adminUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1.5 px-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                            style={{
                              backgroundColor: isCyber ? "rgba(245,158,11,0.1)" : "#FEF3C7",
                              color: isCyber ? "#F59E0B" : "#B45309",
                              border: isCyber ? "1px solid rgba(245,158,11,0.25)" : "2px solid #000",
                            }}
                          >
                            <span>⚙️</span> Admin
                          </a>
                        )}

                        {isValidUrl(proj.stagingUrl) && (
                          <a
                            href={proj.stagingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1.5 px-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                            style={{
                              backgroundColor: isCyber ? "rgba(139,92,246,0.1)" : "#EDE9FE",
                              color: isCyber ? "#8B5CF6" : "#6D28D9",
                              border: isCyber ? "1px solid rgba(139,92,246,0.25)" : "2px solid #000",
                            }}
                          >
                            <span>🧪</span> Staging
                          </a>
                        )}

                        {isValidUrl(proj.downloadUrl) && (
                          <a
                            href={proj.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1.5 px-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                            style={{
                              backgroundColor: isCyber ? "rgba(16,185,129,0.1)" : "#D1FAE5",
                              color: isCyber ? "#10B981" : "#047857",
                              border: isCyber ? "1px solid rgba(16,185,129,0.25)" : "2px solid #000",
                            }}
                          >
                            <span>📥</span> Download
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
        <ProjectEditorModal
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingProject(null);
          }}
          projectToEdit={editingProject}
        />

        <ImageLightboxModal
          isOpen={!!lightboxImage}
          onClose={() => setLightboxImage(null)}
          imageUrl={lightboxImage || ""}
          title="Project Preview Screenshot"
        />
      </motion.div>
    </AppShell>
  );
}
