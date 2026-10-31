import type { AppState, CycleTask } from "@/types";
import { getCurrentDayInWeek, getCurrentWeekNumber } from "@/lib/gamification";
import { incompleteWeekTasks } from "@/lib/week-completion";

export type CalendarPosition = { week: number; day: number };

export function calendarPosition(cycleStartDate: string): CalendarPosition {
  const week = getCurrentWeekNumber(cycleStartDate);
  const day = getCurrentDayInWeek(cycleStartDate, week);
  return { week, day };
}

/** Рабочая неделя и день — как в «12 недель» и на башне (не календарь от cycleStartDate). */
export function workingCyclePosition(activeWeek: number, activeDay: number): CalendarPosition {
  return {
    week: Math.min(12, Math.max(1, activeWeek)),
    day: Math.min(7, Math.max(1, activeDay)),
  };
}

export type WeekRolloverPrompt = {
  /** Неделя, с которой «перескочили» по календарю. */
  week: number;
  incompleteTaskIds: string[];
  targetWeek: number;
  targetDay: number;
};

/** Нужно ли подтянуть activeWeek/activeDay к календарю цикла. */
export function detectCalendarDrift(state: Pick<AppState, "cycleStartDate" | "activeWeek" | "activeDay">): {
  targetWeek: number;
  targetDay: number;
  needsUpdate: boolean;
} {
  const { week: targetWeek, day: targetDay } = calendarPosition(state.cycleStartDate);
  const needsUpdate =
    targetWeek > state.activeWeek ||
    (targetWeek === state.activeWeek && targetDay > state.activeDay);
  return { targetWeek, targetDay, needsUpdate };
}

export function buildWeekRolloverPrompt(
  cycleTasks: CycleTask[],
  fromWeek: number,
  toWeek: number,
  targetDay: number
): WeekRolloverPrompt | null {
  const incomplete = incompleteWeekTasks(cycleTasks, fromWeek);
  if (incomplete.length === 0) return null;
  return {
    week: fromWeek,
    incompleteTaskIds: incomplete.map((t) => t.id),
    targetWeek: toWeek,
    targetDay,
  };
}

export function moveTasksToWeek(cycleTasks: CycleTask[], taskIds: string[], week: number): CycleTask[] {
  const ids = new Set(taskIds);
  return cycleTasks.map((t) => (ids.has(t.id) ? { ...t, week } : t));
}
