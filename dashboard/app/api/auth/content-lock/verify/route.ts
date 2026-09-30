import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import {
  verifyCredential,
  generateUnlockSessionToken,
} from "@/lib/security/contentLockCrypto";

const MAX_FAILED_ATTEMPTS = 5;
const COOLDOWN_MINUTES = 5;

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    const isGuestCookie = cookieStore.get("is_guest")?.value === "true";

    const { credential } = await req.json();

    if (!credential) {
      return NextResponse.json({ error: "Credential is required" }, { status: 400 });
    }

    if (!user) {
      if (isGuestCookie) {
        let guestData: any = null;
        try {
          const raw = cookieStore.get("nexus_guest_lock")?.value;
          if (raw) guestData = JSON.parse(decodeURIComponent(raw));
        } catch {}

        if (!guestData || !guestData.enabled) {
          return NextResponse.json({ success: true, message: "Content lock is not enabled" });
        }

        if (!guestData.salt || !guestData.credentialHash) {
          return NextResponse.json({ error: "Content lock credential not initialized" }, { status: 500 });
        }

        const isValid = verifyCredential(credential, guestData.salt, guestData.credentialHash);
        if (!isValid) {
          return NextResponse.json(
            { error: `Incorrect ${guestData.method === "PASSWORD" ? "Password" : "PIN"}.` },
            { status: 403 }
          );
        }

        const { token, expiresAt } = generateUnlockSessionToken("guest-user");
        const response = NextResponse.json({
          success: true,
          message: "Content unlocked successfully",
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
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.contentLockSettings.findUnique({
      where: { userId: user.id },
    });

    if (!settings || !settings.enabled) {
      return NextResponse.json({ success: true, message: "Content lock is not enabled" });
    }

    const now = new Date();

    // Check brute-force lockout cooldown
    if (settings.lockedUntil && settings.lockedUntil > now) {
      const remainingSec = Math.ceil((settings.lockedUntil.getTime() - now.getTime()) / 1000);
      return NextResponse.json(
        {
          error: `Too many failed attempts. Security cooldown active for ${remainingSec} seconds.`,
          lockedUntil: settings.lockedUntil.toISOString(),
          remainingSeconds: remainingSec,
        },
        { status: 429 }
      );
    }

    if (!settings.salt || !settings.credentialHash) {
      return NextResponse.json({ error: "Content lock credential not initialized" }, { status: 500 });
    }

    const isValid = verifyCredential(credential, settings.salt, settings.credentialHash);

    if (!isValid) {
      const nextFailures = (settings.failedAttempts || 0) + 1;
      let lockedUntil: Date | null = null;

      if (nextFailures >= MAX_FAILED_ATTEMPTS) {
        lockedUntil = new Date(Date.now() + COOLDOWN_MINUTES * 60 * 1000);
      }

      await prisma.contentLockSettings.update({
        where: { userId: user.id },
        data: {
          failedAttempts: nextFailures,
          lockedUntil,
        },
      });

      if (lockedUntil) {
        return NextResponse.json(
          {
            error: `Maximum verification attempts exceeded. Locked out for ${COOLDOWN_MINUTES} minutes.`,
            lockedUntil: lockedUntil.toISOString(),
            remainingSeconds: COOLDOWN_MINUTES * 60,
          },
          { status: 429 }
        );
      }

      const remainingAttempts = MAX_FAILED_ATTEMPTS - nextFailures;
      return NextResponse.json(
        {
          error: `Incorrect ${settings.method === "PASSWORD" ? "Password" : "PIN"}. ${remainingAttempts} attempts remaining before temporary lockout.`,
          remainingAttempts,
        },
        { status: 403 }
      );
    }

    // Reset failed attempts on success
    await prisma.contentLockSettings.update({
      where: { userId: user.id },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
      },
    });

    const { token, expiresAt } = generateUnlockSessionToken(user.id);
    const response = NextResponse.json({
      success: true,
      message: "Content unlocked successfully",
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
    console.error("[ContentLock] Verify error:", err);
    return NextResponse.json({ error: "Failed to verify credential" }, { status: 500 });
  }
}
