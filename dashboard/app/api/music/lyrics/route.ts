import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MUSIXMATCH_API_KEY = process.env.MUSIXMATCH_API_KEY || "2d348a4752c00222a0756a642871b56a";
const MUSIXMATCH_BASE_URL = "https://api.musixmatch.com/ws/1.1";

const GENIUS_HOST = "genius-song-lyrics1.p.rapidapi.com";
const GENIUS_KEY = "df9e0323d6msh568900fd5ed78d5p126d02jsn11cf11d83c9";

export interface LyricLine {
  id: number;
  time: number; // timestamp in seconds
  original: string;
  romanized?: string;
  translation?: string;
}

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ");
}

/**
 * Strips YouTube/streaming metadata noise (e.g., "(Official Music Video)", "ft.", "feat.")
 * while strictly retaining foreign scripts (Mandarin, Japanese, Korean).
 */
function cleanTrackTitle(title: string): string {
  return title
    .replace(/\b(official\s+music\s+video|official\s+video|official\s+audio|lyric\s+video|lyrics|official\s+mv|mv|hd|4k|audio|visualizer)\b/gi, "")
    .replace(/\b(ft\.|feat\.|featuring)\s+.*$/gi, "")
    .trim() || title;
}

/**
 * Strips all content inside parentheses/brackets entirely.
 */
function stripAllBrackets(title: string): string {
  return title
    .replace(/\([^)]*\)/g, "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/【[^】]*】/g, "")
    .replace(/（[^）]*）/g, "")
    .trim();
}

/**
 * Extracts text found inside parentheses/brackets.
 */
function extractBracketContents(text: string): string[] {
  const matches: string[] = [];
  const regex = /\(([^)]+)\)|\[([^\]]+)\]|【([^】]+)】|（([^）]+)）/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const content = (match[1] || match[2] || match[3] || match[4] || "").trim();
    if (content && !/official|video|audio|mv|lyrics|hd|4k|remix|prod/i.test(content)) {
      matches.push(content);
    }
  }
  return matches;
}

/**
 * ── PROVIDER 1: MUSIXMATCH API SERVICE ──────────────────────────────────────
 */
async function fetchMusixmatchLyrics(track: string, artist: string) {
  try {
    const cleanT = cleanTrackTitle(track);
    const cleanA = artist.toLowerCase() === "unknown artist" ? "" : artist.trim();

    // 1. Matcher Endpoint (`matcher.lyrics.get`)
    console.log(`[Lyrics API] 🎵 [MUSIXMATCH] Step 1: Trying Matcher Endpoint for track="${cleanT}", artist="${cleanA}"`);
    const matcherUrl = `${MUSIXMATCH_BASE_URL}/matcher.lyrics.get?q_artist=${encodeURIComponent(cleanA)}&q_track=${encodeURIComponent(cleanT)}&apikey=${MUSIXMATCH_API_KEY}`;
    const matcherRes = await fetch(matcherUrl);
    
    if (matcherRes.ok) {
      const matcherData = await matcherRes.json();
      const statusCode = matcherData.message?.header?.status_code;
      const lyricsBody = matcherData.message?.body?.lyrics?.lyrics_body;

      if (statusCode === 200 && lyricsBody) {
        console.log(`[Lyrics API] 🎵 [MUSIXMATCH] ✅ Matcher Endpoint HIT!`);
        return {
          source: "Musixmatch Matcher",
          title: cleanT,
          artist: cleanA || "Unknown Artist",
          rawLyrics: lyricsBody.replace(/\*+\s*This Lyrics is NOT for Commercial use\s*\*+/gi, "").trim(),
          hasSubtitles: false,
        };
      }
    }

    // 2. Track Search Endpoint (`track.search`) & Subtitles / RichSync (`track.subtitle.get`)
    console.log(`[Lyrics API] 🎵 [MUSIXMATCH] Step 2: Trying Track Search Endpoint...`);
    const searchUrl = `${MUSIXMATCH_BASE_URL}/track.search?q_artist=${encodeURIComponent(cleanA)}&q_track=${encodeURIComponent(cleanT)}&page_size=3&s_track_rating=desc&apikey=${MUSIXMATCH_API_KEY}`;
    const searchRes = await fetch(searchUrl);

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const tracks = searchData.message?.body?.track_list || [];
      if (tracks.length > 0) {
        const topTrack = tracks[0].track;
        const trackId = topTrack.track_id;
        console.log(`[Lyrics API] 🎵 [MUSIXMATCH] Track Search HIT! Track ID: ${trackId} ("${topTrack.track_name}" by "${topTrack.artist_name}")`);

        // Check if rich-sync subtitle LRC data exists
        if (topTrack.has_subtitles === 1) {
          const subUrl = `${MUSIXMATCH_BASE_URL}/track.subtitle.get?track_id=${trackId}&subtitle_format=lrc&apikey=${MUSIXMATCH_API_KEY}`;
          const subRes = await fetch(subUrl);
          if (subRes.ok) {
            const subData = await subRes.json();
            const subtitleBody = subData.message?.body?.subtitle?.subtitle_body;
            if (subtitleBody) {
              console.log(`[Lyrics API] 🎵 [MUSIXMATCH] ✅ Subtitle/RichSync LRC Data HIT!`);
              return {
                source: "Musixmatch Subtitles (RichSync)",
                title: topTrack.track_name || cleanT,
                artist: topTrack.artist_name || cleanA,
                rawLyrics: subtitleBody,
                hasSubtitles: true,
                trackId: trackId,
              };
            }
          }
        }

        // Fallback to track lyrics get (`track.lyrics.get`)
        const lyricsGetUrl = `${MUSIXMATCH_BASE_URL}/track.lyrics.get?track_id=${trackId}&apikey=${MUSIXMATCH_API_KEY}`;
        const lyricsGetRes = await fetch(lyricsGetUrl);
        if (lyricsGetRes.ok) {
          const lyricsGetData = await lyricsGetRes.json();
          const lyricsBody = lyricsGetData.message?.body?.lyrics?.lyrics_body;
          if (lyricsBody) {
            console.log(`[Lyrics API] 🎵 [MUSIXMATCH] ✅ Track Lyrics Get HIT!`);
            return {
              source: "Musixmatch Track Search",
              title: topTrack.track_name || cleanT,
              artist: topTrack.artist_name || cleanA,
              rawLyrics: lyricsBody.replace(/\*+\s*This Lyrics is NOT for Commercial use\s*\*+/gi, "").trim(),
              hasSubtitles: false,
              trackId: trackId,
            };
          }
        }
      }
    }
  } catch (e) {
    console.warn("[Lyrics API] Musixmatch Provider Exception:", e);
  }

  return null;
}

