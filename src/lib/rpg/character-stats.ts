import type { CharacterState, RaceId } from "@/types/rpg";
import { RACE_UNLOCK_LEVEL } from "@/types/rpg";
import { itemById, normalizeRace, RACES } from "./catalog";

export type CharacterStats = {
  health: number;
  strength: number;
  maxHealth: number;
  maxStrength: number;
};

export function equipmentBonuses(character: CharacterState): {
  health: number;
  strength: number;
} {
  let health = 0;
  let strength = 0;
  for (const id of Object.values(character.equipped ?? {})) {
    if (!id) continue;
    const item = itemById(id);
    if (!item) continue;
    health += item.healthBonus;
    strength += item.strengthBonus;
  }
  return { health, strength };
}

export function computeCharacterStats(
  level: number,
  character: CharacterState,
  vitality = 100
): CharacterStats {
  const raceId = normalizeRace(character.race);
  const race = RACES[raceId];
  const eq = equipmentBonuses(character);
  let eqStr = eq.strength;
  if (raceId === "knight") {
    eqStr = Math.round(eqStr * 1.25);
  }

  const maxHealth = 40 + level * 6 + race.healthMod + eq.health;
  const maxStrength = 8 + level * 2 + race.strengthMod + eqStr;
  const factor = Math.min(100, Math.max(0, vitality)) / 100;

  return {
    health: Math.max(0, Math.round(maxHealth * factor)),
    strength: maxStrength,
    maxHealth,
    maxStrength,
  };
}

export function canSelectRace(level: number): boolean {
  return level >= RACE_UNLOCK_LEVEL;
}

export function raceOptionsForLevel(level: number): RaceId[] {
  if (!canSelectRace(level)) return ["human"];
  return Object.keys(RACES) as RaceId[];
}
