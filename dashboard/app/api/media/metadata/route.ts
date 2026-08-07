import { NextRequest, NextResponse } from "next/server";

const OMDB_KEY = process.env.OMDB_API_KEY;
const OMDB_BASE = "https://www.omdbapi.com";

// 24-hour LRU In-Memory Metadata Cache
const metadataCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export interface MetadataSearchQuery {
  title: string;
  year?: number;
  mediaType?: "movie" | "drama" | "anime" | "tv";
  imdbId?: string;
  tmdbId?: string;
  tvmazeId?: string;
  anilistId?: string;
  malId?: number;
}

export interface CandidateMatch {
  id: string;
  title: string;
  originalTitle?: string;
  year?: number;
  mediaType: string;
  posterUrl?: string;
  synopsis?: string;
  confidenceScore: number;
  imdbId?: string;
  tmdbId?: string;
  tvmazeId?: string;
  malId?: number;
  rawDetails?: any;
}

// ── CONFIDENCE SCORING ALGORITHM ──────────────────────────────────────────────
export function calculateConfidence(query: MetadataSearchQuery, candidate: {
  title: string;
  originalTitle?: string;
  year?: number;
  mediaType?: string;
  imdbId?: string;
  tmdbId?: string;
  tvmazeId?: string;
  malId?: number;
}): number {
  // 1. Direct External ID Match ➔ 100%
  if (query.imdbId && candidate.imdbId === query.imdbId) return 100;
  if (query.tmdbId && candidate.tmdbId === query.tmdbId) return 100;
  if (query.tvmazeId && candidate.tvmazeId === query.tvmazeId) return 100;
  if (query.malId && candidate.malId === query.malId) return 100;

  const qTitle = query.title.trim().toLowerCase();
  const cTitle = (candidate.title || "").trim().toLowerCase();
  const cOrigTitle = (candidate.originalTitle || "").trim().toLowerCase();

  let score = 0;

  // 2. Title Match
  if (qTitle === cTitle || qTitle === cOrigTitle) {
    score += 70;
  } else if (cTitle.startsWith(qTitle) || qTitle.startsWith(cTitle)) {
    // Penalize title distinction (e.g., "Taken" vs "Taken 2")
    const qWords = qTitle.split(/\s+/);
    const cWords = cTitle.split(/\s+/);
    if (Math.abs(qWords.length - cWords.length) >= 1) {
      score += 45; // Penalize extra sequel numbers or subtitles
    } else {
      score += 60;
    }
  } else if (cTitle.includes(qTitle) || qTitle.includes(cTitle)) {
    score += 35;
  } else {
    score += 20;
  }

  // 3. Release Year Match (+25% or -20%)
  if (query.year && candidate.year) {
    const qY = Number(query.year);
    const cY = Number(candidate.year);
    if (qY === cY) {
      score += 25;
    } else if (Math.abs(qY - cY) === 1) {
      score += 10;
    } else {
      score -= 25; // Heavily penalize year mismatch (e.g. Taken 2008 vs Taken 2 2012)
    }
  }

  // 4. Media Type Match (+5%)
  if (query.mediaType && candidate.mediaType) {
    const qType = query.mediaType.toLowerCase();
    const cType = candidate.mediaType.toLowerCase();
    if (qType === cType || (qType === "drama" && cType === "tv")) {
      score += 5;
    }
  }

  return Math.min(100, Math.max(0, score));
}

// ── ANIME FETCHING (JIKAN / MAL API) ──────────────────────────────────────────
async function fetchJikanAnime(title: string, malId?: number): Promise<CandidateMatch[]> {
  try {
    const url = malId
      ? `https://api.jikan.moe/v4/anime/${malId}/full`
      : `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=5`;

    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return [];
    const json = await res.json();
    const items = malId ? (json.data ? [json.data] : []) : json.data || [];

    return items.map((item: any) => ({
      id: `mal-${item.mal_id}`,
      title: item.title_english || item.title,
      originalTitle: item.title_japanese || item.title,
      year: item.aired?.prop?.from?.year || undefined,
      mediaType: item.type?.toLowerCase() || "anime",
      posterUrl: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || undefined,
      synopsis: item.synopsis || undefined,
      confidenceScore: 0,
      malId: item.mal_id,
      rawDetails: {
        episodes: item.episodes,
        status: item.status,
        score: item.score,
        studio: item.studios?.[0]?.name,
        source: item.source,
        genres: item.genres?.map((g: any) => g.name) || [],
      },
    }));
  } catch (err) {
    console.warn(`[Jikan API] Error fetching anime '${title}':`, err);
    return [];
  }
}

