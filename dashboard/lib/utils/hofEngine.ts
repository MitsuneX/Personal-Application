import { HallOfFameEntry } from "@/lib/store/dashboardStore";

export interface HallBadge {
  id: string;
  label: string;
  icon: string;
  color: string;
  bg: string;
  description: string;
}

export interface HallRecord {
  title: string;
  holderName: string;
  holderImage?: string;
  value: string;
  metric: string;
  icon: string;
}

export interface HallAnalyticsSummary {
  totalLikes: number;
  avgLikes: number;
  topCountry: { name: string; count: number; flag: string };
  topCategory: { name: string; count: number };
  countryDistribution: { country: string; count: number; percentage: number }[];
  categoryDistribution: { category: string; count: number; percentage: number }[];
  statusDistribution: { status: string; count: number; percentage: number }[];
}

export interface HallActivityItem {
  id: string;
  timestamp: string;
  legendName: string;
  legendImage?: string;
  type: "champion" | "goat" | "vote" | "climb" | "addition";
  title: string;
  description: string;
}

// ── Badge Calculation Engine ───────────────────────────────────────────────────

export function getBadgesForEntry(entry: HallOfFameEntry, rankIndex?: number): HallBadge[] {
  const badges: HallBadge[] = [];

  // 1. Status Badges
  if (entry.status === "GOAT Status") {
    badges.push({
      id: "goat",
      label: "GOAT Status",
      icon: "👑",
      color: "#FFD700",
      bg: "rgba(255, 215, 0, 0.15)",
      description: "Greatest Of All Time across the entire Hall database.",
    });
  }

  if (entry.isChampion || rankIndex === 0) {
    badges.push({
      id: "champion",
      label: "Champion",
      icon: "🏆",
      color: "#F59E0B",
      bg: "rgba(245, 158, 11, 0.15)",
      description: "Current #1 Reigning Champion of the Hall of Fame.",
    });
  } else if (rankIndex === 1) {
    badges.push({
      id: "silver-podium",
      label: "Top 2 Podium",
      icon: "🥈",
      color: "#94A3B8",
      bg: "rgba(148, 163, 184, 0.15)",
      description: "Second place silver podium status.",
    });
  } else if (rankIndex === 2) {
    badges.push({
      id: "bronze-podium",
      label: "Top 3 Podium",
      icon: "🥉",
      color: "#D97706",
      bg: "rgba(217, 119, 6, 0.15)",
      description: "Third place bronze podium status.",
    });
  }

  // 2. Votes / Likes Milestones
  const likes = entry.likes || 0;
  if (likes >= 100) {
    badges.push({
      id: "fan-favorite-100",
      label: "100+ Votes Club",
      icon: "💖",
      color: "#EC4899",
      bg: "rgba(236, 72, 153, 0.15)",
      description: "Surpassed 100 community fan votes.",
    });
  } else if (likes >= 50) {
    badges.push({
      id: "fan-favorite-50",
      label: "Community Favorite",
      icon: "⭐",
      color: "#A855F7",
      bg: "rgba(168, 85, 247, 0.15)",
      description: "Surpassed 50 community votes.",
    });
  }

  // 3. Category & Specialty Badges
  if (entry.type === "tokusatsu" || entry.tokusatsuFranchise) {
    badges.push({
      id: "tokusatsu-hero",
      label: "Tokusatsu Hero",
      icon: "🦸",
      color: "#EF4444",
      bg: "rgba(239, 68, 68, 0.15)",
      description: "Legendary tokusatsu suit actor / hero icon.",
    });
  }

  if (entry.type === "singer" || entry.nationality === "Singer") {
    badges.push({
      id: "vocal-virtuoso",
      label: "Vocal Virtuoso",
      icon: "🎤",
      color: "#3B82F6",
      bg: "rgba(59, 130, 246, 0.15)",
      description: "Iconic vocalist and musical performer.",
    });
  }

  if (entry.knownFor && entry.knownFor.length >= 4) {
    badges.push({
      id: "multi-talent",
      label: "Multi-Talent",
      icon: "✨",
      color: "#10B981",
      bg: "rgba(16, 185, 129, 0.15)",
      description: "Acclaimed across 4 or more master works.",
    });
  }

  // 4. Custom schema badges if defined
  if (entry.badges && Array.isArray(entry.badges)) {
    entry.badges.forEach((bStr) => {
      if (!badges.some((existing) => existing.label.toLowerCase() === bStr.toLowerCase())) {
        badges.push({
          id: `custom-${bStr.toLowerCase().replace(/\s+/g, "-")}`,
          label: bStr,
          icon: "🏅",
          color: "#00F5FF",
          bg: "rgba(0, 245, 255, 0.15)",
          description: `Custom badge awarded to ${entry.name}.`,
        });
      }
    });
  }

  return badges;
}

// ── Dynamic Records Calculator ────────────────────────────────────────────────

