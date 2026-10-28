import { checkLevelAchievements } from "@/lib/gamification";
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

function setsEqual(a: AchievementId[], b: AchievementId[]): boolean {
  if (a.length !== b.length) return false;
  const sa = new Set(a);
  return b.every((id) => sa.has(id));
}

export function computeEarnedAchievements(
  state: Pick<AppState, "onboardingComplete" | "goals" | "weeks" | "spheres" | "profile" | "cycleTasks">
): AchievementId[] {
  const { onboardingComplete, weeks, spheres, profile, cycleTasks } = state;
  const earned = new Set<AchievementId>();

  if (onboardingComplete) earned.add("onboarding_done");

  if (cycleTasks.some((t) => t.title === "2 рилса" || t.title === "3 тренировки")) {
    earned.add("demo_loaded");
  }

  if (cycleTasks.some((t) => t.done)) {
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

  if (
    spheres.length > 0 &&
    spheres.every((s) => {
      const ts = cycleTasks.filter((t) => t.sphereId === s.id);
      return ts.length > 0 && ts.every((t) => t.done);
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
  state: Pick<AppState, "onboardingComplete" | "goals" | "weeks" | "spheres" | "profile" | "cycleTasks">
): Profile {
  const achievements = computeEarnedAchievements(state);
  return { ...state.profile, achievements };
}

export function achievementsNeedSync(
  state: Pick<AppState, "onboardingComplete" | "goals" | "weeks" | "spheres" | "profile" | "cycleTasks">
): boolean {
  return !setsEqual(state.profile.achievements, computeEarnedAchievements(state));
}
