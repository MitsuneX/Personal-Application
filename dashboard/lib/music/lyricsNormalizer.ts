/**
 * ── Production-Grade Lyrics Normalization & Permutation Engine ──────────────
 * Solves YouTube title noise, multilingual titles (e.g. Korean/English), 
 * artist aliases, and publisher/record label metadata mismatches.
 */

export interface NormalizedTrackMeta {
  rawTrack: string;
  rawArtist: string;
  extractedTitle: string;
  extractedArtist: string;
  primaryTitle: string;
  altTitle?: string;
  combinedTitle?: string;
  primaryArtist: string;
  aliasArtist?: string;
  featuredArtists: string[];
  isPublisherArtist: boolean;
}

export interface SearchPermutation {
  track: string;
  artist: string;
  reason: string;
}

// ── Known Record Labels / Publishers Blacklist ───────────────────────────────
const PUBLISHER_BLACKLIST = new Set([
  "POCLANOS",
  "1THEK",
  "STONE MUSIC ENTERTAINMENT",
  "STONE MUSIC",
  "HYBE LABELS",
  "HYBE",
  "JYP ENTERTAINMENT",
  "JYPE",
  "SMTOWN",
  "YG ENTERTAINMENT",
  "YG",
  "GENIE MUSIC",
  "BIGHIT MUSIC",
  "WARNER MUSIC",
  "SONY MUSIC",
  "UNIVERSAL MUSIC",
  "VEVO",
  "DISTROKID",
  "TUNECORE",
  "KAKAO M",
  "CJ E&M",
  "INTERSCOPE",
  "ATLANTIC RECORDS",
  "OFFICIAL",
  "RECORDINGS",
  "RECORDS",
  "MUSIC",
  "LABEL",
  "ENTERTAINMENT",
]);

/**
 * Checks if an artist string is a known publisher/record label rather than a performer.
 */
export function isPublisherName(artist: string): boolean {
  if (!artist) return false;
  const upper = artist.trim().toUpperCase();
  if (PUBLISHER_BLACKLIST.has(upper)) return true;
  // Check substrings if label contains typical suffixes like " - Topic" or " Official"
  if (upper.endsWith("- TOPIC") || upper.endsWith("OFFICIAL")) return true;
  return false;
}

/**
 * Step 1: Strip common YouTube prefixes/suffixes and noise tags.
 */
export function stripYouTubeNoise(text: string): string {
  if (!text) return "";

  let cleaned = text;

  // 1. Remove bracketed noise tags: [MV], (Official Music Video), [Audio], etc.
  const bracketNoiseRegex = /[\(\[]\s*(?:MV|M\/V|Official\s+MV|Official\s+Music\s+Video|Official\s+Video|Official\s+Audio|Audio|Lyrics|Lyric\s+Video|Live|Performance|Visualizer|Teaser|HD|4K|1080p|720p|Full\s+Track|Topic|Special\s+Clip|Color\s+Coded|Choreography|Dance\s+Practice|Unofficial)\s*[\)\]]/gi;
  cleaned = cleaned.replace(bracketNoiseRegex, "");

  // 2. Remove unbracketed common YouTube suffixes
  const suffixNoiseRegex = /(?:[/-|]\s*)?\b(?:official\s+music\s+video|official\s+video|official\s+audio|lyric\s+video|official\s+mv|m\/v|mv|visualizer|audio|performance\s+video|live\s+clip|teaser)\b.*$/gi;
  cleaned = cleaned.replace(suffixNoiseRegex, "");

  // 3. Remove standalone technical tags like HD, 4K, 1080p
  cleaned = cleaned.replace(/\b(?:HD|4K|1080p|720p)\b/gi, "");

  // 4. Clean extra slashes and whitespace
  cleaned = cleaned.replace(/^\s*[/-|]\s*/, "").replace(/\s*[/-|]\s*$/, "");
  return cleaned.trim();
}

/**
 * Helper to check if text contains CJK (Korean Hangul, Japanese Kanji/Kana, Chinese) characters.
 */
export function containsCJK(str: string): boolean {
  return /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uffef\u4e00-\u9faf\uac00-\ud7af]/.test(str);
}

/**
 * Step 2 & 3: Parse multilingual titles and artist aliases from parenthetical text.
 * E.g., "애열 (Love Shine)" -> primary: "애열", alt: "Love Shine"
 * E.g., "이희상 (LEEHEESANG)" -> primary: "이희상", alias: "LEEHEESANG"
 */
