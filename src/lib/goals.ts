import type { CycleTask, Goal, IncrementEntry, MeasurementEntry } from "@/types";

export function counterProgress(goal: Goal): number {
  if (goal.type !== "counter" || !goal.increments) return 0;
  return goal.increments.reduce((s, i) => s + i.amount, 0);
}

export function counterRemaining(goal: Goal): number {
  const target = goal.targetCount ?? 0;
  return Math.max(0, target - counterProgress(goal));
}

export function counterPercent(goal: Goal): number {
  const target = goal.targetCount ?? 1;
  return Math.min(100, (counterProgress(goal) / target) * 100);
}

export function isCounterComplete(goal: Goal): boolean {
  return counterProgress(goal) >= (goal.targetCount ?? 0);
}

export function metricProgressPercent(goal: Goal): number {
  if (goal.type !== "metric") return 0;
  const start = goal.startValue ?? 0;
  const target = goal.targetValue ?? start;
  const current = goal.currentValue ?? start;
  const total = Math.abs(target - start);
  if (total === 0) return 100;
  const done = Math.abs(current - start);
  return Math.min(100, (done / total) * 100);
}

export function isMetricComplete(goal: Goal): boolean {
  if (goal.type !== "metric") return false;
  const current = goal.currentValue ?? goal.startValue ?? 0;
  const target = goal.targetValue ?? 0;
  if (goal.direction === "down") return current <= target;
  return current >= target;
}

export function isOnetimeComplete(goal: Goal): boolean {
  return goal.type === "onetime" && (goal.done === true || goal.completed === true);
}

export function isGoalComplete(goal: Goal): boolean {
  if (goal.type === "counter") return isCounterComplete(goal);
  if (goal.type === "metric") return isMetricComplete(goal);
  return isOnetimeComplete(goal);
}

export function isTaskDone(task: CycleTask): boolean {
  return task.done;
}

export function onetimeStats(goals: Goal[]): {
  total: number;
  completed: number;
} {
  const list = goals.filter((g) => g.type === "onetime");
  return {
    total: list.length,
    completed: list.filter(isOnetimeComplete).length,
  };
}

export function metricCurrentValue(goal: Goal): number {
  if (goal.type !== "metric") return 0;
  const fromList = metricValueFromMeasurements(goal);
  if (fromList !== null) return fromList;
  if (goal.currentValue !== undefined) return goal.currentValue;
  return goal.startValue ?? 0;
}

/** Последний замер в журнале или старт, если журнал пуст */
export function metricValueFromMeasurements(goal: Goal): number | null {
  if (goal.type !== "metric") return null;
  const list = goal.measurements ?? [];
  if (list.length === 0) return null;
  return list[list.length - 1].value;
}

export function metricCurrentAfterRemoving(
  measurements: MeasurementEntry[],
  startValue: number
): number {
  if (measurements.length === 0) return startValue;
  return measurements[measurements.length - 1].value;
}

/** Изменение от стартового значения цели (не от первого замера) */
export function metricDeltaFromStart(goal: Goal): number | null {
  if (goal.type !== "metric") return null;
  const start = goal.startValue;
  if (start === undefined) return null;
  const current = metricCurrentValue(goal);
  if (!goal.measurements?.length && current === start) return null;
  return current - start;
}

export function metricDeltaSinceLast(goal: Goal): number | null {
  if (goal.type !== "metric" || !goal.measurements || goal.measurements.length < 2)
    return null;
  const m = goal.measurements;
  return m[m.length - 1].value - m[m.length - 2].value;
}

/** @deprecated используйте metricDeltaFromStart */
export function metricDelta(goal: Goal): number | null {
  return metricDeltaFromStart(goal);
}

export function aggregateIncrementsByDay(
  increments: IncrementEntry[]
): { date: string; amount: number; cumulative: number }[] {
  const byDay = new Map<string, number>();
  for (const inc of increments) {
    byDay.set(inc.date, (byDay.get(inc.date) ?? 0) + inc.amount);
  }
  const sorted = Array.from(byDay.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  );
  let cumulative = 0;
  return sorted.map(([date, amount]) => {
    cumulative += amount;
    return { date, amount, cumulative };
  });
}

export function tasksForWeek(tasks: CycleTask[], week: number): CycleTask[] {
  return tasks.filter((t) => t.week === week);
}
