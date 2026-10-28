import type { CycleTask, DayAssignments, XpLedgerEntry } from "@/types";
import { goalsForDay } from "@/lib/day-plan";
import { cycleDayDate, CYCLE_DAYS } from "@/lib/rpg/day-route";
import { FLAME_DECAY_PER_MISSED_DAY, FLAME_RITUAL_GAIN } from "@/lib/rpg/season-flame";

export type DayState = "done" | "visited" | "missed" | "today" | "future";

/** Декор разреза. На задачи не влияет. */
export type FloorType = "cellar" | "living" | "hall" | "spire";

export interface TowerDay {
  day: number;
  date: string;
  week: number;
  state: DayState;
  /** Окно тёплое: в этот день отметили хотя бы одно дело. */
  lit: boolean;
  healthDelta?: number;
  tasksDone: number;
  tasksTotal: number;
  /** Сколько обжитых этажей уже под ногами, включая этот. */
  trail: number;
  floorType: FloorType;
}

export interface TowerWeek {
  week: number;
  days: TowerDay[];
  closed: boolean;
}

const MARK = /^(cycle_task:|onetime_goal:|goal_complete:|daily_quest:)/;

export function floorTypeForDay(day: number): FloorType {
  if (day <= 14) return "cellar";
  if (day <= 42) return "living";
  if (day <= 70) return "hall";
  return "spire";
}

export function stateLine(state: DayState, lit: boolean): string {
  if (state === "today") return lit ? "Сегодня. Здесь уже жили и делали" : "Сегодня";
  if (state === "done") return "Здесь жили и делали";
  if (state === "visited") return "Прошёл мимо";
  if (state === "missed") return "Этаж обрушен";
  return "Ещё не достроен";
}

function ledgerMarks(ledger: XpLedgerEntry[]) {
  const marked = new Set<string>();
  const ritual = new Set<string>();
  for (const entry of ledger) {
    const sourceId = entry.sourceId;
    if (!sourceId) continue;
    const date = entry.at.slice(0, 10);
    if (sourceId.startsWith("daily_ritual:")) ritual.add(date);
    if (entry.amount > 0 && MARK.test(sourceId)) marked.add(date);
  }
  return { marked, ritual };
}

export function buildTower(input: {
  start: string;
  today: string;
  ledger: XpLedgerEntry[];
  closed: boolean[];
  assignments: DayAssignments;
  tasks: CycleTask[];
}): { weeks: TowerWeek[]; days: TowerDay[] } {
  const taskById = new Map(input.tasks.map((task) => [task.id, task]));
  const { marked, ritual } = ledgerMarks(input.ledger);
  const days: TowerDay[] = [];
  let trail = 0;

  for (let index = 0; index < CYCLE_DAYS; index++) {
    const date = cycleDayDate(input.start, index);
    const week = Math.floor(index / 7) + 1;
    const weekday = (index % 7) + 1;
    const lit = marked.has(date);
    const visited = ritual.has(date);
    let state: DayState;
    if (date > input.today) state = "future";
    else if (date === input.today) state = "today";
    else if (lit) state = "done";
    else if (visited) state = "visited";
    else state = "missed";

    if (state === "done") trail += 1;

    const ids = goalsForDay(input.assignments, week, weekday);
    const tasksDone = ids.filter((id) => taskById.get(id)?.done).length;
    const healthDelta =
      state === "missed" ? -FLAME_DECAY_PER_MISSED_DAY : visited ? FLAME_RITUAL_GAIN : undefined;

    days.push({
      day: index + 1,
      date,
      week,
      state,
      lit,
      healthDelta,
      tasksDone,
      tasksTotal: ids.length,
      trail,
      floorType: floorTypeForDay(index + 1),
    });
  }

  const weeks: TowerWeek[] = Array.from({ length: 12 }, (_, index) => ({
    week: index + 1,
    days: days.slice(index * 7, index * 7 + 7),
    closed: input.closed[index] ?? false,
  }));

  return { weeks, days };
}

/** Пролёт наверх из этой недели сложен, если неделю закрыли. Первая неделя стоит на фундаменте. */
export function passageBuilt(week: number, closed: boolean[]) {
  if (week <= 1) return true;
  return closed[week - 2] ?? false;
}
