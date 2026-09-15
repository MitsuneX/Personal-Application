/**
 * Automated Verification Script — Crop + Rotate Persistence & Transformation Lifecycle
 * Tests CSS transform matrix calculations, Canvas 2D rotation geometry,
 * GameCharacter and HallOfFame DB round-trip persistence of rotation metadata,
 * and verifies that original video sources remain 100% preserved and intact.
 */
import "dotenv/config";
import prisma from "../lib/prisma";
import {
  getCardVideoUrl,
  getCardVideoPosterUrl,
  getCardVideoFraming,
  getVideoFramingStyle,
  VIDEO_FRAMING_MEDIA_CLASS,
  VideoFraming,
} from "../lib/utils/mediaResolver";

async function runLifecycleTests() {
  console.log("=============================================================");
  console.log("=== CROP + ROTATE LIFECYCLE & PERSISTENCE VERIFICATION     ===");
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

  // ─── 1. MATHEMATICAL GEOMETRY & CSS MATRIX VERIFICATION ───────────────────
  console.log("--- 1. Mathematical Matrix & Angle Calculations ---");

  const angles = [0, 45, 90, 180, 270, 359];
  for (const deg of angles) {
    const framing: VideoFraming = { x: 5, y: -10, zoom: 1.5, rotation: deg, aspect: 0.75 };
    const style = getVideoFramingStyle(framing);
    assert(
      style.transform === `translate(5%, -10%) rotate(${deg}deg) scale(1.5)`,
      `Transform calculation for ${deg}° matches CSS specification: ${style.transform}`
    );
    assert(style.transformOrigin === "center center", `Transform-origin is center center for ${deg}°`);
  }

  // Normalization boundary tests
  assert(
    getVideoFramingStyle({ x: 0, y: 0, zoom: 1, rotation: -90 }).transform === "translate(0%, 0%) rotate(270deg) scale(1)",
    "Normalizes -90 deg to 270 deg in transform string"
  );
  assert(
    getVideoFramingStyle({ x: 0, y: 0, zoom: 1, rotation: 450 }).transform === "translate(0%, 0%) rotate(90deg) scale(1)",
    "Normalizes 450 deg to 90 deg in transform string"
  );
  assert(
    getVideoFramingStyle({ x: 0, y: 0, zoom: 1, rotation: NaN as any }).transform === "translate(0%, 0%) rotate(0deg) scale(1)",
    "Gracefully handles NaN rotation by falling back to 0 deg"
  );
  assert(
    getVideoFramingStyle(undefined).transform === "translate(0%, 0%) rotate(0deg) scale(1)",
    "Undefined framing returns neutral transform 'translate(0%, 0%) rotate(0deg) scale(1)'"
  );

  // ─── 2. GAME CHARACTER DB PERSISTENCE & RESTORATION ROUND-TRIP ────────────
  console.log("\n--- 2. Game Character DB Persistence & Exact Restoration ---");

  const testGameCharId = `test-gc-rot-${Date.now()}`;
  const originalVideoSource = "https://example.com/character_showcase.mp4";
  const customPosterSource = "https://example.com/custom_artwork_poster.png";

  try {
    // A. Create record with framing metadata
    await prisma.gameCharacter.create({
      data: {
        id: testGameCharId,
        name: "Test Rotation Agent",
        gameName: "Wuthering Waves",
        cardImage: originalVideoSource,
        stats: {
          cropData: {
            cardImageCrop: {
              x: 15.5,
              y: -8.0,
              zoom: 1.45,
              rotation: 90,
              aspect: 0.75,
              customPosterUrl: customPosterSource,
              originalUrl: originalVideoSource,
            },
            cardVideoCrop: {
              x: 15.5,
              y: -8.0,
              zoom: 1.45,
              rotation: 90,
              aspect: 0.75,
              customPosterUrl: customPosterSource,
              originalUrl: originalVideoSource,
            },
            videoFraming: {
              x: 15.5,
              y: -8.0,
              zoom: 1.45,
              rotation: 90,
              aspect: 0.75,
            },
          },
          cardVideoCrop: {
            x: 15.5,
            y: -8.0,
            zoom: 1.45,
            rotation: 90,
            aspect: 0.75,
          },
          videoFraming: {
            x: 15.5,
            y: -8.0,
            zoom: 1.45,
            rotation: 90,
            aspect: 0.75,
          },
        },
      },
    });

    // B. Fetch record back from PostgreSQL
    const fetchedGC = await prisma.gameCharacter.findUnique({
      where: { id: testGameCharId },
    });

    assert(Boolean(fetchedGC), "Game Character saved and retrieved from PostgreSQL");
    assert(getCardVideoUrl(fetchedGC) === originalVideoSource, "Source MP4 URL remains 100% intact and preserved");
    assert(getCardVideoPosterUrl(fetchedGC) === customPosterSource, "Custom poster URL retrieved with highest priority");

    const restoredGCFraming = getCardVideoFraming(fetchedGC);
    assert(restoredGCFraming.rotation === 90, `Restored rotation angle matches exactly (expected 90, got ${restoredGCFraming.rotation})`);
    assert(restoredGCFraming.x === 15.5, `Restored X offset matches exactly (expected 15.5, got ${restoredGCFraming.x})`);
    assert(restoredGCFraming.y === -8.0, `Restored Y offset matches exactly (expected -8.0, got ${restoredGCFraming.y})`);
    assert(restoredGCFraming.zoom === 1.45, `Restored zoom factor matches exactly (expected 1.45, got ${restoredGCFraming.zoom})`);

    const gcStyle = getVideoFramingStyle(restoredGCFraming);
    assert(
      gcStyle.transform === "translate(15.5%, -8%) rotate(90deg) scale(1.45)",
      `Restored framing translates to exact CSS transform: ${gcStyle.transform}`
    );

    // C. Test Edit / Update cycle with a different angle (270 degrees)
    await prisma.gameCharacter.update({
      where: { id: testGameCharId },
      data: {
        stats: {
          ...(fetchedGC?.stats as any),
          cropData: {
            ...((fetchedGC?.stats as any)?.cropData || {}),
            cardVideoCrop: {
              x: 0,
              y: 5.5,
              zoom: 1.6,
              rotation: 270,
              aspect: 0.75,
            },
          },
        },
      },
    });

    const updatedGC = await prisma.gameCharacter.findUnique({ where: { id: testGameCharId } });
    const updatedGCFraming = getCardVideoFraming(updatedGC);
    assert(updatedGCFraming.rotation === 270, "Updated rotation (270 deg) successfully saved and retrieved");
    assert(updatedGCFraming.zoom === 1.6, "Updated zoom (1.6x) successfully saved and retrieved");
  } finally {
    // Cleanup test record
    await prisma.gameCharacter.deleteMany({ where: { id: testGameCharId } });
    console.log("  🧹 Test GameCharacter record cleaned up safely.");
  }

  // ─── 3. HALL OF FAME DB PERSISTENCE & RESTORATION ROUND-TRIP ───────────────
  console.log("\n--- 3. Hall of Fame (Character Dictionary) Persistence Round-Trip ---");

  const testHofId = `test-hof-rot-${Date.now()}`;
  const hofVideoSource = "https://example.com/character_voice_pv.mp4";

  try {
    // A. Create HOF record with details.cropData.cardVideoCrop
    await prisma.hallOfFame.create({
      data: {
        id: testHofId,
        name: "Test HOF Rotator",
        type: "actress",
        status: "GOAT Status",
        imageUrl: "https://example.com/static_fallback.jpg",
        details: {
          cardVideo: hofVideoSource,
          cardVideoCrop: {
            x: -12.0,
            y: 4.5,
            zoom: 1.35,
            rotation: 180,
            aspect: 0.75,
          },
          videoFraming: {
            x: -12.0,
            y: 4.5,
            zoom: 1.35,
            rotation: 180,
            aspect: 0.75,
          },
          cropData: {
            cardVideoCrop: {
              x: -12.0,
              y: 4.5,
              zoom: 1.35,
              rotation: 180,
              aspect: 0.75,
            },
            videoFraming: {
              x: -12.0,
              y: 4.5,
              zoom: 1.35,
              rotation: 180,
              aspect: 0.75,
            },
          },
        },
      },
    });

    // B. Fetch record back from PostgreSQL
    const fetchedHOF = await prisma.hallOfFame.findUnique({
      where: { id: testHofId },
    });

    assert(Boolean(fetchedHOF), "Hall of Fame entry saved and retrieved from PostgreSQL");
    assert(getCardVideoUrl(fetchedHOF) === hofVideoSource, "HOF card video source correctly extracted from details.cardVideo");

    const restoredHOFFraming = getCardVideoFraming(fetchedHOF);
    assert(restoredHOFFraming.rotation === 180, `HOF rotation restored accurately (expected 180, got ${restoredHOFFraming.rotation})`);
    assert(restoredHOFFraming.x === -12.0, `HOF X offset restored accurately (expected -12.0, got ${restoredHOFFraming.x})`);
    assert(restoredHOFFraming.y === 4.5, `HOF Y offset restored accurately (expected 4.5, got ${restoredHOFFraming.y})`);
    assert(restoredHOFFraming.zoom === 1.35, `HOF zoom restored accurately (expected 1.35, got ${restoredHOFFraming.zoom})`);

    const hofStyle = getVideoFramingStyle(restoredHOFFraming);
    assert(
      hofStyle.transform === "translate(-12%, 4.5%) rotate(180deg) scale(1.35)",
      `HOF framing translates to exact CSS transform: ${hofStyle.transform}`
    );
  } finally {
    // Cleanup test record
    await prisma.hallOfFame.deleteMany({ where: { id: testHofId } });
    console.log("  🧹 Test HallOfFame record cleaned up safely.");
  }

  // ─── 4. SUMMARY ────────────────────────────────────────────────────────────
  console.log("\n=============================================================");
  if (failed === 0) {
    console.log(`🎉 ALL ${passed} LIFECYCLE & PERSISTENCE TESTS PASSED!`);
  } else {
    console.log(`❌ ${failed} TESTS FAILED.`);
    process.exit(1);
  }
  console.log("=============================================================");
}

runLifecycleTests()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
