import { NextRequest, NextResponse } from "next/server";

const OMDB_KEY = process.env.OMDB_API_KEY;
const OMDB_BASE = "https://www.omdbapi.com";

// In-Memory LRU Cache for drama metadata responses (revalidate after 24 hours)
const metadataCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface TvMazeCastMember {
  person: {
    id: number;
    name: string;
    image?: { medium?: string; original?: string } | null;
    country?: { name?: string } | null;
  };
  character: {
    id: number;
    name: string;
    image?: { medium?: string; original?: string } | null;
  };
  self?: boolean;
  voice?: boolean;
}

interface TvMazeEpisode {
  id: number;
  season: number;
  number: number;
  name: string;
  airdate?: string;
  runtime?: number;
  summary?: string;
}

interface TvMazeShow {
  id: number;
  name: string;
  type?: string;
  language?: string;
  genres?: string[];
  status?: string;
  runtime?: number;
  averageRuntime?: number;
  premiered?: string;
  ended?: string;
  officialSite?: string;
  network?: { name?: string; country?: { name?: string } } | null;
  webChannel?: { name?: string; country?: { name?: string } } | null;
  image?: { medium?: string; original?: string } | null;
  summary?: string;
  rating?: { average?: number } | null;
  externals?: { tvrage?: number; thetvdb?: number; imdb?: string } | null;
  _embedded?: {
    cast?: TvMazeCastMember[];
    episodes?: TvMazeEpisode[];
  };
}

async function fetchTvMaze(title: string): Promise<TvMazeShow | null> {
  try {
    const url = `https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(title)}&embed[]=cast&embed[]=episodes`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn(`[TVMaze Metadata] Fetch error for '${title}':`, err);
    return null;
  }
}

