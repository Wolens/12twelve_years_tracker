import type { CharacterState, EquipSlot, SeasonFlameState } from "@/types/rpg";
import { normalizeRace, STARTER_ITEM_IDS, itemById } from "./catalog";
import { createInitialCharacter, createInitialSeasonFlame } from "./defaults";

const EQUIP_SLOTS: EquipSlot[] = ["head", "torso", "legs", "weapon", "charm"];

function ensureStarterInventory(character: CharacterState): CharacterState {
  let inventory = [...character.inventory];
  for (const id of STARTER_ITEM_IDS) {
    if (!inventory.includes(id)) inventory.push(id);
  }
  return { ...character, inventory };
}

function sanitizeEquipped(character: CharacterState): CharacterState {
  const equipped = { ...(character.equipped as Partial<Record<EquipSlot, string>> & { feet?: string }) };
  delete equipped.feet;
  for (const slot of EQUIP_SLOTS) {
    const id = equipped[slot];
    if (!id) continue;
    const item = itemById(id);
    if (!item || item.slot !== slot || !character.inventory.includes(id)) {
      delete equipped[slot];
    }
  }
  return { ...character, equipped };
}

export function normalizeCharacter(
  raw: Partial<CharacterState> | undefined | null
): CharacterState {
  const base = createInitialCharacter();
  if (!raw) return base;
  const hasInventoryList = Array.isArray(raw.inventory);
  const merged: CharacterState = {
    ...base,
    ...raw,
    equipped: { ...(raw.equipped ?? {}) },
    inventory: hasInventoryList ? [...raw.inventory!] : base.inventory,
    pendingChests: Array.isArray(raw.pendingChests) ? raw.pendingChests : [],
    claimedFloorChests: Array.isArray(raw.claimedFloorChests)
      ? raw.claimedFloorChests.filter((d) => typeof d === "number")
      : [],
    claimedLevelRewards: Array.isArray(raw.claimedLevelRewards)
      ? raw.claimedLevelRewards
      : [],
    race: normalizeRace(raw.race ?? base.race),
    coins: typeof raw.coins === "number" ? raw.coins : base.coins,
  };
  const withStarters = ensureStarterInventory(merged);
  if (!hasInventoryList) {
    return { ...withStarters, equipped: { ...(raw.equipped ?? {}) } };
  }
  return sanitizeEquipped(withStarters);
}

export function normalizeSeasonFlame(
  raw: Partial<SeasonFlameState> | undefined | null
): SeasonFlameState {
  const base = createInitialSeasonFlame();
  if (!raw) return base;
  return {
    value:
      typeof raw.value === "number"
        ? Math.min(100, Math.max(0, raw.value))
        : base.value,
    lastTendedDate: raw.lastTendedDate ?? base.lastTendedDate,
    lastDailyVisitHealDate: raw.lastDailyVisitHealDate ?? base.lastDailyVisitHealDate ?? null,
  };
}
