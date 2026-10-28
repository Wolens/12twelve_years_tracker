import type { WeekData } from "@/types";

/** Сдвигает activeWeek вперёд, если текущая неделя уже закрыта (бонус получен). */
export function normalizeActiveWeek(
  weeks: WeekData[],
  activeWeek: number
): number {
  let w = Math.min(12, Math.max(1, activeWeek));
  while (w < 12) {
    const data = weeks.find((x) => x.number === w);
    if (data?.bonusAwarded) w += 1;
    else break;
  }
  return w;
}
