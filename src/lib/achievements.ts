import { checkLevelAchievements } from "@/lib/gamification";
import { isGoalComplete, isOnetimeComplete } from "@/lib/goals";
import type { AchievementId, AppState, Profile } from "@/types";

/** Стабильный порядок отображения */
const ACHIEVEMENT_ORDER: AchievementId[] = [
  "onboarding_done",
  "demo_loaded",
  "first_counter_log",
  "first_metric_log",
  "first_goal_done",
  "first_week_closed",
  "week_perfect_3",
  "cycle_complete",
  "all_sphere_goals",
  "streak_7",
  "streak_30",
  "level_10",
  "level_25",
  "level_50",
  "level_100",
];

const DEMO_GOAL_TITLES = new Set([
  "12 рилсов за цикл",
  "Снизить вес до 75 кг",
  "Накопить 50 000 ₽",
]);

function setsEqual(a: AchievementId[], b: AchievementId[]): boolean {
  if (a.length !== b.length) return false;
  const sa = new Set(a);
  return b.every((id) => sa.has(id));
}

export function computeEarnedAchievements(
  state: Pick<AppState, "onboardingComplete" | "goals" | "weeks" | "spheres" | "profile">
): AchievementId[] {
  const { onboardingComplete, goals, weeks, spheres, profile } = state;
  const earned = new Set<AchievementId>();

  if (onboardingComplete) earned.add("onboarding_done");

  if (goals.some((g) => DEMO_GOAL_TITLES.has(g.title))) {
    earned.add("demo_loaded");
  }

  if (goals.some((g) => g.type === "counter" && (g.increments?.length ?? 0) > 0)) {
    earned.add("first_counter_log");
  }
  if (goals.some((g) => g.type === "metric" && (g.measurements?.length ?? 0) > 0)) {
    earned.add("first_metric_log");
  }

  if (goals.some((g) => g.completed || isGoalComplete(g) || isOnetimeComplete(g))) {
    earned.add("first_goal_done");
  }

  if (weeks.some((w) => w.bonusAwarded)) earned.add("first_week_closed");

  let consecutive = 0;
  for (let i = 1; i <= 12; i++) {
    const w = weeks.find((x) => x.number === i);
    if (w?.bonusAwarded) consecutive++;
    else break;
  }
  if (consecutive >= 3) earned.add("week_perfect_3");

  if (weeks.filter((w) => w.bonusAwarded).length >= 12) {
    earned.add("cycle_complete");
  }

  const spheresWithGoals = spheres.filter((s) =>
    goals.some((g) => g.sphereId === s.id)
  );
  if (
    spheresWithGoals.length > 0 &&
    spheresWithGoals.every((s) => {
      const sg = goals.filter((g) => g.sphereId === s.id);
      return sg.length > 0 && sg.every((g) => g.completed || isGoalComplete(g));
    })
  ) {
    earned.add("all_sphere_goals");
  }

  if (profile.streak >= 7) earned.add("streak_7");
  if (profile.streak >= 30) earned.add("streak_30");

  for (const id of checkLevelAchievements(profile.level, [])) {
    earned.add(id);
  }

  return ACHIEVEMENT_ORDER.filter((id) => earned.has(id));
}

export function syncProfileAchievements(
  state: Pick<AppState, "onboardingComplete" | "goals" | "weeks" | "spheres" | "profile">
): Profile {
  const achievements = computeEarnedAchievements(state);
  return { ...state.profile, achievements };
}

export function achievementsNeedSync(
  state: Pick<AppState, "onboardingComplete" | "goals" | "weeks" | "spheres" | "profile">
): boolean {
  return !setsEqual(state.profile.achievements, computeEarnedAchievements(state));
}
