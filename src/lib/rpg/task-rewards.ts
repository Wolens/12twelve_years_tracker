import { XP_HABIT, XP_TASK } from "@/lib/constants";
import { COINS_PER_HABIT, COINS_PER_TASK } from "./coins";

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

export function previewHabitCompletionRewards(): { xp: number; coins: number } {
  return {
    xp: XP_HABIT,
    coins: COINS_PER_HABIT,
  };
}
