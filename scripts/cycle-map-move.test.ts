/**
 * Smoke test: перенос planDay между неделями в dayAssignments.
 * Run: npx tsx scripts/cycle-map-move.test.ts
 */
import { assignGoalToDay, removeGoalFromWeekPlan } from "../src/lib/day-plan";
import { groupCycleTasksByWeekForSphere } from "../src/lib/cycle-map";
import type { CycleTask } from "../src/types";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

let assignments = assignGoalToDay({}, 2, 3, "task-1");
assignments = removeGoalFromWeekPlan(assignments, 2, "task-1");
assignments = assignGoalToDay(assignments, 5, 3, "task-1");
assert(
  assignments["5-3"]?.includes("task-1") === true,
  "task should appear on week 5 day 3"
);
assert(
  !assignments["2-3"]?.includes("task-1"),
  "task should be removed from week 2"
);

const tasks: CycleTask[] = [
  {
    id: "a",
    sphereId: "s1",
    week: 1,
    title: "One",
    done: false,
  },
  {
    id: "b",
    sphereId: "s1",
    week: 3,
    title: "Two",
    done: false,
    planDay: 2,
  },
  {
    id: "c",
    sphereId: "s2",
    week: 1,
    title: "Other",
    done: false,
  },
];
const grouped = groupCycleTasksByWeekForSphere(tasks, "s1");
assert(grouped.get(1)?.length === 1, "week 1 has one task for s1");
assert(grouped.get(3)?.length === 1, "week 3 has one task for s1");
assert((grouped.get(2)?.length ?? 0) === 0, "week 2 empty");

console.log("cycle-map-move.test.ts: ok");
