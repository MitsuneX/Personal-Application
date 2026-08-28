/**
 * Utility functions for Hobby & Notepad Progression System ("A museum that records my curiosity")
 */

/**
 * Calculates cumulative XP required to reach a given Level.
 * Level 1 = 0 XP
 * Level 2 = 100 XP
 * Level 3 = 250 XP
 * Level 4 = 450 XP
 * Level 5 = 700 XP
 * Formula: XP(L) = 25 * (L - 1) * (L + 2)
 */
export function getXpForLevel(level: number): number {
  if (level <= 1) return 0;
  return 25 * (level - 1) * (level + 2);
}

/**
 * Derives current Level and progress percentage from total accumulated XP.
 */
export function getLevelDetailsFromXp(totalXp: number): {
  level: number;
  currentLevelBaseXp: number;
  nextLevelReqXp: number;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
  progressPercent: number;
} {
  let level = 1;
  while (totalXp >= getXpForLevel(level + 1)) {
    level++;
  }

  const currentLevelBaseXp = getXpForLevel(level);
  const nextLevelReqXp = getXpForLevel(level + 1);
  const xpInCurrentLevel = Math.max(0, totalXp - currentLevelBaseXp);
  const xpNeededForNextLevel = Math.max(1, nextLevelReqXp - currentLevelBaseXp);
  const progressPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNextLevel) * 100));

  return {
    level,
    currentLevelBaseXp,
    nextLevelReqXp,
    xpInCurrentLevel: Math.round(xpInCurrentLevel * 10) / 10,
    xpNeededForNextLevel: Math.round(xpNeededForNextLevel * 10) / 10,
    progressPercent: Math.round(progressPercent * 10) / 10,
  };
}

/**
 * Calculates XP earned from writing words in linked notes.
 * Formula: 0.02 XP per word.
 */
export function calculateWritingXp(wordCount: number): number {
  return Math.round(wordCount * 0.02 * 100) / 100;
}

/**
 * Calculates XP earned from a study session.
 * Formula: Base 5 XP + 0.25 XP per minute learned.
 */
export function calculateSessionXp(minutesLearned: number): number {
  const base = 5.0;
  const minuteXp = minutesLearned * 0.25;
  return Math.round((base + minuteXp) * 100) / 100;
}

/**
 * Returns a human-friendly relative date label ("Today", "Yesterday", "X days ago", "Never").
 */
