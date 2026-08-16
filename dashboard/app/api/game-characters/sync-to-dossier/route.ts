import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function getAuthUser() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

/**
 * Computes safe field updates from authoritative GameCharacter to GameDossierCharacter.
 * - Only includes non-empty/non-null GC values.
 * - Never overwrites notes, levelRank, or matches.
 * - Never nulls out existing dossier values if GC has no value.
 */
export function computeDossierMerge(gc: any, dossier: any) {
  const gcStats = (gc.stats && typeof gc.stats === "object" ? gc.stats : {}) as Record<string, any>;
  const fieldsUpdated: string[] = [];
  const merge: Record<string, any> = {};

  function addField(dosKey: string, gcVal: any) {
    if (gcVal !== null && gcVal !== undefined && gcVal !== "") {
      if (dossier[dosKey] !== gcVal) {
        merge[dosKey] = gcVal;
        fieldsUpdated.push(dosKey);
      }
    }
  }

  // Canonical metadata fields — GC always wins when non-empty
  addField("role",        gc.role);
  addField("element",     gc.element);
  addField("weapon",      gc.weapon);
  addField("rarity",      gc.rarity);
  addField("nation",      gc.nation);
  addField("birthday",    gc.birthday);
  addField("accentColor", gc.accentColor);

  // Path & Category synchronization (fixes Harmony / Path mismatch bug)
  if (gc.path && gc.path.trim().length > 0) {
    const trimmedPath = gc.path.trim();
    if (dossier.path !== trimmedPath) {
      merge.path = trimmedPath;
      fieldsUpdated.push("path");
    }
    if (!gc.category && dossier.category !== trimmedPath) {
      merge.category = trimmedPath;
      fieldsUpdated.push("category");
    }
  }
  if (gc.category && gc.category.trim().length > 0) {
    const trimmedCat = gc.category.trim();
    if (dossier.category !== trimmedCat) {
      merge.category = trimmedCat;
      fieldsUpdated.push("category");
    }
    if (!gc.path && dossier.path !== trimmedCat) {
      merge.path = trimmedCat;
      fieldsUpdated.push("path");
    }
  }

  // faction lives in stats.faction or stats.affiliation on the GC side
  const gcFaction = (gcStats?.faction as string | undefined) || (gcStats?.affiliation as string | undefined) || null;
  if (gcFaction && dossier.faction !== gcFaction) {
    merge.faction = gcFaction;
    fieldsUpdated.push("faction");
  }

  // Specialty from stats
  const gcSpecialty = (gcStats?.specialty as string | undefined) ?? gc.category ?? null;
  if (gcSpecialty && dossier.specialty !== gcSpecialty) {
    merge.specialty = gcSpecialty;
    fieldsUpdated.push("specialty");
  }

  // Tags
  if (gc.tags && Array.isArray(gc.tags) && gc.tags.length > 0) {
    if (JSON.stringify(dossier.tags || []) !== JSON.stringify(gc.tags)) {
      merge.tags = gc.tags;
      fieldsUpdated.push("tags");
    }
  }

  // Stats additive merge
  if (gc.stats && typeof gc.stats === "object" && Object.keys(gc.stats).length > 0) {
    const existingStats = (dossier.stats && typeof dossier.stats === "object" ? dossier.stats : {}) as Record<string, any>;
    const mergedStats = { ...existingStats, ...gcStats };
    if (JSON.stringify(existingStats) !== JSON.stringify(mergedStats)) {
      merge.stats = mergedStats;
      fieldsUpdated.push("stats");
    }
  }

  // Artwork — only update if GC has a non-empty value (never wipe existing Dossier art)
  if (gc.avatarUrl && gc.avatarUrl.trim().length > 0 && gc.avatarUrl !== dossier.avatarUrl) {
    merge.avatarUrl = gc.avatarUrl;
    fieldsUpdated.push("avatarUrl");
  }
  if (gc.splashArt && gc.splashArt.trim().length > 0 && gc.splashArt !== dossier.splashArt) {
    merge.splashArt = gc.splashArt;
    fieldsUpdated.push("splashArt");
  }

  // gameId alignment
  if (gc.gameId && gc.gameId !== "pending-game" && gc.gameId !== dossier.gameId) {
    merge.gameId = gc.gameId;
    fieldsUpdated.push("gameId");
  }

  // winRate: only overwrite if current Dossier value is 0 or null and GC has a real value
  if (gc.winRate !== null && gc.winRate !== undefined && (dossier.winRate === null || dossier.winRate === 0)) {
    const num = Number(gc.winRate);
    if (dossier.winRate !== num) {
      merge.winRate = num;
      fieldsUpdated.push("winRate");
    }
  }

  // Health / damage / difficulty
  if (gc.health !== null && gc.health !== undefined && dossier.health !== gc.health) {
    merge.health = gc.health;
    fieldsUpdated.push("health");
  }
  if (gc.damage !== null && gc.damage !== undefined && dossier.damage !== gc.damage) {
    merge.damage = gc.damage;
    fieldsUpdated.push("damage");
  }
  if (gc.difficulty && dossier.difficulty !== gc.difficulty) {
    merge.difficulty = gc.difficulty;
    fieldsUpdated.push("difficulty");
  }

  return { merge, fieldsUpdated: Array.from(new Set(fieldsUpdated)) };
}

