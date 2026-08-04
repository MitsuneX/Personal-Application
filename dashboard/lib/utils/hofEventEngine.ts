import { PrismaClient } from "@prisma/client";

/**
 * Calculates a dynamic Prestige Score for a Hall of Fame entry based on weighted parameters.
 *
 * Formula:
 *  Prestige = (Likes * 1.5) + (Rank Bonus) + (KnownFor Works * 2.0) + (Championship Days * 0.5) + (Badges * 3.0)
 */
export function calculatePrestigeScore(params: {
  likes: number;
  rankIndex: number;
  worksCount: number;
  championshipDays?: number;
  badgeCount?: number;
}): number {
  const likesScore = (params.likes || 0) * 1.5;
  const rankBonus = Math.max(0, 30 - params.rankIndex * 2); // #1 gets 30, #2 gets 28, etc.
  const worksScore = (params.worksCount || 0) * 2.0;
  const champScore = (params.championshipDays || 0) * 0.5;
  const badgeScore = (params.badgeCount || 0) * 3.0;

  const total = likesScore + rankBonus + worksScore + champScore + badgeScore;
  return Math.round(total * 10) / 10;
}

/**
 * Helper to record a HallEvent in PostgreSQL.
 */
export async function logHallEvent(
  prisma: any,
  event: {
    userId: string;
    type: string;
    characterId?: string;
    characterName: string;
    oldRank?: number | null;
    newRank?: number | null;
    oldVotes?: number | null;
    newVotes?: number | null;
    metadata?: Record<string, any>;
  }
) {
  try {
    return await prisma.hallEvent.create({
      data: {
        userId: event.userId,
        type: event.type,
        characterId: event.characterId || null,
        characterName: event.characterName,
        oldRank: event.oldRank ?? null,
        newRank: event.newRank ?? null,
        oldVotes: event.oldVotes ?? null,
        newVotes: event.newVotes ?? null,
        metadata: event.metadata ? JSON.parse(JSON.stringify(event.metadata)) : undefined,
      },
    });
  } catch (err: any) {
    console.error("Failed to log HallEvent:", err.message);
  }
}

/**
 * Capture a point-in-time ranking snapshot of all Hall of Fame entries for a user.
 */
export async function captureHallRankingSnapshots(prisma: any, userId: string) {
  try {
    const entries = await prisma.hallOfFame.findMany({
      where: { userId },
      orderBy: { likes: "desc" },
    });

    const snapshots = entries.map((entry: any, index: number) => {
      const rank = index + 1;
      const prestigeScore = calculatePrestigeScore({
        likes: entry.likes || 0,
        rankIndex: index,
        worksCount: Array.isArray(entry.knownFor) ? entry.knownFor.length : 0,
      });

      return {
        userId,
        characterId: entry.id,
        characterName: entry.name,
        rank,
        votes: entry.likes || 0,
        prestigeScore,
      };
    });

    if (snapshots.length > 0) {
      await prisma.hallRankingSnapshot.createMany({
        data: snapshots,
      });
    }
  } catch (err: any) {
    console.error("Failed to capture HallRankingSnapshot:", err.message);
  }
}

/**
 * Handles Champion changes and title reigns.
 * When a new character reaches #1 or is set as champion, closes active reign & creates new reign.
 */
