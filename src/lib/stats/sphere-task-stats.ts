import type { CycleTask } from "@/types";

export type SphereTaskStats = {
  sphereId: string;
  done: number;
  total: number;
  percent: number;
};

export function sphereTaskStats(
  cycleTasks: CycleTask[],
  sphereId: string,
  week?: number
): SphereTaskStats {
  let list = cycleTasks.filter((t) => t.sphereId === sphereId);
  if (week !== undefined) list = list.filter((t) => t.week === week);
  const total = list.length;
  const done = list.filter((t) => t.done).length;
  return {
    sphereId,
    done,
    total,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
  };
}

export function allSphereTaskStats(
  cycleTasks: CycleTask[],
  sphereIds: string[],
  week?: number
): SphereTaskStats[] {
  return sphereIds.map((id) => sphereTaskStats(cycleTasks, id, week));
}
