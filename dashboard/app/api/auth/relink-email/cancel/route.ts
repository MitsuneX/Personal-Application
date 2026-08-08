import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.pendingEmailRelink.deleteMany({
      where: { userId: user.id },
    });

    return NextResponse.json({
      success: true,
      message: "Pending email relink request cancelled.",
    });
  } catch (err: any) {
    console.error("Cancel pending relink error:", err);
    return NextResponse.json({ error: "Failed to cancel pending relink request." }, { status: 500 });
  }
}
