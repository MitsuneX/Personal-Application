import prisma from "@/lib/prisma";

// ─── Game Alias Normalizer ───────────────────────────────────────────────────
const GAME_ALIASES: Record<string, string> = {
  wuwa: "Wuthering Waves",
  "wuthering waves": "Wuthering Waves",
  hsr: "Honkai: Star Rail",
  "honkai star rail": "Honkai: Star Rail",
  "honkai: star rail": "Honkai: Star Rail",
  starrail: "Honkai: Star Rail",
  genshin: "Genshin Impact",
  "genshin impact": "Genshin Impact",
  zzz: "Zenless Zone Zero",
  "zenless zone zero": "Zenless Zone Zero",
  nikke: "Goddess of Victory: Nikke",
  "goddess of victory: nikke": "Goddess of Victory: Nikke",
  pgr: "Punishing: Gray Raven",
  "punishing gray raven": "Punishing: Gray Raven",
  hi3: "Honkai Impact 3rd",
  "honkai impact 3rd": "Honkai Impact 3rd",
  "reverse: 1999": "Reverse: 1999",
  "reverse 1999": "Reverse: 1999",
  reverse1999: "Reverse: 1999",
  "arknights": "Arknights",
  "azur promilia": "Azur Promilia",
  "outerplane": "Outerplane",
  "solo leveling": "Solo Leveling: Arise",
  "solo leveling arise": "Solo Leveling: Arise",
  "stella sora": "Stella Sora",
  "dragon ball legends": "Dragon Ball Legends",
  "mobile legends": "Mobile Legends: Bang Bang",
  mlbb: "Mobile Legends: Bang Bang",
};

export function normalizeGameName(name?: string | null): string {
  if (!name) return "";
  const cleaned = name.trim().toLowerCase();
  return GAME_ALIASES[cleaned] || name.trim();
}

// ─── Input Types ─────────────────────────────────────────────────────────────
export interface CreateCharacterInput {
  id?: string;
  userId?: string | null;
  name: string;
  gameId?: string | null;
  gameName?: string | null;

  // Mode Controls
  isFavorite?: boolean;
  createFavorite?: boolean;
  createDossierOnly?: boolean;

  // Basic & Identity
  title?: string;
  officialName?: string;
  alias?: string;
  nickname?: string;
  nativeName?: string;
  birthday?: string;
  age?: string;
  gender?: string;
  height?: string;
  weight?: string;
  species?: string;
  race?: string;

  // World
  nation?: string;
  region?: string;
  planet?: string;
  organization?: string;
  affiliation?: string;
  faction?: string;

  // Combat
  role?: string;
  category?: string;
  element?: string;
  attribute?: string;
  path?: string;
  weapon?: string;
  rarity?: string;
  damageType?: string;
  combatRole?: string;
  specialty?: string;

  // Competitive
  winRate?: number;
  pickRate?: number;
  banRate?: number;

  // Story & Voice
  voiceActors?: { jp?: string; cn?: string; kr?: string; en?: string };
  personality?: string;
  biography?: string;
  officialDescription?: string;
  favoriteQuote?: string;

  // Images
  avatarUrl?: string;        // Official Card Art
  cardImage?: string;        // Favorite Card Art override
  splashArt?: string;        // Official Splash Art
  favoriteSplashArt?: string;// Favorite Splash Art override
  gallery?: string[];

  // Meta & Stats
  accentColor?: string;
  rank?: number;
  likes?: number;
  notes?: string;
  stats?: any;
  tags?: string[];
  links?: any;
  tier?: string;
}

export interface CharacterCreationResult {
  dossierCharacter: any;
  gameCharacter: any | null;
  isExistingDossierReused: boolean;
  isPendingGameLink: boolean;
}

