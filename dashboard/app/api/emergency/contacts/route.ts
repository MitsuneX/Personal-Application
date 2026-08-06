import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    const isGuest = cookieStore.get("is_guest")?.value === "true";

    const userId = user?.id || (isGuest ? "guest-demo-user-id" : null);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contacts = await prisma.emergencyContact.findMany({
      where: { userId },
      orderBy: [
        { favorite: "desc" },
        { priority: "asc" }, // HIGH < MEDIUM < LOW alphabetically or sorted
        { name: "asc" },
      ],
    });

    return NextResponse.json({ contacts });
  } catch (error: any) {
    console.error("[Emergency Contacts GET Error]:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    const isGuest = cookieStore.get("is_guest")?.value === "true";

    const userId = user?.id || (isGuest ? "guest-demo-user-id" : null);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: "Contact name is required" }, { status: 400 });
    }

    const contact = await prisma.emergencyContact.create({
      data: {
        userId,
        name: body.name.trim(),
        nickname: body.nickname?.trim() || null,
        relationship: body.relationship?.trim() || null,
        company: body.company?.trim() || null,
        category: body.category || "Other",
        phoneNumber: body.phoneNumber?.trim() || null,
        whatsappNumber: body.whatsappNumber?.trim() || null,
        telegramUsername: body.telegramUsername?.trim() || null,
        email: body.email?.trim() || null,
        website: body.website?.trim() || null,
        address: body.address?.trim() || null,
        avatar: body.avatar?.trim() || null,
        notes: body.notes?.trim() || null,
        priority: body.priority || "MEDIUM",
        favorite: Boolean(body.favorite),
        available24Hours: Boolean(body.available24Hours),
        country: body.country?.trim() || null,
        colorLabel: body.colorLabel || null,
        birthday: body.birthday || null,
        reminders: body.reminders || [],
      },
    });

    return NextResponse.json({ success: true, contact });
  } catch (error: any) {
    console.error("[Emergency Contacts POST Error]:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    const isGuest = cookieStore.get("is_guest")?.value === "true";

    const userId = user?.id || (isGuest ? "guest-demo-user-id" : null);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "Contact ID is required" }, { status: 400 });
    }

    // Handle quick interaction tracking ("CALL" | "WHATSAPP" | "EMAIL")
    if (body.actionType) {
      const updated = await prisma.emergencyContact.updateMany({
        where: { id: body.id, userId },
        data: {
          lastContactedAt: new Date(),
          lastContactType: body.actionType,
        },
      });
      return NextResponse.json({ success: true, updated });
    }

    const contact = await prisma.emergencyContact.updateMany({
      where: { id: body.id, userId },
      data: {
        name: body.name?.trim(),
        nickname: body.nickname?.trim() || null,
        relationship: body.relationship?.trim() || null,
        company: body.company?.trim() || null,
        category: body.category,
        phoneNumber: body.phoneNumber?.trim() || null,
        whatsappNumber: body.whatsappNumber?.trim() || null,
        telegramUsername: body.telegramUsername?.trim() || null,
        email: body.email?.trim() || null,
        website: body.website?.trim() || null,
        address: body.address?.trim() || null,
        avatar: body.avatar?.trim() || null,
        notes: body.notes?.trim() || null,
        priority: body.priority,
        favorite: body.favorite !== undefined ? Boolean(body.favorite) : undefined,
        available24Hours: body.available24Hours !== undefined ? Boolean(body.available24Hours) : undefined,
        country: body.country?.trim() || null,
        colorLabel: body.colorLabel || null,
        birthday: body.birthday || null,
        reminders: body.reminders || [],
      },
    });

    return NextResponse.json({ success: true, contact });
  } catch (error: any) {
    console.error("[Emergency Contacts PUT Error]:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    const isGuest = cookieStore.get("is_guest")?.value === "true";

    const userId = user?.id || (isGuest ? "guest-demo-user-id" : null);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Contact ID required" }, { status: 400 });
    }

    await prisma.emergencyContact.deleteMany({
      where: { id, userId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Emergency Contacts DELETE Error]:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
