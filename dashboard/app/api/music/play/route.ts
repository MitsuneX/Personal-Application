import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isGuest = cookieStore.get("is_guest")?.value === "true";
    if (!user && !isGuest) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user?.id || "guest-user";
    const body = await req.json();
    const { songId, songTitle, artist, duration, completed } = body;

    if (!songId || !songTitle) {
      return NextResponse.json({ error: "Missing songId or songTitle" }, { status: 400 });
    }

    // 1. Record MusicPlay entry
    const playRecord = await prisma.musicPlay.create({
      data: {
        userId,
        songId,
        songTitle,
        artist: artist || "Unknown Artist",
        duration: duration ? Math.round(duration) : null,
        completed: Boolean(completed),
      },
    });

    // 2. Increment Song playCount if song exists in DB
    try {
      await prisma.song.updateMany({
        where: { id: songId, userId },
        data: {
          playCount: { increment: 1 },
          lastPlayedAt: new Date(),
        },
      });
    } catch (err) {
      console.warn("[MusicPlay API] Could not update song playCount:", err);
    }

    // 3. Update Listening Streak
    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    let streakInfo = null;

    try {
      const existingStreak = await prisma.musicStreak.findUnique({
        where: { userId },
      });

      if (!existingStreak) {
        streakInfo = await prisma.musicStreak.create({
          data: {
            userId,
            currentStreak: 1,
            bestStreak: 1,
            lastListenDate: todayStr,
            totalDays: 1,
          },
        });
      } else if (existingStreak.lastListenDate !== todayStr) {
        const lastDate = new Date(existingStreak.lastListenDate || 0);
        const todayDate = new Date(todayStr);
        const diffDays = Math.floor(
          (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        let newCurrent = existingStreak.currentStreak;
        if (diffDays === 1) {
          newCurrent += 1;
        } else if (diffDays > 1) {
          newCurrent = 1;
        }

        const newBest = Math.max(newCurrent, existingStreak.bestStreak);

        streakInfo = await prisma.musicStreak.update({
          where: { userId },
          data: {
            currentStreak: newCurrent,
            bestStreak: newBest,
            lastListenDate: todayStr,
            totalDays: { increment: 1 },
          },
        });
      } else {
        streakInfo = existingStreak;
      }
    } catch (streakErr) {
      console.warn("[MusicPlay API] Streak update exception:", streakErr);
    }

    // 4. Record Timeline event
    try {
      await prisma.musicTimeline.create({
        data: {
          userId,
          type: "SONG_PLAYED",
          entityId: songId,
          entityTitle: songTitle,
          metadata: { artist, duration },
        },
      });
    } catch (tlErr) {
      console.warn("[MusicPlay API] Timeline write error:", tlErr);
    }

    // 5. Check & Unlock Achievements
    try {
      const totalPlays = await prisma.musicPlay.count({ where: { userId } });

      const checkUnlock = async (key: string) => {
        try {
          await prisma.musicAchievement.create({
            data: { userId, key },
          });
        } catch {
          // Already unlocked
        }
      };

      if (totalPlays >= 1) await checkUnlock("FIRST_SONG");
      if (totalPlays >= 10) await checkUnlock("TEN_SONGS");
      if (totalPlays >= 50) await checkUnlock("FIFTY_SONGS");
    } catch (achErr) {
      console.warn("[MusicPlay API] Achievement check error:", achErr);
    }

    return NextResponse.json({ success: true, data: playRecord, streak: streakInfo });
  } catch (error: any) {
    console.error("[MusicPlay API Exception]:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
