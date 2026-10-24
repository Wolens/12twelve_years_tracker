import type { DayAssignments } from "@/types";

export function dayPlanKey(week: number, day: number): string {
  return `${week}-${day}`;
}

export function parseDayPlanKey(key: string): { week: number; day: number } | null {
  const [w, d] = key.split("-").map(Number);
  if (!w || !d || d < 1 || d > 7) return null;
  return { week: w, day: d };
}

export function goalsForDay(
  assignments: DayAssignments,
  week: number,
  day: number
): string[] {
  return assignments[dayPlanKey(week, day)] ?? [];
}

export function removeGoalFromWeekPlan(
  assignments: DayAssignments,
  week: number,
  goalId: string
): DayAssignments {
  const next: DayAssignments = { ...assignments };
  for (let day = 1; day <= 7; day++) {
    const key = dayPlanKey(week, day);
    if (!next[key]) continue;
    next[key] = next[key].filter((id) => id !== goalId);
  }
  return next;
}

export function assignGoalToDay(
  assignments: DayAssignments,
  week: number,
  day: number,
  goalId: string
): DayAssignments {
  let next = removeGoalFromWeekPlan(assignments, week, goalId);
  const key = dayPlanKey(week, day);
  next = { ...next, [key]: [...(next[key] ?? []), goalId] };
  return next;
}