async function fetchJikanAnimeCharacters(malId: number): Promise<any[]> {
  try {
    const url = `https://api.jikan.moe/v4/anime/${malId}/characters`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return [];
    const json = await res.json();
    const chars = json.data || [];

    return chars.slice(0, 12).map((item: any, idx: number) => {
      const jpVa = item.voice_actors?.find((va: any) => va.language === "Japanese");
      const enVa = item.voice_actors?.find((va: any) => va.language === "English");

      return {
        id: `anime-cast-${item.character?.mal_id || idx}`,
        name: jpVa?.person?.name || item.character?.name,
        characterName: item.character?.name,
        role: item.role === "Main" ? "Main Role" : "Supporting Role",
        photoUrl: jpVa?.person?.images?.jpg?.image_url || item.character?.images?.jpg?.image_url || undefined,
        characterImageUrl: item.character?.images?.jpg?.image_url || undefined,
        nationality: jpVa ? `Voice Actor (JP: ${jpVa.person.name}${enVa ? ` | EN: ${enVa.person.name}` : ""})` : undefined,
      };
    });
  } catch {
    return [];
  }
}

async function fetchJikanAnimeThemes(malId: number): Promise<any[]> {
  try {
    const url = `https://api.jikan.moe/v4/anime/${malId}/themes`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return [];
    const json = await res.json();
    const data = json.data || {};

    const ops = (data.openings || []).map((op: string, idx: number) => {
      const cleanText = op.replace(/^"\d+:\s*"/, "").replace(/"/g, "");
      return {
        id: `op-${idx}`,
        title: cleanText,
        artist: "Anime Opening Theme",
        type: "OP",
        youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanText + " OP")}`,
        spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(cleanText)}`,
      };
    });

    const eds = (data.endings || []).map((ed: string, idx: number) => {
      const cleanText = ed.replace(/^"\d+:\s*"/, "").replace(/"/g, "");
      return {
        id: `ed-${idx}`,
        title: cleanText,
        artist: "Anime Ending Theme",
        type: "ED",
        youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanText + " ED")}`,
        spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(cleanText)}`,
      };
    });

    return [...ops, ...eds];
  } catch {
    return [];
  }
}

// ── DRAMA & TV FETCHING (TVMAZE API) ─────────────────────────────────────────
async function fetchTvMazeCandidates(title: string, tvmazeId?: string): Promise<CandidateMatch[]> {
  try {
    const url = tvmazeId
      ? `https://api.tvmaze.com/shows/${tvmazeId}?embed[]=cast&embed[]=episodes`
      : `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(title)}`;

    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return [];
    const json = await res.json();

    const items = tvmazeId
      ? [json]
      : Array.isArray(json)
      ? json.map((j: any) => j.show)
      : [];

    return items.filter(Boolean).map((item: any) => ({
      id: `tvmaze-${item.id}`,
      title: item.name,
      year: item.premiered ? parseInt(item.premiered.split("-")[0]) : undefined,
      mediaType: "drama",
      posterUrl: item.image?.original || item.image?.medium || undefined,
      synopsis: item.summary?.replace(/<[^>]*>?/gm, "") || undefined,
      confidenceScore: 0,
      tvmazeId: String(item.id),
      imdbId: item.externals?.imdb || undefined,
      rawDetails: item,
    }));
  } catch (err) {
    console.warn(`[TVMaze API] Error searching '${title}':`, err);
    return [];
  }
}

// ── OMDB FETCHING ──────────────────────────────────────────────────────────────
async function fetchOmdbCandidates(title: string, imdbId?: string): Promise<CandidateMatch[]> {
  if (!OMDB_KEY) return [];
  try {
    const params: Record<string, string> = { apikey: OMDB_KEY, plot: "full" };
    if (imdbId) {
      params.i = imdbId;
    } else {
      params.s = title;
    }

    const qs = new URLSearchParams(params);
    const res = await fetch(`${OMDB_BASE}/?${qs.toString()}`, { next: { revalidate: 86400 } });
    if (!res.ok) return [];
    const data = await res.json();

    if (imdbId && data.Response === "True") {
      return [{
        id: `omdb-${data.imdbID}`,
        title: data.Title,
        year: data.Year ? parseInt(data.Year) : undefined,
        mediaType: data.Type === "movie" ? "movie" : "drama",
        posterUrl: data.Poster !== "N/A" ? data.Poster : undefined,
        synopsis: data.Plot !== "N/A" ? data.Plot : undefined,
        confidenceScore: 100,
        imdbId: data.imdbID,
        rawDetails: data,
      }];
    }

    const searchHits = data.Search || [];
    return searchHits.slice(0, 5).map((item: any) => ({
      id: `omdb-${item.imdbID}`,
      title: item.Title,
      year: item.Year ? parseInt(item.Year) : undefined,
      mediaType: item.Type === "movie" ? "movie" : "drama",
      posterUrl: item.Poster !== "N/A" ? item.Poster : undefined,
      confidenceScore: 0,
      imdbId: item.imdbID,
    }));
  } catch {
    return [];
  }
}

