import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import {
  generateSalt,
  hashCredential,
  generateUnlockSessionToken,
} from "@/lib/security/contentLockCrypto";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { loginPassword, newCredential, newMethod } = await req.json();

    if (!loginPassword) {
      return NextResponse.json({ error: "Login password is required for recovery" }, { status: 400 });
    }

    // Reauthenticate with Supabase securely — we NEVER store or inspect user login password
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: loginPassword,
    });

    if (authError) {
      return NextResponse.json(
        { error: "Account login password verification failed. Please check your credentials." },
        { status: 403 }
      );
    }

    // User is fully authenticated via Supabase!
    // If they provided a new credential to reset:
    if (newCredential && newCredential.trim().length > 0) {
      const salt = generateSalt();
      const credentialHash = hashCredential(newCredential.trim(), salt);
      const method = newMethod === "PASSWORD" ? "PASSWORD" : "PIN";

      await prisma.contentLockSettings.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          enabled: true,
          method,
          credentialHash,
          salt,
          protectedScopes: ["notepad", "characters", "games", "favourites", "misc"],
          failedAttempts: 0,
          lockedUntil: null,
        },
        update: {
          method,
          credentialHash,
          salt,
          failedAttempts: 0,
          lockedUntil: null,
        },
      });
    } else {
      // Just reset lockout state if they only wanted to unlock
      await prisma.contentLockSettings.updateMany({
        where: { userId: user.id },
        data: {
          failedAttempts: 0,
          lockedUntil: null,
        },
      });
    }

    // Issue unlock session token
    const { token, expiresAt } = generateUnlockSessionToken(user.id);
    const response = NextResponse.json({
      success: true,
      message: newCredential ? "Content lock reset and unlocked successfully" : "Account identity verified. Section unlocked.",
      isUnlocked: true,
    });

    response.cookies.set({
      name: "nexus_content_unlock_token",
      value: token,
      expires: new Date(expiresAt),
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (err) {
    console.error("[ContentLock] Recover error:", err);
    return NextResponse.json({ error: "Failed to process recovery" }, { status: 500 });
  }
}
