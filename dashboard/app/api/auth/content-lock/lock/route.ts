import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Content locked successfully",
    isUnlocked: false,
  });

  response.cookies.set({
    name: "nexus_content_unlock_token",
    value: "",
    expires: new Date(0),
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });

  return response;
}
