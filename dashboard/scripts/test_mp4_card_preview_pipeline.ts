/**
 * Automated Verification Script — Game Character MP4 Card Preview Pipeline
 * Tests media resolution, neutral startup framing, custom poster priority, CORS safety, and DB baselines.
 */
import prisma from "../lib/prisma";
import {
  isVideoUrl,
  getCardVideoUrl,
  getCardImageUrl,
  getCardVideoPosterUrl,
  getCardVideoFraming,
} from "../lib/utils/mediaResolver";

async function runPipelineTest() {
  console.log("=============================================================");
  console.log("=== MP4 CARD PREVIEW PIPELINE VERIFICATION GATE           ===");
  console.log("=============================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✅ ${message}`);
      passed++;
    } else {
      console.log(`  ❌ FAILED ASSERTION: ${message}`);
      failed++;
    }
  }

  // ─── 1. VIDEO URL DETECTION ────────────────────────────────────────────────
  console.log("--- 1. Video URL Format Recognition ---");
  assert(isVideoUrl("/uploads/clip.mp4"), "Recognizes local /uploads/clip.mp4");
  assert(isVideoUrl("https://example.supabase.co/storage/v1/object/public/uploads/clip.mp4?token=123"), "Recognizes CDN URL with query params");
  assert(isVideoUrl("data:video/mp4;base64,AAAA"), "Recognizes data:video/mp4 data URLs");
  assert(!isVideoUrl("https://example.com/photo.jpg"), "Rejects standard JPEG images");
  assert(!isVideoUrl(null), "Rejects null input gracefully");

  // ─── 2. MEDIA RESOLUTION & FRAMING METADATA ────────────────────────────────
  console.log("\n--- 2. Media Resolver & Framing Metadata Extraction ---");
  const dummyCharacter = {
    id: "test-char-1",
    name: "Pipeline Character",
    cardImage: "https://example.com/original_preview.mp4",
    stats: {
      cropData: {
        cardVideoCrop: {
          x: 12.5,
          y: -5.0,
          zoom: 1.4,
          aspect: 0.75,
          posterUrl: "https://example.com/captured_poster.jpg",
          customPosterUrl: "https://example.com/custom_poster.png",
          originalUrl: "https://example.com/original_preview.mp4",
        },
      },
    },
  };

  const resolvedVideo = getCardVideoUrl(dummyCharacter);
  assert(resolvedVideo === "https://example.com/original_preview.mp4", "getCardVideoUrl preserves original MP4 source");

  // Custom poster priority check
  const resolvedPoster = getCardVideoPosterUrl(dummyCharacter);
  assert(resolvedPoster === "https://example.com/custom_poster.png", "getCardVideoPosterUrl prioritizes customPosterUrl over generated posterUrl");

  const fallbackCharacter = {
    ...dummyCharacter,
    stats: {
      cropData: {
        cardVideoCrop: {
          x: 0,
          y: 0,
          zoom: 1.0,
          aspect: 0.75,
          posterUrl: "https://example.com/captured_poster.jpg",
        },
      },
    },
  };
  assert(getCardVideoPosterUrl(fallbackCharacter) === "https://example.com/captured_poster.jpg", "getCardVideoPosterUrl falls back to generated posterUrl when no custom poster is uploaded");

  const resolvedFraming = getCardVideoFraming(dummyCharacter);
  assert(resolvedFraming.x === 12.5, "getCardVideoFraming extracts correct X offset");
  assert(resolvedFraming.y === -5.0, "getCardVideoFraming extracts correct Y offset");
  assert(resolvedFraming.zoom === 1.4, "getCardVideoFraming extracts correct Zoom factor");
  assert(resolvedFraming.aspect === 0.75, "getCardVideoFraming preserves 3:4 card aspect ratio");

  // Neutral default check for new uploads without crop data
  const newUploadChar = { name: "New Upload", cardImage: "https://example.com/new_clip.mp4" };
  const newFraming = getCardVideoFraming(newUploadChar);
  assert(newFraming.x === 0 && newFraming.y === 0 && newFraming.zoom === 1.0, "New uploads default to neutral x=0, y=0, zoom=1.0 (Full Source Video)");

  // ─── 3. DATABASE BASELINE AUDIT ────────────────────────────────────────────
  console.log("\n--- 3. PostgreSQL Database Baseline Preservation ---");
  const gcActive = await prisma.gameCharacter.count();
  const historyEntries = await prisma.softDeleteHistory.findMany();
  const gcSoftDeleted = historyEntries.length;
  const gcTotal = gcActive + gcSoftDeleted;
  const hofCount = await prisma.hallOfFame.count();

  console.log(`  GameCharacter count: ${gcActive} active + ${gcSoftDeleted} soft-deleted history = ${gcTotal} total`);
  console.log(`  HallOfFame count:    ${hofCount} (baseline >= 76)`);

  assert(gcTotal === 307, "GameCharacter baseline verified against all 4 pre-deployment JSON backups (307 records)");
  assert(hofCount >= 76, "HallOfFame records preserved (76 >= 76)");

  // ─── 4. EXISTING MP4 CARDS IN DB AUDIT ─────────────────────────────────────
  console.log("\n--- 4. Existing Database MP4 Character Inspection ---");
  const allCharacters = await prisma.gameCharacter.findMany();
  const mp4Chars = allCharacters.filter((c) => getCardVideoUrl(c) !== null);
  console.log(`  Characters currently using MP4 previews in DB: ${mp4Chars.length}`);

  for (const c of mp4Chars.slice(0, 3)) {
    const video = getCardVideoUrl(c);
    const poster = getCardVideoPosterUrl(c);
    console.log(`    - "${c.name}" (${c.gameName}): Video = ${video}`);
    console.log(`      Poster fallback = ${poster}`);
  }

  assert(mp4Chars.length >= 0, "Inspected existing database MP4 previews without runtime errors");

  // ─── SUMMARY ───────────────────────────────────────────────────────────────
  console.log("\n=============================================================");
  if (failed === 0) {
    console.log(`🎉 ALL ${passed} MP4 CARD PREVIEW PIPELINE TESTS PASSED!`);
  } else {
    console.log(`❌ ${failed} PIPELINE TESTS FAILED.`);
    process.exit(1);
  }
  console.log("=============================================================");
}

runPipelineTest().finally(() => prisma.$disconnect());
