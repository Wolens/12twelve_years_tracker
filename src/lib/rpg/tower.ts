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
  /** Этаж, на котором герой. Он и есть «сегодня» в башне. */
  currentDay: number | null;
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
    const ids = goalsForDay(input.assignments, week, weekday);
    const tasksDone = ids.filter((id) => taskById.get(id)?.done).length;
    const tasksTotal = ids.length;
    const worked = lit || tasksDone > 0;
    const dayNumber = index + 1;
    const current = input.currentDay;

    let state: DayState;
    if (current !== null && dayNumber > current) state = "future";
    else if (current !== null && dayNumber === current) state = "today";
    else if (current === null && date > input.today) state = "future";
    else if (current === null && date === input.today) state = "today";
    else if (worked) state = "done";
    else if (visited) state = "visited";
    else state = "missed";

    if (state === "done") trail += 1;

    const healthDelta =
      state === "missed" ? -FLAME_DECAY_PER_MISSED_DAY : visited ? FLAME_RITUAL_GAIN : undefined;

    days.push({
      day: index + 1,
      date,
      week,
      state,
      lit: worked,
      healthDelta,
      tasksDone,
      tasksTotal,
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

/** Последний этаж рабочей недели. */
export function heroProgressCap(activeWeek: number): number {
  const week = Math.min(12, Math.max(1, activeWeek));
  return Math.min(CYCLE_DAYS, week * 7);
}

/**
 * Герой всегда на рабочей неделе (activeWeek), не на уже пройденной.
 * Календарь двигает его вперёд только до конца этой недели.
 */
export function heroStandDay(
  todayDay: number | null,
  activeWeek: number,
  activeDay: number
): number | null {
  const week = Math.min(12, Math.max(1, activeWeek));
  const dayInWeek = Math.min(7, Math.max(1, activeDay));
  const minFloor = (week - 1) * 7 + 1;
  const weekFloor = minFloor + dayInWeek - 1;
  const cap = heroProgressCap(week);
  const calendar = todayDay != null && todayDay >= 1 ? todayDay : minFloor;
  return Math.min(cap, Math.max(minFloor, weekFloor, Math.min(calendar, cap)));
}

/** Пролёт наверх из этой недели сложен, если неделю закрыли. Первая неделя стоит на фундаменте. */
export function passageBuilt(week: number, closed: boolean[]) {
  if (week <= 1) return true;
  return closed[week - 2] ?? false;
}
