"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { ThemeAccentConfig } from "./DossierThemeAccent";
import { FileText, Eye, EyeOff, Save, Check, AlertTriangle } from "lucide-react";

export interface DossierReviewEditorProps {
  reviewMarkdown?: string;
  themeConfig: ThemeAccentConfig;
  onSaveReview?: (review: string) => void;
}

export function DossierReviewEditor({
  reviewMarkdown = "",
  themeConfig,
  onSaveReview,
}: DossierReviewEditorProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const [text, setText] = useState(reviewMarkdown);
  const [isEditing, setIsEditing] = useState(false);
  const [hideSpoilers, setHideSpoilers] = useState(true);

  useEffect(() => {
    setText(reviewMarkdown);
  }, [reviewMarkdown]);

  const handleSave = () => {
    onSaveReview?.(text);
    setIsEditing(false);
  };

  return (
    <div
      className="p-6 rounded-2xl mb-8 relative border overflow-hidden"
      style={{
        backgroundColor: isCyber ? "rgba(10,15,44,0.75)" : "#FFFFFF",
        borderColor: isCyber ? `${themeConfig.primaryAccent}30` : "#000000",
        boxShadow: isCyber
          ? `0 0 25px ${themeConfig.glowColor}, inset 0 0 20px rgba(0,245,255,0.02)`
          : "4px 4px 0px #000000",
      }}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <FileText size={20} style={{ color: themeConfig.primaryAccent }} />
          <h2
            className="text-lg font-black tracking-wide"
            style={{
              color: isCyber ? "#E0E8FF" : "#1A1A1A",
              fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
            }}
          >
            {isCyber ? "// PERSONAL REVIEW & CRITIQUE" : "Personal Review & Critique"}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setHideSpoilers(!hideSpoilers)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider cursor-pointer border opacity-80"
            style={{
              borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#CBD5E1",
              color: hideSpoilers ? (isCyber ? "#F59E0B" : "#D97706") : (isCyber ? "#00F5FF" : "#0284C7"),
            }}
          >
            {hideSpoilers ? <EyeOff size={13} /> : <Eye size={13} />}
            <span>{hideSpoilers ? "Spoilers Protected" : "Spoilers Revealed"}</span>
          </button>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider cursor-pointer border"
            style={{
              backgroundColor: isCyber ? "rgba(0,245,255,0.08)" : "#FFF",
              borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000",
              color: isCyber ? "#00F5FF" : "#000",
            }}
          >
            <Save size={13} />
            <span>{isEditing ? "Preview Review" : "Edit Review"}</span>
          </button>
        </div>
      </div>

      {/* Editor vs Markdown View */}
      {isEditing ? (
        <div className="flex flex-col gap-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-56 p-4 rounded-xl font-mono text-xs leading-relaxed border bg-black/10 dark:bg-white/5 outline-none resize-y"
            style={{ borderColor: themeConfig.primaryAccent }}
            placeholder="Write your review, analysis, and thoughts here..."
          />
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-mono font-bold text-white cursor-pointer"
              style={{ backgroundColor: themeConfig.primaryAccent }}
            >
              <Check size={14} />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      ) : text ? (
        <div className="relative rounded-xl overflow-hidden">
          <div
            className={`p-4 rounded-xl border leading-relaxed text-sm whitespace-pre-line transition-all duration-300 ${
              hideSpoilers ? "blur-md select-none pointer-events-none opacity-40" : "blur-0 opacity-100"
            }`}
            style={{
              backgroundColor: isCyber ? "rgba(5,8,22,0.6)" : "#FFF5E4",
              borderColor: isCyber ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.15)",
              color: isCyber ? "#CBD5E1" : "#334155",
            }}
          >
            {text}
          </div>

          {/* Spoiler Warning Overlay */}
          {hideSpoilers && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black/30 backdrop-blur-[2px] z-10">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-4 rounded-xl border text-center flex flex-col items-center max-w-sm"
                style={{
                  backgroundColor: isCyber ? "#050816" : "#FFFFFF",
                  borderColor: isCyber ? "#F59E0B" : "#D97706",
                  boxShadow: isCyber ? "0 0 20px rgba(245, 158, 11, 0.2)" : "4px 4px 0 #000",
                }}
              >
                <AlertTriangle size={24} className="text-yellow-400 mb-2" />
                <p className="text-xs font-mono font-black uppercase text-yellow-400 mb-1">
                  Spoiler Warning
                </p>
                <p className="text-[11px] theme-text-muted mb-3">
                  This review may contain major plot points and ending discussions.
                </p>
                <button
                  onClick={() => setHideSpoilers(false)}
                  className="px-4 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider cursor-pointer border transition-all"
                  style={{
                    backgroundColor: isCyber ? "rgba(245, 158, 11, 0.2)" : "#FEF3C7",
                    borderColor: isCyber ? "#F59E0B" : "#B45309",
                    color: isCyber ? "#F59E0B" : "#78350F",
                  }}
                >
                  Click to Reveal Review
                </button>
              </motion.div>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="p-8 rounded-xl border border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-colors opacity-70"
          style={{ borderColor: isCyber ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)" }}
        >
          <FileText size={32} className="mb-2 opacity-40" style={{ color: themeConfig.primaryAccent }} />
          <p className="text-xs font-mono font-bold uppercase">No personal review written yet</p>
          <p className="text-[11px] opacity-50 mt-1">Click &apos;Edit Review&apos; to write your thoughts, highlights, and quotes</p>
        </div>
      )}
    </div>
  );
}
