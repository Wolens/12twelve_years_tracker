import type { RaceId, SeasonFlameState } from "@/types/rpg";
import { todayISO, daysBetween } from "@/lib/gamification";
import { normalizeRace } from "@/lib/rpg/catalog";

export const FLAME_MAX = 100;
export const FLAME_DECAY_PER_MISSED_DAY = 22;
export const FLAME_RITUAL_GAIN = 18;
/** @deprecated Задачи больше не лечат seasonFlame; оставлено для отката отметки. */
export const FLAME_TASK_HEAL = 10;
export const FLAME_DRUID_TASK_BONUS = 5;
export const FLAME_CRITICAL = 30;
export const COINS_LOST_PER_FLAME_DAY = 8;
/** Восстановление при первом заходе в приложение за день (если не 100%). */
export const FLAME_DAILY_FIRST_VISIT_HEAL = 15;

export function tendFlame(state: SeasonFlameState, race: RaceId = "human"): SeasonFlameState {
  const today = todayISO();
  const gain =
    normalizeRace(race) === "witch" ? Math.round(FLAME_RITUAL_GAIN * 1.75) : FLAME_RITUAL_GAIN;
  return {
    value: Math.min(FLAME_MAX, state.value + gain),
    lastTendedDate: today,
  };
}

/** Вызывать при загрузке приложения: штраф за пропущенные дни без ритуала. */
export function applyFlameDecay(
  flame: SeasonFlameState,
  lastRitualDate: string | null | undefined,
  race: RaceId = "human"
): { flame: SeasonFlameState; missedDays: number; coinsPenalty: number } {
  const today = todayISO();
  const ritual = lastRitualDate || null;
  const tended = flame.lastTendedDate || null;
  const anchor = ritual && tended ? (ritual > tended ? ritual : tended) : ritual ?? tended;
  if (!anchor) {
    return { flame, missedDays: 0, coinsPenalty: 0 };
  }
  if (anchor >= today) {
    return { flame, missedDays: 0, coinsPenalty: 0 };
  }

  const gap = daysBetween(anchor, today);
  if (gap <= 0) {
    return { flame, missedDays: 0, coinsPenalty: 0 };
  }

  const missedDays = gap;
  const id = normalizeRace(race);
  let decay = FLAME_DECAY_PER_MISSED_DAY * missedDays;
  if (id === "vampire") decay = Math.round(decay * 0.5);
  let newValue = Math.max(0, flame.value - decay);
  if (id === "fairy") newValue = Math.max(25, newValue);
  const coinsPenalty = 0;

  return {
    flame: { ...flame, value: newValue, lastTendedDate: today },
    missedDays,
    coinsPenalty,
  };
}

export function flameStatus(value: number): "bright" | "low" | "out" {
  if (value <= 0) return "out";
  if (value < FLAME_CRITICAL) return "low";
  return "bright";
}

export function flameLabel(value: number): string {
  const s = flameStatus(value);
  if (s === "out") return "Затих";
  if (s === "low") return "Тихий";
  return "Ровный";
}

export function applyDailyFirstVisitHeal(flame: SeasonFlameState): SeasonFlameState {
  const today = todayISO();
  if (flame.lastDailyVisitHealDate === today) return flame;
  const nextMeta = { ...flame, lastDailyVisitHealDate: today };
  if (flame.value >= FLAME_MAX) return nextMeta;
  const gain = Math.min(FLAME_DAILY_FIRST_VISIT_HEAL, FLAME_MAX - flame.value);
  return { ...nextMeta, value: flame.value + gain };
}

/** Задачи не меняют seasonFlame (здоровье — только первый заход за день и ритуал). */
export function taskFlameDelta(
  _completing: boolean,
  _currentValue: number,
  _race: RaceId = "human"
): number {
  return 0;
}
