import type { CycleTask } from "@/types";
import { sortCycleTasksByPlanDay } from "@/lib/cycle-task-plan";

/** Задачи одной сферы, сгруппированные по неделям 1–12. */
export function groupCycleTasksByWeekForSphere(
  cycleTasks: CycleTask[],
  sphereId: string
): Map<number, CycleTask[]> {
  const map = new Map<number, CycleTask[]>();
  for (let w = 1; w <= 12; w++) map.set(w, []);
  if (!sphereId) return map;
  for (const t of cycleTasks) {
    if (t.sphereId !== sphereId || t.week < 1 || t.week > 12) continue;
    const list = map.get(t.week)!;
    list.push(t);
  }
  for (let w = 1; w <= 12; w++) {
    map.set(w, sortCycleTasksByPlanDay(map.get(w)!));
  }
  return map;
}
