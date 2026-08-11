import {
  validateGameCharacterJson,
  normalizeGameCharacterJson,
  exportGameCharacterToJson,
  deepMergeGameCharacter,
} from "../lib/data/gameCharacterSchema";

const daringHeartInput = {
  id: "gc-1786432530733",
  name: "Daring Heart",
  officialName: "Daring Heart",
  alias: "Daring Heart",
  nickname: "Daring Heart",
  nativeName: "ダーリングハート",
  title: "",
  gameId: "cc1cf0e6-4dad-41ab-9377-ec2f0e796372",
  gameName: "Umamusume: Pretty Derby",
  tier: "S",
  rank: null,
  isFavorite: true,
  isFeatured: false,
  accentColor: "#FF7675",
  identity: {
    birthday: "March 24",
    age: "",
    gender: "Female",
    height: "",
    weight: "",
    species: "Umamusume",
    race: "Thoroughbred",
  },
  world: {
    nation: "Japan",
    region: "",
    planet: "Earth",
    organization: "Tracen Academy",
    affiliation: "Tracen Academy",
    faction: "",
  },
  combat: {
    role: "Racer",
    attribute: "",
    element: "",
    path: "",
    weaponType: "",
    rarity: "3",
    nation: "Japan",
    birthday: "March 24",
    damageType: "",
    combatRole: "Miler / Mile-Class Runner",
  },
  voice: {
    japanese: "",
    chinese: "",
    korean: "",
    english: "",
  },
  story: {
    personality:
      "A passionate and elegant Umamusume whose racing style is marked by a bold heart, echoing her name and legendary mile and intermediate performances.",
    biography:
      "An Umamusume modeled after the Japanese Thoroughbred racehorse Daring Heart, known for her strong showings in classic mile races such as the Oka Sho and NHK Mile Cup, as well as victories in the Fuchu Himba Stakes and Shion Stakes.",
    officialDescription:
      "A charming and spirited Umamusume with a fierce, competitive racing spirit.",
    favoriteQuote: "",
  },
};

const genericGenshinInput = {
  id: "gc-genshin-001",
  name: "Xiao",
  officialName: "Alatus",
  alias: "Vigilant Yaksha",
  nickname: "Conqueror of Demons",
  nativeName: "魈",
  title: "Bane of All Evil",
  gameId: "game-genshin-id",
  gameName: "Genshin Impact",
  tier: "SS",
  rank: 1,
  isFavorite: true,
  isFeatured: true,
  accentColor: "#00F5FF",
  identity: {
    birthday: "April 17",
    age: "2000+",
    gender: "Male",
    height: "162 cm",
    weight: "",
    species: "Adeptus",
    race: "Yaksha",
  },
  world: {
    nation: "Liyue",
    region: "Bishui Plain",
    planet: "Teyvat",
    organization: "Adepti",
    affiliation: "Wangshu Inn",
    faction: "Liyue Qixing Allies",
  },
  combat: {
    role: "Main DPS",
    attribute: "",
    element: "Anemo",
    path: "Plunge DPS",
    weaponType: "Polearm",
    rarity: "5-Star",
    nation: "Liyue",
    birthday: "April 17",
    damageType: "Anemo Plunge DMG",
    combatRole: "Hypercarry",
  },
  voice: {
    japanese: "Matsuoka Yoshitsugu",
    chinese: "kinsen",
    korean: "Sim Gyu-hyeok",
    english: "Laila Berzins",
  },
  story: {
    personality: "Taciturn and aloof on the surface, but deeply devoted to protecting Liyue.",
    biography: "One of the five strongest Yakshas dispatched by Morax to subdue demon gods.",
    officialDescription: "A fierce adeptus warrior who wields an Anemo Vision.",
    favoriteQuote: "If you speak my name, I will be there.",
  },
};

