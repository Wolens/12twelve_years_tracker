"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  AppState,
  Goal,
  Sphere,
  WeekData,
  WeekReflection,
  AchievementId,
  ThemeMode,
  CycleTask,
} from "@/types";
import { DATA_VERSION, STORAGE_KEY } from "@/types";
import {
  XP_TASK,
  XP_WEEK_CLOSED,
  XP_GOAL_COMPLETED,
  DEFAULT_SPHERES,
} from "@/lib/constants";
import { todayISO } from "@/lib/gamification";
import {
  grantXp,
  revokeXpBySource,
  syncProfileFromLedger,
  xpSourceCycleTask,
  xpSourceGoalComplete,
  xpSourceOnetimeGoal,
  xpSourceWeekClose,
  type LevelUpEvent,
} from "@/lib/xp-ledger";
import {
  isCounterComplete,
  isMetricComplete,
  isGoalComplete,
  isOnetimeComplete,
  metricCurrentAfterRemoving,
} from "@/lib/goals";
import { applyDemoPatch, buildDemoGoals } from "@/lib/demo-data";
import { generateId } from "@/lib/utils";
import { migrateAppState } from "@/lib/migrate";
import { resolveSphereFilterId } from "@/lib/sphere-filter-default";
import { assignGoalToDay, removeGoalFromWeekPlan } from "@/lib/day-plan";
import { hasUserProgress, repairAppState } from "@/lib/app-state-health";
import {
  dailyQuestBonusAmount,
  reconcileProfileDailyEngagement,
  randomRitualXp,
  ritualClaimedToday,
  xpSourceDailyQuest,
  xpSourceDailyRitual,
  canClaimDailyQuest,
} from "@/lib/daily-engagement";
import { createInitialCharacter, createInitialSeasonFlame } from "@/lib/rpg/defaults";
import { adjustCoins } from "@/lib/rpg/store-helpers";
import {
  COINS_PER_DAILY_QUEST,
  COINS_PER_GOAL,
  COINS_PER_RITUAL,
  COINS_PER_TASK,
  COINS_PER_WEEK,
} from "@/lib/rpg/coins";
import { tendFlame, applyFlameDecay, applyDailyFirstVisitHeal } from "@/lib/rpg/season-flame";
import { itemById, normalizeRace, STARTER_ITEM_IDS } from "@/lib/rpg/catalog";
import { itemShopSellPrice } from "@/lib/rpg/shop-economy";
import { rollChestItem } from "@/lib/rpg/chest-roll";
import {
  duplicateCoinsForItem,
  isWeekStartFloor,
  rollFloorChestItem,
} from "@/lib/rpg/floor-chest";
import {
  chestLevelsToGrant,
  createChestForLevel,
} from "@/lib/rpg/level-roadmap";
import { levelFromXp } from "@/lib/gamification";
import type { CharacterGender, CharacterState, EquipSlot, ItemRarity, RaceId } from "@/types/rpg";
import { RACE_UNLOCK_LEVEL } from "@/types/rpg";

function createInitialWeeks(): WeekData[] {
  return Array.from({ length: 12 }, (_, i) => ({
    number: i + 1,
    closed: false,
    bonusAwarded: false,
  }));
}

function createInitialProfile(): AppState["profile"] {
  return {
    name: "Игрок",
    avatar: "🎯",
    xp: 0,
    level: 1,
    streak: 0,
    lastActivityDate: null,
    achievements: [],
    xpLedger: [],
    lastRitualDate: null,
    dailyQuestClaimDate: null,
  };
}

export function createInitialState(): AppState {
  return {
    version: DATA_VERSION,
    onboardingComplete: false,
    tourComplete: false,
    cycleStartDate: todayISO(),
    activeWeek: 1,
    activeDay: 1,
    spheres: [],
    goals: [],
    cycleTasks: [],
    weeks: createInitialWeeks(),
    profile: createInitialProfile(),
    theme: "dark",
    hiddenSphereIds: [],
    weekHiddenSphereIds: [],
    weekFilterSphereId: "",
    goalsFilterSphereId: "",
    dayAssignments: {},
    character: createInitialCharacter(),
    seasonFlame: createInitialSeasonFlame(),
  };
}

