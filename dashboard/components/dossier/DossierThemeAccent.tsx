"use client";

import React from "react";
import { motion } from "framer-motion";

export type DossierThemePreset =
  | "korean-romance"
  | "korean-thriller"
  | "korean-historical"
  | "chinese-xianxia"
  | "chinese-wuxia"
  | "japanese-anime"
  | "hollywood"
  | "fantasy"
  | "horror"
  | "default";

export interface ThemeAccentConfig {
  preset: DossierThemePreset;
  primaryAccent: string;
  secondaryAccent: string;
  glowColor: string;
  bgGradient: string;
  ambientType: "pink-petals" | "crimson-rain" | "gold-dust" | "jade-clouds" | "ink-bamboo" | "sakura" | "silver-cyber" | "magical-sparkles" | "dark-fog" | "none";
}

const PRESET_MAP: Record<DossierThemePreset, Omit<ThemeAccentConfig, "preset">> = {
  "korean-romance": {
    primaryAccent: "#EC4899",
    secondaryAccent: "#F472B6",
    glowColor: "rgba(236,72,153,0.4)",
    bgGradient: "linear-gradient(135deg, rgba(236,72,153,0.15), rgba(244,114,182,0.05))",
    ambientType: "pink-petals",
  },
  "korean-thriller": {
    primaryAccent: "#DC2626",
    secondaryAccent: "#991B1B",
    glowColor: "rgba(220,38,38,0.45)",
    bgGradient: "linear-gradient(135deg, rgba(153,27,27,0.2), rgba(0,0,0,0.4))",
    ambientType: "crimson-rain",
  },
  "korean-historical": {
    primaryAccent: "#D97706",
    secondaryAccent: "#B45309",
    glowColor: "rgba(217,119,6,0.4)",
    bgGradient: "linear-gradient(135deg, rgba(217,119,6,0.15), rgba(180,83,9,0.05))",
    ambientType: "gold-dust",
  },
  "chinese-xianxia": {
    primaryAccent: "#10B981",
    secondaryAccent: "#059669",
    glowColor: "rgba(16,185,129,0.4)",
    bgGradient: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.05))",
    ambientType: "jade-clouds",
  },
  "chinese-wuxia": {
    primaryAccent: "#047857",
    secondaryAccent: "#064E3B",
    glowColor: "rgba(4,120,87,0.4)",
    bgGradient: "linear-gradient(135deg, rgba(4,120,87,0.18), rgba(6,78,59,0.08))",
    ambientType: "ink-bamboo",
  },
  "japanese-anime": {
    primaryAccent: "#A855F7",
    secondaryAccent: "#06B6D4",
    glowColor: "rgba(168,85,247,0.45)",
    bgGradient: "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(6,182,212,0.08))",
    ambientType: "sakura",
  },
  "hollywood": {
    primaryAccent: "#3B82F6",
    secondaryAccent: "#6366F1",
    glowColor: "rgba(59,130,246,0.4)",
    bgGradient: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.05))",
    ambientType: "silver-cyber",
  },
  "fantasy": {
    primaryAccent: "#F59E0B",
    secondaryAccent: "#8B5CF6",
    glowColor: "rgba(245,158,11,0.45)",
    bgGradient: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(139,92,246,0.1))",
    ambientType: "magical-sparkles",
  },
  "horror": {
    primaryAccent: "#4B5563",
    secondaryAccent: "#111827",
    glowColor: "rgba(75,85,99,0.4)",
    bgGradient: "linear-gradient(135deg, rgba(31,41,55,0.3), rgba(17,24,39,0.6))",
    ambientType: "dark-fog",
  },
  "default": {
    primaryAccent: "#00F5FF",
    secondaryAccent: "#BF5FFF",
    glowColor: "rgba(0,245,255,0.35)",
    bgGradient: "linear-gradient(135deg, rgba(0,245,255,0.12), rgba(191,95,255,0.05))",
    ambientType: "none",
  },
};

export function resolveDossierTheme(country?: string, genre?: string): ThemeAccentConfig {
  const g = (genre || "").toLowerCase();
  const c = (country || "").toLowerCase();

  if (c === "korean") {
    if (g.includes("romance") || g.includes("love") || g.includes("comedy")) return { preset: "korean-romance", ...PRESET_MAP["korean-romance"] };
    if (g.includes("thriller") || g.includes("action") || g.includes("crime") || g.includes("mystery") || g.includes("zombie")) return { preset: "korean-thriller", ...PRESET_MAP["korean-thriller"] };
    if (g.includes("historical") || g.includes("period") || g.includes("sageuk")) return { preset: "korean-historical", ...PRESET_MAP["korean-historical"] };
    return { preset: "korean-romance", ...PRESET_MAP["korean-romance"] };
  }

  if (c === "chinese") {
    if (g.includes("xianxia") || g.includes("fantasy") || g.includes("magic")) return { preset: "chinese-xianxia", ...PRESET_MAP["chinese-xianxia"] };
    if (g.includes("wuxia") || g.includes("martial") || g.includes("sword")) return { preset: "chinese-wuxia", ...PRESET_MAP["chinese-wuxia"] };
    return { preset: "chinese-xianxia", ...PRESET_MAP["chinese-xianxia"] };
  }

  if (c === "anime" || c === "japanese") {
    return { preset: "japanese-anime", ...PRESET_MAP["japanese-anime"] };
  }

  if (c === "hollywood") {
    if (g.includes("sci-fi") || g.includes("action")) return { preset: "hollywood", ...PRESET_MAP["hollywood"] };
    if (g.includes("horror")) return { preset: "horror", ...PRESET_MAP["horror"] };
    return { preset: "hollywood", ...PRESET_MAP["hollywood"] };
  }

  if (g.includes("fantasy")) return { preset: "fantasy", ...PRESET_MAP["fantasy"] };
  if (g.includes("horror")) return { preset: "horror", ...PRESET_MAP["horror"] };

  return { preset: "default", ...PRESET_MAP["default"] };
}

export function DossierAmbientParticles({ config }: { config: ThemeAccentConfig }) {
  if (config.ambientType === "none") return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-[1px]"
          style={{
            width: (i % 3) * 3 + 4,
            height: (i % 3) * 3 + 4,
            backgroundColor: config.primaryAccent,
            left: `${(i * 8.3) % 100}%`,
            top: `${(i * 12) % 100}%`,
            opacity: 0.25,
          }}
          animate={{
            y: [-10, 20, -10],
            x: [-5, 10, -5],
            opacity: [0.15, 0.4, 0.15],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 4 + (i % 4),
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
}
