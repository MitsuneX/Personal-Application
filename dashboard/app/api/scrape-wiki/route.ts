import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const OMDB_KEY = process.env.OMDB_API_KEY;
const OMDB_BASE = "https://www.omdbapi.com";

// Helper to clean HTML tags from a string
function cleanHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

// Clean up cast lines (e.g., "Actor as Character" -> "Actor")
function cleanCastName(line: string): string {
  let cleaned = cleanHtml(line);
  // Remove reference indicators like [1], [2], etc.
  cleaned = cleaned.replace(/\[\d+\]/g, "");
  // Split on common delimiters
  const delimiters = [" as ", " - ", " – ", " / ", " (", " — "];
  for (const delim of delimiters) {
    const idx = cleaned.indexOf(delim);
    if (idx !== -1) {
      cleaned = cleaned.substring(0, idx);
    }
  }
  return cleaned.trim();
}

// Map parameters to Fandom or Wikipedia endpoints
function getBaseUrl(mainCategory: string, subCategory?: string, title?: string): string {
  const main = mainCategory.toLowerCase();
  const sub = subCategory?.toLowerCase() || "";
  const t = title?.toLowerCase() || "";

  if (main === "tokusatsu") {
    if (sub.includes("ultraman")) {
      return "https://ultraman.fandom.com/api.php";
    }
    if (sub.includes("kamen rider") || sub.includes("kamenrider")) {
      return "https://kamenrider.fandom.com/api.php";
    }
    if (sub.includes("power rangers") || sub.includes("powerrangers")) {
      return "https://powerrangers.fandom.com/api.php";
    }
    return "https://kamenrider.fandom.com/api.php";
  }

  if (main === "anime") {
    if (t.includes("one piece")) return "https://onepiece.fandom.com/api.php";
    if (t.includes("naruto") || t.includes("boruto")) return "https://naruto.fandom.com/api.php";
    if (t.includes("dragon ball") || t.includes("dragonball")) return "https://dragonball.fandom.com/api.php";
    if (t.includes("bleach")) return "https://bleach.fandom.com/api.php";
    if (t.includes("my hero academia") || t.includes("boku no hero")) return "https://myheroacademia.fandom.com/api.php";
    if (t.includes("jujutsu kaisen")) return "https://jujutsu-kaisen.fandom.com/api.php";
    if (t.includes("attack on titan") || t.includes("shingeki")) return "https://attackontitan.fandom.com/api.php";
    if (t.includes("demon slayer") || t.includes("kimetsu")) return "https://kimetsu-no-yaiba.fandom.com/api.php";
    
    return "https://anime.fandom.com/api.php";
  }

  if (main === "drama") {
    if (sub === "chinese" || sub === "cn") {
      return "https://cdrama.fandom.com/api.php";
    }
    if (sub === "korean" || sub === "kr") {
      return "https://korean-drama-hallyu.fandom.com/api.php";
    }
    if (sub === "japanese" || sub === "jp") {
      return "https://jdrama.fandom.com/api.php";
    }
  }

  return "https://en.wikipedia.org/w/api.php";
}

