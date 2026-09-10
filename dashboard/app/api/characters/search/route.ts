import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { GUEST_HALL_OF_FAME, GUEST_GAME_CHARACTERS } from "@/lib/data/guestSeedData";

export const dynamic = "force-dynamic";

export interface CharacterSearchResult {
  id: string;
  characterType: "character_dict" | "game_character";
  name: string;
  avatar: string | null;
  sourceTitle: string;
  role?: string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("q") || "").trim();

    if (!query) {
      return NextResponse.json([]);
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    const isGuestCookie = cookieStore.get("is_guest")?.value === "true";
    const userId = user?.id;

    // ── GUEST MODE SEARCH ─────────────────────────────────────────────────────
    if (isGuestCookie || !userId) {
      const q = query.toLowerCase();
      const results: CharacterSearchResult[] = [];

      // Filter Guest Character Dictionary
      (GUEST_HALL_OF_FAME || []).forEach((h: any) => {
        const matchName = (h.name || "").toLowerCase().includes(q);
        const matchKnown = Array.isArray(h.knownFor)
          ? h.knownFor.some((k: string) => k.toLowerCase().includes(q))
          : (h.knownFor || "").toLowerCase().includes(q);
        const matchShow = (h.tokusatsuShow || h.tokusatsuFranchise || "").toLowerCase().includes(q);

        if (matchName || matchKnown || matchShow) {
          results.push({
            id: h.id,
            characterType: "character_dict",
            name: h.name,
            avatar: h.imageUrl || h.avatarUrl || h.portraitUrl || null,
            sourceTitle:
              h.tokusatsuShow ||
              h.tokusatsuFranchise ||
              (Array.isArray(h.knownFor) ? h.knownFor[0] : h.knownFor) ||
              "Character Dictionary",
            role: h.type || "Character",
          });
        }
      });

      // Filter Guest Game Characters
      (GUEST_GAME_CHARACTERS || []).forEach((g: any) => {
        const matchName = (g.name || "").toLowerCase().includes(q);
        const matchGame = (g.gameName || "").toLowerCase().includes(q);
        const matchTitle = (g.title || "").toLowerCase().includes(q);
        const matchRole = (g.role || g.category || "").toLowerCase().includes(q);

        if (matchName || matchGame || matchTitle || matchRole) {
          results.push({
            id: g.id,
            characterType: "game_character",
            name: g.name,
            avatar: g.cardImage || g.avatarUrl || g.splashArt || null,
            sourceTitle: g.gameName || "Game Character",
            role: g.role || g.category || "Game Character",
          });
        }
      });

      return NextResponse.json(results.slice(0, 20));
    }

    // ── AUTHENTICATED DATABASE SEARCH ──────────────────────────────────────────
    const [dbHof, dbGameChars] = await Promise.all([
      // Query Character Dictionary
      prisma.hallOfFame.findMany({
        where: {
          userId,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { tokusatsuShow: { contains: query, mode: "insensitive" } },
            { tokusatsuFranchise: { contains: query, mode: "insensitive" } },
            { knownFor: { hasSome: [query] } },
          ],
        },
        take: 15,
      }),
      // Query Game Characters
      prisma.gameCharacter.findMany({
        where: {
          userId,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { gameName: { contains: query, mode: "insensitive" } },
            { title: { contains: query, mode: "insensitive" } },
            { role: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 15,
      }),
    ]);

    const results: CharacterSearchResult[] = [];

    dbHof.forEach((h) => {
      results.push({
        id: h.id,
        characterType: "character_dict",
        name: h.name,
        avatar: h.imageUrl || h.portraitUrl || (h as any).avatarUrl || null,
        sourceTitle:
          h.tokusatsuShow ||
          h.tokusatsuFranchise ||
          (Array.isArray(h.knownFor) ? h.knownFor[0] : h.knownFor) ||
          "Character Dictionary",
        role: h.type || "Character",
      });
    });

    dbGameChars.forEach((g) => {
      results.push({
        id: g.id,
        characterType: "game_character",
        name: g.name,
        avatar: g.cardImage || g.avatarUrl || g.splashArt || null,
        sourceTitle: g.gameName || "Game Character",
        role: g.role || g.category || "Game Character",
      });
    });

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("Characters search error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
