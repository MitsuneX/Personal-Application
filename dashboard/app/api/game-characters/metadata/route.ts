import { NextRequest, NextResponse } from "next/server";
import masterDb from "@/lib/data/game_characters_master.json";

export const dynamic = "force-dynamic";

// Map game names to their Fandom wiki base URLs
function getGameWikiBase(gameName: string): string | null {
  const name = gameName.toLowerCase();
  if (name.includes("wuthering waves")) return "https://wutheringwaves.fandom.com";
  if (name.includes("honkai: star rail") || name.includes("star rail")) return "https://honkai-star-rail.fandom.com";
  if (name.includes("genshin")) return "https://genshin-impact.fandom.com";
  if (name.includes("zenless zone zero") || name.includes("zzz")) return "https://zenless-zone-zero.fandom.com";
  if (name.includes("arknights") && name.includes("endfield")) return "https://arknights-endfield.fandom.com";
  if (name.includes("arknights")) return "https://arknights.fandom.com";
  if (name.includes("nikke") || name.includes("goddess of victory")) return "https://nikke.fandom.com";
  if (name.includes("punishing: gray raven") || name.includes("pgr")) return "https://punishing-gray-raven.fandom.com";
  if (name.includes("reverse: 1999") || name.includes("reverse1999")) return "https://reverse1999.fandom.com";
  if (name.includes("honkai impact 3rd") || name.includes("honkai impact")) return "https://honkaiimpact3.fandom.com";
  if (name.includes("solo leveling: arise") || name.includes("solo leveling")) return "https://solo-leveling-arise.fandom.com";
  if (name.includes("dragon ball legends")) return "https://dragonball.fandom.com";
  if (name.includes("outerplane")) return "https://outerplane.fandom.com";
  if (name.includes("stella") && name.includes("sora")) return "https://stellasora.fandom.com";
  if (name.includes("league of legends") || name.includes("lol")) return "https://leagueoflegends.fandom.com";
  if (name.includes("valorant")) return "https://valorant.fandom.com";
  if (name.includes("overwatch")) return "https://overwatch.fandom.com";
  return null;
}

// Fetch a page summary from the Fandom wiki API
async function fetchFandomPage(wikiBase: string, characterName: string): Promise<any | null> {
  try {
    const apiUrl = `${wikiBase}/api.php`;
    const params = new URLSearchParams({
      action: "query",
      titles: characterName,
      prop: "revisions|images",
      rvprop: "content",
      rvslots: "main",
      format: "json",
      origin: "*",
    });

    const res = await fetch(`${apiUrl}?${params.toString()}`, {
      headers: { "User-Agent": "PersonalDashboardBot/1.0" },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const pages = data?.query?.pages;
    if (!pages) return null;

    const page = Object.values(pages)[0] as any;
    if (page?.missing || page?.invalid) return null;

    return page;
  } catch {
    return null;
  }
}

// Parse common infobox fields from wiki wikitext
function parseInfobox(wikitext: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!wikitext) return result;

  // Extract infobox block
  const infoboxMatch = wikitext.match(/\{\{[Cc]haracter(?:\s+\w+)?([\s\S]*?)(?=\n\}\})/);
  const block = infoboxMatch ? infoboxMatch[1] : wikitext;

  // Extract key = value pairs
  const lines = block.split("\n");
  for (const line of lines) {
    const match = line.match(/^\|\s*(\w+)\s*=\s*(.+)/);
    if (match) {
      const key = match[1].toLowerCase().trim();
      const val = match[2]
        .replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, "$1") // [[Link|Text]] -> Link
        .replace(/\{\{[^}]+\}\}/g, "") // remove templates
        .replace(/<[^>]+>/g, "") // remove HTML
        .replace(/<!--[\s\S]*?-->/g, "") // remove comments
        .trim();
      if (val) result[key] = val;
    }
  }

  return result;
}

// Map infobox keys to our character fields
function mapToCharacterFields(infobox: Record<string, string>, gameName: string): Record<string, string | undefined> {
  const get = (...keys: string[]) => {
    for (const k of keys) {
      if (infobox[k]) return infobox[k];
    }
    return undefined;
  };

  return {
    birthday: get("birthday", "birth", "born", "birthdate"),
    gender: get("gender", "sex"),
    height: get("height"),
    weight: get("weight"),
    nation: get("nation", "country", "region", "origin", "affiliation"),
    element: get("element", "type", "attribute", "vision"),
    weapon: get("weapon", "weapontype", "weapon_type"),
    rarity: get("rarity", "stars", "star"),
    path: get("path", "class", "role"),
    faction: get("faction", "group", "organization", "affiliation", "allegiance"),
    species: get("species", "race", "type"),
    voiceJP: get("japanese", "jp", "voice_jp", "cv_jp", "seiyuu", "voice_ja"),
    voiceEN: get("english", "en", "voice_en", "cv_en", "va_en"),
    voiceCN: get("chinese", "cn", "voice_cn", "cv_cn"),
    voiceKR: get("korean", "kr", "voice_kr", "cv_kr"),
    description: get("description", "bio", "profile", "overview", "introduction", "lore"),
    title: get("title", "epithet", "alias"),
  };
}

