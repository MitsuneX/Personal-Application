import fs from "fs";
import path from "path";

const scriptContent = fs.readFileSync(
  path.join(process.cwd(), "scripts/populate_my_game_characters.ts"),
  "utf8"
);

// Extract characterGroups array text
const match = scriptContent.match(/const characterGroups:[^=]+=\s*(\[\s*[\s\S]*?\n\s*\]);/);
if (!match) {
  console.error("Could not find characterGroups in populate_my_game_characters.ts");
  process.exit(1);
}

let arrayText = match[1];

// Evaluate the array to JS object safely using Function constructor
const characterGroups = new Function(`return ${arrayText}`)();

const targetPath = path.join(process.cwd(), "lib/data/game_characters_master.json");
fs.mkdirSync(path.dirname(targetPath), { recursive: true });
fs.writeFileSync(targetPath, JSON.stringify(characterGroups, null, 2), "utf8");

console.log(`Successfully exported ${characterGroups.length} game groups to ${targetPath}`);
