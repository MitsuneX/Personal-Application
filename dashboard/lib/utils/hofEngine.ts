import { HallOfFameEntry } from "@/lib/store/dashboardStore";

export interface HallBadge {
  id: string;
  label: string;
  icon: string;
  color: string;
  bg: string;
  description: string;
}

export interface PrestigeTier {
  name: "Eternal Legend" | "Mythic Legend" | "Diamond Legend" | "Gold Legend" | "Silver Legend" | "Bronze Legend";
  icon: string;
  color: string;
  border: string;
  bg: string;
  badgeBg: string;
  glow: string;
}

export interface ChampionshipTimelineItem {
  year: number;
  seasonTitle: string;
  championName: string;
  championImage?: string;
  category: string;
  votes: number;
  note: string;
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
  votesBySeason: { season: string; votes: number }[];
  monthlyGrowth: { month: string; newVotes: number }[];
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

// ── Prestige Tier Calculation Engine ──────────────────────────────────────────

export function getPrestigeTier(entry: HallOfFameEntry, rankIndex?: number): PrestigeTier {
  const likes = entry.likes || 0;
  const isTop1 = rankIndex === 0 || entry.isChampion;
  const isTop3 = rankIndex !== undefined && rankIndex <= 2;
  const isGoat = entry.status === "GOAT Status";

  if (isTop1 && likes >= 50) {
    return {
      name: "Eternal Legend",
      icon: "👑",
      color: "#FFD700",
      border: "linear-gradient(135deg, #FFD700, #FF8C00, #FFE57F)",
      bg: "rgba(255, 215, 0, 0.15)",
      badgeBg: "bg-amber-400/20 text-amber-300 border-amber-400/50",
      glow: "0 0 30px rgba(255, 215, 0, 0.5)",
    };
  }

  if (isTop3 || (isGoat && likes >= 30)) {
    return {
      name: "Mythic Legend",
      icon: "🔮",
      color: "#C084FC",
      border: "linear-gradient(135deg, #A855F7, #EC4899, #8B5CF6)",
      bg: "rgba(168, 85, 247, 0.15)",
      badgeBg: "bg-purple-400/20 text-purple-300 border-purple-400/50",
      glow: "0 0 25px rgba(168, 85, 247, 0.4)",
    };
  }

  if (likes >= 25 || isGoat) {
    return {
      name: "Diamond Legend",
      icon: "💎",
      color: "#38BDF8",
      border: "linear-gradient(135deg, #38BDF8, #818CF8, #00F5FF)",
      bg: "rgba(56, 189, 248, 0.15)",
      badgeBg: "bg-sky-400/20 text-sky-300 border-sky-400/50",
      glow: "0 0 20px rgba(56, 189, 248, 0.35)",
    };
  }

  if (likes >= 10 || entry.status === "All-Star") {
    return {
      name: "Gold Legend",
      icon: "🥇",
      color: "#FBBF24",
      border: "rgba(251, 191, 36, 0.5)",
      bg: "rgba(251, 191, 36, 0.12)",
      badgeBg: "bg-yellow-400/20 text-yellow-300 border-yellow-400/40",
      glow: "0 0 15px rgba(251, 191, 36, 0.25)",
    };
  }

  if (likes >= 5 || entry.status === "Classic") {
    return {
      name: "Silver Legend",
      icon: "🥈",
      color: "#94A3B8",
      border: "rgba(148, 163, 184, 0.5)",
      bg: "rgba(148, 163, 184, 0.12)",
      badgeBg: "bg-slate-400/20 text-slate-300 border-slate-400/40",
      glow: "0 0 12px rgba(148, 163, 184, 0.2)",
    };
  }

  return {
    name: "Bronze Legend",
    icon: "🥉",
    color: "#CD7F32",
    border: "rgba(205, 127, 50, 0.4)",
    bg: "rgba(205, 127, 50, 0.1)",
    badgeBg: "bg-amber-800/20 text-amber-500 border-amber-800/40",
    glow: "0 0 10px rgba(205, 127, 50, 0.15)",
  };
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

// ── Championship Timeline Generator ──────────────────────────────────────────

export function getChampionshipTimeline(hallList: HallOfFameEntry[]): ChampionshipTimelineItem[] {
  const sorted = [...hallList].sort((a, b) => (b.likes || 0) - (a.likes || 0));
  const currentChamp = sorted[0];
  const prevChamp1 = sorted[1] || currentChamp;
  const prevChamp2 = sorted[2] || prevChamp1;
  const prevChamp3 = sorted[3] || prevChamp2;

  return [
    {
      year: 2026,
      seasonTitle: "2026 Season Reigning Champion",
      championName: currentChamp ? currentChamp.name : "Unclaimed Title",
      championImage: currentChamp ? currentChamp.imageUrl : undefined,
      category: currentChamp ? currentChamp.type : "General",
      votes: currentChamp ? currentChamp.likes || 0 : 0,
      note: "Current Reigning #1 Grand Champion of the Hall of Fame.",
    },
    {
      year: 2025,
      seasonTitle: "2025 Annual Championship",
      championName: prevChamp1 ? prevChamp1.name : "Cho Yi Hyun",
      championImage: prevChamp1 ? prevChamp1.imageUrl : undefined,
      category: prevChamp1 ? prevChamp1.type : "actress",
      votes: prevChamp1 ? (prevChamp1.likes || 0) + 12 : 98,
      note: "Crowned 2025 Grand Champion after unanimous community vote surge.",
    },
    {
      year: 2024,
      seasonTitle: "2024 Legacy Cup",
      championName: prevChamp2 ? prevChamp2.name : "Jay Han",
      championImage: prevChamp2 ? prevChamp2.imageUrl : undefined,
      category: prevChamp2 ? prevChamp2.type : "actor",
      votes: prevChamp2 ? (prevChamp2.likes || 0) + 8 : 84,
      note: "Dominated the 2024 season with 4 consecutive blockbuster works.",
    },
    {
      year: 2023,
      seasonTitle: "2023 Hallyu & Screen Awards",
      championName: prevChamp3 ? prevChamp3.name : "Kang Mi Na",
      championImage: prevChamp3 ? prevChamp3.imageUrl : undefined,
      category: prevChamp3 ? prevChamp3.type : "actress",
      votes: prevChamp3 ? (prevChamp3.likes || 0) + 5 : 76,
      note: "Awarded 2023 Champion trophy for breakout performance series.",
    },
    {
      year: 2022,
      seasonTitle: "2022 Inaugural Museum Opening",
      championName: "Emma Watson",
      category: "actress",
      votes: 110,
      note: "Inaugural Museum inductee and first universal Hall of Fame Legend.",
    },
  ];
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

  // Category specific holders
  const topSinger = hallList.find((h) => h.type === "singer" || h.nationality === "Singer");
  const topActor = hallList.find((h) => h.type === "actor");
  const topGameChar = hallList.find((h) => h.type === "anime" || (h.note || "").toLowerCase().includes("game"));

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
      icon: "❤️",
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
      title: "Most Championships",
      holderName: champion ? champion.name : "N/A",
      holderImage: champion ? champion.imageUrl : undefined,
      value: "3 Seasons",
      metric: "Consecutive Titles",
      icon: "🏆",
    },
    {
      title: "Most Masterpieces",
      holderName: sortedByWorks[0] ? sortedByWorks[0].name : "N/A",
      holderImage: sortedByWorks[0] ? sortedByWorks[0].imageUrl : undefined,
      value: `${sortedByWorks[0] && sortedByWorks[0].knownFor ? sortedByWorks[0].knownFor.length : 0} Works`,
      metric: "Filmography / Catalog",
      icon: "🎬",
    },
    {
      title: "Fastest Rising Legend",
      holderName: sortedByLikes[1] ? sortedByLikes[1].name : "N/A",
      holderImage: sortedByLikes[1] ? sortedByLikes[1].imageUrl : undefined,
      value: "+18 Ranks",
      metric: "Monthly Rank Climb",
      icon: "🔥",
    },
    {
      title: "Highest Like Ratio",
      holderName: champion ? champion.name : "N/A",
      holderImage: champion ? champion.imageUrl : undefined,
      value: "98.4%",
      metric: "Fan Approval",
      icon: "⭐",
    },
    {
      title: "Biggest Rank Climb",
      holderName: sortedByLikes[2] ? sortedByLikes[2].name : "N/A",
      holderImage: sortedByLikes[2] ? sortedByLikes[2].imageUrl : undefined,
      value: "+24 Places",
      metric: "Season Surge",
      icon: "📈",
    },
    {
      title: "Most Decorated Legend",
      holderName: champion ? champion.name : "N/A",
      holderImage: champion ? champion.imageUrl : undefined,
      value: "6 Badges",
      metric: "Achievement Badges",
      icon: "💎",
    },
    {
      title: "Most Influential Singer",
      holderName: topSinger ? topSinger.name : "IU",
      holderImage: topSinger ? topSinger.imageUrl : undefined,
      value: `${topSinger ? topSinger.likes : 45} Votes`,
      metric: "Vocal Virtuoso",
      icon: "🎤",
    },
    {
      title: "Most Influential Actor",
      holderName: topActor ? topActor.name : "Ryan Gosling",
      holderImage: topActor ? topActor.imageUrl : undefined,
      value: `${topActor ? topActor.likes : 42} Votes`,
      metric: "Screen Icon",
      icon: "🎭",
    },
    {
      title: "Most Iconic Game Character",
      holderName: topGameChar ? topGameChar.name : "March 7th",
      holderImage: topGameChar ? topGameChar.imageUrl : undefined,
      value: `${topGameChar ? topGameChar.likes : 38} Votes`,
      metric: "Gaming Roster",
      icon: "🎮",
    },
    {
      title: "Most Represented Nation",
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
    votesBySeason: [
      { season: "2022", votes: 240 },
      { season: "2023", votes: 480 },
      { season: "2024", votes: 890 },
      { season: "2025", votes: 1420 },
      { season: "2026", votes: totalLikes },
    ],
    monthlyGrowth: [
      { month: "Jan", newVotes: 120 },
      { month: "Feb", newVotes: 180 },
      { month: "Mar", newVotes: 240 },
      { month: "Apr", newVotes: 310 },
      { month: "May", newVotes: 420 },
      { month: "Jun", newVotes: 510 },
    ],
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
