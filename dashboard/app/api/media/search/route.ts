import { NextRequest, NextResponse } from "next/server";

const OMDB_KEY = process.env.OMDB_API_KEY;
const OMDB_BASE = "https://www.omdbapi.com";

const RAPIDAPI_KEY = "df9e0323d6msh568900fd5ed78d5p126d02jsn11cf11d83c9a";
const RAPIDAPI_HOST = "imdb236.p.rapidapi.com";

export interface OmdbSearchResult {
  imdbID: string;
  Title: string;
  Year: string;
  Type: string;
  Poster: string;
}

export interface OmdbDetailResult {
  imdbID: string;
  Title: string;
  Year: string;
  Released: string;
  Type: string;
  Poster: string;
  Plot: string;
  Actors: string;
  Director: string;
  Genre: string;
  imdbRating: string;
  Response: string;
}

export interface CleanDramaResult {
  id: string;
  title: string;
  year: string;
  type: "Movie" | "Series";
  poster: string | null;
  overview: string;
  cast: string[];
  genre: string;
  rating: string;
  director?: string;
}

interface ImdbRapidApiSearchHit {
  id?: string;
  imdbId?: string;
  title?: string;
  year?: string | number;
  type?: string;
  poster?: string;
  posterUrl?: string;
}

interface ImdbRapidApiDetail {
  id?: string;
  imdbId?: string;
  title?: string;
  year?: string | number;
  type?: string;
  plot?: string;
  description?: string;
  actors?: string[] | string;
  cast?: string[] | string;
  director?: string;
  genre?: string;
  rating?: string | number;
  imdbRating?: string | number;
  poster?: string;
  posterUrl?: string;
}

async function fetchOmdb(params: Record<string, string>): Promise<any> {
  if (!OMDB_KEY) throw new Error("OMDB_API_KEY not set");
  const qs = new URLSearchParams({ apikey: OMDB_KEY, ...params });
  const res = await fetch(`${OMDB_BASE}/?${qs.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`OMDb error: ${res.status}`);
  return res.json();
}

async function fetchImdbRapidApiSearch(query: string): Promise<ImdbRapidApiSearchHit[]> {
  try {
    const url = `https://imdb236.p.rapidapi.com/api/imdb/search?title=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST
      },
      next: { revalidate: 3600 }
    });
    if (!res.ok) {
      console.warn(`IMDb RapidAPI search HTTP error: ${res.status}`);
      return [];
    }
    const data = await res.json();
    if (Array.isArray(data)) {
      return data;
    }
    if (data && Array.isArray(data.results)) {
      return data.results;
    }
    if (data && Array.isArray(data.Search)) {
      return data.Search;
    }
    if (data && Array.isArray(data.titles)) {
      return data.titles;
    }
    return [];
  } catch (err) {
    console.error("IMDb RapidAPI search query error:", err);
    return [];
  }
}

