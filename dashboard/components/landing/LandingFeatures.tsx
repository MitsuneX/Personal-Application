"use client";

import React from "react";
import { motion } from "framer-motion";
import { Gamepad2, Users, Trophy, Music, Film, Bot, Palette, AlertTriangle } from "lucide-react";

interface FeatureDefinition {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  tags: string[];
  gradient: string;
}

const FEATURE_CATALOG: FeatureDefinition[] = [
  {
    id: "game-database",
    title: "Game Database",
    subtitle: "Active Game Records & Ranks",
    description: "Track gaming accounts, active ranks, main roles, and platform profiles across PC, console, and mobile.",
    icon: <Gamepad2 size={24} />,
    tags: ["Ranks", "Platforms", "Mains"],
    gradient: "from-cyan-500/20 to-blue-500/20",
  },
  {
    id: "game-characters",
    title: "Game Characters",
    subtitle: "Waifu & Hero Roster",
    description: "Curated collection of favorite game characters with detailed stats, combat profiles, and splash art.",
    icon: <Users size={24} />,
    tags: ["Waifus", "Combat Stats", "Splash Art"],
    gradient: "from-pink-500/20 to-rose-500/20",
  },
  {
    id: "hall-of-fame",
    title: "Hall of Fame",
    subtitle: "Championship Legacy & Records",
    description: "Real-time records, GOAT milestones, achievements, and museum analytics celebrating legendary accomplishments.",
    icon: <Trophy size={24} />,
    tags: ["GOAT", "Achievements", "Analytics"],
    gradient: "from-amber-500/20 to-yellow-500/20",
  },
  {
    id: "music",
    title: "Music Vault",
    subtitle: "Audio Engine & Synced Lyrics",
    description: "Global audio engine with playlist queues, synced lyrics display, soundboards, and ambient listening tools.",
    icon: <Music size={24} />,
    tags: ["Audio Engine", "Synced Lyrics", "Playlists"],
    gradient: "from-purple-500/20 to-indigo-500/20",
  },
  {
    id: "media",
    title: "Drama, Anime & Tokusatsu",
    subtitle: "Comprehensive Media Dossiers",
    description: "Tracking engine for East Asian dramas, anime seasons, tokusatsu, episode logs, radar charts, and OST tracks.",
    icon: <Film size={24} />,
    tags: ["Drama Logs", "Anime Zone", "Tokusatsu"],
    gradient: "from-emerald-500/20 to-teal-500/20",
  },
  {
    id: "ai-library",
    title: "AI Prompt Library",
    subtitle: "Prompt Vault & Tools",
    description: "Organized repository of AI generation prompts, system instructions, model tools, and workflows.",
    icon: <Bot size={24} />,
    tags: ["Prompts", "Workflows", "Models"],
    gradient: "from-violet-500/20 to-purple-500/20",
  },
  {
    id: "hobbies",
    title: "Hobbies & Creative Log",
    subtitle: "Personal Projects & Interests",
    description: "Creative hobby tracker documenting coding projects, art, music production, and personal side quests.",
    icon: <Palette size={24} />,
    tags: ["Projects", "Creative", "Side Quests"],
    gradient: "from-orange-500/20 to-amber-500/20",
  },
  {
    id: "emergency",
    title: "Emergency Hub",
    subtitle: "Quick Actions & Protocols",
    description: "Instant access emergency protocol triggers, essential quick links, and system fallback routines.",
    icon: <AlertTriangle size={24} />,
    tags: ["Protocols", "Quick Links", "System"],
    gradient: "from-red-500/20 to-pink-500/20",
  },
];

interface LandingFeaturesProps {
  isCyber: boolean;
  visibleFeatures?: string[];
  accentColor?: string;
}

export function LandingFeatures({
  isCyber,
  visibleFeatures = [
    "game-database",
    "game-characters",
    "hall-of-fame",
    "music",
    "media",
    "ai-library",
    "hobbies",
    "emergency",
  ],
  accentColor = "#00F5FF",
}: LandingFeaturesProps) {
  // Filter catalog by visibleFeatures allowlist
  const activeFeatures = FEATURE_CATALOG.filter((f) => visibleFeatures.includes(f.id));

  return (
    <div id="explore" className="space-y-6 mb-12 select-none">
      {/* Section Header */}
      <div className="flex flex-col gap-1 text-center md:text-left">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
          // SYSTEM MODULES & ARCHIVE ENGINE
        </span>
        <h2
          className="text-2xl sm:text-3xl font-black tracking-tight"
          style={{
            color: isCyber ? "#E0E8FF" : "#000000",
            fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
          }}
        >
          Explore What This World Contains
        </h2>
      </div>

      {/* Grid of Feature Showcase Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {activeFeatures.map((feat, idx) => (
          <motion.div
            key={feat.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            whileHover={{ y: -4 }}
            className="p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all"
            style={{
              backgroundColor: isCyber ? "rgba(10,15,36,0.6)" : "#FFFFFF",
              borderColor: isCyber ? "rgba(0,245,255,0.18)" : "#000000",
              borderWidth: isCyber ? "1px" : "2.5px",
              boxShadow: isCyber ? "0 0 20px rgba(0,245,255,0.04)" : "4px 4px 0 #000000",
            }}
          >
            <div className="space-y-3">
              {/* Header Icon & Subtitle */}
              <div className="flex items-center justify-between">
                <div
                  className="p-3 rounded-xl border flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: isCyber ? "rgba(0,245,255,0.08)" : "#FFE600",
                    borderColor: isCyber ? `${accentColor}40` : "#000000",
                    color: isCyber ? accentColor : "#000000",
                  }}
                >
                  {feat.icon}
                </div>
                <span className="text-[10px] font-mono font-bold opacity-50 uppercase">
                  MODULE {idx + 1}
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h3
                  className="text-base font-black tracking-tight"
                  style={{ color: isCyber ? "#E0E8FF" : "#000000" }}
                >
                  {feat.title}
                </h3>
                <p className="text-xs font-mono font-semibold opacity-60 mt-0.5">
                  {feat.subtitle}
                </p>
                <p className="text-xs leading-relaxed opacity-80 mt-2 font-mono">
                  {feat.description}
                </p>
              </div>
            </div>

            {/* Tag Badges */}
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-black/10 dark:border-white/10">
              {feat.tags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider border"
                  style={{
                    backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#F3F4F6",
                    borderColor: isCyber ? "rgba(255,255,255,0.12)" : "#000000",
                    color: isCyber ? "#94A3B8" : "#4B5563",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