async function fetchWikiJson(baseUrl: string, params: Record<string, string>): Promise<any> {
  const qs = new URLSearchParams({
    format: "json",
    origin: "*",
    ...params,
  });
  const url = `${baseUrl}?${qs.toString()}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "MediaLogsDashboard/1.0 (nelvin.claudius06@gmail.com)" },
    next: { revalidate: 3600 }
  });
  if (!res.ok) throw new Error(`Wiki API request failed with status: ${res.status}`);
  return res.json();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const title = searchParams.get("title")?.trim();
    const mainCategory = searchParams.get("mainCategory")?.trim() || "drama";
    const subCategory = searchParams.get("subCategory")?.trim() || "";

    if (!title) {
      return NextResponse.json({ error: "Title parameter is required" }, { status: 400 });
    }

    // Try OMDb first if it's Drama and OMDB_KEY is configured
    let omdbData: any = null;
    const isDrama = mainCategory.toLowerCase() === "drama";
    if (isDrama && OMDB_KEY) {
      try {
        const queryParams = new URLSearchParams({
          apikey: OMDB_KEY,
          t: title,
          plot: "full"
        });
        const omdbRes = await fetch(`${OMDB_BASE}/?${queryParams.toString()}`, { cache: "no-store" });
        if (omdbRes.ok) {
          const data = await omdbRes.json();
          if (data.Response === "True") {
            omdbData = data;
          }
        }
      } catch (err) {
        console.warn("OMDb query failed inside scrape-wiki:", err);
      }
    }

    const omdbCast = omdbData?.Actors && omdbData.Actors !== "N/A"
      ? omdbData.Actors.split(",").map((a: string) => a.trim()).filter(Boolean)
      : [];

    // OMDb is sufficient if it has poster, plot, and a healthy cast list (> 3 members)
    const isOmdbSufficient = 
      omdbData && 
      omdbData.Poster && 
      omdbData.Poster !== "N/A" && 
      omdbData.Plot && 
      omdbData.Plot !== "N/A" && 
      omdbCast.length > 3;

    if (isOmdbSufficient) {
      let parsedYear = null;
      if (omdbData.Year) {
        const match = omdbData.Year.match(/\d{4}/);
        if (match) parsedYear = parseInt(match[0]);
      }
      return NextResponse.json({
        title: omdbData.Title || title,
        synopsis: omdbData.Plot,
        posterUrl: omdbData.Poster,
        cast: omdbCast.slice(0, 12),
        year: parsedYear,
        source: "omdb"
      });
    }

    // Secondary Fallback and Enrichment using Wikipedia or Fandom
    const baseUrl = getBaseUrl(mainCategory, subCategory, title);
    
    const searchData = await fetchWikiJson(baseUrl, {
      action: "query",
      list: "search",
      srsearch: title,
      srlimit: "1",
    });

    let resolvedTitle = title;
    let wikiFound = false;
    if (searchData.query?.search?.length > 0) {
      resolvedTitle = searchData.query.search[0].title;
      wikiFound = true;
    } else {
      if (!baseUrl.includes("wikipedia.org")) {
        const wikiFallbackUrl = "https://en.wikipedia.org/w/api.php";
        const wikiSearch = await fetchWikiJson(wikiFallbackUrl, {
          action: "query",
          list: "search",
          srsearch: title,
          srlimit: "1",
        });
        if (wikiSearch.query?.search?.length > 0) {
          resolvedTitle = wikiSearch.query.search[0].title;
          return executeWikiScrapeAndMerge(wikiFallbackUrl, resolvedTitle, omdbData);
        }
      }
    }

    if (wikiFound) {
      return executeWikiScrapeAndMerge(baseUrl, resolvedTitle, omdbData);
    }

    // If both failed to resolve, but we have partial OMDb info, use it!
    if (omdbData) {
      let parsedYear = null;
      if (omdbData.Year) {
        const match = omdbData.Year.match(/\d{4}/);
        if (match) parsedYear = parseInt(match[0]);
      }
      return NextResponse.json({
        title: omdbData.Title || title,
        synopsis: omdbData.Plot && omdbData.Plot !== "N/A" ? omdbData.Plot : "",
        posterUrl: omdbData.Poster && omdbData.Poster !== "N/A" ? omdbData.Poster : null,
        cast: omdbCast.slice(0, 12),
        year: parsedYear,
        source: "omdb-fallback"
      });
    }

    return NextResponse.json({ error: `No matching metadata found on OMDb or wiki database for title: "${title}"` }, { status: 404 });

  } catch (error: any) {
    console.error("Scrape wiki error:", error);
    return NextResponse.json({ error: error.message || "Failed to query API endpoints" }, { status: 500 });
  }
}

async function executeWikiScrapeAndMerge(baseUrl: string, resolvedTitle: string, omdbData: any) {
  const queryData = await fetchWikiJson(baseUrl, {
    action: "query",
    prop: "extracts|pageimages",
    exintro: "true",
    explaintext: "true",
    piprop: "original",
    titles: resolvedTitle,
    redirects: "1",
  });

  const pages = queryData.query?.pages || {};
  const pageId = Object.keys(pages)[0];
  const page = pages[pageId] || {};

  const wikiSynopsis = page.extract || "";
  const wikiPosterUrl = page.original?.source || null;

  let wikiCast: string[] = [];
  try {
    const parseSections = await fetchWikiJson(baseUrl, {
      action: "parse",
      page: resolvedTitle,
      prop: "sections",
      redirects: "1",
    });

    const sections = parseSections.parse?.sections || [];
    const castKeywords = ["cast", "character", "starring", "actor", "member", "role"];
    const targetSection = sections.find((sec: any) =>
      castKeywords.some(keyword => sec.line?.toLowerCase().includes(keyword))
    );

    if (targetSection) {
      const parseText = await fetchWikiJson(baseUrl, {
        action: "parse",
        page: resolvedTitle,
        prop: "text",
        section: targetSection.index,
      });

      const html = parseText.parse?.text?.["*"] || "";
      const liRegex = /<li>([\s\S]*?)<\/li>/gi;
      let match;
      while ((match = liRegex.exec(html)) !== null) {
        const rawLine = match[1];
        const cleaned = cleanCastName(rawLine);
        if (cleaned && cleaned.length > 2 && cleaned.length < 50) {
          if (!cleaned.toLowerCase().includes("see also") && !cleaned.toLowerCase().includes("category")) {
            wikiCast.push(cleaned);
          }
        }
      }
    }
  } catch (err) {
    console.warn("Failed to parse cast section:", err);
  }

  if (wikiCast.length === 0) {
    try {
      const parseText = await fetchWikiJson(baseUrl, {
        action: "parse",
        page: resolvedTitle,
        prop: "text",
      });
      const fullHtml = parseText.parse?.text?.["*"] || "";
      const infoboxRegex = /<table class="infobox[\s\S]*?<\/table>/gi;
      const infoboxMatch = infoboxRegex.exec(fullHtml);
      if (infoboxMatch) {
        const infoboxHtml = infoboxMatch[0];
        const starringRegex = /Starring[\s\S]*?<td[\s\S]*?>([\s\S]*?)<\/td>/gi;
        const starringMatch = starringRegex.exec(infoboxHtml);
        if (starringMatch) {
          const linksRegex = /<a [^>]*>([^<]+)<\/a>/gi;
          let linkMatch;
          while ((linkMatch = linksRegex.exec(starringMatch[1])) !== null) {
            const name = cleanHtml(linkMatch[1]);
            if (name && name.length > 2 && !wikiCast.includes(name)) {
              wikiCast.push(name);
            }
          }
        }
      }
    } catch (err) {
      console.warn("Failed infobox cast fallback:", err);
    }
  }

  const omdbCast = omdbData?.Actors && omdbData.Actors !== "N/A"
    ? omdbData.Actors.split(",").map((a: string) => a.trim()).filter(Boolean)
    : [];

  const posterUrl = wikiPosterUrl || (omdbData?.Poster && omdbData.Poster !== "N/A" ? omdbData.Poster : null);

  let synopsis = wikiSynopsis;
  if (omdbData?.Plot && omdbData.Plot !== "N/A") {
    if (omdbData.Plot.length > wikiSynopsis.length) {
      synopsis = omdbData.Plot;
    }
  }
  if (!synopsis) {
    synopsis = "No synopsis loaded for this title.";
  }

  const combinedCastSet = new Set<string>();
  omdbCast.forEach((actor: string) => combinedCastSet.add(actor));
  wikiCast.forEach((actor: string) => combinedCastSet.add(actor));
  const mergedCast = Array.from(combinedCastSet).slice(0, 12);

  let year: number | null = null;
  const yearMatch = resolvedTitle.match(/\((\d{4})\)/);
  if (yearMatch) {
    year = parseInt(yearMatch[1]);
  } else if (omdbData?.Year) {
    const match = omdbData.Year.match(/\d{4}/);
    if (match) year = parseInt(match[0]);
  } else if (wikiSynopsis) {
    const firstYear = wikiSynopsis.match(/\b(19\d{2}|20\d{2})\b/);
    if (firstYear) year = parseInt(firstYear[1]);
  }

  return NextResponse.json({
    title: resolvedTitle,
    synopsis: synopsis.trim(),
    posterUrl: posterUrl,
    cast: mergedCast,
    year: year,
    source: "hybrid"
  });
}
