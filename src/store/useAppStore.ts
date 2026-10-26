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
import { assignGoalToDay, removeGoalFromWeekPlan } from "@/lib/day-plan";
import { hasUserProgress, repairAppState } from "@/lib/app-state-health";

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
    dayAssignments: {},
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
  addSphere: (sphere: Omit<Sphere, "id">) => void;
  deleteSphere: (id: string) => void;
  updateSphere: (id: string, patch: Partial<Omit<Sphere, "id">>) => void;
  toggleSphereVisibility: (sphereId: string) => void;
  addGoal: (goal: Omit<Goal, "id">) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  toggleGoalDone: (goalId: string) => void;
  addCycleTask: (task: Omit<CycleTask, "id" | "done">) => void;
  updateCycleTask: (
    taskId: string,
    patch: Partial<Pick<CycleTask, "title" | "goalId">>
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
  profile: AppState["profile"]
): { goals: Goal[]; profile: AppState["profile"]; levelUp: LevelUpEvent } {
  let levelUp: LevelUpEvent = null;
  let p = profile;
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
      if (res.levelUp) levelUp = res.levelUp;
      return { ...g, completed: true, done: g.type === "onetime" ? true : g.done };
    }
    return g;
  });
  return { goals: updated, profile: p, levelUp };
}

function recomputeWeekClosed(
  cycleTasks: CycleTask[],
  weeks: WeekData[]
): WeekData[] {
  return weeks.map((w) => {
    const weekTasks = cycleTasks.filter((t) => t.week === w.number);
    if (weekTasks.length === 0) return w;
    const allDone = weekTasks.every((t) => t.done);
    return { ...w, closed: allDone || w.closed };
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

          return {
            spheres:
              spheres.length > 0
                ? spheres
                : DEFAULT_SPHERES.map((s) => ({
                    ...s,
                    id: generateId(),
                  })).slice(0, 4),
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

      addSphere: (sphere) =>
        set((s) => ({
          spheres: [...s.spheres, { ...sphere, id: generateId(), custom: true }],
        })),

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
          return {
            spheres: s.spheres.filter((sp) => sp.id !== id),
            goals: s.goals.filter((g) => g.sphereId !== id),
            cycleTasks: s.cycleTasks.filter((t) => t.sphereId !== id),
            hiddenSphereIds: s.hiddenSphereIds.filter((sid) => sid !== id),
            dayAssignments,
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

          const checked = checkGoalCompletion(goals, profile);
          return {
            goals: checked.goals,
            profile: checked.profile,
            levelUpEvent: checked.levelUp ?? levelUp,
          };
        });
      },

      addCycleTask: (task) =>
        set((s) => {
          const goal = s.goals.find((g) => g.id === task.goalId);
          if (!goal) return s;
          const cycleTasks = [
            ...s.cycleTasks,
            {
              ...task,
              id: generateId(),
              sphereId: goal.sphereId,
              done: false,
            },
          ];
          return { cycleTasks, weeks: recomputeWeekClosed(cycleTasks, s.weeks) };
        }),

      updateCycleTask: (taskId, patch) =>
        set((s) => {
          const goal = patch.goalId
            ? s.goals.find((g) => g.id === patch.goalId)
            : undefined;
          const cycleTasks = s.cycleTasks.map((t) => {
            if (t.id !== taskId) return t;
            return {
              ...t,
              ...patch,
              sphereId: goal?.sphereId ?? t.sphereId,
            };
          });
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
          let levelUp: LevelUpEvent = null;
          if (nowDone) {
            const res = grantXp(profile, {
              baseAmount: XP_TASK,
              label: `Задача недели: ${prev.title}`,
              sourceId: xpSourceCycleTask(taskId),
              withStreak: true,
            });
            profile = res.profile;
            levelUp = res.levelUp;
          } else {
            profile = revokeXpBySource(profile, xpSourceCycleTask(taskId));
          }
          return {
            cycleTasks,
            profile,
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
          const checked = checkGoalCompletion(goals, s.profile);
          return {
            goals: checked.goals,
            profile: checked.profile,
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
          const checked = checkGoalCompletion(goals, profile);
          return {
            goals: checked.goals,
            profile: checked.profile,
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
          const checked = checkGoalCompletion(goals, profile);
          return {
            goals: checked.goals,
            profile: checked.profile,
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
          const checked = checkGoalCompletion(goals, s.profile);
          return {
            goals: checked.goals,
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
            levelUpEvent: levelUp,
            ...(shouldAdvance
              ? { activeWeek: week + 1, activeDay: 1 }
              : {}),
          };
        });
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
        const migrated = migrateAppState({ ...createInitialState(), ...data });
        const repaired = repairAppState(migrated);
        set({ ...repaired, levelUpEvent: null });
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
          dayAssignments: s.dayAssignments,
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
      migrate: (persisted, version) => {
        const state = persisted as AppState;
        if (version < DATA_VERSION) {
          return migrateAppState(state);
        }
        return migrateAppState(state);
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
        dayAssignments: state.dayAssignments,
      }),
    }
  )
);
