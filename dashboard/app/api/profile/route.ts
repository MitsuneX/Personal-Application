import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Retrieve existing profile to track avatar changes
    const existing = await prisma.profile.findUnique({ where: { id: "profile" } });
    if (existing && data.avatar && data.avatar !== existing.avatar && existing.avatar) {
      await prisma.profileHistory.create({
        data: { assetType: "avatar", url: existing.avatar },
      });
    }

    // Clean fields to avoid schema mismatch
    const updated = await prisma.profile.upsert({
      where: { id: "profile" },
      update: {
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
      },
      create: {
        id: "profile",
        name: data.name || "Default User",
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
