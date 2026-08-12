import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// 50 MB hard cap — large enough for short MP4 clips, prevents OOM on serverless
const MAX_FILE_BYTES = 50 * 1024 * 1024;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // ── Size guard ────────────────────────────────────────────────────────────
    if (file.size > MAX_FILE_BYTES) {
      const maxMb = MAX_FILE_BYTES / (1024 * 1024);
      const fileMb = (file.size / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        { error: `File too large: ${fileMb} MB. Maximum allowed size is ${maxMb} MB.` },
        { status: 413 }
      );
    }


    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Clean filename and make it unique
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${Date.now()}-${safeName}`;

    // 1. Try Supabase Storage if configured
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { persistSession: false },
        });

        const { error } = await supabase.storage
          .from("uploads")
          .upload(fileName, buffer, {
            contentType: file.type,
          });

        if (!error) {
          const { data: urlData } = supabase.storage
            .from("uploads")
            .getPublicUrl(fileName);
          return NextResponse.json({ success: true, url: urlData.publicUrl });
        }
        console.warn("Supabase upload failed, falling back to local disk storage:", error);
      } catch (sbErr) {
        console.warn("Supabase client error, falling back to local disk storage:", sbErr);
      }
    }

    // 2. Local Disk Storage Fallback (public/uploads/)
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, fileName);
      await fs.promises.writeFile(filePath, buffer);

      const publicUrl = `/uploads/${fileName}`;
      return NextResponse.json({ success: true, url: publicUrl });
    } catch (fsErr: any) {
      console.warn("Local disk write error:", fsErr);

      // 3. In-memory data URL fallback for serverless read-only environments
      const mimeType = file.type || "image/png";
      const base64 = buffer.toString("base64");
      const dataUrl = `data:${mimeType};base64,${base64}`;
      return NextResponse.json({ success: true, url: dataUrl });
    }
  } catch (error: any) {
    console.error("Upload API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

