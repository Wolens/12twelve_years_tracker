import type { CharacterState, RaceId } from "@/types/rpg";

export function adjustCoins(
  character: CharacterState,
  delta: number,
  race: RaceId = character.race
): CharacterState {
  if (delta === 0) return character;
  let amount = delta;
  if (amount > 0 && race === "human") {
    amount = Math.round(amount * 1.05);
  }
  return {
    ...character,
    coins: Math.max(0, character.coins + amount),
  };
}