function runTests() {
  console.log("=== GAME CHARACTER JSON DATA PRESERVATION TEST ===\n");

  // TEST 1: Validation
  console.log("Test 1: Validating Daring Heart JSON...");
  const val1 = validateGameCharacterJson(daringHeartInput);
  if (!val1.valid) {
    console.error("❌ Validation failed:", val1.errors);
    process.exit(1);
  }
  console.log("✓ Validation PASSED.");

  // TEST 2: Normalization (JSON -> Entry)
  console.log("\nTest 2: Normalizing Daring Heart JSON -> Entry...");
  const entry1 = normalizeGameCharacterJson(daringHeartInput);
  
  // Verify flat properties were populated from nested objects
  if (entry1.birthday !== "March 24") throw new Error(`birthday lost: got '${entry1.birthday}'`);
  if (entry1.species !== "Umamusume") throw new Error(`species lost: got '${entry1.species}'`);
  if (entry1.race !== "Thoroughbred") throw new Error(`race lost: got '${entry1.race}'`);
  if (entry1.nation !== "Japan") throw new Error(`nation lost: got '${entry1.nation}'`);
  if (entry1.organization !== "Tracen Academy") throw new Error(`organization lost: got '${entry1.organization}'`);
  if (entry1.role !== "Racer") throw new Error(`role lost: got '${entry1.role}'`);
  if (entry1.combatRole !== "Miler / Mile-Class Runner") throw new Error(`combatRole lost: got '${entry1.combatRole}'`);
  if (!entry1.personality?.includes("passionate")) throw new Error(`personality lost`);
  if (!entry1.biography?.includes("Thoroughbred")) throw new Error(`biography lost`);

  // Verify nested objects exist on entry1
  if (!entry1.identity || entry1.identity.species !== "Umamusume") throw new Error("nested identity object lost");
  if (!entry1.world || entry1.world.organization !== "Tracen Academy") throw new Error("nested world object lost");
  if (!entry1.combat || entry1.combat.combatRole !== "Miler / Mile-Class Runner") throw new Error("nested combat object lost");
  if (!entry1.story || !entry1.story.biography) throw new Error("nested story object lost");
  
  console.log("✓ Normalization & Flat + Nested Population PASSED.");

  // TEST 3: Export (Entry -> Canonical JSON)
  console.log("\nTest 3: Exporting Entry -> Canonical JSON...");
  const exported1 = exportGameCharacterToJson(entry1);

  if (exported1.id !== daringHeartInput.id) throw new Error("id mismatch");
  if (exported1.identity.birthday !== "March 24") throw new Error("exported identity.birthday lost");
  if (exported1.identity.species !== "Umamusume") throw new Error("exported identity.species lost");
  if (exported1.identity.race !== "Thoroughbred") throw new Error("exported identity.race lost");
  if (exported1.world.nation !== "Japan") throw new Error("exported world.nation lost");
  if (exported1.world.organization !== "Tracen Academy") throw new Error("exported world.organization lost");
  if (exported1.combat.role !== "Racer") throw new Error("exported combat.role lost");
  if (exported1.combat.combatRole !== "Miler / Mile-Class Runner") throw new Error("exported combat.combatRole lost");
  if (exported1.story.personality !== daringHeartInput.story.personality) throw new Error("exported story.personality lost");
  if (exported1.story.biography !== daringHeartInput.story.biography) throw new Error("exported story.biography lost");
  
  // Verify empty string fields were preserved in identity/world/combat/story
  if (exported1.identity.age !== "") throw new Error("empty field identity.age lost");
  if (exported1.world.region !== "") throw new Error("empty field world.region lost");
  if (exported1.story.favoriteQuote !== "") throw new Error("empty field story.favoriteQuote lost");

  console.log("✓ Canonical JSON Export PASSED.");

  // TEST 4: Deep Merge Test
  console.log("\nTest 4: Deep Merging Partial Update...");
  const partialUpdate = {
    id: daringHeartInput.id,
    name: "Daring Heart",
    identity: {
      birthday: "March 24",
      age: "3 years old", // updating age without destroying species/race
    },
  };
  const merged = deepMergeGameCharacter(entry1, partialUpdate);
  if (merged.identity?.age !== "3 years old") throw new Error("deep merge failed to update age");
  if (merged.identity?.species !== "Umamusume") throw new Error("deep merge destroyed existing species");
  if (merged.identity?.race !== "Thoroughbred") throw new Error("deep merge destroyed existing race");
  if (merged.world?.organization !== "Tracen Academy") throw new Error("deep merge destroyed existing world organization");

  console.log("✓ Deep Merge Test PASSED.");

  // TEST 5: Generic Non-Uma Character Test (Xiao / Genshin Impact)
  console.log("\nTest 5: Generic Non-Uma Character Test (Xiao / Genshin Impact)...");
  const val2 = validateGameCharacterJson(genericGenshinInput);
  if (!val2.valid) throw new Error("Xiao validation failed");
  const entry2 = normalizeGameCharacterJson(genericGenshinInput);
  const exported2 = exportGameCharacterToJson(entry2);

  if (exported2.identity.species !== "Adeptus") throw new Error("Xiao identity.species lost");
  if (exported2.world.nation !== "Liyue") throw new Error("Xiao world.nation lost");
  if (exported2.combat.element !== "Anemo") throw new Error("Xiao combat.element lost");
  if (exported2.combat.weaponType !== "Polearm") throw new Error("Xiao combat.weaponType lost");
  if (exported2.voice.japanese !== "Matsuoka Yoshitsugu") throw new Error("Xiao voice.japanese lost");
  if (exported2.story.favoriteQuote !== "If you speak my name, I will be there.") throw new Error("Xiao story.favoriteQuote lost");

  console.log("✓ Generic Non-Uma Character Test PASSED.");

  console.log("\nALL DATA PRESERVATION & CANONICAL MAPPING TESTS PASSED SUCCESSFULLY! ✨");
}

runTests();
