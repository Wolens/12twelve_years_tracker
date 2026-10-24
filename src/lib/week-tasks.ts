import type { CycleTask, Goal } from "@/types";

export function groupTasksByGoal(
  tasks: CycleTask[],
  goals: Goal[]
): { goal: Goal | null; tasks: CycleTask[] }[] {
  const map = new Map<string, CycleTask[]>();
  const orphan: CycleTask[] = [];

  for (const t of tasks) {
    const goal = goals.find((g) => g.id === t.goalId);
    if (!goal) {
      orphan.push(t);
      continue;
    }
    const list = map.get(t.goalId) ?? [];
    list.push(t);
    map.set(t.goalId, list);
  }

  const groups: { goal: Goal | null; tasks: CycleTask[] }[] = goals
    .filter((g) => map.has(g.id))
    .map((goal) => ({ goal, tasks: map.get(goal.id)! }));

  if (orphan.length > 0) {
    groups.push({ goal: null, tasks: orphan });
  }

  return groups;
}
