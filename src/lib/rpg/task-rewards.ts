import { XP_TASK } from "@/lib/constants";
import { COINS_PER_TASK } from "./coins";

export function previewTaskCompletionRewards(
  _level: number,
  _character: unknown,
  _vitality: number
): { xp: number; coins: number } {
  return {
    xp: XP_TASK,
    coins: COINS_PER_TASK,
  };
}
