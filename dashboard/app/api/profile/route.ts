import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    const userId = user?.id || null;
    let profileId = "profile";
    if (user?.id) {
      const userProf = await prisma.profile.findFirst({
        where: { OR: [{ id: user.id }, { userId: user.id }] },
      });
      if (userProf) {
        profileId = userProf.id;
      } else {
        profileId = user.id;
      }
    }

    // Retrieve existing profile to track avatar changes
    const existing = await prisma.profile.findUnique({ where: { id: profileId } });
    if (existing && data.avatar && data.avatar !== existing.avatar && existing.avatar) {
      await prisma.profileHistory.create({
        data: { userId: userId || undefined, assetType: "avatar", url: existing.avatar },
      });
    }

    // Clean fields to avoid schema mismatch
    const updated = await prisma.profile.upsert({
      where: { id: profileId },
      update: {
        ...(userId && { userId }),
        name: data.name,
        tagline: data.tagline,
        bio: data.bio,
        status: data.status,
        location: data.location,
        skills: data.skills,
        socials: data.socials,
        avatar: data.avatar,
        borderStyle: data.borderStyle,
        phoneNumber: data.phoneNumber,
        mbti: data.mbti,
        zodiac: data.zodiac,
        dashboardName: data.dashboardName ?? null,
        landingMode: data.landingMode ?? "enabled",
        heroStyle: data.heroStyle ?? "cinematic",
        showPublicStats: Boolean(data.showPublicStats),
        showAboutSection: Boolean(data.showAboutSection),
        showSocialLinks: Boolean(data.showSocialLinks),
        aboutWorldText: data.aboutWorldText ?? "",
        landingBgStyle: data.landingBgStyle ?? "matrix",
        landingAccentColor: data.landingAccentColor ?? "#00F5FF",
        visibleFeatures: Array.isArray(data.visibleFeatures) ? data.visibleFeatures : ["game-database", "game-characters", "hall-of-fame", "music", "media", "ai-library", "hobbies", "emergency"],
      },
      create: {
        id: profileId,
        ...(userId && { userId }),
        name: data.name || user?.email?.split("@")[0] || "Default User",
        tagline: data.tagline || "",
        bio: data.bio || "",
        status: data.status || "online",
        location: data.location || "",
        skills: data.skills || [],
        socials: data.socials || [],
        avatar: data.avatar || "/avatar.png",
        borderStyle: data.borderStyle || "default",
        phoneNumber: data.phoneNumber || "",
        mbti: data.mbti || "",
        zodiac: data.zodiac || "",
        dashboardName: data.dashboardName ?? null,
        landingMode: data.landingMode ?? "enabled",
        heroStyle: data.heroStyle ?? "cinematic",
        showPublicStats: Boolean(data.showPublicStats),
        showAboutSection: Boolean(data.showAboutSection),
        showSocialLinks: Boolean(data.showSocialLinks),
        aboutWorldText: data.aboutWorldText ?? "",
        landingBgStyle: data.landingBgStyle ?? "matrix",
        landingAccentColor: data.landingAccentColor ?? "#00F5FF",
        visibleFeatures: Array.isArray(data.visibleFeatures) ? data.visibleFeatures : ["game-database", "game-characters", "hall-of-fame", "music", "media", "ai-library", "hobbies", "emergency"],
      },
    });

    // Retrieve updated profile history
    const history = await prisma.profileHistory.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      history,
    });
  } catch (error: any) {
    console.error("API POST Profile Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
