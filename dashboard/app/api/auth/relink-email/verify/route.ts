import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { otpCode } = body;

    if (!otpCode || typeof otpCode !== "string" || !otpCode.trim()) {
      return NextResponse.json({ error: "Verification code is required." }, { status: 400 });
    }

    const pendingRelink = await prisma.pendingEmailRelink.findUnique({
      where: { userId: user.id },
    });

    if (!pendingRelink) {
      return NextResponse.json({ error: "No pending email relink request found." }, { status: 404 });
    }

    if (new Date(pendingRelink.expiresAt) < new Date()) {
      await prisma.pendingEmailRelink.delete({ where: { userId: user.id } });
      return NextResponse.json({ error: "Verification code has expired. Please request a new code." }, { status: 410 });
    }

    if (pendingRelink.otpCode !== otpCode.trim()) {
      return NextResponse.json({ error: "Incorrect verification code. Please check and try again." }, { status: 400 });
    }

    const newEmail = pendingRelink.newEmail.toLowerCase();

    // 1. Update Supabase Auth user email via Service Role Admin API if available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceRoleKey) {
      const adminClient = createAdminClient(supabaseUrl, serviceRoleKey);
      const { error: updateError } = await adminClient.auth.admin.updateUserById(user.id, {
        email: newEmail,
        email_confirm: true,
      });

      if (updateError) {
        console.error("Failed to update email in Supabase Auth admin:", updateError);
      }
    } else {
      // Fallback: update via session client
      await supabase.auth.updateUser({ email: newEmail });
    }

    // 2. Update Prisma UserAccount record
    await prisma.userAccount.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        email: newEmail,
        username: (user.user_metadata?.username as string) || newEmail.split("@")[0],
      },
      update: {
        email: newEmail,
      },
    });

    // 3. Clean up pending relink record
    await prisma.pendingEmailRelink.delete({ where: { userId: user.id } });

    return NextResponse.json({
      success: true,
      message: `Account email successfully relinked to ${newEmail}.`,
      newEmail,
    });
  } catch (err: any) {
    console.error("Relink email verify error:", err);
    return NextResponse.json({ error: "Failed to verify email relink code." }, { status: 500 });
  }
}
