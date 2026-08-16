"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import { useTheme } from "@/lib/theme";
import { AiToolItemEntry, useDashboardStore } from "@/lib/store/dashboardStore";

interface AiToolDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool: AiToolItemEntry | null;
  onEdit: (tool: AiToolItemEntry) => void;
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
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week(s) ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
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

const STATUS_PILLS: Record<string, { label: string; color: string; bg: string }> = {
  Daily: { label: "🔥 Daily Use", color: "#10B981", bg: "rgba(16,185,129,0.15)" },
  Weekly: { label: "⚡ Weekly Use", color: "#00F5FF", bg: "rgba(0,245,255,0.15)" },
  Occasionally: { label: "🎯 Occasional", color: "#3B82F6", bg: "rgba(59,130,246,0.15)" },
  Rarely: { label: "🐢 Rarely", color: "#F97316", bg: "rgba(249,115,22,0.15)" },
  Experimental: { label: "🧪 Experimental", color: "#8B5CF6", bg: "rgba(139,92,246,0.15)" },
  Inactive: { label: "💤 Inactive", color: "#64748B", bg: "rgba(100,116,139,0.15)" },
  Archived: { label: "📦 Archived", color: "#64748B", bg: "rgba(100,116,139,0.15)" },
};

export function AiToolDetailModal({ isOpen, onClose, tool, onEdit }: AiToolDetailModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { recordAiToolLaunch } = useDashboardStore();

  if (!tool) return null;

  const accent = tool.accentColor || "#10A37F";
  const statusCfg = STATUS_PILLS[tool.usageStatus || "Daily"] || {
    label: tool.usageStatus || "Daily",
    color: "#94A3B8",
    bg: "rgba(255,255,255,0.1)",
  };
  const primaryLaunch = tool.launchUrl || tool.websiteUrl;

  const handleLaunch = () => {
    recordAiToolLaunch(tool.id);
    if (primaryLaunch) {
      window.open(primaryLaunch, primaryLaunch.startsWith("/") ? "_self" : "_blank");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
      <div className="overflow-y-auto overscroll-contain flex-1 p-5 sm:p-6 space-y-5 scrollbar-thin">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-start gap-3 min-w-0">
            {/* Logo */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 font-bold overflow-hidden border shadow-md"
              style={{
                backgroundColor: `${accent}20`,
                color: accent,
                borderColor: isCyber ? accent : "#000",
                borderWidth: isCyber ? "1px" : "2.5px",
                boxShadow: isCyber ? `0 0 20px ${accent}40` : "3px 3px 0 #000",
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
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black theme-text-primary leading-tight">
                  {tool.name}
                </h2>
                {tool.isFavorite && <span className="text-amber-400 text-sm" title="Favorite AI">⭐</span>}
                {tool.isPinned && <span className="text-cyan-400 text-sm" title="Pinned Platform">📌</span>}
              </div>

              <div className="flex items-center gap-2 mt-1 flex-wrap text-xs font-mono">
                <span className="font-bold theme-text-secondary">{tool.company || "Independent"}</span>
                {tool.version && (
                  <span className="px-1.5 py-0.5 rounded text-[11px] theme-text-muted bg-black/10 dark:bg-white/10 font-bold">
                    {tool.version}
                  </span>
                )}
                <span className="theme-text-muted font-medium">{tool.category}</span>
              </div>

              {/* Star Rating & Usage Status */}
              <div className="flex items-center gap-3 mt-2 flex-wrap text-xs font-mono">
                <div className="flex items-center gap-1 text-sm">{renderStars(tool.rating || 5)}</div>
                <span
                  className="px-2 py-0.5 rounded-md font-bold text-[11px]"
                  style={{
                    backgroundColor: statusCfg.bg,
                    color: statusCfg.color,
                    border: `1px solid ${statusCfg.color}40`,
                  }}
                >
                  {statusCfg.label}
                </span>
                {tool.pricingModel && (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold theme-text-muted border bg-black/5 dark:bg-white/5">
                    {tool.pricingModel}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-base font-bold opacity-60 hover:opacity-100 cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Primary Launch Fast Bar */}
        {primaryLaunch && (
          <button
            onClick={handleLaunch}
            className="w-full py-3 px-4 rounded-xl font-black text-sm text-center transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            style={{
              backgroundColor: accent,
              color: "#FFFFFF",
              border: isCyber ? "none" : "2.5px solid #000",
              boxShadow: isCyber ? `0 0 20px ${accent}60` : "4px 4px 0 #000",
            }}
          >
            <span>🚀</span> Launch {tool.name} ↗
          </button>
        )}

        {/* Description */}
        <div className="space-y-1">
          <h4 className="text-xs font-black uppercase tracking-wider theme-text-muted">Description</h4>
          <p className="text-xs sm:text-sm theme-text-secondary leading-relaxed">
            {tool.description}
          </p>
        </div>

        {/* Personal Strengths Tag Cloud */}
        {tool.strengths && tool.strengths.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-black uppercase tracking-wider theme-text-muted">
              💪 Key AI Strengths & Core Capabilities
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {tool.strengths.map((str) => (
                <span
                  key={str}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold border"
                  style={{
                    backgroundColor: isCyber ? `${accent}15` : "#F1F5F9",
                    color: isCyber ? accent : "#1E293B",
                    borderColor: isCyber ? `${accent}40` : "#CBD5E1",
                  }}
                >
                  ⚡ {str}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Personal Notes & Evaluation Block */}
        {tool.notes && (
          <div
            className="p-4 rounded-xl border space-y-1.5 relative overflow-hidden"
            style={{
              backgroundColor: isCyber ? `${accent}08` : "#F8FAFC",
              borderColor: isCyber ? `${accent}35` : "#CBD5E1",
              borderLeftWidth: "4px",
              borderLeftColor: accent,
            }}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5" style={{ color: accent }}>
                <span>📝</span> Personal Evaluation & Workflow Notes
              </h4>
              <span className="text-[10px] font-mono theme-text-muted">Personal Knowledge</span>
            </div>
            <p className="text-xs sm:text-sm theme-text-primary leading-relaxed whitespace-pre-wrap font-medium">
              {tool.notes}
            </p>
          </div>
        )}

        {/* Quick Insight Panel */}
        <div className="p-4 rounded-xl border space-y-2.5" style={{ borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#CBD5E1", backgroundColor: isCyber ? "rgba(0,245,255,0.02)" : "#FAFAFA" }}>
          <h4 className="text-xs font-black uppercase tracking-wider theme-text-primary flex items-center gap-1.5">
            <span>📊</span> Usage Insights & Analytics
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-white/5">
              <p className="text-[10px] font-mono theme-text-muted">Usage Frequency</p>
              <p className="text-xs font-bold mt-0.5" style={{ color: statusCfg.color }}>
                {statusCfg.label}
              </p>
            </div>

            <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-white/5">
              <p className="text-[10px] font-mono theme-text-muted">Last Used</p>
              <p className="text-xs font-bold mt-0.5 theme-text-primary">
                {formatRelativeTime(tool.lastUsed)}
              </p>
            </div>

            <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-white/5">
              <p className="text-[10px] font-mono theme-text-muted">Launch Counter</p>
              <p className="text-xs font-bold mt-0.5 theme-text-primary font-mono">
                {tool.launchCount || 0} times
              </p>
            </div>

            <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-white/5">
              <p className="text-[10px] font-mono theme-text-muted">Personal Rating</p>
              <p className="text-xs font-bold mt-0.5 text-amber-400 font-mono">
                {tool.rating || 5} / 5 Stars
              </p>
            </div>
          </div>
        </div>

        {/* Complete Resource Buttons Hub */}
        <div className="space-y-2 pt-1">
          <h4 className="text-xs font-black uppercase tracking-wider theme-text-muted">
            🌐 External Links & Developer Resources
          </h4>
          <div className="flex flex-wrap gap-2">
            {tool.websiteUrl && (
              <a
                href={tool.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                style={{
                  backgroundColor: isCyber ? "rgba(255,255,255,0.08)" : "#E2E8F0",
                  color: isCyber ? "#E2E8F0" : "#1E293B",
                  border: isCyber ? "1px solid rgba(255,255,255,0.2)" : "1.5px solid #000",
                }}
              >
                <span>🌐</span> Official Website
              </a>
            )}

            {tool.docsUrl && (
              <a
                href={tool.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                style={{
                  backgroundColor: isCyber ? "rgba(0,245,255,0.1)" : "#E0F2FE",
                  color: isCyber ? "#00F5FF" : "#0369A1",
                  border: isCyber ? "1px solid rgba(0,245,255,0.25)" : "1.5px solid #000",
                }}
              >
                <span>📖</span> Documentation
              </a>
            )}

            {tool.apiUrl && (
              <a
                href={tool.apiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                style={{
                  backgroundColor: isCyber ? "rgba(139,92,246,0.1)" : "#EDE9FE",
                  color: isCyber ? "#8B5CF6" : "#6D28D9",
                  border: isCyber ? "1px solid rgba(139,92,246,0.25)" : "1.5px solid #000",
                }}
              >
                <span>🔌</span> API Keys & Specs
              </a>
            )}

            {tool.pricingUrl && (
              <a
                href={tool.pricingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                style={{
                  backgroundColor: isCyber ? "rgba(245,158,11,0.1)" : "#FEF3C7",
                  color: isCyber ? "#F59E0B" : "#B45309",
                  border: isCyber ? "1px solid rgba(245,158,11,0.25)" : "1.5px solid #000",
                }}
              >
                <span>💰</span> Pricing Tiers
              </a>
            )}

            {tool.githubUrl && (
              <a
                href={tool.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                style={{
                  backgroundColor: isCyber ? "rgba(255,255,255,0.08)" : "#181717",
                  color: "#FFFFFF",
                  border: isCyber ? "1px solid rgba(255,255,255,0.2)" : "1.5px solid #000",
                }}
              >
                <span>🐙</span> GitHub Repository
              </a>
            )}

            {tool.discordUrl && (
              <a
                href={tool.discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                style={{
                  backgroundColor: isCyber ? "rgba(88,101,242,0.15)" : "#5865F2",
                  color: "#FFFFFF",
                  border: isCyber ? "1px solid rgba(88,101,242,0.3)" : "1.5px solid #000",
                }}
              >
                <span>💬</span> Discord Server
              </a>
            )}

            {tool.communityUrl && (
              <a
                href={tool.communityUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                style={{
                  backgroundColor: isCyber ? "rgba(16,185,129,0.1)" : "#D1FAE5",
                  color: isCyber ? "#10B981" : "#047857",
                  border: isCyber ? "1px solid rgba(16,185,129,0.25)" : "1.5px solid #000",
                }}
              >
                <span>👥</span> Community Forum
              </a>
            )}

            {tool.releaseNotesUrl && (
              <a
                href={tool.releaseNotesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                style={{
                  backgroundColor: isCyber ? "rgba(236,72,153,0.1)" : "#FCE7F3",
                  color: isCyber ? "#EC4899" : "#BE185D",
                  border: isCyber ? "1px solid rgba(236,72,153,0.25)" : "1.5px solid #000",
                }}
              >
                <span>📜</span> Release Notes
              </a>
            )}

            {tool.blogUrl && (
              <a
                href={tool.blogUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                style={{
                  backgroundColor: isCyber ? "rgba(245,158,11,0.1)" : "#FFFBEB",
                  color: isCyber ? "#F59E0B" : "#D97706",
                  border: isCyber ? "1px solid rgba(245,158,11,0.25)" : "1.5px solid #000",
                }}
              >
                <span>📰</span> Official Blog
              </a>
            )}

            {tool.roadmapUrl && (
              <a
                href={tool.roadmapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                style={{
                  backgroundColor: isCyber ? "rgba(59,130,246,0.1)" : "#EFF6FF",
                  color: isCyber ? "#3B82F6" : "#2563EB",
                  border: isCyber ? "1px solid rgba(59,130,246,0.25)" : "1.5px solid #000",
                }}
              >
                <span>🗺️</span> Product Roadmap
              </a>
            )}

            {tool.youtubeUrl && (
              <a
                href={tool.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                style={{
                  backgroundColor: isCyber ? "rgba(239,68,68,0.15)" : "#FF0000",
                  color: "#FFFFFF",
                  border: isCyber ? "1px solid rgba(239,68,68,0.3)" : "1.5px solid #000",
                }}
              >
                <span>▶️</span> YouTube Demos
              </a>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-white/10">
          <button
            onClick={() => {
              onClose();
              onEdit(tool);
            }}
            className="px-4 py-2 rounded-xl font-bold text-xs border theme-text-primary transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            style={{
              backgroundColor: isCyber ? "rgba(0,245,255,0.1)" : "#F1F5F9",
              borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000",
            }}
          >
            <span>✏️</span> Edit Entry
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer"
            style={{
              backgroundColor: isCyber ? "rgba(255,255,255,0.08)" : "#CBD5E1",
              color: isCyber ? "#E2E8F0" : "#0F172A",
              border: isCyber ? "1px solid rgba(255,255,255,0.15)" : "2px solid #000",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
