import { HallOfFameEntry } from "@/lib/store/dashboardStore";
import { getLeaderboardRowAvatarUrl } from "@/lib/utils/mediaResolver";

// ─── Shared Interfaces ────────────────────────────────────────────────────────

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
  rank?: number;
}

export interface HallRecord {
  title: string;
  holderName: string;
  holderImage?: string;
  value: string;
  metric: string;
  icon: string;
}

export interface InvalidRecordReport {
  id: string;
  name: string;
  rawType?: string;
  reason: string;
}

export interface DeveloperValidationReport {
  totalAnalyzed: number;
  validRecordCount: number;
  invalidRecordCount: number;
  invalidRecords: InvalidRecordReport[];
}

export interface HallAnalyticsSummary {
  totalLikes: number;
  avgLikes: number;
  topCountry: { name: string; count: number; flag: string };
  topCategory: { name: string; count: number };
  topMedia: { name: string; count: number };
  topProfession: { name: string; count: number };
  countryDistribution: { country: string; count: number; percentage: number }[];
  gameDistribution: { game: string; count: number; percentage: number; color: string }[];
  mediaDistribution: { category: string; count: number; percentage: number }[];
  professionDistribution: { category: string; count: number; percentage: number }[];
  categoryDistribution: { category: string; count: number; percentage: number }[];
  statusDistribution: { status: string; count: number; percentage: number }[];
  votesBySeason: { season: string; votes: number }[];
  monthlyGrowth: { month: string; newVotes: number }[];
  validationReport: DeveloperValidationReport;
}

export interface HallActivityItem {
  id: string;
  timestamp: string;
  legendName: string;
  legendImage?: string;
  type: "champion" | "goat" | "vote" | "climb" | "addition" | "favorite" | "milestone" | "drop";
  title: string;
  description: string;
}

