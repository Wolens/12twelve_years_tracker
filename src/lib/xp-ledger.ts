import {
  XP_GOAL_COMPLETED,
  XP_TASK,
  XP_WEEK_CLOSED,
} from "@/lib/constants";
import { levelFromXp, updateStreak } from "@/lib/gamification";
import { isOnetimeComplete } from "@/lib/goals";
import { generateId } from "@/lib/utils";
import type { AppState, Goal, Profile, XpLedgerEntry } from "@/types";

export type LevelUpEvent = { from: number; to: number } | null;

export function xpSourceCycleTask(taskId: string): string {
  return `cycle_task:${taskId}`;
}

export function xpSourceOnetimeGoal(goalId: string): string {
  return `onetime_goal:${goalId}`;
}

export function xpSourceGoalComplete(goalId: string): string {
  return `goal_complete:${goalId}`;
}

export function xpSourceWeekClose(week: number): string {
  return `week_close:${week}`;
}

export function xpSourceHabit(habitId: string, dateISO: string): string {
  return `habit:${habitId}:${dateISO}`;
}

export function totalXpFromLedger(ledger: XpLedgerEntry[]): number {
  return Math.max(0, ledger.reduce((sum, e) => sum + e.amount, 0));
}

export function syncProfileFromLedger(profile: Profile): Profile {
  const ledger = profile.xpLedger ?? [];
  const xp = totalXpFromLedger(ledger);
  const level = levelFromXp(xp);
  return { ...profile, xp, level, xpLedger: ledger };
}

export function revokeXpBySource(profile: Profile, sourceId: string): Profile {
  const ledger = (profile.xpLedger ?? []).filter((e) => e.sourceId !== sourceId);
  return syncProfileFromLedger({ ...profile, xpLedger: ledger });
}

export function grantXp(
  profile: Profile,
  opts: {
    baseAmount: number;
    label: string;
    sourceId?: string;
    withStreak?: boolean;
  }
): { profile: Profile; levelUp: LevelUpEvent } {
  const oldLevel = levelFromXp(profile.xp);
  let streak = profile.streak;
  let lastActivityDate = profile.lastActivityDate;
  let bonus = 0;

  if (opts.withStreak && opts.baseAmount > 0) {
    const s = updateStreak(lastActivityDate, streak);
    streak = s.streak;
    lastActivityDate = s.lastActivityDate;
    bonus = s.bonusXp;
  }

  const amount = opts.baseAmount + bonus;
  let label = opts.label;
  if (bonus > 0) label = `${label} (+${bonus} streak)`;

  let ledger = [...(profile.xpLedger ?? [])];
  if (opts.sourceId) {
    ledger = ledger.filter((e) => e.sourceId !== opts.sourceId);
  }

  ledger.push({
    id: generateId(),
    at: new Date().toISOString(),
    amount,
    label,
    sourceId: opts.sourceId,
  });

  const updated = syncProfileFromLedger({
    ...profile,
    streak,
    lastActivityDate,
    xpLedger: ledger,
  });

  const levelUp: LevelUpEvent =
    updated.level > oldLevel ? { from: oldLevel, to: updated.level } : null;

  return { profile: updated, levelUp };
}

/** Пересобрать журнал из фактического прогресса (без streak-бонусов). */
export function rebuildLedgerFromState(state: {
  cycleTasks: AppState["cycleTasks"];
  weeks: AppState["weeks"];
  goals: Goal[];
}): XpLedgerEntry[] {
  const at = new Date().toISOString();
  const entries: XpLedgerEntry[] = [];

  for (const t of state.cycleTasks) {
    if (!t.done) continue;
    entries.push({
      id: generateId(),
      at,
      amount: XP_TASK,
      label: `Задача недели: ${t.title}`,
      sourceId: xpSourceCycleTask(t.id),
    });
  }

  for (const w of state.weeks) {
    if (!w.bonusAwarded) continue;
    entries.push({
      id: generateId(),
      at,
      amount: XP_WEEK_CLOSED,
      label: `Закрыта неделя ${w.number}`,
      sourceId: xpSourceWeekClose(w.number),
    });
  }

  for (const g of state.goals) {
    if (!g.completed && !isOnetimeComplete(g)) continue;
    if (g.type === "onetime" && isOnetimeComplete(g)) {
      entries.push({
        id: generateId(),
        at,
        amount: XP_TASK,
        label: `Разовая цель: ${g.title}`,
        sourceId: xpSourceOnetimeGoal(g.id),
      });
    } else if (g.completed && (g.type === "counter" || g.type === "metric")) {
      entries.push({
        id: generateId(),
        at,
        amount: XP_GOAL_COMPLETED,
        label: `Цель выполнена: ${g.title}`,
        sourceId: xpSourceGoalComplete(g.id),
      });
    }
  }

  return entries;
}

export function migrateProfileXp(
  profile: Profile | undefined,
  state: { cycleTasks: AppState["cycleTasks"]; weeks: AppState["weeks"]; goals: Goal[] },
  forceRebuild = false
): Profile {
  const base: Profile = {
    name: "Игрок",
    avatar: "🎯",
    xp: 0,
    level: 1,
    streak: 0,
    lastActivityDate: null,
    achievements: profile?.achievements ?? [],
    xpLedger: profile?.xpLedger ?? [],
    ...profile,
  };
  const ledger =
    forceRebuild || !base.xpLedger?.length
      ? rebuildLedgerFromState(state)
      : base.xpLedger;
  return syncProfileFromLedger({ ...base, xpLedger: ledger });
}

export function formatLedgerTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("ru-RU", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
