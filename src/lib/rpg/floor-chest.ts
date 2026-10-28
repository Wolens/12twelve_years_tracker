import type { ItemRarity } from "@/types/rpg";
import { GAME_ITEMS, itemById, STARTER_ITEM_IDS } from "./catalog";
import { xpProgressInLevel } from "@/lib/gamification";

const RARITY_POOL: ItemRarity[] = [
  "common",
  "common",
  "common",
  "common",
  "common",
  "uncommon",
  "uncommon",
  "uncommon",
  "rare",
  "rare",
  "epic",
  "legendary",
];

export function isWeekStartFloor(day: number): boolean {
  return day >= 1 && day <= 84 && (day - 1) % 7 === 0;
}

export function pickFloorChestRarity(): ItemRarity {
  return RARITY_POOL[Math.floor(Math.random() * RARITY_POOL.length)];
}

export function rollFloorChestItem(playerLevel: number): string {
  const target = pickFloorChestRarity();
  let pool = GAME_ITEMS.filter(
    (i) =>
      i.rarity === target &&
      i.requiredLevel <= playerLevel &&
      i.price > 0 &&
      !(STARTER_ITEM_IDS as readonly string[]).includes(i.id)
  );
  if (pool.length === 0) {
    pool = GAME_ITEMS.filter(
      (i) =>
        i.requiredLevel <= playerLevel &&
        i.price > 0 &&
        !(STARTER_ITEM_IDS as readonly string[]).includes(i.id)
    );
  }
  if (pool.length === 0) return "cap_trainee";
  return pool[Math.floor(Math.random() * pool.length)].id;
}

/** Монеты за повторку с этажного сундука — чем реже, тем щедрее. */
export function duplicateCoinsForRarity(rarity: ItemRarity): number {
  switch (rarity) {
    case "common":
      return 14;
    case "uncommon":
      return 32;
    case "rare":
      return 58;
    case "epic":
      return 120;
    case "legendary":
      return 240;
    default:
      return 14;
  }
}

export function duplicateCoinsForItem(itemId: string): number {
  const item = itemById(itemId);
  if (!item) return 10;
  return duplicateCoinsForRarity(item.rarity);
}

export function playerLevelFromXp(xp: number): number {
  return xpProgressInLevel(xp).level;
}
