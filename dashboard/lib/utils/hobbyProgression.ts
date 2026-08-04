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
