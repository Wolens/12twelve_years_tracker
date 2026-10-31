import type { CycleTask, DayAssignments } from "@/types";
import { goalsForDay, parseDayPlanKey } from "@/lib/day-plan";

/** 1 = Пн … 7 = Вс (как activeDay в цикле) */
export const PLAN_DAY_SHORT = ["", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as const;

export function planDayLabel(planDay?: number): string | null {
  if (planDay == null || planDay < 1 || planDay > 7) return null;
  return PLAN_DAY_SHORT[planDay] ?? null;
}

export function sortCycleTasksByPlanDay(tasks: CycleTask[]): CycleTask[] {
  return [...tasks].sort((a, b) => {
    const da = a.planDay ?? 99;
    const db = b.planDay ?? 99;
    if (da !== db) return da - db;
    return a.title.localeCompare(b.title, "ru");
  });
}

/** Задачи на день недели цикла: planDay или legacy dayAssignments */
export function cycleTasksForWeekDay(
  cycleTasks: CycleTask[],
  assignments: DayAssignments,
  week: number,
  day: number
): CycleTask[] {
  const byPlan = cycleTasks.filter(
    (t) => t.week === week && t.planDay === day
  );
  const legacyIds = new Set(goalsForDay(assignments, week, day));
  const seen = new Set(byPlan.map((t) => t.id));
  for (const t of cycleTasks) {
    if (t.week !== week || !legacyIds.has(t.id) || t.planDay != null) continue;
    if (!seen.has(t.id)) {
      byPlan.push(t);
      seen.add(t.id);
    }
  }
  return sortCycleTasksByPlanDay(byPlan);
}

export function migratePlanDayFromAssignments(
  cycleTasks: CycleTask[],
  assignments: DayAssignments
): CycleTask[] {
  const taskToDay = new Map<string, number>();
  for (const [key, ids] of Object.entries(assignments)) {
    const parsed = parseDayPlanKey(key);
    if (!parsed) continue;
    for (const id of ids) {
      if (!taskToDay.has(id)) taskToDay.set(id, parsed.day);
    }
  }
  if (taskToDay.size === 0) return cycleTasks;
  return cycleTasks.map((t) => {
    const day = taskToDay.get(t.id);
    if (day == null || t.planDay != null) return t;
    return { ...t, planDay: day };
  });
}
