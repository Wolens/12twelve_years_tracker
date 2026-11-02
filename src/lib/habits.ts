import type { Habit, HabitCompletions, HabitSchedule } from "@/types";
import { formatLocalISO, weekDateRange } from "@/lib/gamification";

/** 1 = понедельник … 7 = воскресенье */
export function isoWeekday(dateISO: string): number {
  const d = new Date(`${dateISO}T12:00:00`);
  const js = d.getDay();
  return js === 0 ? 7 : js;
}

export function addDaysISO(dateISO: string, delta: number): string {
  const d = new Date(`${dateISO}T12:00:00`);
  d.setDate(d.getDate() + delta);
  return formatLocalISO(d);
}

export function isHabitDueOnSchedule(schedule: HabitSchedule, dateISO: string): boolean {
  if (schedule.kind === "daily") return true;
  const wd = isoWeekday(dateISO);
  return schedule.weekdays.includes(wd);
}

export function isHabitDueOn(habit: Habit, dateISO: string): boolean {
  if (habit.archived) return false;
  return isHabitDueOnSchedule(habit.schedule, dateISO);
}

export function habitsDueOn(
  habits: Habit[],
  dateISO: string,
  opts?: { sphereId?: string }
): Habit[] {
  return habits.filter((h) => {
    if (!isHabitDueOn(h, dateISO)) return false;
    if (opts?.sphereId && h.sphereId !== opts.sphereId) return false;
    return true;
  });
}

export function getHabitCount(
  completions: HabitCompletions,
  dateISO: string,
  habitId: string
): number {
  const n = completions[dateISO]?.[habitId];
  return typeof n === "number" && n > 0 ? n : 0;
}

export function isCompleted(
  completions: HabitCompletions,
  dateISO: string,
  habitId: string
): boolean {
  return getHabitCount(completions, dateISO, habitId) >= 1;
}

export function adjustHabitCount(
  completions: HabitCompletions,
  dateISO: string,
  habitId: string,
  delta: number
): HabitCompletions {
  if (delta === 0) return completions;
  const prev = getHabitCount(completions, dateISO, habitId);
  const nextCount = Math.max(0, prev + delta);
  const next = { ...completions };
  const day = { ...(next[dateISO] ?? {}) };
  if (nextCount === 0) {
    delete day[habitId];
  } else {
    day[habitId] = nextCount;
  }
  if (Object.keys(day).length === 0) delete next[dateISO];
  else next[dateISO] = day;
  return next;
}

/** Сумма всех отметок (для snapshot синхронизации ачивок). */
export function totalMarksForSnapshot(completions: HabitCompletions): number {
  let sum = 0;
  for (const date of Object.keys(completions)) {
    const day = completions[date];
    if (!day) continue;
    for (const n of Object.values(day)) {
      if (typeof n === "number" && n > 0) sum += n;
    }
  }
  return sum;
}

export function habitStreak(
  habit: Habit,
  completions: HabitCompletions,
  fromDateISO: string,
  maxDays = 120
): number {
  let streak = 0;
  for (let i = 0; i < maxDays; i++) {
    const date = addDaysISO(fromDateISO, -i);
    if (!isHabitDueOn(habit, date)) continue;
    if (!isCompleted(completions, date, habit.id)) {
      if (i === 0) return 0;
      break;
    }
    streak += 1;
  }
  return streak;
}

export function completionRate(
  habit: Habit,
  completions: HabitCompletions,
  lastNDays: number,
  endDateISO: string
): { done: number; due: number; percent: number } {
  const dates: string[] = [];
  for (let i = lastNDays - 1; i >= 0; i--) {
    dates.push(addDaysISO(endDateISO, -i));
  }
  return completionRateForDates(habit, completions, dates);
}

export function weekDates(cycleStartDate: string, weekNumber: number): string[] {
  const { start } = weekDateRange(cycleStartDate, weekNumber);
  return Array.from({ length: 7 }, (_, i) => addDaysISO(start, i));
}

export function completionRateForDates(
  habit: Habit,
  completions: HabitCompletions,
  dates: string[]
): { done: number; due: number; percent: number } {
  let done = 0;
  let due = 0;
  for (const date of dates) {
    if (!isHabitDueOn(habit, date)) continue;
    due += 1;
    if (isCompleted(completions, date, habit.id)) done += 1;
  }
  const percent = due > 0 ? Math.round((done / due) * 100) : 0;
  return { done, due, percent };
}

/** Сумма count за период (объём, напр. стаканы воды). */
export function totalCountForDates(
  habit: Habit,
  completions: HabitCompletions,
  dates: string[]
): number {
  let sum = 0;
  for (const date of dates) {
    if (!isHabitDueOn(habit, date)) continue;
    sum += getHabitCount(completions, date, habit.id);
  }
  return sum;
}

export function pruneHabitCompletions(
  completions: HabitCompletions,
  validHabitIds: Set<string>
): HabitCompletions {
  const out: HabitCompletions = {};
  for (const [date, day] of Object.entries(completions)) {
    if (!day || typeof day !== "object") continue;
    const filtered: Record<string, number> = {};
    for (const [habitId, count] of Object.entries(day)) {
      if (!validHabitIds.has(habitId)) continue;
      const n = typeof count === "number" ? count : Number(count);
      if (Number.isFinite(n) && n > 0) filtered[habitId] = Math.floor(n);
    }
    if (Object.keys(filtered).length > 0) out[date] = filtered;
  }
  return out;
}

export const WEEKDAY_LABELS: Record<number, string> = {
  1: "Пн",
  2: "Вт",
  3: "Ср",
  4: "Чт",
  5: "Пт",
  6: "Сб",
  7: "Вс",
};
