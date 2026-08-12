import { isVideoUrl, getCardVideoUrl, getCardImageUrl } from "../lib/utils/mediaResolver";
import { exportGameCharacterToJson, deepMergeGameCharacter } from "../lib/data/gameCharacterSchema";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log("=== Testing MP4 Card Preview Pipeline Logic ===");

// 1. Test isVideoUrl with various formats including Supabase CDN URLs
const localVideo = "/uploads/1786123456-test_clip.mp4";
const supabaseVideoWithQuery = "https://fvrlfvjgizzxqasjubrh.supabase.co/storage/v1/object/public/uploads/1786123456-test_clip.mp4?token=eyJhbGciOiJIUzI1Ni";
const dataUrlVideo = "data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDE=";
const webmVideo = "/uploads/clip.webm";
const movVideoWithHash = "https://example.com/video.mov#t=0.5";
const imagePng = "/uploads/photo.png";
const supabaseImageWithQuery = "https://fvrlfvjgizzxqasjubrh.supabase.co/storage/v1/object/public/uploads/avatar.png?v=2";

assert(isVideoUrl(localVideo), "Local .mp4 detected as video");
assert(isVideoUrl(supabaseVideoWithQuery), "Supabase CDN .mp4 with query string detected as video");
assert(isVideoUrl(dataUrlVideo), "data:video/mp4 URL detected as video");
assert(isVideoUrl(webmVideo), "WebM file detected as video");
assert(isVideoUrl(movVideoWithHash), "MOV file with URL fragment detected as video");

assert(!isVideoUrl(imagePng), "Local .png is NOT detected as video");
assert(!isVideoUrl(supabaseImageWithQuery), "Supabase CDN .png with query string is NOT detected as video");
assert(!isVideoUrl(null), "null is NOT video");
assert(!isVideoUrl(""), "empty string is NOT video");

// 2. Test getCardVideoUrl & getCardImageUrl for GameCharacter
const gameCharWithVideo = {
  id: "gc-1",
  name: "Acheron",
  cardImage: supabaseVideoWithQuery,
  splashArt: "https://example.com/acheron_splash.png",
};

assert(getCardVideoUrl(gameCharWithVideo) === supabaseVideoWithQuery, "GameCharacter getCardVideoUrl resolves Supabase MP4 cardImage");
assert(getCardImageUrl(gameCharWithVideo) === "https://example.com/acheron_splash.png", "GameCharacter getCardImageUrl falls back to splashArt when cardImage is MP4");

// 3. Test getCardVideoUrl & getCardImageUrl for HallOfFame / Character Dictionary
const hofEntryWithVideo = {
  id: "hof-1",
  name: "Scarlet",
  imageUrl: "https://example.com/scarlet_static.png",
  details: {
    cardVideo: supabaseVideoWithQuery,
  },
};

assert(getCardVideoUrl(hofEntryWithVideo) === supabaseVideoWithQuery, "HallOfFame getCardVideoUrl resolves details.cardVideo");
assert(getCardImageUrl(hofEntryWithVideo) === "https://example.com/scarlet_static.png", "HallOfFame getCardImageUrl resolves static imageUrl while cardVideo is active");

// 4. Test JSON export media stripping
const exportedJson = exportGameCharacterToJson(gameCharWithVideo as any);
assert(exportedJson.cardImage === undefined, "JSON export strips cardImage MP4 URL");
assert(exportedJson.cardVideo === undefined, "JSON export strips cardVideo field");

// 5. Test JSON import preservation (deepMergeGameCharacter)
const incomingJsonNoMedia = {
  id: "gc-1",
  name: "Acheron Updated Name",
  tier: "SS",
};

const mergedResult = deepMergeGameCharacter(gameCharWithVideo as any, incomingJsonNoMedia as any);
assert(mergedResult.cardImage === supabaseVideoWithQuery, "JSON import / deep merge preserves existing MP4 video URL when JSON has no media");
assert(mergedResult.name === "Acheron Updated Name", "JSON import updates non-media character fields");

console.log("\n🎉 ALL MP4 PIPELINE TESTS PASSED SUCCESSFULLY!");