export async function updateChampionshipHistoryOnRankChange(
  prisma: any,
  userId: string,
  newChampion: {
    id: string;
    name: string;
    type: string;
    nationality?: string | null;
    imageUrl?: string | null;
    likes: number;
  }
) {
  try {
    // Check current active champion reign (endDate is null)
    const activeReign = await prisma.championshipHistory.findFirst({
      where: { userId, endDate: null },
    });

    // If active champion is already this character, update their highestVotes / defenses
    if (activeReign && activeReign.characterId === newChampion.id) {
      const highestVotes = Math.max(activeReign.highestVotes, newChampion.likes);
      const timesDefended = activeReign.timesDefended + (newChampion.likes > activeReign.highestVotes ? 1 : 0);
      const durationDays = Math.max(
        1,
        Math.floor((Date.now() - new Date(activeReign.startDate).getTime()) / (1000 * 60 * 60 * 24))
      );

      await prisma.championshipHistory.update({
        where: { id: activeReign.id },
        data: {
          highestVotes,
          timesDefended,
          durationDays,
        },
      });
      return;
    }

    // New champion dethroning current champion!
    const now = new Date();

    if (activeReign) {
      const durationDays = Math.max(
        1,
        Math.floor((now.getTime() - new Date(activeReign.startDate).getTime()) / (1000 * 60 * 60 * 24))
      );

      await prisma.championshipHistory.update({
        where: { id: activeReign.id },
        data: {
          endDate: now,
          durationDays,
          reasonEnded: `Surpassed by ${newChampion.name} in community votes`,
        },
      });

      // Log event for champion lost
      await logHallEvent(prisma, {
        userId,
        type: "CHAMPION_CHANGED",
        characterId: activeReign.characterId,
        characterName: activeReign.championName,
        metadata: {
          action: "DETHRONED",
          newChampion: newChampion.name,
          reignDays: durationDays,
        },
      });
    }

    // Count how many total championships exist to determine championshipNumber
    const totalReigns = await prisma.championshipHistory.count({ where: { userId } });

    // Create new championship reign
    await prisma.championshipHistory.create({
      data: {
        userId,
        characterId: newChampion.id,
        championName: newChampion.name,
        startDate: now,
        endDate: null,
        durationDays: 1,
        highestVotes: newChampion.likes,
        timesDefended: 0,
        championshipNumber: totalReigns + 1,
        reasonEnded: "Active Champion",
        category: newChampion.type,
        nationality: newChampion.nationality || null,
        imageUrl: newChampion.imageUrl || null,
      },
    });

    // Log event for new champion crowned
    await logHallEvent(prisma, {
      userId,
      type: "CHAMPION_CHANGED",
      characterId: newChampion.id,
      characterName: newChampion.name,
      metadata: {
        action: "CROWNED",
        votes: newChampion.likes,
        titleNumber: totalReigns + 1,
      },
    });
  } catch (err: any) {
    console.error("Failed to update ChampionshipHistory:", err.message);
  }
}

/**
 * Ensures initial history, events, and champion reigns exist for existing HOF records.
 * Idempotent: runs only if no events or championship records exist for the user.
 */
export async function ensureInitialHallHistory(prisma: any, userId: string, hallOfFameList: any[]) {
  if (!hallOfFameList || hallOfFameList.length === 0) return;

  try {
    const existingEventsCount = await prisma.hallEvent.count({ where: { userId } });
    if (existingEventsCount > 0) return; // Already initialized

    console.log(`[HOF Engine] Initializing historical archive & event engine for user ${userId}...`);

    const sortedByLikes = [...hallOfFameList].sort((a, b) => (b.likes || 0) - (a.likes || 0));

    // 1. Create ADD_CHARACTER events for all entries
    for (let i = 0; i < sortedByLikes.length; i++) {
      const entry = sortedByLikes[i];
      const rank = i + 1;

      await logHallEvent(prisma, {
        userId,
        type: "ADD_CHARACTER",
        characterId: entry.id,
        characterName: entry.name,
        newRank: rank,
        newVotes: entry.likes || 0,
        metadata: {
          type: entry.type,
          status: entry.status,
          nationality: entry.nationality,
          knownForCount: entry.knownFor ? entry.knownFor.length : 0,
          initialSeed: true,
        },
      });
    }

    // 2. Create ChampionshipHistory records for top 3 entries to establish historical seasons
    const topCandidates = sortedByLikes.slice(0, Math.min(3, sortedByLikes.length));
    const now = new Date();

    for (let i = topCandidates.length - 1; i >= 0; i--) {
      const candidate = topCandidates[i];
      const seasonIndex = topCandidates.length - 1 - i; // 2, 1, 0
      const isCurrentChamp = i === 0;

      const startDate = new Date(now.getTime() - (seasonIndex + 1) * 90 * 24 * 60 * 60 * 1000); // 90 days apart
      const endDate = isCurrentChamp ? null : new Date(now.getTime() - seasonIndex * 90 * 24 * 60 * 60 * 1000);
      const durationDays = isCurrentChamp
        ? Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        : 90;

      await prisma.championshipHistory.create({
        data: {
          userId,
          characterId: candidate.id,
          championName: candidate.name,
          startDate,
          endDate,
          durationDays,
          highestVotes: candidate.likes || 0,
          timesDefended: isCurrentChamp ? 3 : 1,
          championshipNumber: seasonIndex + 1,
          reasonEnded: isCurrentChamp ? "Active Champion" : `Reign concluded after ${durationDays} days`,
          category: candidate.type,
          nationality: candidate.nationality || null,
          imageUrl: candidate.imageUrl || null,
        },
      });
    }

    // 3. Capture baseline snapshots
    await captureHallRankingSnapshots(prisma, userId);

    console.log(`[HOF Engine] Historical archive initialization complete for user ${userId}.`);
  } catch (err: any) {
    console.error("Failed to execute ensureInitialHallHistory:", err.message);
  }
}
