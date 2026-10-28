import type { AppState, CycleTask, Goal, Sphere, WeekData, XpLedgerEntry } from "@/types";
import { resolveSphereFilterId } from "./sphere-filter-default";

/** Есть ли у пользователя реальный прогресс (не пустой гость). */
export function hasUserProgress(state: AppState): boolean {
  if (state.goals.length > 0) return true;
  if (state.cycleTasks.length > 0) return true;
  if (state.weeks.some((w) => w.closed || w.bonusAwarded)) return true;
  if ((state.profile.xpLedger?.length ?? 0) > 0) return true;
  if (state.profile.xp > 0 && state.onboardingComplete) return true;
  return false;
}

export function orphanSphereIds(state: Pick<AppState, "spheres" | "goals" | "cycleTasks">): string[] {
  const known = new Set(state.spheres.map((s) => s.id));
  const orphan = new Set<string>();
  for (const g of state.goals) {
    if (!known.has(g.sphereId)) orphan.add(g.sphereId);
  }
  for (const t of state.cycleTasks) {
    if (!known.has(t.sphereId)) orphan.add(t.sphereId);
  }
  return Array.from(orphan);
}

export function stateNeedsRepair(
  state: Pick<AppState, "spheres" | "goals" | "cycleTasks">
): boolean {
  return orphanSphereIds(state).length > 0;
}

/** Вернуть сферы для целей/задач, у которых пропали записи в spheres. */
export function recoverMissingSpheres(
  spheres: Sphere[],
  orphanIds: string[]
): Sphere[] {
  if (orphanIds.length === 0) return spheres;
  const next = [...spheres];
  let n = 0;
  for (const id of orphanIds) {
    n += 1;
    next.push({
      id,
      name: `Сфера ${n} (восстановлено)`,
      icon: "custom",
      color: "#94a3b8",
      custom: true,
    });
  }
  return next;
}

export function recoverWeeksFromLedger(
  weeks: WeekData[],
  ledger: XpLedgerEntry[] | undefined
): WeekData[] {
  const closed = new Set<number>();
  for (const e of ledger ?? []) {
    const m = e.sourceId?.match(/^week_close:(\d+)$/);
    if (m) closed.add(parseInt(m[1], 10));
  }
  if (closed.size === 0) return weeks;
  return weeks.map((w) =>
    closed.has(w.number)
      ? { ...w, closed: true, bonusAwarded: true }
      : w
  );
}

/** Чем больше — тем «богаче» снимок (для выбора при синхронизации). */
export function appStateRichness(state: AppState | null | undefined): number {
  if (!state) return 0;
  let score = 0;
  score += state.goals.length * 10;
  score += state.cycleTasks.length * 2;
  score += state.spheres.length;
  score += state.weeks.filter((w) => w.closed || w.bonusAwarded).length * 8;
  score += (state.profile.xpLedger?.length ?? 0) * 3;
  if (state.onboardingComplete) score += 5;
  score += orphanSphereIds(state).length * -15;
  return score;
}

function recoverTasksFromLedger(
  tasks: CycleTask[],
  ledger: XpLedgerEntry[] | undefined
): CycleTask[] {
  const doneIds = new Set<string>();
  for (const e of ledger ?? []) {
    const m = e.sourceId?.match(/^cycle_task:(.+)$/);
    if (m) doneIds.add(m[1]);
  }
  if (doneIds.size === 0) return tasks;
  return tasks.map((t) => (doneIds.has(t.id) ? { ...t, done: true } : t));
}

function recoverGoalsFromLedger(
  goals: Goal[],
  ledger: XpLedgerEntry[] | undefined
): Goal[] {
  const completed = new Set<string>();
  const onetimeDone = new Set<string>();
  for (const e of ledger ?? []) {
    let m = e.sourceId?.match(/^goal_complete:(.+)$/);
    if (m) completed.add(m[1]);
    m = e.sourceId?.match(/^onetime_goal:(.+)$/);
    if (m) onetimeDone.add(m[1]);
  }
  if (completed.size === 0 && onetimeDone.size === 0) return goals;
  return goals.map((g) => {
    if (completed.has(g.id)) {
      return { ...g, completed: true };
    }
    if (onetimeDone.has(g.id)) {
      return { ...g, done: true };
    }
    return g;
  });
}

export function repairAppState(state: AppState): AppState {
  const orphans = orphanSphereIds(state);
  let next: AppState = { ...state };

  if (orphans.length > 0) {
    next = {
      ...next,
      spheres: recoverMissingSpheres(next.spheres, orphans),
    };
  }

  next = {
    ...next,
    weeks: recoverWeeksFromLedger(next.weeks, next.profile.xpLedger),
    cycleTasks: recoverTasksFromLedger(next.cycleTasks, next.profile.xpLedger),
    goals: recoverGoalsFromLedger(next.goals, next.profile.xpLedger),
  };

  if (hasUserProgress(next) && !next.onboardingComplete) {
    next = { ...next, onboardingComplete: true };
  }

  const closedWeeks = next.weeks.filter((w) => w.closed).map((w) => w.number);
  if (closedWeeks.length > 0 && next.activeWeek === 1) {
    const maxClosed = Math.max(...closedWeeks);
    next = {
      ...next,
      activeWeek: Math.min(12, Math.max(next.activeWeek, maxClosed + 1)),
    };
  }

  return {
    ...next,
    weekFilterSphereId: resolveSphereFilterId(next.spheres, next.weekFilterSphereId),
    goalsFilterSphereId: resolveSphereFilterId(next.spheres, next.goalsFilterSphereId),
  };
}