async function fetchItunesOst(title: string): Promise<any[]> {
  try {
    const query = `${title} OST`;
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=8`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.warn(`[iTunes OST] Fetch error for '${title}':`, err);
    return [];
  }
}

async function fetchOmdb(title: string, imdbId?: string): Promise<any | null> {
  if (!OMDB_KEY) return null;
  try {
    const params: Record<string, string> = { apikey: OMDB_KEY, plot: "full" };
    if (imdbId) {
      params.i = imdbId;
    } else {
      params.t = title;
    }
    const qs = new URLSearchParams(params);
    const res = await fetch(`${OMDB_BASE}/?${qs.toString()}`, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.Response === "True" ? data : null;
  } catch (err) {
    console.warn(`[OMDb Metadata] Fetch error for '${title}':`, err);
    return null;
  }
}

async function fetchWikipediaExtract(title: string): Promise<{ summary?: string; awardsText?: string } | null> {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=true&explaintext=true&titles=${encodeURIComponent(title)}&format=json&origin=*`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data.query?.pages;
    if (!pages) return null;
    const pageId = Object.keys(pages)[0];
    if (pageId === "-1") return null;
    return { summary: pages[pageId].extract };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const title = req.nextUrl.searchParams.get("title")?.trim();
  const imdbId = req.nextUrl.searchParams.get("imdbId")?.trim();

  if (!title && !imdbId) {
    return NextResponse.json({ error: "Title or imdbId parameter required" }, { status: 400 });
  }

  const cacheKey = `${title?.toLowerCase() || ""}_${imdbId || ""}`;
  const cached = metadataCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({ success: true, metadata: cached.data, cached: true });
  }

  try {
    // Concurrent fetch from TVMaze, OMDb, iTunes, and Wikipedia
    const [tvMazeData, omdbData, itunesTracks, wikiData] = await Promise.all([
      fetchTvMaze(title || ""),
      fetchOmdb(title || "", imdbId),
      fetchItunesOst(title || ""),
      fetchWikipediaExtract(title || ""),
    ]);

    // 1. Process Cast
    const rawCast = tvMazeData?._embedded?.cast || [];
    const castGrid = rawCast.slice(0, 12).map((item, idx) => ({
      id: `cast-${item.person.id || idx}`,
      name: item.person.name,
      characterName: item.character.name,
      role: idx < 4 ? "Main Role" : "Supporting Role",
      photoUrl: item.person.image?.medium || item.character.image?.medium || undefined,
      characterImageUrl: item.character.image?.medium || undefined,
      nationality: item.person.country?.name || undefined,
    }));

    // Fallback cast from OMDb if TVMaze cast is empty
    if (castGrid.length === 0 && omdbData?.Actors && omdbData.Actors !== "N/A") {
      const actorNames: string[] = omdbData.Actors.split(",").map((a: string) => a.trim());
      actorNames.forEach((name, idx) => {
        castGrid.push({
          id: `omdb-cast-${idx}`,
          name,
          characterName: "Main Character",
          role: idx < 2 ? "Main Role" : "Supporting Role",
          photoUrl: undefined,
          characterImageUrl: undefined,
          nationality: undefined,
        });
      });
    }

    // 2. Process Episode Guide
    const rawEpisodes = tvMazeData?._embedded?.episodes || [];
    const episodeLog = rawEpisodes.map((ep) => ({
      number: ep.number,
      title: ep.name || `Episode ${ep.number}`,
      runtime: ep.runtime ? `${ep.runtime}m` : (tvMazeData?.runtime ? `${tvMazeData.runtime}m` : "60m"),
      airDate: ep.airdate || undefined,
      isWatched: false,
    }));

    // 3. Process Soundtracks (OST)
    const ostTracks = itunesTracks.map((track) => {
      const durationMs = track.trackTimeMillis || 0;
      const mins = Math.floor(durationMs / 60000);
      const secs = Math.floor((durationMs % 60000) / 1000);
      const durationStr = durationMs > 0 ? `${mins}:${secs < 10 ? "0" : ""}${secs}` : undefined;

      return {
        id: `ost-${track.trackId}`,
        title: track.trackName,
        artist: track.artistName,
        type: "OST",
        albumArt: track.artworkUrl100?.replace("100x100bb", "600x600bb") || undefined,
        duration: durationStr,
        releaseDate: track.releaseDate ? track.releaseDate.split("T")[0] : undefined,
        previewUrl: track.previewUrl || undefined,
        spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(track.trackName + " " + track.artistName)}`,
        youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(track.trackName + " " + track.artistName + " OST")}`,
        appleMusicUrl: track.collectionViewUrl || undefined,
        url: track.previewUrl || track.collectionViewUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(track.trackName + " " + track.artistName)}`,
      };
    });

    // 4. Process Awards
    const awardsList: string[] = [];
    if (omdbData?.Awards && omdbData.Awards !== "N/A") {
      const splitAwards = omdbData.Awards.split(".").map((a: string) => a.trim()).filter(Boolean);
      splitAwards.forEach((a: string) => awardsList.push(`🏆 ${a}`));
    }

    // 5. External Links
    const resolvedImdbId = tvMazeData?.externals?.imdb || omdbData?.imdbID || imdbId;
    const externalLinks = {
      imdb: resolvedImdbId ? `https://www.imdb.com/title/${resolvedImdbId}` : undefined,
      tmdb: undefined,
      tvmaze: tvMazeData?.id ? `https://www.tvmaze.com/shows/${tvMazeData.id}` : undefined,
      mydramalist: `https://mydramalist.com/search?q=${encodeURIComponent(title || "")}`,
      wikipedia: `https://en.wikipedia.org/wiki/${encodeURIComponent((title || "").replace(/\s+/g, "_"))}`,
      officialSite: tvMazeData?.officialSite || undefined,
      trailerUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent((title || "") + " Official Trailer")}`,
      netflix: `https://www.netflix.com/search?q=${encodeURIComponent(title || "")}`,
      disney: `https://www.disneyplus.com/search?q=${encodeURIComponent(title || "")}`,
      viki: `https://www.viki.com/search?q=${encodeURIComponent(title || "")}`,
      primeVideo: `https://www.amazon.com/s?k=${encodeURIComponent(title || "")}`,
    };

    // 6. Assembly Final Metadata Object
    const metadata = {
      title: tvMazeData?.name || omdbData?.Title || title,
      originalTitle: omdbData?.Title !== title ? omdbData?.Title : undefined,
      synopsis: tvMazeData?.summary?.replace(/<[^>]*>?/gm, "") || omdbData?.Plot || wikiData?.summary || undefined,
      posterUrl: tvMazeData?.image?.original || tvMazeData?.image?.medium || (omdbData?.Poster && omdbData.Poster !== "N/A" ? omdbData.Poster : undefined),
      backdropUrl: tvMazeData?.image?.original || (omdbData?.Poster && omdbData.Poster !== "N/A" ? omdbData.Poster : undefined),
      year: tvMazeData?.premiered ? parseInt(tvMazeData.premiered.split("-")[0]) : (omdbData?.Year ? parseInt(omdbData.Year) : undefined),
      country: tvMazeData?.network?.country?.name?.toLowerCase().includes("korea") ? "korean" :
               tvMazeData?.network?.country?.name?.toLowerCase().includes("japan") ? "japanese" :
               tvMazeData?.network?.country?.name?.toLowerCase().includes("china") ? "chinese" : undefined,
      studio: tvMazeData?.network?.name || tvMazeData?.webChannel?.name || omdbData?.Production || undefined,
      runtime: tvMazeData?.runtime ? `${tvMazeData.runtime} mins / Episode` : (omdbData?.Runtime && omdbData.Runtime !== "N/A" ? omdbData.Runtime : undefined),
      episodes: tvMazeData?._embedded?.episodes?.length || (omdbData?.totalSeasons ? parseInt(omdbData.totalSeasons) * 12 : undefined),
      genres: tvMazeData?.genres || (omdbData?.Genre ? omdbData.Genre.split(",").map((g: string) => g.trim()) : []),
      castGrid,
      episodeLog,
      ostTracks,
      awards: awardsList,
      externalLinks,
    };

    metadataCache.set(cacheKey, { data: metadata, timestamp: Date.now() });

    return NextResponse.json({ success: true, metadata, cached: false });
  } catch (err: any) {
    console.error(`[Drama Metadata API Error]:`, err);
    return NextResponse.json({ error: err?.message || "Failed to fetch metadata" }, { status: 500 });
  }
}
