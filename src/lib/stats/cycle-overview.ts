import type { CycleTask, WeekData } from "@/types";
import { closedWeeksCount, weekTacticalPercent } from "@/lib/week-momentum";

export type CycleOverview = {
  totalTasks: number;
  doneTasks: number;
  taskPercent: number;
  closedWeeks: number;
  activeWeek: number;
  activeWeekTactical: number;
};

export function computeCycleOverview(
  cycleTasks: CycleTask[],
  weeks: WeekData[],
  activeWeek: number
): CycleOverview {
  const totalTasks = cycleTasks.length;
  const doneTasks = cycleTasks.filter((t) => t.done).length;
  const taskPercent =
    totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  return {
    totalTasks,
    doneTasks,
    taskPercent,
    closedWeeks: closedWeeksCount(weeks),
    activeWeek,
    activeWeekTactical: weekTacticalPercent(cycleTasks, activeWeek),
  };
}

export type WeekStatRow = {
  week: number;
  closed: boolean;
  tacticalPercent: number;
  done: number;
  total: number;
};

export function weekStatsRows(
  cycleTasks: CycleTask[],
  weeks: WeekData[]
): WeekStatRow[] {
  return weeks.map((w) => {
    const tasks = cycleTasks.filter((t) => t.week === w.number);
    const done = tasks.filter((t) => t.done).length;
    return {
      week: w.number,
      closed: w.closed,
      tacticalPercent: weekTacticalPercent(cycleTasks, w.number),
      done,
      total: tasks.length,
    };
  });
}
