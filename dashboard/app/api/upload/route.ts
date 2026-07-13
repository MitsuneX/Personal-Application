import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Clean filename
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${Date.now()}-${safeName}`;
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);
    const url = `/uploads/${fileName}`;

    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    console.error("Upload API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
