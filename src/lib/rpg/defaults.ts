import type { CharacterState, SeasonFlameState } from "@/types/rpg";

export function createInitialCharacter(): CharacterState {
  return {
    gender: null,
    birthDate: null,
    race: "human",
    coins: 8,
    inventory: ["tunic_worn", "pants_worn"],
    equipped: { torso: "tunic_worn", legs: "pants_worn" },
    pendingChests: [],
    claimedFloorChests: [],
    claimedLevelRewards: [],
    identitySetupDone: false,
  };
}

export function createInitialSeasonFlame(): SeasonFlameState {
  return { value: 100, lastTendedDate: null, lastDailyVisitHealDate: null };
}
