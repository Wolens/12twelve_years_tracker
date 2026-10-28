import {
  assertEquipmentSpriteCoverage,
  collectEquipNormalizeIssues,
  collectEquipmentSpriteIssues,
} from "../src/lib/rpg/equipment-audit";
import { GAME_ITEMS } from "../src/lib/rpg/catalog";

const spriteIssues = collectEquipmentSpriteIssues();
const equipIssues = collectEquipNormalizeIssues();
const issues = [...spriteIssues, ...equipIssues];
if (issues.length > 0) {
  console.error("Equipment sprite issues:");
  for (const line of issues) console.error("  -", line);
  process.exit(1);
}
assertEquipmentSpriteCoverage();
console.log(`OK: all ${GAME_ITEMS.length} items have sprite colors and supported glyphs.`);
