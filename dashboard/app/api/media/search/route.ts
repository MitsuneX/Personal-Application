import { NextRequest, NextResponse } from "next/server";

const OMDB_KEY = process.env.OMDB_API_KEY;
const OMDB_BASE = "https://www.omdbapi.com";

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
  totalSeasons?: string;
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

async function fetchOmdb(params: Record<string, string>): Promise<unknown> {
  if (!OMDB_KEY) throw new Error("OMDB_API_KEY not set");
  const qs = new URLSearchParams({ apikey: OMDB_KEY, ...params });
  const res = await fetch(`${OMDB_BASE}/?${qs.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`OMDb error: ${res.status}`);
  return res.json();
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query")?.trim();
  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  if (!OMDB_KEY) {
    return NextResponse.json(
      { error: "OMDB_API_KEY environment variable is not configured." },
      { status: 500 }
    );
  }

  try {
    const searchData = (await fetchOmdb({ s: query, type: "movie" })) as {
      Search?: OmdbSearchResult[];
      Response: string;
    };
    const seriesData = (await fetchOmdb({ s: query, type: "series" })) as {
      Search?: OmdbSearchResult[];
      Response: string;
    };

    const movieHits: OmdbSearchResult[] = searchData.Search ?? [];
    const seriesHits: OmdbSearchResult[] = seriesData.Search ?? [];
    const combined = [...movieHits, ...seriesHits].slice(0, 8);

    if (combined.length === 0) {
      return NextResponse.json({ results: [] });
    }

    const detailPromises = combined.slice(0, 6).map(async (item) => {
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

    const details = (await Promise.all(detailPromises)).filter(
      (d): d is CleanDramaResult => d !== null
    );

    return NextResponse.json({ results: details });
  } catch (err) {
    console.error("[/api/media/search]", err);
    return NextResponse.json({ error: "Search failed." }, { status: 500 });
  }
}
