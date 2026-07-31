import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/drama/episode-count?imdbId=ttXXXXX
 *
 * Lazy OMDb season-by-season episode count resolver.
 * Iterates through each season until OMDb returns no data.
 * Returns { totalEpisodes: number | null }.
 */

const OMDB_KEY = process.env.OMDB_API_KEY;
const OMDB_BASE = "https://www.omdbapi.com";

async function fetchSeasonEpisodeCount(imdbId: string, season: number): Promise<number | null> {
  if (!OMDB_KEY) return null;
  try {
    const qs = new URLSearchParams({
      apikey: OMDB_KEY,
      i: imdbId,
      Season: String(season),
    });
    const res = await fetch(`${OMDB_BASE}/?${qs.toString()}`, {
      next: { revalidate: 86400 }, // cache for 24h
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.Response === "False" || !Array.isArray(data.Episodes)) return null;
    return data.Episodes.length;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const imdbId = req.nextUrl.searchParams.get("imdbId")?.trim();
  if (!imdbId) {
    return NextResponse.json({ error: "imdbId is required" }, { status: 400 });
  }

  if (!OMDB_KEY) {
    return NextResponse.json({ totalEpisodes: null, reason: "OMDB_API_KEY not configured" });
  }

  try {
    let totalEpisodes = 0;
    let season = 1;
    const MAX_SEASONS = 30; // Guard against infinite loop

    while (season <= MAX_SEASONS) {
      const count = await fetchSeasonEpisodeCount(imdbId, season);
      if (count === null) break; // No more seasons
      totalEpisodes += count;
      season++;
    }

    if (totalEpisodes === 0) {
      return NextResponse.json({ totalEpisodes: null, reason: "No episode data found" });
    }

    return NextResponse.json({ totalEpisodes });
  } catch (err: any) {
    console.error("[/api/drama/episode-count] Error:", err);
    return NextResponse.json({ totalEpisodes: null, error: err.message });
  }
}
