import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function main() {
  const prisma = (await import("../lib/prisma")).default;

  const profiles = await prisma.profile.findMany();
  console.log("Profiles count:", profiles.length);
  for (const p of profiles) {
    console.log(`Profile ID: ${p.id}, userId: ${p.userId}, name: ${p.name}`);
  }

  const games = await prisma.game.findMany();
  console.log("\nExisting Games count:", games.length);
  for (const g of games) {
    console.log(`Game ID: ${g.id}, userId: ${g.userId}, name: ${g.game}`);
  }

  const dossierChars = await prisma.gameDossierCharacter.findMany();
  console.log("\nExisting Dossier Characters count:", dossierChars.length);

  const gameChars = await prisma.gameCharacter.findMany();
  console.log("\nExisting Game Characters count:", gameChars.length);
  for (const gc of gameChars) {
    console.log(`GameChar ID: ${gc.id}, name: ${gc.name}, gameName: ${gc.gameName}, gameId: ${gc.gameId}`);
  }
}

main().catch(console.error);