/**
 * ONE-WAY CANONICAL METADATA SYNC ENGINE: GameCharacter → GameDossierCharacter
 *
 * Supports:
 * 1. Single character sync: { gameCharacterId: string }
 * 2. Bulk game sync: { gameId: string }
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    const isGuestCookie = (await cookies()).get("is_guest")?.value === "true";

    if (isGuestCookie || !user) {
      return NextResponse.json({ success: true, isGuest: true, fieldsUpdated: [], processed: 0 });
    }

    const userId = user.id;
    const body = await req.json();
    const { gameCharacterId, gameId } = body;

    if (!gameCharacterId && !gameId) {
      return NextResponse.json(
        { error: "Either gameCharacterId or gameId is required" },
        { status: 400 }
      );
    }

    // =========================================================================
    // CASE A: SINGLE CHARACTER METADATA SYNC
    // =========================================================================
    if (gameCharacterId) {
      const gc = await prisma.gameCharacter.findUnique({
        where: { id: gameCharacterId },
      });

      if (!gc) {
        return NextResponse.json(
          { error: `GameCharacter "${gameCharacterId}" not found` },
          { status: 404 }
        );
      }

      // Step 1: Resolve linked dossier
      let dossier = gc.characterId
        ? await prisma.gameDossierCharacter.findUnique({ where: { id: gc.characterId } })
        : null;

      if (!dossier && gc.gameId && gc.name) {
        dossier = await prisma.gameDossierCharacter.findFirst({
          where: {
            gameId: gc.gameId,
            name: { equals: gc.name.trim(), mode: "insensitive" },
          },
        });
      }

      if (!dossier && gc.name) {
        dossier = await prisma.gameDossierCharacter.findFirst({
          where: {
            name: { equals: gc.name.trim(), mode: "insensitive" },
          },
        });
      }

      // Step 2: If no dossier exists, create one to repair broken link
      if (!dossier) {
        const gcStats = (gc.stats && typeof gc.stats === "object" ? gc.stats : {}) as Record<string, any>;
        const resolvedGameId = (gc.gameId && gc.gameId !== "pending-game") ? gc.gameId : "pending-game";
        const resolvedCategory = gc.category || gc.path || "Main Roster";

        dossier = await prisma.gameDossierCharacter.create({
          data: {
            userId,
            gameId: resolvedGameId,
            name: gc.name,
            category: resolvedCategory,
            role: gc.role || null,
            element: gc.element || null,
            path: gc.path || gc.category || null,
            weapon: gc.weapon || null,
            rarity: gc.rarity || null,
            nation: gc.nation || null,
            birthday: gc.birthday || null,
            accentColor: gc.accentColor || null,
            avatarUrl: gc.avatarUrl || null,
            splashArt: gc.splashArt || null,
            faction: (gcStats?.faction as string) || (gcStats?.affiliation as string) || null,
            specialty: (gcStats?.specialty as string) || gc.category || null,
            health: gc.health ?? null,
            damage: gc.damage ?? null,
            difficulty: gc.difficulty || null,
            winRate: gc.winRate ? Number(gc.winRate) : 0,
            matches: 0,
            stats: gc.stats || {},
            tags: gc.tags || [],
          },
        });

        await prisma.gameCharacter.update({
          where: { id: gc.id },
          data: { characterId: dossier.id },
        });

        return NextResponse.json({
          success: true,
          wasLinked: false,
          createdNew: true,
          dossierCharacter: dossier,
          fieldsUpdated: ["created_and_linked_all_fields"],
          message: `Created and linked new Game Database record for "${gc.name}".`,
        });
      }

      // Step 3: Compute safe merge
      const { merge, fieldsUpdated } = computeDossierMerge(gc, dossier);

      let updatedDossier = dossier;
      if (Object.keys(merge).length > 0) {
        updatedDossier = await prisma.gameDossierCharacter.update({
          where: { id: dossier.id },
          data: merge,
        });
      }

      if (!gc.characterId || gc.characterId !== dossier.id) {
        await prisma.gameCharacter.update({
          where: { id: gc.id },
          data: { characterId: dossier.id },
        });
      }

      return NextResponse.json({
        success: true,
        wasLinked: Boolean(gc.characterId),
        dossierCharacter: updatedDossier,
        fieldsUpdated,
        message:
          fieldsUpdated.length > 0
            ? `Synced ${fieldsUpdated.length} field(s): ${fieldsUpdated.join(", ")}`
            : "Already up-to-date — no fields needed syncing.",
      });
    }

    // =========================================================================
    // CASE B: BULK GAME METADATA SYNC (All characters for selected game)
    // =========================================================================
    const targetGame = await prisma.game.findFirst({
      where: {
        OR: [
          { id: gameId },
          { game: { equals: gameId, mode: "insensitive" } },
        ],
      },
    });

    const resolvedGameId = targetGame ? targetGame.id : gameId;
    const gameName = targetGame ? targetGame.game : "";

    // Fetch active GameCharacters for this game
    const gameCharacters = await prisma.gameCharacter.findMany({
      where: {
        OR: [
          { gameId: resolvedGameId },
          ...(gameName ? [{ gameName: { equals: gameName, mode: "insensitive" as const } }] : []),
        ],
      },
    });

    // Fetch existing dossiers for this game
    const existingDossiers = await prisma.gameDossierCharacter.findMany({
      where: { gameId: resolvedGameId },
    });

    // Lookup maps in memory for high-performance bulk processing
    const dossiersById = new Map<string, any>();
    const dossiersByName = new Map<string, any>();

    for (const d of existingDossiers) {
      dossiersById.set(d.id, d);
      dossiersByName.set(d.name.trim().toLowerCase(), d);
    }

    let updatedCount = 0;
    let currentCount = 0;
    let createdCount = 0;
    let errorCount = 0;
    const updatedDossiers: any[] = [];
    const results: any[] = [];

    for (const gc of gameCharacters) {
      try {
        const normName = gc.name.trim().toLowerCase();
        let dossier = (gc.characterId && dossiersById.get(gc.characterId)) ||
          dossiersByName.get(normName) ||
          null;

        if (!dossier) {
          // If no dossier exists, create one
          const gcStats = (gc.stats && typeof gc.stats === "object" ? gc.stats : {}) as Record<string, any>;
          const cat = gc.category || gc.path || "Main Roster";

          const newDossier = await prisma.gameDossierCharacter.create({
            data: {
              userId,
              gameId: resolvedGameId,
              name: gc.name,
              category: cat,
              role: gc.role || null,
              element: gc.element || null,
              path: gc.path || gc.category || null,
              weapon: gc.weapon || null,
              rarity: gc.rarity || null,
              nation: gc.nation || null,
              birthday: gc.birthday || null,
              accentColor: gc.accentColor || null,
              avatarUrl: gc.avatarUrl || null,
              splashArt: gc.splashArt || null,
              faction: (gcStats?.faction as string) || (gcStats?.affiliation as string) || null,
              specialty: (gcStats?.specialty as string) || gc.category || null,
              health: gc.health ?? null,
              damage: gc.damage ?? null,
              difficulty: gc.difficulty || null,
              winRate: gc.winRate ? Number(gc.winRate) : 0,
              matches: 0,
              stats: gc.stats || {},
              tags: gc.tags || [],
            },
          });

          await prisma.gameCharacter.update({
            where: { id: gc.id },
            data: { characterId: newDossier.id },
          });

          dossiersById.set(newDossier.id, newDossier);
          dossiersByName.set(normName, newDossier);
          updatedDossiers.push(newDossier);
          createdCount++;
          results.push({ name: gc.name, status: "created", fields: ["all"] });
        } else {
          // Compute safe merge
          const { merge, fieldsUpdated } = computeDossierMerge(gc, dossier);

          if (fieldsUpdated.length > 0) {
            const updated = await prisma.gameDossierCharacter.update({
              where: { id: dossier.id },
              data: merge,
            });
            dossiersById.set(updated.id, updated);
            dossiersByName.set(normName, updated);
            updatedDossiers.push(updated);
            updatedCount++;
            results.push({ name: gc.name, status: "updated", fields: fieldsUpdated });
          } else {
            currentCount++;
            results.push({ name: gc.name, status: "current", fields: [] });
          }

          if (!gc.characterId || gc.characterId !== dossier.id) {
            await prisma.gameCharacter.update({
              where: { id: gc.id },
              data: { characterId: dossier.id },
            });
          }
        }
      } catch (err: any) {
        console.error(`[BulkSync] Error syncing character ${gc.name}:`, err);
        errorCount++;
        results.push({ name: gc.name, status: "error", error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        processed: gameCharacters.length,
        updated: updatedCount,
        current: currentCount,
        created: createdCount,
        errors: errorCount,
      },
      updatedDossiers,
      results,
      message: `Sync Complete: ${gameCharacters.length} processed, ${updatedCount} updated, ${currentCount} already current, ${createdCount} created, ${errorCount} errors.`,
    });
  } catch (error: any) {
    console.error("POST /api/game-characters/sync-to-dossier error:", error);
    return NextResponse.json(
      { error: error.message || "Metadata sync failed" },
      { status: 500 }
    );
  }
}

