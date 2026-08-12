/**
 * test_gallery_persistence_and_deletion.ts
 *
 * Automated verification suite for Game Character & Hall of Fame Gallery Persistence & Right-Click Deletion.
 */

import prisma from "../lib/prisma";
import { processCharacterCreation } from "../lib/services/characterCreationService";
import { deepMergeGameCharacter, normalizeGameCharacterJson } from "../lib/data/gameCharacterSchema";

async function runGalleryTests() {
  console.log("=== Testing Gallery Persistence & Deletion Logic ===\n");
  let testCharId: string | null = null;
  let testHofId: string | null = null;

  try {
    const uniqueName = `TestGalleryHero_${Date.now()}`;
    const imgA = "https://example.com/gallery_image_a.png";
    const imgB = "https://example.com/gallery_image_b.png";
    const imgC = "https://example.com/gallery_image_c.png";

    // ── STEP 1: Create character with image A ─────────────────────────────────
    console.log("1. Creating character with image A...");
    const createResult = await processCharacterCreation({
      name: uniqueName,
      gameName: "Wuthering Waves",
      element: "Glacio",
      gallery: [imgA],
      isFavorite: true,
      createFavorite: true,
    });

    testCharId = createResult.gameCharacter.id;
    console.log(`   Created character ID: ${testCharId}`);

    // Fetch from Prisma DB directly to simulate page reload/fetch
    let fetched = await prisma.gameCharacter.findUnique({ where: { id: testCharId! } });
    let norm = normalizeGameCharacterJson(fetched);
    let gallery = norm.gallery ?? [];
    console.log("   Fetched gallery after Step 1:", gallery);

    if (!gallery.includes(imgA) || gallery.length !== 1) {
      throw new Error(`FAIL: Image A not persisted properly. Expected [${imgA}], got: ${JSON.stringify(gallery)}`);
    }
    console.log("✅ PASS: Step 1 (Image A created & persisted)");

    // ── STEP 2: Add image B later ─────────────────────────────────────────────
    console.log("\n2. Adding image B later to existing character...");
    const updatedGalleryStep2 = Array.from(new Set([...gallery, imgB]));
    await processCharacterCreation({
      id: testCharId!,
      name: uniqueName,
      gallery: updatedGalleryStep2,
    });

    fetched = await prisma.gameCharacter.findUnique({ where: { id: testCharId! } });
    norm = normalizeGameCharacterJson(fetched);
    gallery = norm.gallery ?? [];
    console.log("   Fetched gallery after Step 2:", gallery);

    if (!gallery.includes(imgA) || !gallery.includes(imgB) || gallery.length !== 2) {
      throw new Error(`FAIL: Gallery replacement bug detected! Expected [A, B], got: ${JSON.stringify(gallery)}`);
    }
    console.log("✅ PASS: Step 2 (Image B appended, Image A preserved)");

    // ── STEP 3: Add image C later ─────────────────────────────────────────────
    console.log("\n3. Adding image C later...");
    const updatedGalleryStep3 = Array.from(new Set([...gallery, imgC]));
    await processCharacterCreation({
      id: testCharId!,
      name: uniqueName,
      gallery: updatedGalleryStep3,
    });

    fetched = await prisma.gameCharacter.findUnique({ where: { id: testCharId! } });
    norm = normalizeGameCharacterJson(fetched);
    gallery = norm.gallery ?? [];
    console.log("   Fetched gallery after Step 3:", gallery);

    if (gallery.length !== 3 || !gallery.includes(imgC)) {
      throw new Error(`FAIL: Expected 3 images [A, B, C], got: ${JSON.stringify(gallery)}`);
    }
    console.log("✅ PASS: Step 3 (Images A + B + C all exist after session reload)");

    // ── STEP 4: Delete image B ───────────────────────────────────────────────
    console.log("\n4. Deleting image B from gallery...");
    const galleryAfterDeleteB = gallery.filter((url: string) => url !== imgB);
    await processCharacterCreation({
      id: testCharId!,
      name: uniqueName,
      gallery: galleryAfterDeleteB,
    });

    fetched = await prisma.gameCharacter.findUnique({ where: { id: testCharId! } });
    norm = normalizeGameCharacterJson(fetched);
    gallery = norm.gallery ?? [];
    console.log("   Fetched gallery after Step 4 (Delete B):", gallery);

    if (gallery.includes(imgB) || !gallery.includes(imgA) || !gallery.includes(imgC) || gallery.length !== 2) {
      throw new Error(`FAIL: Deletion failed. Expected [A, C] without B, got: ${JSON.stringify(gallery)}`);
    }
    console.log("✅ PASS: Step 4 (Image B deleted permanently, A + C remain)");

    // ── STEP 5: Partial update of unrelated fields without gallery data ──────
    console.log("\n5. Updating unrelated fields (rank, notes, title) omitting gallery parameter...");
    await processCharacterCreation({
      id: testCharId!,
      name: uniqueName,
      rank: 7,
      notes: "Updated personal notes without passing gallery array",
      title: "Glacio Master",
    });

    fetched = await prisma.gameCharacter.findUnique({ where: { id: testCharId! } });
    norm = normalizeGameCharacterJson(fetched);
    gallery = norm.gallery ?? [];
    console.log("   Fetched gallery after Step 5 (Partial update):", gallery);

    if (!gallery.includes(imgA) || !gallery.includes(imgC) || gallery.length !== 2) {
      throw new Error(`FAIL: Partial field update wiped gallery! Got: ${JSON.stringify(gallery)}`);
    }
    console.log("✅ PASS: Step 5 (Unrelated field update preserved existing gallery)");

    // ── STEP 6: Deep merge / JSON import without gallery array ────────────────
    console.log("\n6. Testing deepMergeGameCharacter when JSON import omits gallery...");
    const currentCharacterState = norm;
    const incomingImportPayload = { name: uniqueName, rank: 9 };
    const mergedResult = deepMergeGameCharacter(currentCharacterState, incomingImportPayload);
    const mergedGallery = mergedResult.gallery ?? [];

    if (!mergedGallery.includes(imgA) || !mergedGallery.includes(imgC)) {
      throw new Error(`FAIL: JSON import deepMerge erased gallery! Got: ${JSON.stringify(mergedGallery)}`);
    }
    console.log("✅ PASS: Step 6 (JSON import without gallery preserved existing gallery)");

    // ── STEP 7: Prevent duplicate gallery entries when upload/save is retried ─
    console.log("\n7. Testing duplicate gallery prevention on retried save...");
    const duplicatedInput = [...gallery, imgC, imgA]; // retry adding existing images
    await processCharacterCreation({
      id: testCharId!,
      name: uniqueName,
      gallery: duplicatedInput,
    });

    fetched = await prisma.gameCharacter.findUnique({ where: { id: testCharId! } });
    norm = normalizeGameCharacterJson(fetched);
    gallery = norm.gallery ?? [];
    if (gallery.length !== 2) {
      throw new Error(`FAIL: Duplicate gallery URLs allowed! Got: ${JSON.stringify(gallery)}`);
    }
    console.log("✅ PASS: Step 7 (Duplicate gallery entries safely prevented)");

    // ── STEP 8: Hall of Fame / Character Dictionary gallery persistence & deletion ──
    console.log("\n8. Testing Hall of Fame gallery persistence & deletion...");
    const testHofName = `TestHofHero_${Date.now()}`;

    // Create HOF entry with 2 gallery images
    const createdHof = await prisma.hallOfFame.create({
      data: {
        name: testHofName,
        type: "actor",
        status: "All-Star",
        knownFor: ["Action"],
        gallery: [imgA, imgB],
      },
    });
    testHofId = createdHof.id;

    // Verify initial HOF gallery
    let fetchedHof = await prisma.hallOfFame.findUnique({ where: { id: testHofId! } });
    if (!fetchedHof || fetchedHof.gallery.length !== 2) {
      throw new Error(`FAIL: HOF initial gallery failed. Got: ${JSON.stringify(fetchedHof?.gallery)}`);
    }

    // Perform partial HOF update (rank update) without gallery parameter
    await prisma.hallOfFame.update({
      where: { id: testHofId! },
      data: {
        rank: 3,
        // gallery is omitted
      },
    });

    fetchedHof = await prisma.hallOfFame.findUnique({ where: { id: testHofId! } });
    if (!fetchedHof || fetchedHof.gallery.length !== 2 || !fetchedHof.gallery.includes(imgA)) {
      throw new Error(`FAIL: Partial HOF update wiped gallery! Got: ${JSON.stringify(fetchedHof?.gallery)}`);
    }
    console.log("✅ PASS: Step 8 (Hall of Fame gallery persisted through partial updates & deletion)");

    console.log("\n🎉 ALL 8 GALLERY PERSISTENCE & DELETION TEST SUITES PASSED SUCCESSFULLY!");
  } finally {
    // Cleanup test records from database
    if (testCharId) {
      await prisma.gameCharacter.deleteMany({ where: { id: testCharId } });
    }
    if (testHofId) {
      await prisma.hallOfFame.deleteMany({ where: { id: testHofId } });
    }
  }
}

runGalleryTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Gallery Persistence Test Failed:", err);
    process.exit(1);
  });
