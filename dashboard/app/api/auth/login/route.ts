import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || typeof identifier !== "string" || !identifier.trim()) {
      return NextResponse.json({ error: "Email or username is required." }, { status: 400 });
    }

    if (!password || typeof password !== "string" || !password.trim()) {
      return NextResponse.json({ error: "Password is required." }, { status: 400 });
    }

    const rawInput = identifier.trim().toLowerCase();
    const isEmailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawInput);

    let targetEmail = rawInput;

    if (!isEmailFormat) {
      // Look up account by username
      const userAccount = await prisma.userAccount.findFirst({
        where: {
          OR: [
            { username: { equals: rawInput, mode: "insensitive" } },
            { email: { startsWith: `${rawInput}@`, mode: "insensitive" } },
          ],
        },
      });

      if (!userAccount) {
        return NextResponse.json(
          { error: "Invalid credentials. Check your identifier & password." },
          { status: 401 }
        );
      }

      targetEmail = userAccount.email;
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: targetEmail,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: "Invalid credentials. Check your identifier & password." },
        { status: 401 }
      );
    }

    // Ensure Prisma UserAccount record exists and matches
    await prisma.userAccount.upsert({
      where: { userId: data.user.id },
      create: {
        userId: data.user.id,
        email: data.user.email || targetEmail,
        username: (data.user.user_metadata?.username as string) || targetEmail.split("@")[0],
      },
      update: {
        email: data.user.email || targetEmail,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Access granted.",
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });
  } catch (err: any) {
    console.error("Auth login handler error:", err);
    return NextResponse.json({ error: "An unexpected error occurred during authentication." }, { status: 500 });
  }
}