function findLocalCharacter(name: string, game?: string | null) {
  if (!name) return null;
  const targetName = name.trim().toLowerCase();
  const targetGame = game?.trim().toLowerCase();

  for (const group of (masterDb as any[])) {
    if (targetGame) {
      const gTitle = (group.gameTitle || "").toLowerCase();
      if (!gTitle.includes(targetGame) && !targetGame.includes(gTitle)) {
        continue;
      }
    }
    const flatChars = Array.isArray(group.characters) ? group.characters.flat(Infinity) : [];
    const match = flatChars.find(
      (c: any) => c?.name && (c.name.toLowerCase() === targetName || c.name.toLowerCase().includes(targetName))
    );
    if (match) {
      return { match, gameTitle: group.gameTitle };
    }
  }

  // Global fallback search across all games
  for (const group of (masterDb as any[])) {
    const flatChars = Array.isArray(group.characters) ? group.characters.flat(Infinity) : [];
    const match = flatChars.find(
      (c: any) => c?.name && c.name.toLowerCase() === targetName
    );
    if (match) {
      return { match, gameTitle: group.gameTitle };
    }
  }

  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const characterName = searchParams.get("name");
  const gameName = searchParams.get("game");

  if (!characterName) {
    return NextResponse.json({ error: "Character name is required" }, { status: 400 });
  }

  // 1. Try local JSON Master database first
  const localResult = findLocalCharacter(characterName, gameName);
  if (localResult) {
    const c = localResult.match as any;
    const stats = (c.stats || {}) as any;
    const va = (stats.voiceActors || {}) as any;

    const data: Record<string, any> = {
      title: c.title,
      role: c.role,
      category: c.category,
      element: c.element,
      weapon: c.weapon,
      rarity: c.rarity,
      nation: c.nation,
      birthday: c.birthday,
      accentColor: c.accentColor,
      species: stats.species,
      gender: stats.gender,
      height: stats.height,
      weight: stats.weight,
      path: c.path,
      faction: stats.affiliation || c.nation,
      officialDescription: c.notes || stats.personality,
      voiceActors: Object.keys(va).length > 0 ? va : undefined,
    };

    Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);

    return NextResponse.json({
      success: true,
      metadataStatus: "complete",
      wikiSource: `Master JSON File (${localResult.gameTitle})`,
      data,
    });
  }

  const wikiBase = gameName ? getGameWikiBase(gameName) : null;

  if (!wikiBase) {
    return NextResponse.json({
      success: false,
      metadataStatus: "pending",
      message: `No wiki configured for game: ${gameName || "unknown"}. Metadata Pending.`,
      data: {},
    });
  }

  try {
    const page = await fetchFandomPage(wikiBase, characterName);

    if (!page) {
      // Try alternate capitalization
      const altPage = await fetchFandomPage(
        wikiBase,
        characterName.charAt(0).toUpperCase() + characterName.slice(1)
      );

      if (!altPage) {
        return NextResponse.json({
          success: false,
          metadataStatus: "pending",
          message: `Character "${characterName}" not found on ${wikiBase}. Metadata Pending.`,
          data: {},
        });
      }
    }

    const wikitext = page?.revisions?.[0]?.slots?.main?.["*"] || "";
    const infobox = parseInfobox(wikitext);
    const fields = mapToCharacterFields(infobox, gameName || "");

    // Only return fields that are actually found — never invent
    const data: Record<string, any> = {};
    const missing: string[] = [];

    const fieldMap: Record<string, string> = {
      birthday: "birthday",
      gender: "gender",
      height: "height",
      weight: "weight",
      nation: "nation",
      element: "element",
      weapon: "weapon",
      rarity: "rarity",
      path: "path",
      faction: "faction",
      species: "species",
      title: "title",
    };

    for (const [srcKey, destKey] of Object.entries(fieldMap)) {
      if (fields[srcKey]) {
        data[destKey] = fields[srcKey];
      } else {
        missing.push(destKey);
      }
    }

    // Voice actors
    const va: Record<string, string> = {};
    if (fields.voiceJP) va.jp = fields.voiceJP;
    if (fields.voiceEN) va.en = fields.voiceEN;
    if (fields.voiceCN) va.cn = fields.voiceCN;
    if (fields.voiceKR) va.kr = fields.voiceKR;
    if (Object.keys(va).length > 0) data.voiceActors = va;

    // Official description
    if (fields.description) {
      data.officialDescription = fields.description.slice(0, 800);
    }

    const hasData = Object.keys(data).length > 0;
    const metadataStatus = hasData
      ? missing.length > 0 ? "partial" : "complete"
      : "pending";

    return NextResponse.json({
      success: hasData,
      metadataStatus,
      wikiSource: wikiBase,
      missing: missing.length > 0 ? missing : undefined,
      data,
    });
  } catch (err: any) {
    console.error("Metadata fetch error:", err);
    return NextResponse.json({
      success: false,
      metadataStatus: "pending",
      message: "Failed to fetch metadata. Metadata Pending.",
      data: {},
    });
  }
}