export function parseMultilingualOrAlias(input: string): { primary: string; alt?: string; combined?: string } {
  if (!input) return { primary: "" };

  const clean = input.trim();
  
  // Look for text inside parenthesis: "Title (Alt Title)" or "Artist (Alias)"
  const parenMatch = clean.match(/^([^(]+)\(([^)]+)\)(.*)$/);
  
  if (parenMatch) {
    const outside = parenMatch[1].trim();
    const inside = parenMatch[2].trim();
    const remainder = parenMatch[3].trim();

    // Check if inside parens is feature tag (e.g. "feat. Drake")
    if (/^(?:feat\.|ft\.|featuring|prod\.|with)\b/i.test(inside)) {
      return { primary: `${outside}${remainder ? " " + remainder : ""}`.trim() };
    }

    const fullOutside = `${outside}${remainder ? " " + remainder : ""}`.trim();

    // Language heuristic: if one is CJK and one is Latin/ASCII, or vice-versa
    const outsideCJK = containsCJK(fullOutside);
    const insideCJK = containsCJK(inside);

    if (outsideCJK && !insideCJK) {
      return {
        primary: fullOutside,
        alt: inside,
        combined: `${fullOutside} ${inside}`,
      };
    } else if (!outsideCJK && insideCJK) {
      return {
        primary: inside,
        alt: fullOutside,
        combined: `${inside} ${fullOutside}`,
      };
    } else {
      // Both same script
      return {
        primary: fullOutside,
        alt: inside,
        combined: `${fullOutside} ${inside}`,
      };
    }
  }

  return { primary: clean };
}

/**
 * Parse featured artists from an artist string.
 * E.g., "Artist A (feat. Artist B)" -> primary: "Artist A", featured: ["Artist B"]
 */
export function parseFeaturedArtists(artistStr: string): { mainArtist: string; featured: string[] } {
  if (!artistStr) return { mainArtist: "", featured: [] };

  let main = artistStr;
  const featured: string[] = [];

  const featRegex = /(?:[\(\[]?\s*(?:feat\.|ft\.|featuring|with)\s+([^\]\)]+)[\)\]]?)/gi;
  let match;
  while ((match = featRegex.exec(artistStr)) !== null) {
    if (match[1]) {
      featured.push(match[1].trim());
    }
  }

  main = main.replace(featRegex, "").trim();

  // Also handle "/" or "," or "&" dividers if needed
  return { mainArtist: main, featured };
}

/**
 * Main Normalization function. Parses raw track and artist into structured metadata.
 */
export function normalizeMetadata(rawTrack: string, rawArtist: string): NormalizedTrackMeta {
  const isLabel = isPublisherName(rawArtist);
  let cleanedTrack = stripYouTubeNoise(rawTrack);
  let cleanedArtist = stripYouTubeNoise(rawArtist);

  let extractedArtistFromTitle = "";
  let extractedTitle = cleanedTrack;

  // Check if title has "Artist - Track" structure (common in YouTube titles)
  // E.g., "이희상 (LEEHEESANG) - 애열 (Love Shine)"
  const dashIndex = cleanedTrack.indexOf("-");
  const enDashIndex = cleanedTrack.indexOf("—");
  const sepIndex = dashIndex !== -1 ? dashIndex : enDashIndex;

  if (sepIndex !== -1) {
    const leftPart = cleanedTrack.substring(0, sepIndex).trim();
    const rightPart = cleanedTrack.substring(sepIndex + 1).trim();

    // Verify left part looks like an artist (not just a single word track title)
    if (leftPart.length > 0 && rightPart.length > 0) {
      extractedArtistFromTitle = leftPart;
      extractedTitle = rightPart;
    }
  }

  // Determine effective artist string
  const effectiveArtistStr = extractedArtistFromTitle || (isLabel ? "" : cleanedArtist);

  // Parse title multilingual components
  const titleParsed = parseMultilingualOrAlias(extractedTitle);

  // Parse artist alias and featured artists
  const artistParsed = parseMultilingualOrAlias(effectiveArtistStr);
  const featuredInfo = parseFeaturedArtists(artistParsed.primary);

  return {
    rawTrack,
    rawArtist,
    extractedTitle,
    extractedArtist: extractedArtistFromTitle,
    primaryTitle: titleParsed.primary,
    altTitle: titleParsed.alt,
    combinedTitle: titleParsed.combined,
    primaryArtist: featuredInfo.mainArtist || artistParsed.primary,
    aliasArtist: artistParsed.alt,
    featuredArtists: featuredInfo.featured,
    isPublisherArtist: isLabel,
  };
}