export function computeHallRecords(hallList: HallOfFameEntry[]): HallRecord[] {
  if (!hallList || hallList.length === 0) return [];

  const sortedByLikes = [...hallList].sort((a, b) => (b.likes || 0) - (a.likes || 0));
  const sortedByWorks = [...hallList].sort(
    (a, b) => (b.knownFor ? b.knownFor.length : 0) - (a.knownFor ? a.knownFor.length : 0)
  );
  const goatMembers = hallList.filter((h) => h.status === "GOAT Status");
  const champion = sortedByLikes[0];

  // Country counts
  const countryCounts: Record<string, number> = {};
  hallList.forEach((h) => {
    const nat = h.nationality || "Global";
    countryCounts[nat] = (countryCounts[nat] || 0) + 1;
  });
  const topNationEntry = Object.entries(countryCounts).sort((a, b) => b[1] - a[1])[0];

  return [
    {
      title: "Highest Voted Legend",
      holderName: champion ? champion.name : "N/A",
      holderImage: champion ? champion.imageUrl : undefined,
      value: `${champion ? champion.likes : 0} Votes`,
      metric: "Community Support",
      icon: "💖",
    },
    {
      title: "Reigning Champion",
      holderName: champion ? champion.name : "N/A",
      holderImage: champion ? champion.imageUrl : undefined,
      value: "#1 Ranked",
      metric: "Leaderboard Dominance",
      icon: "👑",
    },
    {
      title: "Most Works Listed",
      holderName: sortedByWorks[0] ? sortedByWorks[0].name : "N/A",
      holderImage: sortedByWorks[0] ? sortedByWorks[0].imageUrl : undefined,
      value: `${sortedByWorks[0] && sortedByWorks[0].knownFor ? sortedByWorks[0].knownFor.length : 0} Masterpieces`,
      metric: "Filmography / Catalog",
      icon: "🎬",
    },
    {
      title: "GOAT Total Roster",
      holderName: `${goatMembers.length} Legends`,
      value: `${goatMembers.length} GOATs`,
      metric: "Peak Tier Status",
      icon: "💎",
    },
    {
      title: "Top Represented Nation",
      holderName: topNationEntry ? topNationEntry[0] : "Global",
      value: `${topNationEntry ? topNationEntry[1] : 0} Legends`,
      metric: "National Heritage",
      icon: "🌍",
    },
  ];
}

// ── Dynamic Analytics Calculator ──────────────────────────────────────────────

export function computeHallAnalytics(hallList: HallOfFameEntry[]): HallAnalyticsSummary {
  const total = hallList.length || 1;
  const totalLikes = hallList.reduce((acc, item) => acc + (item.likes || 0), 0);
  const avgLikes = Math.round(totalLikes / total);

  // Country breakdown
  const countryMap: Record<string, number> = {};
  const categoryMap: Record<string, number> = {};
  const statusMap: Record<string, number> = {};

  hallList.forEach((item) => {
    const nat = item.nationality || "Other";
    const cat = item.type || "other";
    const stat = item.status || "All-Star";

    countryMap[nat] = (countryMap[nat] || 0) + 1;
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    statusMap[stat] = (statusMap[stat] || 0) + 1;
  });

  const countryDistribution = Object.entries(countryMap)
    .map(([country, count]) => ({
      country,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  const categoryDistribution = Object.entries(categoryMap)
    .map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  const statusDistribution = Object.entries(statusMap)
    .map(([status, count]) => ({
      status,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  const topCountryEntry = countryDistribution[0] || { country: "Korea", count: 0 };
  const flagMap: Record<string, string> = {
    Korea: "🇰🇷",
    Japan: "🇯🇵",
    China: "🇨🇳",
    Indonesia: "🇮🇩",
    Hollywood: "🎬",
    American: "🇺🇸",
  };

  return {
    totalLikes,
    avgLikes,
    topCountry: {
      name: topCountryEntry.country,
      count: topCountryEntry.count,
      flag: flagMap[topCountryEntry.country] || "🌍",
    },
    topCategory: {
      name: categoryDistribution[0] ? categoryDistribution[0].category : "actress",
      count: categoryDistribution[0] ? categoryDistribution[0].count : 0,
    },
    countryDistribution,
    categoryDistribution,
    statusDistribution,
  };
}

// ── Activity Log Generator ────────────────────────────────────────────────────

export function generateActivityFeed(hallList: HallOfFameEntry[]): HallActivityItem[] {
  const sorted = [...hallList].sort((a, b) => (b.likes || 0) - (a.likes || 0));
  const items: HallActivityItem[] = [];

  if (sorted[0]) {
    items.push({
      id: "act-1",
      timestamp: "Just now",
      legendName: sorted[0].name,
      legendImage: sorted[0].imageUrl,
      type: "champion",
      title: "Champion Reign Active",
      description: `${sorted[0].name} holds the #1 Champion position with ${sorted[0].likes || 0} votes.`,
    });
  }

  if (sorted[1]) {
    items.push({
      id: "act-2",
      timestamp: "12m ago",
      legendName: sorted[1].name,
      legendImage: sorted[1].imageUrl,
      type: "climb",
      title: "Podium Surge",
      description: `${sorted[1].name} secured Rank #2 on the global leaderboard.`,
    });
  }

  const goat = hallList.find((h) => h.status === "GOAT Status");
  if (goat) {
    items.push({
      id: "act-3",
      timestamp: "1h ago",
      legendName: goat.name,
      legendImage: goat.imageUrl,
      type: "goat",
      title: "GOAT Status Verified",
      description: `${goat.name} is enshrined in peak GOAT Status tier.`,
    });
  }

  if (sorted[2]) {
    items.push({
      id: "act-4",
      timestamp: "3h ago",
      legendName: sorted[2].name,
      legendImage: sorted[2].imageUrl,
      type: "vote",
      title: "Bronze Podium Locked",
      description: `${sorted[2].name} reached Rank #3 with ${sorted[2].likes || 0} community hearts.`,
    });
  }

  return items;
}