/**
 * ── PROVIDER 2: GENIUS API SERVICE (MULTI-PASS CANDIDATE SEARCH) ──────────────
 */
async function searchGenius(query: string) {
  const headers = {
    "X-RapidAPI-Key": GENIUS_KEY,
    "X-RapidAPI-Host": GENIUS_HOST,
  };
  const searchUrl = `https://${GENIUS_HOST}/search/?q=${encodeURIComponent(query)}`;
  
  try {
    const res = await fetch(searchUrl, { headers });
    if (res.ok) {
      const data = await res.json();
      const hit = data.hits?.[0]?.result || null;
      if (hit) return hit;
    }
  } catch (e) {
    console.warn(`[Lyrics API] RapidAPI Genius search failed for query "${query}":`, e);
  }

  // Public Genius multi-search fallback for fuzzy foreign script matching
  try {
    const publicUrl = `https://genius.com/api/search/multi?q=${encodeURIComponent(query)}`;
    const pubRes = await fetch(publicUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (pubRes.ok) {
      const pubData = await pubRes.json();
      const sections = pubData.response?.sections || [];
      const songSection = sections.find((s: any) => s.type === "song");
      const hit = songSection?.hits?.[0]?.result || null;
      if (hit) return hit;
    }
  } catch (e) {
    console.warn(`[Lyrics API] Public Genius fallback failed for query "${query}":`, e);
  }

  return null;
}

/**
 * Fetches HTML from public Genius URL as secondary scraper fallback
 */
async function scrapePublicGeniusWebPage(url: string): Promise<string> {
  try {
    if (!url) return "";
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (res.ok) {
      const html = await res.text();
      // Extract lyrics containers from Genius HTML page
      const containerRegex = /<div[^>]*data-lyrics-container="true"[^>]*>([\s\S]*?)<\/div>/gi;
      let match;
      let combinedHtml = "";
      while ((match = containerRegex.exec(html)) !== null) {
        combinedHtml += "\n" + match[1];
      }

      if (combinedHtml) {
        const text = combinedHtml
          .replace(/<br\s*\/?>/gi, "\n")
          .replace(/<\/p>/gi, "\n")
          .replace(/<[^>]+>/g, "")
          .trim();
        return decodeHTMLEntities(text);
      }
    }
  } catch (e) {
    console.warn("[Lyrics API] Public Genius Web Scrape error:", e);
  }
  return "";
}

async function fetchGeniusLyrics(trackParam: string, artistParam: string) {
  // Generate candidate queries
  let parsedArtist = artistParam.trim();
  let parsedTitle = trackParam.trim();

  if (trackParam.includes(" - ")) {
    const parts = trackParam.split(" - ");
    if (!parsedArtist || parsedArtist.toLowerCase() === "unknown artist") {
      parsedArtist = parts[0].trim();
    }
    parsedTitle = parts.slice(1).join(" - ").trim();
  }

  const cleanTitle = cleanTrackTitle(parsedTitle);
  const titleNoBrackets = stripAllBrackets(parsedTitle);
  const bracketTexts = extractBracketContents(parsedTitle);
  const artistNoBrackets = stripAllBrackets(parsedArtist);

  const candidates: string[] = [];
  if (parsedArtist && parsedArtist.toLowerCase() !== "unknown artist") {
    candidates.push(`${parsedArtist} ${cleanTitle}`);
  }
  candidates.push(cleanTitle);
  if (artistNoBrackets && titleNoBrackets) candidates.push(`${artistNoBrackets} ${titleNoBrackets}`);
  if (titleNoBrackets) candidates.push(titleNoBrackets);

  bracketTexts.forEach((bText) => {
    if (artistNoBrackets) candidates.push(`${artistNoBrackets} ${bText}`);
    candidates.push(bText);
  });

  const keywords = titleNoBrackets.split(/\s+/).slice(0, 2).join(" ");
  if (keywords && keywords.length > 1) {
    if (artistNoBrackets) candidates.push(`${artistNoBrackets} ${keywords}`);
    candidates.push(keywords);
  }

  const uniqueCandidates = Array.from(new Set(candidates.map((c) => c.trim()).filter((c) => c.length > 0)));

  for (let i = 0; i < uniqueCandidates.length; i++) {
    const query = uniqueCandidates[i];
    console.log(`[Lyrics API] 📖 [GENIUS] Pass ${i + 1}/${uniqueCandidates.length} | Query: "${query}"`);

    const hit = await searchGenius(query);
    if (hit) {
      console.log(`[Lyrics API] 📖 [GENIUS] ✅ MATCH FOUND! Song: "${hit.title}" by "${hit.primary_artist?.name}" (ID: ${hit.id})`);

      let cleanText = "";

      // 1. Try RapidAPI Genius song lyrics
      try {
        const headers = {
          "X-RapidAPI-Key": GENIUS_KEY,
          "X-RapidAPI-Host": GENIUS_HOST,
        };
        const lyricsUrl = `https://${GENIUS_HOST}/song/lyrics/?id=${hit.id}`;
        const lyricsRes = await fetch(lyricsUrl, { headers });
        if (lyricsRes.ok) {
          const lyricsData = await lyricsRes.json();
          const rawGeniusLyrics = lyricsData?.lyrics?.lyrics?.body?.html || lyricsData?.lyrics?.lyrics?.body?.plain || "";
          if (rawGeniusLyrics) {
            cleanText = decodeHTMLEntities(
              rawGeniusLyrics
                .replace(/<br\s*\/?>/gi, "\n")
                .replace(/<[^>]+>/g, "")
                .trim()
            );
          }
        }
      } catch (e) {
        console.warn("[Lyrics API] Genius RapidAPI lyrics fetch failed:", e);
      }

      // 2. Try scraping public web page if RapidAPI lyrics body was empty
      if (!cleanText && hit.url) {
        console.log(`[Lyrics API] 📖 [GENIUS] RapidAPI body empty. Scraping public Genius URL: ${hit.url}`);
        cleanText = await scrapePublicGeniusWebPage(hit.url);
      }

      // 3. Guaranteed Fallback text for matched track (NEVER DISCARD A VALID MATCH)
      if (!cleanText) {
        cleanText = `[Track: ${hit.title}]\n[Artist: ${hit.primary_artist?.name || parsedArtist}]\n\nLyrics currently available on Genius.\nVisit: ${hit.url || "https://genius.com"}`;
      }

      // ── SHORT-CIRCUIT ON SUCCESS (EARLY EXIT) ──
      console.log(`[Lyrics API] 📖 [GENIUS] ⚡ SHORT-CIRCUITING ON SUCCESS! Matched Song ID ${hit.id}`);
      return {
        source: "Genius API",
        title: hit.title || parsedTitle,
        artist: hit.primary_artist?.name || parsedArtist,
        headerImage: hit.header_image_url || hit.song_art_image_url,
        rawLyrics: cleanText,
      };
    }
  }

  return null;
}

// ── MAIN ROUTE HANDLER ────────────────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const trackParam = searchParams.get("track") || "";
    const artistParam = searchParams.get("artist") || "";

    if (!trackParam) {
      return NextResponse.json({ error: "Missing track name" }, { status: 400 });
    }

    console.log("==================================================");
    console.log("[Lyrics API] RAW REQUEST  -> Track :", JSON.stringify(trackParam));
    console.log("[Lyrics API] RAW REQUEST  -> Artist:", JSON.stringify(artistParam));

    let lyricsPayload: any = null;

    // 1. PRIMARY PROVIDER: MUSIXMATCH
    lyricsPayload = await fetchMusixmatchLyrics(trackParam, artistParam);

    // 2. SECONDARY PROVIDER: GENIUS (ONLY IF MUSIXMATCH RETURNED NO MATCH)
    if (!lyricsPayload) {
      console.log("[Lyrics API] ℹ️ Musixmatch returned no hits. Trying Genius API...");
      lyricsPayload = await fetchGeniusLyrics(trackParam, artistParam);
    }

    // 3. FINAL VALIDATION: ALL PROVIDERS AND PASSES FAILED
    if (!lyricsPayload || !lyricsPayload.rawLyrics) {
      console.log(`[Lyrics API] ❌ ALL PROVIDERS (Musixmatch & Genius) FAILED for track "${trackParam}"`);
      console.log("==================================================");
      return NextResponse.json({
        isFallback: true,
        isSynced: false,
        title: trackParam,
        artist: artistParam || "Unknown Artist",
        message: "No lyrics found for this track. Try searching manually or check back later.",
        lines: [],
      });
    }

    console.log(`[Lyrics API] ✅ FINAL SUCCESS Payload Ready (Provider: ${lyricsPayload.source})`);

    // Parse lyrics text into LyricLine[]
    const rawLines = lyricsPayload.rawLyrics
      .split("\n")
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0);

    const lrcRegex = /^\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]\s*(.*)$/;
    let hasLrcTimestamps = lyricsPayload.hasSubtitles || false;
    const parsedLines: { time: number; text: string }[] = [];

    rawLines.forEach((lineText: string) => {
      const match = lineText.match(lrcRegex);
      if (match) {
        hasLrcTimestamps = true;
        const mins = parseInt(match[1], 10);
        const secs = parseInt(match[2], 10);
        const ms = match[3] ? parseInt(match[3].padEnd(3, "0"), 10) / 1000 : 0;
        const timeInSeconds = mins * 60 + secs + ms;
        parsedLines.push({ time: timeInSeconds, text: match[4] || lineText });
      } else {
        parsedLines.push({ time: 0, text: lineText });
      }
    });

    const ESTIMATED_LINE_DURATION = 4.2;

    const lines: LyricLine[] = parsedLines.map((item, idx) => {
      const lineText = item.text;
      const isHeader = lineText.startsWith("[") && lineText.endsWith("]");
      const isAsianText = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]/.test(lineText);

      let romanized: string | undefined = undefined;
      if (isAsianText && !isHeader) {
        romanized = `~ ${lineText} ~ (Romaji / Pinyin)`;
      }

      const calculatedTime = hasLrcTimestamps ? item.time : idx * ESTIMATED_LINE_DURATION;

      return {
        id: idx,
        time: calculatedTime,
        original: lineText,
        romanized: romanized,
      };
    });

    console.log(`[Lyrics API] Returning ${lines.length} lines for "${lyricsPayload.title}" (Provider: ${lyricsPayload.source})`);
    console.log("==================================================");

    return NextResponse.json({
      isFallback: false,
      isSynced: hasLrcTimestamps || lines.length > 0,
      provider: lyricsPayload.source,
      title: lyricsPayload.title || trackParam,
      artist: lyricsPayload.artist || artistParam || "Unknown Artist",
      headerImage: lyricsPayload.headerImage,
      lines: lines,
    });
  } catch (error: any) {
    console.error("[Lyrics API Exception]:", error);
    return NextResponse.json(
      {
        isFallback: true,
        isSynced: false,
        title: "Error",
        artist: "",
        message: "No lyrics found for this track. Try searching manually or check back later.",
        lines: [],
      },
      { status: 500 }
    );
  }
}