// ─── CENTRALIZED CHARACTER CREATION SERVICE ──────────────────────────────────
export async function processCharacterCreation(
  input: CreateCharacterInput
): Promise<CharacterCreationResult> {
  const trimmedName = input.name?.trim();
  const cleanName = input.name.trim().replace(/\s+/g, " ");
  if (!cleanName) {
    throw new Error("Character name is required");
  }

  const userId = input.userId || null;
  const rawGameName = input.gameName?.trim() || "";
  const normalizedName = normalizeGameName(rawGameName);

  // STEP 1: Locate Parent Game in Database
  let targetGame: any = null;
  if (input.gameId) {
    targetGame = await prisma.game.findFirst({
      where: { id: input.gameId, ...(userId ? { userId } : {}) },
    });
  }

  if (!targetGame && normalizedName) {
    targetGame = await prisma.game.findFirst({
      where: {
        game: { equals: normalizedName, mode: "insensitive" },
        ...(userId ? { userId } : {}),
      },
    });
  }

  const resolvedGameId = targetGame?.id || (input.gameId ?? null);
  const resolvedGameName = targetGame?.game || normalizedName || rawGameName || null;
  const isPendingGameLink = !targetGame && Boolean(resolvedGameName);

  // STEP 2: Character Collection (GameDossierCharacter) UPSERT
  let existingDossier: any = null;

  if (input.id) {
    existingDossier = await prisma.gameDossierCharacter.findUnique({
      where: { id: input.id },
    });
  }

  if (!existingDossier && resolvedGameId) {
    existingDossier = await prisma.gameDossierCharacter.findFirst({
      where: {
        gameId: resolvedGameId,
        name: { equals: cleanName, mode: "insensitive" },
        ...(userId ? { userId } : {}),
      },
    });
  }

  if (!existingDossier && resolvedGameName) {
    existingDossier = await prisma.gameDossierCharacter.findFirst({
      where: {
        name: { equals: cleanName, mode: "insensitive" },
        ...(userId ? { userId } : {}),
      },
    });
  }

  const officialAvatar = input.avatarUrl || input.cardImage || null;
  const officialSplash = input.splashArt || null;

  const dossierPayload = {
    userId,
    gameId: resolvedGameId || "pending-game",
    name: cleanName,
    category: input.category || targetGame?.category || "Main Roster",
    role: input.role || input.element || "Roster Member",
    element: input.element || null,
    path: input.path || null,
    weapon: input.weapon || null,
    rarity: input.rarity || null,
    nation: input.nation || null,
    birthday: input.birthday || null,
    faction: input.faction || null,
    specialty: input.specialty || null,
    avatarUrl: officialAvatar,
    splashArt: officialSplash,
    accentColor: input.accentColor || targetGame?.accentColor || "#3B82F6",
    isFavorite: input.isFavorite ?? true,
    winRate: input.winRate ? Number(input.winRate) : 0,
    notes: input.notes || null,
    stats: input.stats ? (input.stats as any) : undefined,
    tags: input.tags ? (input.tags as any) : undefined,
  };

  let dossierCharacter: any = null;
  let isExistingDossierReused = false;

  if (existingDossier) {
    dossierCharacter = await prisma.gameDossierCharacter.update({
      where: { id: existingDossier.id },
      data: {
        ...dossierPayload,
        // Preserve existing artwork if input artwork is empty
        avatarUrl: officialAvatar || existingDossier.avatarUrl,
        splashArt: officialSplash || existingDossier.splashArt,
      },
    });
    isExistingDossierReused = true;
  } else {
    try {
      dossierCharacter = await prisma.gameDossierCharacter.create({
        data: {
          id: input.id && input.createDossierOnly ? input.id : undefined,
          ...dossierPayload,
        },
      });
    } catch (err: any) {
      // P2002 is Prisma Unique Constraint Violation
      if (err?.code === "P2002") {
        const found = await prisma.gameDossierCharacter.findFirst({
          where: {
            gameId: resolvedGameId || "pending-game",
            name: { equals: cleanName, mode: "insensitive" },
          },
        });
        if (found) {
          dossierCharacter = await prisma.gameDossierCharacter.update({
            where: { id: found.id },
            data: dossierPayload,
          });
          isExistingDossierReused = true;
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    }
  }

  // STEP 3: Game Character (Favorites) UPSERT
  const shouldCreateFavorite =
    input.createFavorite ||
    input.isFavorite !== false &&
    !input.createDossierOnly;

  let gameCharacter: any = null;

  if (shouldCreateFavorite) {
    // Check if favorite record already exists for this dossierCharacter or name+game
    let existingFavorite = await prisma.gameCharacter.findFirst({
      where: {
        OR: [
          { characterId: dossierCharacter.id },
          {
            name: { equals: trimmedName, mode: "insensitive" },
            ...(resolvedGameId ? { gameId: resolvedGameId } : {}),
          },
        ],
        ...(userId ? { userId } : {}),
      },
    });

    const favAvatar = input.cardImage || input.avatarUrl || dossierCharacter.avatarUrl;
    const favSplash = input.favoriteSplashArt || input.splashArt || dossierCharacter.splashArt;

    const favoritePayload = {
      userId,
      characterId: dossierCharacter.id,
      gameId: resolvedGameId,
      gameName: resolvedGameName,
      name: trimmedName,
      title: input.title || null,
      role: input.role || null,
      category: input.category || null,
      element: input.element || null,
      path: input.path || null,
      weapon: input.weapon || null,
      rarity: input.rarity || null,
      nation: input.nation || null,
      birthday: input.birthday || null,
      avatarUrl: favAvatar,
      splashArt: favSplash,
      accentColor: input.accentColor || dossierCharacter.accentColor || "#3B82F6",
      rank: input.rank !== undefined ? Number(input.rank) : 0,
      likes: input.likes !== undefined ? Number(input.likes) : 0,
      isFavorite: true,
      notes: input.notes || null,
      stats: {
        ...(input.stats || {}),
        officialName: input.officialName,
        alias: input.alias,
        nickname: input.nickname,
        nativeName: input.nativeName,
        age: input.age,
        gender: input.gender,
        height: input.height,
        weight: input.weight,
        species: input.species,
        race: input.race,
        region: input.region,
        planet: input.planet,
        organization: input.organization,
        affiliation: input.affiliation,
        faction: input.faction,
        attribute: input.attribute,
        damageType: input.damageType,
        combatRole: input.combatRole,
        voiceActors: input.voiceActors,
        personality: input.personality,
        biography: input.biography,
        officialDescription: input.officialDescription,
        favoriteQuote: input.favoriteQuote,
        gallery: input.gallery,
        cardImage: favAvatar,
      } as any,
      tags: input.tags ? (input.tags as any) : undefined,
      links: input.links ? (input.links as any) : undefined,
    };

    if (existingFavorite) {
      gameCharacter = await prisma.gameCharacter.update({
        where: { id: existingFavorite.id },
        data: favoritePayload,
      });
    } else {
      gameCharacter = await prisma.gameCharacter.create({
        data: {
          id: input.id && !input.createDossierOnly ? input.id : undefined,
          ...favoritePayload,
        },
      });
    }
  }

  return {
    dossierCharacter,
    gameCharacter,
    isExistingDossierReused,
    isPendingGameLink,
  };
}

// ─── SELF-HEALING REPAIR & SYNCHRONIZATION UTILITY ────────────────────────────
export async function repairCharacterDatabase(userId?: string | null): Promise<{
  repairedCount: number;
  linkedGamesCount: number;
}> {
  let repairedCount = 0;
  let linkedGamesCount = 0;

  // 1. Fetch only GameCharacters that need repair (missing characterId, missing gameId, or pending-game)
  const gameChars = await prisma.gameCharacter.findMany({
    where: {
      ...(userId ? { userId } : {}),
      OR: [
        { characterId: null },
        { gameId: null },
        { gameId: "pending-game" },
      ],
    },
  });

  // 2. Fetch all DossierCharacters
  const dossierChars = await prisma.gameDossierCharacter.findMany({
    where: userId ? { userId } : {},
  });

  // 3. Fetch all Games
  const games = await prisma.game.findMany({
    where: userId ? { userId } : {},
  });

  const dossierMap = new Map(dossierChars.map((dc) => [dc.id, dc]));

  for (const gc of gameChars) {
    try {
      let linkedDossier = gc.characterId ? dossierMap.get(gc.characterId) : null;

      // If characterId is missing or linked dossier doesn't exist, create/link it!
      if (!linkedDossier) {
        const matchByName = dossierChars.find(
          (dc) =>
            dc.name.toLowerCase() === gc.name.toLowerCase() &&
            (dc.gameId === gc.gameId || !gc.gameId)
        );

        if (matchByName) {
          try {
            await prisma.gameCharacter.update({
              where: { id: gc.id },
              data: { characterId: matchByName.id },
            });
            linkedDossier = matchByName;
            repairedCount++;
          } catch {
            // gc record was deleted concurrently
          }
        } else {
          // Auto-create missing Character Collection entry
          const newDossier = await prisma.gameDossierCharacter.create({
            data: {
              userId: gc.userId,
              gameId: gc.gameId || "pending-game",
              name: gc.name,
              category: gc.category || "Main Roster",
              role: gc.role || gc.element || "Roster Member",
              element: gc.element || null,
              path: gc.path || null,
              weapon: gc.weapon || null,
              rarity: gc.rarity || null,
              nation: gc.nation || null,
              birthday: gc.birthday || null,
              avatarUrl: gc.avatarUrl || null,
              splashArt: gc.splashArt || null,
              accentColor: gc.accentColor || "#3B82F6",
              isFavorite: true,
              notes: gc.notes || null,
              stats: gc.stats ? (gc.stats as any) : undefined,
              tags: gc.tags ? (gc.tags as any) : undefined,
            },
          });
          try {
            await prisma.gameCharacter.update({
              where: { id: gc.id },
              data: { characterId: newDossier.id },
            });
            dossierMap.set(newDossier.id, newDossier);
            repairedCount++;
          } catch {
            // gc record was deleted concurrently
          }
        }
      }

      // If gameId is missing or pending-game but parent game exists now, auto-link gameId
      if ((!gc.gameId || gc.gameId === "pending-game") && gc.gameName) {
        const gcNorm = normalizeGameName(gc.gameName).toLowerCase();
        const matchedGame = games.find(
          (g) => normalizeGameName(g.game).toLowerCase() === gcNorm
        );
        if (matchedGame) {
          try {
            await prisma.gameCharacter.update({
              where: { id: gc.id },
              data: { gameId: matchedGame.id, gameName: matchedGame.game },
            });
          } catch {
            // gc record was deleted concurrently
          }
          if (gc.characterId) {
            try {
              await prisma.gameDossierCharacter.update({
                where: { id: gc.characterId },
                data: { gameId: matchedGame.id },
              });
            } catch {
              // dossier record was deleted concurrently
            }
          }
          linkedGamesCount++;
        }
      }
    } catch (err) {
      // Record may have been cleaned up or updated concurrently, safely proceed
      console.warn(`[Self-Healing] Skipping record ${gc.id}:`, err);
    }
  }

  // Also clean up any duplicate character collection records
  await repairDuplicateDossierCharacters(userId);

  return { repairedCount, linkedGamesCount };
}

// ─── DUPLICATE CHARACTER COLLECTION REPAIR UTILITY ────────────────────────────
export async function repairDuplicateDossierCharacters(userId?: string | null): Promise<{
  mergedGroupsCount: number;
  deletedDuplicatesCount: number;
}> {
  const allDossiers = await prisma.gameDossierCharacter.findMany({
    where: userId ? { userId } : {},
    select: { id: true, gameId: true, name: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const grouped = new Map<string, any[]>();

  for (const dc of allDossiers) {
    const key = `${dc.gameId}_${dc.name.trim().toLowerCase().replace(/\s+/g, " ")}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(dc);
  }

  let mergedGroupsCount = 0;
  let deletedDuplicatesCount = 0;

  for (const [, group] of grouped.entries()) {
    if (group.length <= 1) continue;

    mergedGroupsCount++;
    const canonical = group[0];
    const duplicates = group.slice(1);
    const dupIds = duplicates.map((d) => d.id);

    // Re-link any GameCharacter referencing dupIds to canonical.id
    try {
      await prisma.gameCharacter.updateMany({
        where: { characterId: { in: dupIds } },
        data: { characterId: canonical.id },
      });
    } catch (err) {
      console.warn(`[Duplicate Repair] Failed to re-link GameCharacters:`, err);
    }

    // Batch delete duplicate dossier rows in one query
    try {
      const del = await prisma.gameDossierCharacter.deleteMany({
        where: { id: { in: dupIds } },
      });
      deletedDuplicatesCount += del.count;
    } catch (err) {
      console.warn(`[Duplicate Repair] Failed to delete duplicate dossiers:`, err);
    }
  }

  return { mergedGroupsCount, deletedDuplicatesCount };
}
