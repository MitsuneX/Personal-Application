import artistData from "./ArtistData.json";

// ─── Canonical output shape consumed by HofEditorModal ────────────────────────
// This is the contract the editor depends on. All fields are strings or string[].
// Nothing here is ever undefined — every field has a safe default.

export interface ArtistPreset {
  id: string;
  name: string;
  fullName: string;
  aliases: string[];
  originalLanguage: string;
  pronunciation: string;
  gender: string;
  age: string;
  nationality: string;
  occupation: string[];
  bio: string;
  personality: string;
  traits: string[];
  works: string[];
  socialLinks: { platform: string; url: string }[];
  // Passthrough fields for extra context available in new schema
  universe: string;
  series: string;
  species: string;
  creator: string;
  debutYear: string;
  alignment: string;
  motivation: string;
  characterDevelopment: string;
  mainSeries: string[];
  movies: string[];
  episodes: string[];
  spinOffs: string[];
  cameos: string[];
  relatedWorks: string[];
}

// ─── New nested schema shape (as it actually exists in ArtistData.json v2) ────

interface ArtistRawNested {
  id: string;
  basic?: {
    character_name?: string;
    type?: string;
    status_tier?: string;
    country_nationality?: string;
    roster_rank_order?: string;
    accent_theme_color?: string;
    enshrinement_note_quote?: string;
    make_overall_champion_leader?: boolean;
  };
  identity_and_origin?: {
    full_official_name?: string;
    alias_nickname?: string | string[];
    original_language_native?: string;
    pronunciation?: string;
    gender?: string;
    age_age_range?: string;
    species_type?: string;
    universe_work?: string;
    series_franchise?: string;
    country_region?: string;
    creator_studio?: string;
    debut_year_date?: string;
  };
  profile_and_lore?: {
    personality_archetype?: string;
    occupation_role?: string | string[];
    alignment?: string;
    traits?: string[];
    character_motivation?: string;
    background_biography?: string;
    character_development_arc?: string;
  };
  appearances?: {
    main_series?: string[];
    movies_filmography?: string[];
    featured_episodes?: string[];
    spin_offs?: string[];
    cameos_guest_roles?: string[];
    related_works_credits?: string[];
  };
  social_links?: { platform?: string; url?: string }[];
}

// ─── Old flat schema shape (kept for backwards compatibility) ──────────────────

interface ArtistRawFlat {
  id: string;
  name?: string;
  fullName?: string;
  aliases?: string[];
  originalLanguage?: string;
  pronunciation?: string;
  gender?: string;
  age?: string;
  nationality?: string;
  occupation?: string[];
  bio?: string;
  personality?: string;
  traits?: string[];
  works?: string[];
  socialLinks?: { platform?: string; url?: string }[];
}

type ArtistRaw = ArtistRawNested | ArtistRawFlat;

// ─── Safe string helpers ───────────────────────────────────────────────────────

/** Returns a guaranteed non-null, non-undefined string. Empty string if falsy. */
function safeStr(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  return String(value);
}

/** Returns a guaranteed string[]. Handles: undefined, null, string (CSV), string[]. */
function safeStrArr(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((v) => safeStr(v))
      .filter((v) => v.length > 0);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
  }
  return [];
}

/** Returns a guaranteed { platform: string; url: string }[]. */
function safeSocialLinks(
  value: unknown
): { platform: string; url: string }[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const platform = safeStr((item as Record<string, unknown>).platform);
      const url = safeStr((item as Record<string, unknown>).url);
      return { platform, url };
    })
    .filter(
      (item): item is { platform: string; url: string } =>
        item !== null && (item.platform.length > 0 || item.url.length > 0)
    );
}

// ─── Schema detection ─────────────────────────────────────────────────────────

function isNestedSchema(raw: ArtistRaw): raw is ArtistRawNested {
  return (
    "basic" in raw ||
    "identity_and_origin" in raw ||
    "profile_and_lore" in raw ||
    "appearances" in raw
  );
}

// ─── Core normalizer — the single boundary where data enters the app ──────────

/**
 * normalizeArtistPreset()
 *
 * Converts a raw ArtistData.json record (either old flat schema or new nested
 * schema) into a fully-typed, fully-safe ArtistPreset where every field is
 * guaranteed to be a non-null string or string[]. This is the ONLY place in the
 * codebase that should ever read from ArtistData.json records directly.
 *
 * Design contract:
 *   - Input: any shape from ArtistData.json (may be incomplete, empty, or null)
 *   - Output: ArtistPreset where no field can ever throw .charAt() / .toUpperCase() etc.
 *   - Never invents data. Empty string "" is used when a value is genuinely absent.
 *   - Never crashes on a malformed/incomplete record.
 */