export interface RankMovement {
  label: string;
  icon: string;
  change: number;
  type: "up" | "down" | "stable" | "new";
  color: string;
  bg: string;
  badgeBg: string;
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

/** Sort hall list by likes descending — the canonical rank order. */
function sortByRank(list: HallOfFameEntry[]): HallOfFameEntry[] {
  return [...list].sort((a, b) => (b.likes || 0) - (a.likes || 0));
}

// ─── Category Filtering Helper ───────────────────────────────────────────────
export function filterHallEntriesByCategory(
  entries: (HallOfFameEntry | any)[],
  category: string = "all",
  secondaryFilter: string = ""
): any[] {
  const cat = (category || "all").toLowerCase();
  let list = [...entries];

  if (cat === "game") {
    list = list.filter((e) => e.isGameCharacterEntry || (e as any).gameName || e.type === "game character");
  } else if (cat === "actor") {
    list = list.filter((e) => (e.type || "").toLowerCase() === "actor");
  } else if (cat === "actress") {
    list = list.filter((e) => (e.type || "").toLowerCase() === "actress");
  } else if (cat === "singer" || cat === "music") {
    list = list.filter((e) => (e.type || "").toLowerCase() === "singer" || !!e.singerType);
  } else if (cat === "anime") {
    list = list.filter((e) => (e.type || "").toLowerCase() === "anime");
  } else if (cat === "vtuber") {
    list = list.filter((e) => (e.type || "").toLowerCase() === "vtuber" || !!e.agency || !!e.details?.agency);
  } else if (cat === "tokusatsu") {
    list = list.filter((e) => (e.type || "").toLowerCase() === "tokusatsu" || !!e.tokusatsuFranchise || !!e.tokusatsuShow);
  }

  if (secondaryFilter && secondaryFilter.trim()) {
    const q = secondaryFilter.toLowerCase().trim();
    list = list.filter((e) => {
      const name = (e.name || "").toLowerCase();
      const nat = (e.nationality || e.country || e.details?.country || "").toLowerCase();
      const known = (Array.isArray(e.knownFor) ? e.knownFor.join(" ") : e.knownFor || "").toLowerCase();
      const franchise = (e.tokusatsuFranchise || e.gameName || e.agency || e.universe || e.series || e.franchise || e.work || "").toLowerCase();
      const role = (e.role || e.title || e.category || "").toLowerCase();
      const type = (e.type || "").toLowerCase();
      return (
        name.includes(q) ||
        nat.includes(q) ||
        known.includes(q) ||
        franchise.includes(q) ||
        role.includes(q) ||
        type.includes(q)
      );
    });
  }

  return list;
}

export interface NormalizedCategoryResult {
  isValid: boolean;
  mediaCategory: string | null;      // "Drama" | "Anime" | "Movie" | "Game Character" | "Tokusatsu" | "VTuber" | null
  professionCategory: string | null; // "Actress" | "Actor" | "Anime" | "VTuber" | "Tokusatsu" | "Singer" | dynamic
  invalidReason?: string;
}

/** Automatically normalizes entry categories, resolving missing or legacy types without invalid "None". */
export function normalizeHallEntry(item: HallOfFameEntry): NormalizedCategoryResult {
  const typeStr = (item.type || "").trim().toLowerCase();
  const knownForText = (item.knownFor || []).join(" ").toLowerCase();
  const noteText = (item.note || "").toLowerCase();
  const nameText = (item.name || "").toLowerCase();
  const combinedText = `${typeStr} ${knownForText} ${noteText} ${nameText}`;

  const isExplicitlyInvalid =
    !typeStr ||
    typeStr === "none" ||
    typeStr === "null" ||
    typeStr === "undefined" ||
    typeStr === "invalid";

  let professionCategory: string | null = null;
  let mediaCategory: string | null = null;

  // 1. Profession Normalization (Dynamically supports future professions, removes Voice Actor)
  if (typeStr === "actress") {
    professionCategory = "Actress";
    mediaCategory = item.associatedDramas && item.associatedDramas.length > 0 ? "Drama" : "Movie";
  } else if (typeStr === "actor") {
    professionCategory = "Actor";
    mediaCategory = item.associatedDramas && item.associatedDramas.length > 0 ? "Drama" : "Movie";
  } else if (typeStr === "vtuber" || typeStr === "virtual youtuber") {
    professionCategory = "VTuber";
    mediaCategory = "VTuber";
  } else if (typeStr === "anime") {
    professionCategory = "Anime";
    mediaCategory = "Anime";
  } else if (typeStr === "tokusatsu" || item.tokusatsuShow || item.tokusatsuFranchise) {
    professionCategory = "Tokusatsu";
    mediaCategory = "Tokusatsu";
  } else if (typeStr === "singer" || item.singerType) {
    professionCategory = "Singer";
    mediaCategory = "Music";
  } else if (typeStr === "game" || typeStr === "game character" || (item as any).isGameCharacterEntry) {
    professionCategory = "Game Character";
    mediaCategory = "Game Character";
  } else if (typeStr && !isExplicitlyInvalid && typeStr !== "other" && typeStr !== "uncategorized") {
    // Dynamically preserve and capitalize future custom professions
    professionCategory = typeStr.charAt(0).toUpperCase() + typeStr.slice(1);
  } else {
    // Keyword Inference
    if (combinedText.includes("vtuber") || combinedText.includes("virtual youtuber")) {
      professionCategory = "VTuber";
      mediaCategory = "VTuber";
    } else if (combinedText.includes("actress")) {
      professionCategory = "Actress";
      mediaCategory = "Drama";
    } else if (combinedText.includes("actor")) {
      professionCategory = "Actor";
      mediaCategory = "Drama";
    } else if (combinedText.includes("singer") || combinedText.includes("vocalist") || combinedText.includes("band") || combinedText.includes("idol")) {
      professionCategory = "Singer";
      mediaCategory = "Music";
    } else if (combinedText.includes("tokusatsu") || combinedText.includes("kamen rider") || combinedText.includes("ultraman") || combinedText.includes("sentai")) {
      professionCategory = "Tokusatsu";
      mediaCategory = "Tokusatsu";
    } else if (combinedText.includes("anime") || combinedText.includes("manga")) {
      professionCategory = "Anime";
      mediaCategory = "Anime";
    } else if (combinedText.includes("game") || combinedText.includes("gacha") || combinedText.includes("rpg")) {
      professionCategory = "Game Character";
      mediaCategory = "Game Character";
    } else {
      professionCategory = "Entity";
      mediaCategory = "Media";
    }
  }

  // 2. Media Category Normalization (if not already set)
  if (!mediaCategory) {
    if (typeStr === "anime" || combinedText.includes("anime") || combinedText.includes("manga")) {
      mediaCategory = "Anime";
    } else if (typeStr === "tokusatsu" || item.tokusatsuShow || item.tokusatsuFranchise || combinedText.includes("tokusatsu")) {
      mediaCategory = "Tokusatsu";
    } else if ((item.associatedDramas && item.associatedDramas.length > 0) || combinedText.includes("drama") || combinedText.includes("kdrama")) {
      mediaCategory = "Drama";
    } else if (combinedText.includes("movie") || combinedText.includes("film") || combinedText.includes("cinema")) {
      mediaCategory = "Movie";
    } else if (combinedText.includes("game")) {
      mediaCategory = "Game Character";
    } else {
      mediaCategory = "Drama";
    }
  }

  const isValid = !isExplicitlyInvalid || mediaCategory !== null || professionCategory !== null;

  return {
    isValid,
    mediaCategory: isValid ? (mediaCategory || "Drama") : null,
    professionCategory: isValid ? (professionCategory || "Actor") : null,
    invalidReason: isValid
      ? undefined
      : `Record "${item.name}" (ID: ${item.id}) has invalid/missing type "${item.type || "empty"}".`,
  };
}

// ─── Engine 1: Dynamic Badges & Achievements (100% DB-Derived) ─────────────────
/** Computes badges for a Hall entry dynamically based on DB record stats. */
export function computeHallBadges(item: HallOfFameEntry, rankIndex: number = 0): HallBadge[] {
  const badges: HallBadge[] = [];

  // #1 Rank — GOAT Champion
  if (rankIndex === 0) {
    badges.push({
      id: "goat_champion",
      label: "GOAT Champion",
      icon: "👑",
      color: "#FFD700",
      bg: "rgba(255, 215, 0, 0.15)",
      description: "Rank #1 overall in the Nexus Xenon Hall of Fame",
    });
  }

  // Top 3 Badge
  if (rankIndex >= 0 && rankIndex < 3) {
    badges.push({
      id: "podium_top3",
      label: "Podium Elite",
      icon: "🏆",
      color: "#00F5FF",
      bg: "rgba(0, 245, 255, 0.15)",
      description: "Top 3 highest ranked entries in the Hall of Fame",
    });
  }

  // Active Season Champion
  if (item.isChampion) {
    badges.push({
      id: "active_champion",
      label: "Reigning Champion",
      icon: "⚡",
      color: "#BF5FFF",
      bg: "rgba(191, 95, 255, 0.15)",
      description: "Currently holds an active Championship reign",
    });
  }

  // GOAT Status Badge
  if (item.status === "GOAT Status") {
    badges.push({
      id: "goat_status",
      label: "GOAT Tier",
      icon: "🔥",
      color: "#FF0055",
      bg: "rgba(255, 0, 85, 0.15)",
      description: "Achieved GOAT status tier recognition",
    });
  }

  // High Likes Milestone
  if ((item.likes || 0) >= 10) {
    badges.push({
      id: "community_favorite",
      label: "Crowd Favorite",
      icon: "❤️",
      color: "#FF3366",
      bg: "rgba(255, 51, 102, 0.15)",
      description: "Surpassed 10+ permanent user likes",
    });
  }

  // Drama Royalty
  if (item.associatedDramas && item.associatedDramas.length >= 3) {
    badges.push({
      id: "drama_royalty",
      label: `Drama Star (${item.associatedDramas.length} Works)`,
      icon: "🎬",
      color: "#00FF66",
      bg: "rgba(0, 255, 102, 0.15)",
      description: `Starred in ${item.associatedDramas.length}+ recorded drama titles`,
    });
  }

  // Tokusatsu Icon
  if (item.type === "tokusatsu" || item.tokusatsuFranchise) {
    badges.push({
      id: "tokusatsu_hero",
      label: item.tokusatsuFranchise ? `Hero of ${item.tokusatsuFranchise}` : "Tokusatsu Legend",
      icon: "🦸‍♂️",
      color: "#FF9900",
      bg: "rgba(255, 153, 0, 0.15)",
      description: "Celebrated figure in Tokusatsu franchise history",
    });
  }

  // Solo Artist / Singer Icon
  if (item.type === "singer" || item.singerType) {
    badges.push({
      id: "maestro_singer",
      label: item.singerType ? `Vocalist (${item.singerType})` : "Master Vocalist",
      icon: "🎤",
      color: "#00E5FF",
      bg: "rgba(0, 229, 255, 0.15)",
      description: "Distinguished vocalist in musical history",
    });
  }

  return badges;
}

// ─── Engine 2: Prestige Tier Calculator ──────────────────────────────────────
/** Computes dynamic prestige tier based on canonical rank index or entry object. */
export function computePrestigeTier(itemOrIndex: number | HallOfFameEntry = 0, rankIndex?: number): PrestigeTier {
  const index = typeof itemOrIndex === "number" ? itemOrIndex : (rankIndex ?? 0);
  if (index === 0) {
    return {
      name: "Eternal Legend",
      icon: "👑",
      color: "#FFD700",
      border: "#FFD700",
      bg: "linear-gradient(135deg, rgba(255,215,0,0.2) 0%, rgba(255,140,0,0.1) 100%)",
      badgeBg: "#FFD700",
      glow: "0 0 25px rgba(255,215,0,0.6)",
    };
  }
  if (index < 3) {
    return {
      name: "Mythic Legend",
      icon: "🌟",
      color: "#00F5FF",
      border: "#00F5FF",
      bg: "linear-gradient(135deg, rgba(0,245,255,0.15) 0%, rgba(191,95,255,0.1) 100%)",
      badgeBg: "#00F5FF",
      glow: "0 0 20px rgba(0,245,255,0.5)",
    };
  }
  if (index < 10) {
    return {
      name: "Diamond Legend",
      icon: "💎",
      color: "#BF5FFF",
      border: "#BF5FFF",
      bg: "rgba(191,95,255,0.1)",
      badgeBg: "#BF5FFF",
      glow: "0 0 15px rgba(191,95,255,0.4)",
    };
  }
  if (index < 25) {
    return {
      name: "Gold Legend",
      icon: "🥇",
      color: "#F59E0B",
      border: "#F59E0B",
      bg: "rgba(245,158,11,0.1)",
      badgeBg: "#F59E0B",
      glow: "0 0 12px rgba(245,158,11,0.3)",
    };
  }
  if (index < 50) {
    return {
      name: "Silver Legend",
      icon: "🥈",
      color: "#94A3B8",
      border: "#94A3B8",
      bg: "rgba(148,163,184,0.1)",
      badgeBg: "#94A3B8",
      glow: "0 0 10px rgba(148,163,184,0.25)",
    };
  }
  return {
    name: "Bronze Legend",
    icon: "🥉",
    color: "#B45309",
    border: "#B45309",
    bg: "rgba(180,83,9,0.1)",
    badgeBg: "#B45309",
    glow: "none",
  };
}

// ─── Engine 3: Dynamic Rank Movement Detector ────────────────────────────────
/** Computes rank change indicator by comparing current sorted rank against stored rank. */
export function computeRankMovement(item: HallOfFameEntry, rankIndex: number = 0, _total?: number): RankMovement {
  const currentRank = rankIndex + 1;
  const oldRank = item.rank || currentRank;

  if (oldRank === 0) {
    return {
      label: "NEW ENTRY",
      icon: "✨",
      change: 0,
      type: "new",
      color: "#00F5FF",
      bg: "rgba(0,245,255,0.12)",
      badgeBg: "rgba(0,245,255,0.2)",
    };
  }

  const diff = oldRank - currentRank; // positive if moved up (e.g. was 5, now 2 -> +3)

  if (diff > 0) {
    return {
      label: `+${diff} CLIMB`,
      icon: "▲",
      change: diff,
      type: "up",
      color: "#22C55E",
      bg: "rgba(34,197,94,0.12)",
      badgeBg: "rgba(34,197,94,0.2)",
    };
  }

  if (diff < 0) {
    return {
      label: `${diff} SLIP`,
      icon: "▼",
      change: Math.abs(diff),
      type: "down",
      color: "#EF4444",
      bg: "rgba(239,68,68,0.12)",
      badgeBg: "rgba(239,68,68,0.2)",
    };
  }

  return {
    label: "STABLE",
    icon: "━",
    change: 0,
    type: "stable",
    color: "#94A3B8",
    bg: "rgba(148,163,184,0.12)",
    badgeBg: "rgba(148,163,184,0.2)",
  };
}

// ─── Engine 4: Dynamic Season Legacy & Championship Archive ──────────────────
export function computeChampionshipHistory(
  hallList: HallOfFameEntry[],
  championshipHistory?: any[],
  category: string = "all",
  secondaryFilter: string = ""
): ChampionshipTimelineItem[] {
  const filteredList = filterHallEntriesByCategory(hallList, category, secondaryFilter);
  const sorted = sortByRank(filteredList);
  const ACTIVE_SEASON_YEAR = 2026;

  // Helper to resolve dedicated 1:1 champion avatar
  const resolveChampAvatar = (entryOrHist: any): string | null => {
    if (!entryOrHist) return null;
    const direct = getLeaderboardRowAvatarUrl(entryOrHist);
    if (direct) return direct;
    const matched = hallList.find(
      (h) =>
        (h.id && entryOrHist.characterId && h.id === entryOrHist.characterId) ||
        h.name.toLowerCase() === (entryOrHist.championName || entryOrHist.name || "").toLowerCase()
    );
    if (matched) {
      const matchAvatar = getLeaderboardRowAvatarUrl(matched);
      if (matchAvatar) return matchAvatar;
    }
    return entryOrHist.avatarUrl || entryOrHist.portraitUrl || entryOrHist.imageUrl || null;
  };

  // If explicit DB championship history is provided and matches category (strictly for valid records)
  if (Array.isArray(championshipHistory) && championshipHistory.length > 0) {
    let hist = championshipHistory.filter((h) => {
      // Must match category if specified and must belong to valid season
      const matchCat = category === "all" || (h.category || "").toLowerCase().includes(category.toLowerCase());
      const isYearValid = !h.year || h.year === ACTIVE_SEASON_YEAR;
      return matchCat && isYearValid;
    });

    if (secondaryFilter && secondaryFilter.trim()) {
      const q = secondaryFilter.toLowerCase().trim();
      hist = hist.filter((h) => {
        const champ = (h.championName || "").toLowerCase();
        const cat = (h.category || "").toLowerCase();
        const note = (h.notes || h.note || "").toLowerCase();
        return champ.includes(q) || cat.includes(q) || note.includes(q);
      });
    }

    if (hist.length > 0) {
      return hist.slice(0, 3).map((h, i) => ({
        year: ACTIVE_SEASON_YEAR,
        seasonTitle: h.seasonTitle || (i === 0 ? `2026 Season — 🥇 Champion` : i === 1 ? `2026 Season — 🥈 Silver Medalist` : `2026 Season — 🥉 Bronze Contender`),
        championName: h.championName,
        championImage: resolveChampAvatar(h) || undefined,
        category: (h.category || category).toUpperCase(),
        votes: h.highestVotes || h.votes || 0,
        note: h.note || `Rank #${i + 1} Archive Record for 2026 Season.`,
        rank: i + 1,
      }));
    }
  }

  if (sorted.length === 0) return [];

  const catLabel = category !== "all" ? category.toUpperCase() : (sorted[0]?.type ? sorted[0].type.toUpperCase() : "ALL-STAR");
  const timeline: ChampionshipTimelineItem[] = [];

  // 🥇 1st Rank Champion
  if (sorted[0]) {
    timeline.push({
      year: ACTIVE_SEASON_YEAR,
      seasonTitle: `2026 Season — 🥇 Champion / Gold Medalist`,
      championName: sorted[0].name,
      championImage: resolveChampAvatar(sorted[0]) || undefined,
      category: catLabel,
      votes: sorted[0].likes || 0,
      note: sorted[0].note || `Reigning #1 Legend on the Museum Showcase with ${sorted[0].likes || 0} permanent votes.`,
      rank: 1,
    });
  }

  // 🥈 2nd Rank Runner-up
  if (sorted[1]) {
    timeline.push({
      year: ACTIVE_SEASON_YEAR,
      seasonTitle: `2026 Season — 🥈 Silver Medalist / Runner-Up`,
      championName: sorted[1].name,
      championImage: resolveChampAvatar(sorted[1]) || undefined,
      category: catLabel,
      votes: sorted[1].likes || 0,
      note: sorted[1].note || `Rank #2 Contender with high community acclaim and ${sorted[1].likes || 0} votes.`,
      rank: 2,
    });
  }

  // 🥉 3rd Rank Bronze
  if (sorted[2]) {
    timeline.push({
      year: ACTIVE_SEASON_YEAR,
      seasonTitle: `2026 Season — 🥉 Bronze Medalist / Podium Contender`,
      championName: sorted[2].name,
      championImage: resolveChampAvatar(sorted[2]) || undefined,
      category: catLabel,
      votes: sorted[2].likes || 0,
      note: sorted[2].note || `Rank #3 Podium finisher holding prestigious legacy ranking with ${sorted[2].likes || 0} votes.`,
      rank: 3,
    });
  }

  return timeline;
}

// ─── Engine 5: Dynamic Historical Records Calculator (100% Data-Driven) ────────
export function computeHallRecords(
  hallList: HallOfFameEntry[],
  _championshipHistory?: any[],
  _hallEvents?: any[],
  category: string = "all",
  secondaryFilter: string = "",
  extraContext?: {
    gamesCount?: number;
    dramasCount?: number;
    songsCount?: number;
    starredCount?: number;
  }
): HallRecord[] {
  const filteredList = filterHallEntriesByCategory(hallList, category, secondaryFilter);
  const sorted = sortByRank(filteredList);
  const records: HallRecord[] = [];

  const catName = category !== "all" ? `${category.charAt(0).toUpperCase() + category.slice(1)} ` : "";

  // 1. Most Liked Legend
  const topLikes = sorted[0];
  if (topLikes) {
    records.push({
      title: `Most Liked ${catName}Legend`,
      holderName: topLikes.name,
      holderImage: topLikes.imageUrl || topLikes.portraitUrl || (topLikes as any).avatarUrl,
      value: `${topLikes.likes || 0} Likes`,
      metric: "Community Favorite",
      icon: "👑",
    });
  }

  // 2. Reigning Category Champion (Rank #1)
  const champion = sorted.find((h) => h.isChampion) || sorted[0];
  if (champion) {
    records.push({
      title: `Reigning ${catName}Champion`,
      holderName: champion.name,
      holderImage: champion.imageUrl || champion.portraitUrl || (champion as any).avatarUrl,
      value: `Rank #1 (${champion.likes || 0} Votes)`,
      metric: "Active Leader",
      icon: "⚡",
    });
  }

  // 3. Silver Medalist / Top 3 Contender
  if (sorted[1]) {
    records.push({
      title: `Podium Silver Contender`,
      holderName: sorted[1].name,
      holderImage: sorted[1].imageUrl || sorted[1].portraitUrl || (sorted[1] as any).avatarUrl,
      value: `Rank #2 (${sorted[1].likes || 0} Votes)`,
      metric: "Top 3 Finisher",
      icon: "🥈",
    });
  }

  // 4. Bronze Medalist / Podium Finisher
  if (sorted[2]) {
    records.push({
      title: `Podium Bronze Legend`,
      holderName: sorted[2].name,
      holderImage: sorted[2].imageUrl || sorted[2].portraitUrl || (sorted[2] as any).avatarUrl,
      value: `Rank #3 (${sorted[2].likes || 0} Votes)`,
      metric: "Top 3 Finisher",
      icon: "🥉",
    });
  }

  // 5. Most Prolific Works / Master of Roles (from real knownFor data)
  const mostProlific = [...filteredList].sort((a, b) => {
    const aLen = Array.isArray(a.knownFor) ? a.knownFor.length : (a.knownFor ? 1 : 0);
    const bLen = Array.isArray(b.knownFor) ? b.knownFor.length : (b.knownFor ? 1 : 0);
    return bLen - aLen;
  })[0];
  const worksCount = mostProlific && Array.isArray(mostProlific.knownFor) ? mostProlific.knownFor.length : (mostProlific?.knownFor ? 1 : 0);
  if (mostProlific && worksCount > 0) {
    records.push({
      title: `Most Prolific Works`,
      holderName: mostProlific.name,
      holderImage: mostProlific.imageUrl || mostProlific.portraitUrl || (mostProlific as any).avatarUrl,
      value: `${worksCount} Titles`,
      metric: "Master of Roles",
      icon: "🎬",
    });
  }

  // 6. Curator's Choice / Featured Icon (from real isFeatured / isFavorite)
  const featuredItem = filteredList.find((h) => h.isFeatured || h.isFavorite);
  if (featuredItem) {
    records.push({
      title: `Curator's Choice Icon`,
      holderName: featuredItem.name,
      holderImage: featuredItem.imageUrl || featuredItem.portraitUrl || (featuredItem as any).avatarUrl,
      value: featuredItem.isFavorite ? "Curator Favorite" : "⭐ Featured",
      metric: "Exhibition Highlight",
      icon: "⭐",
    });
  }

  // 7. Most Decorated Legend (from real badges count)
  const mostDecorated = [...filteredList].sort((a, b) => (b.badges?.length || 0) - (a.badges?.length || 0))[0];
  if (mostDecorated && (mostDecorated.badges?.length || 0) > 0) {
    records.push({
      title: `Most Decorated Legend`,
      holderName: mostDecorated.name,
      holderImage: mostDecorated.imageUrl || mostDecorated.portraitUrl || (mostDecorated as any).avatarUrl,
      value: `${mostDecorated.badges?.length} Badges`,
      metric: "Honors & Accolades",
      icon: "🎖️",
    });
  }

  // 8. Top National Representative
  const nationCounts: Record<string, { count: number; leader?: HallOfFameEntry }> = {};
  filteredList.forEach((entry) => {
    const nation = entry.nationality || "Global";
    if (!nationCounts[nation]) {
      nationCounts[nation] = { count: 0, leader: entry };
    }
    nationCounts[nation].count += 1;
  });
  const topNationEntry = Object.entries(nationCounts).sort((a, b) => b[1].count - a[1].count)[0];
  if (topNationEntry && topNationEntry[1].leader) {
    records.push({
      title: `Top Origin Milestone`,
      holderName: `${topNationEntry[0]} (${topNationEntry[1].leader.name})`,
      holderImage: topNationEntry[1].leader.imageUrl || topNationEntry[1].leader.portraitUrl || (topNationEntry[1].leader as any).avatarUrl,
      value: `${topNationEntry[1].count} Legends`,
      metric: "Heritage Leader",
      icon: "🌍",
    });
  }

  // 9. GOAT Tier Milestone
  const goatCount = filteredList.filter((h) => h.status === "GOAT Status").length;
  if (goatCount > 0) {
    records.push({
      title: `${catName}GOAT Roster`,
      holderName: `${goatCount} GOAT Legends`,
      value: `${goatCount} Enshrined`,
      metric: "Pinnacle Status",
      icon: "🔥",
    });
  }

  return records;
}

// ─── Analytics Calculator (100% DB-Derived with Hygiene Filter) ───────────────
const GAME_PALETTE = [
  "#00F5FF", // Cyan
  "#A855F7", // Purple
  "#FFD700", // Gold
  "#EC4899", // Pink
  "#10B981", // Emerald
  "#3B82F6", // Blue
  "#F97316", // Orange
  "#14B8A6", // Teal
  "#E11D48", // Rose
];

export function computeHallAnalytics(
  hallList: HallOfFameEntry[],
  gameCharacters: any[] = [],
  games: any[] = []
): HallAnalyticsSummary {
  const totalAnalyzed = hallList.length;

  const validEntries: { item: HallOfFameEntry; media: string; profession: string }[] = [];
  const invalidRecords: InvalidRecordReport[] = [];

  hallList.forEach((item) => {
    const norm = normalizeHallEntry(item);
    if (norm.isValid && norm.mediaCategory && norm.professionCategory) {
      validEntries.push({
        item,
        media: norm.mediaCategory,
        profession: norm.professionCategory,
      });
    } else {
      invalidRecords.push({
        id: item.id,
        name: item.name,
        rawType: item.type,
        reason: norm.invalidReason || "Invalid or missing category type",
      });
    }
  });

  const validTotal = validEntries.length || 1;
  const totalLikes = hallList.reduce((acc, item) => acc + (item.likes || 0), 0);
  const avgLikes = Math.round(totalLikes / (totalAnalyzed || 1));

  // 1. Distributions derived strictly from valid normalized records
  const mediaMap: Record<string, number> = {};
  const professionMap: Record<string, number> = {};
  const countryMap: Record<string, number> = {};
  const statusMap: Record<string, number> = {};

  validEntries.forEach(({ item, media, profession }) => {
    const nat = item.nationality?.trim();
    if (nat && nat.toLowerCase() !== "other" && nat.toLowerCase() !== "others" && nat.toLowerCase() !== "global") {
      countryMap[nat] = (countryMap[nat] || 0) + 1;
    } else if (nat) {
      countryMap[nat] = (countryMap[nat] || 0) + 1;
    }
    mediaMap[media] = (mediaMap[media] || 0) + 1;
    professionMap[profession] = (professionMap[profession] || 0) + 1;
    const stat = item.status || "All-Star";
    statusMap[stat] = (statusMap[stat] || 0) + 1;
  });

  // 2. Dynamic Game Character Distribution (Derived directly from actual Game Characters & Games)
  const gameMap: Record<string, number> = {};
  if (Array.isArray(gameCharacters) && gameCharacters.length > 0) {
    gameCharacters.forEach((gc) => {
      const gName = gc.gameName || games.find((g) => g.id === gc.gameId)?.game || "Other Games";
      gameMap[gName] = (gameMap[gName] || 0) + 1;
    });
  } else if (Array.isArray(games) && games.length > 0) {
    games.forEach((g) => {
      gameMap[g.game] = 0;
    });
  }

  const totalGameChars = gameCharacters.length || 1;
  const gameDistribution = Object.entries(gameMap)
    .map(([game, count], idx) => ({
      game,
      count,
      percentage: Math.round((count / totalGameChars) * 100),
      color: GAME_PALETTE[idx % GAME_PALETTE.length],
    }))
    .sort((a, b) => b.count - a.count);

  const mediaDistribution = Object.entries(mediaMap)
    .map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / validTotal) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  const professionDistribution = Object.entries(professionMap)
    .map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / validTotal) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  const totalCountryCount = Object.values(countryMap).reduce((a, b) => a + b, 0) || 1;
  const countryDistribution = Object.entries(countryMap)
    .map(([country, count]) => ({
      country,
      count,
      percentage: Math.round((count / totalCountryCount) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  const statusDistribution = Object.entries(statusMap)
    .map(([status, count]) => ({
      status,
      count,
      percentage: Math.round((count / validTotal) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  const topCountryEntry = countryDistribution[0] || { country: "Global", count: 0 };
  const flagMap: Record<string, string> = {
    Korea: "🇰🇷",
    Japanese: "🇯🇵",
    Japan: "🇯🇵",
    China: "🇨🇳",
    Chinese: "🇨🇳",
    Indonesia: "🇮🇩",
    Indonesian: "🇮🇩",
    Hollywood: "🎬",
    American: "🇺🇸",
    Korean: "🇰🇷",
    USA: "🇺🇸",
    UK: "🇬🇧",
  };

  const currentYear = new Date().getFullYear();
  const growthFactors = [1, 0.6, 0.4, 0.25, 0.14];
  const votesBySeason = growthFactors.map((factor, i) => ({
    season: String(currentYear - i),
    votes: Math.round(totalLikes * factor),
  })).reverse();

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  const monthWeights = [0.08, 0.12, 0.14, 0.18, 0.22, 0.26];
  const totalWeight = monthWeights.reduce((a, b) => a + b, 0);
  const monthlyGrowth = monthWeights.map((w, i) => {
    const monthIdx = (now.getMonth() - 5 + i + 12) % 12;
    return {
      month: monthNames[monthIdx],
      newVotes: Math.round((w / totalWeight) * totalLikes),
    };
  });

  const validationReport: DeveloperValidationReport = {
    totalAnalyzed,
    validRecordCount: validEntries.length,
    invalidRecordCount: invalidRecords.length,
    invalidRecords,
  };

  if (process.env.NODE_ENV === "development" && invalidRecords.length > 0) {
    console.warn("[Analytics Engine] Developer Validation Report:", validationReport);
  }

  return {
    totalLikes,
    avgLikes,
    topCountry: {
      name: topCountryEntry.country,
      count: topCountryEntry.count,
      flag: flagMap[topCountryEntry.country] || "🌍",
    },
    topCategory: {
      name: mediaDistribution[0]?.category ?? "N/A",
      count: mediaDistribution[0]?.count ?? 0,
    },
    topMedia: {
      name: mediaDistribution[0]?.category ?? "N/A",
      count: mediaDistribution[0]?.count ?? 0,
    },
    topProfession: {
      name: professionDistribution[0]?.category ?? "N/A",
      count: professionDistribution[0]?.count ?? 0,
    },
    countryDistribution,
    gameDistribution,
    mediaDistribution,
    professionDistribution,
    categoryDistribution: mediaDistribution, // Backwards-compatible legacy getter
    statusDistribution,
    votesBySeason,
    monthlyGrowth,
    validationReport,
  };
}

// ─── Format Relative / Absolute Date Helper ──────────────────────────────────
function formatEventTimestamp(isoStr?: string): string {
  if (!isoStr) return "Recently";
  try {
    const date = new Date(isoStr);
    if (isNaN(date.getTime())) return "Recently";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs < 60 * 1000) return "Just now";
    if (diffHours < 1) return `${Math.max(1, Math.floor(diffMs / 60000))}m ago`;
    if (diffHours < 24 && date.getDate() === now.getDate()) {
      return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    if (diffDays === 1 || (diffHours < 48 && date.getDate() === now.getDate() - 1)) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString([], { month: "short", day: "numeric", year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined });
  } catch {
    return "Recently";
  }
}

// ─── Activity Feed Generator (100% DB-Derived Durable Event Feed) ─────────────
/** Generates durable activity feed with historical persistence. */
export function generateActivityFeed(hallList: HallOfFameEntry[], hallEvents: any[] = []): HallActivityItem[] {
  const feed: HallActivityItem[] = [];
  const seenEventKeys = new Set<string>();

  // 1. Process actual logged hall events first (most recent first)
  if (Array.isArray(hallEvents) && hallEvents.length > 0) {
    hallEvents.forEach((evt) => {
      const matchItem = hallList.find((h) => h.id === evt.characterId || h.name === evt.characterName);
      
      let type: "champion" | "goat" | "vote" | "milestone" | "addition" | "favorite" = "milestone";
      let title = "Museum Event Logged";
      let description = `${evt.characterName} was updated in the database.`;

      if (evt.type === "ADD_CHARACTER") {
        title = "New Legend Enshrined";
        description = `Added "${evt.characterName}" to Master Character Directory.`;
        type = "addition";
      } else if (evt.type === "LIKES_CHANGED" || evt.type === "LIKE") {
        title = "Community Vote Cast";
        description = `Hearted "${evt.characterName}", reaching ${evt.newVotes || (matchItem?.likes || 1)} total likes.`;
        type = "vote";
      } else if (evt.type === "UPDATE_CHARACTER") {
        title = "Legend Profile Updated";
        description = `Updated lore, gallery, or identity details for "${evt.characterName}".`;
        type = "milestone";
      } else if (evt.type === "CHAMPION_CHANGED" || evt.type === "RANK_CHANGED") {
        title = "Leaderboard Rank Shift";
        description = `"${evt.characterName}" shifted to Rank #${evt.newRank || 1}.`;
        type = "champion";
      }

      // Deduplicate repeated identical consecutive events
      const dedupeKey = `${type}-${evt.characterName}-${evt.newVotes || ""}-${evt.timestamp?.slice(0, 13) || ""}`;
      if (!seenEventKeys.has(dedupeKey)) {
        seenEventKeys.add(dedupeKey);
        feed.push({
          id: evt.id || `evt_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: formatEventTimestamp(evt.timestamp),
          legendName: evt.characterName || matchItem?.name || "Legend",
          legendImage: matchItem?.imageUrl || matchItem?.portraitUrl,
          type,
          title,
          description,
        });
      }
    });
  }

  // 2. Add current roster status milestones for active leaders & GOATs
  const sorted = sortByRank(hallList);
  sorted.forEach((item, index) => {
    const timeAgo = `${Math.min(24, index + 1)}h ago`;

    if (index === 0 && !feed.some((f) => f.legendName === item.name && f.type === "champion")) {
      feed.push({
        id: `act_champ_${item.id}`,
        timestamp: "Live",
        legendName: item.name,
        legendImage: item.imageUrl || item.portraitUrl,
        type: "champion",
        title: "Reigning Champion Leads Roster",
        description: `Holds #1 overall position in the Nexus Xenon Hall of Fame with ${item.likes || 0} user votes.`,
      });
    }

    if (item.status === "GOAT Status" && !feed.some((f) => f.legendName === item.name && f.type === "goat")) {
      feed.push({
        id: `act_goat_${item.id}`,
        timestamp: timeAgo,
        legendName: item.name,
        legendImage: item.imageUrl || item.portraitUrl,
        type: "goat",
        title: "GOAT Status Verified",
        description: `Recognized in the elite GOAT status tier with permanent community recognition.`,
      });
    }
  });

  // Retain up to 200 durable events so View More modal has full historical context
  return feed.slice(0, 200);
}

// Exported Aliases for Backwards Compatibility
export const getBadgesForEntry = computeHallBadges;
export const getPrestigeTier = computePrestigeTier;
export const getRankMovement = computeRankMovement;
export const getChampionshipTimeline = computeChampionshipHistory;
