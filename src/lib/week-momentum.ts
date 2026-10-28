import type { CycleTask, WeekData } from "@/types";

/** Доля выполненных задач активной недели (0–100). */
export function weekTacticalPercent(
  cycleTasks: CycleTask[],
  week: number
): number {
  const tasks = cycleTasks.filter((t) => t.week === week);
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.done).length;
  return Math.round((done / tasks.length) * 100);
}

export function weekMomentumLabel(percent: number): string {
  if (percent >= 85) return "Сезонный темп";
  if (percent >= 60) return "Хороший ход";
  if (percent >= 35) return "Разгоняемся";
  if (percent > 0) return "Старт недели";
  return "Поставь задачи";
}

export const WEEK_TARGET_PERCENT = 85;

export function closedWeeksCount(weeks: WeekData[]): number {
  return weeks.filter((w) => w.closed || w.bonusAwarded).length;
}
