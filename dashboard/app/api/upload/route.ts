import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Supabase storage is not configured (missing env keys)." },
        { status: 500 }
      );
    }

    // Initialize Supabase Client with Service Role Key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
      },
    });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Clean filename and make it unique
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${Date.now()}-${safeName}`;

    // Upload buffer to Supabase Storage 'uploads' bucket
    const { error } = await supabase.storage
      .from("uploads")
      .upload(fileName, buffer, {
        contentType: file.type,
      });

    if (error) {
      console.error("Supabase Storage upload error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Retrieve public URL
    const { data: urlData } = supabase.storage
      .from("uploads")
      .getPublicUrl(fileName);

    return NextResponse.json({ success: true, url: urlData.publicUrl });
  } catch (error: any) {
    console.error("Upload API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