async function fetchImdbRapidApiDetail(id: string): Promise<ImdbRapidApiDetail | null> {
  try {
    const url = `https://imdb236.p.rapidapi.com/api/imdb/${id}/short`;
    const res = await fetch(url, {
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST
      },
      next: { revalidate: 3600 }
    });
    if (!res.ok) return null;
    return await res.json() as ImdbRapidApiDetail;
  } catch (err) {
    console.error(`IMDb RapidAPI detail query error for ${id}:`, err);
    return null;
  }
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query")?.trim();
  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    // 1. Parallel search trigger across OMDb (primary API) and IMDb RapidAPI
    const omdbMoviePromise = fetchOmdb({ s: query, type: "movie" }).catch(() => null);
    const omdbSeriesPromise = fetchOmdb({ s: query, type: "series" }).catch(() => null);
    const imdbSearchPromise = fetchImdbRapidApiSearch(query).catch(() => [] as ImdbRapidApiSearchHit[]);

    const [omdbMovieData, omdbSeriesData, imdbHits] = await Promise.all([
      omdbMoviePromise,
      omdbSeriesPromise,
      imdbSearchPromise,
    ]);

    // 2. Process OMDb Hits
    const omdbMovieHits: OmdbSearchResult[] = omdbMovieData?.Search ?? [];
    const omdbSeriesHits: OmdbSearchResult[] = omdbSeriesData?.Search ?? [];
    const omdbCombined = [...omdbMovieHits, ...omdbSeriesHits].slice(0, 8);

    // Fetch details for OMDb hits concurrently
    const omdbDetailPromises = omdbCombined.map(async (item) => {
      try {
        const detail = (await fetchOmdb({ i: item.imdbID, plot: "short" })) as OmdbDetailResult;
        if (detail.Response === "False") return null;

        const castList = detail.Actors
          ? detail.Actors.split(",").map((a) => a.trim()).filter(Boolean)
          : [];

        const clean: CleanDramaResult = {
          id: detail.imdbID,
          title: detail.Title,
          year: detail.Year,
          type: detail.Type === "series" ? "Series" : "Movie",
          poster: detail.Poster && detail.Poster !== "N/A" ? detail.Poster : null,
          overview: detail.Plot && detail.Plot !== "N/A" ? detail.Plot : "",
          cast: castList,
          genre: detail.Genre && detail.Genre !== "N/A" ? detail.Genre : "",
          rating: detail.imdbRating && detail.imdbRating !== "N/A" ? detail.imdbRating : "",
          director: detail.Director && detail.Director !== "N/A" ? detail.Director : undefined,
        };
        return clean;
      } catch {
        return null;
      }
    });

    // 3. Process IMDb RapidAPI Hits
    const imdbSlice = imdbHits.slice(0, 6);
    const imdbDetailPromises = imdbSlice.map(async (item) => {
      const id = item.imdbId || item.id;
      if (!id) return null;
      return fetchImdbRapidApiDetail(id);
    });

    // Fetch all details concurrently
    const [omdbDetails, imdbDetails] = await Promise.all([
      Promise.all(omdbDetailPromises),
      Promise.all(imdbDetailPromises),
    ]);

    // 4. Merge results by IMDb ID
    const mergedResults: Record<string, CleanDramaResult> = {};

    // Process OMDb details
    for (const d of omdbDetails) {
      if (!d) continue;
      mergedResults[d.id] = d;
    }

    // Process IMDb details
    for (const detail of imdbDetails) {
      if (!detail) continue;
      const id = detail.imdbId || detail.id;
      if (!id) continue;

      const title = detail.title || "";
      const yearStr = detail.year ? String(detail.year) : "";

      let castList: string[] = [];
      if (Array.isArray(detail.cast)) {
        castList = detail.cast;
      } else if (Array.isArray(detail.actors)) {
        castList = detail.actors;
      } else if (typeof detail.cast === "string") {
        castList = detail.cast.split(",").map(c => c.trim()).filter(Boolean);
      } else if (typeof detail.actors === "string") {
        castList = detail.actors.split(",").map(c => c.trim()).filter(Boolean);
      }

      const ratingVal = detail.imdbRating || detail.rating ? String(detail.imdbRating || detail.rating) : "";
      const overview = detail.plot || detail.description || "";
      const poster = detail.posterUrl || detail.poster || null;

      const clean: CleanDramaResult = {
        id,
        title,
        year: yearStr,
        type: detail.type && detail.type.toLowerCase().includes("series") ? "Series" : "Movie",
        poster: poster && poster !== "N/A" ? poster : null,
        overview: overview && overview !== "N/A" ? overview : "",
        cast: castList,
        genre: detail.genre && detail.genre !== "N/A" ? detail.genre : "",
        rating: ratingVal && ratingVal !== "N/A" ? ratingVal : "",
        director: detail.director && detail.director !== "N/A" ? detail.director : undefined,
      };

      if (mergedResults[id]) {
        const existing = mergedResults[id];
        // Combine cast lists uniquely
        const castSet = new Set([...existing.cast, ...clean.cast]);
        existing.cast = Array.from(castSet);
        // Prefer longer plot summary
        if (clean.overview.length > existing.overview.length) {
          existing.overview = clean.overview;
        }
        // Prefer poster if missing
        if (!existing.poster && clean.poster) {
          existing.poster = clean.poster;
        }
        // Prefer rating if missing
        if (!existing.rating && clean.rating) {
          existing.rating = clean.rating;
        }
        // Prefer director if missing
        if (!existing.director && clean.director) {
          existing.director = clean.director;
        }
      } else {
        mergedResults[id] = clean;
      }
    }

    const results = Object.values(mergedResults);
    return NextResponse.json({ results });

  } catch (err) {
    console.error("[/api/media/search] Search agent error:", err);
    // Graceful fallback: return empty results list instead of throwing 500
    return NextResponse.json({ results: [] });
  }
}
