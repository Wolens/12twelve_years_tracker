import type { AppState, CycleTask, Goal } from "@/types";
import { DATA_VERSION } from "@/types";
import { generateId } from "./utils";
import { getCurrentWeekNumber } from "./gamification";
import { normalizeActiveWeek } from "./active-week";
import { syncProfileAchievements } from "./achievements";
import { migrateProfileXp } from "./xp-ledger";
import { preserveSphereIcon } from "./sphere-icons";
import { normalizeCharacter, normalizeSeasonFlame, resolveLegacyCharacterIdentity } from "./rpg/normalize-game";
import { resolveSphereFilterId } from "./sphere-filter-default";
import { hasUserProgress } from "./app-state-health";

type LegacyGoal = Goal & {
  week?: number;
  weekTasks?: { week: number; text: string; done: boolean }[];
};

function migrateToV3(goals: LegacyGoal[]): { goals: Goal[]; cycleTasks: CycleTask[] } {
  const periodGoals: Goal[] = [];
  const cycleTasks: CycleTask[] = [];
  const parentByKey = new Map<string, string>();

  const ensureParent = (g: LegacyGoal): string => {
    const key = `${g.sphereId}::${g.title}::${g.type}`;
    const existing = parentByKey.get(key);
    if (existing) return existing;
    const id = g.id;
    parentByKey.set(key, id);
    const { week: _w, weekTasks: _t, ...rest } = g;
    periodGoals.push({ ...rest, id });
    return id;
  };

  for (const g of goals) {
    const legacyTasks = g.weekTasks?.filter((t) => t.text.trim()) ?? [];
    const hasWeek = typeof g.week === "number" && g.week >= 1 && g.week <= 12;

    if (g.type === "counter" || g.type === "metric") {
      const { week: _w, weekTasks: _t, ...rest } = g;
      periodGoals.push({ ...rest });
      for (const t of legacyTasks) {
        cycleTasks.push({
          id: generateId(),
          goalId: g.id,
          sphereId: g.sphereId,
          week: t.week,
          title: t.text,
          done: t.done,
        });
      }
      continue;
    }

    if (hasWeek && g.type === "onetime") {
      const parentId = ensureParent(g);
      cycleTasks.push({
        id: generateId(),
        goalId: parentId,
        sphereId: g.sphereId,
        week: g.week!,
        title: g.title,
        done: g.done ?? g.completed ?? false,
      });
      continue;
    }

    const { week: _w, weekTasks: _t, ...rest } = g;
    periodGoals.push({ ...rest });
    for (const t of legacyTasks) {
      const parentId = ensureParent(g);
      cycleTasks.push({
        id: generateId(),
        goalId: parentId,
        sphereId: g.sphereId,
        week: t.week,
        title: t.text,
        done: t.done,
      });
    }
  }

  const uniqueGoals = Array.from(
    new Map(periodGoals.map((g) => [g.id, g])).values()
  );

  return { goals: uniqueGoals, cycleTasks };
}

export function migrateAppState(
  state: Partial<AppState> & { goals?: LegacyGoal[] }
): AppState {
  const base = state as AppState & { goals?: LegacyGoal[] };
  const version = base.version ?? 0;

  let goals = (base.goals ?? []) as LegacyGoal[];
  let cycleTasks = base.cycleTasks ?? [];

  if (version < 3) {
    const migrated = migrateToV3(goals);
    goals = migrated.goals;
    cycleTasks = migrated.cycleTasks;
  } else {
    goals = goals.map(({ week: _w, weekTasks: _t, ...rest }) => rest);
  }

  const weeks = base.weeks ?? [];
  const rawActiveWeek =
    base.activeWeek ??
    (base.cycleStartDate
      ? getCurrentWeekNumber(base.cycleStartDate)
      : 1);
  const activeWeek = normalizeActiveWeek(
    weeks,
    Math.min(12, Math.max(1, rawActiveWeek))
  );

  const forceXpRebuild = (base.version ?? 0) < 5;
  const profileAfterXp = migrateProfileXp(
    base.profile ?? ({} as AppState["profile"]),
    { cycleTasks, weeks, goals },
    forceXpRebuild
  );

  const draft = {
    ...base,
    onboardingComplete: base.onboardingComplete ?? false,
    goals,
    weeks,
    spheres: base.spheres ?? [],
    profile: profileAfterXp,
  } as AppState;

  const profileSynced = syncProfileAchievements(draft);
  const profile = {
    ...profileSynced,
    lastRitualDate: profileSynced.lastRitualDate ?? null,
    dailyQuestClaimDate: profileSynced.dailyQuestClaimDate ?? null,
  };

  const spheres = (base.spheres ?? []).map((s) => ({
    ...s,
    icon: preserveSphereIcon(s.icon),
  }));

  const goalsV11 = (base.version ?? 0) < 11 ? [] : goals;

  const character = resolveLegacyCharacterIdentity(
    normalizeCharacter(base.character),
    profile,
    hasUserProgress({
      ...base,
      goals: goalsV11,
      cycleTasks,
      weeks,
      profile,
      spheres,
      onboardingComplete: base.onboardingComplete ?? false,
    } as AppState)
  );
  const seasonFlame = normalizeSeasonFlame(base.seasonFlame);

  const weekFilterSphereId = resolveSphereFilterId(
    spheres,
    base.weekFilterSphereId as string | null | undefined
  );
  const goalsFilterSphereId = resolveSphereFilterId(
    spheres,
    base.goalsFilterSphereId as string | null | undefined
  );

  return {
    ...base,
    version: DATA_VERSION,
    hiddenSphereIds: base.hiddenSphereIds ?? [],
    weekHiddenSphereIds: base.weekHiddenSphereIds ?? [],
    dayAssignments: base.dayAssignments ?? {},
    spheres,
    goals: goalsV11,
    cycleTasks,
    weeks,
    activeWeek,
    activeDay: Math.min(7, Math.max(1, base.activeDay ?? 1)),
    profile,
    character,
    seasonFlame,
    weekFilterSphereId,
    goalsFilterSphereId,
  };
}