// ── In-memory LRU Cache for Permutations ─────────────────────────────────────
const permutationCache = new Map<string, SearchPermutation[]>();
const MAX_CACHE_SIZE = 500;

/**
 * Generates an ordered list of search permutations from raw track & artist parameters.
 * Automatically deduplicates permutations and caches results.
 */
export function generateSearchPermutations(rawTrack: string, rawArtist: string): SearchPermutation[] {
  const cacheKey = `${rawTrack.trim().toLowerCase()}:::${rawArtist.trim().toLowerCase()}`;
  if (permutationCache.has(cacheKey)) {
    return permutationCache.get(cacheKey)!;
  }

  const meta = normalizeMetadata(rawTrack, rawArtist);
  const rawCleanArtist = meta.isPublisherArtist ? "" : meta.rawArtist.trim();

  const rawCandidates: { track: string; artist: string; reason: string }[] = [];

  const addCandidate = (t: string, a: string, reason: string) => {
    const cleanT = t.trim();
    const cleanA = a.trim();
    if (!cleanT) return;
    
    // Check if duplicate
    const exists = rawCandidates.some(
      (c) => c.track.toLowerCase() === cleanT.toLowerCase() && c.artist.toLowerCase() === cleanA.toLowerCase()
    );

    if (!exists) {
      rawCandidates.push({ track: cleanT, artist: cleanA, reason });
    }
  };

  // 1. Primary Title + Primary Artist
  if (meta.primaryTitle && meta.primaryArtist) {
    addCandidate(meta.primaryTitle, meta.primaryArtist, "Primary Title + Primary Artist");
  }

  // 2. Primary Title + Alias Artist
  if (meta.primaryTitle && meta.aliasArtist) {
    addCandidate(meta.primaryTitle, meta.aliasArtist, "Primary Title + Alias Artist");
  }

  // 3. Alternative Title + Primary Artist
  if (meta.altTitle && meta.primaryArtist) {
    addCandidate(meta.altTitle, meta.primaryArtist, "Alt Title + Primary Artist");
  }

  // 4. Alternative Title + Alias Artist
  if (meta.altTitle && meta.aliasArtist) {
    addCandidate(meta.altTitle, meta.aliasArtist, "Alt Title + Alias Artist");
  }

  // 5. Combined Title + Primary Artist
  if (meta.combinedTitle && meta.primaryArtist) {
    addCandidate(meta.combinedTitle, meta.primaryArtist, "Combined Title + Primary Artist");
  }

  // 6. Combined Title + Alias Artist
  if (meta.combinedTitle && meta.aliasArtist) {
    addCandidate(meta.combinedTitle, meta.aliasArtist, "Combined Title + Alias Artist");
  }

  // 7. Extracted Full Title + Extracted Full Artist
  if (meta.extractedTitle && meta.extractedArtist) {
    addCandidate(meta.extractedTitle, meta.extractedArtist, "Extracted Title + Extracted Artist");
  }

  // 8. Primary Title + Raw Provided Artist (if not publisher)
  if (meta.primaryTitle && rawCleanArtist) {
    addCandidate(meta.primaryTitle, rawCleanArtist, "Primary Title + Provided Artist");
  }

  // 9. Primary Title + Combined (Primary + Alias) Artist
  if (meta.primaryTitle && meta.primaryArtist && meta.aliasArtist) {
    addCandidate(meta.primaryTitle, `${meta.primaryArtist} ${meta.aliasArtist}`, "Primary Title + Combined Artist");
  }

  // 10. Primary Title Only (Artist-less lookup)
  if (meta.primaryTitle) {
    addCandidate(meta.primaryTitle, "", "Primary Title Only");
  }

  // 11. Alternative Title Only (Artist-less lookup)
  if (meta.altTitle) {
    addCandidate(meta.altTitle, "", "Alt Title Only");
  }

  // 12. Combined Title Only
  if (meta.combinedTitle) {
    addCandidate(meta.combinedTitle, "", "Combined Title Only");
  }

  // 13. Fallback: Raw Track + Raw Artist
  addCandidate(stripYouTubeNoise(rawTrack), rawCleanArtist, "Raw Clean Fallback");

  // LRU cache management
  if (permutationCache.size >= MAX_CACHE_SIZE) {
    const firstKey = permutationCache.keys().next().value;
    if (firstKey) permutationCache.delete(firstKey);
  }
  permutationCache.set(cacheKey, rawCandidates);

  return rawCandidates;
}
