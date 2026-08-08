import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { newEmail, currentPassword } = body;

    if (!newEmail || typeof newEmail !== "string" || !newEmail.trim()) {
      return NextResponse.json({ error: "New email address is required." }, { status: 400 });
    }

    if (!currentPassword || typeof currentPassword !== "string" || !currentPassword.trim()) {
      return NextResponse.json({ error: "Current password reauthentication is required." }, { status: 400 });
    }

    const formattedNewEmail = newEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formattedNewEmail)) {
      return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
    }

    const currentEmail = (user.email || "").toLowerCase();
    if (formattedNewEmail === currentEmail) {
      return NextResponse.json({ error: "New email address cannot be the same as your current email." }, { status: 400 });
    }

    // Security Reauthentication: Verify current password
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: currentEmail,
      password: currentPassword,
    });

    if (authError) {
      return NextResponse.json({ error: "Incorrect password. Reauthentication failed." }, { status: 401 });
    }

    // Check if new email already belongs to another user
    const existingAccount = await prisma.userAccount.findUnique({
      where: { email: formattedNewEmail },
    });

    if (existingAccount && existingAccount.userId !== user.id) {
      return NextResponse.json({ error: "This email address is already associated with another account." }, { status: 409 });
    }

    // Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prisma.pendingEmailRelink.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        newEmail: formattedNewEmail,
        otpCode,
        expiresAt,
      },
      update: {
        newEmail: formattedNewEmail,
        otpCode,
        expiresAt,
      },
    });

    console.log(`[Email Relink] OTP Code for ${user.id} -> ${formattedNewEmail}: ${otpCode}`);

    return NextResponse.json({
      success: true,
      message: `Verification code dispatched to ${formattedNewEmail}.`,
      newEmail: formattedNewEmail,
      expiresAt,
      devOtpCode: process.env.NODE_ENV === "development" ? otpCode : undefined,
    });
  } catch (err: any) {
    console.error("Relink email request error:", err);
    return NextResponse.json({ error: "Failed to process email relink request." }, { status: 500 });
  }
}
