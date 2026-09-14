import fs from 'fs';
import path from 'path';

function loadEnv(filePath: string) {
  if (fs.existsSync(filePath)) {
    const lines = fs.readFileSync(filePath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

const rootDir = 'c:/Coding/scripts/Full Stack Personal Applications/dashboard';
loadEnv(path.join(rootDir, '.env.local'));
loadEnv(path.join(rootDir, '.env'));

import prisma from '../lib/prisma';

async function main() {
  console.log('=== STARTING GAME & AI TOOL RECONCILIATION ===\n');

  // 1. Mandatory Backup
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(rootDir, 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  const scratchBackupDir = 'C:/Users/KATANA/.gemini/antigravity-ide/brain/f8f034fe-1ad5-42e8-a0d7-7d76d6d1af75/scratch';
  if (!fs.existsSync(scratchBackupDir)) {
    fs.mkdirSync(scratchBackupDir, { recursive: true });
  }

  console.log('[1/5] Creating comprehensive backup of Game, AI Tools, and Character relationships...');
  const allGames = await prisma.game.findMany({
    include: {
      resources: true,
      showcaseItems: true,
    },
  });
  const allAiTools = await prisma.aiToolItem.findMany();
  const allGameCharacters = await prisma.gameCharacter.findMany({
    select: { id: true, name: true, gameId: true, gameName: true, userId: true },
  });
  const allDossierCharacters = await prisma.gameDossierCharacter.findMany({
    select: { id: true, name: true, gameId: true, userId: true },
  });

  const backupData = {
    timestamp: new Date().toISOString(),
    gamesCount: allGames.length,
    aiToolsCount: allAiTools.length,
    gameCharactersCount: allGameCharacters.length,
    dossierCharactersCount: allDossierCharacters.length,
    games: allGames,
    aiTools: allAiTools,
    gameCharacters: allGameCharacters,
    dossierCharacters: allDossierCharacters,
  };

  const backupFileName = `backup_games_aitools_${timestamp}.json`;
  const backupFilePath = path.join(backupDir, backupFileName);
  const scratchBackupFilePath = path.join(scratchBackupDir, backupFileName);

  fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), 'utf8');
  fs.writeFileSync(scratchBackupFilePath, JSON.stringify(backupData, null, 2), 'utf8');

  console.log(`✓ Backup saved to: ${backupFilePath} (${fs.statSync(backupFilePath).size} bytes)`);
  console.log(`✓ Scratch backup saved to: ${scratchBackupFilePath}\n`);

  // Initial reference counts for integrity assertion
  const initialCharCount = allGameCharacters.length;
  const initialDossierCount = allDossierCharacters.length;
  console.log(`Pre-reconciliation baseline:`);
  console.log(`- Total Games: ${allGames.length}`);
  console.log(`- Total AI Tools: ${allAiTools.length}`);
  console.log(`- Total Game Characters: ${initialCharCount}`);
  console.log(`- Total Game Dossier Characters: ${initialDossierCount}\n`);

  // 2. Identify and Reconcile Duplicate Games
  console.log('[2/5] Identifying duplicate Game records...');
  const gamesByUser: Record<string, typeof allGames> = {};
  for (const g of allGames) {
    const uid = g.userId || 'null';
    if (!gamesByUser[uid]) gamesByUser[uid] = [];
    gamesByUser[uid].push(g);
  }

  const gameIdsToDelete: string[] = [];

  for (const [uid, uGames] of Object.entries(gamesByUser)) {
    const titleGroups: Record<string, typeof allGames> = {};
    for (const g of uGames) {
      const norm = g.game.trim().toLowerCase();
      if (!titleGroups[norm]) titleGroups[norm] = [];
      titleGroups[norm].push(g);
    }

    for (const [normTitle, list] of Object.entries(titleGroups)) {
      if (list.length <= 1) continue;

      console.log(`User "${uid}" has ${list.length} records for game: "${list[0].game}"`);

      // Determine canonical:
      // Score records:
      // +1000 if referenced by GameCharacter
      // +500 if referenced by GameDossierCharacter
      // +100 if has non-empty handle
      // +50 if has resources or showcase items
      // +10 if stable ID (e.g. starts with "game-")
      // Earliest createdAt breaks ties
      const scoredList = await Promise.all(
        list.map(async (g) => {
          const charCount = await prisma.gameCharacter.count({ where: { gameId: g.id } });
          const dossierCount = await prisma.gameDossierCharacter.count({ where: { gameId: g.id } });
          const resCount = await prisma.gameExternalResource.count({ where: { gameId: g.id } });
          const showCount = await prisma.gameShowcaseItem.count({ where: { gameId: g.id } });

          let score = 0;
          if (charCount > 0) score += 1000 * charCount;
          if (dossierCount > 0) score += 500 * dossierCount;
          if (g.handle && g.handle.trim() !== '') score += 100;
          if (resCount > 0) score += 50 * resCount;
          if (showCount > 0) score += 50 * showCount;
          if (g.id.startsWith('game-')) score += 10;

          return {
            game: g,
            score,
            charCount,
            dossierCount,
            resCount,
            showCount,
            createdAtTime: new Date(g.createdAt).getTime(),
          };
        })
      );

      // Sort: highest score first, then earliest created first
      scoredList.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.createdAtTime - b.createdAtTime;
      });

      const canonical = scoredList[0];
      const dupes = scoredList.slice(1);

      console.log(`  -> Canonical ID: ${canonical.game.id} (Score: ${canonical.score}, Created: ${canonical.game.createdAt.toISOString()}, Handle: "${canonical.game.handle || ''}", Chars: ${canonical.charCount})`);

      for (const d of dupes) {
        // Strict safety check: must have 0 references across all dependent tables
        if (d.charCount > 0 || d.dossierCount > 0 || d.resCount > 0 || d.showCount > 0) {
          throw new Error(`CRITICAL ABORT: Candidate duplicate game ${d.game.id} has non-zero references! (chars: ${d.charCount}, dossier: ${d.dossierCount}, res: ${d.resCount}, show: ${d.showCount})`);
        }
        console.log(`  -> Candidate for deletion: ${d.game.id} (Created: ${d.game.createdAt.toISOString()}, References: 0)`);
        gameIdsToDelete.push(d.game.id);
      }
    }
  }

  console.log(`\nTotal verified duplicate games to remove: ${gameIdsToDelete.length}`);

  // 3. Identify Duplicate AI Tools
  console.log('\n[3/5] Identifying duplicate AI Tool records...');
  const aiToolsByUser: Record<string, typeof allAiTools> = {};
  for (const t of allAiTools) {
    const uid = t.userId || 'null';
    if (!aiToolsByUser[uid]) aiToolsByUser[uid] = [];
    aiToolsByUser[uid].push(t);
  }

  const aiToolIdsToDelete: string[] = [];

  for (const [uid, uTools] of Object.entries(aiToolsByUser)) {
    const nameGroups: Record<string, typeof allAiTools> = {};
    for (const t of uTools) {
      const norm = t.name.trim().toLowerCase();
      if (!nameGroups[norm]) nameGroups[norm] = [];
      nameGroups[norm].push(t);
    }

    for (const [normName, list] of Object.entries(nameGroups)) {
      if (list.length <= 1) continue;

      // Score:
      // +100 if has custom notes
      // +50 if launchCount > 0
      // +20 if isFavorite or isPinned
      // +10 if stable ID (starts with "ai-")
      // Earliest createdAt breaks ties
      const scoredList = list.map((t) => {
        let score = 0;
        if (t.notes && t.notes.trim() !== '') score += 100;
        if (t.launchCount > 0) score += 50;
        if (t.isFavorite || t.isPinned) score += 20;
        if (t.id.startsWith('ai-')) score += 10;
        return {
          tool: t,
          score,
          createdAtTime: new Date(t.createdAt).getTime(),
        };
      });

      scoredList.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.createdAtTime - b.createdAtTime;
      });

      const canonical = scoredList[0];
      const dupes = scoredList.slice(1);

      for (const d of dupes) {
        aiToolIdsToDelete.push(d.tool.id);
      }
    }
  }

  console.log(`Total verified duplicate AI tools to remove: ${aiToolIdsToDelete.length}`);

  // 4. Perform Deletions Safely in Transactions / Batches
  console.log('\n[4/5] Executing deletion of verified duplicates...');
  if (gameIdsToDelete.length > 0) {
    const deleteGamesResult = await prisma.game.deleteMany({
      where: { id: { in: gameIdsToDelete } },
    });
    console.log(`✓ Successfully deleted ${deleteGamesResult.count} duplicate Game records.`);
  }

  if (aiToolIdsToDelete.length > 0) {
    const deleteAiResult = await prisma.aiToolItem.deleteMany({
      where: { id: { in: aiToolIdsToDelete } },
    });
    console.log(`✓ Successfully deleted ${deleteAiResult.count} duplicate AI Tool records.`);
  }

  // 5. Final Post-Reconciliation Verification & Data Safety Assertions
  console.log('\n[5/5] Running post-reconciliation assertions...');
  const remainingGames = await prisma.game.findMany();
  const remainingAiTools = await prisma.aiToolItem.findMany();
  const remainingCharCount = await prisma.gameCharacter.count();
  const remainingDossierCount = await prisma.gameDossierCharacter.count();

  console.log(`Final Database Counts:`);
  console.log(`- Games: ${remainingGames.length} (was ${allGames.length}, removed ${gameIdsToDelete.length})`);
  console.log(`- AI Tools: ${remainingAiTools.length} (was ${allAiTools.length}, removed ${aiToolIdsToDelete.length})`);
  console.log(`- Game Characters: ${remainingCharCount} (was ${initialCharCount})`);
  console.log(`- Dossier Characters: ${remainingDossierCount} (was ${initialDossierCount})`);

  if (remainingCharCount !== initialCharCount) {
    throw new Error(`CRITICAL INTEGRITY FAILURE: GameCharacter count changed from ${initialCharCount} to ${remainingCharCount}!`);
  }
  if (remainingDossierCount !== initialDossierCount) {
    throw new Error(`CRITICAL INTEGRITY FAILURE: GameDossierCharacter count changed from ${initialDossierCount} to ${remainingDossierCount}!`);
  }

  // Check that all GameCharacters still have valid gameId references
  const remainingGameIdSet = new Set(remainingGames.map((g) => g.id));
  const characters = await prisma.gameCharacter.findMany({ select: { id: true, name: true, gameId: true } });
  const orphanedChars = characters.filter((c) => c.gameId && !remainingGameIdSet.has(c.gameId));
  if (orphanedChars.length > 0) {
    throw new Error(`CRITICAL INTEGRITY FAILURE: ${orphanedChars.length} characters have orphaned gameId references!`);
  }

  console.log('\n✅ ALL INTEGRITY ASSERTIONS PASSED! 0 orphaned characters. Reconciled clean dataset.');
  process.exit(0);
}

main()
  .catch((err) => {
    console.error('\n❌ RECONCILIATION FAILED:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
