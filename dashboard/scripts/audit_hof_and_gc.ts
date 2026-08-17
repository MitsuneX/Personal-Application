import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runAudit() {
  console.log("=== DATABASE AUDIT REPORT ===");

  // 1. Game Character Audit
  const gcs = await prisma.gameCharacter.findMany();
  console.log(`\n--- Game Characters (${gcs.length} total) ---`);
  const gcWithVideo = gcs.filter(g => 
    g.cardImage?.includes(".mp4") || 
    g.cardImage?.includes(".webm") || 
    (g.stats as any)?.cardVideo || 
    (g as any).details?.cardVideo ||
    (g.stats as any)?.previewVideo ||
    (g as any).details?.previewVideo
  );
  console.log(`Game Characters with Video/MP4: ${gcWithVideo.length}`);
  
  if (gcWithVideo.length > 0) {
    console.log("Sample GC Video entry framing data:", JSON.stringify(gcWithVideo[0].stats, null, 2));
  }

  // 2. Hall Of Fame Audit
  const hofs = await prisma.hallOfFame.findMany();
  console.log(`\n--- Hall Of Fame (${hofs.length} total) ---`);
  const hofWithVideo = hofs.filter(h => 
    h.imageUrl?.includes(".mp4") || 
    h.imageUrl?.includes(".webm") || 
    h.portraitUrl?.includes(".mp4") ||
    h.portraitUrl?.includes(".webm") ||
    (h.details as any)?.videoUrl ||
    (h.details as any)?.cardVideo
  );
  console.log(`Hall Of Fame with Video/MP4: ${hofWithVideo.length}`);

  if (hofWithVideo.length > 0) {
    console.log("Sample HOF Video entry details:", JSON.stringify(hofWithVideo[0].details, null, 2));
  }

  const types = Array.from(new Set(hofs.map(h => h.type)));
  console.log(`HOF Types present:`, types);

  // 3. Championship History Audit
  const champs = await prisma.championshipHistory.findMany();
  console.log(`\n--- Championship History (${champs.length} total) ---`);
  const champCategories = Array.from(new Set(champs.map(c => c.category)));
  console.log(`Champ Categories present:`, champCategories);

  // 4. Hall Event Audit
  const events = await prisma.hallEvent.findMany();
  console.log(`\n--- Hall Events (${events.length} total) ---`);

  // 5. Game Character Distribution Audit
  const gcGames = Array.from(new Set(gcs.map(g => g.gameName || g.gameId)));
  console.log(`Unique Games in GameCharacters: ${gcGames.length}`);

  await prisma.$disconnect();
}

runAudit().catch(e => {
  console.error(e);
  process.exit(1);
});
