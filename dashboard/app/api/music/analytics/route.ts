import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isGuest = cookieStore.get("is_guest")?.value === "true";
    const userId = user?.id || "guest-user";

    if (!user && !isGuest) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      totalSongs,
      totalPlaylists,
      totalCollections,
      allPlays,
      streak,
      achievements,
      recentPlays,
    ] = await Promise.all([
      prisma.song.count({ where: { userId } }),
      prisma.playlist.count({ where: { userId } }),
      prisma.musicCollection.count({ where: { userId } }),
      prisma.musicPlay.findMany({
        where: { userId },
        select: { duration: true, artist: true, playedAt: true },
      }),
      prisma.musicStreak.findUnique({ where: { userId } }),
      prisma.musicAchievement.findMany({ where: { userId } }),
      prisma.musicPlay.findMany({
        where: { userId },
        orderBy: { playedAt: "desc" },
        take: 10,
      }),
    ]);

    // Calculate listening hours
    const totalSeconds = allPlays.reduce((acc, p) => acc + (p.duration || 210), 0);
    const listeningHoursTotal = Number((totalSeconds / 3600).toFixed(1));

    // Calculate current month listening hours
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthSeconds = allPlays
      .filter((p) => new Date(p.playedAt) >= firstDayOfMonth)
      .reduce((acc, p) => acc + (p.duration || 210), 0);
    const listeningHoursMonth = Number((monthSeconds / 3600).toFixed(1));

    // Calculate top artists
    const artistCounts: Record<string, number> = {};
    allPlays.forEach((p) => {
      if (p.artist && p.artist !== "Unknown Artist") {
        artistCounts[p.artist] = (artistCounts[p.artist] || 0) + 1;
      }
    });

    const topArtists = Object.entries(artistCounts)
      .map(([artist, count]) => ({ artist, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate avg session minutes
    const avgSessionMinutes = allPlays.length > 0 ? Number(((totalSeconds / allPlays.length) / 60).toFixed(1)) : 0;

    return NextResponse.json({
      totalSongs,
      totalPlaylists,
      totalCollections,
      listeningHoursTotal,
      listeningHoursMonth,
      avgSessionMinutes,
      songsPlayedTotal: allPlays.length,
      topArtists,
      streak: streak || { currentStreak: 0, bestStreak: 0, totalDays: 0 },
      achievements,
      recentPlays,
    });
  } catch (error: any) {
    console.error("[MusicAnalytics API Exception]:", error);
    return NextResponse.json({ error: error.message || "Analytics calculation failed" }, { status: 500 });
  }
}