// ── ITUNES OST FETCHING ────────────────────────────────────────────────────────
async function fetchItunesOstTracks(title: string): Promise<any[]> {
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(title + " OST")}&entity=song&limit=10`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map((track: any) => {
      const ms = track.trackTimeMillis || 0;
      const mins = Math.floor(ms / 60000);
      const secs = Math.floor((ms % 60000) / 1000);
      return {
        id: `ost-${track.trackId}`,
        title: track.trackName,
        artist: track.artistName,
        type: "OST",
        albumArt: track.artworkUrl100?.replace("100x100bb", "600x600bb") || undefined,
        duration: ms > 0 ? `${mins}:${secs < 10 ? "0" : ""}${secs}` : undefined,
        releaseDate: track.releaseDate ? track.releaseDate.split("T")[0] : undefined,
        previewUrl: track.previewUrl || undefined,
        spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(track.trackName + " " + track.artistName)}`,
        youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(track.trackName + " " + track.artistName + " OST")}`,
        appleMusicUrl: track.collectionViewUrl || undefined,
        url: track.previewUrl || track.collectionViewUrl || undefined,
      };
    });
  } catch {
    return [];
  }
}

// ── MAIN UNIFIED GET ROUTE ─────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title")?.trim();
  const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined;
  const mediaType = (searchParams.get("mediaType")?.toLowerCase() as any) || "drama";
  const imdbId = searchParams.get("imdbId")?.trim();
  const tmdbId = searchParams.get("tmdbId")?.trim();
  const tvmazeId = searchParams.get("tvmazeId")?.trim();
  const malId = searchParams.get("malId") ? parseInt(searchParams.get("malId")!) : undefined;
  const forceSelect = searchParams.get("forceSelect") === "true";

  if (!title && !imdbId && !tvmazeId && !malId) {
    return NextResponse.json({ error: "Title or external ID required" }, { status: 400 });
  }

  const query: MetadataSearchQuery = { title: title || "", year, mediaType, imdbId, tmdbId, tvmazeId, malId };
  const cacheKey = `${title?.toLowerCase()}_${year}_${mediaType}_${imdbId}_${tvmazeId}_${malId}`;

  const cached = metadataCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS && !forceSelect) {
    return NextResponse.json({ success: true, metadata: cached.data, cached: true });
  }

  try {
    let candidates: CandidateMatch[] = [];

    if (mediaType === "anime") {
      candidates = await fetchJikanAnime(title || "", malId);
    } else {
      const [tvmazeHits, omdbHits] = await Promise.all([
        fetchTvMazeCandidates(title || "", tvmazeId),
        fetchOmdbCandidates(title || "", imdbId),
      ]);
      candidates = [...tvmazeHits, ...omdbHits];
    }

    // Calculate confidence for each candidate
    candidates.forEach((c) => {
      c.confidenceScore = calculateConfidence(query, c);
    });

    // Sort by highest confidence score
    candidates.sort((a, b) => b.confidenceScore - a.confidenceScore);

    const topMatch = candidates[0];

    // If top match confidence < 90% and there are multiple candidates, return selection payload!
    if (!forceSelect && (!topMatch || topMatch.confidenceScore < 90) && candidates.length > 1) {
      return NextResponse.json({
        success: false,
        requiresConfirmation: true,
        confidenceScore: topMatch?.confidenceScore || 0,
        query,
        candidates: candidates.slice(0, 5).map((c) => ({
          id: c.id,
          title: c.title,
          originalTitle: c.originalTitle,
          year: c.year,
          mediaType: c.mediaType,
          posterUrl: c.posterUrl,
          synopsis: c.synopsis,
          confidenceScore: c.confidenceScore,
          imdbId: c.imdbId,
          tvmazeId: c.tvmazeId,
          malId: c.malId,
        })),
      });
    }

    // Load full details for top match
    let castGrid: any[] = [];
    let episodeLog: any[] = [];
    let ostTracks: any[] = [];
    let awards: string[] = [];
    const externalLinks: any = {
      imdb: topMatch?.imdbId ? `https://www.imdb.com/title/${topMatch.imdbId}` : undefined,
      mydramalist: `https://mydramalist.com/search?q=${encodeURIComponent(title || "")}`,
      wikipedia: `https://en.wikipedia.org/wiki/${encodeURIComponent((title || "").replace(/\s+/g, "_"))}`,
      officialSite: undefined,
      trailerUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent((title || "") + " Official Trailer")}`,
      netflix: `https://www.netflix.com/search?q=${encodeURIComponent(title || "")}`,
      disney: `https://www.disneyplus.com/search?q=${encodeURIComponent(title || "")}`,
      viki: `https://www.viki.com/search?q=${encodeURIComponent(title || "")}`,
      primeVideo: `https://www.amazon.com/s?k=${encodeURIComponent(title || "")}`,
    };

    if (mediaType === "anime" && topMatch?.malId) {
      const [animeCast, animeThemes, itunesOst] = await Promise.all([
        fetchJikanAnimeCharacters(topMatch.malId),
        fetchJikanAnimeThemes(topMatch.malId),
        fetchItunesOstTracks(title || ""),
      ]);
      castGrid = animeCast;
      ostTracks = [...animeThemes, ...itunesOst];
    } else if (topMatch?.tvmazeId) {
      // Fetch full TVMaze show details with cast & episodes
      const tvMazeFull = await fetchTvMazeCandidates("", topMatch.tvmazeId);
      const rawTv = tvMazeFull[0]?.rawDetails;
      if (rawTv) {
        externalLinks.officialSite = rawTv.officialSite || undefined;
        externalLinks.tvmaze = `https://www.tvmaze.com/shows/${rawTv.id}`;

        const rawCast = rawTv._embedded?.cast || [];
        castGrid = rawCast.slice(0, 12).map((item: any, idx: number) => ({
          id: `cast-${item.person.id || idx}`,
          name: item.person.name,
          characterName: item.character.name,
          role: idx < 4 ? "Main Role" : "Supporting Role",
          photoUrl: item.person.image?.medium || item.character.image?.medium || undefined,
          characterImageUrl: item.character.image?.medium || undefined,
          nationality: item.person.country?.name || undefined,
        }));

        const rawEpisodes = rawTv._embedded?.episodes || [];
        episodeLog = rawEpisodes.map((ep: any) => ({
          number: ep.number,
          title: ep.name || `Episode ${ep.number}`,
          runtime: ep.runtime ? `${ep.runtime}m` : `${rawTv.runtime || 60}m`,
          airDate: ep.airdate || undefined,
          isWatched: false,
        }));
      }

      ostTracks = await fetchItunesOstTracks(title || "");
    } else {
      ostTracks = await fetchItunesOstTracks(title || "");
    }

    const metadata = {
      title: topMatch?.title || title,
      originalTitle: topMatch?.originalTitle || undefined,
      synopsis: topMatch?.synopsis || undefined,
      posterUrl: topMatch?.posterUrl || undefined,
      backdropUrl: topMatch?.posterUrl || undefined,
      year: topMatch?.year || year,
      country: mediaType === "anime" ? "japanese" : undefined,
      studio: topMatch?.rawDetails?.studio || undefined,
      runtime: topMatch?.rawDetails?.runtime ? `${topMatch.rawDetails.runtime} mins` : undefined,
      episodes: topMatch?.rawDetails?.episodes || episodeLog.length || undefined,
      genres: topMatch?.rawDetails?.genres || [],
      castGrid,
      episodeLog,
      ostTracks,
      awards,
      externalLinks,
      confidenceScore: topMatch?.confidenceScore || 100,
      imdbId: topMatch?.imdbId,
      tvmazeId: topMatch?.tvmazeId,
      malId: topMatch?.malId,
    };

    metadataCache.set(cacheKey, { data: metadata, timestamp: Date.now() });

    return NextResponse.json({
      success: true,
      requiresConfirmation: false,
      confidenceScore: metadata.confidenceScore,
      metadata,
    });
  } catch (err: any) {
    console.error("[Unified Media Metadata API Error]:", err);
    return NextResponse.json({ error: err?.message || "Failed to fetch metadata" }, { status: 500 });
  }
}