type Store = AppState & {
  levelUpEvent: LevelUpEvent;
  clearLevelUpEvent: () => void;
  completeOnboarding: (spheres: Sphere[]) => void;
  repairStateFromLedger: () => void;
  setTourComplete: () => void;
  restartTour: () => void;
  setTheme: (theme: ThemeMode) => void;
  updateProfile: (patch: Partial<AppState["profile"]>) => void;
  claimDailyRitual: () => number;
  /** Прошедший день без захода: трещина становится пустой тропой. */
  visitPastDay: (date: string) => boolean;
  claimDailyQuestBonus: () => number;
  processSeasonFlameOnBoot: () => { missedDays: number; coinsLost: number };
  syncLevelRewards: () => void;
  setupCharacterIdentity: (gender: CharacterGender, birthDate: string) => void;
  setCharacterRace: (race: RaceId) => void;
  buyGameItem: (itemId: string) => boolean;
  sellGameItem: (itemId: string) => boolean;
  equipGameItem: (itemId: string) => void;
  unequipGameItem: (slot: EquipSlot) => void;
  openGameChest: (chestId: string) => string | null;
  openFloorChest: (
    floorDay: number,
    reachDay: number
  ) => {
    itemId: string;
    itemName: string;
    rarity: ItemRarity;
    duplicate: boolean;
    coins: number;
  } | null;
  addSphere: (sphere: Omit<Sphere, "id">) => void;
  deleteSphere: (id: string) => void;
  updateSphere: (id: string, patch: Partial<Omit<Sphere, "id">>) => void;
  toggleSphereVisibility: (sphereId: string) => void;
  toggleWeekSphereVisibility: (sphereId: string) => void;
  setWeekFilterSphereId: (sphereId: string) => void;
  setGoalsFilterSphereId: (sphereId: string) => void;
  addGoal: (goal: Omit<Goal, "id">) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  toggleGoalDone: (goalId: string) => void;
  addCycleTask: (task: Omit<CycleTask, "id" | "done">) => void;
  updateCycleTask: (
    taskId: string,
    patch: Partial<Pick<CycleTask, "title" | "week">>
  ) => void;
  toggleCycleTask: (taskId: string) => void;
  deleteCycleTask: (taskId: string) => void;
  addCounterIncrement: (goalId: string, amount: number, date?: string) => void;
  setCounterProgress: (goalId: string, total: number) => void;
  addMetricMeasurement: (goalId: string, value: number, date?: string) => void;
  deleteMetricMeasurement: (goalId: string, measurementKey: string) => void;
  assignTaskToDayPlan: (taskId: string, week: number, day: number) => void;
  unassignTaskFromDayPlan: (taskId: string, week: number) => void;
  setActiveDay: (day: number) => void;
  setActiveWeek: (week: number) => void;
  completeActiveWeekAndAdvance: () => void;
  revertActiveWeekAdvance: () => void;
  setWeekReflection: (week: number, reflection: WeekReflection) => void;
  closeWeek: (week: number) => void;
  loadDemoData: () => void;
  resetCycle: () => void;
  importState: (data: AppState) => void;
  exportState: () => AppState;
  awardXp: (amount: number) => void;
  unlockAchievement: (id: AchievementId) => void;
};

function checkGoalCompletion(
  goals: Goal[],
  profile: AppState["profile"],
  character: CharacterState
): {
  goals: Goal[];
  profile: AppState["profile"];
  character: CharacterState;
  levelUp: LevelUpEvent;
} {
  let levelUp: LevelUpEvent = null;
  let p = profile;
  let c = character;
  const updated = goals.map((g) => {
    if (g.completed) return g;
    const done =
      g.type === "counter"
        ? isCounterComplete(g)
        : g.type === "metric"
          ? isMetricComplete(g)
          : isOnetimeComplete(g);
    if (done) {
      const res = grantXp(p, {
        baseAmount: XP_GOAL_COMPLETED,
        label: `Цель выполнена: ${g.title}`,
        sourceId: xpSourceGoalComplete(g.id),
        withStreak: false,
      });
      p = res.profile;
      c = adjustCoins(c, COINS_PER_GOAL);
      if (res.levelUp) levelUp = res.levelUp;
      return { ...g, completed: true, done: g.type === "onetime" ? true : g.done };
    }
    return g;
  });
  return { goals: updated, profile: p, character: c, levelUp };
}

function recomputeWeekClosed(
  cycleTasks: CycleTask[],
  weeks: WeekData[]
): WeekData[] {
  return weeks.map((w) => {
    const weekTasks = cycleTasks.filter((t) => t.week === w.number);
    if (w.bonusAwarded) return { ...w, closed: true };
    if (weekTasks.length === 0) return w;
    const allDone = weekTasks.every((t) => t.done);
    if (!allDone && w.closed) return { ...w, closed: false };
    return w;
  });
}

