import React from "react";
import {
  Gamepad2,
  Users,
  Trophy,
  Music,
  Film,
  Bot,
  Palette,
  AlertTriangle,
  BookOpen,
  Zap,
} from "lucide-react";

export type LandingModuleIconKey =
  | "Gamepad2"
  | "Users"
  | "Trophy"
  | "Music"
  | "Film"
  | "Bot"
  | "Palette"
  | "AlertTriangle"
  | "BookOpen"
  | "Zap";

export interface LandingModuleDefinition {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: LandingModuleIconKey;
  iconEmoji: string;
  route: string;
  tags: string[];
  gradient: string;
  category: "Gaming" | "Showcase" | "Audio" | "Media" | "AI & Tools" | "Creative" | "System" | "Archive";
  defaultEnabled: boolean;
  sortOrder: number;
}

export const LANDING_MODULE_CATALOG: LandingModuleDefinition[] = [
  {
    id: "game-database",
    title: "Game Database",
    subtitle: "Active Game Records & Ranks",
    description: "Track gaming accounts, active ranks, main roles, and platform profiles across PC, console, and mobile.",
    iconName: "Gamepad2",
    iconEmoji: "🎮",
    route: "/games",
    tags: ["Ranks", "Platforms", "Mains"],
    gradient: "from-cyan-500/20 to-blue-500/20",
    category: "Gaming",
    defaultEnabled: true,
    sortOrder: 1,
  },
  {
    id: "game-characters",
    title: "Game Characters",
    subtitle: "Waifu & Hero Roster",
    description: "Curated collection of favorite game characters with detailed stats, combat profiles, and splash art.",
    iconName: "Users",
    iconEmoji: "⭐",
    route: "/game-characters",
    tags: ["Waifus", "Combat Stats", "Splash Art"],
    gradient: "from-pink-500/20 to-rose-500/20",
    category: "Gaming",
    defaultEnabled: true,
    sortOrder: 2,
  },
  {
    id: "hall-of-fame",
    title: "Hall of Fame",
    subtitle: "Championship Legacy & Records",
    description: "Real-time records, GOAT milestones, achievements, and museum analytics celebrating legendary accomplishments.",
    iconName: "Trophy",
    iconEmoji: "🏆",
    route: "/hall-of-fame",
    tags: ["GOAT", "Achievements", "Analytics"],
    gradient: "from-amber-500/20 to-yellow-500/20",
    category: "Showcase",
    defaultEnabled: true,
    sortOrder: 3,
  },
  {
    id: "music",
    title: "Music Vault",
    subtitle: "Audio Engine & Synced Lyrics",
    description: "Global audio engine with playlist queues, synced lyrics display, soundboards, and ambient listening tools.",
    iconName: "Music",
    iconEmoji: "🎵",
    route: "/music",
    tags: ["Audio Engine", "Synced Lyrics", "Playlists"],
    gradient: "from-purple-500/20 to-indigo-500/20",
    category: "Audio",
    defaultEnabled: true,
    sortOrder: 4,
  },
  {
    id: "media",
    title: "Drama, Anime & Tokusatsu",
    subtitle: "Comprehensive Media Dossiers",
    description: "Tracking engine for East Asian dramas, anime seasons, tokusatsu, episode logs, radar charts, and OST tracks.",
    iconName: "Film",
    iconEmoji: "🎬",
    route: "/drama",
    tags: ["Drama Logs", "Anime Zone", "Tokusatsu"],
    gradient: "from-emerald-500/20 to-teal-500/20",
    category: "Media",
    defaultEnabled: true,
    sortOrder: 5,
  },
  {
    id: "ai-library",
    title: "AI Prompt Library",
    subtitle: "Prompt Vault & Tools",
    description: "Organized repository of AI generation prompts, system instructions, model tools, and workflows.",
    iconName: "Bot",
    iconEmoji: "🤖",
    route: "/ai-library",
    tags: ["Prompts", "Workflows", "Models"],
    gradient: "from-violet-500/20 to-purple-500/20",
    category: "AI & Tools",
    defaultEnabled: true,
    sortOrder: 6,
  },
  {
    id: "hobbies",
    title: "Hobbies & Creative Log",
    subtitle: "Personal Projects & Interests",
    description: "Creative hobby tracker documenting coding projects, art, music production, and personal side quests.",
    iconName: "Palette",
    iconEmoji: "🎯",
    route: "/hobbies",
    tags: ["Projects", "Creative", "Side Quests"],
    gradient: "from-orange-500/20 to-amber-500/20",
    category: "Creative",
    defaultEnabled: true,
    sortOrder: 7,
  },
  {
    id: "emergency",
    title: "Emergency Hub",
    subtitle: "Quick Actions & Protocols",
    description: "Instant access emergency protocol triggers, essential quick links, and system fallback routines.",
    iconName: "AlertTriangle",
    iconEmoji: "🚨",
    route: "/emergency",
    tags: ["Protocols", "Quick Links", "System"],
    gradient: "from-red-500/20 to-pink-500/20",
    category: "System",
    defaultEnabled: true,
    sortOrder: 8,
  },
  {
    id: "characters",
    title: "Character Dictionary",
    subtitle: "Master Identity Registry",
    description: "Universal character dictionary indexing canonical identities across games, anime, VTubers, and lore.",
    iconName: "BookOpen",
    iconEmoji: "📖",
    route: "/characters",
    tags: ["Universal", "Profiles", "Lore"],
    gradient: "from-blue-500/20 to-cyan-500/20",
    category: "Archive",
    defaultEnabled: false,
    sortOrder: 9,
  },
  {
    id: "prompt-vault",
    title: "Prompt Vault",
    subtitle: "System Personas & Directives",
    description: "Specialized prompt engineering vault storing advanced prompts, roleplay matrix instructions, and templates.",
    iconName: "Zap",
    iconEmoji: "⚡",
    route: "/prompt-vault",
    tags: ["Personas", "Templates", "Matrix"],
    gradient: "from-yellow-500/20 to-amber-500/20",
    category: "AI & Tools",
    defaultEnabled: false,
    sortOrder: 10,
  },
];

export function renderLandingModuleIcon(iconName: LandingModuleIconKey, size = 24) {
  switch (iconName) {
    case "Gamepad2":
      return <Gamepad2 size={size} />;
    case "Users":
      return <Users size={size} />;
    case "Trophy":
      return <Trophy size={size} />;
    case "Music":
      return <Music size={size} />;
    case "Film":
      return <Film size={size} />;
    case "Bot":
      return <Bot size={size} />;
    case "Palette":
      return <Palette size={size} />;
    case "AlertTriangle":
      return <AlertTriangle size={size} />;
    case "BookOpen":
      return <BookOpen size={size} />;
    case "Zap":
      return <Zap size={size} />;
    default:
      return <Gamepad2 size={size} />;
  }
}

export function getVisibleLandingModules(allowlist?: string[]): LandingModuleDefinition[] {
  if (!allowlist || allowlist.length === 0) {
    return LANDING_MODULE_CATALOG.filter((m) => m.defaultEnabled);
  }
  return LANDING_MODULE_CATALOG.filter((m) => allowlist.includes(m.id)).sort((a, b) => a.sortOrder - b.sortOrder);
}
