import type { CycleTask, Goal, Sphere } from "@/types";

export function isSphereVisible(
  sphereId: string,
  hiddenSphereIds: string[]
): boolean {
  return !hiddenSphereIds.includes(sphereId);
}

export function filterGoalsByVisibleSpheres(
  goals: Goal[],
  hiddenSphereIds: string[]
): Goal[] {
  return goals.filter((g) => isSphereVisible(g.sphereId, hiddenSphereIds));
}

export function visibleSpheres(spheres: Sphere[], hiddenSphereIds: string[]): Sphere[] {
  return spheres.filter((s) => isSphereVisible(s.id, hiddenSphereIds));
}

export function groupWeekTasksByVisibleSpheres(
  tasks: CycleTask[],
  spheres: Sphere[],
  week: number,
  hiddenSphereIds: string[]
): { sphere: Sphere; tasks: CycleTask[] }[] {
  return visibleSpheres(spheres, hiddenSphereIds).map((sphere) => ({
    sphere,
    tasks: tasks.filter((t) => t.week === week && t.sphereId === sphere.id),
  }));
}

/** Блоки целей (сфер) для недели: всегда одна выбранная вкладка */
export function groupWeekTasksBySphere(
  tasks: CycleTask[],
  spheres: Sphere[],
  week: number,
  hiddenSphereIds: string[],
  filterSphereId: string
): { sphere: Sphere; tasks: CycleTask[] }[] {
  if (!filterSphereId) return [];
  const sphere = visibleSpheres(spheres, hiddenSphereIds).find((s) => s.id === filterSphereId);
  if (!sphere) return [];
  return [
    {
      sphere,
      tasks: tasks.filter((t) => t.week === week && t.sphereId === sphere.id),
    },
  ];
}

export function groupGoalsBySphereBlocks(
  goals: Goal[],
  spheres: Sphere[],
  hiddenSphereIds: string[]
): { sphere: Sphere; goals: Goal[] }[] {
  return visibleSpheres(spheres, hiddenSphereIds).map((sphere) => ({
    sphere,
    goals: goals.filter((g) => g.sphereId === sphere.id),
  }));
}
