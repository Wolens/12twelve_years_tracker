export type CharacterGender = "male" | "female";

export type RaceId =
  | "human"
  | "vampire"
  | "witch"
  | "fairy"
  | "jedi"
  | "knight"
  | "druid";

export type ItemRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export type EquipSlot = "head" | "torso" | "legs" | "weapon" | "charm";

export type GameItem = {
  id: string;
  name: string;
  slot: EquipSlot;
  rarity: ItemRarity;
  price: number;
  requiredLevel: number;
  healthBonus: number;
  strengthBonus: number;
  /** Lucide-style key for display */
  glyph: string;
};

export type PendingChest = {
  id: string;
  earnedAtLevel: number;
  tier: "mystery" | "rare" | "legendary";
};

export type CharacterState = {
  gender: CharacterGender | null;
  birthDate: string | null;
  race: RaceId;
  coins: number;
  inventory: string[];
  equipped: Partial<Record<EquipSlot, string>>;
  pendingChests: PendingChest[];
  /** Номера этажей (1…84), где уже открыт недельный сундук */
  claimedFloorChests: number[];
  claimedLevelRewards: number[];
  identitySetupDone: boolean;
};

export type SeasonFlameState = {
  /** 0–100, падает без «Открыть день» */
  value: number;
  lastTendedDate: string | null;
  /** Дата последнего бонуса +15% при первом заходе за день */
  lastDailyVisitHealDate?: string | null;
};

export const RACE_UNLOCK_LEVEL = 10;