export function formatLastLearned(dateInput?: string | Date | null): string {
  if (!dateInput) return "Never";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "Never";

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const dateStr = date.toISOString().slice(0, 10);

  if (dateStr === todayStr) return "Today";

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (dateStr === yesterday.toISOString().slice(0, 10)) return "Yesterday";

  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

export interface CategoryTheme {
  cyber: string;
  brutal: string;
  glow: string;
  icon: string;
}

export const KNOWN_CATEGORY_THEMES: Record<string, CategoryTheme> = {
  "Languages":    { cyber: "#00F5FF", brutal: "#FF6B35", glow: "#00F5FF", icon: "🗣️" },
  "Doctors":      { cyber: "#A855F7", brutal: "#FFD166", glow: "#A855F7", icon: "🧠" },
  "Martial Arts": { cyber: "#10B981", brutal: "#06D6A0", glow: "#10B981", icon: "🥊" },
  "Art":          { cyber: "#EC4899", brutal: "#F72585", glow: "#EC4899", icon: "🎨" },
  "Music":        { cyber: "#8B5CF6", brutal: "#7209B7", glow: "#8B5CF6", icon: "🎵" },
  "Development":  { cyber: "#3B82F6", brutal: "#4361EE", glow: "#3B82F6", icon: "💻" },
  "Programming":  { cyber: "#3B82F6", brutal: "#4361EE", glow: "#3B82F6", icon: "💻" },
  "Creative":     { cyber: "#F59E0B", brutal: "#FF9F1C", glow: "#F59E0B", icon: "✨" },
  "Science":      { cyber: "#14B8A6", brutal: "#2EC4B6", glow: "#14B8A6", icon: "🔬" },
  "Fitness":      { cyber: "#EF4444", brutal: "#E63946", glow: "#EF4444", icon: "⚡" },
  "Philosophy":   { cyber: "#6366F1", brutal: "#795290", glow: "#6366F1", icon: "📜" },
};

const DYNAMIC_PALETTES: CategoryTheme[] = [
  { cyber: "#00F5FF", brutal: "#FF6B35", glow: "#00F5FF", icon: "🎯" },
  { cyber: "#A855F7", brutal: "#FFD166", glow: "#A855F7", icon: "🔮" },
  { cyber: "#10B981", brutal: "#06D6A0", glow: "#10B981", icon: "🌿" },
  { cyber: "#EC4899", brutal: "#F72585", glow: "#EC4899", icon: "🎨" },
  { cyber: "#F59E0B", brutal: "#FF9F1C", glow: "#F59E0B", icon: "⚡" },
  { cyber: "#3B82F6", brutal: "#4361EE", glow: "#3B82F6", icon: "💎" },
  { cyber: "#14B8A6", brutal: "#2EC4B6", glow: "#14B8A6", icon: "🌟" },
  { cyber: "#8B5CF6", brutal: "#7209B7", glow: "#8B5CF6", icon: "🌌" },
  { cyber: "#F43F5E", brutal: "#E63946", glow: "#F43F5E", icon: "🔥" },
  { cyber: "#06B6D4", brutal: "#118AB2", glow: "#06B6D4", icon: "🌊" },
];

/**
 * Returns dynamic theme styling (colors, glow, and icon) for any category string.
 */
export function getCategoryTheme(category: string): CategoryTheme {
  if (!category || typeof category !== "string") {
    return DYNAMIC_PALETTES[0];
  }
  const trimmed = category.trim();
  if (KNOWN_CATEGORY_THEMES[trimmed]) {
    return KNOWN_CATEGORY_THEMES[trimmed];
  }
  let hash = 0;
  for (let i = 0; i < trimmed.length; i++) {
    hash = (hash << 5) - hash + trimmed.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % DYNAMIC_PALETTES.length;
  return DYNAMIC_PALETTES[idx];
}

export interface HobbyCategoryAggregate {
  key: string;              // normalized comparison key e.g. "art"
  label: string;            // preferred display label e.g. "Art"
  skills: any[];            // collection of skills belonging to category
  skillCount: number;
  totalXp: number;
  averageProgress: number;  // 0 - 100
  totalMinutes: number;
  percentage: number;       // share of total skills
  theme: CategoryTheme;
  color: string;
}

/**
 * Normalizes category name for internal comparison.
 */
export function normalizeCategoryKey(category: string): string {
  return (category || "").trim().toLowerCase();
}

/**
 * Single Canonical Category Aggregator for Hobbies.
 * Extracts, normalizes, and computes aggregated metrics across all active skills.
 */
export function aggregateHobbyCategories(skills: any[], isCyber: boolean): HobbyCategoryAggregate[] {
  if (!Array.isArray(skills) || skills.length === 0) return [];

  const map = new Map<string, { label: string; skills: any[] }>();

  skills.forEach((skill) => {
    const rawCategory = skill?.category;
    if (!rawCategory || typeof rawCategory !== "string" || !rawCategory.trim()) return;
    const key = normalizeCategoryKey(rawCategory);
    if (!map.has(key)) {
      map.set(key, { label: rawCategory.trim(), skills: [] });
    }
    map.get(key)!.skills.push(skill);
  });

  const totalSkillCount = skills.length;
  const results: HobbyCategoryAggregate[] = [];

  map.forEach(({ label, skills: catSkills }, key) => {
    const count = catSkills.length;
    const totalXp = catSkills.reduce((sum, s) => sum + (Number(s.xp) || 0), 0);
    const totalMinutes = catSkills.reduce((sum, s) => sum + (Number(s.totalMinutes) || 0), 0);
    const rawProgressSum = catSkills.reduce((sum, s) => sum + (Number(s.progress) || 0), 0);
    const averageProgress = count > 0 ? rawProgressSum / count : 0;
    const theme = getCategoryTheme(label);
    const color = isCyber ? theme.cyber : theme.brutal;

    results.push({
      key,
      label,
      skills: catSkills,
      skillCount: count,
      totalXp: Math.round(totalXp * 10) / 10,
      averageProgress: Math.round(averageProgress * 100) / 100,
      totalMinutes,
      percentage: totalSkillCount > 0 ? Math.round((count / totalSkillCount) * 1000) / 10 : 0,
      theme,
      color,
    });
  });

  return results;
}
