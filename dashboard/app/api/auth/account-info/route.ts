import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user.email || "";

    let userAccount = await prisma.userAccount.findUnique({
      where: { userId: user.id },
    });

    if (!userAccount && email) {
      const username = (user.user_metadata?.username as string) || email.split("@")[0];
      userAccount = await prisma.userAccount.create({
        data: {
          userId: user.id,
          email: email.toLowerCase(),
          username: username.toLowerCase(),
        },
      });
    }

    const pendingRelink = await prisma.pendingEmailRelink.findUnique({
      where: { userId: user.id },
    });

    const isPendingValid = pendingRelink && new Date(pendingRelink.expiresAt) > new Date();

    return NextResponse.json({
      userId: user.id,
      email: userAccount?.email || email,
      username: userAccount?.username || email.split("@")[0],
      pendingRelink: isPendingValid
        ? {
            newEmail: pendingRelink.newEmail,
            expiresAt: pendingRelink.expiresAt,
          }
        : null,
    });
  } catch (err: any) {
    console.error("Fetch account info error:", err);
    return NextResponse.json({ error: "Failed to fetch account info." }, { status: 500 });
  }
}
