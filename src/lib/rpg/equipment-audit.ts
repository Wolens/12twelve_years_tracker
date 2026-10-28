import { GAME_ITEMS, itemById } from "./catalog";
import { ITEM_SPRITE_COLOR } from "./item-sprite-colors";
import { createInitialCharacter } from "./defaults";
import { normalizeCharacter } from "./normalize-game";
import type { CharacterState, EquipSlot } from "@/types/rpg";

const SPRITE_HEAD = new Set([
  "cap",
  "beret",
  "band",
  "veil",
  "hood",
  "circlet",
  "crown",
  "helm",
]);

const SPRITE_TORSO = new Set([
  "shirt",
  "jacket",
  "vest",
  "cloak",
  "dress",
  "robe",
  "armor",
]);

const SPRITE_LEGS = new Set(["pants", "shorts", "skirt", "sandals", "boots", "greaves"]);

const SPRITE_WEAPON = new Set([
  "staff",
  "dagger",
  "sword",
  "bow",
  "axe",
  "spear",
  "mace",
  "blade",
  "wand",
  "relic",
]);

const SPRITE_CHARM = new Set(["leaf", "star", "moon", "fang", "ring", "flame"]);

const SLOT_GLYPHS: Record<EquipSlot, Set<string>> = {
  head: SPRITE_HEAD,
  torso: SPRITE_TORSO,
  legs: SPRITE_LEGS,
  weapon: SPRITE_WEAPON,
  charm: SPRITE_CHARM,
};

/** Проверка: у каждого предмета есть цвет спрайта и glyph, который рисуется на герое. */
export function collectEquipmentSpriteIssues(): string[] {
  const issues: string[] = [];
  for (const item of GAME_ITEMS) {
    if (!ITEM_SPRITE_COLOR[item.id]) {
      issues.push(`${item.id}: нет цвета в ITEM_SPRITE_COLOR`);
    }
    const allowed = SLOT_GLYPHS[item.slot];
    if (!allowed.has(item.glyph)) {
      issues.push(`${item.id}: glyph "${item.glyph}" не поддерживается слотом ${item.slot} на спрайте`);
    }
    if (itemById(item.id) !== item) {
      issues.push(`${item.id}: дубликат или битая запись в каталоге`);
    }
  }
  return issues;
}

/** Каждый предмет в инвентаре должен оставаться надетым после normalizeCharacter. */
export function collectEquipNormalizeIssues(): string[] {
  const issues: string[] = [];
  for (const item of GAME_ITEMS) {
    const base = createInitialCharacter();
    const inventory = base.inventory.includes(item.id)
      ? [...base.inventory]
      : [...base.inventory, item.id];
    const raw: CharacterState = {
      ...base,
      inventory,
      equipped: { ...base.equipped, [item.slot]: item.id },
    };
    const normalized = normalizeCharacter(raw);
    if (normalized.equipped[item.slot as EquipSlot] !== item.id) {
      issues.push(`${item.id}: экипировка слетает после normalize (${item.slot})`);
    }
    if (!normalized.inventory.includes(item.id)) {
      issues.push(`${item.id}: пропал из инвентаря после normalize`);
    }
  }
  return issues;
}

export function assertEquipmentSpriteCoverage(): void {
  const issues = collectEquipmentSpriteIssues();
  if (issues.length > 0) {
    throw new Error(`Equipment sprite audit failed:\n${issues.join("\n")}`);
  }
}
