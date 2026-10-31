import { checkLevelAchievements, todayISO } from "@/lib/gamification";
import { habitStreak } from "@/lib/habits";
import { GAME_ITEMS } from "@/lib/rpg/catalog";
import type { AchievementId, AppState, Profile } from "@/types";

/** Стабильный порядок отображения. Старые id (онбординг, демо, счётчик) больше не показываются. */
const ACHIEVEMENT_ORDER: AchievementId[] = [
  "floor_opened",
  "ritual_7",
  "first_goal_done",
  "first_week_closed",
  "week_perfect_3",
  "cycle_complete",
  "all_sphere_goals",
  "first_purchase",
  "chest_opened",
  "race_chosen",
  "streak_7",
  "streak_30",
  "level_10",
  "level_25",
  "level_50",
  "level_100",
  "habit_streak_7",
];

const SHOP_ITEM_IDS = new Set(GAME_ITEMS.filter((item) => item.price > 0).map((item) => item.id));

type AchievementState = Pick<
  AppState,
  "onboardingComplete" | "goals" | "weeks" | "spheres" | "profile" | "cycleTasks" | "habits" | "habitCompletions"
> & {
  character?: AppState["character"];
};

function setsEqual(a: AchievementId[], b: AchievementId[]): boolean {
  if (a.length !== b.length) return false;
  const sa = new Set(a);
  return b.every((id) => sa.has(id));
}

function ritualDays(profile: Profile): number {
  const days = new Set<string>();
  for (const entry of profile.xpLedger ?? []) {
    if (!entry.sourceId?.startsWith("daily_ritual:")) continue;
    days.add(entry.sourceId.slice("daily_ritual:".length));
  }
  return days.size;
}

export function computeEarnedAchievements(state: AchievementState): AchievementId[] {
  const { weeks, spheres, profile, cycleTasks, character, habits, habitCompletions } = state;
  const earned = new Set<AchievementId>();

  const rituals = ritualDays(profile);
  if (rituals >= 1) earned.add("floor_opened");
  if (rituals >= 7) earned.add("ritual_7");

  if (cycleTasks.some((t) => t.done)) earned.add("first_goal_done");

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

  const sphereCleared = spheres.some((sphere) => {
    const tasks = cycleTasks.filter((t) => t.sphereId === sphere.id);
    return tasks.length > 0 && tasks.every((t) => t.done);
  });
  if (sphereCleared) earned.add("all_sphere_goals");

  if (character?.inventory.some((id) => SHOP_ITEM_IDS.has(id))) {
    earned.add("first_purchase");
  }
  if (
    (character?.claimedFloorChests?.length ?? 0) > 0 ||
    (character?.claimedLevelRewards?.length ?? 0) > 0
  ) {
    earned.add("chest_opened");
  }
  if (character && character.race !== "human") earned.add("race_chosen");

  if (profile.streak >= 7) earned.add("streak_7");
  if (profile.streak >= 30) earned.add("streak_30");

  const today = todayISO();
  for (const h of habits ?? []) {
    if (h.archived) continue;
    if (habitStreak(h, habitCompletions ?? {}, today) >= 7) {
      earned.add("habit_streak_7");
      break;
    }
  }

  for (const id of checkLevelAchievements(
    profile.level,
    profile.achievements.filter(
      (id): id is AchievementId =>
        id === "level_10" ||
        id === "level_25" ||
        id === "level_50" ||
        id === "level_100"
    )
  )) {
    earned.add(id);
  }

  return ACHIEVEMENT_ORDER.filter((id) => earned.has(id));
}

/** Не показываются в списке, но хранятся в profile (онбординг, демо, первые логи). */
const PERSISTENT_EXTRA_ACHIEVEMENTS: AchievementId[] = [
  "onboarding_done",
  "demo_loaded",
  "first_counter_log",
  "first_metric_log",
];

function mergeAchievementLists(
  profile: Profile,
  earned: AchievementId[]
): AchievementId[] {
  const extras = profile.achievements.filter((id) =>
    PERSISTENT_EXTRA_ACHIEVEMENTS.includes(id as AchievementId)
  );
  const merged = [...earned];
  for (const id of extras) {
    if (!merged.includes(id)) merged.push(id);
  }
  return merged;
}

export function syncProfileAchievements(state: AchievementState): Profile {
  const earned = computeEarnedAchievements(state);
  const achievements = mergeAchievementLists(state.profile, earned);
  if (setsEqual(state.profile.achievements, achievements)) {
    return state.profile;
  }
  return { ...state.profile, achievements };
}

export function achievementsNeedSync(state: AchievementState): boolean {
  const earned = computeEarnedAchievements(state);
  const merged = mergeAchievementLists(state.profile, earned);
  return !setsEqual(state.profile.achievements, merged);
}
