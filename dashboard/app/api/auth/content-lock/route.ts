import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import {
  generateSalt,
  hashCredential,
  verifyCredential,
  generateUnlockSessionToken,
  validateUnlockSessionToken,
} from "@/lib/security/contentLockCrypto";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    const isGuestCookie = cookieStore.get("is_guest")?.value === "true";

    if (!user) {
      if (isGuestCookie) {
        try {
          const guestLockRaw = cookieStore.get("nexus_guest_lock")?.value;
          if (guestLockRaw) {
            const parsed = JSON.parse(decodeURIComponent(guestLockRaw));
            if (parsed.enabled) {
              const unlockToken = cookieStore.get("nexus_content_unlock_token")?.value;
              const isUnlocked = unlockToken ? validateUnlockSessionToken(unlockToken, "guest-user") : false;
              return NextResponse.json({
                enabled: true,
                method: parsed.method || "PIN",
                protectedScopes: parsed.protectedScopes || [],
                hasHint: Boolean(parsed.hint),
                hint: parsed.hint || null,
                isUnlocked,
              });
            }
          }
        } catch {}
      }
      return NextResponse.json({
        enabled: false,
        method: "PIN",
        protectedScopes: [],
        hasHint: false,
        isUnlocked: true,
      });
    }

    const settings = await prisma.contentLockSettings.findUnique({
      where: { userId: user.id },
    });

    if (!settings || !settings.enabled) {
      return NextResponse.json({
        enabled: false,
        method: "PIN",
        protectedScopes: [],
        hasHint: false,
        isUnlocked: true,
      });
    }

    const unlockToken = cookieStore.get("nexus_content_unlock_token")?.value;
    const isUnlocked = unlockToken ? validateUnlockSessionToken(unlockToken, user.id) : false;

    return NextResponse.json({
      enabled: settings.enabled,
      method: settings.method,
      protectedScopes: settings.protectedScopes,
      hasHint: Boolean(settings.hint && settings.hint.trim().length > 0),
      hint: settings.hint || null,
      isUnlocked,
    });
  } catch (err) {
    console.error("[ContentLock] GET error:", err);
    return NextResponse.json({ error: "Failed to retrieve lock status" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    const isGuestCookie = cookieStore.get("is_guest")?.value === "true";

    const body = await req.json();
    const {
      enabled,
      method,
      credential,
      currentCredential,
      loginPassword,
      hint,
      protectedScopes,
    } = body;

    // ── GUEST MODE HANDLING ──────────────────────────────────────────────────
    if (!user) {
      if (isGuestCookie) {
        let guestExisting: any = null;
        try {
          const raw = cookieStore.get("nexus_guest_lock")?.value;
          if (raw) guestExisting = JSON.parse(decodeURIComponent(raw));
        } catch {}

        if (guestExisting && guestExisting.enabled) {
          let isVerified = false;
          if (currentCredential && guestExisting.salt && guestExisting.credentialHash) {
            isVerified = verifyCredential(currentCredential, guestExisting.salt, guestExisting.credentialHash);
          }
          if (!isVerified) {
            return NextResponse.json(
              { error: "Invalid current credential. Verification required." },
              { status: 403 }
            );
          }
        }

        let credentialHash = guestExisting?.credentialHash;
        let salt = guestExisting?.salt;

        if (credential && credential.trim().length > 0) {
          salt = generateSalt();
          credentialHash = hashCredential(credential.trim(), salt);
        }

        if (enabled && !credentialHash) {
          return NextResponse.json(
            { error: "A PIN or Password must be provided to enable Content Lock." },
            { status: 400 }
          );
        }

        const guestData = {
          enabled: Boolean(enabled),
          method: method === "PASSWORD" ? "PASSWORD" : "PIN",
          credentialHash: credentialHash || null,
          salt: salt || null,
          hint: hint ? hint.trim() : null,
          protectedScopes: Array.isArray(protectedScopes) ? protectedScopes : [],
        };

        const { token, expiresAt } = generateUnlockSessionToken("guest-user");
        const lockObj = {
          enabled: guestData.enabled,
          method: guestData.method,
          protectedScopes: guestData.protectedScopes,
          hasHint: Boolean(guestData.hint && guestData.hint.trim().length > 0),
          hint: guestData.hint,
          isUnlocked: true,
        };

        const response = NextResponse.json({
          success: true,
          contentLock: lockObj,
          data: lockObj,
        });

        response.cookies.set({
          name: "nexus_guest_lock",
          value: encodeURIComponent(JSON.stringify(guestData)),
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          maxAge: 30 * 24 * 60 * 60,
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

    const existing = await prisma.contentLockSettings.findUnique({
      where: { userId: user.id },
    });

    // If already enabled, changing configuration or disabling requires authorization
    if (existing && existing.enabled) {
      let isVerified = false;

      // 1. Try current content-lock credential
      if (currentCredential && existing.salt && existing.credentialHash) {
        isVerified = verifyCredential(currentCredential, existing.salt, existing.credentialHash);
      }

      // 2. Try Supabase login password recovery
      if (!isVerified && loginPassword && user.email) {
        const { error } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: loginPassword,
        });
        if (!error) {
          isVerified = true;
        }
      }

      if (!isVerified) {
        return NextResponse.json(
          { error: "Invalid current credential or login password. Verification required." },
          { status: 403 }
        );
      }
    }

    // Prepare updated data
    let credentialHash = existing?.credentialHash;
    let salt = existing?.salt;

    if (credential && credential.trim().length > 0) {
      salt = generateSalt();
      credentialHash = hashCredential(credential.trim(), salt);
    }

    if (enabled && !credentialHash) {
      return NextResponse.json(
        { error: "A PIN or Password must be provided to enable Content Lock." },
        { status: 400 }
      );
    }

    const updated = await prisma.contentLockSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        enabled: Boolean(enabled),
        method: method === "PASSWORD" ? "PASSWORD" : "PIN",
        credentialHash: credentialHash || null,
        salt: salt || null,
        hint: hint ? hint.trim() : null,
        protectedScopes: Array.isArray(protectedScopes) ? protectedScopes : [],
        failedAttempts: 0,
        lockedUntil: null,
      },
      update: {
        enabled: Boolean(enabled),
        method: method === "PASSWORD" ? "PASSWORD" : "PIN",
        ...(credential && { credentialHash, salt }),
        hint: hint !== undefined ? (hint ? hint.trim() : null) : existing?.hint,
        protectedScopes: Array.isArray(protectedScopes) ? protectedScopes : existing?.protectedScopes || [],
        failedAttempts: 0,
        lockedUntil: null,
      },
    });

    // Auto-unlock session for the user configuring the lock
    const { token, expiresAt } = generateUnlockSessionToken(user.id);
    const lockObj = {
      enabled: updated.enabled,
      method: updated.method,
      protectedScopes: updated.protectedScopes,
      hasHint: Boolean(updated.hint && updated.hint.trim().length > 0),
      hint: updated.hint,
      isUnlocked: true,
    };
    const response = NextResponse.json({
      success: true,
      contentLock: lockObj,
      data: lockObj,
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
    console.error("[ContentLock] POST error:", err);
    return NextResponse.json({ error: "Failed to update content lock configuration" }, { status: 500 });
  }
}
