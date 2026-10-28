import type { ItemRarity, PendingChest } from "@/types/rpg";
import { GAME_ITEMS, itemById, STARTER_ITEM_IDS } from "./catalog";
import { duplicateCoinsForRarity } from "./floor-chest";

const WEIGHTS: Record<PendingChest["tier"], ItemRarity[]> = {
  mystery: ["common", "common", "uncommon", "uncommon", "rare"],
  rare: ["uncommon", "rare", "rare", "epic"],
  legendary: ["rare", "epic", "epic", "legendary"],
};

function pickRarity(tier: PendingChest["tier"]): ItemRarity {
  const pool = WEIGHTS[tier];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function rollChestItem(
  chest: PendingChest,
  owned: string[],
  playerLevel: number
): string | null {
  const targetRarity = pickRarity(chest.tier);
  const candidates = GAME_ITEMS.filter(
    (i) =>
      i.rarity === targetRarity &&
      i.requiredLevel <= playerLevel &&
      i.price > 0 &&
      !STARTER_ITEM_IDS.includes(i.id as (typeof STARTER_ITEM_IDS)[number]) &&
      !owned.includes(i.id)
  );
  if (candidates.length === 0) {
    const fallback = GAME_ITEMS.filter(
      (i) =>
        i.requiredLevel <= playerLevel &&
        i.price > 0 &&
        !STARTER_ITEM_IDS.includes(i.id as (typeof STARTER_ITEM_IDS)[number]) &&
        !owned.includes(i.id)
    );
    if (fallback.length === 0) return null;
    return fallback[Math.floor(Math.random() * fallback.length)].id;
  }
  return candidates[Math.floor(Math.random() * candidates.length)].id;
}

export function chestTierLabel(tier: PendingChest["tier"]): string {
  if (tier === "mystery") return "Тайный сундук";
  if (tier === "rare") return "Редкий сундук";
  return "Легендарный сундук";
}

export function sellDuplicateValue(itemId: string): number {
  const item = itemById(itemId);
  if (!item) return 5;
  return duplicateCoinsForRarity(item.rarity);
}
