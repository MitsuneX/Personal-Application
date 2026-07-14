import { NextResponse } from "next/server";

const TENOR_API_KEY = process.env.TENOR_API_KEY ?? "AIzaSyAyimkuYQYF_FXVALexPQnzfsg0Ws48h"; // public demo key fallback

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "aesthetic";
  const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 50);
  const pos = searchParams.get("pos") ?? "";

  const params = new URLSearchParams({
    key: TENOR_API_KEY,
    q,
    limit: String(limit),
    media_filter: "gif",
    contentfilter: "medium",
    ...(pos ? { pos } : {}),
  });

  try {
    const res = await fetch(`https://tenor.googleapis.com/v2/search?${params}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Tenor API error" }, { status: res.status });
    }

    const data = await res.json();

    // Normalise to a simpler shape: { results: [{id, url, preview, title}], next }
    const results = (data.results ?? []).map((item: any) => {
      const gif = item.media_formats?.gif ?? item.media_formats?.tinygif ?? {};
      const preview = item.media_formats?.tinygif ?? item.media_formats?.nanogif ?? {};
      return {
        id: item.id,
        title: item.title,
        url: gif.url ?? "",
        previewUrl: preview.url ?? gif.url ?? "",
        dims: gif.dims ?? [0, 0],
      };
    });

    return NextResponse.json({ results, next: data.next ?? "" });
  } catch (err) {
    console.error("[Tenor] Search error:", err);
    return NextResponse.json({ error: "Failed to fetch GIFs" }, { status: 500 });
  }
}
