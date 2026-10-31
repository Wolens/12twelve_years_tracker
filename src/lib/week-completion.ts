import type { CycleTask } from "@/types";

export function cycleTasksForWeek(cycleTasks: CycleTask[], week: number): CycleTask[] {
  return cycleTasks.filter((t) => t.week === week);
}

export function weekTasksAllDone(cycleTasks: CycleTask[], week: number): boolean {
  const tasks = cycleTasksForWeek(cycleTasks, week);
  if (tasks.length === 0) return true;
  return tasks.every((t) => t.done);
}

export function incompleteWeekTasks(cycleTasks: CycleTask[], week: number): CycleTask[] {
  return cycleTasksForWeek(cycleTasks, week).filter((t) => !t.done);
}
