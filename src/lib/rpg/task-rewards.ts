import { XP_HABIT_TICK, XP_TASK } from "@/lib/constants";
import { COINS_PER_HABIT_TICK, COINS_PER_TASK } from "./coins";

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
    xp: XP_HABIT_TICK,
    coins: COINS_PER_HABIT_TICK,
  };
}