export const useAppStore = create<Store>()(
  persist(
    (set, get) => ({
      ...createInitialState(),
      levelUpEvent: null,
      clearLevelUpEvent: () => set({ levelUpEvent: null }),

      completeOnboarding: (spheres) => {
        set((state) => {
          const achievements = [...state.profile.achievements];
          if (!achievements.includes("onboarding_done"))
            achievements.push("onboarding_done");

          if (hasUserProgress(state)) {
            return repairAppState({
              ...state,
              onboardingComplete: true,
              profile: { ...state.profile, achievements },
            });
          }

          const nextSpheres =
            spheres.length > 0
              ? spheres
              : DEFAULT_SPHERES.map((s) => ({
                  ...s,
                  id: generateId(),
                })).slice(0, 4);
          const firstId = nextSpheres[0]?.id ?? "";

          return {
            spheres: nextSpheres,
            weekFilterSphereId: firstId,
            goalsFilterSphereId: firstId,
            onboardingComplete: true,
            cycleStartDate: todayISO(),
            weeks: createInitialWeeks(),
            profile: { ...state.profile, achievements },
          };
        });
      },

      repairStateFromLedger: () => {
        set((state) => repairAppState(state));
      },

      setTourComplete: () => set({ tourComplete: true }),
      restartTour: () => set({ tourComplete: false }),
      setTheme: (theme) => set({ theme }),
      updateProfile: (patch) =>
        set((s) => ({ profile: { ...s.profile, ...patch } })),

      claimDailyRitual: () => {
        const today = todayISO();
        const state = get();
        const reconciled = reconcileProfileDailyEngagement(state.profile);
        if (
          reconciled.xp !== state.profile.xp ||
          reconciled.lastRitualDate !== state.profile.lastRitualDate
        ) {
          set({ profile: reconciled });
        }
        if (ritualClaimedToday(reconciled)) return 0;
        const sourceId = xpSourceDailyRitual(today);
        if ((reconciled.xpLedger ?? []).some((e) => e.sourceId === sourceId)) return 0;
        const amount = randomRitualXp();
        set((s) => {
          const { profile, levelUp } = grantXp(s.profile, {
            baseAmount: amount,
            label: "Ритуал: открыт день",
            sourceId,
            withStreak: true,
          });
          return {
            profile: { ...profile, lastRitualDate: today },
            seasonFlame: tendFlame(s.seasonFlame, s.character.race),
            character: adjustCoins(s.character, COINS_PER_RITUAL),
            levelUpEvent: levelUp,
          };
        });
        get().syncLevelRewards();
        return amount;
      },

      visitPastDay: (date) => {
        const today = todayISO();
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date >= today) return false;
        const sourceId = xpSourceDailyRitual(date);
        if ((get().profile.xpLedger ?? []).some((e) => e.sourceId === sourceId)) return false;
        set((s) => ({
          profile: syncProfileFromLedger({
            ...s.profile,
            xpLedger: [
              ...(s.profile.xpLedger ?? []),
              {
                id: generateId(),
                at: `${date}T12:00:00.000Z`,
                amount: 1,
                label: "Заход в прошедший день",
                sourceId,
              },
            ],
          }),
          seasonFlame: tendFlame(s.seasonFlame, s.character.race),
        }));
        return true;
      },

      claimDailyQuestBonus: () => {
        const today = todayISO();
        const state = get();
        if (!canClaimDailyQuest(state.profile, state.profile.xpLedger)) return 0;
        const questMult = normalizeRace(state.character.race) === "jedi" ? 1.5 : 1;
        const amount = Math.round(dailyQuestBonusAmount() * questMult);
        set((s) => {
          const { profile, levelUp } = grantXp(s.profile, {
            baseAmount: amount,
            label: "Квест дня выполнен",
            sourceId: xpSourceDailyQuest(today),
            withStreak: false,
          });
          return {
            profile: { ...profile, dailyQuestClaimDate: today },
            character: adjustCoins(s.character, Math.round(COINS_PER_DAILY_QUEST * questMult)),
            levelUpEvent: levelUp,
          };
        });
        return amount;
      },

      processSeasonFlameOnBoot: () => {
        const s = get();
        let seasonFlame = s.seasonFlame ?? createInitialSeasonFlame();
        const character = s.character ?? createInitialCharacter();
        const { flame, missedDays, coinsPenalty } = applyFlameDecay(
          seasonFlame,
          s.profile.lastRitualDate,
          character.race
        );
        seasonFlame = applyDailyFirstVisitHeal(flame);
        const prevFlame = s.seasonFlame ?? createInitialSeasonFlame();
        const changed =
          missedDays > 0 ||
          seasonFlame.value !== prevFlame.value ||
          (seasonFlame.lastDailyVisitHealDate ?? null) !==
            (prevFlame.lastDailyVisitHealDate ?? null);
        if (!changed) {
          return { missedDays: 0, coinsLost: 0 };
        }
        set({
          seasonFlame,
          character: adjustCoins(character, -coinsPenalty),
        });
        return { missedDays, coinsLost: coinsPenalty };
      },

      syncLevelRewards: () => {
        const s = get();
        const level = levelFromXp(s.profile.xp);
        const grants = chestLevelsToGrant(level, s.character.claimedLevelRewards);
        if (grants.length === 0) return;
        set((state) => {
          const claimed = [...state.character.claimedLevelRewards];
          const chests = [...state.character.pendingChests];
          for (const g of grants) {
            if (claimed.includes(g.level)) continue;
            claimed.push(g.level);
            chests.push(createChestForLevel(g.level, g.tier));
          }
          return {
            character: {
              ...state.character,
              claimedLevelRewards: claimed,
              pendingChests: chests,
            },
          };
        });
      },

      setupCharacterIdentity: (gender, birthDate) =>
        set((s) => ({
          character: {
            ...s.character,
            gender,
            birthDate,
            identitySetupDone: true,
          },
          profile: {
            ...s.profile,
            avatar: gender === "female" ? "👩" : "👨",
          },
        })),

      setCharacterRace: (race) => {
        if (levelFromXp(get().profile.xp) < RACE_UNLOCK_LEVEL && race !== "human") return;
        set((s) => ({ character: { ...s.character, race } }));
      },

      buyGameItem: (itemId) => {
        const item = itemById(itemId);
        if (!item) return false;
        const s = get();
        const level = levelFromXp(s.profile.xp);
        if (level < item.requiredLevel || s.character.coins < item.price || item.price <= 0)
          return false;
        if (s.character.inventory.includes(itemId)) return false;
        set((state) => ({
          character: adjustCoins(
            {
              ...state.character,
              inventory: [...state.character.inventory, itemId],
            },
            -item.price
          ),
        }));
        return true;
      },

      sellGameItem: (itemId) => {
        const item = itemById(itemId);
        if (!item) return false;
        if (STARTER_ITEM_IDS.includes(itemId as (typeof STARTER_ITEM_IDS)[number])) return false;
        const sellPrice = itemShopSellPrice(item);
        if (sellPrice <= 0 || sellPrice >= item.price) return false;
        const s = get();
        if (!s.character.inventory.includes(itemId)) return false;
        set((state) => {
          const equipped = { ...state.character.equipped };
          if (equipped[item.slot] === itemId) {
            delete equipped[item.slot];
          }
          return {
            character: adjustCoins(
              {
                ...state.character,
                equipped,
                inventory: state.character.inventory.filter((id) => id !== itemId),
              },
              sellPrice
            ),
          };
        });
        return true;
      },

      equipGameItem: (itemId) => {
        const item = itemById(itemId);
        if (!item) return;
        set((s) => {
          if (!s.character.inventory.includes(itemId)) return s;
          return {
            character: {
              ...s.character,
              equipped: { ...s.character.equipped, [item.slot]: itemId },
            },
          };
        });
      },

      unequipGameItem: (slot) => {
        set((s) => {
          const equipped = { ...s.character.equipped };
          delete equipped[slot];
          return { character: { ...s.character, equipped } };
        });
      },

      openGameChest: (chestId) => {
        const s = get();
        const chest = s.character.pendingChests.find((c) => c.id === chestId);
        if (!chest) return null;
        const level = levelFromXp(s.profile.xp);
        const itemId = rollChestItem(chest, s.character.inventory, level);
        if (!itemId) return null;
        const item = itemById(itemId);
        if (!item) return null;
        set((state) => ({
          character: {
            ...state.character,
            pendingChests: state.character.pendingChests.filter((c) => c.id !== chestId),
            inventory: state.character.inventory.includes(itemId)
              ? state.character.inventory
              : [...state.character.inventory, itemId],
          },
        }));
        return item.name;
      },

      openFloorChest: (floorDay, reachDay) => {
        const s = get();
        if (!isWeekStartFloor(floorDay)) return null;
        if (floorDay > reachDay) return null;
        const claimed = s.character.claimedFloorChests ?? [];
        if (claimed.includes(floorDay)) return null;
        const level = levelFromXp(s.profile.xp);
        const itemId = rollFloorChestItem(level);
        const item = itemById(itemId);
        if (!item) return null;
        const duplicate = s.character.inventory.includes(itemId);
        const coins = duplicate ? duplicateCoinsForItem(itemId) : 0;
        set((state) => ({
          character: adjustCoins(
            {
              ...state.character,
              claimedFloorChests: [...(state.character.claimedFloorChests ?? []), floorDay],
              inventory: duplicate
                ? state.character.inventory
                : [...state.character.inventory, itemId],
            },
            coins
          ),
        }));
        return {
          itemId,
          itemName: item.name,
          rarity: item.rarity,
          duplicate,
          coins,
        };
      },

      addSphere: (sphere) =>
        set((s) => {
          const id = generateId();
          const spheres = [...s.spheres, { ...sphere, id, custom: true }];
          const isFirst = s.spheres.length === 0;
          return {
            spheres,
            ...(isFirst
              ? { weekFilterSphereId: id, goalsFilterSphereId: id }
              : {}),
          };
        }),

      deleteSphere: (id) =>
        set((s) => {
          const removedTaskIds = new Set(
            s.cycleTasks.filter((t) => t.sphereId === id).map((t) => t.id)
          );
          const dayAssignments = { ...s.dayAssignments };
          for (const key of Object.keys(dayAssignments)) {
            dayAssignments[key] = dayAssignments[key].filter(
              (tid) => !removedTaskIds.has(tid)
            );
          }
          const spheres = s.spheres.filter((sp) => sp.id !== id);
          return {
            spheres,
            goals: s.goals.filter((g) => g.sphereId !== id),
            cycleTasks: s.cycleTasks.filter((t) => t.sphereId !== id),
            hiddenSphereIds: s.hiddenSphereIds.filter((sid) => sid !== id),
            weekHiddenSphereIds: s.weekHiddenSphereIds.filter((sid) => sid !== id),
            dayAssignments,
            weekFilterSphereId: resolveSphereFilterId(spheres, s.weekFilterSphereId),
            goalsFilterSphereId: resolveSphereFilterId(spheres, s.goalsFilterSphereId),
          };
        }),

      updateSphere: (id, patch) =>
        set((s) => ({
          spheres: s.spheres.map((sp) =>
            sp.id === id ? { ...sp, ...patch } : sp
          ),
        })),

      toggleSphereVisibility: (sphereId) =>
        set((s) => {
          const hidden = new Set(s.hiddenSphereIds);
          if (hidden.has(sphereId)) hidden.delete(sphereId);
          else hidden.add(sphereId);
          return { hiddenSphereIds: Array.from(hidden) };
        }),

      toggleWeekSphereVisibility: (sphereId) =>
        set((s) => {
          const hidden = new Set(s.weekHiddenSphereIds);
          if (hidden.has(sphereId)) hidden.delete(sphereId);
          else hidden.add(sphereId);
          return { weekHiddenSphereIds: Array.from(hidden) };
        }),

      setWeekFilterSphereId: (sphereId) => set({ weekFilterSphereId: sphereId }),

      setGoalsFilterSphereId: (sphereId) => set({ goalsFilterSphereId: sphereId }),

      addGoal: (goal) =>
        set((s) => ({
          goals: [
            ...s.goals,
            {
              ...goal,
              id: generateId(),
              done: goal.type === "onetime" ? goal.done ?? false : goal.done,
            },
          ],
        })),

      updateGoal: (id, patch) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        })),

      deleteGoal: (id) =>
        set((s) => {
          const removedTaskIds = new Set(
            s.cycleTasks.filter((t) => t.goalId === id).map((t) => t.id)
          );
          let dayAssignments = { ...s.dayAssignments };
          for (const key of Object.keys(dayAssignments)) {
            dayAssignments[key] = dayAssignments[key].filter(
              (tid) => !removedTaskIds.has(tid)
            );
          }
          const cycleTasks = s.cycleTasks.filter((t) => t.goalId !== id);
          return {
            goals: s.goals.filter((g) => g.id !== id),
            cycleTasks,
            dayAssignments,
            weeks: recomputeWeekClosed(cycleTasks, s.weeks),
          };
        }),

      toggleGoalDone: (goalId) => {
        set((s) => {
          const prev = s.goals.find((g) => g.id === goalId);
          if (!prev) return s;

          const goals = s.goals.map((g) => {
            if (g.id !== goalId) return g;
            if (g.type === "onetime") {
              const next = !(g.done ?? false);
              return { ...g, done: next, completed: next };
            }
            return g;
          });

          const next = goals.find((g) => g.id === goalId);
          const wasDone = isOnetimeComplete(prev);
          const nowDone = next ? isOnetimeComplete(next) : false;

          let profile = s.profile;
          let levelUp: LevelUpEvent = null;
          if (nowDone && !wasDone) {
            const title = next?.title ?? prev.title;
            const res = grantXp(profile, {
              baseAmount: XP_TASK,
              label: `Разовая цель: ${title}`,
              sourceId: xpSourceOnetimeGoal(goalId),
              withStreak: true,
            });
            profile = res.profile;
            levelUp = res.levelUp;
          } else if (wasDone && !nowDone) {
            profile = revokeXpBySource(profile, xpSourceOnetimeGoal(goalId));
          }

          const checked = checkGoalCompletion(goals, profile, s.character);
          return {
            goals: checked.goals,
            profile: checked.profile,
            character: checked.character,
            levelUpEvent: checked.levelUp ?? levelUp,
          };
        });
      },

      addCycleTask: (task) =>
        set((s) => {
          if (!s.spheres.some((sp) => sp.id === task.sphereId)) return s;
          const cycleTasks = [
            ...s.cycleTasks,
            {
              ...task,
              id: generateId(),
              done: false,
            },
          ];
          return { cycleTasks, weeks: recomputeWeekClosed(cycleTasks, s.weeks) };
        }),

      updateCycleTask: (taskId, patch) =>
        set((s) => {
          const cycleTasks = s.cycleTasks.map((t) =>
            t.id === taskId ? { ...t, ...patch } : t
          );
          return { cycleTasks, weeks: recomputeWeekClosed(cycleTasks, s.weeks) };
        }),

      toggleCycleTask: (taskId) => {
        set((s) => {
          const prev = s.cycleTasks.find((t) => t.id === taskId);
          if (!prev) return s;
          const cycleTasks = s.cycleTasks.map((t) =>
            t.id === taskId ? { ...t, done: !t.done } : t
          );
          const nowDone = !prev.done;
          let profile = s.profile;
          let character = s.character;
          let levelUp: LevelUpEvent = null;
          if (nowDone) {
            const res = grantXp(profile, {
              baseAmount: XP_TASK,
              label: `Задача недели: ${prev.title}`,
              sourceId: xpSourceCycleTask(taskId),
              withStreak: true,
            });
            profile = res.profile;
            character = adjustCoins(character, COINS_PER_TASK);
            levelUp = res.levelUp;
          } else {
            profile = revokeXpBySource(profile, xpSourceCycleTask(taskId));
            character = adjustCoins(character, -COINS_PER_TASK);
          }
          return {
            cycleTasks,
            profile,
            character,
            weeks: recomputeWeekClosed(cycleTasks, s.weeks),
            levelUpEvent: levelUp,
          };
        });
      },

      deleteCycleTask: (taskId) =>
        set((s) => {
          let dayAssignments = { ...s.dayAssignments };
          for (const key of Object.keys(dayAssignments)) {
            dayAssignments[key] = dayAssignments[key].filter((id) => id !== taskId);
          }
          const cycleTasks = s.cycleTasks.filter((t) => t.id !== taskId);
          const profile = revokeXpBySource(s.profile, xpSourceCycleTask(taskId));
          return {
            cycleTasks,
            dayAssignments,
            profile,
            weeks: recomputeWeekClosed(cycleTasks, s.weeks),
          };
        }),

      setCounterProgress: (goalId, total) => {
        const d = todayISO();
        set((s) => {
          const goals = s.goals.map((g) => {
            if (g.id !== goalId || g.type !== "counter") return g;
            const target = g.targetCount ?? 1;
            const clamped = Math.min(target, Math.max(0, Math.round(total)));
            const prev = (g.increments ?? []).reduce((sum, i) => sum + i.amount, 0);
            const diff = clamped - prev;
            if (diff === 0) return g;
            const increments = [...(g.increments ?? [])];
            if (diff > 0) increments.push({ date: d, amount: diff });
            else {
              let remaining = -diff;
              while (remaining > 0 && increments.length > 0) {
                const last = increments[increments.length - 1];
                if (last.amount <= remaining) {
                  remaining -= last.amount;
                  increments.pop();
                } else {
                  last.amount -= remaining;
                  remaining = 0;
                }
              }
            }
            return { ...g, increments };
          });
          const checked = checkGoalCompletion(goals, s.profile, s.character);
          return {
            goals: checked.goals,
            profile: checked.profile,
            character: checked.character,
            levelUpEvent: checked.levelUp,
            weeks: recomputeWeekClosed(s.cycleTasks, s.weeks),
          };
        });
      },

      addCounterIncrement: (goalId, amount, date) => {
        const d = date ?? todayISO();
        set((s) => {
          const goals = s.goals.map((g) => {
            if (g.id !== goalId || g.type !== "counter") return g;
            return {
              ...g,
              increments: [...(g.increments ?? []), { date: d, amount }],
            };
          });
          let profile = s.profile;
          let levelUp: LevelUpEvent = null;
          const withFirstLog = [...profile.achievements];
          if (!withFirstLog.includes("first_counter_log")) {
            withFirstLog.push("first_counter_log");
          }
          profile = { ...profile, achievements: withFirstLog };
          const checked = checkGoalCompletion(goals, profile, s.character);
          return {
            goals: checked.goals,
            profile: checked.profile,
            character: checked.character,
            levelUpEvent: checked.levelUp ?? levelUp,
            weeks: recomputeWeekClosed(s.cycleTasks, s.weeks),
          };
        });
      },

      addMetricMeasurement: (goalId, value, date) => {
        const d = date ?? todayISO();
        set((s) => {
          const goals = s.goals.map((g) => {
            if (g.id !== goalId || g.type !== "metric") return g;
            return {
              ...g,
              currentValue: value,
              measurements: [
                ...(g.measurements ?? []),
                { id: generateId(), date: d, value },
              ],
            };
          });
          let profile = s.profile;
          let levelUp: LevelUpEvent = null;
          const achievements = [...profile.achievements];
          if (!achievements.includes("first_metric_log"))
            achievements.push("first_metric_log");
          profile = { ...profile, achievements };
          const checked = checkGoalCompletion(goals, profile, s.character);
          return {
            goals: checked.goals,
            profile: checked.profile,
            character: checked.character,
            levelUpEvent: checked.levelUp ?? levelUp,
            weeks: recomputeWeekClosed(s.cycleTasks, s.weeks),
          };
        });
      },

      deleteMetricMeasurement: (goalId, measurementKey) =>
        set((s) => {
          const goals = s.goals.map((g) => {
            if (g.id !== goalId || g.type !== "metric") return g;
            const list = g.measurements ?? [];
            const measurements = list.filter((m, i) => {
              const key = m.id ?? `idx:${i}`;
              return key !== measurementKey;
            });
            const start = g.startValue ?? 0;
            return {
              ...g,
              measurements,
              currentValue: metricCurrentAfterRemoving(measurements, start),
            };
          });
          const checked = checkGoalCompletion(goals, s.profile, s.character);
          return {
            goals: checked.goals,
            profile: checked.profile,
            character: checked.character,
            levelUpEvent: checked.levelUp,
            weeks: recomputeWeekClosed(s.cycleTasks, s.weeks),
          };
        }),

      assignTaskToDayPlan: (taskId, week, day) =>
        set((s) => ({
          dayAssignments: assignGoalToDay(s.dayAssignments, week, day, taskId),
        })),

      unassignTaskFromDayPlan: (taskId, week) =>
        set((s) => ({
          dayAssignments: removeGoalFromWeekPlan(s.dayAssignments, week, taskId),
        })),

      setActiveDay: (day) =>
        set({ activeDay: Math.min(7, Math.max(1, day)) }),

      setActiveWeek: (week) =>
        set({ activeWeek: Math.min(12, Math.max(1, week)) }),

      completeActiveWeekAndAdvance: () => {
        const s = get();
        const week = s.activeWeek;
        const wk = s.weeks.find((x) => x.number === week);
        if (wk && !wk.bonusAwarded) {
          get().closeWeek(week);
          return;
        }
        if (week < 12) {
          set({ activeWeek: week + 1, activeDay: 1 });
        }
      },

      revertActiveWeekAdvance: () => {
        set((s) => {
          if (s.activeWeek <= 1) return s;
          const prev = s.activeWeek - 1;
          const profile = revokeXpBySource(s.profile, xpSourceWeekClose(prev));
          return {
            activeWeek: prev,
            activeDay: 1,
            profile,
            weeks: s.weeks.map((w) =>
              w.number === prev
                ? { ...w, closed: false, bonusAwarded: false }
                : w
            ),
          };
        });
      },

      setWeekReflection: (week, reflection) =>
        set((s) => ({
          weeks: s.weeks.map((w) =>
            w.number === week ? { ...w, reflection } : w
          ),
        })),

      closeWeek: (week) => {
        set((s) => {
          const w = s.weeks.find((x) => x.number === week);
          if (!w || w.bonusAwarded) return s;
          const shouldAdvance = week === s.activeWeek && week < 12;
          const { profile, levelUp } = grantXp(s.profile, {
            baseAmount: XP_WEEK_CLOSED,
            label: `Закрыта неделя ${week}`,
            sourceId: xpSourceWeekClose(week),
            withStreak: true,
          });
          return {
            weeks: s.weeks.map((wk) =>
              wk.number === week
                ? { ...wk, closed: true, bonusAwarded: true }
                : wk
            ),
            profile,
            character: adjustCoins(
              s.character,
              normalizeRace(s.character.race) === "knight"
                ? Math.round(COINS_PER_WEEK * 1.4)
                : COINS_PER_WEEK
            ),
            levelUpEvent: levelUp,
            ...(shouldAdvance
              ? { activeWeek: week + 1, activeDay: 1 }
              : {}),
          };
        });
        get().syncLevelRewards();
      },

      loadDemoData: () =>
        set((s) => {
          const patch = applyDemoPatch(s);
          const demo = buildDemoGoals(s.spheres);
          return {
            ...s,
            ...patch,
            goals: patch.goals ?? demo.goals,
            cycleTasks: patch.cycleTasks ?? demo.cycleTasks,
          };
        }),

      resetCycle: () =>
        set((s) => ({
          cycleStartDate: todayISO(),
          activeWeek: 1,
          activeDay: 1,
          weeks: createInitialWeeks(),
          dayAssignments: {},
          cycleTasks: s.cycleTasks.map((t) => ({ ...t, done: false })),
          goals: s.goals.map((g) => ({
            ...g,
            completed: false,
            done: g.type === "onetime" ? false : g.done,
            increments: g.type === "counter" ? [] : g.increments,
            measurements: g.type === "metric" ? [] : g.measurements,
            currentValue: g.type === "metric" ? g.startValue : g.currentValue,
          })),
        })),

      importState: (data) => {
        const prev = get();
        const migrated = migrateAppState({ ...createInitialState(), ...data });
        const repaired = repairAppState(migrated);
        const spheres = repaired.spheres;
        set({
          ...repaired,
          levelUpEvent: null,
          weekFilterSphereId: resolveSphereFilterId(
            spheres,
            prev.weekFilterSphereId || repaired.weekFilterSphereId
          ),
          goalsFilterSphereId: resolveSphereFilterId(
            spheres,
            prev.goalsFilterSphereId || repaired.goalsFilterSphereId
          ),
        });
      },

      exportState: () => {
        const s = get();
        return {
          version: s.version,
          onboardingComplete: s.onboardingComplete,
          tourComplete: s.tourComplete,
          cycleStartDate: s.cycleStartDate,
          activeWeek: s.activeWeek,
          activeDay: s.activeDay,
          spheres: s.spheres,
          goals: s.goals,
          cycleTasks: s.cycleTasks,
          weeks: s.weeks,
          profile: s.profile,
          theme: s.theme,
          hiddenSphereIds: s.hiddenSphereIds,
          weekHiddenSphereIds: s.weekHiddenSphereIds,
          weekFilterSphereId: s.weekFilterSphereId,
          goalsFilterSphereId: s.goalsFilterSphereId,
          dayAssignments: s.dayAssignments,
          character: s.character,
          seasonFlame: s.seasonFlame,
        };
      },

      awardXp: (amount) => {
        set((s) => {
          const { profile, levelUp } = grantXp(s.profile, {
            baseAmount: amount,
            label: "Бонус",
            withStreak: true,
          });
          return { profile, levelUpEvent: levelUp };
        });
      },

      unlockAchievement: (id) =>
        set((s) => {
          if (s.profile.achievements.includes(id)) return s;
          return {
            profile: {
              ...s.profile,
              achievements: [...s.profile.achievements, id],
            },
          };
        }),
    }),
    {
      name: STORAGE_KEY,
      version: DATA_VERSION,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted) =>
        migrateAppState({
          ...createInitialState(),
          ...(persisted as AppState),
        }),
      merge: (persisted, current) => {
        const migrated = migrateAppState({
          ...createInitialState(),
          ...(persisted as AppState),
        });
        const spheres = migrated.spheres?.length ? migrated.spheres : current.spheres;
        return {
          ...current,
          ...migrated,
          weekFilterSphereId: resolveSphereFilterId(
            spheres,
            current.weekFilterSphereId || migrated.weekFilterSphereId
          ),
          goalsFilterSphereId: resolveSphereFilterId(
            spheres,
            current.goalsFilterSphereId || migrated.goalsFilterSphereId
          ),
        };
      },
      partialize: (state) => ({
        version: state.version,
        onboardingComplete: state.onboardingComplete,
        tourComplete: state.tourComplete,
        cycleStartDate: state.cycleStartDate,
        activeWeek: state.activeWeek,
        activeDay: state.activeDay,
        spheres: state.spheres,
        goals: state.goals,
        cycleTasks: state.cycleTasks,
        weeks: state.weeks,
        profile: state.profile,
        theme: state.theme,
        hiddenSphereIds: state.hiddenSphereIds,
        weekHiddenSphereIds: state.weekHiddenSphereIds,
        weekFilterSphereId: state.weekFilterSphereId,
        goalsFilterSphereId: state.goalsFilterSphereId,
        dayAssignments: state.dayAssignments,
        character: state.character,
        seasonFlame: state.seasonFlame,
      }),
    }
  )
);
