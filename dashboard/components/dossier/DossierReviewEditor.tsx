"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { ThemeAccentConfig } from "./DossierThemeAccent";
import { FileText, Eye, EyeOff, Save, Check } from "lucide-react";

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

  const defaultReview =
    reviewMarkdown ||
    `### 🌟 Personal Reflection

*Moving* (2023) is undoubtedly one of the most emotional, thrilling, and beautifully crafted K-Dramas ever produced. The way it weaves supernatural superhero abilities with deep family ties and sacrifices makes every episode hits right in the heart.

> "A superhero isn't someone who flies high, but someone who knows how to hold on when falling."

#### Highlights:
1. **Pacing & Character Arcs**: Dividing the story into student years -> parent backstories -> final school showdown was brilliant.
2. **Action Choreography**: Combat choreography for Ju-won and Frank felt raw and grounded.
3. **Soundtrack & Atmosphere**: The emotional score elevated every key scene.`;

  const [text, setText] = useState(defaultReview);
  const [isEditing, setIsEditing] = useState(false);
  const [hideSpoilers, setHideSpoilers] = useState(true);

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
          >
            {hideSpoilers ? <EyeOff size={13} /> : <Eye size={13} />}
            <span>{hideSpoilers ? "Hide Spoilers" : "Show Spoilers"}</span>
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
            placeholder="Write your markdown review here..."
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
      ) : (
        <div
          className={`p-4 rounded-xl border leading-relaxed text-sm whitespace-pre-line ${
            hideSpoilers ? "blur-none" : ""
          }`}
          style={{
            backgroundColor: isCyber ? "rgba(5,8,22,0.6)" : "#FFF5E4",
            borderColor: isCyber ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.15)",
            color: isCyber ? "#CBD5E1" : "#334155",
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
}
