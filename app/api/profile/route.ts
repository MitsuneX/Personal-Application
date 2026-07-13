import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
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
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("API POST Profile Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