export function normalizeArtistPreset(raw: unknown): ArtistPreset {
  // Bail-out guard: if raw is completely unusable, return safe empty preset
  if (!raw || typeof raw !== "object") {
    return {
      id: "",
      name: "Unknown Artist",
      fullName: "",
      aliases: [],
      originalLanguage: "",
      pronunciation: "",
      gender: "",
      age: "",
      nationality: "",
      occupation: [],
      bio: "",
      personality: "",
      traits: [],
      works: [],
      socialLinks: [],
      universe: "",
      series: "",
      species: "",
      creator: "",
      debutYear: "",
      alignment: "",
      motivation: "",
      characterDevelopment: "",
      mainSeries: [],
      movies: [],
      episodes: [],
      spinOffs: [],
      cameos: [],
      relatedWorks: [],
    };
  }

  const r = raw as ArtistRaw;
  const id = safeStr(r.id) || `preset-${Math.random().toString(36).slice(2, 8)}`;

  if (isNestedSchema(r)) {
    // ── New nested schema (v2) ───────────────────────────────────────────────
    const basic = r.basic || {};
    const identity = r.identity_and_origin || {};
    const lore = r.profile_and_lore || {};
    const appearances = r.appearances || {};

    const rawName = safeStr(basic.character_name);
    const name = rawName || "Unknown Artist";

    // All related works merged: main_series + movies + featured_episodes +
    // spin_offs + cameos + related_works_credits (for backwards compatibility,
    // works = full credits list)
    const mainSeriesArr = safeStrArr(appearances.main_series);
    const moviesArr = safeStrArr(appearances.movies_filmography);
    const episodesArr = safeStrArr(appearances.featured_episodes);
    const spinOffsArr = safeStrArr(appearances.spin_offs);
    const cameosArr = safeStrArr(appearances.cameos_guest_roles);
    const relatedWorksArr = safeStrArr(appearances.related_works_credits);

    // works = union of all appearance lists (for knownFor and relatedWorks autofill)
    const allWorks = [
      ...mainSeriesArr,
      ...moviesArr,
      ...relatedWorksArr,
    ].filter((v, i, arr) => arr.indexOf(v) === i); // deduplicate

    return {
      id,
      name,
      fullName: safeStr(identity.full_official_name),
      aliases: safeStrArr(identity.alias_nickname),
      originalLanguage: safeStr(identity.original_language_native),
      pronunciation: safeStr(identity.pronunciation),
      gender: safeStr(identity.gender),
      age: safeStr(identity.age_age_range),
      nationality: safeStr(identity.country_region) || safeStr(basic.country_nationality),
      occupation: safeStrArr(lore.occupation_role),
      bio: safeStr(lore.background_biography),
      personality: safeStr(lore.personality_archetype),
      traits: safeStrArr(lore.traits),
      works: allWorks,
      socialLinks: safeSocialLinks(r.social_links),
      // Extended passthrough fields
      universe: safeStr(identity.universe_work),
      series: safeStr(identity.series_franchise),
      species: safeStr(identity.species_type),
      creator: safeStr(identity.creator_studio),
      debutYear: safeStr(identity.debut_year_date),
      alignment: safeStr(lore.alignment),
      motivation: safeStr(lore.character_motivation),
      characterDevelopment: safeStr(lore.character_development_arc),
      mainSeries: mainSeriesArr,
      movies: moviesArr,
      episodes: episodesArr,
      spinOffs: spinOffsArr,
      cameos: cameosArr,
      relatedWorks: relatedWorksArr,
    };
  } else {
    // ── Legacy flat schema (v1) ──────────────────────────────────────────────
    const f = r as ArtistRawFlat;
    const rawName = safeStr(f.name);
    const name = rawName || "Unknown Artist";

    const relatedWorksArr = safeStrArr(f.works);

    return {
      id,
      name,
      fullName: safeStr(f.fullName),
      aliases: safeStrArr(f.aliases),
      originalLanguage: safeStr(f.originalLanguage),
      pronunciation: safeStr(f.pronunciation),
      gender: safeStr(f.gender),
      age: safeStr(f.age),
      nationality: safeStr(f.nationality),
      occupation: safeStrArr(f.occupation),
      bio: safeStr(f.bio),
      personality: safeStr(f.personality),
      traits: safeStrArr(f.traits),
      works: relatedWorksArr,
      socialLinks: safeSocialLinks(f.socialLinks),
      // Extended fields not present in v1 schema — safe empty defaults
      universe: "",
      series: "",
      species: "",
      creator: "",
      debutYear: "",
      alignment: "",
      motivation: "",
      characterDevelopment: "",
      mainSeries: [],
      movies: [],
      episodes: [],
      spinOffs: [],
      cameos: [],
      relatedWorks: relatedWorksArr,
    };
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns all artist presets, normalized through the safe adapter layer.
 * Every returned ArtistPreset is guaranteed to have string fields that are
 * safe to call .charAt(), .toUpperCase(), .trim() etc. on without crashing.
 */
export function getArtistPresets(): ArtistPreset[] {
  const rawArtists: unknown[] = (artistData as { artists?: unknown[] }).artists || [];
  return rawArtists
    .map((raw) => {
      try {
        return normalizeArtistPreset(raw);
      } catch {
        // If a single record is completely malformed, skip it silently.
        // The rest of the list must still render.
        return null;
      }
    })
    .filter((p): p is ArtistPreset => p !== null && p.name.length > 0);
}

/**
 * Searches presets by name, fullName, aliases, works, nationality, and occupation.
 * Returns all presets when query is empty. Never throws.
 */
export function searchArtistPresets(query: string): ArtistPreset[] {
  const all = getArtistPresets();
  const q = safeStr(query).toLowerCase().trim();
  if (!q) return all;

  return all.filter((preset) => {
    const matchName = preset.name.toLowerCase().includes(q);
    const matchFull = preset.fullName.toLowerCase().includes(q);
    const matchAliases = preset.aliases.some((a) => a.toLowerCase().includes(q));
    const matchWorks = preset.works.some((w) => w.toLowerCase().includes(q));
    const matchNationality = preset.nationality.toLowerCase().includes(q);
    const matchOccupation = preset.occupation.some((o) => o.toLowerCase().includes(q));
    return (
      matchName ||
      matchFull ||
      matchAliases ||
      matchWorks ||
      matchNationality ||
      matchOccupation
    );
  });
}
