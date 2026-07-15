import type { AnimeEntry, DramaEntry, HallOfFameEntry } from "@/lib/store/dashboardStore";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Recommendation {
  id: string;
  type: "anime" | "drama" | "talent";
  title: string;
  subtitle: string;
  reason: string;
  score: number;       // 0–100
  matchTags: string[]; // Genre/nationality tags that matched
  url: string;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function tokenize(str?: string | null): string[] {
  if (!str) return [];
  return str.toLowerCase().split(/[,\s/·]+/).filter((t) => t.length > 2);
}

function overlapScore(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const setA = new Set(a.map((x) => x.toLowerCase()));
  const matches = b.filter((x) => setA.has(x.toLowerCase()));
  return Math.round((matches.length / Math.max(a.length, b.length)) * 100);
}

// ─── Preference Extraction ────────────────────────────────────────────────────

function extractAnimePreferences(animeList: AnimeEntry[]) {
  const completed = animeList.filter(
    (a) => a.status === "Completed" && (a.rating ?? 0) >= 7
  );
  const genreFreq: Record<string, number> = {};
  const studioFreq: Record<string, number> = {};

  completed.forEach((a) => {
    tokenize(a.genre).forEach((g) => {
      genreFreq[g] = (genreFreq[g] || 0) + (a.rating ?? 5);
    });
    if (a.studio) studioFreq[a.studio] = (studioFreq[a.studio] || 0) + 1;
  });

  const topGenres = Object.entries(genreFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([g]) => g);

  const topStudios = Object.entries(studioFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([s]) => s);

  return { topGenres, topStudios };
}

function extractDramaPreferences(dramas: DramaEntry[]) {
  const completed = dramas.filter(
    (d) => d.status === "Completed" && (d.rating ?? 0) >= 7
  );
  const countryFreq: Record<string, number> = {};
  const genreFreq: Record<string, number> = {};

  completed.forEach((d) => {
    countryFreq[d.country] = (countryFreq[d.country] || 0) + d.rating;
    tokenize(d.genre).forEach((g) => {
      genreFreq[g] = (genreFreq[g] || 0) + d.rating;
    });
  });

  const topCountries = Object.entries(countryFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([c]) => c);

  const topGenres = Object.entries(genreFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([g]) => g);

  return { topCountries, topGenres };
}

// ─── Main Recommendation Engine ───────────────────────────────────────────────

export function computeRecommendations(
  animeList: AnimeEntry[],
  dramas: DramaEntry[],
  hallOfFame: HallOfFameEntry[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  const { topGenres: animeGenres, topStudios } = extractAnimePreferences(animeList);
  const { topCountries: dramaCountries, topGenres: dramaGenres } = extractDramaPreferences(dramas);

  // ── 1. Recommend unwatched/in-progress anime similar to completed hits ──
  const incompleteAnime = animeList.filter(
    (a) => a.status === "Watching" || a.status === "On Hold" || a.status === "Plan to Watch"
  );

  incompleteAnime.forEach((a) => {
    const aGenres = tokenize(a.genre);
    const genreMatch = overlapScore(animeGenres, aGenres);
    const studioBonus = topStudios.includes(a.studio ?? "") ? 15 : 0;

    const score = Math.min(99, genreMatch + studioBonus + (a.rating ? a.rating * 3 : 10));
    if (score < 20) return;

    const matchTags = aGenres.filter((g) => animeGenres.includes(g)).slice(0, 3);

    recommendations.push({
      id: `anime-${a.id}`,
      type: "anime",
      title: a.title,
      subtitle: `${a.episodesWatched}/${a.totalEpisodes} eps · ${a.status}`,
      reason: matchTags.length
        ? `Matches your love for ${matchTags.slice(0, 2).join(", ")} anime`
        : "In your watchlist — pick it back up!",
      score,
      matchTags,
      url: "/anime",
    });
  });

  // ── 2. Recommend on-hold / plan-to-watch dramas ──
  const inactiveDramas = dramas.filter(
    (d) => d.status === "On Hold" || d.status === "Plan to Watch" || d.status === "Watching"
  );

  inactiveDramas.forEach((d) => {
    const dGenres = tokenize(d.genre);
    const genreMatch = overlapScore(dramaGenres, dGenres);
    const countryBonus = dramaCountries.includes(d.country) ? 20 : 0;

    const score = Math.min(99, genreMatch + countryBonus + d.rating * 3);
    if (score < 20) return;

    const matchTags = [
      d.country.charAt(0).toUpperCase() + d.country.slice(1),
      ...dGenres.filter((g) => dramaGenres.includes(g)).slice(0, 2),
    ];

    recommendations.push({
      id: `drama-${d.id}`,
      type: "drama",
      title: d.title,
      subtitle: `${d.country.toUpperCase()} · ${d.episodesWatched}/${d.episodes} eps`,
      reason: `You love ${dramaCountries[0] || "drama"} content — finish this one!`,
      score,
      matchTags,
      url: `/drama/${d.country}`,
    });
  });

  // ── 3. Recommend rising HOF talent not yet at GOAT Status ──
  const risingTalent = hallOfFame
    .filter((h) => h.status === "Rising" || h.status === "All-Star")
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
    .slice(0, 3);

  risingTalent.forEach((h) => {
    const dramaMatch = h.associatedDramas?.some((d) =>
      dramas.some((dr) => dr.title.toLowerCase().includes(d.toLowerCase()))
    );
    const score = Math.min(99, (h.likes || 0) * 5 + (dramaMatch ? 25 : 10));

    recommendations.push({
      id: `talent-${h.id}`,
      type: "talent",
      title: h.name,
      subtitle: `${h.type} · ${h.status} · ${h.nationality || "Intl"}`,
      reason: dramaMatch
        ? `Stars in dramas you've watched`
        : `Trending in your Hall of Fame (${h.likes || 0} likes)`,
      score,
      matchTags: [h.status, h.type, ...(h.knownFor?.slice(0, 1) || [])],
      url: "/hall-of-fame",
    });
  });

  // Sort by score desc, take top 5
  return recommendations.sort((a, b) => b.score - a.score).slice(0, 5);
}
